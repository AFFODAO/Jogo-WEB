(() => {
  'use strict';
  const profiles = {
    common: { hp: 2, damage: 12, speed: 60, radius: 15, behavior: 'chase', attack: 'melee', attackRange: 34, attackCooldown: 1.15, windup: .28, xp: 45, color: '#bb7bff' },
    basic: { hp: 2, damage: 12, speed: 60, radius: 15, behavior: 'chase', attack: 'melee', attackRange: 34, attackCooldown: 1.15, windup: .28, xp: 45, color: '#bb7bff' },
    fast: { hp: 1, damage: 8, speed: 142, radius: 11, behavior: 'chase', attack: 'melee', attackRange: 28, attackCooldown: .85, windup: .18, xp: 35, color: '#ff9263' },
    armored: { hp: 7, damage: 18, speed: 42, radius: 18, behavior: 'patrol', attack: 'melee', attackRange: 40, attackCooldown: 1.8, windup: .48, armor: .68, vulnerableDuration: 1.25, special: 'barrier', specialCooldown: 7, xp: 85, color: '#76b9ff' },
    flyer: { hp: 2, damage: 10, speed: 88, radius: 14, behavior: 'chase', attack: 'melee', attackRange: 38, attackCooldown: 1.4, windup: .32, flying: true, xp: 55, color: '#73e4ff' },
    shooter: { hp: 3, damage: 10, speed: 48, radius: 15, behavior: 'patrol', attack: 'ranged', attackRange: 330, preferredRange: 230, attackCooldown: 2.2, projectileSpeed: 285, xp: 60, color: '#ffd166' },
    parasite: { hp: 3, damage: 7, speed: 38, radius: 13, behavior: 'support', attack: 'interfere', buffRange: 190, interferenceRange: 260, drainRate: 8, summonCooldown: 9, summonLimit: 2, xp: 70, color: '#7dff9b' },
    boss: { hp: 28, damage: 20, speed: 42, radius: 38, behavior: 'chase', attack: 'melee', attackRange: 70, attackCooldown: 1.3, windup: .36, special: 'summon', specialCooldown: 8, summonLimit: 3, xp: 250, color: '#ff476f' }
  };
  const registry = new Map();
  const variants = {
    file: {label:'ARQUIVO // FORK', color:'#cf9bff'},
    packet: {label:'PACOTE // INTERCEPTOR', color:'#60ffd4'},
    wifi: {label:'WI-FI // INTERFERÊNCIA', color:'#71e6ff'},
    dns: {label:'DNS // RESOLUÇÃO DUPLA', color:'#c7a0ff'},
    firewall: {label:'FIREWALL // CONTRAMEDIDA', color:'#ff9574'}
  };
  const overlap = (x,y,r,s) => x+r>s.x && x-r<s.x+s.w && y+r>s.y && y-r<s.y+s.h;
  function sight(e,x,y,shapes) {
    // Segment/AABB intersection; gates and solid floors also block detection.
    return !shapes.some(s => {
      if(s.collision !== 'solid') return false;
      let lo=0,hi=1;
      for(const [a,d,min,max] of [[e.x,x-e.x,s.x,s.x+s.w],[e.y,y-e.y,s.y,s.y+s.h]]) {
        if(Math.abs(d)<.001) {if(a<min || a>max)return false;}
        else {const t1=(min-a)/d,t2=(max-a)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;}
      }
      return hi>.01 && lo<.99;
    });
  }
  function support(e,shapes) {
    const foot=e.baseY+24;
    return shapes.filter(s=>e.x>=s.x && e.x<=s.x+s.w && Math.abs(s.y-foot)<45)
      .sort((a,b)=>Math.abs(a.y-foot)-Math.abs(b.y-foot))[0];
  }
  function lane(e,shapes) {
    const s=support(e,shapes);
    if(!s)return null;
    let left=s.x,right=s.x+s.w;
    for(let pass=0;pass<shapes.length;pass++) {
      let changed=false;
      for(const b of shapes) if(Math.abs(b.y-s.y)<8 && b.x<=right+.5 && b.x+b.w>=left-.5) {
        const l=Math.min(left,b.x),r=Math.max(right,b.x+b.w);changed ||= l!==left||r!==right;left=l;right=r;
      }
      if(!changed)break;
    }
    return {left:left+e.radius+2,right:right-e.radius-2,y:s.y,s};
  }
  function move(e,dir,speed,dt,c) {
    if(!dir)return false;
    const l=lane(e,c.shapes);
    if(!l || l.right<l.left)return false;
    const min=Math.max(l.left,e.navigationBounds?.left??0),max=Math.min(l.right,e.navigationBounds?.right??c.width);
    const x=Math.max(min,Math.min(max,e.x+dir*speed*dt));
    if(c.shapes.some(s=>s!==l.s && s.collision==='solid' && overlap(x,l.y-24,e.radius,s)))return false;
    if(Math.abs(x-e.x)<.01)return false;
    e.x=x;e.baseY=l.y-24;e.y=e.baseY+Math.sin(e.phase)*2;return true;
  }
  function face(e,dx) {if(Math.abs(dx)>3)e.direction=Math.sign(dx);}
  function begin(e,kind,duration,c) {
    e.action=kind;e.attackWindup=duration;e.windupTotal=duration;
    e.aimX=c.playerX;e.aimY=c.playerY;e.attackDirection=e.direction;
    e.animationState='prepare';c.sound(e.type==='fast'?'dashWarning':e.type==='parasite'?'infectWarning':'enemyWarning');
  }
  function canPrepare(e,c) {
    if(!Array.isArray(c.enemies))return true;
    return !c.enemies.some(other=>{
      if(other===e||!other.alive||Math.hypot(other.x-e.x,other.y-e.y)>300)return false;
      const a=e.activationRegion,b=other.activationRegion;
      if(a&&b&&(a.x>=b.x+b.width||b.x>=a.x+a.width||a.y>=b.y+b.height||b.y>=a.y+a.height))return false;
      const attacking=other.attackWindup>0||other.dashTime>0||other.diveTime>0||other.echoTime>0||
        (other.recovery>0&&['melee','dash','shot','dive','countermeasure','summon'].includes(other.action));
      return attacking;
    });
  }
  function preparation(e,dt) {if(e.attackWindup<=0)return false;e.attackWindup=Math.max(0,e.attackWindup-dt);return e.attackWindup===0;}
  function melee(e,c,range) {
    if(Math.hypot(c.playerX-e.x,c.playerY-e.y)<=range && sight(e,c.playerX,c.playerY,c.shapes))c.damage(e.damage*(e.buffed?1.25:1),e);
    c.sound('enemyStrike');e.animationState='attack';e.attackFlash=.18;
  }
  function patrol(e,c,dt) {
    e.animationState='patrol';
    if(e.x<=e.patrolMin)e.direction=1;if(e.x>=e.patrolMax)e.direction=-1;
    if(!move(e,e.direction,e.speed*.65,dt,c))e.direction*=-1;
  }
  function ground(e,c,dt) {
    const dx=c.playerX-e.x,l=lane(e,c.shapes);
    const reachable=l && c.playerX>=l.left-22 && c.playerX<=l.right+22 && Math.abs(c.playerY-(l.y-24))<65;
    const detected=reachable && Math.abs(dx)<(e.aggroRange||390) && sight(e,c.playerX,c.playerY,c.shapes);
    e.detected=Boolean(detected);
    if(e.attackWindup>0) {
      if(preparation(e,dt)) {melee(e,c,(e.attackRange||34)+e.radius+17);e.vulnerableTime=e.type==='armored'?1.35:.25;e.recovery=.4;}
      return;
    }
    if(e.recovery>0){e.animationState='recover';return;}
    if(!detected){patrol(e,c,dt);return;}
    face(e,dx);e.animationState='chase';
    if(Math.abs(dx)>(e.attackRange||34)+e.radius+8)move(e,e.direction,e.speed*(e.buffed?1.3:1),dt,c);
    if(Math.abs(dx)<(e.attackRange||34)+e.radius+17 && e.attackCooldownTimer<=0 && canPrepare(e,c)) {
      begin(e,'melee',Math.max(.36,e.windup||.36),c);e.attackCooldownTimer=e.attackCooldown||1.3;
    }
    if(e.variant==='firewall' && e.variantCooldown<=0 && Math.abs(dx)>100 && canPrepare(e,c)) {
      begin(e,'countermeasure',.8,c);e.variantCooldown=6;
    }
  }
  function fast(e,c,dt) {
    const dx=c.playerX-e.x;
    if(e.dashTime>0) {
      const old=e.x;const step=Math.min(dt,e.dashTime);
      if(!move(e,e.attackDirection,e.speed*2.6,step,c))e.dashTime=0;
      else e.dashTime=Math.max(0,e.dashTime-step);
      e.animationState='attack';
      if(c.playerX>=Math.min(old,e.x)-25 && c.playerX<=Math.max(old,e.x)+25 && Math.abs(c.playerY-e.y)<32 && sight(e,c.playerX,c.playerY,c.shapes))melee(e,c,65);
      if(!e.dashTime){e.recovery=.7;e.vulnerableTime=.7;e.interceptTime=e.variant==='packet'?.4:0;}
      return;
    }
    if(e.attackWindup>0){if(preparation(e,dt)){e.dashTime=.32;c.sound('enemyDash');}return;}
    if(e.recovery>0){e.animationState='retreat';move(e,-e.attackDirection,e.speed*.65,dt,c);return;}
    const l=lane(e,c.shapes);
    if(!l||c.playerX<l.left-20||c.playerX>l.right+20||Math.abs(c.playerY-e.y)>70||!sight(e,c.playerX,c.playerY,c.shapes)){patrol(e,c,dt);return;}
    face(e,dx);e.animationState='chase';
    if(Math.abs(dx)>180)move(e,e.direction,e.speed,dt,c);
    else if(e.attackCooldownTimer<=0&&canPrepare(e,c)){begin(e,'dash',.58,c);e.attackCooldownTimer=2.1;}
  }
  function ranged(e,c,dt) {
    const dx=c.playerX-e.x,visible=sight(e,c.playerX,c.playerY,c.shapes);
    if(e.attackWindup>0) {
      if(preparation(e,dt)) {
        if(sight(e,e.aimX,e.aimY,c.shapes))c.fire(e.stolenShot?{...e,projectileSpeed:210,damage:e.damage+2}:e,e.aimX,e.aimY);e.stolenShot=false;
        e.attackFlash=.2;e.animationState='attack';c.sound('enemyShot');
        if(e.variant==='dns'){e.echoTime=.4;e.echoX=e.aimX;e.echoY=e.aimY;}
        e.recovery=.35;
      }
      return;
    }
    face(e,dx);
    e.positionTimer=Math.max(0,(e.positionTimer||0)-dt);
    if(!e.positionTimer) {
      const l=lane(e,c.shapes);
      if(l) {
        const options=[e.x,e.x-70,e.x+70,e.x-140,e.x+140].filter(x=>x>=l.left&&x<=l.right&&
          !c.shapes.some(s=>s.collision==='solid'&&overlap(x,e.y,e.radius,s)));
        options.sort((a,b)=>{
          const score=x=>Math.abs(Math.abs(c.playerX-x)-210)+(sight({...e,x},c.playerX,c.playerY,c.shapes)?0:400)+Math.abs(x-e.x)*.15;
          return score(a)-score(b);
        });
        e.positionX=options[0]??e.x;
      }
      e.positionTimer=.6;
    }
    if(Math.abs(dx)<125 && Math.abs(c.playerY-e.y)<100){e.animationState='retreat';move(e,-e.direction,e.speed*1.5,dt,c);}
    else if(Math.abs((e.positionX??e.x)-e.x)>10){e.animationState='position';move(e,Math.sign(e.positionX-e.x),e.speed,dt,c);}
    else if(!visible||Math.abs(dx)>(e.attackRange||330)){e.animationState='position';if(!move(e,e.direction,e.speed,dt,c))patrol(e,c,dt);}
    else e.animationState='aim';
    if(visible&&Math.hypot(dx,c.playerY-e.y)<(e.attackRange||330)&&e.attackCooldownTimer<=0&&e.recovery<=0&&canPrepare(e,c)) {
      begin(e,'shot',.7,c);e.intercepted=false;e.attackCooldownTimer=e.attackCooldown||2.2;
    }
  }
  function flyMove(e,x,y,dt,c,speed) {
    const hit=(nx,ny)=>c.shapes.some(s=>overlap(nx,ny,e.radius+2,s));
    const dx=x-e.x,dy=y-e.y,len=Math.hypot(dx,dy)||1;
    const step=speed*dt;
    const nx=Math.max(e.radius,Math.min(c.width-e.radius,e.x+dx/len*step));
    const ny=Math.max(e.radius,Math.min(c.height-e.radius,e.y+dy/len*step));
    if(!hit(nx,ny)){e.x=nx;e.y=ny;e.avoidTime=0;return;}
    e.avoidTime=(e.avoidTime||0)+dt;
    // Try both axes, then a persistent tangent to route around shelves/walls.
    if(!hit(nx,e.y))e.x=nx;
    else {
      e.avoidDirection ||= -1;
      const ay=Math.max(e.radius,Math.min(c.height-e.radius,e.y+e.avoidDirection*step));
      if(!hit(e.x,ay))e.y=ay;else e.avoidDirection*=-1;
      return;
    }
    if(!hit(e.x,ny))e.y=ny;
    else {
      const ax=Math.max(e.radius,Math.min(c.width-e.radius,e.x+(Math.sign(dx)||e.direction)*step));
      if(!hit(ax,e.y))e.x=ax;
    }
  }
  function flyer(e,c,dt) {
    face(e,c.playerX-e.x);
    if(e.attackWindup>0) {
      if(preparation(e,dt)) {
        e.diveTime=.48;e.animationState='attack';c.sound('enemyDive');
        if(e.variant==='wifi' && sight(e,e.aimX,e.aimY,c.shapes)) {
          c.fire({...e,projectileSpeed:190,damage:6,slowOnHit:.7},e.aimX,e.aimY);
          c.fire({...e,projectileSpeed:190,damage:6,slowOnHit:.7},e.aimX,e.aimY-100);
        }
      }
      return;
    }
    if(e.diveTime>0) {
      flyMove(e,e.aimX,e.aimY,dt,c,e.speed*2.2);e.diveTime=Math.max(0,e.diveTime-dt);
      if(Math.hypot(c.playerX-e.x,c.playerY-e.y)<44 && sight(e,c.playerX,c.playerY,c.shapes))melee(e,c,48);
      if(!e.diveTime){e.recovery=.65;e.altitudeIndex=(e.altitudeIndex||0)+1;}
      return;
    }
    e.animationState=e.recovery>0?'retreat':'chase';
    const altitude=[-90,30,-145][(e.altitudeIndex||0)%3];
    const targetY=c.playerY+altitude;
    flyMove(e,c.playerX+e.direction*(e.recovery>0?-125:-80),targetY,dt,c,e.speed);
    if(Math.hypot(c.playerX-e.x,c.playerY-e.y)<260&&sight(e,c.playerX,c.playerY,c.shapes)&&e.attackCooldownTimer<=0&&e.recovery<=0&&canPrepare(e,c)) {
      begin(e,'dive',.75,c);e.attackCooldownTimer=2.4;
    }
  }
  function parasite(e,c,dt) {
    const target=c.components.filter(a=>!a.repaired&&Math.abs(a.y-e.y)<100&&sight(e,a.x+a.width/2,a.y+20,c.shapes))
      .sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
    e.infectedComponent=null;e.animationState='patrol';
    if(target) {
      const dx=target.x+target.width/2-e.x;face(e,dx);
      if(Math.abs(dx)>85)move(e,e.direction,e.speed,dt,c);
      else {
        e.infectedComponent=target.id;e.animationState='infect';
        target.corruption=Math.min(100,target.corruption+(e.drainRate||8)*dt);target.integrity=100-target.corruption;
        target.infected=true;
      }
    }else patrol(e,c,dt);
    if(e.attackWindup>0){if(preparation(e,dt)){c.spawn(e);e.summonCooldownTimer=e.summonCooldown||9;e.recovery=.55;e.animationState='attack';c.sound('enemySummon');}return;}
    const l=lane(e,c.shapes);
    const playerReachable=l && c.playerX>=l.left-22 && c.playerX<=l.right+22 && Math.abs(c.playerY-(l.y-24))<65;
    if(e.summonCooldownTimer<=0 && playerReachable && sight(e,c.playerX,c.playerY,c.shapes) && Math.hypot(c.playerX-e.x,c.playerY-e.y)<430 && (e.totalSummons||0)<4 && canPrepare(e,c)) {
      begin(e,'summon',1,c);e.summonCooldownTimer=2;
    }
  }
  registry.set('basic',ground);registry.set('armored',ground);registry.set('fast',fast);
  registry.set('shooter',ranged);registry.set('flyer',flyer);registry.set('parasite',parasite);
  window.ByteRunner.enemies=Object.freeze({
    profiles,
    register(type,handler,profile){if(registry.has(type)||typeof handler!=='function')throw new Error('Invalid enemy behavior: '+type);registry.set(type,handler);if(profile)profiles[type]={...profile};},
    variantFor(phase,type) {return ({2:{basic:'file'},3:{shooter:'packet'},5:{flyer:'wifi'},8:{shooter:'dns'},9:{armored:'firewall'}})[phase]?.[type];},
    sight, lane,
    update(e,c,dt) {
      const handler=registry.get(e.type);if(!handler)return false;
      if(!e.flying) {
        const s=support(e,c.shapes);
        if(s) {
          if(e.supportId===s.id && e.supportX!==undefined && s.type==='moving')e.x+=s.x-e.supportX;
          e.supportId=s.id;e.supportX=s.x;e.baseY=s.y-24;e.y=e.baseY+Math.sin(e.phase)*2;e.fallSpeed=0;
        } else {
          e.supportId=null;e.fallSpeed=Math.min(600,(e.fallSpeed||0)+1200*dt);
          const next=e.baseY+e.fallSpeed*dt;
          const landing=c.shapes.filter(s=>e.x>=s.x+e.radius&&e.x<=s.x+s.w-e.radius&&s.y>=e.baseY+24-1&&s.y<=next+24).sort((a,b)=>a.y-b.y)[0];
          e.baseY=landing?landing.y-24:next;e.y=e.baseY;
          if(landing){e.fallSpeed=0;e.groundY=landing.y;}
          if(e.y>c.height+60) {
            const safe=c.shapes.filter(s=>s.w>e.radius*2+4&&s.y>=24&&s.y<c.height).sort((a,b)=>Math.abs(a.x+a.w/2-e.baseX)-Math.abs(b.x+b.w/2-e.baseX))[0];
            if(safe){e.x=Math.max(safe.x+e.radius+2,Math.min(safe.x+safe.w-e.radius-2,e.baseX));e.baseY=e.y=safe.y-24;e.fallSpeed=0;}
          }
          e.attackWindup=0;e.dashTime=0;e.animationState='fall';return true;
        }
      }
      e.variantCooldown=Math.max(0,(e.variantCooldown??3)-dt);
      e.recovery=Math.max(0,(e.recovery||0)-dt);e.attackFlash=Math.max(0,(e.attackFlash||0)-dt);
      e.interceptTime=Math.max(0,(e.interceptTime||0)-dt);
      if(e.echoTime>0){e.echoTime=Math.max(0,e.echoTime-dt);if(!e.echoTime){if(sight(e,e.echoX,e.echoY,c.shapes))c.fire(e,e.echoX,e.echoY);c.sound('dnsEcho');}}
      if(e.action==='countermeasure'&&e.attackWindup>0) {
        if(preparation(e,dt)){if(sight(e,e.aimX,e.aimY,c.shapes))c.fire({...e,projectileSpeed:210,damage:10},e.aimX,e.aimY);e.recovery=.6;e.vulnerableTime=1;c.sound('enemyShot');}
        return true;
      }
      if(e.variant==='file' && e.hp<e.maxHp && !e.forked && e.attackWindup<=0 && canPrepare(e,c)){e.forked=true;begin(e,'fork',.9,c);}
      if(e.action==='fork'&&e.attackWindup>0){if(preparation(e,dt)){c.spawn(e);e.recovery=.5;c.sound('enemySummon');}return true;}
      handler(e,c,dt);return true;
    },
    damageMultiplier(e,sourceX) {
      if(e.type==='armored' && e.vulnerableTime<=0) return (sourceX-e.x)*(e.direction||1)>0 ? .32 : 1.5;
      if(e.interceptTime>0)return .5;
      return e.type==='armored'&&e.vulnerableTime>0?1.5:1;
    },
    draw(ctx,e,time,components) {
      if(!e.alive) {
        if(!Number.isFinite(e.deathAt))return;
        const t=(time-e.deathAt)/.5;if(t<0||t>1)return;
        ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle=e.color;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(e.x,e.y,e.radius*(1+t*2),0,Math.PI*2);ctx.stroke();ctx.restore();return;
      }
      ctx.save();
      if(e.variant){ctx.fillStyle=variants[e.variant]?.color||e.color;ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(variants[e.variant]?.label||e.variant,e.x,e.y-e.radius-19);}
      if(e.animationState==='chase'||e.animationState==='retreat'||e.dashTime>0) {
        ctx.strokeStyle=e.color;ctx.globalAlpha=.45;ctx.beginPath();
        for(let i=0;i<3;i++){ctx.moveTo(e.x-e.direction*(e.radius+5+i*5),e.y-6+i*6);ctx.lineTo(e.x-e.direction*(e.radius+14+i*5),e.y-6+i*6);}ctx.stroke();ctx.globalAlpha=1;
      }
      if(e.attackWindup>0) {
        ctx.strokeStyle='#ffe69a';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();
        if(['shot','countermeasure','dive'].includes(e.action)){ctx.moveTo(e.x,e.y);ctx.lineTo(e.aimX,e.aimY);}
        else if(e.action==='dash'){ctx.moveTo(e.x,e.y+18);ctx.lineTo(e.x+e.attackDirection*125,e.y+18);}
        else ctx.arc(e.x,e.y,e.radius+13,0,Math.PI*2);
        ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#ffe69a';ctx.fillRect(e.x-16,e.y-e.radius-7,32*(1-e.attackWindup/e.windupTotal),3);
      }
      if(e.echoTime>0){ctx.strokeStyle='#c7a0ff';ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.echoX,e.echoY);ctx.stroke();}
      if(e.infectedComponent){const a=components.find(a=>a.id===e.infectedComponent);if(a){ctx.strokeStyle='#7dff9b';ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(a.x+a.width/2,a.y+20);ctx.stroke();}}
      if(e.buffed){ctx.strokeStyle='#7dff9b';ctx.beginPath();ctx.arc(e.x,e.y,e.radius+5,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
  });
})();
