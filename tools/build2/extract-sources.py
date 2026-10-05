"""Read the authored DOCX sources without changing them. Run from the repo root."""
from pathlib import Path
import json, zipfile, xml.etree.ElementTree as ET

ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
out = Path("work/build2")
out.mkdir(parents=True, exist_ok=True)
names = ["Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations", "Rich_Alucard_BTF_Vol3_Numbers", "Rich_Alucard_Patch_IRON_AND_GRACE_Guns", "RA_Sound_Finder_Brief"]
for name in names:
    source = next(Path("source_vault").rglob(name + ".docx"))
    with zipfile.ZipFile(source) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    paragraphs = ["".join(p.itertext()) for p in root.findall(".//w:p", ns)]
    (out / (name + ".txt")).write_text("\n".join(paragraphs), encoding="utf-8")
    if name == "RA_Sound_Finder_Brief":
        rows = [[" ".join("".join(p.itertext()) for p in cell.findall(".//w:p", ns)) for cell in row.findall("w:tc", ns)] for row in root.findall(".//w:tr", ns)]
        (out / "sound-rows.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print("PASS extracted four authored sources; originals unchanged")
