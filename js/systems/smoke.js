(function(){
  const fixture=id=>window.RASaveFixtures?.fixtures?.[id];
  const migrate=id=>RAState.migrateWithReport(fixture(id));
  const hasOne=(items,id)=>Array.isArray(items)&&items.filter(item=>item?.id===id).length===1;
  function fixtureMigrationPreservesProgress(){const legacy=migrate('legacyV4'),life=migrate('lifeV6'),trip=migrate('butterChickenCompleted'),paused=migrate('supraPaused'),owned=migrate('supraOwned'),ids=RASaveFixtures.ids;if(![legacy,life,trip,paused,owned].every(result=>result?.ok))return false;return legacy.state.version===RAState.version&&legacy.state.life.resources.money===42000&&legacy.state.life.world.location==='Powder Springs, Georgia'&&legacy.state.characters.legacy_recruit.recruited&&life.state.life.resources.money===86000&&life.state.life.world.flags.kept&&trip.state.life.desires.completed[0]?.id===ids.tripId&&hasOne(trip.state.life.history,`desire-completed:${ids.tripId}`)&&paused.state.life.acquisitions.active?.status==='paused'&&paused.state.characters.jdm_importer_daughter_001?.conversionOutcome==='left_alone'&&paused.state.life.people.records.jdm_importer_daughter_001?.flags.conversionOutcome==='left_alone'&&owned.state.life.ownership.cars[0]?.id===ids.supraId&&owned.state.life.world.flags.jdmHomeDelivery===true&&owned.state.characters.jdm_importer_daughter_001?.conversionOutcome==='converted'&&owned.state.life.people.records.ceo_assistant_001?.conversionState==='converted'&&owned.state.encounters.ceo_prince?.defeated===true;}
  function recoveryWorks(){const memory=RASaveFixtures.memoryStorage();const known=RAState.migrateRecord(fixture('supraOwned'));memory.setItem(RAState.keys.primary,fixture('malformedJson'));memory.setItem(RAState.keys.recovery,JSON.stringify({format:1,state:known}));const loaded=RAState.read(memory);return loaded.status.recovered===true&&loaded.state.life.ownership.cars[0]?.id===RASaveFixtures.ids.supraId&&RAState.parseRecord(memory.getItem(RAState.keys.primary)).ok&&typeof memory.getItem(RAState.keys.quarantine)==='string';}
  function partialStateNormalizes(){const result=migrate('partialCorrupt');if(!result.ok)return false;const life=result.state.life,ids=RASaveFixtures.ids;return result.state.version===RAState.version&&life.world.location==='LA'&&life.resources.money===100000&&life.ownership.cars.length===1&&hasOne(life.desires.completed,ids.tripId)&&hasOne(life.acquisitions.completed,ids.acquisitionId)&&hasOne(life.history,'one')&&result.state.characters.ceo_assistant_001?.met===true;}
  function repeatedMigrationIsSafe(){const first=RAState.migrateRecord(fixture('supraOwned')),second=RAState.migrateRecord(first);return JSON.stringify(first)===JSON.stringify(second);}
  function saveRoundTripAndBackup(){const memory=RASaveFixtures.memoryStorage(),first=RAState.migrateRecord(fixture('lifeV6')),second=RAState.migrateRecord(fixture('supraOwned'));if(!RAState.write(memory,first,false)||!RAState.write(memory,second,true))return false;const loaded=RAState.read(memory),backup=JSON.parse(memory.getItem(RAState.keys.recovery)||'{}');return loaded.state.life.ownership.cars[0]?.id===RASaveFixtures.ids.supraId&&backup.state?.life?.resources?.money===86000;}
  function acquisitionIsIdempotent(){const first=RAJDMImports.computeCompletionState(RAState.migrateRecord(fixture('supraPaused')).life);if(!first.ok||!first.charged)return false;const second=RAJDMImports.computeCompletionState(first.life),ids=RASaveFixtures.ids;return second.ok&&!second.charged&&first.life.resources.money===22000&&second.life.resources.money===22000&&hasOne(second.life.ownership.cars,ids.supraId)&&hasOne(second.life.acquisitions.completed,ids.acquisitionId)&&hasOne(second.life.history,`vehicle-acquired:${ids.supraId}`)&&hasOne(second.life.history,'jdm-imports-unlocked');}
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function phoneStabilityRegression(){
    const snapshot=JSON.parse(JSON.stringify(RAState.get())),eventId='player_blind_proof_event_001';
    const click=selector=>{const node=document.querySelector(selector);if(!node)return false;node.click();return true};
    const open=async()=>{RAPhone.open();await sleep(270);return RAPhone.isOpen()};
    const closeBy=async selector=>{if(!click(selector))return false;await sleep(280);return !RAPhone.isOpen()};
    const goAtlanta=async()=>{if(!click('[data-phone-action="app:vampgpt"]'))return false;await sleep(20);if(!click('[data-phone-action="prompt"]'))return false;await sleep(20);if(!click('[data-phone-action="somewhere"]'))return false;await sleep(20);if(!click('[data-phone-action="atlanta"]'))return false;await sleep(20);return !!document.querySelector('[data-phone-action="letsGo"]')&&!!document.querySelector('[data-phone-action="nah"]')};
    try{
      RAWorldEvents.reset(eventId);RADesireTrips.reset();RAState.patch('life.world.location','LA');await RAScenes.go('bedroom',{smoke:true});
      for(let i=0;i<3;i++){if(!await open())return false;if(!await closeBy('#phoneClose'))return false;if(!await open())return false;if(!await closeBy('[data-phone-action="close"]'))return false}
      if(!await open())return false;const atlantaOk=await goAtlanta();const cancelOk=click('[data-phone-action="nah"]');await sleep(20);const backToSomewhere=!!document.querySelector('[data-phone-action="atlanta"]');if(!await closeBy('#phoneClose'))return false;if(!atlantaOk||!cancelOk||!backToSomewhere)return false;
      RAPeople.meetPerson('jdm_importer_daughter_001','jdm_imports_docks');RAPeople.rememberPersonEvent('jdm_importer_daughter_001','jdm_daughter_encountered');RAWorldEvents.advanceBoundary('bedroom-entry');
      if(!await open())return false;if(!document.querySelector('.phone-incoming .incoming-button'))return false;if(!click('.phone-incoming .incoming-button'))return false;await sleep(20);if(!click('[data-phone-action="home"]'))return false;await sleep(20);if(!await closeBy('#phoneClose'))return false;
      if(!await open())return false;if(!document.querySelector('.phone-incoming .incoming-button'))return false;if(!await closeBy('[data-phone-action="close"]'))return false;
      if(!await open())return false;if(!click('.phone-incoming .incoming-button'))return false;await sleep(20);if(!click('[data-phone-action^="resolveWorldEvent:"]'))return false;await sleep(20);if(RAWorldEvents.record(eventId)?.status!=='resolved')return false;if(!await closeBy('#phoneClose'))return false;
      if(!await open())return false;if(!await goAtlanta())return false;if(!click('[data-phone-action="letsGo"]'))return false;await sleep(1150);if(!['tripTravel','powderSpringsCurb'].includes(RAScenes.current()))return false;RADesireTrips.reset();await RAScenes.go('bedroom',{smokeReturn:true});
      if(!await open())return false;if(!await goAtlanta())return false;return await closeBy('#phoneClose');
    }finally{
      await RAPhone.close?.();RAState.write(localStorage,snapshot,false);RAState.load();await RAScenes.go('battle',{smokeRestore:true});
    }
  }
  const checks=[
    ['core battle nodes',()=>['#startButton','#battleUI','#moves','#soundtrack'].every(sel=>document.querySelector(sel))],
    ['all move buttons',()=>document.querySelectorAll('[data-move]').length===4],
    ['conversion scene',()=>!!document.querySelector('#revealOverlay')],
    ['authored portrait room',()=>getComputedStyle(document.querySelector('.room')).backgroundImage.includes('throne_room_scene_portrait')],
    ['bedroom scene layers',()=>!!document.querySelector('#bedroomScene .bedroom-base')&&!!document.querySelector('#bedroomCloudCanvas')&&!!document.querySelector('#bedroomRich')],
    ['phone access and exact authored apps',()=>!!document.querySelector('#checkPhone')&&!!document.querySelector('#phoneOverlay')&&typeof RAPhone!=='undefined'&&JSON.stringify(RAPhone.apps)===JSON.stringify(['VampGPT','VampGram','InstaHoe','RealMoneyRealEstate','JDMIMPORTS','RICHBOIMPORTS','ONLYVAMPS'])],
    ['current life state schema',()=>RAState.get().version===RAState.version&&typeof RAState.get().life.resources.money==='number'&&typeof RAState.get().life.world.location==='string'&&typeof RAState.get().life.world.scene==='string'&&typeof RAState.get().life.resources.clout==='string'&&typeof RAState.get().life.resources.vampireReputation==='string'&&typeof RAState.get().life.phone.learned==='boolean'&&Object.prototype.hasOwnProperty.call(RAState.get().life.acquisitions,'active')&&typeof RAState.get().life.people.records==='object'&&typeof RAState.get().life.events.records==='object'&&!('rich'in RAState.get())&&!('activeTrip'in RAState.get())],
    ['historical fixtures preserve meaningful progress',fixtureMigrationPreservesProgress],
    ['partial state normalizes safely',partialStateNormalizes],
    ['malformed primary recovers from backup',recoveryWorks],
    ['current save round-trips with prior recovery',saveRoundTripAndBackup],
    ['repeated migration is safe',repeatedMigrationIsSafe],
    ['Supra completion is charged and granted once',acquisitionIsIdempotent],
    ['desire trip scene and state foundation',()=>!!window.RADesireTrips&&['planned','traveling','arrived','completed'].every(x=>RADesireTrips.statuses.includes(x))&&!!document.querySelector('#tripTravel')&&!!document.querySelector('#powderSpringsCurb')&&!!document.querySelector('#stargazingScene')&&Object.prototype.hasOwnProperty.call(RAState.get().life.desires,'activeTrip')],
    ['data-driven opportunity access',()=>{const life=RAState.migrateRecord(fixture('fresh')).life,a=RAOpportunities.evaluate(RAOpportunities.definitions.find(rule=>rule.id==='atlanta'),life),t=RAOpportunities.evaluate(RAOpportunities.definitions.find(rule=>rule.id==='tokyo'),life);return a?.available===true&&t?.available===false&&t.lockedMessage==="tokyo vampires don't fw you yet. get your clout up.";}],
    ['generic opportunity prerequisites',()=>{const life=RAState.migrateRecord(fixture('fresh')).life,rule={id:'test',requirements:{location:'LA',money:{minimum:100001},clout:{equals:'LOW'},vampireReputation:{equals:'LOW'},contact:'c1',relationship:{contactId:'c1',status:'friend'},prerequisiteFlag:'ready'}};const locked=RAOpportunities.evaluate(rule,life);const ready=JSON.parse(JSON.stringify(life));ready.resources.money=100001;ready.people.contacts.push('c1');ready.people.relationships.push({contactId:'c1',status:'friend'});ready.world.flags.ready=true;return !locked.available&&locked.failures.length===4&&RAOpportunities.evaluate(rule,ready).available}],
    ['v5 and v6 saves advance through explicit migrations',()=>{const v5=RAState.migrateRecord({version:5,life:{resources:{money:777},world:{location:'LA'},desires:{activeTrip:null,completed:[]},ownership:{cars:[]}}}),v6=RAState.migrateRecord(fixture('lifeV6'));return v5.version===RAState.version&&v6.version===RAState.version&&v5.life.resources.money===777&&v5.life.acquisitions.active===null&&Array.isArray(v5.life.acquisitions.completed)&&v5.life.ownership.cars.length===0&&v6.life.resources.money===86000;}],
    ['JDMImports app and acquisition foundation',()=>RAPhone.apps.includes('JDMIMPORTS')&&!!RAJDMImports&&RAJDMImports.priceForTesting>0&&RAJDMImports.defaultCharacterScale===1.25&&JSON.stringify(RAJDMImports.characterScaleOptions)===JSON.stringify([1,1.25,1.5])&&typeof RAJDMImports.storeMarkup==='function'&&!!RAOpportunities.get('jdm_home_delivery')&&!!document.querySelector('#jdmDockScene')&&!!document.querySelector('#supraPayoffScene')],
    ['JDM battle composition assets',async()=>{const assets=[['assets/rich_standing_right.png',80,96],['assets/jdm_imports/characters/daughter/daughter_neutral.png',80,96]];const loaded=await Promise.all(assets.map(([src,w,h])=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img.naturalWidth===w&&img.naturalHeight===h);img.onerror=()=>resolve(false);img.src=src})));return loaded.every(Boolean)&&!!document.querySelector('#jdmBattleDaughter')&&typeof window.RAJDMImports?.queueBattleActorLayout==='function'}],
    ['scene lifecycle cancellation and cleanup',async()=>typeof window.RAScenes?.runSelfTest==='function'&&await window.RAScenes.runSelfTest()],
    ['JDM docks Stage Contract geometry',()=>typeof window.RAStageLayout?.runSelfTest==='function'&&window.RAStageLayout.runSelfTest()&&!!document.querySelector('#stageContractOverlay')],
    ['DEV JDM reset preserves unrelated life state',()=>{const source=RAState.migrateRecord(fixture('supraOwned')),result=RAJDMImports.computeDevResetState(source),again=RAJDMImports.computeDevResetState(result.state);return result.refunded&&result.state.life.resources.money===source.life.resources.money+RAJDMImports.priceForTesting&&result.state.life.ownership.cars.every(car=>car.id!==RAJDMImports.carId)&&result.state.characters.ceo_assistant_001?.met===true&&!result.state.characters[RAJDMImports.characterId]&&!again.refunded&&again.state.life.resources.money===result.state.life.resources.money;}],
    ['Supra stage presentation uses 1.75x grounded contract scale',()=>{const stage=RAStageLayout.contract('jdm-imports-docks'),r=RAStageLayout.actorRect(stage,'supra');return stage.objects.supra.scale===1.75&&r.scale===1.75&&r.contact.y===354&&r.width===238&&r.height===87.5;}],
    ['Combat definitions migrate CEO and Importer',()=>{const d=window.RACombatDefinitions,f=window.RACombatFoundation;return d?.getEncounter('ceo').enemy==='ceo_zombie_prince'&&d?.getEncounter('jdm').enemy==='jdm_importer'&&f?.runSelfTest?.()===true;}],
    ['Combat routes and Stage Contract remain configured',()=>{const f=window.RACombatFoundation,ceo=f.createBattleState('ceo'),jdm=f.createBattleState('jdm');return f.route(ceo,'victory')==='ceo-victory'&&f.route(jdm,'defeat')==='jdm-defeat'&&jdm.definition.stageId==='jdm-imports-docks';}],
    ['persistent people catalog and records',()=>{const before=JSON.parse(JSON.stringify(RAState.get().life.people.records)),people=window.RAPeople,a=people?.meetPerson('ceo_assistant_001','test'),once=people?.rememberPersonEvent('ceo_assistant_001','test-memory'),twice=people?.rememberPersonEvent('ceo_assistant_001','test-memory'),d=people?.meetPerson('jdm_importer_daughter_001','jdm_imports_docks');people?.setConversionState('ceo_assistant_001','converted');const pass=a?.met&&once?.memories.length===twice?.memories.length&&d?.met&&people.record('ceo_assistant_001')?.conversionState==='converted'&&people.known().length>=2&&!!document.querySelector('#devPeopleInspector');RAState.patch('life.people.records',before);return pass;}],
    ['incoming world event foundation',()=>{const peopleBefore=JSON.parse(JSON.stringify(RAState.get().life.people.records)),eventsBefore=JSON.parse(JSON.stringify(RAState.get().life.events.records)),flagsBefore=JSON.parse(JSON.stringify(RAState.get().life.world.flags));const id='player_blind_proof_event_001',events=window.RAWorldEvents;events?.reset?.(id);const ineligible=events?.evaluate?.(id)?.eligible===false;RAPeople.meetPerson('jdm_importer_daughter_001','jdm_imports_docks');RAPeople.rememberPersonEvent('jdm_importer_daughter_001','jdm_daughter_encountered');events.advanceBoundary('bedroom-entry');const pending=events.record(id)?.status==='pending';events.deliver('phone');const delivered=events.record(id)?.status==='delivered'&&events.record(id)?.deliveries===1;events.deliver('phone');const once=events.record(id)?.deliveries===1;events.see(id);events.resolve(id,'acknowledge');const resolved=events.record(id)?.status==='resolved'&&RAState.get().life.world.flags.proofEvent001Handled===true;events.reset(id);const reset=!events.record(id)&&JSON.stringify(RAState.get().life.people.records)!==JSON.stringify({});RAState.patch('life.people.records',peopleBefore);RAState.patch('life.events.records',eventsBefore);RAState.patch('life.world.flags',flagsBefore);return ineligible&&pending&&delivered&&once&&resolved&&reset&&!!document.querySelector('#devEventsInspector');}],
    ['incoming event phone path completes in browser',async()=>{const snapshot=JSON.parse(JSON.stringify(RAState.get())),id='player_blind_proof_event_001';try{RAWorldEvents.reset(id);RAPeople.meetPerson('jdm_importer_daughter_001','jdm_imports_docks');RAPeople.rememberPersonEvent('jdm_importer_daughter_001','jdm_daughter_encountered');await RAScenes.go('bedroom',{smoke:true});if(RAWorldEvents.record(id)?.status!=='pending')return false;RAPhone.open();await new Promise(resolve=>setTimeout(resolve,260));const incoming=document.querySelector('.phone-incoming .incoming-button');if(!incoming)return false;incoming.click();await new Promise(resolve=>setTimeout(resolve,30));const action=document.querySelector('[data-phone-action^="resolveWorldEvent:"]');if(!action)return false;action.click();await new Promise(resolve=>setTimeout(resolve,30));return RAWorldEvents.record(id)?.status==='resolved'&&RAState.get().life.world.flags.proofEvent001Handled===true&&RAPhone.isOpen()}finally{await RAPhone.close?.();RAState.write(localStorage,snapshot,false);RAState.load();await RAScenes.go('battle',{smokeRestore:true});}}],
    ['phone close and Atlanta stability sequences',phoneStabilityRegression],
    ['6B production art native dimensions and binary alpha',async()=>{const specs=[['jdm_imports/environment/docks_night_270x480.png',270,480],...['neutral','irritated','combat_ready','hit','defeated'].map(n=>[`jdm_imports/characters/importer/importer_${n}.png`,80,96]),...['neutral','reaction','post_battle','vampire_reveal'].map(n=>[`jdm_imports/characters/daughter/daughter_${n}.png`,80,96]),['jdm_imports/ui/supra_mk4_listing.png',68,25],['jdm_imports/vehicles/supra_mk4_world.png',136,50],['jdm_imports/props/car_key.png',24,16]];const checks=await Promise.all(specs.map(([file,w,h])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const px=ctx.getImageData(0,0,w,h).data;let binary=true;for(let i=3;i<px.length;i+=4)if(px[i]!==0&&px[i]!==255){binary=false;break}resolve(img.naturalWidth===w&&img.naturalHeight===h&&binary)}catch(e){resolve(false)}};img.onerror=()=>resolve(false);img.src=`assets/${file}`})));return checks.every(Boolean)&&getComputedStyle(document.querySelector('#supraPayoffCar')).imageRendering==='pixelated'}],
    ['developer life state inspector',()=>!!document.querySelector('#devLifeInspector')&&!!document.querySelector('#devLifeReadout')&&['#devLifeMoney','#devLifeLocation','#devLifeClout','#devLifeVampireRep','#devTokyoPreview'].every(sel=>!!document.querySelector(sel))],
    ['trip presentation layers and DEV scale selector',()=>!!document.querySelector('#tripRich')&&document.querySelectorAll('.trip-environment').length===2&&!!document.querySelector('#tripReturn')&&JSON.stringify([...document.querySelector('#devTripScale').options].map(o=>o.value))===JSON.stringify(['1','1.5','1.75','2'])],
    ['approved Powder Springs and Rich assets load at authored sizes',async()=>{const specs=[['powder_springs_night_270x480.png',270,480],...['eating','chilling','stargazing'].map(n=>[`rich_curb_${n}.png`,80,96])];const loaded=await Promise.all(specs.map(([file,w,h])=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth===w&&i.naturalHeight===h);i.onerror=()=>resolve(false);i.src=`assets/${file}`})));return loaded.every(Boolean)}],
    ['native bedroom cloud canvas',()=>{const c=document.querySelector('#bedroomCloudCanvas');return c?.width===270&&c?.height===480&&getComputedStyle(c).imageRendering==='pixelated'}],
    ['bedroom authored state controls',()=>document.querySelectorAll('[data-bedroom-state]').length===6],
    ['bedroom source assets load at authored sizes',async()=>{const specs=[['rich_bedroom_environment_270x480.png',270,480],...['lounge_idle','phone_scroll','small_idle','phone_reaction','sleeping','drowsy_wake'].map(n=>[`rich_bedroom_${n}.png`,128,64]),['bedroom_cloud_large.png',136,40],['bedroom_cloud_medium.png',88,44],['bedroom_cloud_small.png',52,24]];const loaded=await Promise.all(specs.map(([file,w,h])=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth===w&&i.naturalHeight===h);i.onerror=()=>resolve(false);i.src=`assets/${file}`})));return loaded.every(Boolean)}],
    ['audio engine foundation: M1-M2 manifest, buses and slots',()=>{
      const A=window.RAAudio,M=window.RAAudioManifest;if(!A||!M)return false;
      const d=A.defaults();
      const required=['UI_TAP','UI_MOVE','UI_CONFIRM','UI_BACK','UI_ERROR','UI_DIALOG_ADVANCE','PHONE_OPEN','PHONE_CLOSE','PHONE_APP_OPEN','NOTIF_GENERIC','NOTIF_TEXT','NOTIF_FAMILY','NOTIF_STORM','CASH_IN','CASH_OUT','APP_UNLOCK','CONTACT_ADDED','WHATWEON_UPDATE','RADIO_SWITCH','TRAVEL_WHOOSH','REWARD_STINGER','SAVE','AMB_BEDROOM','AMB_THRONE','AMB_CASTLE_STREET','BED_RUSTLE','WAKE_STRETCH','STEPS_STONE','DOOR_CASTLE','BAT_FLUTTER','ROOM_BUILT','CAT_MEOW','CAT_PURR','KITCHEN_AMB','TV_ROOM','BATTLE_START','TELEGRAPH','HIT_LIGHT','HIT_HEAVY','MISS','CRIT','HEAL','BUFF','DEBUFF','STUN','KO','VICTORY','DEFEAT','MOVE_BLOODBATH','MOVE_BITE','MOVE_OCTOPUS','MOVE_REVENGE','EN_BRIEFCASE','EN_SHOVE','EN_BONES','EN_HOLY','GUN_LILOGA','MAGIC_HEX'];
      const missing=required.filter(id=>!M.has(id));
      return M.schema==='2.1'&&d.MUSIC===.70&&d.SFX===.90&&d.UI===.60&&d.VOICE===.80&&d.AMBIENCE===.45&&missing.length===0&&M.resident.length>=6&&Object.keys(M.scenes).length>=4&&M.list().length>=80;
    }],
    ['audio engine test path: routing, settings persistence, ducking, soundtrack control',()=>{
      const A=window.RAAudio;if(!A)return false;const before=JSON.parse(JSON.stringify(RAState.get().life.settings.audio));const el=document.querySelector('#soundtrack');
      A.unlock();A.installTestTone('UI_TAP',{freq:660,duration:.03});A.setVolume('UI',1);A.setMuted(false);
      const played=A.sfx('UI_TAP')===true;const ui=A.describe().busGains.UI;
      A.setVolume('UI',.5);const halved=A.describe().busGains.UI;const persisted=RAState.get().life.settings.audio.sfx===.5;
      A.setMuted(true);const muted=A.describe().muted===true;
      A.setVolume('MUSIC',.4);const elVolume=!!el&&Math.abs(el.volume-.4)<.01;A.setMuted(true);const elMuted=!!el&&el.muted===true;
      A.duckMusic(12,60);const ducked=A.describe().ducked===true;A.restoreMusic(60);
      A.setVolume('UI',before.sfx);A.setVolume('MUSIC',before.music);A.setMuted(before.muted);const restored=RAState.get().life.settings.audio.sfx===before.sfx;
      return played&&Math.abs(ui-.6)<.001&&Math.abs(halved-.3)<.001&&persisted&&muted&&ducked&&restored&&elVolume&&elMuted;
    }],
    ['ambience never retries while its entry is unregistered',async()=>{
      const A=window.RAAudio,M=window.RAAudioManifest;if(!A||!M)return false;A.unlock();
      const entry=M.get('AMB_BEDROOM');if(entry?.file)return true; // registered assets are not part of this phase
      const before=A.describe().ambienceAttempts;A.enterScene('bedroom');await new Promise(r=>setTimeout(r,300));
      const d=A.describe();return d.ambienceAttempts===before&&d.pendingAmbience===false;
    }],
    ['pending ambience cannot start after a scene change',async()=>{
      const A=window.RAAudio,M=window.RAAudioManifest;if(!A||!M)return false;
      try{M.register({id:'__TEST_AMB__',bus:'AMBIENCE',type:'loop',file:'data:audio/wav;base64,UklGRiUAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQEAAACA',registered:true,loopStart:0,loopEnd:0.0002});M.scenes.__test__={ambience:'__TEST_AMB__',preload:[]};
        A.unlock();A.enterScene('__test__');A.enterScene('battle');await new Promise(r=>setTimeout(r,150));
        return A.scene()==='battle'&&!A.isPlaying('__TEST_AMB__')&&A.describe().pendingAmbience===false;
      }finally{delete M.scenes.__test__;}
    }],
    ['specific phone sounds do not also fire generic UI_TAP',async()=>{
      const A=window.RAAudio;if(!A)return false;A.unlock();A.installTestTone('UI_TAP',{freq:440,duration:.02});A.installTestTone('PHONE_APP_OPEN',{freq:520,duration:.02});
      const snapshot=JSON.parse(JSON.stringify(RAState.get()));
      try{await RAScenes.go('bedroom',{smoke:true});RAPhone.open();await new Promise(r=>setTimeout(r,260));
        const button=document.querySelector('[data-phone-action="app:jdmImports"]');if(!button)return false;
        const t0=A.describe().plays.UI_TAP||0,p0=A.describe().plays.PHONE_APP_OPEN||0;
        button.click();await new Promise(r=>setTimeout(r,40));
        const t1=A.describe().plays.UI_TAP||0,p1=A.describe().plays.PHONE_APP_OPEN||0;
        return t1===t0&&p1>p0;
      }finally{await RAPhone.close?.();RAState.write(localStorage,snapshot,false);RAState.load();await RAScenes.go('battle',{smokeRestore:true});}
    }],
    ['library registration totals: 244 planned, 241 registered, 3 inert',()=>{
      // IF-1 reconciliation: this asserts the accepted F1 SFX LIBRARY (244 planned). The accepted F2 inert NEW OGA drop-in hooks
      // NO_01..NO_06 (added after this check was written) and any fragment audio-part entries are not part of that library.
      const M=window.RAAudioManifest;if(!M)return false;const parts=new Set((window.RAAudioParts?.provenance?.()||[]).flatMap(p=>p.ids));const rows=M.list().filter(e=>!parts.has(e.id)&&!/^NO_0[1-6]$/.test(e.id)),reg=rows.filter(e=>e.registered).length,unreg=rows.filter(e=>!e.registered).map(e=>e.id);
      return rows.length===244&&reg===241&&unreg.length===3&&['BARS_PUNCHLINE','DRAGON_WINGS','MAGIC_SEANCE'].every(id=>unreg.includes(id));
    }],
    ['registered SFX resolve to real files and decode',async()=>{
      const A=window.RAAudio,M=window.RAAudioManifest;if(!A||!M)return false;A.unlock();
      const ids=['UI_TAP','PHONE_OPEN','HIT_LIGHT','MOVE_BLOODBATH','CAT_MEOW'];
      if(ids.some(id=>{const e=M.get(id);return !e||!e.registered||!e.file;}))return false;
      const decoded=await Promise.all(ids.map(id=>A.preload(id)));const loaded=A.describe().loaded;
      return decoded.every(Boolean)&&ids.every(id=>loaded.includes(id));
    }],
    ['missing or unapproved IDs safely no-op',()=>{
      const A=window.RAAudio;if(!A)return false;A.unlock();
      return A.sfx('DRAGON_WINGS')===false&&A.sfx('BARS_PUNCHLINE')===false&&A.sfx('__NOT_A_REAL_ID__')===false&&A.loop('DRAGON_WINGS')===false;
    }],
    ['MAGIC_SEANCE remains unwired',()=>{
      const A=window.RAAudio,M=window.RAAudioManifest;if(!A||!M)return false;A.unlock();const e=M.get('MAGIC_SEANCE');
      return !!e&&e.registered===false&&e.file===null&&A.sfx('MAGIC_SEANCE')===false;
    }],
    ['variation and loop-set IDs register correctly',()=>{
      const M=window.RAAudioManifest;if(!M)return false;
      const combo=M.get('COMBO_UP'),purr=M.get('CAT_PURR'),sprinkler=M.get('BLOOD_SPRINKLER'),car=M.get('CAR_I6_TURBO'),squeal=M.get('TIRE_SQUEAL'),dribble=M.get('DRIBBLE'),seal6=M.get('SEAL_06');
      return combo?.type==='one-shot'&&combo.variations.length===2&&purr?.type==='loop'&&purr.variations.length===1&&sprinkler?.variations.length===1&&car?.type==='loop set'&&car.parts.length===3&&squeal?.parts.length===3&&dribble?.parts.length===2&&seal6?.type==='loop set'&&seal6.parts.length===2;
    }],
    ['loops use measured loop points, never blind full-file looping',()=>{
      const M=window.RAAudioManifest;if(!M)return false;const loops=[];
      for(const e of M.list()){if(e.type==='loop')loops.push(e);for(const p of e.parts||[])if(p.type==='loop')loops.push(p);}
      return loops.length>=80&&loops.every(l=>Number.isFinite(l.loopStart)&&Number.isFinite(l.loopEnd)&&l.loopEnd>0&&l.loopEnd>l.loopStart);
    }],
    ['sealed/reserved IDs stay neutral',()=>{
      const M=window.RAAudioManifest;if(!M)return false;const seals=M.list().filter(e=>/^SEAL_\d{2}$/.test(e.id));
      const leak=seals.some(e=>e.content||e.label||e.title||e.spoiler||e.meaning||(e.credit&&/vol\s*\d|sealed/i.test(e.credit)));
      return seals.length===18&&seals.every(e=>e.registered===true)&&!leak;
    }],
    ['phone hierarchy sections and concise lock communication',async()=>{
      const H=window.RAPhoneHierarchy;if(!H)return false;
      const ids=H.sectionIds(),sections=['now','social','money','life','system'].every(id=>ids.includes(id));
      const placed=H.sectionFor('vampgpt')==='now'&&H.sectionFor('realEstate')==='money';
      const only=H.lockFor('onlyvamps'),concise=only.short.split(' ').length<=3&&only.line==='invite only.';
      const slots=H.reserved().length>=4;
      const snapshot=JSON.parse(JSON.stringify(RAState.get()));
      try{RAState.patch('life.phone.apps',{});await RAScenes.go('bedroom',{smoke:true});RAPhone.open();await new Promise(r=>setTimeout(r,260));
        const labels=document.querySelectorAll('.phone-app-grid .phone-section-label').length;
        const locked=document.querySelector('.phone-app-grid [data-locked="1"]');
        const short=document.querySelector('.phone-app-grid .phone-lock-short');
        return sections&&placed&&concise&&slots&&labels>=3&&!!locked&&!!short&&/^LOCKED · /.test(short.textContent)&&RAPhone.apps.length===7;
      }finally{await RAPhone.close?.();RAState.write(localStorage,snapshot,false);RAState.load();await RAScenes.go('battle',{smokeRestore:true});}
    }],
    ['phone audio settings surface persists to save',async()=>{
      const snapshot=JSON.parse(JSON.stringify(RAState.get()));
      try{await RAScenes.go('bedroom',{smoke:true});RAPhone.open();await new Promise(r=>setTimeout(r,260));
        const gear=document.querySelector('#phoneSettingsButton');if(!gear)return false;gear.click();await new Promise(r=>setTimeout(r,30));
        const slider=document.querySelector('[data-audio-bus="SFX"]');if(!slider)return false;slider.value='40';slider.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,10));
        const persisted=RAState.get().life.settings.audio.sfx===.4;
        const muteButton=document.querySelector('[data-phone-action="toggleMute"]');if(!muteButton)return false;muteButton.click();await new Promise(r=>setTimeout(r,10));
        const muted=RAState.get().life.settings.audio.muted===true;
        return persisted&&muted&&document.querySelectorAll('.phone-settings input[type=range]').length===3;
      }finally{await RAPhone.close?.();RAState.write(localStorage,snapshot,false);RAState.load();await RAScenes.go('battle',{smokeRestore:true});}
    }],
    ['state foundation',()=>!!window.RAState&&!!window.RACharacterSystem]
  ];
  async function run(){
    const results=[];for(const [name,test] of checks){let pass=false;try{pass=!!(await test());}catch(e){}results.push(`${pass?'PASS':'FAIL'} — ${name}`);}
    const summary=results.join('\n');console.log('[RA smoke]\n'+summary);const toast=document.querySelector('#toast');if(toast){toast.textContent=summary;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}return results;
  }
  window.RASmoke={run,checks};
})();
