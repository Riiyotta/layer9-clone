#!/usr/bin/env python3
"""prove_drift.py: prove that verify_all.py actually catches drift (BUILD-GUIDE 2.7).

For each case it copies this repo into a SCRATCH folder you name, injects one specific piece of
bad data, runs that copy's extraction/verify_all.py, and requires it to FAIL with the expected
message. It also runs the pristine copy (must PASS), with and without a source tree.
Nothing outside the scratch folder is modified.

Usage:  python3 extraction/prove_drift.py --scratch DIR [--source PROJECT_ROOT]
  DIR            empty or new folder for the scratch copies (required; never inside the repo)
  PROJECT_ROOT   folder holding src/, recon/, CLONE_SPEC.md, package.json. Defaults to the
                 parent of the repo when it looks like one. Without it the citation/pin cases
                 are SKIPPED (verify_all.py degrades those checks to WARN, so they cannot fail).
Exit 0 only if every injected case was rejected and the pristine runs pass.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PY = sys.executable


def jload(p):
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def jdump(p, o):
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(o, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def copy_repo(dst):
    shutil.copytree(REPO, dst, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".DS_Store"))


def run_verify(repo_copy, source):
    cmd = [PY, os.path.join(repo_copy, "extraction", "verify_all.py"), "--repo", repo_copy]
    if source:
        cmd += ["--source", source]
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True, env=env)
    return p.returncode, p.stdout


def first_citation(doc_path):
    d = jload(doc_path)
    pat = re.compile(r"^(src/[A-Za-z0-9_./\-]+\.(?:js|jsx|css)):(\d+)$")
    found = []

    def walk(n):
        if isinstance(n, str) and pat.match(n):
            found.append(n)
        elif isinstance(n, list):
            for x in n:
                walk(x)
        elif isinstance(n, dict):
            for v in n.values():
                walk(v)
    walk(d)
    return found[0] if found else None


def replace_everywhere(root, old, new):
    n = 0
    for dp, dn, fn in os.walk(root):
        for f in fn:
            if f.endswith(".json"):
                p = os.path.join(dp, f)
                with open(p, encoding="utf-8") as fh:
                    t = fh.read()
                if old in t:
                    with open(p, "w", encoding="utf-8") as fh:
                        fh.write(t.replace(old, new))
                    n += t.count(old)
    return n


# ------------------------------------------------------------------ mutations (each takes the copy root)
def m_phantom(r):
    p = os.path.join(r, "tokens/llm/component-allowlist.json")
    d = jload(p)
    d["components"].append("phantom-widget")
    jdump(p, d)


def m_orphan(r):
    p = os.path.join(r, "tokens/llm/component-allowlist.json")
    d = jload(p)
    d["primitives"].remove("pill")
    jdump(p, d)


def m_oob_citation(r):
    p = os.path.join(r, "sections/chrome.footer.json")
    c = first_citation(p)
    path, line = c.rsplit(":", 1)
    with open(p, encoding="utf-8") as fh:
        t = fh.read()
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(t.replace('"%s"' % c, '"%s:99999"' % path, 1))


def m_wrong_citation(r):
    c = first_citation(os.path.join(r, "tokens/00-foundation/color.json"))
    path, line = c.rsplit(":", 1)
    replace_everywhere(r, '"%s"' % c, '"%s:%d"' % (path, int(line) + 7))


def m_no_ledger(r):
    p = os.path.join(r, "extraction/measured-values.json")
    d = jload(p)
    d["citations"] = [e for e in d["citations"] if not e["citation"].startswith("src/components/Footer.jsx")]
    jdump(p, d)


def m_count(r):
    p = os.path.join(r, "registry.manifest.json")
    d = jload(p)
    d["counts"]["primitives"] += 1
    jdump(p, d)


def m_readme_count(r):
    p = os.path.join(r, "README.md")
    with open(p, encoding="utf-8") as fh:
        t = fh.read()
    t = re.sub(r'"sections": (\d+)', lambda m: '"sections": %d' % (int(m.group(1)) + 3), t, count=1)
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(t)


def m_role(r):
    p = os.path.join(r, "assets/asset-roles.json")
    d = jload(p)
    d["roles"]["form-submit-endpoint"]["generationPolicy"] = "may-generate-new"   # different but VALID
    jdump(p, d)


def m_allowlist_version(r):
    p = os.path.join(r, "registry.manifest.json")
    d = jload(p)
    d["allowlistVersion"] = "9.9.9"
    jdump(p, d)


def m_entry(r):
    p = os.path.join(r, "registry.manifest.json")
    d = jload(p)
    d["entryPoints"].append("../CLONE_SPEC.md")
    jdump(p, d)


def m_abs_path(r):
    with open(os.path.join(r, "README.md"), "a", encoding="utf-8") as fh:
        fh.write("\nsee " + "/Use" + "rs/someone/project\n")


def m_policy_category(r):
    p = os.path.join(r, "tokens/llm/token-policy.json")
    d = jload(p)
    d["rawValueRestrictions"]["typography"] = {"rule": "human label, not a catalogue key", "severity": "warn"}
    jdump(p, d)


def m_catalog_drift(r):
    p = os.path.join(r, "tokens/llm/token-catalog.json")
    d = jload(p)
    d["categories"]["color"]["tokenPaths"].pop()
    jdump(p, d)


def m_route_gap(r):
    p = os.path.join(r, "templates/templates.json")
    d = jload(p)
    d["routes"] = [x for x in d["routes"] if x["path"] != "/terms-of-service/"]
    jdump(p, d)


def m_doc_claim(r):
    with open(os.path.join(r, "README.md"), "a", encoding="utf-8") as fh:
        fh.write("\nThe drift proof also lives in " + "scripts/" + "prove_drift" + ".sh.\n")


def m_pin_token(r):
    p = os.path.join(r, "tokens/00-foundation/motion.json")
    d = jload(p)
    d["motion"]["library"]["framer-motion-pin"]["value"]["framer-motion"] = "12.43.0"
    jdump(p, d)


def m_rule_id(r):
    p = os.path.join(r, "compatibility/graph.json")
    d = jload(p)
    d["rules"].append({"id": "PHANTOM_RULE", "severity": "error", "appliesTo": "all", "description": "x", "exceptions": []})
    jdump(p, d)


def m_maxwords(r):
    p = os.path.join(r, "sections/closing.cta.json")
    d = jload(p)
    d["content"]["properties"]["title"]["maxWords"] += 5
    jdump(p, d)


def m_example_overflow(r):
    p = os.path.join(r, "schema/example.pagespec.json")
    d = jload(p)
    for n in d["nodes"]:
        if n["type"] == "closing.cta":
            n["content"]["title"] = " ".join(["word"] * 30)
    jdump(p, d)


def m_schema_enum(r):
    p = os.path.join(r, "schema/pagespec.schema.json")
    d = jload(p)
    d["definitions"]["assetRole"]["enum"].append("hero-photo")
    jdump(p, d)


def m_scroll(r):
    p = os.path.join(r, "sections/closing.cta.json")
    d = jload(p)
    d["motion"]["scrollLinked"] = True
    jdump(p, d)


CASES = [
    # (name, mutation, expected substring, needs_source)
    ("phantom allowlist entry (component with no contract file)", m_phantom, "phantom entry", False),
    ("orphan contract (primitive missing from the allowlist)", m_orphan, "orphan", False),
    ("out-of-range citation (Footer.jsx:99999)", m_oob_citation, "exceeds the file's real length", True),
    ("in-range but WRONG citation (line shifted by 7)", m_wrong_citation, "in range but WRONG content", True),
    ("citation with no ledger entry", m_no_ledger, "no ledger entry", False),
    ("wrong manifest count (primitives + 1)", m_count, "manifest.counts[primitives]", False),
    ("stale README count marker", m_readme_count, "README.md counts marker is stale", False),
    ("role policy changed to a different-but-VALID value (form-submit-endpoint -> may-generate-new)", m_role, "PINNED", False),
    ("allowlistVersion drift (manifest says 9.9.9)", m_allowlist_version, "allowlistVersion", False),
    ("entryPoint pointing outside the folder (../CLONE_SPEC.md)", m_entry, "outside design-repo", False),
    ("absolute machine path in README", m_abs_path, "absolute machine path", False),
    ("token-policy category that is not a catalogue key ('typography')", m_policy_category, "does not exist in token-catalog", False),
    ("token catalogue drifted from the token files", m_catalog_drift, "drifted from the token files", False),
    ("route map gap (terms route unmapped)", m_route_gap, "routes", False),
    ("docs claim a script that does not exist (a scripts/ shell file)", m_doc_claim, "does not exist", False),
    ("motion pin record changed (framer-motion 12.43.0)", m_pin_token, "pin", False),
    ("graph rule id with no validator implementation", m_rule_id, "RULES", False),
    ("section maxWords edited without regenerating the schema", m_maxwords, "x-maxWords tree differs", False),
    ("example overflows maxWords", m_example_overflow, "maxWords", False),
    ("schema assetRole enum gains an invented role", m_schema_enum, "assetRole enum", False),
    ("section claims scroll-linked motion", m_scroll, "scrollLinked", False),
]


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--scratch", required=True)
    ap.add_argument("--source", default=None)
    a = ap.parse_args(argv)
    scratch = os.path.abspath(a.scratch)
    if os.path.commonpath([scratch, REPO]) == REPO:
        print("refusing: --scratch must be outside the repo")
        return 2
    if os.path.exists(scratch) and os.listdir(scratch):
        print("refusing: --scratch must be empty or new")
        return 2
    os.makedirs(scratch, exist_ok=True)
    source = os.path.abspath(a.source) if a.source else os.path.dirname(REPO)
    if not (os.path.isdir(os.path.join(source, "src")) and os.path.isfile(os.path.join(source, "CLONE_SPEC.md"))):
        source = None
    print("source tree for citation/pin cases: %s" % (source or "ABSENT (those cases are skipped)"))
    failed = 0

    # pristine copies
    d0 = os.path.join(scratch, "pristine", "design-repo")
    copy_repo(d0)
    rc, out = run_verify(d0, source)
    ok = rc == 0
    print("%s  pristine copy (with source) -> exit %d" % ("PASS" if ok else "FAIL", rc))
    failed += 0 if ok else 1
    if not ok:
        print(out)
    rc, out = run_verify(d0, "/nonexistent-source-dir" if False else os.path.join(scratch, "no-source-here"))
    ok = rc == 0 and "ABSENT" in out
    print("%s  pristine copy with NO source tree -> exit %d, citation/pin checks WARN-and-skip" % ("PASS" if ok else "FAIL", rc))
    failed += 0 if ok else 1

    n = 0
    for name, fn, want, needs_src in CASES:
        if needs_src and not source:
            print("SKIP  %s (needs source tree)" % name)
            continue
        n += 1
        dst = os.path.join(scratch, "case%02d" % n, "design-repo")
        copy_repo(dst)
        fn(dst)
        rc, out = run_verify(dst, source)
        hit = want.lower() in out.lower()
        ok = rc == 1 and hit
        print("%s  %s -> exit %d, expected message %r %s" % ("PASS" if ok else "FAIL", name, rc, want, "found" if hit else "MISSING"))
        if not ok:
            failed += 1
            print(out[-1500:])
        shutil.rmtree(os.path.join(scratch, "case%02d" % n), ignore_errors=True)

    # source-side pin drift: a fake project whose package.json floats framer-motion
    if source:
        fake = os.path.join(scratch, "fake-source")
        os.makedirs(fake)
        for name in ("src", "recon", "CLONE_SPEC.md", "tailwind.config.js", "index.html"):
            if os.path.exists(os.path.join(source, name)):
                os.symlink(os.path.join(source, name), os.path.join(fake, name))
        pkg = jload(os.path.join(source, "package.json"))
        pkg["dependencies"]["framer-motion"] = "^12.42.2"
        jdump(os.path.join(fake, "package.json"), pkg)
        dst = os.path.join(scratch, "pincase", "design-repo")
        copy_repo(dst)
        rc, out = run_verify(dst, fake)
        ok = rc == 1 and "no longer pins" in out
        print("%s  source package.json floats framer-motion (^12.42.2) -> exit %d, 'no longer pins' %s" % ("PASS" if ok else "FAIL", rc, "found" if "no longer pins" in out else "MISSING"))
        failed += 0 if ok else 1
        pkg = jload(os.path.join(source, "package.json"))
        del pkg["overrides"]["motion-dom"]
        jdump(os.path.join(fake, "package.json"), pkg)
        rc, out = run_verify(dst, fake)
        ok = rc == 1 and "no longer pins" in out
        print("%s  source package.json drops the motion-dom override -> exit %d, 'no longer pins' %s" % ("PASS" if ok else "FAIL", rc, "found" if "no longer pins" in out else "MISSING"))
        failed += 0 if ok else 1

    print("")
    print("drift proof: %s (%d failure(s))" % ("ALL CASES REJECTED, PRISTINE PASSES" if not failed else "PROBLEMS FOUND", failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
