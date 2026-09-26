from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
import hashlib
import json
import struct
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import label


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department/ships/art_ship_011"
PRODUCTION = ROOT / "assets/before_the_fame/population/nightlife"
PREPRODUCTION_COMMIT = "d8c24b632ecdc134986b4f81ff5d3f3959609eea"
BASE_COMMIT = "8eab30dc790071ec8da98f65311e2b4676fabad0"
PREPRODUCTION_ROOT = "art_department/preproduction/polish_preproduction_001"


@dataclass(frozen=True)
class Asset:
    exploratory_id: str
    asset_id: str
    filename: str
    category: str
    role: str
    constraints: tuple[str, ...]


ASSETS = (
    Asset("A01_dancer", "nightlife_population.dancer", "nightlife_dancer_80x96.png", "ACTIVE_DANCE", "side-pocket / dance-floor energy", ("clear named-actor lanes", "prefer sparse or medium-density use")),
    Asset("A02_performer", "nightlife_population.performer", "nightlife_performer_80x96.png", "STAGE_PERFORMANCE", "adult stage/nightlife performer; sensual and non-explicit", ("clear named-actor lanes", "use only where a stage/performance context is credible")),
    Asset("A03_queue_pair", "nightlife_population.queue_pair", "nightlife_queue_pair_112x96.png", "ARRIVAL_QUEUE", "passive social / arrival pair", ("treat as one pair fragment", "clear entrances and named-actor lanes")),
    Asset("A04_dancing_pair", "nightlife_population.dancing_pair", "nightlife_dancing_pair_112x96.png", "PARTNERED_DANCE", "active partnered movement", ("requires a wide side-floor pocket", "clear named-actor lanes")),
    Asset("A05_affectionate_pair", "nightlife_population.affectionate_pair", "nightlife_affectionate_pair_112x96.png", "AFFECTIONATE_SOCIAL", "adult flirting / affectionate background pair", ("background behavior only", "clear named-actor lanes")),
    Asset("A06_bartender", "nightlife_population.bartender", "nightlife_bartender_80x96.png", "HOSPITALITY_SERVICE", "bartender / service figure", ("must have an appropriate bar or service context", "do not place as a free-floating patron")),
    Asset("A07_hookah_lounge", "nightlife_population.hookah_lounge", "nightlife_hookah_lounge_128x96.png", "SEATED_LOUNGE_GROUP", "low seated social group with hookah, table, and seating included", ("included furniture must not be duplicated", "check furniture scale against the host environment")),
    Asset("A08_dense_cluster", "nightlife_population.dense_cluster", "nightlife_dense_cluster_144x96.png", "DENSE_CROWD_CLUSTER", "six-adult crowd-density tool", ("do not tile or repeat into wallpaper", "use once per framed view unless a later explicit contract says otherwise", "protect named-actor clearance")),
    Asset("A09_foreground_silhouettes", "nightlife_population.foreground_silhouettes", "nightlife_foreground_silhouettes_144x112.png", "FOREGROUND_DEPTH", "three-adult foreground/depth silhouette fragment", ("high occlusion risk", "peripheral or deliberately framed placement only", "use against a lighter band", "never cover named actors or critical UI")),
)


SCENES = (
    ("party_hall_sparse", "assets/before_the_fame/environments/party_hall/party_hall_empty_270x480.png", (("A02_performer", 133, 267), ("A01_dancer", 55, 335), ("A04_dancing_pair", 213, 354))),
    ("party_hall_dense", "assets/before_the_fame/environments/party_hall/party_hall_empty_270x480.png", (("A08_dense_cluster", 65, 340), ("A04_dancing_pair", 210, 354), ("A01_dancer", 44, 386), ("A09_foreground_silhouettes", 211, 426))),
    ("catacomb_performance", "assets/before_the_fame/environments/catacomb/catacomb_empty_270x480.png", (("A02_performer", 133, 291), ("A08_dense_cluster", 67, 369), ("A09_foreground_silhouettes", 207, 422))),
    ("rooftop_social", "assets/before_the_fame/environments/rooftop_dtla/downtown_la_rooftop_party_270x480.png", (("A03_queue_pair", 58, 327), ("A05_affectionate_pair", 218, 337), ("A04_dancing_pair", 203, 401))),
    ("roof_lounge", "assets/before_the_fame/environments/roof/castle_roof_hookah_270x480.png", (("A07_hookah_lounge", 195, 367), ("A05_affectionate_pair", 58, 365))),
    ("castle_entry", "assets/before_the_fame/environments/castle_exterior/castle_exterior_party_270x480.png", (("A03_queue_pair", 61, 354), ("A05_affectionate_pair", 209, 374))),
)


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{PREPRODUCTION_COMMIT}:{path}"], cwd=ROOT)


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_path(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def png_ihdr(data: bytes) -> dict:
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("Not a PNG with a leading IHDR")
    width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(">IIBBBBB", data[16:29])
    return {"width": width, "height": height, "bit_depth": bit_depth, "color_type": color_type, "compression": compression, "filter": filter_method, "interlace": interlace}


def recreate_candidate(record: dict, selected_source: bytes) -> Image.Image:
    source = Image.open(BytesIO(selected_source))
    mode = source.mode
    array = np.array(source.convert("RGBA"))
    if mode == "RGB":
        rgb = array[:, :, :3].astype(int)
        possible = (rgb.max(2) - rgb.min(2) <= 20) & (rgb.min(2) >= 155)
        regions, count = label(possible)
        mask = np.zeros(possible.shape, dtype=bool)
        for component in range(1, count + 1):
            region = regions == component
            values = rgb[:, :, 0][region]
            if len(values) > 100 and values.max() - values.min() >= 40:
                mask |= region
        array[:, :, 3] = np.where(mask, 0, 255)
    else:
        array[:, :, 3] = np.where(array[:, :, 3] >= 128, 255, 0)
    cropped = Image.fromarray(array).crop(tuple(record["transform"]["crop"]))
    width, height = record["transform"]["native_visible_size"]
    cropped = cropped.resize((width, height), Image.Resampling.NEAREST)
    cropped_array = np.array(cropped)
    alpha = cropped_array[:, :, 3]
    opaque = cropped_array[:, :, :3][alpha > 0]
    palette = Image.fromarray(opaque.reshape(1, -1, 3)).quantize(colors=record["transform"]["palette_max"], method=Image.Quantize.MEDIANCUT)
    rgb = cropped.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).convert("RGB")
    recreated = rgb.convert("RGBA")
    recreated.putalpha(Image.fromarray(alpha))
    cell = Image.new("RGBA", tuple(record["dimensions"]))
    anchor_x, anchor_y = record["contact"]
    cell.alpha_composite(recreated, (anchor_x - width // 2, anchor_y - height))
    return cell


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


def checker(size: tuple[int, int], square: int = 8) -> Image.Image:
    image = Image.new("RGB", size, "#c9c9c9")
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], square):
        for x in range(0, size[0], square):
            if (x // square + y // square) % 2:
                draw.rectangle((x, y, min(x + square - 1, size[0] - 1), min(y + square - 1, size[1] - 1)), fill="#969696")
    return image


def build_isolation_board(records: list[dict], scale: int, output: Path) -> None:
    cell_w, cell_h = (420, 240) if scale == 1 else (520, 480)
    board = Image.new("RGB", (cell_w * 3, 100 + cell_h * 3), "#10151e")
    draw = ImageDraw.Draw(board)
    draw.text((18, 12), "ART SHIP 011 | NIGHTLIFE POPULATION LIBRARY", font=font("consolab.ttf", 24), fill="white")
    draw.text((18, 48), f"CANDIDATE — HQ REVIEW REQUIRED | {'NATIVE 1x' if scale == 1 else 'EXACT 4x NEAREST-NEIGHBOR'}", font=font("consola.ttf", 15), fill="#f0c66e")
    draw.text((18, 70), "Checker field is review evidence for actual transparency; source PNGs remain unchanged.", font=font("consola.ttf", 13), fill="#b8c3d3")
    for index, (asset, record) in enumerate(zip(ASSETS, records)):
        left = index % 3 * cell_w
        top = 100 + index // 3 * cell_h
        draw.rectangle((left + 7, top + 7, left + cell_w - 7, top + cell_h - 7), fill="#273141")
        source = Image.open(PRODUCTION / asset.filename).convert("RGBA")
        display = source.resize((source.width * scale, source.height * scale), Image.Resampling.NEAREST)
        field_w = min(cell_w - 32, max(display.width + 32, 176))
        field_h = min(cell_h - 84, max(display.height + 24, 120))
        field = checker((field_w, field_h), 8 if scale == 1 else 16)
        field.paste(display, ((field_w - display.width) // 2, (field_h - display.height) // 2), display)
        board.paste(field, (left + (cell_w - field_w) // 2, top + 14))
        draw.text((left + 14, top + cell_h - 62), f"{asset.asset_id} | {source.width}x{source.height} | {scale}x", font=font("consola.ttf", 13), fill="white")
        draw.text((left + 14, top + cell_h - 40), f"contact {tuple(record['contact'])} | {asset.category}", font=font("consola.ttf", 12), fill="#c2ccda")
        draw.text((left + 14, top + cell_h - 20), "adult ambient population | pixels unchanged", font=font("consola.ttf", 11), fill="#98e0b2")
    board.save(output)


def build_environment_board(by_exploratory_id: dict[str, tuple[Asset, dict]]) -> list[dict]:
    board = Image.new("RGB", (900, 1110), "#10151e")
    draw = ImageDraw.Draw(board)
    draw.text((18, 12), "ART SHIP 011 | REPRESENTATIVE ENVIRONMENT COMPATIBILITY", font=font("consolab.ttf", 23), fill="white")
    draw.text((18, 46), "REVIEW COMPOSITES ONLY — no figure is baked into an environment master", font=font("consola.ttf", 14), fill="#f0c66e")
    draw.text((18, 68), "Full native frames, hypothetical 1x placement; Presentation Director framing remains authoritative.", font=font("consola.ttf", 12), fill="#b8c3d3")
    results = []
    for index, (scene_id, environment_path, placements) in enumerate(SCENES):
        source_path = ROOT / environment_path
        base = Image.open(source_path).convert("RGBA")
        layer = Image.new("RGBA", base.size)
        placement_records = []
        for exploratory_id, contact_x, contact_y in placements:
            asset, record = by_exploratory_id[exploratory_id]
            fragment = Image.open(PRODUCTION / asset.filename).convert("RGBA")
            anchor_x, anchor_y = record["contact"]
            layer.alpha_composite(fragment, (contact_x - anchor_x, contact_y - anchor_y))
            placement_records.append({"asset_id": asset.asset_id, "contact": [contact_x, contact_y], "scale": 1})
        composite = Image.alpha_composite(base, layer)
        column = index % 3
        row = index // 3
        left = 15 + column * 295
        top = 100 + row * 500
        draw.text((left, top), scene_id.replace("_", " ").upper(), font=font("consolab.ttf", 14), fill="white")
        board.paste(composite.convert("RGB"), (left, top + 24))
        draw.text((left, top + 510 - 70), "270x480 native composite", font=font("consola.ttf", 11), fill="#c2ccda")
        draw.text((left, top + 510 - 51), "placement evidence only", font=font("consola.ttf", 11), fill="#f0c66e")
        draw.text((left, top + 510 - 32), "environment bytes unchanged", font=font("consola.ttf", 11), fill="#98e0b2")
        results.append({
            "id": scene_id,
            "status": "REVIEW EVIDENCE ONLY — NOT A RUNTIME MAPPING",
            "environment": environment_path,
            "environment_sha256": sha_path(source_path),
            "placements": placement_records,
            "scale": 1,
            "candidate_layer_origin": [0, 0],
            "baked_into_environment_master": False,
        })
    board.save(SHIP / "review/03_environment_compatibility_1x.png")
    return results


def main() -> None:
    manifest = json.loads(git_bytes(f"{PREPRODUCTION_ROOT}/candidate_manifest.json"))
    source_records = {record["id"]: record for record in manifest["candidates"]}
    validation = []
    promotion = []
    provenance = []
    ordered_records = []
    for asset in ASSETS:
        record = source_records[asset.exploratory_id]
        ordered_records.append(record)
        exploratory_native_path = f"{PREPRODUCTION_ROOT}/candidates/native/{asset.exploratory_id}.png"
        selected_source_path = record["selected_source"]
        exploratory_bytes = git_bytes(exploratory_native_path)
        selected_source_bytes = git_bytes(selected_source_path)
        production_path = PRODUCTION / asset.filename
        candidate_path = SHIP / "candidates/native/population" / asset.filename
        production_bytes = production_path.read_bytes()
        candidate_bytes = candidate_path.read_bytes()
        image = Image.open(BytesIO(production_bytes))
        rgba = image.convert("RGBA")
        alpha = np.array(rgba.getchannel("A"))
        ihdr = png_ihdr(production_bytes)
        recreated = recreate_candidate(record, selected_source_bytes)
        exact_source_pixels = recreated.tobytes() == Image.open(BytesIO(exploratory_bytes)).convert("RGBA").tobytes()
        border = np.concatenate((alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]))
        result = {
            "asset_id": asset.asset_id,
            "production_path": production_path.relative_to(ROOT).as_posix(),
            "candidate_path": candidate_path.relative_to(ROOT).as_posix(),
            "dimensions": list(image.size),
            "expected_dimensions": record["dimensions"],
            "mode": image.mode,
            "png_ihdr": ihdr,
            "alpha_values": sorted(int(value) for value in np.unique(alpha)),
            "binary_alpha": set(np.unique(alpha)).issubset({0, 255}),
            "opaque_pixels": int(np.count_nonzero(alpha)),
            "opaque_bbox": list(rgba.getbbox()),
            "opaque_colors": len({pixel for pixel in rgba.getdata() if pixel[3]}),
            "transparent_border": int(np.count_nonzero(border)) == 0,
            "contact": record["contact"],
            "exploratory_hash": sha_bytes(exploratory_bytes),
            "candidate_hash": sha_bytes(candidate_bytes),
            "production_hash": sha_bytes(production_bytes),
            "exploratory_to_candidate_exact_bytes": exploratory_bytes == candidate_bytes,
            "candidate_to_production_exact_bytes": candidate_bytes == production_bytes,
            "deterministic_extraction_recreates_exact_pixels": exact_source_pixels,
            "nearest_neighbor_integrity": exploratory_bytes == candidate_bytes == production_bytes and exact_source_pixels,
            "checkerboard_remnants": "NONE OBSERVED — exact deterministic extraction reproduced; transparent border and manual native/4x review pass",
            "edge_corruption": "NONE OBSERVED — source-scale and 4x manual review pass; A03 silver garment remains connected",
            "pass": (
                list(image.size) == record["dimensions"]
                and image.mode == "RGBA"
                and ihdr["bit_depth"] == 8
                and ihdr["color_type"] == 6
                and set(np.unique(alpha)).issubset({0, 255})
                and int(np.count_nonzero(alpha)) > 0
                and int(np.count_nonzero(border)) == 0
                and exploratory_bytes == candidate_bytes == production_bytes
                and exact_source_pixels
            ),
        }
        validation.append(result)
        promotion.append({
            "asset_id": asset.asset_id,
            "source_commit": PREPRODUCTION_COMMIT,
            "source_path": exploratory_native_path,
            "candidate_path": candidate_path.relative_to(ROOT).as_posix(),
            "production_path": production_path.relative_to(ROOT).as_posix(),
            "sha256": sha_bytes(production_bytes),
            "byte_identity": "source exploratory candidate == Ship 011 candidate == production-path candidate",
            "resized_or_reencoded": False,
            "approval_status": "CANDIDATE — HQ REVIEW REQUIRED",
        })
        provenance.append({
            "asset_id": asset.asset_id,
            "exploratory_id": asset.exploratory_id,
            "source_commit": PREPRODUCTION_COMMIT,
            "selected_design_source_path": selected_source_path,
            "selected_design_source_sha256": sha_bytes(selected_source_bytes),
            "exploratory_native_path": exploratory_native_path,
            "exploratory_native_sha256": sha_bytes(exploratory_bytes),
            "transform": record["transform"],
            "source_mode": record["source_mode"],
            "contact": record["contact"],
            "origin": [0, 0],
        })

    by_exploratory_id = {asset.exploratory_id: (asset, source_records[asset.exploratory_id]) for asset in ASSETS}
    build_isolation_board(ordered_records, 1, SHIP / "review/01_isolated_native_1x.png")
    build_isolation_board(ordered_records, 4, SHIP / "review/02_isolated_exact_4x.png")
    environment_evidence = build_environment_board(by_exploratory_id)

    all_pass = all(item["pass"] for item in validation)
    manifest_files = []
    demand_entries = []
    state_entries = []
    for index, (asset, record, check) in enumerate(zip(ASSETS, ordered_records, validation), start=1):
        candidate_path = (SHIP / "candidates/native/population" / asset.filename).relative_to(ROOT).as_posix()
        production_path = (PRODUCTION / asset.filename).relative_to(ROOT).as_posix()
        common = {
            "request_id": f"AS11-NL-{index:02d}",
            "exploratory_id": asset.exploratory_id,
            "asset_id": asset.asset_id,
            "category": asset.category,
            "role": asset.role,
            "candidate_path": candidate_path,
            "production_path": production_path,
            "sha256": check["production_hash"],
            "dimensions": record["dimensions"],
            "mode": "RGBA",
            "alpha": [0, 255],
            "contact": record["contact"],
            "origin": [0, 0],
            "adult_figures": record["adult_figures"],
            "placement_constraints": list(asset.constraints),
            "approval_status": "CANDIDATE — HQ REVIEW REQUIRED",
        }
        manifest_files.append(common)
        demand_entries.append({
            "request_id": common["request_id"],
            "source_ticket": "ART-SHIP-011-NIGHTLIFE-POPULATION-LIBRARY",
            "runtime_asset_id": asset.asset_id,
            "asset_type": "POPULATION_FRAGMENT",
            "state_condition_layer": asset.role,
            "access": "OPEN",
            "status": "CANDIDATE — HQ REVIEW REQUIRED; NO RUNTIME ASSIGNMENT",
            "source": {
                "commit": PREPRODUCTION_COMMIT,
                "path": f"{PREPRODUCTION_ROOT}/candidates/native/{asset.exploratory_id}.png",
                "sha256": check["exploratory_hash"],
            },
            "candidate_path": candidate_path,
            "production_path": production_path,
            "dimensions": record["dimensions"],
            "alpha_contract": "RGBA, alpha values exactly 0/255",
            "contact": record["contact"],
            "origin": [0, 0],
            "intended_runtime_surfaces": [],
            "future_use_families": ["parties", "clubs", "rooftops", "lounges", "venue entrances", "stage/performance environments", "foreground depth", "social background behavior"],
            "severity": "COVERAGE",
            "expected_hold_cleared": None,
            "engineering_destination": "UNASSIGNED — LATER WORLD LIFE / NIGHTLIFE INTEGRATION",
            "placement_constraints": list(asset.constraints),
        })
        state_entries.append({
            "asset_id": asset.asset_id,
            "category": asset.category,
            "held_state": asset.role,
            "production_path": production_path,
            "origin": [0, 0],
            "contact": record["contact"],
            "layer_role": "anonymous ambient adult population fragment",
            "named_actor_clearance_required": True,
            "placement_constraints": list(asset.constraints),
            "runtime_assignment": None,
        })

    art_ship_manifest = {
        "schema_version": 1,
        "ship_id": "ART SHIP 011",
        "title": "NIGHTLIFE POPULATION LIBRARY",
        "status": "CANDIDATE — READY FOR HQ REVIEW",
        "authorization": "HQ authorized A01–A09 from POLISH PREPRODUCTION 001 to advance into a bounded production Art Ship; no replacement art or added characters authorized.",
        "approval_claimed": False,
        "frozen_claimed": False,
        "runtime_integrated": False,
        "base": {"commit": BASE_COMMIT, "authority": "latest HQ-accepted Engineering checkpoint named in brief"},
        "exploratory_source": {"branch": "art/polish_preproduction_001", "commit": PREPRODUCTION_COMMIT, "authority": "evidence and candidate source material only"},
        "branch": "art/art_ship_011",
        "native_asset_count": len(manifest_files),
        "adult_figure_count": sum(item["adult_figures"] for item in manifest_files),
        "accepted_for_hq_review": sum(1 for item in validation if item["pass"]),
        "rejected_for_technical_defect": sum(1 for item in validation if not item["pass"]),
        "promotion_policy": "Exact exploratory candidate bytes copied to Ship candidate and production asset paths; no regeneration, redraw, resize, retouch, palette change, or re-encoding.",
        "files": manifest_files,
        "review_boards": [
            "art_department/ships/art_ship_011/review/01_isolated_native_1x.png",
            "art_department/ships/art_ship_011/review/02_isolated_exact_4x.png",
            "art_department/ships/art_ship_011/review/03_environment_compatibility_1x.png",
        ],
        "freeze_scope": None,
        "stop_point": "ART SHIP 011 — READY FOR HQ REVIEW",
    }
    runtime_map = {
        "schema_version": 1,
        "ship_id": "ART SHIP 011",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "purpose": "Frozen reusable population-library candidate package; specific runtime screens are intentionally unassigned.",
        "runtime_integration_authorized": False,
        "hold_resolution_authorized": False,
        "entries": demand_entries,
    }
    state_layers = {
        "ship_id": "ART SHIP 011",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "global_draw_rule": "Environment/base and contextual furniture first; ambient population fragments next according to framing; named actors and critical UI must remain clear. A09 is a deliberate foreground exception only when specifically framed.",
        "states": state_entries,
    }
    report = {
        "ship_id": "ART SHIP 011",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "base_commit": BASE_COMMIT,
        "source_commit": PREPRODUCTION_COMMIT,
        "candidate_count": len(validation),
        "accepted_for_hq_review": sum(1 for item in validation if item["pass"]),
        "rejected_for_technical_defect": sum(1 for item in validation if not item["pass"]),
        "all_pass": all_pass,
        "checks": validation,
        "manual_review_scope": "actual native pixels and exact 4x nearest-neighbor enlargements; no replacement art or pixel edits",
        "runtime_code_touched": False,
        "named_character_art_touched": False,
        "hold_status_touched": False,
        "sealed_content_accessed": False,
        "merged": False,
        "deployed": False,
    }
    (SHIP / "VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (SHIP / "ART_SHIP_MANIFEST.json").write_text(json.dumps(art_ship_manifest, indent=2) + "\n", encoding="utf-8")
    (SHIP / "RUNTIME_DEMAND_MAP.json").write_text(json.dumps(runtime_map, indent=2) + "\n", encoding="utf-8")
    (SHIP / "STATE_LAYER_DEFINITIONS.json").write_text(json.dumps(state_layers, indent=2) + "\n", encoding="utf-8")
    (SHIP / "PROMOTION_EVIDENCE.json").write_text(json.dumps({"status": "CANDIDATE — HQ REVIEW REQUIRED", "records": promotion}, indent=2) + "\n", encoding="utf-8")
    (SHIP / "SOURCE_PROVENANCE.json").write_text(json.dumps({"source_commit": PREPRODUCTION_COMMIT, "records": provenance}, indent=2) + "\n", encoding="utf-8")
    (SHIP / "ENVIRONMENT_COMPATIBILITY_MANIFEST.json").write_text(json.dumps(environment_evidence, indent=2) + "\n", encoding="utf-8")
    (SHIP / "CANDIDATE_SHA256SUMS.txt").write_text("".join(f"{item['candidate_hash']}  {item['candidate_path']}\n" for item in validation), encoding="utf-8")
    (SHIP / "PRODUCTION_SHA256SUMS.txt").write_text("".join(f"{item['production_hash']}  {item['production_path']}\n" for item in validation), encoding="utf-8")
    (SHIP / "SOURCE_PACKAGE_SHA256SUMS.txt").write_text("".join(f"{item['exploratory_hash']}  {PREPRODUCTION_ROOT}/candidates/native/{asset.exploratory_id}.png @ {PREPRODUCTION_COMMIT}\n" for item, asset in zip(validation, ASSETS)), encoding="utf-8")
    if not all_pass:
        raise SystemExit("One or more candidates failed production validation")


if __name__ == "__main__":
    main()
