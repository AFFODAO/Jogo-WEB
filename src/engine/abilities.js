/* Skill schema 2: bounded passives, explicit activation and finite supplies. */
(() => {
  const rank=n=>Number.isFinite(Number(n))?Math.max(0,Math.min(3,Math.floor(Number(n)))):0;
  const potency=n=>[0,1.5,2.4,3][rank(n)];
  const definitions=[
    ['precision','Tiro de precisão',r=>`+1 de dano a cada ${7-r} acertos básicos em alvos vulneráveis; intervalo mínimo de 1,5 s entre bônus.`],
    ['cannon','Sobrecarga de energia',r=>`K: rajada preparada, dano 3, até 2 alvos; custa 25 de energia. Recarga de ${(6-.4*potency(r)).toFixed(2).replace('.',',')} s.`],
    ['shield','Escudo de pulso',r=>`Q: proteção manual por ${( .35+.1*r).toFixed(2).replace('.',',')} s; custa 50 de energia e tem recarga de 16 s. Não se reativa sozinho.`],
    ['boost','Esquiva lateral',r=>`L: impulso no chão por ${( .1+.02*r).toFixed(2).replace('.',',')} s; recarga de 5 s. Sem invulnerabilidade; não prolonga saltos.`],
    ['recovery','Recuperação',r=>`H: restaura 20 de integridade; ${1+r} cargas por campanha e 20 s entre usos. Cargas gastas não retornam.`],
    ['rapid','Estabilizador',r=>`Reduz o intervalo e aumenta a velocidade do projétil básico em ${potency(r)*5}%. Ganhos menores a cada aprimoramento.`],
    ['repair','Reparo eficiente',r=>`+${r} dicas por tentativa e +${Math.floor(r/2)} verificações antes da falha. Sem bônus de dano.`],
    ['armor','Armadura leve',r=>`Reduz o dano recebido em ${(potency(r)*20/3).toFixed(1).replace('.',',')}%, até o limite de 20%. Ganhos menores a cada aprimoramento.`]
  ];
  function migrate(saved){
    const old=saved?.skillSchema!==2,found=new Map();
    for(const s of Array.isArray(saved?.unlockedSkills)?saved.unlockedSkills:[]){
      if(!definitions.some(d=>d[0]===s?.id))continue;
      const raw=Number(s.level);if(!Number.isFinite(raw)||raw<1)continue;
      const value=old?Math.ceil(Math.min(5,Math.floor(raw))*3/5):rank(raw);
      found.set(s.id,Math.max(found.get(s.id)||0,value));
    }
    return [...found].map(([id,level])=>({id,level}));
  }
  function create(){
    const state={shieldCooldown:0,dashCooldown:0,recoveryCooldown:0,recoverySpent:0,precisionHits:0,precisionCooldown:0,dashTime:0,dashDirection:1};
    return {
      state,
      tick(dt){for(const key of ['shieldCooldown','dashCooldown','recoveryCooldown','precisionCooldown','dashTime'])state[key]=Math.max(0,state[key]-Math.max(0,dt));},
      cancel(){state.dashTime=0;},
      activate(id,r,p){
        r=rank(r);if(!r)return false;
        if(id==='shield'&&state.shieldCooldown<=0){state.shieldCooldown=16;p.shieldTime=.35+.1*r;return true;}
        if(id==='boost'&&state.dashCooldown<=0&&p.grounded){state.dashCooldown=5;state.dashTime=.1+.02*r;state.dashDirection=p.facing;return true;}
        if(id==='recovery'&&state.recoveryCooldown<=0&&state.recoverySpent<1+r&&p.health<p.maxHealth){state.recoveryCooldown=20;state.recoverySpent++;p.health=Math.min(p.maxHealth,p.health+20);return true;}
        return false;
      },
      precision(r,v){r=rank(r);if(!r||!(v.vulnerableTime>0))return 0;
        state.precisionHits=Math.min(7-r,state.precisionHits+1);
        if(state.precisionHits>=7-r&&state.precisionCooldown<=0){state.precisionHits=0;state.precisionCooldown=1.5;return 1;}return 0;
      },
      snapshot(){const copy={...state};delete copy.dashTime;delete copy.dashDirection;return copy;},
      restore(saved){
        const caps={shieldCooldown:16,dashCooldown:5,recoveryCooldown:20,recoverySpent:4,precisionHits:6,precisionCooldown:1.5};
        for(const [key,max] of Object.entries(caps))state[key]=Number.isFinite(saved?.[key])?Math.max(0,Math.min(max,saved[key])):0;
        state.recoverySpent=Math.ceil(state.recoverySpent);state.precisionHits=Math.floor(state.precisionHits);this.cancel();
      }
    };
  }
  window.ByteRunner.abilities={definitions,rank,potency,migrate,create};
})();
