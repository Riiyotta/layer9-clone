#!/usr/bin/env python3
"""verify_all.py: one-shot verification of this design-repo (Python 3.9+, needs jsonschema).

Checks, in order (each prints PASS / FAIL / WARN / SKIP; any FAIL exits 1):
  A  schema   Draft-07 validation + semantic validation of every schema/example*.pagespec.json
  B  parity   allowlist ids <-> primitives/, components/, sections/ contract files (both ways);
              allowlist node/motion/asset properties <-> schema
  C  version  manifest.allowlistVersion == allowlist file's own allowlistVersion
  D  cite     every path:line[-line] citation in the repo resolves inside the real file, AND the
              ledger's expected text is found in the cited range (in-range-but-wrong is caught);
              every citation must have a ledger entry. Skipped with WARN when no sibling
              source tree exists (pass --source DIR to point at one).
  E  counts   manifest.counts, README and CHANGELOG counts recomputed from the files
  F  routes   route -> template map is 1:1; schema route enum; route admission (only if claimed)
  G  words    maxWords on the examples recomputed independently
  H  entry    manifest.entryPoints only list files INSIDE this folder, and they exist
  I  paths    no absolute machine path anywhere in the repo
  J  assets   asset roles: closed enum parity, generationPolicy membership AND pinned values
  K  tokens   token-policy categories resolve against the catalog keys; catalog recomputed from
              the token files; semantic / component / theme refs resolve
  L  pin      framer-motion and motion-dom stay pinned to 12.42.2 (token record always; the
              source package.json when the sibling tree exists)
  M  claims   every script/file named in a docstring, comment or doc exists in this folder
  N  misc     graph rule ids == validator RULES; section/component cross references; schema
              x-maxWords == section maxWords; evidence levels
  O  contract every section contract validates against schema/section-contract.schema.json;
              source (provenance) and semantic (taxonomy) are separate, consistent and closed;
              retrievalEligible is compared against a PIN kept in this file (utility overlays
              are never eligible), independent of the registry, contracts and allowlist
  P  height   whole-page-wrapper gate on the heights recorded in extraction/measured-values.json
              (sectionHeights, measured by extraction/measure_sections.mjs at 1440px): a
              HERO-category section above 1800px warns, above 3000px fails unless in the reviewed
              extraction/quality-gate.json whitelist; one section holding over half a page warns
  Q  eyebrow  an acknowledged duplicate section numeral (graph rule EYEBROW_NUMBER_UNIQUE) must be
              live, evidenced and exact; any other repeated numeral in an example is flagged

The drift-proof harness is extraction/prove_drift.py (it injects bad data into a scratch copy
and confirms this script fails each time).
Usage: python3 extraction/verify_all.py [--source DIR] [--repo DIR]
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_REPO = os.path.dirname(HERE)

PIN_VERSION = "12.42.2"
# Roles that carry compliance / legal / licensing weight are pinned to ONE specific policy,
# not merely "some member of the closed enum".
PINNED_POLICIES = {
    "form-submit-endpoint": "must-not-reuse-live-endpoint",
    "vendor-logo-tile": "must-not-fabricate",
    "map-basemap-tile": "must-reuse-exact",
    "legal-copy": "must-not-fabricate",
    "brand-wordmark": "must-reuse-exact",
    "brand-chip-mark": "must-reuse-exact",
}
# Utility overlays are never retrieval-eligible. Deliberately NOT read from the registry, the section
# contracts or the allowlist, so flipping any of those cannot weaken it (semantic_validate.py keeps its
# own copy; check O fails if the two differ).
PINNED_RETRIEVAL_INELIGIBLE = frozenset(["overlay.cookie-banner", "overlay.demo-dialog"])
# Whole-page-wrapper gate thresholds (px, measured at 1440px). Constants, not data: the whitelist file
# can excuse a section, never move these.
HERO_WARN_PX = 1800
HERO_FAIL_PX = 3000
MAJORITY_SHARE = 0.5
GATE_VIEWPORT_WIDTH = 1440
CIT_RE = re.compile(r"^([A-Za-z0-9_./\- ]+\.(?:js|jsx|css|json|md|txt|html)):(\d+)(?:-(\d+))?$")
TEXT_EXT = (".json", ".md", ".py", ".sh", ".txt", ".csv", ".js", ".css", ".html")


class Ctx(object):
    def __init__(self, repo, source):
        self.repo = repo
        self.source = source
        self.results = []

    def add(self, status, code, msg):
        self.results.append((status, code, msg))

    def p(self, rel):
        return os.path.join(self.repo, rel)


def jload(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def iter_files(repo):
    for dp, dn, fn in os.walk(repo):
        dn[:] = [d for d in dn if d not in ("__pycache__", ".git", "node_modules")]
        for f in fn:
            if f.endswith(".pyc") or f == ".DS_Store":
                continue
            yield os.path.join(dp, f)


def leaves(prefix, node, out):
    if isinstance(node, dict):
        if "value" in node or "ref" in node:
            out[prefix] = node
            return
        for k, v in node.items():
            if k.startswith("$"):
                continue
            leaves(prefix + "." + k if prefix else k, v, out)


def load_foundation(repo):
    """Return dict of full token path -> leaf, plus category map."""
    flat, cats = {}, {}
    d = os.path.join(repo, "tokens", "00-foundation")
    for fn in sorted(os.listdir(d)):
        if not fn.endswith(".json"):
            continue
        doc = jload(os.path.join(d, fn))
        for top, body in doc.items():
            if top.startswith("$"):
                continue
            if top == "typography":
                for sub, sbody in body.items():
                    out = {}
                    leaves("typography." + sub, sbody, out)
                    cats[sub] = ("tokens/00-foundation/%s#typography.%s" % (fn, sub), list(out))
                    flat.update(out)
            else:
                out = {}
                leaves(top, body, out)
                cats[top] = ("tokens/00-foundation/%s#%s" % (fn, top), list(out))
                flat.update(out)
    lay = jload(os.path.join(repo, "tokens", "30-layout", "layout.json"))
    out = {}
    leaves("layout", lay["layout"], out)
    cats["layout"] = ("tokens/30-layout/layout.json#layout", list(out))
    flat.update(out)
    return flat, cats


def compute_counts(repo):
    flat, cats = load_foundation(repo)
    foundation = len([k for k in flat if not k.startswith("layout.")])
    layout = len([k for k in flat if k.startswith("layout.")])
    sem = 0
    for fn in os.listdir(os.path.join(repo, "tokens", "10-semantic")):
        doc = jload(os.path.join(repo, "tokens", "10-semantic", fn))
        for top, body in doc.items():
            if top.startswith("$"):
                continue
            out = {}
            leaves(top, body, out)
            sem += len(out)
    comp = 0
    for fn in os.listdir(os.path.join(repo, "tokens", "20-component")):
        doc = jload(os.path.join(repo, "tokens", "20-component", fn))
        for top, body in doc.items():
            if top.startswith("$"):
                continue
            comp += len(body)
    def n(sub):
        return len([f for f in os.listdir(os.path.join(repo, sub)) if f.endswith(".json")])
    tmpl = jload(os.path.join(repo, "templates", "templates.json"))
    roles = jload(os.path.join(repo, "assets", "asset-roles.json"))
    allow = jload(os.path.join(repo, "tokens", "llm", "component-allowlist.json"))
    graph = jload(os.path.join(repo, "compatibility", "graph.json"))
    counts = {
        "foundationTokens": foundation,
        "layoutTokens": layout,
        "semanticRoles": sem,
        "componentTokens": comp,
        "tokens": foundation + layout + sem + comp,
        "tokenCategories": len(cats),
        "primitives": n("primitives"),
        "components": n("components"),
        "sections": n("sections"),
        "templates": len(tmpl["templates"]),
        "routes": len(tmpl["routes"]),
        "assetRoles": len(roles["roles"]),
        "allowlistEntries": len(allow["primitives"]) + len(allow["components"]) + len(allow["sections"]),
        "graphRules": len(graph["rules"]),
        "themes": len(os.listdir(os.path.join(repo, "tokens", "themes"))),
    }
    return counts


# ----------------------------------------------------------------------------- pinned asset roles
def check_asset_role_pins(doc):
    """Return a list of error strings. Membership in the closed enum is NOT enough for pinned roles."""
    errs = []
    enum = doc.get("generationPolicyEnum", [])
    for rid, role in doc.get("roles", {}).items():
        pol = role.get("generationPolicy")
        if pol not in enum:
            errs.append("role %s: generationPolicy %r is not in the closed enum %s" % (rid, pol, enum))
    for rid, want in PINNED_POLICIES.items():
        role = doc.get("roles", {}).get(rid)
        if role is None:
            errs.append("pinned role %s is missing" % rid)
            continue
        if role.get("generationPolicy") != want:
            errs.append("role %s: generationPolicy %r but it is PINNED to %r" % (rid, role.get("generationPolicy"), want))
        if doc.get("pinnedPolicies", {}).get(rid) != want:
            errs.append("asset-roles.json pinnedPolicies[%s] is %r, expected %r" % (rid, doc.get("pinnedPolicies", {}).get(rid), want))
    return errs


# ----------------------------------------------------------------------------- citations
def collect_citations(repo):
    """Yield (file_rel, citation) for every string that is a full path:line[-line] citation."""
    out = []

    def walk(rel, node):
        if isinstance(node, str):
            if CIT_RE.match(node):
                out.append((rel, node))
        elif isinstance(node, list):
            for x in node:
                walk(rel, x)
        elif isinstance(node, dict):
            for v in node.values():
                walk(rel, v)
    for f in iter_files(repo):
        if f.endswith(".json"):
            rel = os.path.relpath(f, repo)
            try:
                walk(rel, jload(f))
            except ValueError:
                pass
    return out


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


# ----------------------------------------------------------------------------- checks
def check_a_schema(c):
    sys.path.insert(0, c.p("schema"))
    import importlib
    sv = importlib.import_module("semantic_validate")
    R = sv.load_repo(c.repo)
    from jsonschema import Draft7Validator
    try:
        Draft7Validator.check_schema(R["schema"])
        c.add("PASS", "A", "pagespec.schema.json is itself a valid Draft-07 schema")
    except Exception as exc:
        c.add("FAIL", "A", "pagespec.schema.json is not a valid Draft-07 schema: %s" % str(exc)[:160])
    exs = sorted(f for f in os.listdir(c.p("schema")) if f.startswith("example") and f.endswith(".pagespec.json"))
    if not exs:
        c.add("FAIL", "A", "no schema/example*.pagespec.json found")
        return
    for f in exs:
        spec = jload(c.p("schema/" + f))
        se, me, wa = sv.validate_all(spec, R)
        if se or me:
            c.add("FAIL", "A", "%s: %d schema error(s), %d semantic error(s): %s" % (f, len(se), len(me), (se + me)[:3]))
        else:
            c.add("PASS", "A", "%s: Draft-07 0 errors, semantic 0 errors, %d warning(s)" % (f, len(wa)))
            for w in wa:
                c.add("WARN", "A", "%s: %s" % (f, w))


def check_b_parity(c):
    allow = jload(c.p("tokens/llm/component-allowlist.json"))
    ok = True
    for group, folder in (("primitives", "primitives"), ("components", "components"), ("sections", "sections")):
        files = {}
        for fn in os.listdir(c.p(folder)):
            if fn.endswith(".json"):
                files[jload(c.p(folder + "/" + fn))["id"]] = fn
        listed = set(allow[group])
        for i in sorted(listed - set(files)):
            c.add("FAIL", "B", "allowlist.%s lists %r but %s/ has no contract file with that id (phantom entry)" % (group, i, folder))
            ok = False
        for i in sorted(set(files) - listed):
            c.add("FAIL", "B", "%s/%s exists but allowlist.%s does not list %r (orphan)" % (folder, files[i], group, i))
            ok = False
        if len(allow[group]) != len(listed):
            c.add("FAIL", "B", "allowlist.%s has duplicate ids" % group)
            ok = False
    schema = jload(c.p("schema/pagespec.schema.json"))
    node = schema["definitions"]["node"]["properties"]
    if sorted(allow["nodeProperties"]) != sorted(node):
        c.add("FAIL", "B", "allowlist.nodeProperties %s != schema node properties %s" % (allow["nodeProperties"], sorted(node)))
        ok = False
    mot = schema["definitions"]["motion"]["properties"]
    if sorted(allow["motionProperties"]) != sorted(mot):
        c.add("FAIL", "B", "allowlist.motionProperties %s != schema motion properties %s" % (allow["motionProperties"], sorted(mot)))
        ok = False
    if sorted(allow["pageProperties"]) != sorted(schema["properties"]):
        c.add("FAIL", "B", "allowlist.pageProperties != schema root properties")
        ok = False
    if sorted(node["type"]["enum"]) != sorted(allow["sections"]):
        c.add("FAIL", "B", "schema node.type enum != allowlist.sections")
        ok = False
    if ok:
        c.add("PASS", "B", "allowlist parity: %d primitives, %d components, %d sections; node/motion/page properties match the schema" % (len(allow["primitives"]), len(allow["components"]), len(allow["sections"])))


def check_c_version(c):
    man = jload(c.p("registry.manifest.json"))
    allow = jload(c.p("tokens/llm/component-allowlist.json"))
    if man.get("allowlistVersion") != allow.get("allowlistVersion"):
        c.add("FAIL", "C", "manifest.allowlistVersion %r != allowlist.allowlistVersion %r" % (man.get("allowlistVersion"), allow.get("allowlistVersion")))
    else:
        c.add("PASS", "C", "allowlistVersion %s matches in manifest and allowlist (machine-checked field)" % allow["allowlistVersion"])
    note = man.get("versionFieldNote", "")
    if "allowlistVersion" not in note or "documentation" not in note.lower():
        c.add("FAIL", "C", "manifest.versionFieldNote must say which version fields are machine-checked vs documentation-only")
    else:
        c.add("PASS", "C", "versionFieldNote present")


def check_d_citations(c):
    cits = collect_citations(c.repo)
    ledger = jload(c.p("extraction/measured-values.json"))
    lmap = {}
    for e in ledger["citations"]:
        lmap.setdefault(e["citation"], []).append(e)
    bad = 0
    uncited = sorted(set(ci for _, ci in cits if ci not in lmap))
    for ci in uncited[:10]:
        c.add("FAIL", "D", "citation %s is used but has no ledger entry in extraction/measured-values.json" % ci)
        bad += 1
    if len(uncited) > 10:
        c.add("FAIL", "D", "... and %d more uncited citations" % (len(uncited) - 10))
        bad += len(uncited) - 10
    if not c.source:
        c.add("WARN", "D", "no sibling source tree (src/, CLONE_SPEC.md) found: citation range and content checks SKIPPED for %d distinct citations" % len(set(ci for _, ci in cits)))
        if not bad:
            c.add("PASS", "D", "ledger completeness only: every citation has a ledger entry")
        return
    cache = {}

    def lines_of(rel):
        if rel not in cache:
            fp = os.path.join(c.source, rel)
            if not os.path.isfile(fp):
                cache[rel] = None
            else:
                with open(fp, encoding="utf-8", errors="replace") as fh:
                    cache[rel] = fh.read().split("\n")
                    if cache[rel] and cache[rel][-1] == "":
                        cache[rel].pop()
        return cache[rel]
    checked = set()
    for where, ci in cits:
        if ci in checked:
            continue
        checked.add(ci)
        m = CIT_RE.match(ci)
        rel, a, b = m.group(1), int(m.group(2)), int(m.group(3) or m.group(2))
        L = lines_of(rel)
        if L is None:
            c.add("FAIL", "D", "%s (in %s): file %s does not exist in the source tree" % (ci, where, rel))
            bad += 1
            continue
        if a < 1 or b < a or b > len(L):
            c.add("FAIL", "D", "%s (in %s): range exceeds the file's real length (%d lines)" % (ci, where, len(L)))
            bad += 1
            continue
        for e in lmap.get(ci, []):
            seg = norm(" ".join(L[a - 1:b]))
            if norm(e["expect"]) not in seg:
                c.add("FAIL", "D", "%s: in range but WRONG content; ledger expects %r" % (ci, e["expect"][:60]))
                bad += 1
                break
    # ledger entries themselves must also resolve (covers ledger-only citations)
    for ci in lmap:
        if ci in checked:
            continue
        m = CIT_RE.match(ci)
        if not m:
            c.add("FAIL", "D", "ledger citation %r is malformed" % ci)
            bad += 1
            continue
        rel, a, b = m.group(1), int(m.group(2)), int(m.group(3) or m.group(2))
        L = lines_of(rel)
        if L is None or a < 1 or b < a or b > len(L):
            c.add("FAIL", "D", "ledger citation %s is out of range / missing file" % ci)
            bad += 1
            continue
        seg = norm(" ".join(L[a - 1:b]))
        for e in lmap[ci]:
            if norm(e["expect"]) not in seg:
                c.add("FAIL", "D", "ledger citation %s: in range but WRONG content (%r)" % (ci, e["expect"][:60]))
                bad += 1
                break
    if not bad:
        c.add("PASS", "D", "%d distinct citations (+%d ledger-only) resolve in range and their expected text is present" % (len(checked), len(set(lmap) - checked)))


def readme_counts(text):
    m = re.search(r"<!-- counts: (\{.*?\}) -->", text)
    return json.loads(m.group(1)) if m else None


def check_e_counts(c):
    man = jload(c.p("registry.manifest.json"))
    real = compute_counts(c.repo)
    claimed = man.get("counts", {})
    bad = 0
    for k, v in real.items():
        if claimed.get(k) != v:
            c.add("FAIL", "E", "manifest.counts[%s] = %r but recomputed from files = %r" % (k, claimed.get(k), v))
            bad += 1
    for k in claimed:
        if k not in real:
            c.add("FAIL", "E", "manifest.counts has unknown key %s" % k)
            bad += 1
    for doc in ("README.md", "CHANGELOG.md"):
        with open(c.p(doc), encoding="utf-8") as fh:
            rc = readme_counts(fh.read())
        if rc is None:
            c.add("FAIL", "E", "%s has no machine-readable <!-- counts: {...} --> marker" % doc)
            bad += 1
        elif rc != real:
            diff = dict((k, (rc.get(k), real.get(k))) for k in real if rc.get(k) != real.get(k))
            c.add("FAIL", "E", "%s counts marker is stale: %s" % (doc, diff))
            bad += 1
    if not bad:
        c.add("PASS", "E", "manifest, README and CHANGELOG counts equal the recomputed counts: %s" % json.dumps(real, sort_keys=True))


def check_f_routes(c):
    t = jload(c.p("templates/templates.json"))
    routes = t["routes"]
    paths = [r["path"] for r in routes]
    bad = 0
    if len(paths) != len(set(paths)):
        c.add("FAIL", "F", "a route is assigned more than once")
        bad += 1
    for r in routes:
        if r["template"] not in t["templates"]:
            c.add("FAIL", "F", "route %s maps to unknown template %s" % (r["path"], r["template"]))
            bad += 1
    for tid, td in t["templates"].items():
        mapped = sorted(r["path"] for r in routes if r["template"] == tid)
        if sorted(td["routes"]) != mapped:
            c.add("FAIL", "F", "template %s routes %s != routes mapped to it %s" % (tid, td["routes"], mapped))
            bad += 1
        if not mapped:
            c.add("FAIL", "F", "template %s has no route" % tid)
            bad += 1
        secs = [n["section"] for n in td["nodes"]]
        if len(secs) != len(set(secs)):
            c.add("FAIL", "F", "template %s lists a section twice" % tid)
            bad += 1
        if td.get("evidenceLevel") not in ("measured", "derived"):
            c.add("FAIL", "F", "template %s lacks evidenceLevel measured|derived" % tid)
            bad += 1
        for n in td["nodes"]:
            if set(n) != {"section", "required", "repeatable"}:
                c.add("FAIL", "F", "template %s node %r is not a {section, required, repeatable} object" % (tid, n))
                bad += 1
    schema = jload(c.p("schema/pagespec.schema.json"))
    if sorted(schema["properties"]["route"]["enum"]) != sorted(paths):
        c.add("FAIL", "F", "schema route enum != templates.json routes")
        bad += 1
    if sorted(schema["properties"]["template"]["enum"]) != sorted(t["templates"]):
        c.add("FAIL", "F", "schema template enum != templates.json templates")
        bad += 1
    # evidence honesty: a derived template's exclusive sections must be derived
    secs = {}
    for fn in os.listdir(c.p("sections")):
        d = jload(c.p("sections/" + fn))
        secs[d["id"]] = d
    for tid, td in t["templates"].items():
        for n in td["nodes"]:
            s = n["section"]
            if s not in secs:
                c.add("FAIL", "F", "template %s references %s with no contract" % (tid, s))
                bad += 1
            elif td["evidenceLevel"] == "derived" and s.startswith("legal.") and secs[s]["evidence"] != "derived":
                c.add("FAIL", "F", "section %s is used only by a derived template but is not marked derived" % s)
                bad += 1
    # route source cross-check
    if c.source and os.path.isfile(os.path.join(c.source, "src/lib/routes.js")):
        with open(os.path.join(c.source, "src/lib/routes.js"), encoding="utf-8") as fh:
            src_routes = re.findall(r"_PATH = '([^']+)'", fh.read())
        for r in src_routes:
            if r not in paths:
                c.add("FAIL", "F", "source route %s is not mapped to a template" % r)
                bad += 1
        c.add("PASS", "F", "source routes %s are all mapped" % src_routes) if not bad else None
    else:
        c.add("WARN", "F", "no sibling source: route table not cross-checked against src/lib/routes.js")
    man = jload(c.p("registry.manifest.json"))
    if "routeAdmission" in man or "retrievalEligible" in json.dumps(man):
        c.add("FAIL", "F", "manifest claims route admission/eligibility but no checker exists for it")
        bad += 1
    else:
        c.add("SKIP", "F", "manifest makes no route-admission/eligibility claim (nothing to reconcile)")
    if not bad:
        c.add("PASS", "F", "%d routes <-> %d templates is 1:1 with no gaps or double assignment" % (len(paths), len(t["templates"])))


def check_g_words(c):
    sys.path.insert(0, c.p("schema"))
    import importlib
    sv = importlib.import_module("semantic_validate")
    R = sv.load_repo(c.repo)
    total = 0
    bad = 0
    for f in sorted(os.listdir(c.p("schema"))):
        if not (f.startswith("example") and f.endswith(".pagespec.json")):
            continue
        spec = jload(c.p("schema/" + f))
        for i, n in enumerate(spec["nodes"]):
            over = []
            sv.walk_maxwords(R["sections"][n["type"]]["content"], n["content"], "", over)
            for path, w, mw in over:
                c.add("FAIL", "G", "%s node[%d] %s content.%s: %d > %d" % (f, i, n["type"], path, w, mw))
                bad += 1
            total += 1
    if not bad:
        c.add("PASS", "G", "maxWords respected on %d example nodes" % total)


def check_h_entry(c):
    man = jload(c.p("registry.manifest.json"))
    bad = 0
    eps = man.get("entryPoints", [])
    if not eps:
        c.add("FAIL", "H", "manifest.entryPoints is empty")
        return
    for e in eps:
        if ".." in e.replace("\\", "/").split("/") or e.startswith("/") or ":" in e or "\\" in e:
            c.add("FAIL", "H", "entryPoint %r points outside design-repo/" % e)
            bad += 1
        elif not os.path.isfile(c.p(e)):
            c.add("FAIL", "H", "entryPoint %r does not exist inside design-repo/" % e)
            bad += 1
    sp = man.get("sourceProject", {})

    def strings(n):
        if isinstance(n, str):
            yield n
        elif isinstance(n, list):
            for x in n:
                for y in strings(x):
                    yield y
        elif isinstance(n, dict):
            for k, v in n.items():
                if k == "routes":      # URL paths of the site, not file paths
                    continue
                for y in strings(v):
                    yield y
    for sv_ in strings(sp):
        if sv_.startswith("/") or ":\\" in sv_ or "../" in sv_ or sv_.startswith("~"):
            c.add("FAIL", "H", "manifest.sourceProject contains an absolute or relative-up path: %r" % sv_[:60])
            bad += 1
    if not bad:
        c.add("PASS", "H", "%d entryPoints, all inside design-repo/ and present; sourceProject has no path" % len(eps))


def check_i_paths(c):
    needle = "/Use" + "rs/"
    needle2 = "\\Use" + "rs\\"
    bad = 0
    n = 0
    for f in iter_files(c.repo):
        n += 1
        try:
            with open(f, encoding="utf-8") as fh:
                txt = fh.read()
        except (UnicodeDecodeError, OSError):
            continue
        if needle in txt or needle2 in txt:
            c.add("FAIL", "I", "absolute machine path found in %s" % os.path.relpath(f, c.repo))
            bad += 1
    if not bad:
        c.add("PASS", "I", "no absolute machine path in any of %d files" % n)


def check_j_assets(c):
    doc = jload(c.p("assets/asset-roles.json"))
    errs = check_asset_role_pins(doc)
    for e in errs:
        c.add("FAIL", "J", e)
    schema = jload(c.p("schema/pagespec.schema.json"))
    allow = jload(c.p("tokens/llm/component-allowlist.json"))
    enum = schema["definitions"]["assetRole"]["enum"]
    if sorted(enum) != sorted(doc["roles"]):
        c.add("FAIL", "J", "schema assetRole enum %s != asset-roles.json roles %s" % (sorted(enum), sorted(doc["roles"])))
        errs.append("x")
    if sorted(allow["assetRoles"]) != sorted(doc["roles"]):
        c.add("FAIL", "J", "allowlist.assetRoles != asset-roles.json roles")
        errs.append("x")
    # every role used in an example or contract is a real role; each role has licensing + forbidden text
    for rid, role in doc["roles"].items():
        if not role.get("licensing") or not role.get("forbidden"):
            c.add("FAIL", "J", "role %s lacks licensing guidance or a forbidden list" % rid)
            errs.append("x")
    prohib = " ".join(doc.get("globalProhibitions", [])).lower()
    for must in ("logos", "photos", "copy", "typefaces"):
        if must not in prohib:
            c.add("FAIL", "J", "globalProhibitions does not mention %s" % must)
            errs.append("x")
    for fn in os.listdir(c.p("sections")):
        d = jload(c.p("sections/" + fn))
        for r in d.get("assetRoles", []):
            if r not in doc["roles"]:
                c.add("FAIL", "J", "section %s lists unknown assetRole %s" % (d["id"], r))
                errs.append("x")
    if not errs:
        c.add("PASS", "J", "%d roles: enum parity with schema + allowlist; %d roles pinned to exact policy values; every policy in the closed enum" % (len(doc["roles"]), len(PINNED_POLICIES)))


def check_k_tokens(c):
    flat, cats = load_foundation(c.repo)
    cat = jload(c.p("tokens/llm/token-catalog.json"))
    pol = jload(c.p("tokens/llm/token-policy.json"))
    bad = 0
    for name in pol["rawValueRestrictions"]:
        if name not in cat["categories"]:
            c.add("FAIL", "K", "token-policy category %r does not exist in token-catalog categories %s" % (name, sorted(cat["categories"])))
            bad += 1
    for name, (src, paths) in cats.items():
        got = cat["categories"].get(name)
        if got is None:
            c.add("FAIL", "K", "catalog lacks category %s present in the token files" % name)
            bad += 1
        elif got["tokenPaths"] != paths or got["source"] != src:
            c.add("FAIL", "K", "catalog category %s drifted from the token files" % name)
            bad += 1
    for name in cat["categories"]:
        if name not in cats:
            c.add("FAIL", "K", "catalog has category %s with no token source" % name)
            bad += 1
    # semantic refs and theme
    theme = jload(c.p("tokens/themes/dark.json"))
    for fn in sorted(os.listdir(c.p("tokens/10-semantic"))):
        doc = jload(c.p("tokens/10-semantic/" + fn))
        for top, body in doc.items():
            if top.startswith("$"):
                continue
            for role, node in body.items():
                ref = node["ref"]
                if ref not in flat:
                    c.add("FAIL", "K", "semantic %s.%s refs unknown token %s" % (top, role, ref))
                    bad += 1
                    continue
                key = "%s.%s" % (top, role)
                tv = theme["resolved"].get(key)
                if tv is None or tv["ref"] != ref or tv["value"] != flat[ref]["value"]:
                    c.add("FAIL", "K", "theme dark.json does not resolve %s to the foundation value of %s" % (key, ref))
                    bad += 1
    if len(theme["resolved"]) != compute_counts(c.repo)["semanticRoles"]:
        c.add("FAIL", "K", "theme resolved roles count != semantic roles")
        bad += 1
    comp_doc = {}
    for fn in sorted(os.listdir(c.p("tokens/20-component"))):
        doc = jload(c.p("tokens/20-component/" + fn))
        for top, body in doc.items():
            if top.startswith("$"):
                continue
            comp_doc[top] = body
            for k, leaf in body.items():
                if "ref" in leaf:
                    if leaf["ref"] not in flat:
                        c.add("FAIL", "K", "component token %s.%s refs unknown %s" % (top, k, leaf["ref"]))
                        bad += 1
                    elif flat[leaf["ref"]]["value"] != leaf["value"]:
                        c.add("FAIL", "K", "component token %s.%s value differs from its ref %s" % (top, k, leaf["ref"]))
                        bad += 1
    for folder in ("primitives", "components"):
        for fn in sorted(os.listdir(c.p(folder))):
            d = jload(c.p(folder + "/" + fn))
            for t in d.get("tokensUsed", []):
                if t.startswith("component."):
                    _, f, key = t.split(".", 2)
                    if f not in comp_doc or key not in comp_doc[f]:
                        c.add("FAIL", "K", "%s/%s tokensUsed %s does not resolve" % (folder, fn, t))
                        bad += 1
                elif t not in flat:
                    c.add("FAIL", "K", "%s/%s tokensUsed %s does not resolve" % (folder, fn, t))
                    bad += 1
    for folder in ("sections", "components", "primitives"):
        for fn in sorted(os.listdir(c.p(folder))):
            d = jload(c.p(folder + "/" + fn))
            for r in d.get("responsive", []) if isinstance(d.get("responsive"), list) else []:
                bp = r.get("breakpoint")
                if bp != "fluid" and bp not in flat:
                    c.add("FAIL", "K", "%s/%s responsive breakpoint %r is neither 'fluid' nor a breakpoint token" % (folder, fn, bp))
                    bad += 1
    for fn in sorted(os.listdir(c.p("sections"))):
        d = jload(c.p("sections/" + fn))
        for t in d["motion"].get("tokens", []):
            if t not in flat:
                c.add("FAIL", "K", "sections/%s motion token %s does not resolve" % (fn, t))
                bad += 1
        for k in ("components", "primitives"):
            for ref in d.get(k, []):
                if not os.path.isfile(c.p("%s/%s.json" % (k, ref))):
                    c.add("FAIL", "K", "sections/%s references missing %s/%s" % (fn, k, ref))
                    bad += 1
    if not bad:
        c.add("PASS", "K", "policy categories %s resolve against catalog keys; catalog equals the token files; all semantic/theme/component/primitive/motion token refs resolve" % sorted(pol["rawValueRestrictions"]))


def check_l_pin(c):
    flat, _ = load_foundation(c.repo)
    leaf = flat.get("motion.library.framer-motion-pin")
    if not leaf or leaf["value"].get("framer-motion") != PIN_VERSION or leaf["value"].get("motion-dom") != PIN_VERSION:
        c.add("FAIL", "L", "motion token record of the framer-motion / motion-dom pin is missing or not %s" % PIN_VERSION)
        return
    c.add("PASS", "L", "motion token records framer-motion and motion-dom pinned to %s" % PIN_VERSION)
    pj = os.path.join(c.source, "package.json") if c.source else None
    if not pj or not os.path.isfile(pj):
        c.add("WARN", "L", "no sibling package.json: source pin check SKIPPED (token record still checked)")
        return
    pkg = jload(pj)
    fm = pkg.get("dependencies", {}).get("framer-motion")
    md = pkg.get("overrides", {}).get("motion-dom")
    if fm != PIN_VERSION or md != PIN_VERSION:
        c.add("FAIL", "L", "package.json no longer pins framer-motion (%r) and overrides.motion-dom (%r) to exactly %s" % (fm, md, PIN_VERSION))
    else:
        c.add("PASS", "L", "package.json pins framer-motion %s and overrides motion-dom %s" % (fm, md))


def check_m_claims(c):
    pat = re.compile(r"(?<![\w/.-])((?:extraction|schema|scripts|tokens|templates|compatibility|assets|docs|sections|primitives|components)(?:/[\w.\-]+)+\.(?:py|sh|json|md))")
    bad = 0
    seen = 0
    for f in iter_files(c.repo):
        if not f.endswith((".py", ".md", ".sh")):
            continue
        with open(f, encoding="utf-8") as fh:
            txt = fh.read()
        for m in pat.finditer(txt):
            ref = m.group(1)
            if "*" in ref or "{" in ref or "<" in ref:
                continue
            seen += 1
            if not os.path.isfile(c.p(ref)):
                c.add("FAIL", "M", "%s names %s, which does not exist" % (os.path.relpath(f, c.repo), ref))
                bad += 1
    if not bad:
        c.add("PASS", "M", "%d file/script references in docstrings, comments and docs all exist" % seen)


def check_n_misc(c):
    sys.path.insert(0, c.p("schema"))
    import importlib
    sv = importlib.import_module("semantic_validate")
    R = sv.load_repo(c.repo)
    bad = 0
    ids = [r["id"] for r in R["graph"]["rules"]]
    if sorted(ids) != sorted(sv.RULES):
        c.add("FAIL", "N", "graph rule ids %s != validator RULES %s" % (sorted(ids), sorted(sv.RULES)))
        bad += 1
    for r in R["graph"]["rules"]:
        if r["severity"] not in ("error", "warn"):
            c.add("FAIL", "N", "rule %s severity %r" % (r["id"], r["severity"]))
            bad += 1
        for e in r.get("exceptions", []):
            if e["template"] not in R["templates"]["templates"]:
                c.add("FAIL", "N", "rule %s exception names unknown template %s" % (r["id"], e["template"]))
                bad += 1
    # schema x-maxWords == contract maxWords for every section
    schema = R["schema"]

    def strip(node, key):
        if isinstance(node, list):
            return [strip(x, key) for x in node]
        if not isinstance(node, dict):
            return node
        return dict((k, strip(v, key)) for k, v in node.items() if k in ("type", "properties", "items", "oneOf", "additionalProperties", "required", "minItems", "maxItems", "const", "enum", "pattern", "allOf", "$ref", "title", "description", key) or k == key)

    def maxmap(node, key, path, out):
        if isinstance(node, dict):
            if key in node:
                out[path] = node[key]
            for k, v in node.items():
                if k in ("properties",):
                    for pk, pv in v.items():
                        maxmap(pv, key, path + "." + pk, out)
                elif k == "items":
                    maxmap(v, key, path + "[]", out)
                elif k == "oneOf":
                    for i, b in enumerate(v):
                        maxmap(b, key, path + "{%d}" % i, out)
        return out
    allof = schema["definitions"]["node"]["allOf"]
    by_type = {}
    for a in allof:
        by_type[a["if"]["properties"]["type"]["const"]] = a["then"]["properties"]["content"]
    for sid, sec in R["sections"].items():
        a = maxmap(sec["content"], "maxWords", "", {})
        b = maxmap(by_type.get(sid, {}), "x-maxWords", "", {})
        if a != b:
            c.add("FAIL", "N", "section %s: schema x-maxWords tree differs from the contract maxWords tree" % sid)
            bad += 1
        if sec["motion"]["requiredReducedMotionFallback"] not in jload(c.p("schema/pagespec.schema.json"))["definitions"]["motion"]["properties"]["reducedMotionFallback"]["enum"]:
            c.add("FAIL", "N", "section %s requires an unknown reducedMotionFallback" % sid)
            bad += 1
        for p in sec["motion"]["allowedPatterns"]:
            if p not in schema["definitions"]["motion"]["properties"]["pattern"]["enum"]:
                c.add("FAIL", "N", "section %s allows unknown motion pattern %s" % (sid, p))
                bad += 1
        if "example" not in sec:
            c.add("FAIL", "N", "section %s has no example content" % sid)
            bad += 1
        if sec["motion"].get("scrollLinked") is not False:
            c.add("FAIL", "N", "section %s must record scrollLinked false (site has no scroll-linked motion)" % sid)
            bad += 1
    # usedBy references
    sec_ids = set(R["sections"])
    for folder in ("primitives", "components"):
        for fn in os.listdir(c.p(folder)):
            d = jload(c.p(folder + "/" + fn))
            for u in d.get("usedBy", []):
                if u not in sec_ids:
                    c.add("FAIL", "N", "%s/%s usedBy unknown section %s" % (folder, fn, u))
                    bad += 1
    # no navbar / mustFollowNav anywhere
    for f in iter_files(c.repo):
        if f.endswith(".json"):
            with open(f, encoding="utf-8") as fh:
                t = fh.read()
            if "mustFollowNav" in t or "shell.navbar" in t:
                c.add("FAIL", "N", "%s mentions mustFollowNav / shell.navbar, but the site has no navbar" % os.path.relpath(f, c.repo))
                bad += 1
    if not bad:
        c.add("PASS", "N", "graph rule ids == validator RULES (%d); schema x-maxWords == contract maxWords for %d sections; cross references resolve; no navbar/mustFollowNav" % (len(ids), len(R["sections"])))


# ----------------------------------------------------------------------------- section contracts (check O)
def check_section_contracts(contracts, allow, contract_schema, pagespec_schema, sv_pin):
    """Pure function: return a list of error strings. contracts: {id: contract dict}."""
    from jsonschema import Draft7Validator
    errs = []
    v = Draft7Validator(contract_schema)
    cats = allow.get("sectionCategories", [])
    if sorted(cats) != sorted(contract_schema["properties"]["semantic"]["properties"]["category"]["enum"]):
        errs.append("allowlist.sectionCategories %s != section-contract schema category enum" % cats)
    if set(allow.get("retrievalIneligibleSections", [])) != set(PINNED_RETRIEVAL_INELIGIBLE):
        errs.append("allowlist.retrievalIneligibleSections %s != the pinned set %s" % (sorted(allow.get("retrievalIneligibleSections", [])), sorted(PINNED_RETRIEVAL_INELIGIBLE)))
    if set(sv_pin) != set(PINNED_RETRIEVAL_INELIGIBLE):
        errs.append("semantic_validate.PINNED_RETRIEVAL_INELIGIBLE %s != verify_all pin %s" % (sorted(sv_pin), sorted(PINNED_RETRIEVAL_INELIGIBLE)))
    # the PageSpec schema must lock the pinned overlays to false, and only them
    locked = set()
    for a in pagespec_schema["definitions"]["node"]["allOf"]:
        r = a["then"]["properties"].get("retrievalEligible")
        if r is not None:
            if r != {"const": False}:
                errs.append("pagespec schema: retrievalEligible rule for %s is %r, expected {'const': False}" % (a["if"]["properties"]["type"]["const"], r))
            locked.add(a["if"]["properties"]["type"]["const"])
    if locked != set(PINNED_RETRIEVAL_INELIGIBLE):
        errs.append("pagespec schema locks retrievalEligible=false on %s but the pin is %s" % (sorted(locked), sorted(PINNED_RETRIEVAL_INELIGIBLE)))
    if "retrievalEligible" not in pagespec_schema["definitions"]["node"]["properties"]:
        errs.append("pagespec schema node has no retrievalEligible property")
    for sid, c in sorted(contracts.items()):
        for e in sorted(v.iter_errors(c), key=lambda e: list(map(str, e.absolute_path))):
            errs.append("%s: contract schema: %s: %s" % (sid, "/".join(str(x) for x in e.absolute_path) or "(root)", e.message[:140]))
        sem = c.get("semantic", {})
        src = c.get("source", {})
        if sem.get("semanticId") != c.get("id"):
            errs.append("%s: semantic.semanticId %r != contract id" % (sid, sem.get("semanticId")))
        if sem.get("category") not in cats:
            errs.append("%s: semantic.category %r is not in the closed category set %s" % (sid, sem.get("category"), cats))
        if src.get("sourceId") == c.get("id") or src.get("sourceId") == sem.get("semanticId"):
            errs.append("%s: source.sourceId equals the semantic id; provenance and taxonomy must stay separate fields" % sid)
        want = sid not in PINNED_RETRIEVAL_INELIGIBLE
        if c.get("retrievalEligible") is not want:
            errs.append("%s: retrievalEligible is %r but the independent pin requires %r" % (sid, c.get("retrievalEligible"), want))
        if sem.get("category") == "OVERLAY" and c.get("retrievalEligible") is not False:
            errs.append("%s: an OVERLAY-category section must be retrievalEligible false" % sid)
        if (sem.get("category") == "OVERLAY") != (src.get("inFlow") is False):
            errs.append("%s: inFlow %r disagrees with category %r (overlays are fixed, everything else is in flow)" % (sid, src.get("inFlow"), sem.get("category")))
    for pid in PINNED_RETRIEVAL_INELIGIBLE:
        if pid not in contracts:
            errs.append("pinned retrieval-ineligible section %s has no contract" % pid)
    return errs


def check_o_contracts(c):
    sys.path.insert(0, c.p("schema"))
    import importlib
    sv = importlib.import_module("semantic_validate")
    contracts = {}
    for fn in sorted(os.listdir(c.p("sections"))):
        if fn.endswith(".json"):
            d = jload(c.p("sections/" + fn))
            contracts[d["id"]] = d
    errs = check_section_contracts(contracts, jload(c.p("tokens/llm/component-allowlist.json")), jload(c.p("schema/section-contract.schema.json")),
                                   jload(c.p("schema/pagespec.schema.json")), sv.PINNED_RETRIEVAL_INELIGIBLE)
    for e in errs:
        c.add("FAIL", "O", e)
    if not errs:
        c.add("PASS", "O", "%d section contracts: closed source{sourceId,citation,mountedAt,domSelectors,inFlow} and semantic{semanticId,category} kept separate; retrievalEligible matches the independent pin (%s ineligible, %d eligible); schema locks the pinned overlays to false" % (len(contracts), ", ".join(sorted(PINNED_RETRIEVAL_INELIGIBLE)), len(contracts) - len(PINNED_RETRIEVAL_INELIGIBLE)))


# ----------------------------------------------------------------------------- height gate (check P)
def evaluate_height_gate(contracts, templates, sheights, gate):
    """Pure function: return (fails, warns, notes). sheights is measured-values.json['sectionHeights'];
    gate is extraction/quality-gate.json."""
    fails, warns, notes = [], [], []
    if not isinstance(sheights, dict) or "routes" not in sheights:
        return ["measured-values.json has no sectionHeights.routes (run extraction/measure_sections.mjs --write)"], warns, notes
    if sheights.get("viewport", {}).get("width") != GATE_VIEWPORT_WIDTH:
        fails.append("sectionHeights were not measured at %dpx wide (viewport %r)" % (GATE_VIEWPORT_WIDTH, sheights.get("viewport")))
    route_paths = [r["path"] for r in templates["routes"]]
    sections_known = set(contracts)
    # whitelist well-formedness
    wl = {}
    for i, e in enumerate(gate.get("whitelist", [])):
        tag = "quality-gate whitelist[%d]" % i
        if e.get("gate") not in ("height-fail", "majority"):
            fails.append("%s: gate %r is not height-fail|majority" % (tag, e.get("gate")))
            continue
        if e.get("section") not in sections_known:
            fails.append("%s: unknown section %r" % (tag, e.get("section")))
        if e.get("route") not in route_paths:
            fails.append("%s: unknown route %r" % (tag, e.get("route")))
        if len(str(e.get("justification", "")).strip()) < 60:
            fails.append("%s (%s %s %s): justification missing or shorter than 60 characters" % (tag, e.get("gate"), e.get("section"), e.get("route")))
        if not str(e.get("reviewedBy", "")).strip() or not re.match(r"^\d{4}-\d{2}-\d{2}$", str(e.get("reviewedOn", ""))):
            fails.append("%s: needs reviewedBy and an ISO reviewedOn date" % tag)
        if e["gate"] == "height-fail" and not isinstance(e.get("allowedUpToPx"), int):
            fails.append("%s: a height-fail entry needs an integer allowedUpToPx cap" % tag)
        wl[(e.get("gate"), e.get("section"), e.get("route"))] = {"entry": e, "used": False}
    for r in templates["routes"]:
        rec = sheights["routes"].get(r["path"])
        if rec is None:
            fails.append("sectionHeights has no record for route %s" % r["path"])
            continue
        page_h = rec.get("pageHeightPx")
        if not isinstance(page_h, int) or page_h <= 0:
            fails.append("%s: pageHeightPx missing or not a positive integer" % r["path"])
            continue
        total = 0
        for n in templates["templates"][r["template"]]["nodes"]:
            sid = n["section"]
            con = contracts.get(sid)
            if con is None:
                fails.append("%s: node %s has no contract" % (r["path"], sid))
                continue
            if con["source"]["inFlow"] is False:
                continue
            sec = rec["sections"].get(sid)
            h = sec.get("heightPx") if isinstance(sec, dict) else None
            if not isinstance(h, int) or h <= 0:
                fails.append("%s: no measured height for in-flow section %s" % (r["path"], sid))
                continue
            total += h
            cat = con["semantic"]["category"]
            if cat == "HERO":
                if h > HERO_FAIL_PX:
                    k = ("height-fail", sid, r["path"])
                    if k in wl and h <= wl[k]["entry"].get("allowedUpToPx", -1):
                        wl[k]["used"] = True
                        warns.append("%s %s (HERO) is %dpx, above the %dpx failure line, but is covered by a reviewed whitelist entry (cap %spx)" % (r["path"], sid, h, HERO_FAIL_PX, wl[k]["entry"].get("allowedUpToPx")))
                    elif k in wl:
                        wl[k]["used"] = True
                        fails.append("%s %s (HERO) is %dpx: exceeds even its whitelisted cap of %spx" % (r["path"], sid, h, wl[k]["entry"].get("allowedUpToPx")))
                    else:
                        fails.append("%s %s (HERO) is %dpx, above %dpx: a whole-page wrapper. Split it into real sections, or add a reviewed entry to extraction/quality-gate.json" % (r["path"], sid, h, HERO_FAIL_PX))
                elif h > HERO_WARN_PX:
                    warns.append("%s %s (HERO) is %dpx, above the %dpx warning line: check it is not wrapping the page" % (r["path"], sid, h, HERO_WARN_PX))
            share = h / float(page_h)
            if share > MAJORITY_SHARE:
                k = ("majority", sid, r["path"])
                if k in wl:
                    wl[k]["used"] = True
                    notes.append("%s %s holds %.0f%% of the page (%d of %dpx): reviewed whitelist entry" % (r["path"], sid, share * 100, h, page_h))
                else:
                    warns.append("%s %s holds %.0f%% of the page (%d of %dpx): one section is the majority of the page" % (r["path"], sid, share * 100, h, page_h))
        if total > page_h + 2:
            fails.append("%s: section heights sum to %dpx, more than the page's %dpx (the measurement is not credible)" % (r["path"], total, page_h))
    for k, v in wl.items():
        if not v["used"]:
            fails.append("quality-gate whitelist entry %s is stale: that gate does not trigger now, remove it" % (k,))
    return fails, warns, notes


def check_p_height(c):
    ledger = jload(c.p("extraction/measured-values.json"))
    gate = jload(c.p("extraction/quality-gate.json"))
    templates = jload(c.p("templates/templates.json"))
    contracts = {}
    for fn in sorted(os.listdir(c.p("sections"))):
        if fn.endswith(".json"):
            d = jload(c.p("sections/" + fn))
            contracts[d["id"]] = d
    fails, warns, notes = evaluate_height_gate(contracts, templates, ledger.get("sectionHeights"), gate)
    for m in fails:
        c.add("FAIL", "P", m)
    for m in warns:
        c.add("WARN", "P", m)
    if not fails:
        heroes = []
        for rp, rec in ledger["sectionHeights"]["routes"].items():
            for sid, s in rec["sections"].items():
                if contracts.get(sid, {}).get("semantic", {}).get("category") == "HERO" and s:
                    heroes.append("%s %s %dpx" % (rp, sid, s["heightPx"]))
        c.add("PASS", "P", "height gate at %dpx wide: HERO sections %s (warn >%d, fail >%d); no unreviewed section holds >%d%% of a page%s" % (
            GATE_VIEWPORT_WIDTH, "; ".join(heroes) or "none", HERO_WARN_PX, HERO_FAIL_PX, int(MAJORITY_SHARE * 100),
            ("; reviewed exceptions: " + " | ".join(notes)) if notes else ""))


# ----------------------------------------------------------------------------- eyebrow acknowledgement (check Q)
def check_eyebrow_acks(rule, example_specs, section_ids, eyebrow_duplicates):
    """Pure function: return a list of error strings. example_specs: list of PageSpec dicts."""
    errs = []
    acks = rule.get("acknowledgedDuplicates", [])
    live = set()
    for spec in example_specs:
        for num, owners in eyebrow_duplicates(spec["nodes"]).items():
            live.add((num, tuple(sorted(owners))))
    for i, a in enumerate(acks):
        tag = "EYEBROW_NUMBER_UNIQUE.acknowledgedDuplicates[%d]" % i
        if not re.match(r"^\d{2}$", str(a.get("numeral", ""))):
            errs.append("%s: numeral %r is not two digits" % (tag, a.get("numeral")))
        for s in a.get("sections", []):
            if s not in section_ids:
                errs.append("%s: unknown section %s" % (tag, s))
        if len(a.get("sections", [])) < 2:
            errs.append("%s: a duplicate needs at least two sections" % tag)
        for f in ("reason", "renderedEvidence", "originalEvidence"):
            if len(str(a.get(f, "")).strip()) < 40:
                errs.append("%s: %s is missing or too thin to be evidence" % (tag, f))
        if not a.get("measuredFrom"):
            errs.append("%s: no measuredFrom citations" % tag)
        if (a.get("numeral"), tuple(sorted(a.get("sections", [])))) not in live:
            errs.append("%s: stale acknowledgement (numeral %s on %s is not duplicated by any example); remove it" % (tag, a.get("numeral"), a.get("sections")))
    acked = set((a.get("numeral"), tuple(sorted(a.get("sections", [])))) for a in acks)
    for k in sorted(live - acked):
        errs.append("example repeats eyebrow numeral %s on %s with no acknowledgement" % (k[0], list(k[1])))
    return errs


def check_q_eyebrow(c):
    sys.path.insert(0, c.p("schema"))
    import importlib
    sv = importlib.import_module("semantic_validate")
    graph = jload(c.p("compatibility/graph.json"))
    rule = [r for r in graph["rules"] if r["id"] == "EYEBROW_NUMBER_UNIQUE"][0]
    specs = [jload(c.p("schema/" + f)) for f in sorted(os.listdir(c.p("schema"))) if f.startswith("example") and f.endswith(".pagespec.json")]
    sec_ids = set(jload(c.p("sections/" + fn))["id"] for fn in os.listdir(c.p("sections")) if fn.endswith(".json"))
    errs = check_eyebrow_acks(rule, specs, sec_ids, sv.eyebrow_duplicates)
    for e in errs:
        c.add("FAIL", "Q", e)
    if not errs:
        c.add("PASS", "Q", "eyebrow numerals: %s acknowledged on purpose (rendered as built, no evidence about the original), live in the example, and nothing else repeats" % ", ".join("%s on %s" % (a["numeral"], "+".join(a["sections"])) for a in rule.get("acknowledgedDuplicates", [])))


CHECKS = [check_a_schema, check_b_parity, check_c_version, check_d_citations, check_e_counts, check_f_routes, check_g_words, check_h_entry, check_i_paths,
          check_j_assets, check_k_tokens, check_l_pin, check_m_claims, check_n_misc, check_o_contracts, check_p_height, check_q_eyebrow]


def run(repo, source):
    c = Ctx(repo, source)
    for fn in CHECKS:
        try:
            fn(c)
        except Exception as exc:  # a broken file must fail loudly, not crash silently
            c.add("FAIL", fn.__name__[6:7].upper(), "%s raised %r" % (fn.__name__, exc))
    return c


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=DEFAULT_REPO)
    ap.add_argument("--source", default=None, help="project root holding src/, CLONE_SPEC.md, recon/, package.json (default: the parent of the repo, if it looks like one)")
    ap.add_argument("-q", "--quiet", action="store_true")
    a = ap.parse_args(argv)
    repo = os.path.abspath(a.repo)
    source = os.path.abspath(a.source) if a.source else os.path.dirname(repo)
    if not (os.path.isdir(os.path.join(source, "src")) and os.path.isfile(os.path.join(source, "CLONE_SPEC.md"))):
        source = None
    c = run(repo, source)
    fails = 0
    for status, code, msg in c.results:
        if status == "FAIL":
            fails += 1
        if a.quiet and status in ("PASS",):
            continue
        print("%-4s [%s] %s" % (status, code, msg))
    npass = len([r for r in c.results if r[0] == "PASS"])
    nwarn = len([r for r in c.results if r[0] == "WARN"])
    print("")
    print("source tree: %s" % ("present" if source else "ABSENT (citation/pin checks degrade to WARN)"))
    print("SUMMARY: %d PASS, %d WARN, %d FAIL" % (npass, nwarn, fails))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
