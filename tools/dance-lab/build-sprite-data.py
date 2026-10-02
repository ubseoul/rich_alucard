#!/usr/bin/env python3
"""Usage: python3 build-sprite-data.py [path/to/sprite.png]
Embeds a PNG as base64 in sprite-data.js so index.html works from file:// (no canvas tainting).
The PNG on disk is only read, never modified."""
import base64, sys, os
here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'assets', 'source_sprite.png')
b = base64.b64encode(open(src, 'rb').read()).decode()
open(os.path.join(here, 'sprite-data.js'), 'w').write('window.SPRITE_PNG_B64="%s";\n' % b)
print('wrote sprite-data.js from', src)
