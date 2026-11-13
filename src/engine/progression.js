/* Campaign progression schema 2: finite sources and three combat slots. */
(() => {
  const combatIds=['precision','cannon','shield','boost','recovery','rapid','armor'];
  function loadout(skills,saved){
    const unlocked=new Set(skills.filter(s=>s.level>0).map(s=>s.id));
    const source=Array.isArray(saved)?saved:skills.map(s=>s.id);
    return [...new Set(source)].filter(id=>combatIds.includes(id)&&unlocked.has(id)).slice(0,3);
  }
  function threshold(level){const n=Math.max(0,Math.floor(Number(level)||1)-1);return 400+150*n+30*n*n;}
  function simulate(total,legacy=false){
    let level=1,xp=Math.max(0,total);
    const cost=()=>legacy?100+(level-1)*45:threshold(level);
    while(xp>=cost()){xp-=cost();level++;}
    return {level,xp};
  }
  window.ByteRunner.progression={combatIds,loadout,threshold,simulate};
})();
