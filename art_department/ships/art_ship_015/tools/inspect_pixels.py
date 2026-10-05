from collections import Counter
from pathlib import Path
from PIL import Image
import sys

path = Path(sys.argv[1])
im = Image.open(path).convert("RGBA")
counts = Counter(im.getdata())
colors = [item for item in counts.most_common() if item[0][3]]
chars = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
mapping = {rgba: chars[i] for i, (rgba, _) in enumerate(colors)}
print("palette")
for rgba, count in colors:
    print(mapping[rgba], rgba, count)
bbox = im.getchannel("A").getbbox()
print("bbox", bbox)
for y in range(bbox[1], bbox[3]):
    row = "".join(mapping.get(im.getpixel((x, y)), ".") for x in range(bbox[0], bbox[2]))
    print(f"{y:02d} {row}")
