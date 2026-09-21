(function(){
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const profiles={normal:{stop:55,recoil:2,shake:'light',fragments:5,flash:'white'},heavy:{stop:85,recoil:4,shake:'heavy',fragments:9,flash:'white'},lethal:{stop:105,recoil:6,shake:'heavy',fragments:13,flash:'silhouette'}};
  function targetNode(target){return typeof target==='string'?document.querySelector(target):target;}
  function burst(target,kind,count){
    const host=document.querySelector('#combatEffects')||document.querySelector('#attackLayer');
    if(!host)return;
    const rect=targetNode(target)?.getBoundingClientRect(), hostRect=host.getBoundingClientRect();
    const anchor=rect?{x:rect.left-hostRect.left+rect.width*.5,y:rect.top-hostRect.top+rect.height*.42}:{x:0,y:0};
    for(let i=0;i<count;i++){
      const bit=document.createElement('i'); bit.className=`contact-fragment ${kind||'blood'}`;
      bit.style.left=`${anchor.x}px`; bit.style.top=`${anchor.y}px`;
      bit.style.setProperty('--dx',`${Math.round((Math.random()-.5)*34)}px`); bit.style.setProperty('--dy',`${Math.round((Math.random()-.5)*28)}px`); bit.style.setProperty('--delay',`${i*12}ms`);
      host.appendChild(bit); setTimeout(()=>bit.remove(),380);
    }
  }
  async function play(spec={}){
    const profile=profiles[spec.severity||'normal']||profiles.normal, target=targetNode(spec.target), attacker=targetNode(spec.attacker), stage=document.querySelector('#screen'), kind=spec.kind||'blood';
    spec.onPhase?.('CONTACT'); target?.classList.add('combat-contact'); await wait(spec.contactMs??45);
    spec.onPhase?.('HIT-STOP'); stage?.classList.add('combat-hit-stop'); await wait(profile.stop); stage?.classList.remove('combat-hit-stop');
    spec.onPhase?.('WHITE/SILHOUETTE FLASH'); target?.classList.add(profile.flash==='silhouette'?'combat-silhouette-flash':'combat-white-flash'); await wait(70); target?.classList.remove('combat-white-flash','combat-silhouette-flash');
    spec.onPhase?.('CONTACT BURST'); burst(target,kind,profile.fragments);
    spec.onPhase?.('RECOIL'); target?.classList.add(`combat-recoil-${profile.shake}`); attacker?.classList.add('combat-attacker-commit'); stage?.classList.add(`combat-shake-${profile.shake}`); await wait(150);
    target?.classList.remove('combat-recoil-light','combat-recoil-heavy'); attacker?.classList.remove('combat-attacker-commit'); stage?.classList.remove('combat-shake-light','combat-shake-heavy');
    spec.onPhase?.('HP DRAIN'); await spec.drain?.(); spec.onPhase?.('RECOVERY'); await wait(spec.recoveryMs??90); target?.classList.remove('combat-contact');
  }
  window.RACombatPresentation={play,profiles,burst};
})();
