(function(){
 const rich={id:'rich_alucard',name:'RICH ALUCARD',maxHP:100,moves:['blood','octopus','bite','revenge']};
 const moves={blood:{id:'blood',name:'BLOOD BATH',damage:26,presentation:'blood-bath'},octopus:{id:'octopus',name:'OCTOPUS BRAIN',damage:18,presentation:'octopus-brain'},bite:{id:'bite',name:'VAMPIRE BITE',damage:24,heal:18,presentation:'vampire-bite'},revenge:{id:'revenge',name:'REVENGE',damage:0,presentation:'revenge-reflection'},briefcase_throw:{id:'briefcase_throw',damage:16,presentation:'briefcase'},importer_shove:{id:'importer_shove',damage:16,presentation:'importer-shove'}};
 const combatants={rich,ceo_zombie_prince:{id:'ceo_zombie_prince',name:'CEO ZOMBIE PRINCE',maxHP:100,moves:['briefcase_throw']},jdm_importer:{id:'jdm_importer',name:'JDM IMPORTER',maxHP:100,moves:['importer_shove']}};
 const weighted=(moves)=>({type:'weighted',moves});
 const encounters={ceo:{id:'ceo',stageId:null,player:'rich',enemy:'ceo_zombie_prince',enemySelection:weighted([{move:'briefcase_throw',weight:1}]),victoryRoute:'ceo-victory',defeatRoute:'ceo-defeat',presentation:'ceo'},jdm:{id:'jdm',stageId:'jdm-imports-docks',player:'rich',enemy:'jdm_importer',enemySelection:weighted([{move:'importer_shove',weight:1}]),victoryRoute:'jdm-victory',defeatRoute:'jdm-defeat',presentation:'jdm'}};
 window.RACombatDefinitions={moves,combatants,encounters,getEncounter:id=>encounters[id]||encounters.ceo};
})();
