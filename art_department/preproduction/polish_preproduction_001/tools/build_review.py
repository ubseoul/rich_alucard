from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib, math

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'art_department/preproduction/polish_preproduction_001'
REVIEW = OUT/'review'
REVIEW.mkdir(parents=True, exist_ok=True)
FONT = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 14)
TITLE = ImageFont.truetype('C:/Windows/Fonts/consolab.ttf', 23)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def board(paths, name, title, cols=4, cell=(300,340), scale=3, crop=True):
    W,H=cell
    im=Image.new('RGB',(cols*W,100+math.ceil(len(paths)/cols)*H),(18,22,31))
    d=ImageDraw.Draw(im); d.text((20,14),title,font=TITLE,fill='#e7e9ed')
    suffix='CANDIDATE EXPORTS' if name.startswith('A_candidates') else 'SOURCE REVIEW'
    d.text((20,48),'POLISH PREPRODUCTION 001 | REVIEW ONLY | '+suffix,font=FONT,fill='#e8bf6a')
    d.text((20,70),'Native / integer enlargement unless marked preview. Source files unchanged; no runtime claim.',font=FONT,fill='#aab4c4')
    for i,p in enumerate(paths):
        a=Image.open(p).convert('RGBA'); bbox=a.getbbox()
        b=a.crop(bbox) if crop else a
        s=min(scale,max(1,min((W-24)//b.width,(H-98)//b.height)))
        x=(i%cols)*W; y=100+(i//cols)*H
        d.rectangle((x+7,y+6,x+W-7,y+H-7),fill='#303745')
        if b.width>W-24 or b.height>H-98:
            div=math.ceil(max(b.width/(W-24),b.height/(H-98)))
            b=b.resize((b.width//div,b.height//div),Image.Resampling.NEAREST)
            scalelabel=f'1/{div} preview'
        else:
            b=b.resize((b.width*s,b.height*s),Image.Resampling.NEAREST)
            scalelabel=f'{s}x'
        im.paste(b,(x+(W-b.width)//2,y+12),b)
        label=p.stem.replace('rich_','').replace('blood_bath_','').replace('vampire_bite_','').replace('revenge_','')
        wrap=max(18,(W-24)//9)
        for j,t in enumerate([label[k:k+wrap] for k in range(0,len(label),wrap)]): d.text((x+12,y+H-83+j*16),t,font=FONT,fill='white')
        d.text((x+12,y+H-45),f'{a.width}x{a.height} | {scalelabel}',font=FONT,fill='#b1bdcf')
        d.text((x+12,y+H-25),f'bounds {bbox}',font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',12),fill='#b1bdcf')
    im.save(REVIEW/name)
    return str(REVIEW/name)

if __name__=='__main__':
    reg=json.loads((ROOT/'art_department/ASSET_REGISTER.json').read_text())['assets']
    rmap={a['path']:a for a in reg}
    paths=sorted((ROOT/'assets').rglob('rich*.png'))
    exclude=['environment','sprite_sheet','state_sheet','throne_empty','throne_only']
    states=[p for p in paths if not any(t in p.name for t in exclude)]
    inventory=[]
    for p in paths:
        a=Image.open(p).convert('RGBA'); opaque=[c for c in a.getdata() if c[3]]
        inventory.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'dimensions':list(a.size),'bounds':a.getbbox(),'colors':len(set(opaque)),'status':rmap.get(p.relative_to(ROOT).as_posix(),{}).get('status','UNREGISTERED'),'individual_state':p in states})
    (OUT/'rich_inventory.json').write_text(json.dumps(inventory,indent=2))
    for j in range(0,len(states),12): board(states[j:j+12],f'C_rich_{j//12+1:02}.png',f'RICH CONTINUITY | source states {j+1}-{min(j+12,len(states))}',cell=(310,355))
    for move in ['blood_bath','vampire_bite','revenge']:
        manifest=json.loads((ROOT/f'assets/{move}_manifest.json').read_text())
        ps=[ROOT/'assets'/x['file'] for x in manifest['frames']]
        board(ps,f'B_{move}.png',move.upper()+' | native package',cols=4,cell=(300,570),scale=3,crop=False)
    board(sorted((ROOT/'assets').glob('octopus_brain_*.png')),'B_octopus_brain.png','OCTOPUS BRAIN | existing four authored states',cell=(300,400),scale=2)
    refs=[ROOT/p for p in ['assets/rich_standing_right.png','assets/ogun_rave/masters/ogun_neutral_80x96.png','assets/assistant_idle.png','assets/jdm_imports/characters/daughter/daughter_neutral.png','assets/before_the_fame/characters/june/june_neutral_80x96.png','assets/before_the_fame/characters/velvet/velvet_vantablack_profile_80x96.png']]
    board(refs,'A_style_anchors.png','FROZEN / APPROVED STYLE ANCHORS | reference only',cols=6,cell=(230,300),scale=3)
    print(json.dumps({'states':len(states),'inventory':len(paths),'boards':[p.name for p in REVIEW.glob('*.png')]}))
