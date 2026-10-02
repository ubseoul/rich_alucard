from build_review import *

def paste(canvas,name,x,y):
    a=Image.open(ROOT/'assets'/name).convert('RGBA'); canvas.alpha_composite(a,(x,y))
def stage():
    a=Image.new('RGBA',(270,480),(25,29,40,255)); d=ImageDraw.Draw(a)
    d.line((0,346,270,346),fill='#454453');
    paste(a,'rich_seated_idle.png',12,258); paste(a,'ceo_idle.png',164,258)
    return a
def label(a,txt):
    d=ImageDraw.Draw(a);d.rectangle((0,0,269,32),fill='#11151e');d.text((8,8),txt,font=FONT,fill='white')
    d.rectangle((0,396,269,479),fill='#11151e'); d.text((8,405),'REVIEW ONLY - NATIVE 1x',font=FONT,fill='#e8bf6a')
    d.text((8,429),'No timing / runtime claim',font=FONT,fill='#acb7c7')
    return a
for move in ['blood_bath','vampire_bite','revenge','octopus_brain']:
    frames=[]
    for i in range(4):
        a=stage()
        if move=='blood_bath':
            if i==0: paste(a,'blood_orb.png',115,290); paste(a,'blood_bath_floor_rise_01.png',0,-16)
            if i==1: paste(a,'blood_bath_floor_rise_02.png',0,-16); paste(a,'blood_bath_contact_01.png',156,263)
            if i==2: a=Image.open(ROOT/'assets/blood_bath_impact_fullscreen.png').convert('RGBA')
            if i==3: paste(a,'blood_bath_floor_rise_03.png',0,-16);paste(a,'ceo_recoil_heavy.png',164,258);paste(a,'blood_bath_engulf_overlay_02.png',156,258);paste(a,'blood_bath_foreground_01.png',0,-16)
        elif move=='vampire_bite':
            if i==0: paste(a,'vampire_bite_jaw_upper.png',0,-110);paste(a,'vampire_bite_jaw_lower.png',0,110)
            if i==1: paste(a,'vampire_bite_contact.png',172,279)
            if i==2: paste(a,'vampire_bite_snap_closed.png',0,0)
            if i==3:
                for j,n in enumerate(['drop_01','orb_01','drop_02']): paste(a,'vampire_bite_lifesteal_'+n+'.png',90+j*30,290-j*8)
        elif move=='revenge':
            if i==0:
                for j in range(4): paste(a,f'revenge_stored_wound_0{j+1}.png',38+j*5,290+j*7)
            if i==1:
                paste(a,'revenge_mass_03.png',88,260)
                for j in range(4): paste(a,f'revenge_extraction_0{j+1}.png',60+j*14,286)
            if i==2: a=Image.open(ROOT/'assets/revenge_impact_fullscreen.png').convert('RGBA')
            if i==3:
                paste(a,'ceo_recoil_heavy.png',164,258)
                # Diagnostic target-local crop, no permanent target-specific core asset.
                crack=Image.open(ROOT/'assets/revenge_target_crack_03.png').convert('RGBA')
                mask=Image.new('L',(96,96)); target=Image.open(ROOT/'assets/ceo_recoil_heavy.png').convert('RGBA');mask.paste(target.getchannel('A'),(8,0))
                import PIL.ImageChops
                crack.putalpha(PIL.ImageChops.multiply(crack.getchannel('A'),mask));a.alpha_composite(crack,(156,258))
        else:
            paste(a,f'octopus_brain_{"abcd"[i]}.png',0,-16)
        phases=['ANTICIPATION','CONTACT / ACTION','IMPACT','AFTERMATH'] if move!='octopus_brain' else ['EMERGENCE A','RISE B','HELD TENTACLES C','HELD VARIATION D']
        frames.append(label(a,phases[i]))
    b=Image.new('RGB',(1140,595),(18,22,31));d=ImageDraw.Draw(b)
    d.text((15,14),move.upper().replace('_',' ')+' | 270px phone-scale diagnostic',font=TITLE,fill='white')
    d.text((15,49),'Unchanged source components; illustrative order and anchors, not captured gameplay.',font=FONT,fill='#e8bf6a')
    for i,a in enumerate(frames): b.paste(a,(15+i*285,88))
    b.save(REVIEW/f'B_phone_{move}.png')
print('Four 1x phone-scale diagnostic strips built.')
