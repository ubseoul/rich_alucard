#!/usr/bin/env python3
"""Promote exact Ube/HQ-approved ART SHIP 015 bytes and close current Art records."""

from __future__ import annotations

import hashlib
import json
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department/ships/art_ship_015"
REGISTER = ROOT / "art_department/ASSET_REGISTER.json"
CANONICAL = ROOT / "assets/before_the_fame/art_ship_015/package_a"
BASE_COMMIT = "f1ae59a3f342a30fc09a3c4659198795ef867178"
RUNTIME_COMMIT = "a66170218375e52404715789dde48c23726a6044"

ITEMS = [
    ("A-family-brother1", "NEUTRAL", "A-family-brother1.png", "8ca1f2505a29b00df7629c5258921e58c820d1b97c3dd7bdb1df03bce56b71ef", [40, 88]),
    ("A-family-brother2", "NEUTRAL", "A-family-brother2.png", "9afe9279d0fcde25a7d24e9063ce73f0084ef7d3dd4b6c186b165164a271ec2d", [40, 88]),
    ("A-family-brother1-avatar", "FAMILY_THREAD_AVATAR", "A-family-brother1-avatar.png", "70f46469eba728c9aa9383654bfee46b722c2abe07cedfecc1dda65daf899d20", None),
    ("A-family-brother2-avatar", "FAMILY_THREAD_AVATAR", "A-family-brother2-avatar.png", "3bfa7ab316eb03c6913b9869ba5dbf666273036d1c9c659eb94861af78d82dc3", None),
    ("A-god", "SEATED_ON_CURB", "A-god-seated_on_curb.png", "f911276542fc4a6f0537d4f1972fc234dcce13f215a48626d1e5aca34a2b0923", [40, 88]),
    ("A-god", "FADING", "A-god-fading.png", "e22f2be9f041219959c9cf1ad81996de0551b21d5c525937b2b08209e3ec6ccf", [40, 88]),
    ("A-og-hooper", "NEUTRAL / COURT_READY", "A-og-hooper.png", "dfb70a4661b6768c468dcd5553a3dc49ddccbfc6a85a627a54e8f87601a90cc3", [40, 88]),
]

REQUIREMENTS = {
    "A-family-brother1": "Family neutral: brother1",
    "A-family-brother2": "Family neutral: brother2",
    "A-family-brother1-avatar": "Family phone avatar: brother1",
    "A-family-brother2-avatar": "Family phone avatar: brother2",
    "A-god": "God culturally sensitive card — SEATED_ON_CURB + FADING",
    "A-og-hooper": "OG Hooper identity — NEUTRAL / COURT_READY",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    qa = load(SHIP / "CANDIDATE_QA.json")
    assert qa["status"] == "CANDIDATE — READY FOR FINAL UBE/HQ TASTE PASS"
    qa_by_file = {x["file"]: x for x in qa["candidates"]}
    assert set(qa_by_file) == {x[2] for x in ITEMS}

    CANONICAL.mkdir(parents=True, exist_ok=True)
    promoted = []
    for asset_id, state, filename, expected, contact in ITEMS:
        candidate_rel = f"art_department/ships/art_ship_015/candidates/native/{filename}"
        production_rel = f"assets/before_the_fame/art_ship_015/package_a/{filename}"
        src, dst = ROOT / candidate_rel, ROOT / production_rel
        assert src.is_file() and sha(src) == expected
        assert qa_by_file[filename]["sha256"] == expected
        shutil.copyfile(src, dst)
        assert src.read_bytes() == dst.read_bytes()
        with Image.open(dst) as image:
            assert image.size == (80, 96) and image.mode == "RGBA"
            alpha_values = sorted(set(image.getchannel("A").getdata()))
            assert set(alpha_values).issubset({0, 255})
        promoted.append({
            "asset_id": asset_id,
            "requirement": REQUIREMENTS[asset_id],
            "state": state,
            "candidate_path": candidate_rel,
            "production_path": production_rel,
            "sha256": expected,
            "dimensions": [80, 96],
            "mode": "RGBA",
            "alpha": "binary 0/255",
            "contact": contact,
            "approval_status": "APPROVED MASTER / FROZEN",
            "runtime_integration_status": "PENDING ENGINEERING MAPPING/INTEGRATION/QA",
        })

    register = load(REGISTER)
    assert len(register["assets"]) == 544
    assert sum(x.get("status") == "FROZEN" for x in register["assets"]) == 404
    existing = {x["path"] for x in register["assets"]}
    for item in promoted:
        assert item["production_path"] not in existing
        register["assets"].append({
            "path": item["production_path"],
            "sha256": item["sha256"],
            "role": f"ART SHIP 015 approved {item['requirement']} — {item['state']}",
            "status": "FROZEN",
            "default_style_reference": True,
            "approval_evidence": [
                "ART SHIP 015 — UBE/HQ TASTE PASS: PASS",
                "ART SHIP 015 FINAL OPEN CANON BLOCKERS — PROMOTION / FREEZE authorization",
                "art_department/ships/art_ship_015/HQ_DECISION.md",
            ],
            "dimensions": item["dimensions"],
            "mode": item["mode"],
            "ship_id": "ART SHIP 015",
            "asset_id": item["asset_id"],
            "category": "CHARACTER_STATE_OR_VISUAL",
            "state": item["state"],
            "source_anchor": item["contact"],
            "alpha": item["alpha"],
            "approval_status": "APPROVED MASTER",
            "freeze_scope": "Exact Ube/HQ-approved ART SHIP 015 candidate byte stream for the submitted identity/state only; no additional canon, state, runtime mapping or placement is inferred.",
            "runtime_integration_status": item["runtime_integration_status"],
            "source_candidate": {"path": item["candidate_path"], "sha256": item["sha256"]},
        })
    assert len(register["assets"]) == 551
    assert sum(x.get("status") == "FROZEN" for x in register["assets"]) == 411
    write(REGISTER, register)

    ledger = load(ROOT / "art_department/ships/art_ship_014/FINAL_COMPLETION_LEDGER.json")
    by_requirement: dict[str, list[dict]] = {}
    for item in promoted:
        by_requirement.setdefault(item["asset_id"], []).append(item)
    changed = 0
    for row in ledger["requirements"]:
        if row["id"] not in by_requirement:
            continue
        assert row["status"] == "BLOCKED BY CANON"
        assets = by_requirement[row["id"]]
        row["status"] = "APPROVED MASTER / FROZEN"
        row["evidence_path"] = assets[0]["production_path"] if len(assets) == 1 else [x["production_path"] for x in assets]
        row["evidence_sha256"] = assets[0]["sha256"] if len(assets) == 1 else [x["sha256"] for x in assets]
        row["evidence_registry_status"] = "FROZEN"
        row["approval"] = "ART SHIP 015 — UBE/HQ TASTE PASS: PASS; exact-byte promotion"
        row["note"] = "Resolved by ART SHIP 015 final canon decision and exact approved candidate bytes."
        row["native_contract"] = "80x96 RGBA binary alpha; contact (40,88) where actor contact applies"
        changed += 1
    assert changed == 6
    ledger["schema_version"] = 4
    ledger["ship_015_resolution"] = {
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "resolved_requirement_count": 6,
        "approved_asset_count": 7,
        "manifest": "art_department/ships/art_ship_015/ART_SHIP_MANIFEST.json",
    }
    ledger["counts"] = dict(sorted(Counter(x["status"] for x in ledger["requirements"]).items()))
    assert ledger["counts"].get("BLOCKED BY CANON", 0) == 0
    assert ledger["counts"]["APPROVED MASTER / FROZEN"] == 186
    write(SHIP / "FINAL_COMPLETION_LEDGER.json", ledger)

    manifest = {
        "schema_version": 2,
        "ship": "ART SHIP 015",
        "title": "FINAL OPEN CANON BLOCKERS",
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "approval": "ART SHIP 015 — UBE/HQ TASTE PASS: PASS",
        "promotion_scope": "Art-only exact-byte promotion; runtime integration excluded",
        "base_art_commit": BASE_COMMIT,
        "runtime_authority_commit": RUNTIME_COMMIT,
        "accepted_assets": 7,
        "resolved_requirements": sorted(by_requirement),
        "resolved_requirement_count": 6,
        "frozen_corpus_before": 404,
        "frozen_corpus_after": 411,
        "asset_register_before": 544,
        "asset_register_after": 551,
        "ship_011_status": "separately frozen/unassigned and unchanged",
        "runtime_gameplay_changes": 0,
        "sealed_access": 0,
        "items": promoted,
    }
    write(SHIP / "ART_SHIP_MANIFEST.json", manifest)

    write(SHIP / "SOURCE_PROVENANCE.json", {
        "schema_version": 1,
        "ship": "ART SHIP 015",
        "authority": "Ube/HQ final Taste Pass and promotion/freeze card",
        "copy_method": "binary copy only; no decode/re-encode, resize, optimization, repaint, regeneration, or retouch",
        "candidate_equals_production": True,
        "pre_ship_015_frozen_authority": {"count": 404, "commit": BASE_COMMIT},
        "items": [{"asset_id": x["asset_id"], "state": x["state"], "candidate_path": x["candidate_path"], "production_path": x["production_path"], "sha256": x["sha256"]} for x in promoted],
    })
    (SHIP / "PROMOTED_SHA256SUMS.txt").write_text("".join(f"{x['sha256']}  {x['production_path']}\n" for x in promoted), encoding="utf-8")

    engineering = {
        "schema_version": 1,
        "ship": "ART SHIP 015",
        "status": "ART APPROVED MASTER / FROZEN — ENGINEERING INTEGRATION PENDING",
        "runtime_changes_in_this_ship": 0,
        "integration_rule": "Use only the exact production paths/hashes below. Do not recreate, reinterpret, resize, optimize or infer placement from filenames; complete separate Engineering mapping and runtime/Presentation QA.",
        "assets": [{
            "asset_id": x["asset_id"], "state": x["state"], "production_path": x["production_path"],
            "sha256": x["sha256"], "dimensions": x["dimensions"], "mode": x["mode"],
            "alpha": x["alpha"], "contact": x["contact"], "integration_status": x["runtime_integration_status"],
        } for x in promoted],
    }
    write(SHIP / "ENGINEERING_ASSET_MAP.json", engineering)
    rows = ["# ART SHIP 015 — Engineering asset map", "", "Status: **ART APPROVED MASTER / FROZEN — ENGINEERING INTEGRATION PENDING**", "", "Use these exact paths and hashes. Runtime integration and placement remain Engineering work.", "", "| Asset | State | Production path | SHA-256 | Contract |", "|---|---|---|---|---|"]
    for x in promoted:
        contract = "80×96 RGBA, binary alpha" + (", contact (40,88)" if x["contact"] else ", origin (0,0); no actor contact")
        rows.append(f"| `{x['asset_id']}` | `{x['state']}` | `{x['production_path']}` | `{x['sha256']}` | {contract} |")
    rows += ["", "No runtime/gameplay file was changed. No placement, mapping, merge or deployment is authorized by this handoff.", ""]
    (SHIP / "ENGINEERING_ASSET_MAP.md").write_text("\n".join(rows), encoding="utf-8")

    (SHIP / "HQ_DECISION.md").write_text("""# ART SHIP 015 — Ube/HQ final decision

Status: **UBE/HQ TASTE PASS — PASS**

All seven exact current candidate assets are visually approved for promotion and freeze. No further visual changes are authorized. Promotion must preserve the approved candidate bytes exactly.

The four Brother assets remain byte-identical to their accepted candidates. Corrected God SEATED_ON_CURB, God FADING and OG Hooper COURT_READY are accepted at the hashes recorded in `ART_SHIP_MANIFEST.json`.

Promotion is Art-only. Runtime integration, Engineering/main merge and deployment are excluded. Ship 011 remains separately frozen/unassigned. SEALED material remains untouched.

**HQ decision: ART SHIP 015 — APPROVED FOR PROMOTION + FREEZE.**
""", encoding="utf-8")

    index = ROOT / "art_department/APPROVED_ASSET_INDEX.md"
    section = ["", "## ART SHIP 015 — Final Open Canon Blockers", "", "Seven exact candidate byte streams resolving six former canon blockers are **APPROVED MASTER / FROZEN**. Runtime integration is pending.", "", "| Asset ID | State | Path | SHA-256 |", "|---|---|---|---|"]
    section += [f"| `{x['asset_id']}` | `{x['state']}` | `{x['production_path']}` | `{x['sha256']}` |" for x in promoted]
    section += [""]
    index.write_text(index.read_text(encoding="utf-8").rstrip() + "\n" + "\n".join(section), encoding="utf-8")

    approvals = ROOT / "art_department/APPROVAL_LEDGER.md"
    approvals.write_text(approvals.read_text(encoding="utf-8").rstrip() + """

## ART SHIP 015 — FINAL OPEN CANON BLOCKERS (recorded 2026-09-27)

51. Ube/HQ supplied final canon decisions for the two adult brothers, their same-identity FAMILY THREAD avatars, original Vol. 2 God, and OG Hooper. ART SHIP 015 produced seven 80×96 RGBA binary-alpha candidates resolving the six Ship 014 canon blockers.
52. Surgical HQ review preserved the four Brother candidates byte-for-byte, accepted God after a restrained native edge-light correction, and accepted OG Hooper after an upper-garment-only sleeveless-top correction. Mechanical regression verified the previous frozen corpus 404/404 unchanged.
53. Explicit final decision: **ART SHIP 015 — UBE/HQ TASTE PASS: PASS.** All seven exact current candidate byte streams are **APPROVED MASTER / FROZEN**. The resulting frozen corpus is 411 assets; the Asset Register contains 551 entries. Runtime/gameplay integration, Ship 011 assignment, Engineering/main merge and deployment remain excluded. SEALED access was zero.
""", encoding="utf-8")

    gaps = load(ROOT / "art_department/CURRENT_OPEN_ART_GAPS.json")
    gaps["schema_version"] = 5
    gaps["recorded_date"] = "2026-09-27"
    gaps["frozen_snapshot"]["frozen_corpus_assets"] = 411
    gaps["frozen_snapshot"]["register_entries"] = 551
    gaps["missing_identity_ids"] = []
    gaps["blocked_by_canon"] = []
    gaps["ship_015"] = {
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "approved_frozen_assets": 7,
        "resolved_requirements": sorted(by_requirement),
        "previous_frozen_verification": "404/404",
        "runtime_integration": "PENDING ENGINEERING MAPPING/INTEGRATION/QA",
        "runtime_pass_hold_changed": False,
        "ship_011": "separately frozen/unassigned and unchanged",
        "manifest": "art_department/ships/art_ship_015/ART_SHIP_MANIFEST.json",
        "engineering_handoff": "art_department/ships/art_ship_015/ENGINEERING_ASSET_MAP.json",
    }
    gaps["recommended_next_step"] = "Engineering may later perform a separately authorized integration from the Ship 015 Engineering map. Art production is dormant."
    write(ROOT / "art_department/CURRENT_OPEN_ART_GAPS.json", gaps)


if __name__ == "__main__":
    main()
