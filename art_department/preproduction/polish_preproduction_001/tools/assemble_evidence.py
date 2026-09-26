from build_review import *
import numpy as np
from collections import Counter

manifest=json.loads((OUT/'candidate_manifest.json').read_text())
candidates={r['id']:r for r in manifest['candidates']}
envroot='assets/before_the_fame/environments/'
scenes=[
 ('party_hall_sparse','party_hall/party_hall_empty_270x480.png',[('A02_performer',133,267),('A01_dancer',55,335),('A04_dancing_pair',213,354),('A06_bartender',226,299)]),
 ('party_hall_dense','party_hall/party_hall_empty_270x480.png',[('A08_dense_cluster',65,340),('A04_dancing_pair',210,354),('A01_dancer',44,386),('A09_foreground_silhouettes',211,426)]),
 ('catacomb_performance','catacomb/catacomb_empty_270x480.png',[('A02_performer',133,291),('A08_dense_cluster',67,369),('A09_foreground_silhouettes',207,422)]),
 ('rooftop_social','rooftop_dtla/downtown_la_rooftop_party_270x480.png',[('A03_queue_pair',58,327),('A05_affectionate_pair',218,337),('A04_dancing_pair',203,401),('A06_bartender',48,397)]),
 ('roof_lounge','roof/castle_roof_hookah_270x480.png',[('A07_hookah_lounge',195,367),('A05_affectionate_pair',58,365)]),
 ('castle_entry','castle_exterior/castle_exterior_party_270x480.png',[('A03_queue_pair',61,354),('A05_affectionate_pair',209,374),('A06_bartender',77,392)]),
]
layers=OUT/'review_only_layers'; layers.mkdir(exist_ok=True)
comps=REVIEW/'composites'; comps.mkdir(exist_ok=True)
scenerecords=[]
for sid,env,items in scenes:
    base=Image.open(ROOT/(envroot+env)).convert('RGBA'); layer=Image.new('RGBA',base.size)
    placements=[]
    for cid,x,y in items:
        r=candidates[cid]; a=Image.open(ROOT/r['path']).convert('RGBA'); ax,ay=r['contact']
        layer.alpha_composite(a,(x-ax,y-ay)); placements.append({'candidate':cid,'contact':[x,y],'scale':1})
    layerpath=layers/(sid+'_overlay_270x480.png'); layer.save(layerpath)
    comp=Image.alpha_composite(base,layer); cp=comps/(sid+'_270x480.png'); comp.save(cp)
    bg=np.array(base); result=np.array(comp); alpha=np.array(layer.getchannel('A'))
    outside=int(np.count_nonzero(np.any(bg!=result,axis=2)&(alpha==0)))
    b=Image.new('RGB',(870,650),(18,22,31)); d=ImageDraw.Draw(b)
    d.text((18,12),sid.upper().replace('_',' '),font=TITLE,fill='white')
    d.text((18,47),'REVIEW ONLY | hypothetical full-frame placement | native 270x480',font=FONT,fill='#e8bf6a')
    for j,(a,title) in enumerate([(base,'FROZEN SOURCE'),(layer,'CANDIDATE LAYER'),(comp,'REVIEW COMPOSITE')]):
        x=15+j*290; d.text((x,80),title,font=FONT,fill='white')
        d.rectangle((x,106,x+269,585),fill='#373e4b'); b.paste(a,(x,106),a)
    d.text((18,602),'No runtime framing claim. Empty lower band and central actor lane remain review constraints.',font=FONT,fill='#bcc7d4')
    d.text((18,625),f'Outside layer alpha: {outside} changed pixels | base bytes untouched',font=FONT,fill='#a0d4b3')
    b.save(REVIEW/f'A_scene_{sid}.png')
    scenerecords.append({'id':sid,'status':'REVIEW ONLY — NOT A RUNTIME MAPPING','source':envroot+env,'source_sha256':sha(ROOT/(envroot+env)),'layer':layerpath.relative_to(ROOT).as_posix(),'layer_sha256':sha(layerpath),'origin':[0,0],'composite':cp.relative_to(ROOT).as_posix(),'placements':placements,'outside_alpha_changed_pixels':outside})
(OUT/'review_composition_manifest.json').write_text(json.dumps(scenerecords,indent=2))

# Every individual Rich file at actual native scale, plus separately labelled portrait preview.
inv=json.loads((OUT/'rich_inventory.json').read_text())
states=[ROOT/r['path'] for r in inv if r['individual_state'] and 'portrait' not in r['path']]
board(states,'C_rich_native.png','RICH | all 33 individual sprite files at native 1x',cols=6,cell=(200,200),scale=1,crop=False)
focus=[ROOT/'assets/rich_standing_right.png',ROOT/'assets/rich_curb_chilling.png',ROOT/'assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png',ROOT/'assets/before_the_fame/characters/rich/rich_laptop_seated_80x96.png',ROOT/'assets/before_the_fame/characters/rich/rich_laptop_nod_80x96.png']
board(focus,'C_continuity_focus.png','RICH | reference anchors and three cleanup-review candidates',cols=5,cell=(300,450),scale=6,crop=True)

# Quantitative cues, not automatic identity judgements.
for r in inv:
    a=Image.open(ROOT/r['path']).convert('RGBA')
    r['green_accent_pixels_heuristic']=sum(1 for R,G,B,A in a.getdata() if A and G>R*1.2 and G>B*1.1 and G>50)
(OUT/'rich_inventory.json').write_text(json.dumps(inv,indent=2))
print('Six scene boards/layers/composites; Rich native/focus boards built.')
print([(Path(r['path']).stem,r['green_accent_pixels_heuristic']) for r in inv if r['individual_state']])
