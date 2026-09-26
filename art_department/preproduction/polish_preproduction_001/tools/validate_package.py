from build_review import *
import subprocess, datetime

BASE='1c96101213a996b2975c31029ef6e823f9ebc745'
def run(*args): return subprocess.check_output(args,cwd=ROOT,text=True).strip()
candidate=json.loads((OUT/'candidate_manifest.json').read_text())
comps=json.loads((OUT/'review_composition_manifest.json').read_text())
rich=json.loads((OUT/'rich_continuity_audit.json').read_text())

# Combat inventory, including individual components only and separately labelled sheets/legacy evidence.
combat={}
for move in ['blood_bath','vampire_bite','revenge']:
    m=json.loads((ROOT/f'assets/{move}_manifest.json').read_text())
    combat[move]={'manifest':f'assets/{move}_manifest.json','readme':f'assets/{move}_README.md','components':[]}
    for f in m['frames']:
        p=ROOT/'assets'/f['file']; a=Image.open(p)
        combat[move]['components'].append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'dimensions':list(a.size),'role':f['role']})
combat['octopus_brain']={'manifest':None,'readme':None,'components':[]}
for p in sorted((ROOT/'assets').glob('octopus_brain_[abcd].png')):
    combat['octopus_brain']['components'].append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'dimensions':list(Image.open(p).size),'role':'authored held/emergence state'})
legacy=[]
for n in ['blood_orb.png','blood_orb_sheet.png','blood_missiles_detailed.png','blood_impact.png','blood_impact_detailed.png','blood_impact_sheet.png']:
    p=ROOT/'assets'/n; legacy.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'dimensions':list(Image.open(p).size)})
combat['blood_bath']['legacy_travel_impact_evidence']=legacy
(OUT/'combat_inventory.json').write_text(json.dumps(combat,indent=2))

# Verify manifest sheets contain exact component pixels.
sheet_checks=[]
checks=[('assets/blood_bath_floor_sheet.png',['blood_bath_floor_rise_01.png','blood_bath_floor_rise_02.png','blood_bath_floor_rise_03.png','blood_bath_foreground_01.png'],(270,362),2),('assets/blood_bath_contact_overlay_sheet.png',['blood_bath_contact_01.png','blood_bath_contact_02.png','blood_bath_engulf_overlay_01.png','blood_bath_engulf_overlay_02.png'],(96,96),2),('assets/vampire_bite_jaw_sheet.png',['vampire_bite_jaw_upper.png','vampire_bite_jaw_lower.png','vampire_bite_snap_closed.png'],(270,480),3),('assets/vampire_bite_lifesteal_atlas.png',['vampire_bite_lifesteal_drop_01.png','vampire_bite_lifesteal_orb_01.png','vampire_bite_lifesteal_drop_02.png'],(16,16),3),('assets/revenge_stored_wound_sheet.png',[f'revenge_stored_wound_0{i}.png' for i in range(1,5)],(16,16),4),('assets/revenge_extraction_sheet.png',[f'revenge_extraction_0{i}.png' for i in range(1,5)],(24,24),4),('assets/revenge_mass_sheet.png',[f'revenge_mass_0{i}.png' for i in range(1,4)],(96,96),3),('assets/revenge_target_crack_sheet.png',[f'revenge_target_crack_0{i}.png' for i in range(1,4)],(96,96),3)]
for sheet,names,(w,h),cols in checks:
    s=Image.open(ROOT/sheet).convert('RGBA'); ok=True
    for i,n in enumerate(names):
        cell=s.crop(((i%cols)*w,(i//cols)*h,(i%cols+1)*w,(i//cols+1)*h))
        ok &= cell.tobytes()==Image.open(ROOT/'assets'/n).convert('RGBA').tobytes()
    sheet_checks.append({'sheet':sheet,'exact_component_pixels':ok})

candidate_checks=[]
for r in candidate['candidates']:
    p=ROOT/r['path']; a=Image.open(p).convert('RGBA')
    candidate_checks.append({'id':r['id'],'exists':p.exists(),'sha256_match':sha(p)==r['sha256'],'dimensions_match':list(a.size)==r['dimensions'],'binary_alpha':set(a.getchannel('A').getdata())<={0,255},'opaque_pixels':sum(1 for x in a.getchannel('A').getdata() if x)})
composition_checks=[]
for r in comps:
    composition_checks.append({'id':r['id'],'source_hash_match':sha(ROOT/r['source'])==r['source_sha256'],'layer_hash_match':sha(ROOT/r['layer'])==r['layer_sha256'],'outside_alpha_changed_pixels':r['outside_alpha_changed_pixels'],'source_dimensions':list(Image.open(ROOT/r['source']).size),'layer_dimensions':list(Image.open(ROOT/r['layer']).size)})

tracked=run('git','diff','--name-only',BASE,'--').splitlines()
runtime_ext={'.js','.css','.html'}
runtime_changed=[p for p in tracked if Path(p).suffix in runtime_ext]
changed_outside=[p for p in tracked if not p.startswith('art_department/preproduction/polish_preproduction_001/')]
result={'base_checkpoint':BASE,'head_before_commit':run('git','rev-parse','HEAD'),'branch':run('git','branch','--show-current'),'base_matches_origin_art_ship_010':run('git','rev-parse','origin/art/art_ship_010')==BASE,'candidate_count':len(candidate_checks),'adult_figure_count':sum(r['adult_figures'] for r in candidate['candidates']),'candidate_checks':candidate_checks,'composition_checks':composition_checks,'combat_primary_components':sum(len(v['components']) for v in combat.values()),'combat_packages':list(combat),'sheet_checks':sheet_checks,'rich_individual_files':len(rich['states']),'rich_classification_counts':rich['classification_counts'],'supplemental_fx_generated':0,'tracked_changes_before_commit':tracked,'runtime_code_changed':runtime_changed,'changes_outside_preproduction':changed_outside,'sealed_content_accessed':False,'approved_or_frozen':False,'runtime_integrated':False,'holds_resolved':False}
result['all_pass']=all(all(x[k] for k in ['exists','sha256_match','dimensions_match','binary_alpha']) and x['opaque_pixels']>0 for x in candidate_checks) and all(x['source_hash_match'] and x['layer_hash_match'] and x['outside_alpha_changed_pixels']==0 and x['source_dimensions']==[270,480] and x['layer_dimensions']==[270,480] for x in composition_checks) and all(x['exact_component_pixels'] for x in sheet_checks) and not runtime_changed and not changed_outside
(OUT/'validation.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
