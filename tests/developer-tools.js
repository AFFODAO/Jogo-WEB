const debugIds=id=>document.getElementById(id);
const debugButton=text=>[...document.querySelectorAll('#developerTools button')].find(button=>button.textContent===text);
const debugToggle=enabled=>{debugIds('developerModeToggle').checked=enabled;debugIds('developerModeToggle').dispatchEvent(new Event('change',{bubbles:true}));};
const debugUnchanged=(saved,history)=>assert(localStorage.getItem(SAVE_KEY)===saved&&localStorage.getItem(QUESTION_HISTORY_KEY)===history,'debug session changed legitimate save or quiz history');
setup(0);endPhaseIntro();campaignStarted=true;saveCampaign();
test('developer tools: organized Portuguese controls stay hidden outside a session',()=>{
  assert(!developerSession&&debugIds('developerTools').hidden,'debug controls visible without an active session');
  debugIds('settingsButton').click();debugToggle(true);
  const labels=['IR PARA FASE 10','PULAR MINIGAMES DA FASE 10','IR DIRETO PARA VIRUS ZERO','+100 XP','+500 XP','+1000 XP','MAXIMIZAR HABILIDADES','RESTAURAR VIDA','REINICIAR BOSS'];
  assert(labels.filter(label=>!label.startsWith('SUBIR 1')).every(label=>debugButton(label))&&[...document.querySelectorAll('#developerTools button')].some(button=>button.textContent.startsWith('SUBIR 1 ')),'one or more debug controls are missing');
  assert(document.querySelector('.developer-badge').textContent==='MODO DEBUG ATIVO','debug mode banner is unclear');
});

const storedCampaign=localStorage.getItem(SAVE_KEY),storedQuestions=localStorage.getItem(QUESTION_HISTORY_KEY);
test('developer tools: XP adjustments use progression, sequence level choices and cap every skill',()=>{
  debugButton('+100 XP').click();debugButton('+500 XP').click();debugButton('+1000 XP').click();
  assert(xp===1600&&debugIds('xpText').textContent.includes('1600'),'XP controls did not update the HUD');
  [...document.querySelectorAll('#developerTools button')].find(button=>button.textContent.startsWith('SUBIR 1 ')).click();assert(xp===1600,'level control consumed or duplicated XP while paused');
  debugButton('MAXIMIZAR HABILIDADES').click();
  assert(unlockedSkills.length===ABILITIES.length&&unlockedSkills.every(skill=>skill.level===3&&skill.maxLevel===3),'skill rank exceeded or missed its cap');
  assert(equippedCombat.length<=3&&player.armor<=MAX_PLAYER_ARMOR+1e-9&&player.damage===1,'debug skills exceeded combat balance limits');
  debugIds('closeSettings').click();startButton.click();update(1/120);
  assert(levelChoiceOpen&&ui.levelOverlay.querySelector('[data-skill]'),'level-up choice did not open after resuming');
  ui.levelOverlay.querySelector('[data-skill]').click();update(1/120);
  assert(levelChoiceOpen&&ui.levelOverlay.querySelector('[data-skill]'),'pending XP did not open the next capped/reward choice');
  levelChoiceOpen=false;ui.levelOverlay.classList.remove('active');offeredChoices.clear();xp=0;updateHud();
  debugUnchanged(storedCampaign,storedQuestions);
});

test('developer tools: stage 10 shortcuts skip repairs without rewards or early victory',()=>{
  debugIds('settingsButton').click();debugButton('IR PARA FASE 10').click();
  assert(phaseIndex===9&&running&&components.some(component=>!component.repaired),'phase 10 shortcut altered its normal test setup');
  debugIds('settingsButton').click();debugButton('PULAR MINIGAMES DA FASE 10').click();
  assert(components.length>0&&components.every(component=>component.repaired),'mandatory stage 10 repairs remain incomplete');
  assert(objectives.allRepairs&&objectives.allViruses&&phaseExitUnlocked&&phaseObjectiveAwarded,'stage objectives or progression were not satisfied');
  assert(!campaignComplete&&!phaseQuestionOpen&&xp===0&&!claimedXP.size,'skip awarded rewards or completed the campaign');
  assert(viruses.find(enemy=>enemy.multiStage).coreShielded===false,'final boss remains repair-shielded');
  debugUnchanged(storedCampaign,storedQuestions);
});

test('developer tools: direct boss starts safely in phase one and blocks premature exit',()=>{
  debugIds('settingsButton').click();debugButton('IR DIRETO PARA VIRUS ZERO').click();
  const boss=viruses.find(enemy=>enemy.multiStage);
  assert(phaseIndex===9&&running&&boss?.alive&&boss.bossStage===1&&!boss.coreShielded,'boss did not start in its first phase');
  assert(player.health===player.maxHealth&&player.x>=4800&&player.y+player.height===boss.groundY,'player spawn is not safe inside the arena');
  assert(!projectiles.length&&!enemyProjectiles.length&&!enemyObstacles.length,'temporary combat hazards survived direct access');
  player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;update(1/120);
  assert(!phaseQuestionOpen&&!campaignComplete,'debug mode allowed victory before the boss was defeated');
  player.x=4900;player.y=boss.groundY-player.height;
  damageVirus(boss,10000);updateVirusZero(boss,.9,player.x+17,player.y+24);assert(boss.bossStage===2&&boss.alive,'boss did not reach phase two');
  damageVirus(boss,10000);updateVirusZero(boss,.9,player.x+17,player.y+24);assert(boss.bossStage===3&&boss.alive,'boss did not reach phase three');
  debugUnchanged(storedCampaign,storedQuestions);
});

test('developer tools: combat recovery and boss restart preserve phase one and storage',()=>{
  debugIds('settingsButton').click();debugButton('REINICIAR BOSS').click();
  const boss=viruses.find(enemy=>enemy.multiStage);player.health=1;debugIds('settingsButton').click();debugButton('RESTAURAR VIDA').click();
  assert(player.health===player.maxHealth,'health restore did not update the player');
  assert(boss.alive&&boss.hp===boss.maxHp&&boss.bossStage===1&&!boss.coreShielded,'boss restart did not restore phase one');
  debugUnchanged(storedCampaign,storedQuestions);
});

test('developer tools: leaving debug restores legitimate campaign state',()=>{
  debugToggle(false);
  assert(!developerSession&&!debugIds('developerModeToggle').checked&&debugIds('developerTools').hidden,'debug mode did not turn off cleanly');
  debugUnchanged(storedCampaign,storedQuestions);
});
