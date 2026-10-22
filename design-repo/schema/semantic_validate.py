#!/usr/bin/env python3
"""Semantic validator for PageSpec instances (Python 3.9+, needs jsonschema).

Everything JSON Schema cannot express lives here:
  * the declared template is cross-referenced against that template's REAL node list
    (templates/templates.json), not nodes[] in isolation;
  * route restrictions (a section's constraints.allowedRoutes) and route<->template binding;
  * section constraints from sections/*.json (onePerPage, mustBeFirst, mustPrecedeFooter,
    mustFollowFooter, mustFollowContent, requiredOverlays);
  * retrievalEligible: utility overlays (cookie banner, demo dialog) are pinned to false (PINNED_RETRIEVAL_INELIGIBLE),
    independent of the registry; an explicit true on such a node is rejected;
  * motion: pattern must be one the section allows, reducedMotionFallback must be the
    one the section requires;
  * per-instance maxWords on every text-bearing content field (walks the section's
    own content contract, so nested fields are covered);
  * the rhythm rules in compatibility/graph.json, each honouring its severity
    ("error" fails, "warn" is reported but does not fail) and its named exceptions.

Usage:  python3 schema/semantic_validate.py <pagespec.json> [more.json ...]
Exit code 0 = no errors (warnings allowed), 1 = errors, 2 = usage / load failure.

The repo root is derived from this file's location; nothing is hardcoded.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Utility overlays are never retrieval/RAG material (a consent banner and a booking dialog are
# interaction chrome, not page content). This pin is deliberately NOT read from the registry, the
# contracts or the allowlist: flipping any of those to "eligible" must not be able to weaken it.
# extraction/verify_all.py keeps its own copy and fails if the two differ.
PINNED_RETRIEVAL_INELIGIBLE = frozenset(["overlay.cookie-banner", "overlay.demo-dialog"])


def _load(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as fh:
        return json.load(fh)


def load_repo(repo=None):
    """Load templates, graph and every section contract."""
    root = repo or REPO
    def ld(rel):
        with open(os.path.join(root, rel), encoding="utf-8") as fh:
            return json.load(fh)
    sections = {}
    sdir = os.path.join(root, "sections")
    for fn in sorted(os.listdir(sdir)):
        if fn.endswith(".json"):
            doc = ld(os.path.join("sections", fn))
            sections[doc["id"]] = doc
    return {
        "templates": ld("templates/templates.json"),
        "graph": ld("compatibility/graph.json"),
        "sections": sections,
        "schema": ld("schema/pagespec.schema.json"),
        "root": root,
    }


# --------------------------------------------------------------------------- helpers
def count_words(text):
    """Whitespace tokens containing at least one alphanumeric character."""
    return len([t for t in text.split() if re.search(r"\w", t)])


def walk_maxwords(contract, value, path, out):
    """Compare value against a content contract node; append (path, words, max) overflows."""
    if not isinstance(contract, dict):
        return
    if "oneOf" in contract:
        # pick the branch whose const discriminator matches; fall back to all branches' union of checks
        for br in contract["oneOf"]:
            props = br.get("properties", {})
            disc_ok = True
            for k, sub in props.items():
                if isinstance(sub, dict) and "const" in sub and isinstance(value, dict):
                    if value.get(k) != sub["const"]:
                        disc_ok = False
            if disc_ok:
                walk_maxwords(br, value, path, out)
                return
        return
    typ = contract.get("type")
    if typ == "string" and isinstance(value, str):
        mw = contract.get("maxWords")
        if mw is not None:
            w = count_words(value)
            if w > mw:
                out.append((path, w, mw))
    elif typ == "object" and isinstance(value, dict):
        for k, sub in contract.get("properties", {}).items():
            if k in value:
                walk_maxwords(sub, value[k], f"{path}.{k}" if path else k, out)
    elif typ == "array" and isinstance(value, list):
        item = contract.get("items")
        for i, v in enumerate(value):
            walk_maxwords(item, v, f"{path}[{i}]", out)


def collect_strings(value, key_filter=None):
    """Yield every string leaf (with its key) in a nested value."""
    if isinstance(value, dict):
        for k, v in value.items():
            if isinstance(v, str):
                yield k, v
            else:
                for x in collect_strings(v, key_filter):
                    yield x
    elif isinstance(value, list):
        for v in value:
            for x in collect_strings(v, key_filter):
                yield x


# --------------------------------------------------------------------------- graph rules
# Each rule: fn(ctx) -> list of message strings. ctx has: types (list of node types),
# nodes, template (id), tdef (template dict), sections (contracts), spec.
def _is_overlay(t):
    return t.startswith("overlay.")


def r_hero_first(ctx):
    t = ctx["types"]
    if not t or t[0] != "hero.episode":
        return [f"first node is {t[0] if t else 'nothing'}; the home page must open with hero.episode (there is no navbar before it)"]
    return []


def r_no_hero_on_legal(ctx):
    return ["hero.episode must not appear on a legal page"] if "hero.episode" in ctx["types"] else []


def r_closing_before_footer(ctx):
    t = ctx["types"]
    if "closing.cta" not in t:
        return []
    i = t.index("closing.cta")
    if i + 1 >= len(t) or t[i + 1] != "chrome.footer":
        nxt = t[i + 1] if i + 1 < len(t) else "end of page"
        return [f"closing.cta must be the last content section, immediately before chrome.footer (found {nxt})"]
    return []


def r_one_per_page(ctx):
    msgs = []
    seen = {}
    for t in ctx["types"]:
        seen[t] = seen.get(t, 0) + 1
    for t, n in seen.items():
        sec = ctx["sections"].get(t)
        if sec and sec["constraints"].get("onePerPage") and n > 1:
            msgs.append(f"{t} appears {n} times but is onePerPage")
    return msgs


def r_footer_after_content(ctx):
    t = ctx["types"]
    if "chrome.footer" not in t:
        return []
    i = t.index("chrome.footer")
    later = [x for x in t[i + 1:] if not _is_overlay(x)]
    if later:
        return [f"content section(s) {later} follow chrome.footer; the footer closes the page body"]
    return []


def r_overlays_after_footer(ctx):
    t = ctx["types"]
    if "chrome.footer" not in t:
        return []
    i = t.index("chrome.footer")
    before = [x for x in t[:i] if _is_overlay(x)]
    return [f"overlay(s) {before} precede chrome.footer; App.jsx renders overlays after the footer"] if before else []


def r_overlay_order(ctx):
    t = ctx["types"]
    if "overlay.demo-dialog" in t and "overlay.cookie-banner" in t:
        if t.index("overlay.demo-dialog") > t.index("overlay.cookie-banner"):
            return ["overlay.cookie-banner precedes overlay.demo-dialog; App.jsx order is Footer, DemoDialog, CookieBanner"]
    return []


def r_legal_header_body(ctx):
    t = ctx["types"]
    if "legal.header" in t or "legal.body" in t:
        if not t or t[0] != "legal.header":
            return ["legal.header must be the first node of a legal page"]
        if len(t) < 2 or t[1] != "legal.body":
            return ["legal.body must immediately follow legal.header"]
    return []


def r_demo_cta_requires_dialog(ctx):
    has_cta = False
    for n in ctx["nodes"]:
        for k, v in collect_strings(n.get("content", {})):
            if k == "href" and v == "#demo":
                has_cta = True
    if has_cta and "overlay.demo-dialog" not in ctx["types"]:
        return ["a CTA links to #demo but overlay.demo-dialog is not on the page (dead link)"]
    return []


def r_cookies_requires_banner(ctx):
    if "chrome.footer" in ctx["types"] and "overlay.cookie-banner" not in ctx["types"]:
        return ["chrome.footer has a Cookies button that opens the preferences modal, but overlay.cookie-banner is not on the page"]
    return []


def eyebrow_duplicates(nodes):
    """Return {numeral: [section ids]} for every two-digit eyebrow numeral used by more than one node."""
    seen = {}
    for n in nodes:
        ey = n.get("content", {}).get("eyebrow")
        if isinstance(ey, str):
            m = re.match(r"^(\d{2})\s*·", ey)
            if m:
                seen.setdefault(m.group(1), []).append(n.get("type"))
    return dict((k, v) for k, v in seen.items() if len(v) > 1)


def r_eyebrow_unique(ctx):
    """A repeated numeral warns, unless it is a DELIBERATELY acknowledged duplicate recorded in the
    rule's own acknowledgedDuplicates (numeral + the exact set of sections, with evidence). Any other
    repeat, or an acknowledged numeral that spreads to a third section, still warns."""
    acked = [(a["numeral"], sorted(a["sections"])) for a in ctx.get("rule", {}).get("acknowledgedDuplicates", [])]
    msgs = []
    for num, owners in eyebrow_duplicates(ctx["nodes"]).items():
        if (num, sorted(owners)) in acked:
            continue
        msgs.append(f"eyebrow numeral {num} is used by {owners}; section numbers should be unique")
    return msgs


def r_section_route_allowed(ctx):
    msgs = []
    for t in ctx["types"]:
        sec = ctx["sections"].get(t)
        if sec and ctx["route"] not in sec["constraints"].get("allowedRoutes", []):
            msgs.append(f"{t} is not allowed on route {ctx['route']}")
    return msgs


RULES = {
    "HERO_FIRST_ON_HOME": r_hero_first,
    "NO_HERO_ON_LEGAL": r_no_hero_on_legal,
    "CLOSING_CTA_LAST_BEFORE_FOOTER": r_closing_before_footer,
    "ONE_PER_PAGE": r_one_per_page,
    "FOOTER_AFTER_CONTENT": r_footer_after_content,
    "OVERLAYS_AFTER_FOOTER": r_overlays_after_footer,
    "OVERLAY_ORDER": r_overlay_order,
    "LEGAL_HEADER_THEN_BODY": r_legal_header_body,
    "DEMO_CTA_REQUIRES_DIALOG": r_demo_cta_requires_dialog,
    "COOKIES_LINK_REQUIRES_BANNER": r_cookies_requires_banner,
    "EYEBROW_NUMBER_UNIQUE": r_eyebrow_unique,
    "SECTION_ROUTE_ALLOWED": r_section_route_allowed,
}


# --------------------------------------------------------------------------- main checks
def validate_semantic(spec, repo=None):
    """Return (errors, warnings) lists of strings."""
    R = repo or load_repo()
    errors, warnings = [], []
    templates = R["templates"]["templates"]
    sections = R["sections"]
    tid = spec.get("template")
    route = spec.get("route")
    nodes = spec.get("nodes", [])
    if not isinstance(nodes, list):
        return ["nodes is not a list"], warnings
    types = [n.get("type") for n in nodes if isinstance(n, dict)]

    if tid not in templates:
        return [f"unknown template {tid!r}"], warnings
    tdef = templates[tid]

    # route <-> template (1:1 map from templates.json)
    rmap = {r["path"]: r["template"] for r in R["templates"]["routes"]}
    if route not in rmap:
        errors.append(f"route {route!r} is not a real route")
    elif rmap[route] != tid:
        errors.append(f"route {route!r} is bound to template {rmap[route]!r}, but the spec declares {tid!r}")

    # declared template vs its REAL node list
    tnodes = [x["section"] for x in tdef["nodes"]]
    for x in tdef["nodes"]:
        if x.get("required") and x["section"] not in types:
            errors.append(f"template {tid} requires {x['section']} but the spec has no such node (mandatory section removed)")
    for t in types:
        if t not in tnodes:
            errors.append(f"node {t} is not part of template {tid} (template/node-sequence mismatch)")
    repeatable = {x["section"]: x.get("repeatable", False) for x in tdef["nodes"]}
    counts = {}
    for t in types:
        counts[t] = counts.get(t, 0) + 1
    for t, n in counts.items():
        if n > 1 and t in repeatable and not repeatable[t]:
            errors.append(f"{t} appears {n} times but template {tid} marks it non-repeatable")
    # order: the spec's node sequence must be a subsequence-consistent ordering of the template's
    pos = [tnodes.index(t) for t in types if t in tnodes]
    if pos != sorted(pos):
        errors.append(f"node order {types} does not follow template {tid} order {tnodes}")

    # per-section checks
    for i, n in enumerate(nodes):
        if not isinstance(n, dict):
            continue
        t = n.get("type")
        sec = sections.get(t)
        if sec is None:
            errors.append(f"node[{i}] type {t!r} has no section contract")
            continue
        cons = sec["constraints"]
        if route not in cons.get("allowedRoutes", []):
            errors.append(f"node[{i}] {t} is not allowed on route {route} (allowed: {cons.get('allowedRoutes')})")
        if cons.get("onePerPage") and counts.get(t, 0) > 1 and types.index(t) != i:
            pass  # reported once by ONE_PER_PAGE rule
        if cons.get("mustBeFirst") and i != 0:
            errors.append(f"node[{i}] {t} must be the first node")
        if cons.get("mustPrecedeFooter"):
            if i + 1 >= len(types) or types[i + 1] != "chrome.footer":
                errors.append(f"node[{i}] {t} must immediately precede chrome.footer")
        if cons.get("mustFollowFooter") and "chrome.footer" in types and i < types.index("chrome.footer"):
            errors.append(f"node[{i}] {t} must come after chrome.footer")
        if cons.get("mustFollowContent"):
            later = [x for x in types[i + 1:] if not x.startswith("overlay.")]
            if later:
                errors.append(f"node[{i}] {t} must follow all content sections (found {later} after it)")
        for ov in cons.get("requiredOverlays", []):
            if ov not in types:
                errors.append(f"node[{i}] {t} requires {ov} on the page")
        # retrieval eligibility: pinned utility overlays can never be eligible (absent == the pinned default, false)
        if t in PINNED_RETRIEVAL_INELIGIBLE:
            if n.get("retrievalEligible", False) is not False:
                errors.append(f"node[{i}] {t} retrievalEligible must be false: utility overlays are pinned as never retrieval-eligible")
            if sec.get("retrievalEligible") is not False:
                errors.append(f"node[{i}] {t} section contract says retrievalEligible {sec.get('retrievalEligible')!r} but it is PINNED to false")
        # motion
        m = n.get("motion")
        smot = sec["motion"]
        if not isinstance(m, dict):
            errors.append(f"node[{i}] {t} has no motion object")
        else:
            if "reducedMotionFallback" not in m:
                errors.append(f"node[{i}] {t} motion lacks reducedMotionFallback")
            elif m["reducedMotionFallback"] != smot["requiredReducedMotionFallback"]:
                errors.append(f"node[{i}] {t} reducedMotionFallback {m['reducedMotionFallback']!r} != required {smot['requiredReducedMotionFallback']!r}")
            if m.get("pattern") not in smot["allowedPatterns"]:
                errors.append(f"node[{i}] {t} motion.pattern {m.get('pattern')!r} not in {smot['allowedPatterns']}")
        # maxWords (walks the section's own contract)
        over = []
        walk_maxwords(sec["content"], n.get("content", {}), "", over)
        for path, w, mw in over:
            errors.append(f"node[{i}] {t} content.{path}: {w} words > maxWords {mw}")

    # document title budget
    dt = spec.get("documentTitle")
    if isinstance(dt, str):
        mw = R["schema"]["properties"]["documentTitle"].get("x-maxWords")
        if mw is not None and count_words(dt) > mw:
            errors.append(f"documentTitle: {count_words(dt)} words > maxWords {mw}")

    # graph rules
    ctx = {"types": types, "nodes": [n for n in nodes if isinstance(n, dict)], "template": tid, "tdef": tdef, "sections": sections, "spec": spec, "route": route}
    for rule in R["graph"]["rules"]:
        rid = rule["id"]
        fn = RULES.get(rid)
        if fn is None:
            errors.append(f"graph rule {rid} has no implementation in semantic_validate.py")
            continue
        scope = rule.get("appliesTo", "all")
        if scope != "all" and tid not in scope:
            continue
        if any(e["template"] == tid for e in rule.get("exceptions", [])):
            continue
        ctx["rule"] = rule
        for msg in fn(ctx):
            line = f"[{rid}] {msg}"
            (errors if rule["severity"] == "error" else warnings).append(line)
    return errors, warnings


def validate_schema(spec, repo=None):
    """Draft-07 validation against schema/pagespec.schema.json. Returns list of messages."""
    from jsonschema import Draft7Validator
    R = repo or load_repo()
    v = Draft7Validator(R["schema"])
    out = []
    for e in sorted(v.iter_errors(spec), key=lambda e: list(map(str, e.absolute_path))):
        loc = "/".join(str(p) for p in e.absolute_path) or "(root)"
        out.append(f"{loc}: {e.message[:200]}")
    return out


def validate_all(spec, repo=None):
    R = repo or load_repo()
    schema_errs = validate_schema(spec, R)
    if schema_errs:
        # semantic checks assume a structurally sane instance; still run them defensively
        try:
            sem_errs, warns = validate_semantic(spec, R)
        except Exception as exc:  # malformed instance
            sem_errs, warns = [f"semantic layer could not run: {exc!r}"], []
    else:
        sem_errs, warns = validate_semantic(spec, R)
    return schema_errs, sem_errs, warns


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    rc = 0
    R = load_repo()
    for path in argv[1:]:
        with open(path, encoding="utf-8") as fh:
            spec = json.load(fh)
        se, me, wa = validate_all(spec, R)
        print(f"{path}: schema errors={len(se)} semantic errors={len(me)} warnings={len(wa)}")
        for m in se:
            print("  SCHEMA  ", m)
        for m in me:
            print("  SEMANTIC", m)
        for m in wa:
            print("  WARN    ", m)
        if se or me:
            rc = 1
    return rc


if __name__ == "__main__":
    sys.exit(main(sys.argv))
