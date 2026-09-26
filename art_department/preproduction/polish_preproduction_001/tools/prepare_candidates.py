from build_review import *
import numpy as np
import shutil
from scipy.ndimage import label

NATIVE=OUT/'candidates/native'
RAW=OUT/'selected_sources'
NATIVE.mkdir(parents=True,exist_ok=True)
RAW.mkdir(parents=True,exist_ok=True)
log=json.loads((OUT/'generation_log.json').read_text())
contracts=[(80,96,60,40,88),(80,96,56,40,88),(112,96,56,56,88),(112,96,61,56,88),(112,96,54,56,88),(80,96,56,40,88),(128,96,52,64,88),(144,96,64,72,88),(144,112,78,72,104)]
categories=[['adult female club dancer'],['adult club performer'],['female and male partygoers','club entry / queue'],['dancing pair'],['flirting / affectionate pair'],['bartender'],['seated lounge group','VIP/table group','hookah group'],['dense dance-floor cluster','rooftop cluster','crowd fragment'],['foreground dancer silhouettes']]
people=[1,1,2,2,2,1,3,6,3]
results=[]
for i,rec in enumerate(log['records']):
    source=Path(rec['source_local']); dst=RAW/(rec['id']+'_generated.png'); shutil.copyfile(source,dst)
    a=Image.open(source).convert('RGBA'); ar=np.array(a)
    mode=Image.open(source).mode
    if mode=='RGB':
        # Checker is achromatic and bright; preserve every non-checker color.
        # This also clears enclosed checker gaps, without cutting saturated skin.
        rgb=ar[:,:,:3].astype(int)
        possible=(rgb.max(2)-rgb.min(2)<=20)&(rgb.min(2)>=155)
        regions,n=label(possible)
        mask=np.zeros(possible.shape,dtype=bool)
        for k in range(1,n+1):
            region=regions==k
            # Only checker-containing connected regions have both bright and gray tiles.
            vals=rgb[:,:,0][region]
            if len(vals)>100 and vals.max()-vals.min()>=40:
                mask |= region
        ar[:,:,3]=np.where(mask,0,255)
    else:
        ar[:,:,3]=np.where(ar[:,:,3]>=128,255,0)
    # Find figure envelope after alpha extraction; original RGB remains archived.
    a=Image.fromarray(ar); bbox=a.getbbox(); a=a.crop(bbox)
    W,H,h,ax,ay=contracts[i]
    w=round(a.width*h/a.height)
    if w>W-12: h=round(h*(W-12)/w); w=W-12
    a=a.resize((w,h),Image.Resampling.NEAREST)
    ar=np.array(a); alpha=ar[:,:,3]
    # Nearest palette mapping only, no dithering; transparent pixels excluded.
    opaque=ar[:,:,:3][alpha>0]
    count=4 if i==8 else (24 if i in [2,3,4,6,7] else 18)
    palette=Image.fromarray(opaque.reshape(1,-1,3)).quantize(colors=count,method=Image.Quantize.MEDIANCUT)
    rgb=a.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE).convert('RGB')
    a=rgb.convert('RGBA'); a.putalpha(Image.fromarray(alpha))
    cell=Image.new('RGBA',(W,H)); cell.alpha_composite(a,(ax-w//2,ay-h))
    path=NATIVE/(rec['id']+'.png'); cell.save(path)
    results.append({'id':rec['id'],'status':'EXPLORATION / CANDIDATE — NOT APPROVED','path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'dimensions':[W,H],'contact':[ax,ay],'visible_bounds':cell.getbbox(),'opaque_colors':len(set(c for c in cell.getdata() if c[3])),'alpha_values':sorted(set(cell.getchannel('A').getdata())),'adult_figures':people[i],'categories':categories[i],'selected_source':dst.relative_to(ROOT).as_posix(),'source_sha256':sha(dst),'source_mode':mode,'transform':{'background':'connected checker regions: RGB spread <=20, minimum >=155, area >100, red-channel range >=40' if mode=='RGB' else 'existing alpha threshold at 128','crop':bbox,'native_visible_size':[w,h],'sampling':'nearest neighbor','palette_max':count,'dither':False},'runtime_mapping':None,'approval':None,'freeze':None})
(OUT/'candidate_manifest.json').write_text(json.dumps({'status':'EXPLORATION — NOT CANONICAL','authorization':'User explicitly authorized deterministic background removal and native exports after imagegen alpha failure.','candidates':results},indent=2))
board([ROOT/r['path'] for r in results],'A_candidates_native.png','NIGHTLIFE | nine selected fragments at NATIVE 1x',cols=3,cell=(370,220),scale=1,crop=False)
board([ROOT/r['path'] for r in results],'A_candidates_4x.png','NIGHTLIFE | exact 4x nearest-neighbor detail',cols=3,cell=(550,460),scale=4,crop=True)
print(json.dumps(results,indent=2))
