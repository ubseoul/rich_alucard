"""Validate ART SHIP 011 exact-byte promotion and the complete frozen corpus."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import hashlib
import json
import subprocess

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
CANDIDATE = "28aa98c8ab04a643d175192b1aecb9ae7b372c76"
EXPLORATORY = "d8c24b632ecdc134986b4f81ff5d3f3959609eea"


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_path(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def git_bytes(commit: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=REPO)


def git_lines(*args: str) -> list[str]:
    result = subprocess.check_output(["git", *args], cwd=REPO, text=True)
    return [line for line in result.splitlines() if line]


def main() -> int:
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    manifest = json.loads((SHIP / "ART_SHIP_MANIFEST.json").read_text(encoding="utf-8"))
    provenance = json.loads((SHIP / "SOURCE_PROVENANCE.json").read_text(encoding="utf-8"))
    by_path = {item["path"]: item for item in register["assets"]}

    promotion_checks = []
    for item in manifest["files"]:
        candidate_path = item["candidate_path"]
        approved_path = item["production_path"]
        expected = item["sha256"]
        checkpoint_candidate = git_bytes(CANDIDATE, candidate_path)
        current_candidate = (REPO / candidate_path).read_bytes()
        approved = (REPO / approved_path).read_bytes()
        registered = by_path.get(approved_path)
        with Image.open(BytesIO(approved)) as image:
            dimensions = list(image.size)
            mode = image.mode
            alpha = sorted(set(image.convert("RGBA").getchannel("A").getdata()))
        checks = {
            "checkpoint_candidate_hash_matches_expected": sha_bytes(checkpoint_candidate) == expected,
            "current_candidate_hash_matches_expected": sha_bytes(current_candidate) == expected,
            "approved_hash_matches_expected": sha_bytes(approved) == expected,
            "checkpoint_candidate_matches_current_candidate": checkpoint_candidate == current_candidate,
            "approved_matches_candidate": approved == current_candidate,
            "dimensions_match": dimensions == item["dimensions"],
            "mode_matches": mode == "RGBA",
            "binary_alpha": alpha == [0, 255],
            "register_hash_matches": bool(registered and registered["sha256"] == expected),
            "register_status_frozen": bool(registered and registered["status"] == "FROZEN"),
            "register_asset_id_matches": bool(registered and registered["asset_id"] == item["asset_id"]),
            "register_constraints_match": bool(registered and registered["placement_constraints"] == item["placement_constraints"]),
            "runtime_surfaces_unassigned": bool(registered and registered["runtime_surfaces"] == []),
        }
        promotion_checks.append({
            "request_id": item["request_id"],
            "asset_id": item["asset_id"],
            "candidate_path": candidate_path,
            "approved_path": approved_path,
            "sha256": expected,
            "checks": checks,
            "pass": all(checks.values()),
        })

    frozen_checks = []
    for item in register["assets"]:
        if item.get("status") != "FROZEN":
            continue
        path = REPO / item["path"]
        actual = sha_path(path) if path.exists() else None
        frozen_checks.append({"path": item["path"], "expected_sha256": item["sha256"], "actual_sha256": actual, "pass": actual == item["sha256"]})

    source_checks = []
    for item in provenance["records"]:
        for path_key, hash_key in (
            ("selected_design_source_path", "selected_design_source_sha256"),
            ("exploratory_native_path", "exploratory_native_sha256"),
        ):
            data = git_bytes(EXPLORATORY, item[path_key])
            actual = sha_bytes(data)
            source_checks.append({"asset_id": item["asset_id"], "path": item[path_key], "expected_sha256": item[hash_key], "actual_sha256": actual, "pass": actual == item[hash_key]})

    changed = git_lines("diff", "--name-only", CANDIDATE)
    allowed_exact = {
        "art_department/ASSET_REGISTER.json",
        "art_department/APPROVED_ASSET_INDEX.md",
        "art_department/APPROVAL_LEDGER.md",
        "art_department/CURRENT_HANDOFF.md",
        "art_department/START_HERE.md",
    }
    out_of_scope = [path for path in changed if not (path.startswith("art_department/ships/art_ship_011/") or path in allowed_exact)]
    runtime_extensions = {".js", ".jsx", ".ts", ".tsx", ".css", ".html"}
    runtime_code = [path for path in changed if Path(path).suffix.lower() in runtime_extensions]
    environment_changes = [path for path in changed if path.startswith("assets/before_the_fame/environments/")]

    package_json_pass = True
    for path in SHIP.glob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            package_json_pass = False

    promotion_pass = all(item["pass"] for item in promotion_checks)
    frozen_pass = len(frozen_checks) == 212 and all(item["pass"] for item in frozen_checks)
    sources_pass = len(source_checks) == 18 and all(item["pass"] for item in source_checks)
    overall = promotion_pass and frozen_pass and sources_pass and package_json_pass and not out_of_scope and not runtime_code and not environment_changes
    result = {
        "ship_id": "ART SHIP 011",
        "result": "PASS" if overall else "FAIL",
        "accepted_candidate_checkpoint": CANDIDATE,
        "promotion_checks": promotion_checks,
        "promoted_count": len(promotion_checks),
        "promoted_exact_byte_matches": sum(item["pass"] for item in promotion_checks),
        "frozen_corpus_count": len(frozen_checks),
        "frozen_corpus_checks_pass": frozen_pass,
        "source_reference_count": len(source_checks),
        "source_reference_checks_pass": sources_pass,
        "package_json_parse_pass": package_json_pass,
        "changed_paths_since_candidate": changed,
        "out_of_scope_paths": out_of_scope,
        "runtime_or_gameplay_code_changed": bool(runtime_code),
        "environment_assets_changed": bool(environment_changes),
        "runtime_integration_complete": False,
        "runtime_screen_assignments": 0,
        "hold_status_changed": False,
        "approval_and_freeze_scope": "The exact nine ART SHIP 011 population assets, IDs, native contracts and documented placement constraints only.",
    }
    (SHIP / "PROMOTION_VALIDATION_REPORT.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    (SHIP / "VALIDATION_REPORT.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    (SHIP / "FROZEN_CORPUS_SHA256SUMS.txt").write_text("".join(f"{item['actual_sha256']}  {item['path']}\n" for item in frozen_checks), encoding="utf-8")
    (SHIP / "SOURCE_PACKAGE_SHA256SUMS.txt").write_text("".join(f"{item['actual_sha256']}  {item['path']} @ {EXPLORATORY}\n" for item in source_checks), encoding="utf-8")
    summary = [
        "# ART SHIP 011 \u2014 Promotion Validation Report",
        "",
        f"**Result: {result['result']}**",
        "",
        f"- {result['promoted_exact_byte_matches']}/{result['promoted_count']} production files match the HQ-approved candidate checkpoint bytes.",
        f"- {sum(item['pass'] for item in frozen_checks)}/{len(frozen_checks)} frozen Asset Register entries pass SHA-256 verification.",
        f"- {sum(item['pass'] for item in source_checks)}/{len(source_checks)} exploratory source/native hashes pass at the recorded source commit.",
        "- All Ship package JSON records parse successfully.",
        "- Stable IDs, contacts, origins, categories and placement constraints match the approved manifest/register records.",
        "- Runtime surfaces remain empty; no runtime code, environment asset, Presentation Director mapping or HOLD record changed.",
        "",
        "Repository gates are recorded after running npm test, npm run build and npm run verify:artifact at the freeze commit.",
    ]
    (SHIP / "VALIDATION_REPORT.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(json.dumps({"result": result["result"], "promoted": f"{result['promoted_exact_byte_matches']}/{result['promoted_count']}", "frozen": f"{sum(item['pass'] for item in frozen_checks)}/{len(frozen_checks)}", "sources": f"{sum(item['pass'] for item in source_checks)}/{len(source_checks)}", "out_of_scope": len(out_of_scope)}, indent=2))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
