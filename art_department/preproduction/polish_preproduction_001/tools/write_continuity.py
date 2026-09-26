from build_review import *
from collections import Counter

inv=json.loads((OUT/'rich_inventory.json').read_text())
states=[r for r in inv if r['individual_state']]
default={'hair_loc_silhouette':'Large jagged dark mass; still reads as established Rich loc/hair silhouette.','face':'Compact shades band, small exposed brown face, sparse white mouth/fang marks.','skin_tone':'Warm brown family; source-state lighting/pose changes do not break recognition.','green_earring':'Visible green accent near the ear; view-dependent pixel allocation.','body_proportions':'Compact body beneath dominant head/hair; posture changes explain envelope.','perceived_age':'Adult; consistent with established young-adult Rich, not an age redesign.','pixel_density':'Sparse structural clusters; native geometry remains readable.','clothing':'Black fit and dark shoes with small light sole accents.','recognition':'Strong same-character read.'}
rows=[]
for r in states:
    name=Path(r['path']).stem; obs=default.copy(); classification='CONSISTENT'; cleanup=None
    notes='Preserve. Gesture variation does not justify regeneration.'
    if 'bedroom_' in name:
        classification='INTENTIONAL VARIANT'
        obs.update(hair_loc_silhouette='Black bonnet intentionally replaces visible loc outline in the bedroom package.',body_proportions='Horizontal 128x64 lounge pose; compare head/marks, not total width, against standing.',pixel_density='9-10 opaque colors, sparse face and garment clusters.',clothing='All-black lounge clothes and socks; phone included in authored states.',recognition='Shades, brown face, green earring and fang marks maintain identity under bonnet.')
        notes='Documented bonnet/lounge treatment; state remains visually coherent. Register status and older manifest review wording are preserved, not reconciled into a new approval.'
    elif 'portobello' in name:
        classification='INTENTIONAL VARIANT'
        obs.update(hair_loc_silhouette='Authorized short clean hair; do not flag it as loc drift.',face='Open face without shades/fangs is part of authorized transformation.',skin_tone='Warm medium brown; simpler brighter planes than standard Rich.',green_earring='No visibly green accent found; heuristic count 0. Tiny tell needs a separate, narrowly scoped HQ check.',body_proportions='Compact adult body; khaki legs and collar alter apparent proportions intentionally.',pixel_density='16-color native sprite, grouped garment/skin planes.',clothing='Authorized dark sweater/collared shirt, khakis, lanyard.',recognition='Intentional identity suppression; current silhouette depends on contextual variant authority.')
        notes='Hair, costume, no shades/fangs are explicitly authorized. Do not undo that design. Only the missing green tell merits future verification.'
        cleanup='Verify green earring only against the accepted exact pixels and HQ intent; no automatic correction or reclassification.'
    elif 'hookah' in name:
        classification='STRONG IDENTITY DRIFT'
        obs.update(hair_loc_silhouette='Long radiating palm-like spikes replace the compact layered loc mass.',face='More exposed/different facial construction; shades and fang read are weak compared with standing/curb.',skin_tone='Darker muted brown at this pose; contributes to lost facial contrast.',green_earring='No green accent pixels detected or visibly read.',body_proportions='Broader crouched triangle with thick limbs; pose explains some breadth, not all head/face differences.',perceived_age='Reads as a more mature/generic adult than the familiar compact Rich.',pixel_density='18 colors but different cluster construction; low color count alone does not secure identity.',clothing='Black clothes remain; brown shoe edges replace familiar bright sole accents.',recognition='Recognizable as dark-haired seated man, substantially weaker as the same Rich.')
        notes='Highest-priority future visual comparison; the frozen approval remains intact and this audit changes no pixels.'
        cleanup='If HQ agrees, scope a fresh delta from standing/curb masters that preserves the seated action while restoring hair/face/earring/shoe cues.'
    elif 'laptop_' in name:
        classification='POSSIBLE IDENTITY DRIFT'
        obs.update(hair_loc_silhouette='More radiating separated spikes; less layered lobe shape than standing.',face='Shades survive, but tiny warm/noisy facial marks alter the jaw/mouth read.',green_earring=f'Visible but reduced to {r["green_accent_pixels_heuristic"]} heuristic green pixels.',body_proportions='Seated tuck is plausible; compare against the unchanged curb head rather than stretching the body.',pixel_density=f'{r["colors"]} unique opaque colors versus standing 11; mixed small tones soften the face, a review cue rather than an automatic rejection.',recognition='Likely same Rich at native size; head/face construction merits direct HQ comparison.')
        notes='Review both laptop states together. Existing café support-layer issue is already separate and is not reopened here.'
        cleanup='Compare head/face at native and 6x; retain if HQ judges the difference to be pose compression. Do not regenerate merely to lower color count.'
    elif 'portrait' in name:
        classification='INTENTIONAL VARIANT'
        obs.update(hair_loc_silhouette='Authored profile loc silhouette for a self-portrait, not a full-body sprite master.',face='Large shades, beard/jaw and fang interpreted at portrait scale.',green_earring='Green earring clearly visible.',body_proportions='Bust-only image; full-body proportions not applicable.',pixel_density='1254x1254 source with 16,754 colors; preview is explicitly reduced and not a native sprite comparison.',clothing='Black shirt against red background, as documented in CURRENT_CANON.',recognition='Strong intended Rich iconography at portrait scale.')
        notes='The self-portrait format and source inspiration are documented canon. Do not impose 80x96 sprite construction on it.'
    elif 'ramen' in name:
        obs.update(clothing='Contextual apron over black fit; deliberate costume addition.',pixel_density=f'{r["colors"]} opaque colors; softer than legacy master, but identity cues survive.',body_proportions='Body remains compact. The source is offset in its cell; do not recenter frozen art.')
        notes='Corrected state removes the detached utensil; original remains historical/superseded. Neither needs a new identity redesign.'
    elif any(x in name for x in ['fishing','holding_fish','on_stage']):
        obs['pixel_density']=f'{r["colors"]} opaque colors; more tonal variation than legacy, but silhouette, shades and earring still identify Rich.'
        notes='Contextual prop/gesture is clear. More colors alone are insufficient evidence of identity drift.'
    elif 'seated_' in name:
        obs['body_proportions']='Throne is included in alpha bounds; compare Rich head/body within it, not the whole 64px throne height.'
    elif 'curb_' in name:
        obs['body_proportions']='Small seated pose with food bowl; head and earring maintain continuity.'
    rows.append({**r,'classification':classification,'observations':obs,'assessment':notes,'future_cleanup_review':cleanup})
counts=dict(Counter(r['classification'] for r in rows))
archive=[]
for folder in ['art_department/ships/art_ship_010/source_renders','art_department/ships/art_ship_010/candidates/native/characters']:
    for p in sorted((ROOT/folder).glob('rich*.png')):
        a=Image.open(p); archive.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'dimensions':list(a.size),'role':'generation provenance, not separate state' if 'source_renders' in str(p) else 'approved candidate duplicate of canonical state','classification':'INTENTIONAL VARIANT','counted_as_additional_state':False})
board([ROOT/r['path'] for r in archive],'C_archived_portobello.png','RICH | archived Portobello raw renders and native copies',cols=3,cell=(390,430),scale=3)
data={'counting':'34 individual files: 33 sprite states and 1 portrait. Archive copies, sheets and empty props do not inflate state totals.','classification_counts':counts,'states':rows,'archival_records':archive}
(OUT/'rich_continuity_audit.json').write_text(json.dumps(data,indent=2))
md='''# C — Rich identity continuity audit

**Read-only visual audit. No Rich sprite was edited or regenerated.**

33 individual sprite/state files plus one self-portrait were inspected at native size and enlarged. The three state sheets repeat existing states. Six Ship 010 native/raw archival records are documented separately. `rich_inventory.json` covers all 40 Rich-named PNGs under `assets/`; `rich_continuity_audit.json` adds the six archived files, explicit register status and nine visual observations per individual state. A contextual board shows the portrait-bearing room and throne-only sources; those are not additional Rich states. No SEALED/HQ-only paths were opened to extend the census.

The canonical standing sprite is the primary recognition anchor, with unchanged curb, seated and bedroom sources as contextual comparisons. Low-level metrics support visual review; color count or a green-pixel heuristic alone cannot determine identity.

## Classification totals

'''
for k,v in counts.items(): md+=f'- **{k}: {v}**\n'
md+='''
These are per-file visual classifications, not new production statuses. APPROVED MASTER/FROZEN files stay approved/frozen; unknown register statuses stay unknown. An audit concern is not permission to alter them.

## Per-state disposition

| Source file | Classification | Specific finding |
|---|---|---|
'''
for r in rows: md+=f'| `{Path(r["path"]).name}` | {r["classification"]} | {r["assessment"]} |\n'
md+='''
## Focused future cleanup recommendation

1. **Hookah seated: strongest concern (one file).** The hair becomes long radial spikes, the face is more exposed and muted, the green earring disappears, and shoe accents become brown. This combination goes beyond the seated posture. Compare directly against the established standing and curb anchors before authorizing a narrowly scoped derivative delta.
2. **Laptop seated + nod: possible concern (two files).** Rich is still recognizable, but spiky hair and dense tiny facial tones alter the head read. Review the pair together at 1x/6x. A decision to retain them is entirely reasonable if the differences are judged to be pose compression. Do not normalize color counts for their own sake.
3. **Portobello standing/presenting/porch: tiny-tell verification (three files, still INTENTIONAL VARIANT).** Short hair, office costume, no shades and no fangs are explicitly authorized. No green accent was visible or detected in the 16-color sources; verify whether the earring was intentionally suppressed before proposing any pixel change. This is not a request to restore locs or undo Portobello's transformation.

All remaining states should be left alone on current evidence. The bonnet is documented. The portrait is deliberately a different form factor. Fishing, fish recoil, stage and apron retain enough of the head/shades/earring/black-fit identity despite higher raw color counts. The old apron utensil is a superseded prop issue, not a new continuity task. The empty/cutout throne files are not complete character states and are not classified as identity drift.

`C_continuity_focus.png` provides the closest direct comparison for the three drift concerns. `C_rich_native.png` shows all 33 sprite files without enlargement. `C_rich_01` through `03` show every individual sprite plus the explicitly marked portrait preview; archival/context boards close the file inventory. Full per-state hair, face, skin, earring, proportions, age, density, clothing and recognition observations are in the JSON audit.
'''
(OUT/'RICH_CONTINUITY_AUDIT.md').write_text(md,encoding='utf-8')
print(counts)
