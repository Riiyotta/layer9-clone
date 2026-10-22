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
  eyebrow     the one acknowledged duplicate numeral is exact: removing the acknowledgement, spreading it
              to a third section, a new duplicate, a stale or thinly evidenced entry are all caught
  retrieval   utility overlays flipped to retrievalEligible true at node, contract, allowlist, pin and
              schema level are rejected; the pin does not come from the registry
  contract    source (provenance) vs semantic (taxonomy): missing, extra, swapped, invented or
              mismatched fields are rejected by the closed section-contract schema + verify_all
  height      whole-page-wrapper gate: HERO >1800 warns, >3000 fails unless reviewed-whitelisted (with
              justification, cap, no stale entries); a section holding the majority of a page warns
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
    RESULTS.append(("CONTROL home example emits no warning (its one duplicate numeral is explicitly acknowledged)", len(wa) == 0, "warnings=%s" % wa))

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
    dup4 = mut(HOME, lambda s: node(s, "platform.stack")["content"].__setitem__("eyebrow", "03 · BUILD ON ACME"))
    se, me, wa = errs_of(dup4)
    RESULTS.append(("graph: a NEW duplicate numeral (platform also '03') still warns", not se and not me and len(wa) == 1 and "EYEBROW_NUMBER_UNIQUE" in wa[0], "warnings=%s" % wa))
    g = copy.deepcopy(R)
    for rule in g["graph"]["rules"]:
        if rule["id"] == "EYEBROW_NUMBER_UNIQUE":
            rule["severity"] = "error"
    se, me, wa = sv.validate_all(dup4, g)
    RESULTS.append(("graph: severity honoured (EYEBROW_NUMBER_UNIQUE flipped warn->error turns a new duplicate into an error)", bool(me) and not wa, "errors=%d warnings=%d" % (len(me), len(wa))))
    g = copy.deepcopy(R)
    for rule in g["graph"]["rules"]:
        if rule["id"] == "EYEBROW_NUMBER_UNIQUE":
            rule["acknowledgedDuplicates"] = []
    se, me, wa = sv.validate_all(HOME, g)
    RESULTS.append(("eyebrow: removing the acknowledgement restores exactly the original warning (integrations.grid + csr.loop)", len(wa) == 1 and "integrations.grid" in wa[0] and "csr.loop" in wa[0], "warnings=%s" % wa))
    spread = mut(HOME, lambda s: node(s, "platform.stack")["content"].__setitem__("eyebrow", "03 · BUILD ON ACME"))
    se, me, wa = errs_of(spread)
    RESULTS.append(("eyebrow: acknowledged numeral spreading to a THIRD section is not covered by the acknowledgement", any("platform.stack" in w for w in wa), "warnings=%s" % wa))
    wrong_pair = copy.deepcopy(R)
    for rule in wrong_pair["graph"]["rules"]:
        if rule["id"] == "EYEBROW_NUMBER_UNIQUE":
            rule["acknowledgedDuplicates"][0]["sections"] = ["integrations.grid", "platform.stack"]
    se, me, wa = sv.validate_all(HOME, wrong_pair)
    RESULTS.append(("eyebrow: an acknowledgement naming a different pair does not suppress the real duplicate", len(wa) == 1, "warnings=%s" % wa))
    rule = [r for r in R["graph"]["rules"] if r["id"] == "EYEBROW_NUMBER_UNIQUE"][0]
    secids = set(R["sections"])
    RESULTS.append(("eyebrow CONTROL: shipped acknowledgement reconciles with the shipped examples", not verify_all.check_eyebrow_acks(rule, [HOME, LEGAL], secids, sv.eyebrow_duplicates), "ok"))
    stale = mut(HOME, lambda s: node(s, "csr.loop")["content"].__setitem__("eyebrow", "06 · MEET ACME · THE CARE AGENT"))
    e = verify_all.check_eyebrow_acks(rule, [stale, LEGAL], secids, sv.eyebrow_duplicates)
    RESULTS.append(("eyebrow: stale acknowledgement (the duplicate was fixed in the example) is rejected", any("stale" in m for m in e), "rejected" if e else "NOT REJECTED"))
    e = verify_all.check_eyebrow_acks(rule, [dup4, LEGAL], secids, sv.eyebrow_duplicates)
    RESULTS.append(("eyebrow: an unacknowledged second duplicate in an example is rejected by verify_all", any("no acknowledgement" in m for m in e), "rejected" if e else "NOT REJECTED"))
    thin = copy.deepcopy(rule)
    thin["acknowledgedDuplicates"][0]["reason"] = "fine"
    e = verify_all.check_eyebrow_acks(thin, [HOME, LEGAL], secids, sv.eyebrow_duplicates)
    RESULTS.append(("eyebrow: acknowledgement without real evidence text is rejected", any("too thin" in m for m in e), "rejected" if e else "NOT REJECTED"))
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

    # ------------------------------------------------------------------ retrieval eligibility
    allow = jl("tokens/llm/component-allowlist.json")
    cschema = jl("schema/section-contract.schema.json")
    pschema = R["schema"]
    contracts = R["sections"]

    def contract_errs(cs=None, al=None, ps=None, pin=None):
        return verify_all.check_section_contracts(cs or contracts, al or allow, cschema, ps or pschema, sv.PINNED_RETRIEVAL_INELIGIBLE if pin is None else pin)
    RESULTS.append(("retrieval CONTROL: shipped contracts, allowlist, schema and pins agree", not contract_errs(), "ok"))
    for ov in ("overlay.cookie-banner", "overlay.demo-dialog"):
        expect_pass("retrieval CONTROL: %s node with retrievalEligible false passes" % ov, HOME)
        expect_reject("retrieval: %s node flipped to retrievalEligible true (schema)" % ov, mut(HOME, lambda s, ov=ov: node(s, ov).__setitem__("retrievalEligible", True)), "schema")
        # defence in depth: with the schema lock removed, the semantic validator still rejects it
        bad = mut(HOME, lambda s, ov=ov: node(s, ov).__setitem__("retrievalEligible", True))
        me, _w = sv.validate_semantic(bad, R)
        RESULTS.append(("retrieval: %s flipped to true is ALSO rejected by the semantic validator alone (schema bypassed)" % ov, any("retrievalEligible must be false" in m for m in me), "rejected" if me else "NOT REJECTED"))
        cs = copy.deepcopy(contracts)
        cs[ov]["retrievalEligible"] = True
        e = contract_errs(cs=cs)
        RESULTS.append(("retrieval: %s CONTRACT flipped to eligible is rejected by verify_all (pin independent of the registry)" % ov, any("independent pin" in m for m in e), "rejected" if e else "NOT REJECTED"))
        Rf = copy.deepcopy(R)
        Rf["sections"][ov]["retrievalEligible"] = True
        me, _w = sv.validate_semantic(HOME, Rf)
        RESULTS.append(("retrieval: %s contract flipped to eligible is rejected by the semantic validator (valid example, bad registry)" % ov, any("PINNED to false" in m for m in me), "rejected" if me else "NOT REJECTED"))
    al = copy.deepcopy(allow)
    al["retrievalIneligibleSections"].remove("overlay.cookie-banner")
    e = contract_errs(al=al)
    RESULTS.append(("retrieval: allowlist retrievalIneligibleSections weakened (cookie banner removed)", any("pinned set" in m for m in e), "rejected" if e else "NOT REJECTED"))
    e = contract_errs(pin=frozenset(["overlay.demo-dialog"]))
    RESULTS.append(("retrieval: semantic_validate pin drifted from the verify_all pin", any("semantic_validate.PINNED" in m for m in e), "rejected" if e else "NOT REJECTED"))
    ps = copy.deepcopy(pschema)
    for a in ps["definitions"]["node"]["allOf"]:
        if a["if"]["properties"]["type"]["const"] == "overlay.cookie-banner":
            a["then"]["properties"].pop("retrievalEligible")
    e = contract_errs(ps=ps)
    RESULTS.append(("retrieval: PageSpec schema lock removed for the cookie banner", any("locks retrievalEligible" in m for m in e), "rejected" if e else "NOT REJECTED"))
    ps = copy.deepcopy(pschema)
    for a in ps["definitions"]["node"]["allOf"]:
        if a["if"]["properties"]["type"]["const"] == "overlay.demo-dialog":
            a["then"]["properties"]["retrievalEligible"] = {"const": True}
    e = contract_errs(ps=ps)
    RESULTS.append(("retrieval: PageSpec schema lock changed to const true for the demo dialog", any("expected {'const': False}" in m for m in e), "rejected" if e else "NOT REJECTED"))
    cs = copy.deepcopy(contracts)
    cs["hero.episode"]["retrievalEligible"] = False
    RESULTS.append(("retrieval: ordinary content section flipped to ineligible (pin says eligible)", bool(contract_errs(cs=cs)), "rejected"))
    cs = copy.deepcopy(contracts)
    cs["overlay.cookie-banner"]["semantic"]["category"] = "FEATURE"
    RESULTS.append(("retrieval: overlay re-filed under a content category (inFlow/category disagree)", bool(contract_errs(cs=cs)), "rejected"))
    cs = copy.deepcopy(contracts)
    cs["hero.episode"]["retrievalEligible"] = "yes"
    RESULTS.append(("retrieval: retrievalEligible is not a closed boolean ('yes')", bool(contract_errs(cs=cs)), "rejected"))
    cs = copy.deepcopy(contracts)
    del cs["closing.cta"]["retrievalEligible"]
    RESULTS.append(("retrieval: retrievalEligible field removed from a contract", bool(contract_errs(cs=cs)), "rejected"))
    expect_reject("retrieval: non-boolean retrievalEligible on a node", mut(HOME, lambda s: node(s, "hero.episode").__setitem__("retrievalEligible", "no")), "schema")

    # ------------------------------------------------------- source (provenance) vs semantic (taxonomy)
    def cmut(sid, fn):
        cs = copy.deepcopy(contracts)
        fn(cs[sid])
        return contract_errs(cs=cs)
    cases = [
        ("source block removed", lambda c: c.pop("source"), "source"),
        ("semantic block removed", lambda c: c.pop("semantic"), "semantic"),
        ("extra field inside source (closed object)", lambda c: c["source"].__setitem__("figmaNode", "1:2"), "dditional"),
        ("extra field inside semantic (closed object)", lambda c: c["semantic"].__setitem__("tags", ["a"]), "dditional"),
        ("source.sourceId removed", lambda c: c["source"].pop("sourceId"), "sourceId"),
        ("source.domSelectors empty (not traceable to the DOM)", lambda c: c["source"].__setitem__("domSelectors", []), "domSelectors"),
        ("source.citation not a path:line", lambda c: c["source"].__setitem__("citation", "Hero component"), "citation"),
        ("semantic.semanticId differs from the contract id", lambda c: c["semantic"].__setitem__("semanticId", "hero.main"), "semanticId"),
        ("semantic.category outside the closed set ('WRAPPER')", lambda c: c["semantic"].__setitem__("category", "WRAPPER"), "category"),
        ("source and semantic conflated (sourceId set to the semantic id)", lambda c: c["source"].__setitem__("sourceId", c["id"]), "provenance and taxonomy"),
        ("category written into source instead of semantic", lambda c: (c["source"].__setitem__("category", "HERO"), c["semantic"].pop("category")), "category"),
        ("source.inFlow not boolean", lambda c: c["source"].__setitem__("inFlow", "yes"), "inFlow"),
    ]
    for name, fn, want in cases:
        e = cmut("hero.episode", fn)
        RESULTS.append(("contract: " + name, any(want in m for m in e), "rejected" if e else "NOT REJECTED"))
    e = cmut("overlay.cookie-banner", lambda c: c["source"].__setitem__("inFlow", True))
    RESULTS.append(("contract: overlay marked inFlow true", any("inFlow" in m for m in e), "rejected" if e else "NOT REJECTED"))
    al = copy.deepcopy(allow)
    al["sectionCategories"].append("WRAPPER")
    e = contract_errs(al=al)
    RESULTS.append(("contract: allowlist sectionCategories gains an invented category", any("sectionCategories" in m for m in e), "rejected" if e else "NOT REJECTED"))
    # traceability: every selector-bearing citation and mount line really names the section's component
    ledger = jl("extraction/measured-values.json")
    expects = dict((e["citation"], e["expect"]) for e in ledger["citations"])
    ok = all(c["source"]["citation"] in expects and c["source"]["mountedAt"] in expects for c in contracts.values())
    RESULTS.append(("contract CONTROL: every source.citation and source.mountedAt has a ledger entry", ok, "ok" if ok else "missing"))

    # ----------------------------------------------------------------------- whole-page-wrapper height gate
    templates = R["templates"]
    sh = ledger["sectionHeights"]
    gate = jl("extraction/quality-gate.json")

    def gate_of(fn=None, cs=None, g=None):
        h = copy.deepcopy(sh)
        if fn:
            fn(h)
        return verify_all.evaluate_height_gate(cs or contracts, templates, h, g if g is not None else gate)

    def set_h(route, sid, px, page=None):
        def f(h):
            h["routes"][route]["sections"][sid]["heightPx"] = px
            if page is not None:
                h["routes"][route]["pageHeightPx"] = page
        return f
    fails, warns, notes = gate_of()
    RESULTS.append(("height CONTROL: shipped measurements pass with zero failures and zero warnings", not fails and not warns, "fails=%s warns=%s" % (fails, warns)))
    RESULTS.append(("height CONTROL: measured hero.episode is the known ~1296px", sh["routes"]["/"]["sections"]["hero.episode"]["heightPx"] == 1296, "%dpx" % sh["routes"]["/"]["sections"]["hero.episode"]["heightPx"]))
    RESULTS.append(("height CONTROL: measured privacy page is the known 1835px", sh["routes"]["/privacy-policy/"]["pageHeightPx"] == 1835, "%dpx" % sh["routes"]["/privacy-policy/"]["pageHeightPx"]))
    f, w, n = gate_of(set_h("/", "hero.episode", 1801, 9000))
    RESULTS.append(("height: HERO at 1801px warns (not a failure)", not f and any("1801" in m for m in w), "fails=%d warns=%d" % (len(f), len(w))))
    f, w, n = gate_of(set_h("/", "hero.episode", 1800, 9000))
    RESULTS.append(("height boundary: HERO exactly 1800px is fine", not f and not w, "fails=%d warns=%d" % (len(f), len(w))))
    f, w, n = gate_of(set_h("/", "hero.episode", 3000, 12000))
    RESULTS.append(("height boundary: HERO exactly 3000px warns but does not fail", not f and any("3000" in m for m in w), "fails=%d warns=%d" % (len(f), len(w))))
    f, w, n = gate_of(set_h("/", "hero.episode", 3001, 12000))
    RESULTS.append(("height: HERO at 3001px FAILS (whole-page wrapper)", any("whole-page wrapper" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = gate_of(set_h("/privacy-policy/", "legal.header", 2500, 4200))
    RESULTS.append(("height: a NON-hero section at 2500px does not trip the HERO line (category-keyed, not size-only)", not any("HERO" in m for m in f + w), "fails=%d warns=%d" % (len(f), len(w))))
    cs = copy.deepcopy(contracts)
    cs["usecases.stage"]["semantic"]["category"] = "HERO"
    f, w, n = gate_of(set_h("/", "usecases.stage", 3500, 11000), cs=cs)
    RESULTS.append(("height: gate keys on semantic.category (usecases.stage re-filed as HERO at 3500px fails)", any("usecases.stage" in m and "whole-page wrapper" in m for m in f), "rejected" if f else "NOT REJECTED"))
    wl_ok = {"gate": "height-fail", "route": "/", "section": "hero.episode", "allowedUpToPx": 4000,
             "justification": "Reviewed: this fixture is a deliberately long single-scene hero with an embedded product walkthrough that cannot be split.",
             "reviewedBy": "test reviewer", "reviewedOn": "2026-10-22"}
    g = copy.deepcopy(gate)
    g["whitelist"].append(wl_ok)
    f, w, n = gate_of(set_h("/", "hero.episode", 3500, 12000), g=g)
    RESULTS.append(("height: HERO 3500px WITH a reviewed whitelist entry passes (as a warning)", not f and any("whitelist" in m for m in w), "fails=%s" % f))
    g = copy.deepcopy(g)
    g["whitelist"][-1]["allowedUpToPx"] = 3200
    f, w, n = gate_of(set_h("/", "hero.episode", 3500, 12000), g=g)
    RESULTS.append(("height: whitelisted HERO exceeding its own cap (3500 > 3200) still fails", any("cap" in m for m in f), "rejected" if f else "NOT REJECTED"))
    for name, fn in (("empty justification", lambda e: e.__setitem__("justification", "")),
                     ("no reviewer", lambda e: e.__setitem__("reviewedBy", "")),
                     ("no review date", lambda e: e.pop("reviewedOn")),
                     ("no cap on a height-fail entry", lambda e: e.pop("allowedUpToPx")),
                     ("unknown section", lambda e: e.__setitem__("section", "hero.main")),
                     ("unknown route", lambda e: e.__setitem__("route", "/nope/")),
                     ("unknown gate", lambda e: e.__setitem__("gate", "always"))):
        g = copy.deepcopy(gate)
        e = copy.deepcopy(wl_ok)
        fn(e)
        g["whitelist"].append(e)
        f, w, n = gate_of(set_h("/", "hero.episode", 3500, 12000), g=g)
        RESULTS.append(("height: whitelist entry with %s is rejected" % name, bool(f) and any("whitelist" in m for m in f), "rejected" if f else "NOT REJECTED"))
    g = copy.deepcopy(gate)
    g["whitelist"].append(wl_ok)
    f, w, n = gate_of(g=g)
    RESULTS.append(("height: stale whitelist entry (hero is 1296px, entry not needed) is rejected", any("stale" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = gate_of(g={"whitelist": []})
    RESULTS.append(("height: removing the legal.body majority whitelist turns it into a warning (privacy + terms)", not f and len([m for m in w if "legal.body" in m]) == 2, "fails=%d warns=%s" % (len(f), w)))
    f, w, n = gate_of(set_h("/", "integrations.grid", 9000, 6551 + 9000))
    RESULTS.append(("height: one section holding the majority of a page (58% of /) warns", any("integrations.grid" in m and "majority" in m for m in w) and not f, "fails=%s warns=%s" % (f, w)))
    f, w, n = gate_of(lambda h: h["routes"]["/"]["sections"].pop("csr.loop"))
    RESULTS.append(("height: an in-flow section with no measured height fails", any("csr.loop" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = gate_of(lambda h: h["routes"].pop("/terms-of-service/"))
    RESULTS.append(("height: a route with no measurement fails", any("/terms-of-service/" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = gate_of(lambda h: h["viewport"].__setitem__("width", 1280))
    RESULTS.append(("height: measurements not taken at 1440px are rejected", any("1440" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = gate_of(set_h("/", "closing.cta", 9000))
    RESULTS.append(("height: section heights summing to more than the page are rejected as not credible", any("not credible" in m for m in f), "rejected" if f else "NOT REJECTED"))
    f, w, n = verify_all.evaluate_height_gate(contracts, templates, None, gate)
    RESULTS.append(("height: no sectionHeights record at all fails", bool(f), "rejected"))


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
