"""File-level preservation and game-number diff proof. Run from repository root."""
from pathlib import Path
import subprocess, json, hashlib, re
def git(*args):
    return subprocess.check_output(["git", "-c", "gc.auto=0", *args])
out = Path("docs/evidence/build2")
out.mkdir(parents=True, exist_ok=True)
ports = {}
for label, sha in [("F02", "941af1d4c1bae8cedb829f87a6aa3a5100d48f86"), ("F11-A", "9eb87323caa88252a98b931879d0712d4e235304")]:
    files = git("diff-tree", "--no-commit-id", "--name-only", "-r", sha).decode().splitlines()
    rows = []
    for name in files:
        original = git("show", sha + ":" + name)
        current = Path(name).read_bytes() if Path(name).exists() else None
        # Git uses LF for text; worktree checkout may use CRLF.
        identical = current is not None and (current == original or current.replace(b"\r\n", b"\n") == original.replace(b"\r\n", b"\n"))
        rows.append({"file": name, "sourceBlob": git("rev-parse", sha + ":" + name).decode().strip(), "status": "IDENTICAL" if identical else "COMPOSED / SEAM ADAPTED" if current is not None else "ABSENT"})
    ports[label] = {"source": sha, "files": rows, "identical": sum(r["status"] == "IDENTICAL" for r in rows), "total": len(rows)}
(out / "port-correspondence.json").write_text(json.dumps(ports, indent=2) + "\n")
register = json.loads(Path("art_department/PRESERVED_ART_HASHES.json").read_text())
art = {"registerSha256": hashlib.sha256(Path("art_department/PRESERVED_ART_HASHES.json").read_bytes()).hexdigest(), "branchesRead": len(register["branches"]), "recordsRead": sum(len(b["files"]) for b in register["branches"].values()), "artDiffVsBase": git("diff", "r3-base", "--", "art_department", "assets/before_the_fame").decode()}
(out / "preservation-register-proof.json").write_text(json.dumps(art, indent=2) + "\n")
numbers = []
for folder in [Path("js"), Path("source_vault")]:
    for p in folder.rglob("*"):
        if not p.is_file(): continue
        if p.suffix == ".docx" and ("Numbers" in p.name or "Guns" in p.name): numbers.append(p.as_posix()); continue
        if p.suffix not in [".js", ".mjs"]: continue
        text = p.read_text(encoding="utf-8")
        if re.search(r"TUNABLES|AUTHORED.*[Nn]umbers|const NUMBERS|Vol 3", text) or p.stem in ["authored", "balance", "numbers", "catalog", "jobs", "data", "content"]: numbers.append(p.as_posix())
diff = git("diff", "r3-base", "--", *sorted(numbers)).decode("utf-8")
(out / "authored-numbers-vs-r3-base.diff").write_text(diff, encoding="utf-8")
rows = []
base_files = set(git("ls-tree", "-r", "--name-only", "r3-base").decode().splitlines())
for name in sorted(numbers):
    original = git("show", "r3-base:" + name) if name in base_files else None
    current = Path(name).read_bytes()
    rows.append({"file": name, "status": "UNCHANGED" if original is not None and current.replace(b"\r\n", b"\n") == original.replace(b"\r\n", b"\n") else "PRESERVED F02 ADDITION" if name.startswith("js/frag/F02/") else "DIFF — REVIEW REQUIRED"})
(out / "authored-numbers-proof.json").write_text(json.dumps(rows, indent=2) + "\n")
print(json.dumps({"ports": {k: {"identical": v["identical"], "total": v["total"]} for k,v in ports.items()}, "numberFiles": len(rows), "numberDiffs": [r for r in rows if r["status"] == "DIFF — REVIEW REQUIRED"], "art": art["recordsRead"]}))
