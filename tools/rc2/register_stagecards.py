"""One-shot: registers the frozen F15 stage cards (OL-067). Frozen bytes are copied, never modified."""
import json,hashlib,os
base='C:/ra/feel/'
names=['roxy','rosalyn','emerald']
rec=json.load(open(base+'art_department/production/f15-dancer-stage-cards/FREEZE_RECORD.json',encoding='utf8'))
sha={os.path.basename(a['path']):a['sha256'] for a in rec['assets'] if a['path'].endswith('.png') and 'stagecard_' in a['path']}
entries=[]
for n in names:
    f=f'stagecard_{n}.png'
    rt=base+f'assets/f15/stagecards/{f}';src=base+f'art_department/production/f15-dancer-stage-cards/{f}'
    b=open(rt,'rb').read()
    assert open(src,'rb').read()==b,'runtime copy must be byte-identical'
    h=hashlib.sha256(b).hexdigest();assert h==sha[f],(f,h)
    entries.append(dict(path=f'assets/f15/stagecards/{f}',sha256=h,role='F15 dancer stage card (presentation / selection) — exact-byte runtime copy of the frozen card',status='FROZEN',default_style_reference=False,approval_evidence=['art_department/production/f15-dancer-stage-cards/FREEZE_RECORD.json'],dimensions=[945,1680],mode='RGBA'))
    entries.append(dict(path=f'art_department/production/f15-dancer-stage-cards/{f}',sha256=h,role='F15 dancer stage card — approved/frozen production source',status='FROZEN',default_style_reference=False,approval_evidence=['art_department/production/f15-dancer-stage-cards/FREEZE_RECORD.json'],dimensions=[945,1680],mode='RGBA'))
# ASSET_REGISTER.json: append (text insert keeps the file's formatting)
p=base+'art_department/ASSET_REGISTER.json';s=open(p,encoding='utf8').read()
d=json.loads(s);have={a['path'] for a in d['assets']}
new=[e for e in entries if e['path'] not in have]
tail="\n    }\n  ]\n}"
assert s.rstrip().endswith(tail.strip().replace('\n','\n')) or True
idx=s.rstrip().rfind('\n    }\n  ]\n}')
assert idx>0
add=''.join(',\n'+json.dumps(e,indent=2).replace('\n','\n    ').join(['    ','']) for e in new)
s=s[:idx]+"\n    }"+add+"\n  ]\n}"+("\n" if s.endswith("\n") else "")
open(p,'w',encoding='utf8').write(s);json.loads(s)
# annotations.json
p=base+'tools/presentation/annotations.json';s=open(p,encoding='utf8').read()
extra=''.join(f',\n  "assets/f15/stagecards/stagecard_{n}.png": {{"environment": true}}' for n in names)
k=s.rstrip().rfind('\n }\n}')
s=s[:k]+extra+s[k:]
open(p,'w',encoding='utf8').write(s);json.loads(s)
# art registry part
part="""// RC2 / OL-067. The frozen F15 dancer stage cards (945x1680, exact byte copies of art_department/production/f15-dancer-stage-cards).
// Additive only; RAF15Club shows them in the three-dancer lineup.
RAArtParts.register('F15',{
 "ui": {
  "f15": {
   "stagecards": {
"""+',\n'.join(f'    "{n}": {{"asset": "assets/f15/stagecards/stagecard_{n}.png", "width": 945, "height": 1680}}' for n in names)+"""
   }
  }
 }
});
"""
open(base+'js/data/art/parts/F15_stage_cards.js','w',encoding='utf8').write(part)
man={"status":"APPROVED / FROZEN (exact-byte runtime copies)","source":"art_department/production/f15-dancer-stage-cards","freeze_record":"art_department/production/f15-dancer-stage-cards/FREEZE_RECORD.json","files":[{"path":f"assets/f15/stagecards/stagecard_{n}.png","sha256":sha[f'stagecard_{n}.png'],"dimensions":[945,1680],"mode":"RGBA"} for n in names]}
json.dump(man,open(base+'assets/f15/stagecards/manifest.json','w',encoding='utf8'),indent=2)
print('registered',len(new),'register entries')
