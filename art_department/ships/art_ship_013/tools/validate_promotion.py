from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department/ships/art_ship_013"
CANDIDATE_COMMIT = "eec5c40c45a40dd842ded38f9b87063d67965d3c"
ORIGINAL_PATH = "assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png"
ORIGINAL_HASH = "c260180a4b3636fc2765534e0053abd1cab25b2ca2c43c83f800e6b55ee20696"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(commit: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)


def fail(message: str) -> None:
    raise AssertionError(message)


evidence = json.loads((SHIP / "PROMOTION_EVIDENCE.json").read_text(encoding="utf-8"))
register = json.loads((ROOT / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
assets_by_path = {entry["path"]: entry for entry in register["assets"]}
results = []

for asset in evidence["assets"]:
    candidate_path = asset["candidate"]
    production_path = asset["production"]
    expected = asset["sha256"]
    committed = git_bytes(CANDIDATE_COMMIT, candidate_path)
    candidate = (ROOT / candidate_path).read_bytes()
    production = (ROOT / production_path).read_bytes()
    hashes = {sha(committed), sha(candidate), sha(production), expected}
    if len(hashes) != 1 or committed != candidate or candidate != production:
        fail(f"exact-byte promotion mismatch: {asset['id']}")
    with Image.open(ROOT / production_path) as image:
        if image.size != (80, 96) or image.mode != "RGBA":
            fail(f"native contract mismatch: {production_path}")
        alpha = image.getchannel("A")
        alpha_values = sorted(set(alpha.getdata()))
        bbox = alpha.getbbox()
        if alpha_values != [0, 255] or not bbox or bbox[3] - 1 != 88:
            fail(f"alpha/contact mismatch: {production_path}")
    entry = assets_by_path.get(production_path)
    if not entry or entry.get("sha256") != expected or entry.get("status") != "FROZEN":
        fail(f"register mismatch: {production_path}")
    results.append({"id": asset["id"], "production": production_path, "sha256": expected, "exact_bytes": True, "dimensions": [80, 96], "mode": "RGBA", "alpha": [0, 255], "contact": [40, 88]})

original = (ROOT / ORIGINAL_PATH).read_bytes()
if sha(original) != ORIGINAL_HASH:
    fail("original hookah source changed")
original_entry = assets_by_path.get(ORIGINAL_PATH)
if not original_entry or original_entry.get("status") != "FROZEN" or original_entry.get("superseded_by") != "assets/before_the_fame/characters/rich/rich_hookah_seated_corrected_80x96.png":
    fail("original hookah preservation metadata missing")

frozen = [entry for entry in register["assets"] if entry.get("status") == "FROZEN"]
if len(register["assets"]) != 359 or len(frozen) != 219:
    fail(f"unexpected totals: register={len(register['assets'])}, frozen={len(frozen)}")
frozen_lines = []
for entry in frozen:
    path = entry["path"]
    actual = sha((ROOT / path).read_bytes())
    if actual != entry["sha256"]:
        fail(f"frozen corpus mismatch: {path}")
    frozen_lines.append(f"{actual}  {path}")

for path in ROOT.glob("art_department/ships/art_ship_013/*.json"):
    json.loads(path.read_text(encoding="utf-8"))
json.loads((ROOT / "art_department/CURRENT_OPEN_ART_GAPS.json").read_text(encoding="utf-8"))

changed = subprocess.check_output(["git", "diff", "--name-only", CANDIDATE_COMMIT], cwd=ROOT, text=True).splitlines()
allowed_assets = {asset["production"] for asset in evidence["assets"]}
for path in changed:
    if path.startswith("art_department/ships/art_ship_012/"):
        fail(f"ART SHIP 012 changed: {path}")
    if path.startswith("assets/") and path not in allowed_assets:
        fail(f"unexpected asset change: {path}")
    if not (path.startswith("art_department/") or path in allowed_assets):
        fail(f"out-of-scope change: {path}")
    if Path(path).suffix.lower() in {".js", ".jsx", ".ts", ".tsx", ".css", ".html"}:
        fail(f"runtime/gameplay file changed: {path}")

start = (ROOT / "art_department/START_HERE.md").read_text(encoding="utf-8")
handoff = (ROOT / "art_department/CURRENT_HANDOFF.md").read_text(encoding="utf-8")
for needle in ["219 assets", "359 entries", "108 PASS / 13 HOLD", "APPROVED MASTER / FROZEN / COMPLETE"]:
    if needle not in start and needle not in handoff:
        fail(f"cold-start authority missing: {needle}")
required = [
    "art_department/ART_SYSTEM.md",
    "art_department/CURRENT_HANDOFF.md",
    "art_department/CURRENT_OPEN_ART_GAPS.md",
    "art_department/CURRENT_OPEN_ART_GAPS.json",
    "art_department/APPROVED_ASSET_INDEX.md",
    "art_department/APPROVAL_LEDGER.md",
    "art_department/ships/art_ship_013/HQ_DECISION.md",
    "art_department/ships/art_ship_013/PROMOTION_EVIDENCE.json",
]
for path in required:
    if not (ROOT / path).is_file():
        fail(f"cold-start required record missing: {path}")

(SHIP / "FROZEN_CORPUS_SHA256SUMS.txt").write_text("\n".join(frozen_lines) + "\n", encoding="utf-8")
(SHIP / "PROMOTED_SHA256SUMS.txt").write_text("\n".join(f"{item['sha256']}  {item['production']}" for item in results) + "\n", encoding="utf-8")
report = {
    "ship_id": "ART SHIP 013",
    "status": "PASS — APPROVED MASTER / FROZEN / COMPLETE",
    "accepted_candidate_commit": CANDIDATE_COMMIT,
    "exact_byte_promotions": results,
    "exact_byte_pass": True,
    "original_hookah_preserved": {"path": ORIGINAL_PATH, "sha256": ORIGINAL_HASH, "pass": True},
    "frozen_corpus": {"verified": len(frozen), "expected": 219, "pass": True},
    "register": {"entries": len(register["assets"]), "expected": 359, "pass": True},
    "cold_start_onboarding": {"pass": True, "required_records": required},
    "runtime_authority": {"branch": "claude/hold-clearance-001", "commit": "a66170218375e52404715789dde48c23726a6044", "pass": 108, "hold": 13, "changed_by_ship": False},
    "scope": {"changed_paths": changed, "runtime_gameplay_files_changed": False, "art_ship_012_touched": False, "pass": True},
}
(SHIP / "PROMOTION_VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"status": "PASS", "promoted": len(results), "frozen_verified": len(frozen), "register_entries": len(register["assets"]), "cold_start": "PASS", "scope": "PASS"}, indent=2))
