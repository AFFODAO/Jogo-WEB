// Navigation UI only. Campaign state and loading stay in the existing game engine.
(() => {
  'use strict';
  const labels=['Hardware','Software','Switch','Roteador','Wi-Fi','Cabeamento','DHCP','DNS','Firewall','Servidores — VIRUS ZERO'];
  ByteRunner.developerMode=Object.freeze({mount(game){
    const byId=id=>document.getElementById(id),settings=byId('settingsDialog'),dialog=byId('developerPhaseDialog');
    const toggle=byId('developerModeToggle'),tools=byId('developerTools'),list=byId('developerPhaseList');
    const laboratory=document.createElement('a');
    laboratory.className='developer-laboratory';laboratory.target='_blank';laboratory.rel='noopener';
    laboratory.textContent='Laboratório de reparos (nova aba)';
    tools.append(laboratory);
    const section=(title,items)=>{
      const group=document.createElement('fieldset');group.className='developer-tool-section';
      const legend=document.createElement('legend');legend.textContent=title;group.append(legend);
      const grid=document.createElement('div');grid.className='developer-tool-grid';
      for(const [text,action] of items){
        const button=document.createElement('button');button.type='button';button.textContent=text;
        button.addEventListener('click',()=>{if(game.enabled())action();});grid.append(button);
      }
      group.append(grid);tools.append(group);
    };
    const loadPhase=index=>{closeForLoad();game.load(index);refresh();};
    section('TESTES DE FASE',[
      ['IR PARA FASE 10',()=>loadPhase(9)],
      ['PULAR MINIGAMES DA FASE 10',()=>{closeForLoad();game.skipMinigames();refresh();}],
      ['IR DIRETO PARA VIRUS ZERO',()=>{closeForLoad();game.directBoss();refresh();}]
    ]);
    section('CONTROLE DE XP',[
      ['+100 XP',()=>game.addXP(100)],['+500 XP',()=>game.addXP(500)],['+1000 XP',()=>game.addXP(1000)],
      ['SUBIR 1 NÍVEL',()=>game.levelUp()],['MAXIMIZAR HABILIDADES',()=>game.maximizeSkills()]
    ]);
    section('TESTES DE COMBATE',[
      ['RESTAURAR VIDA',()=>game.restoreHealth()],['REINICIAR BOSS',()=>{closeForLoad();game.restartBoss();refresh();}]
    ]);
    toggle.checked=false; // Deliberately never persisted, including browser form restoration.
    const badge=document.createElement('span');badge.className='developer-badge';badge.textContent='MODO DEBUG ATIVO';badge.hidden=true;
    byId('sectorChip').insertAdjacentElement('beforebegin',badge);
    const actions=document.createElement('div');actions.className='developer-pause-actions';actions.hidden=true;
    for(const [text,action] of [['Trocar de fase',()=>open('pause')],['Reiniciar fase',()=>game.load(game.current())]]){
      const button=document.createElement('button');button.type='button';button.textContent=text;button.addEventListener('click',action);actions.append(button);
    }
    byId('startButton').parentElement.append(actions);
    let origin='settings';
    function refresh(){
      const enabled=game.enabled();toggle.checked=enabled;tools.hidden=!enabled;actions.hidden=!enabled;badge.hidden=!enabled;
      laboratory.href='tests/minigames.html?phase='+game.current();
      if(!enabled&&dialog.open)dialog.close('disabled');
      byId('developerModeState').textContent=enabled?'LIGADO':'DESLIGADO';
      document.body.classList.toggle('developer-testing',enabled);
      for(const [index,button] of [...list.children].entries()){
        const current=enabled&&game.current()===index;button.classList.toggle('current',current);
        if(current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
      }
    }
    function open(from){
      if(!game.enabled())return;
      origin=from;game.pause();if(settings.open)settings.close();refresh();dialog.returnValue='';dialog.showModal();
      (list.querySelector('[aria-current]')||list.firstElementChild)?.focus();
    }
    function closeForLoad(){if(dialog.open)dialog.close('load');if(settings.open)settings.close();}
    labels.forEach((label,index)=>{
      const button=document.createElement('button');button.type='button';button.dataset.phase=String(index);
      button.textContent=String(index+1).padStart(2,'0')+' · '+label;
      button.addEventListener('click',()=>{if(!game.enabled())return;closeForLoad();game.load(index);refresh();});list.append(button);
    });
    toggle.addEventListener('change',()=>{game.enable(toggle.checked);refresh();});
    byId('developerSelectPhase').addEventListener('click',()=>open('settings'));
    byId('developerRestartPhase').addEventListener('click',()=>{closeForLoad();game.load(game.current());refresh();});
    byId('developerPanelRestart').addEventListener('click',()=>{closeForLoad();game.load(game.current());refresh();});
    byId('developerPanelBack').addEventListener('click',()=>dialog.close('back'));
    dialog.addEventListener('close',()=>{if(dialog.returnValue!=='load'&&origin==='settings'&&game.enabled())settings.showModal();});
    window.addEventListener('pageshow',()=>refresh());
    refresh();return Object.freeze({refresh});
  }});
})();
