#!/usr/bin/env python3
"""Adversarial suite: every rule must REJECT a bad instance, and every control must pass.

Layers covered
  schema      wrong enum value, missing required field, invented type alias, missing
              reducedMotionFallback, invented motion field, invented assetRole, wrong-field
              (valid-enum) assetRole, extra content property, wrong motion pattern/trigger
  structural  duplicate onePerPage section, removed mandatory section, reordered fixed-position
              sections, template/node-sequence mismatch, route/template mismatch, hero on a
              legal page, overlay missing for a #demo CTA, home-only section on a legal route
  runtime     maxWords overflow on real fields (shallow, nested and oneOf-branch fields)
  graph       rule severity is honoured (warn vs error) and every named exception is real
  assets      pinned-value mutation: form-submit-endpoint changed to a DIFFERENT BUT VALID policy
              value must be rejected (membership in the closed enum is not enough)
  controls    the unmutated examples, and a spec synthesised generically from every template's
              own node list, produce ZERO errors

Run:  python3 schema/tests/adversarial_test.py     (exit 0 = all rejected / all controls pass)
Needs only the repo itself; the root is derived from this file's location.
"""
import copy
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "schema"))
import semantic_validate as sv  # noqa: E402

_spec = importlib.util.spec_from_file_location("verify_all", os.path.join(REPO, "extraction", "verify_all.py"))
verify_all = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(verify_all)

R = sv.load_repo(REPO)


def jl(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as fh:
        return json.load(fh)


HOME = jl("schema/example.pagespec.json")
LEGAL = jl("schema/example.legal-prose.pagespec.json")

RESULTS = []


def errs_of(spec, repo=None):
    se, me, wa = sv.validate_all(spec, repo or R)
    return se, me, wa


def node(spec, t):
    for n in spec["nodes"]:
        if n["type"] == t:
            return n
    raise KeyError(t)


def idx(spec, t):
    return [n["type"] for n in spec["nodes"]].index(t)


def expect_reject(name, spec, layer, want=None, repo=None):
    """layer: 'schema' | 'semantic' | 'any'. want: substring that must appear in some message."""
    se, me, wa = errs_of(spec, repo)
    msgs = se + me
    if layer == "schema":
        ok = bool(se)
    elif layer == "semantic":
        ok = bool(me)
    else:
        ok = bool(se or me)
    if ok and want:
        ok = any(want in m for m in msgs)
    RESULTS.append((name, ok, "rejected" if ok else "NOT REJECTED (schema=%d semantic=%d)" % (len(se), len(me))))


def expect_pass(name, spec, repo=None):
    se, me, wa = errs_of(spec, repo)
    ok = not se and not me
    RESULTS.append((name, ok, "0 errors, %d warning(s)" % len(wa) if ok else "UNEXPECTED ERRORS: %s" % (se + me)[:2]))


def mut(base, fn):
    s = copy.deepcopy(base)
    fn(s)
    return s


def synth(template_id):
    """Generic control: build a spec from a template's own node list using each section's bundled example."""
    t = R["templates"]["templates"][template_id]
    route = t["routes"][0]
    nodes = []
    for x in t["nodes"]:
        sec = R["sections"][x["section"]]
        m = sec["motion"]
        tr = m["primaryTrigger"]
        motion = {"pattern": m["allowedPatterns"][0], "trigger": tr["type"], "reducedMotionFallback": m["requiredReducedMotionFallback"]}
        if "inViewAmount" in tr:
            motion["inViewAmount"] = tr["inViewAmount"]
        if "once" in tr:
            motion["once"] = tr["once"]
        if "loopPeriodMs" in m:
            motion["loopPeriodMs"] = m["loopPeriodMs"]
        nodes.append({"type": x["section"], "content": copy.deepcopy(sec["example"]), "motion": motion})
    return {"template": template_id, "route": route, "documentTitle": "Acme OS", "nodes": nodes}


def run():
    # ------------------------------------------------------------------ controls
    expect_pass("CONTROL home example", HOME)
    expect_pass("CONTROL legal-prose example", LEGAL)
    for tid in R["templates"]["templates"]:
        expect_pass("CONTROL synthesised spec for template %s (from its own node list)" % tid, synth(tid))
    # the second legal route also works with the same template
    t2 = synth("legal-prose")
    t2["route"] = "/terms-of-service/"
    expect_pass("CONTROL legal-prose on its second route", t2)
    se, me, wa = errs_of(HOME)
    RESULTS.append(("CONTROL home example emits exactly the documented EYEBROW_NUMBER_UNIQUE warning", len(wa) == 1 and "EYEBROW_NUMBER_UNIQUE" in wa[0], "warnings=%s" % wa))

    # ------------------------------------------------------------ schema layer
    expect_reject("schema: wrong enum value (template 'blog')", mut(HOME, lambda s: s.__setitem__("template", "blog")), "schema")
    expect_reject("schema: wrong enum value (route '/pricing/')", mut(HOME, lambda s: s.__setitem__("route", "/pricing/")), "schema")
    expect_reject("schema: wrong enum value (CTA href '#contact')", mut(HOME, lambda s: node(s, "hero.episode")["content"]["primaryCta"].__setitem__("href", "#contact")), "schema")
    expect_reject("schema: wrong enum value (persona accent 'red')", mut(HOME, lambda s: node(s, "usecases.stage")["content"]["personas"][0].__setitem__("accent", "red")), "schema")
    expect_reject("schema: wrong enum value (motion.trigger 'scroll')", mut(HOME, lambda s: node(s, "hero.episode")["motion"].__setitem__("trigger", "scroll")), "schema")
    expect_reject("schema: missing required field (documentTitle)", mut(HOME, lambda s: s.pop("documentTitle")), "schema")
    expect_reject("schema: missing required field (node.motion)", mut(HOME, lambda s: node(s, "security.matrix").pop("motion")), "schema")
    expect_reject("schema: missing required content field (hero headline)", mut(HOME, lambda s: node(s, "hero.episode")["content"].pop("headline")), "schema")
    expect_reject("schema: missing required nested field (kpi value)", mut(HOME, lambda s: node(s, "hero.episode")["content"]["episode"]["dashboard"]["kpis"][0].pop("value")), "schema")
    expect_reject("schema: invented type alias ('hero')", mut(HOME, lambda s: node(s, "hero.episode").__setitem__("type", "hero")), "schema")
    expect_reject("schema: invented type alias ('shell.navbar': the site has no navbar)", mut(HOME, lambda s: s["nodes"].insert(0, {"type": "shell.navbar", "content": {}, "motion": {"pattern": "none", "trigger": "none", "reducedMotionFallback": "not-applicable-static"}})), "schema")
    expect_reject("schema: missing reducedMotionFallback", mut(HOME, lambda s: node(s, "hero.episode")["motion"].pop("reducedMotionFallback")), "any", "reducedMotionFallback")
    expect_reject("schema: wrong reducedMotionFallback for the section (valid enum, wrong value)", mut(HOME, lambda s: node(s, "hero.episode")["motion"].__setitem__("reducedMotionFallback", "transitions-none")), "any")
    expect_reject("schema: invented motion field", mut(HOME, lambda s: node(s, "hero.episode")["motion"].__setitem__("inventedAnimation", "parallax")), "schema")
    expect_reject("schema: scroll-linked motion field is not in the closed motion set", mut(HOME, lambda s: node(s, "closing.cta")["motion"].__setitem__("scrollProgress", True)), "schema")
    expect_reject("schema: wrong motion trigger lock (hero inViewAmount 0.9)", mut(HOME, lambda s: node(s, "hero.episode")["motion"].__setitem__("inViewAmount", 0.9)), "schema")
    expect_reject("schema: wrong motion once-lock (use-cases once false)", mut(HOME, lambda s: node(s, "usecases.stage")["motion"].__setitem__("once", False)), "schema")
    expect_reject("schema: motion pattern not allowed for the section", mut(HOME, lambda s: node(s, "security.matrix")["motion"].__setitem__("pattern", "typing-episode-loop")), "any")
    expect_reject("schema: invented assetRole ('hero-photo')", mut(HOME, lambda s: node(s, "hero.episode")["content"]["logo"].__setitem__("assetRole", "hero-photo")), "schema")
    expect_reject("schema: valid assetRole in the wrong field (logo uses 'stroke-icon')", mut(HOME, lambda s: node(s, "hero.episode")["content"]["logo"].__setitem__("assetRole", "stroke-icon")), "schema")
    expect_reject("schema: bare generic media string instead of an assetRole object", mut(HOME, lambda s: node(s, "hero.episode")["content"].__setitem__("logo", "logo.svg")), "schema")
    expect_reject("schema: extra property in section content", mut(HOME, lambda s: node(s, "hero.episode")["content"].__setitem__("backgroundImage", "x.png")), "schema")
    expect_reject("schema: extra property at page level (token override field does not exist)", mut(HOME, lambda s: s.__setitem__("tokenOverrides", {"color": "#ff0000"})), "schema")
    expect_reject("schema: extra property on a node", mut(HOME, lambda s: node(s, "hero.episode").__setitem__("style", {"color": "red"})), "schema")
    expect_reject("schema: oneOf branch with a field from another kind (kpi dash carrying 'tiles')", mut(HOME, lambda s: node(s, "usecases.stage")["content"]["personas"][0]["prompts"][0]["dash"].__setitem__("tiles", [])), "schema")
    expect_reject("schema: array length (hero needs exactly 5 prompts)", mut(HOME, lambda s: node(s, "hero.episode")["content"]["episode"]["prompts"].pop()), "schema")
    expect_reject("schema: array length (45 vendors)", mut(HOME, lambda s: node(s, "integrations.grid")["content"]["vendors"].pop()), "schema")
    expect_reject("schema: monogram pattern (3 letters)", mut(HOME, lambda s: node(s, "integrations.grid")["content"]["vendors"][0].__setitem__("monogram", "QOX")), "schema")
    expect_reject("schema: contact email outside the reserved .example domain", mut(LEGAL, lambda s: node(s, "legal.body")["content"].__setitem__("contactEmail", "legal@realcompany.com")), "schema")

    # --------------------------------------------------------------- structural
    expect_reject("structural: duplicate onePerPage section (two hero.episode nodes)", mut(HOME, lambda s: s["nodes"].insert(1, copy.deepcopy(node(s, "hero.episode")))), "semantic", "hero.episode")
    expect_reject("structural: duplicate onePerPage section (two chrome.footer nodes)", mut(HOME, lambda s: s["nodes"].append(copy.deepcopy(node(s, "chrome.footer")))), "semantic")
    expect_reject("structural: removed mandatory section (csr.loop)", mut(HOME, lambda s: s["nodes"].pop(idx(s, "csr.loop"))), "semantic", "csr.loop")
    expect_reject("structural: removed mandatory section (hero.episode)", mut(HOME, lambda s: s["nodes"].pop(idx(s, "hero.episode"))), "semantic", "hero.episode")
    expect_reject("structural: removed mandatory overlay (demo dialog, while CTAs link to #demo)", mut(HOME, lambda s: s["nodes"].pop(idx(s, "overlay.demo-dialog"))), "semantic")
    expect_reject("structural: removed cookie banner (footer Cookies button needs it)", mut(HOME, lambda s: s["nodes"].pop(idx(s, "overlay.cookie-banner"))), "semantic")
    expect_reject("structural: reordered fixed-position section (hero not first)", mut(HOME, lambda s: s["nodes"].insert(1, s["nodes"].pop(0))), "semantic", "order")
    expect_reject("structural: reordered fixed-position section (closing.cta before security.matrix)", mut(HOME, lambda s: s["nodes"].insert(idx(s, "security.matrix"), s["nodes"].pop(idx(s, "closing.cta")))), "semantic")
    expect_reject("structural: reordered fixed-position section (footer before closing.cta)", mut(HOME, lambda s: s["nodes"].insert(idx(s, "closing.cta"), s["nodes"].pop(idx(s, "chrome.footer")))), "semantic")
    expect_reject("structural: overlay before the footer", mut(HOME, lambda s: s["nodes"].insert(idx(s, "chrome.footer"), s["nodes"].pop(idx(s, "overlay.demo-dialog")))), "semantic")
    expect_reject("structural: template/node-sequence mismatch (legal-prose declared with home nodes)", mut(HOME, lambda s: s.update({"template": "legal-prose"})), "any")
    expect_reject("structural: template/node-sequence mismatch (home declared with legal nodes)", mut(LEGAL, lambda s: s.update({"template": "home"})), "any")
    expect_reject("structural: route/template mismatch (route '/' with template legal-prose, home nodes)", mut(HOME, lambda s: s.update({"route": "/terms-of-service/", "template": "home"})), "any")
    expect_reject("structural: route bound to the wrong template, correct nodes", mut(LEGAL, lambda s: s.update({"route": "/"})), "any")
    expect_reject("structural: hero on a legal page", mut(LEGAL, lambda s: s["nodes"].insert(0, copy.deepcopy(node(HOME, "hero.episode")))), "semantic")
    expect_reject("structural: home-only section on a legal route (security.matrix)", mut(LEGAL, lambda s: s["nodes"].insert(2, copy.deepcopy(node(HOME, "security.matrix")))), "semantic", "not allowed on route")
    expect_reject("structural: legal.body before legal.header", mut(LEGAL, lambda s: s["nodes"].insert(0, s["nodes"].pop(1))), "semantic")
    expect_reject("structural: node not in the declared template (legal.header on home)", mut(HOME, lambda s: s["nodes"].insert(1, copy.deepcopy(node(LEGAL, "legal.header")))), "semantic")

    # ------------------------------------------------------------------ runtime
    over = lambda n: " ".join(["word"] * n)
    expect_reject("runtime: maxWords overflow (hero headline, 40 words)", mut(HOME, lambda s: node(s, "hero.episode")["content"].__setitem__("headline", over(40))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (nested: persona prompt question)", mut(HOME, lambda s: node(s, "usecases.stage")["content"]["personas"][0]["prompts"][0].__setitem__("question", over(40))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (oneOf branch field: kpi dash foot)", mut(HOME, lambda s: node(s, "usecases.stage")["content"]["personas"][0]["prompts"][0]["dash"].__setitem__("foot", over(40))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (array item: security quadrant body)", mut(HOME, lambda s: node(s, "security.matrix")["content"]["quadrants"][2].__setitem__("body", over(80))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (closing CTA label)", mut(HOME, lambda s: node(s, "closing.cta")["content"]["cta"].__setitem__("label", over(12))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (legal paragraph, oneOf branch)", mut(LEGAL, lambda s: node(s, "legal.body")["content"]["sections"][0]["blocks"][0].__setitem__("text", over(200))), "semantic", "maxWords")
    expect_reject("runtime: maxWords overflow (documentTitle)", mut(HOME, lambda s: s.__setitem__("documentTitle", over(30))), "semantic", "maxWords")
    # boundary: exactly at the limit passes (the check is not off-by-one in the strict direction)
    lim = R["sections"]["closing.cta"]["content"]["properties"]["cta"]["properties"]["label"]["maxWords"]
    expect_pass("runtime boundary: closing CTA label exactly at maxWords (%d) passes" % lim, mut(HOME, lambda s: node(s, "closing.cta")["content"]["cta"].__setitem__("label", over(lim))))

    # ------------------------------------------------------------ graph severity
    g = copy.deepcopy(R)
    for rule in g["graph"]["rules"]:
        if rule["id"] == "EYEBROW_NUMBER_UNIQUE":
            rule["severity"] = "error"
    se, me, wa = sv.validate_all(HOME, g)
    RESULTS.append(("graph: severity honoured (EYEBROW_NUMBER_UNIQUE flipped warn->error turns the warning into an error)", bool(me) and not wa, "errors=%d warnings=%d" % (len(me), len(wa))))
    g2 = copy.deepcopy(R)
    g2["graph"]["rules"] = [r for r in g2["graph"]["rules"] if r["id"] != "HERO_FIRST_ON_HOME"]
    s_bad = mut(HOME, lambda s: s["nodes"].insert(1, s["nodes"].pop(0)))
    se, me, wa = sv.validate_all(s_bad, g2)
    RESULTS.append(("graph: rule removed from graph.json no longer fires (template order check still catches the reorder)", any("order" in m for m in me), "errors=%d" % len(me)))
    ex_ok = all(e["template"] in R["templates"]["templates"] for r in R["graph"]["rules"] for e in r.get("exceptions", []))
    RESULTS.append(("graph: every named exception names a real template", ex_ok, "ok" if ex_ok else "bad"))
    legal_nohero = mut(LEGAL, lambda s: None)
    RESULTS.append(("graph: exceptions work both ways (legal page without hero/closing passes HERO_FIRST and CLOSING rules)", not errs_of(legal_nohero)[1], "ok"))
    ids = sorted(r["id"] for r in R["graph"]["rules"])
    RESULTS.append(("graph: every graph rule id has a validator implementation (and vice versa)", ids == sorted(sv.RULES), "%d rules" % len(ids)))

    # --------------------------------------------------------------- asset roles
    doc = jl("assets/asset-roles.json")
    RESULTS.append(("assets CONTROL: pinned values pass as shipped", not verify_all.check_asset_role_pins(doc), "ok"))
    for rid, wrong in (("form-submit-endpoint", "may-generate-new"), ("form-submit-endpoint", "must-reuse-exact"), ("form-submit-endpoint", "must-not-fabricate"),
                       ("vendor-logo-tile", "may-generate-new"), ("map-basemap-tile", "may-generate-new"), ("legal-copy", "may-generate-new"),
                       ("brand-wordmark", "may-generate-new"), ("brand-chip-mark", "must-not-fabricate")):
        d = copy.deepcopy(doc)
        assert wrong in d["generationPolicyEnum"], "mutation must be a VALID enum value"
        d["roles"][rid]["generationPolicy"] = wrong
        e = verify_all.check_asset_role_pins(d)
        RESULTS.append(("assets: pinned role %s changed to the different-but-VALID policy %r" % (rid, wrong), bool(e) and any("PINNED" in m for m in e), "rejected" if e else "NOT REJECTED"))
    d = copy.deepcopy(doc)
    d["roles"]["form-submit-endpoint"]["generationPolicy"] = "anything-goes"
    RESULTS.append(("assets: policy outside the closed enum", bool(verify_all.check_asset_role_pins(d)), "rejected"))
    d = copy.deepcopy(doc)
    del d["roles"]["form-submit-endpoint"]
    RESULTS.append(("assets: pinned role deleted", bool(verify_all.check_asset_role_pins(d)), "rejected"))
    d = copy.deepcopy(doc)
    d["pinnedPolicies"]["form-submit-endpoint"] = "may-generate-new"
    RESULTS.append(("assets: pinnedPolicies record edited to match a weakened role", bool(verify_all.check_asset_role_pins(d)), "rejected"))
    # schema enum is closed to the registry
    sch = R["schema"]["definitions"]["assetRole"]["enum"]
    RESULTS.append(("assets: schema assetRole enum equals asset-roles.json roles", sorted(sch) == sorted(doc["roles"]), "%d roles" % len(sch)))


def main():
    run()
    width = max(len(n) for n, _, _ in RESULTS)
    bad = 0
    for name, ok, detail in RESULTS:
        if not ok:
            bad += 1
        print("%s  %s  %s" % ("PASS" if ok else "FAIL", name.ljust(width), detail))
    rej = len([1 for n, ok, _ in RESULTS if ok and not n.startswith(("CONTROL", "assets CONTROL")) and "boundary" not in n])
    print("")
    print("%d checks: %d passed, %d failed" % (len(RESULTS), len(RESULTS) - bad, bad))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
