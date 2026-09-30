#!/usr/bin/env python3
"""Mechanical validation script for Art Department Refresh 2026."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE_SUMS = ROOT / "art_department/ships/art_ship_015/FROZEN_CORPUS_SHA256SUMS.txt"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_sums(path: Path):
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            digest, rel = line.split("  ", 1)
            rows.append((digest, rel.strip()))
    return rows


def main():
    print("=== ART DEPARTMENT REFRESH 2026 VALIDATION ===")
    checks = {}

    # 1. Baseline frozen corpus verification (411/411 unchanged)
    baseline = parse_sums(BASE_SUMS)
    baseline_failures = []
    for digest, rel in baseline:
        p = ROOT / rel
        if not p.is_file():
            baseline_failures.append((rel, "MISSING"))
        else:
            actual = sha(p)
            if actual != digest:
                baseline_failures.append((rel, f"MISMATCH expected {digest} got {actual}"))
    checks["baseline_frozen_411"] = {
        "expected": 411,
        "passed": len(baseline) - len(baseline_failures),
        "failures": baseline_failures,
        "pass": len(baseline) == 411 and not baseline_failures
    }
    print(f"1. Baseline Frozen Corpus (411/411): {'PASS' if checks['baseline_frozen_411']['pass'] else 'FAIL'}")

    # 2. Visual Lane A Gbenga and Carlos Assets Integrity
    va_assets = {
        "assets/before_the_fame/characters/gbenga/gbenga_neutral_anchor_v2.png": ("bc5ff4f88aaad76e8bbbfb7d94732e803df42fb4b0ae543051147cc86b5e85fa", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/gbenga_voice_note_v2.png": ("0f49ce216877cf86c70573248e267d8f4cf6a399be806a245b8b3b6ba3fd89d2", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/gbenga_my_son_v2.png": ("7a011b274aff404a089d7b52c3e1828b99de662961b290d2772cc6ba96438919", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/gbenga_adjusting_sleeves_v2.png": ("90c86f703ae4bcd489fb90cca61b705276c5174d03e4b0ede08d1d9f68b5cd24", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/gbenga_golden_draco_v2.png": ("cee0bc1277d506ecfa39899188f5c9c4f2ced068a86302f4b8e1a753f7344506", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/gbenga_defeated_v2.png": ("d3b0809b2193be62d37399ee1661b20ef5eecd8a3097204cea837500a640006b", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_neutral_anchor_80x96_v2.png": ("5712c83be09c601ed68dc27e6cd49c88831a80d27f7e3424ac711afef6756bb8", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_voice_note_80x96_v2.png": ("df568c0d2a9af65af1a4ad24a48d2bc383c33995dee441f5f8ce1bfd5cb13e62", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_my_son_80x96_v2.png": ("7e89772cbeb33c7fde1545312c3f4d83ca898dc2cd2548b8dcce09a504e32002", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_adjusting_sleeves_80x96_v2.png": ("3c299fbdb15d6ad113c62b429ebec05b50d278f9a1402e7b8ed5bf53a63a4f8e", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_golden_draco_80x96_v2.png": ("a71f7152df6b893ffeeef32d2726d20595eb3d50f1a6e6ffe63c2f9580c092b3", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_defeated_80x96_v2.png": ("1518fbc468f69bf8d774e74dde350ebdaa9421f84b01e64a72d5c6210c9f0807", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/gbenga/superseded/gbenga_neutral_anchor_v1.png": ("1d45bc40b78ed2b6d22ec2aacb7451fe1156e8f65226a12dd07e4c40466b5a06", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/gbenga/superseded/gbenga_neutral_anchor_80x96_review_v1.png": ("6317206eb9085954b7a5914b13781c66d01c926074028ae24aaffc4d199d62ee", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/carlos/carlos_neutral_happy_anchor_v1.png": ("c816904ad7718c7fefcbeb32123b19b35974d8d964dca7097749518e768e507d", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/carlos/carlos_betrayed_v1.png": ("11c8ae83b951e9c03bad0ebc77761135173b98af23985c8a61e2a908eb8257a9", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/carlos/carlos_canopy_apron_v1.png": ("88d2a67d528d28fb7ffb5878af219460da28e4cd2607ff34d46d511f00009174", (1145, 1374), "RGBA"),
        "assets/before_the_fame/characters/carlos/runtime_80x96/carlos_neutral_happy_anchor_80x96_review_v1.png": ("6ea034ef7ee96697ad6a0e7b473f1843adfe5d8127adbd08ea063100e78335ca", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/carlos/runtime_80x96/carlos_betrayed_80x96_review_v1.png": ("46e325b2102811469898a9c5cd4d2c9c84dd4aff01058accf0294da51a588b14", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/carlos/runtime_80x96/carlos_canopy_apron_80x96_review_v1.png": ("edf2bb23b9d235edf07588032fa6480017083b470d841e7e355691d6eb36388a", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/big_bing/cga_f2_031/big_bing_neutral_anchor_80x96_v1.png": ("a133f44b9cd4c232cda4b6d779ce295da64a18dc9cdf671bc7f2531087e90ccd", (80, 96), "RGBA"),
        "assets/before_the_fame/characters/granny_bing/cga_f2_032/granny_bing_neutral_calling_numbers_anchor_80x96_v1.png": ("6f042de972f6fe7fa89178095829ac44e96650cf7b067ad0004f2ca208ddf4ee", (80, 96), "RGBA"),
    }
    va_failures = []
    for rel, (expected_sha, expected_dims, expected_mode) in va_assets.items():
        p = ROOT / rel
        if not p.is_file():
            va_failures.append((rel, "MISSING"))
        else:
            actual_sha = sha(p)
            with Image.open(p) as img:
                dims = img.size
                mode = img.mode
            if actual_sha != expected_sha or dims != expected_dims or mode != expected_mode:
                va_failures.append((rel, f"PROPERTIES MISMATCH: sha={actual_sha == expected_sha}, dims={dims == expected_dims}, mode={mode == expected_mode}"))
    checks["va_assets_ingested"] = {
        "expected": len(va_assets),
        "passed": len(va_assets) - len(va_failures),
        "failures": va_failures,
        "pass": len(va_failures) == 0
    }
    print(f"2. Visual Lane A Ingested Assets (22/22): {'PASS' if checks['va_assets_ingested']['pass'] else 'FAIL'}")

    # 3. Asset register integrity and frozen count
    reg = json.loads((ROOT / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    reg_assets = reg["assets"]
    frozen_reg = [x for x in reg_assets if x.get("status") == "FROZEN"]
    frozen_failures = []
    for item in frozen_reg:
        p = ROOT / item["path"]
        if not p.is_file():
            frozen_failures.append((item["path"], "FILE MISSING"))
        elif sha(p) != item["sha256"]:
            frozen_failures.append((item["path"], f"HASH MISMATCH: expected {item['sha256']} got {sha(p)}"))

    all_exist = [x["path"] for x in reg_assets if not (ROOT / x["path"]).is_file()]
    checks["asset_register_integrity"] = {
        "total_entries": len(reg_assets),
        "expected_entries": 573,
        "frozen_count": len(frozen_reg),
        "expected_frozen": 431,
        "frozen_failures": frozen_failures,
        "missing_files": all_exist,
        "pass": len(reg_assets) == 573 and len(frozen_reg) == 431 and len(frozen_failures) == 0 and len(all_exist) == 0
    }
    print(f"3. Asset Register Integrity (573 entries, 431 frozen verified): {'PASS' if checks['asset_register_integrity']['pass'] else 'FAIL'}")


    # 4. Onboarding file chain existence
    onboarding_files = [
        "art_department/START_HERE.md",
        "art_department/ART_SYSTEM.md",
        "art_department/CURRENT_HANDOFF.md",
        "art_department/STYLE_FINGERPRINT.md",
        "art_department/APPROVED_ASSET_INDEX.md",
        "art_department/ASSET_REGISTER.json",
        "art_department/APPROVAL_LEDGER.md",
        "art_department/CURRENT_OPEN_ART_GAPS.md",
        "art_department/CURRENT_OPEN_ART_GAPS.json",
        "art_department/production_authority/README.md",
        "art_department/production_authority/OVERLORD_OL012_VISUAL_A_OPEN_AUTHORITY.md",
        "art_department/production_authority/UBE_PORTAL_VISUAL_LANE_A_PRODUCTION_LEDGER.md",
        "art_department/production_authority/VOL2_CHARACTER_VISUAL_BIBLE_OPEN.md",
        "art_department/production_authority/VOL5_OPEN_VISUAL_ADDITIONS.md",
        "art_department/production_authority/HQ_PRODUCTION_ADDENDUM_OPEN_ART.md"
    ]
    onboarding_missing = [f for f in onboarding_files if not (ROOT / f).is_file()]
    checks["onboarding_files"] = {
        "expected": len(onboarding_files),
        "missing": onboarding_missing,
        "pass": len(onboarding_missing) == 0
    }
    print(f"4. Onboarding File Chain (15/15): {'PASS' if checks['onboarding_files']['pass'] else 'FAIL'}")

    # 5. Check no runtime code changes
    status = subprocess.run(["git", "status", "--short"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines()
    runtime_exts = {".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".scss", ".wasm"}
    runtime_changes = []
    for line in status:
        rel = line[3:].strip().replace("\\", "/")
        if " -> " in rel:
            rel = rel.split(" -> ", 1)[1]
        if Path(rel).suffix.lower() in runtime_exts and not rel.startswith("art_department/"):
            runtime_changes.append(rel)
    checks["no_runtime_changes"] = {
        "runtime_changes": runtime_changes,
        "pass": len(runtime_changes) == 0
    }
    print(f"5. Zero Runtime Code Changes: {'PASS' if checks['no_runtime_changes']['pass'] else 'FAIL'}")

    # Summary
    all_pass = all(v["pass"] for v in checks.values())
    print("\nOVERALL STATUS:", "PASS" if all_pass else "FAIL")
    if not all_pass:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
