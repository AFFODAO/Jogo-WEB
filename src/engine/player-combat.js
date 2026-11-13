/* Simulation-time attacks and continuous projectile collision. */
(() => {
  const positive=(n,fallback)=>Number.isFinite(n)&&n>0?n:fallback;
  function create() {
    let now=0,basic=0,special=0,charge=0,buffer=-1,pending=false,held=false;
    return {
      request(key){if(key==='j')buffer=now+.12;else pending=true;},
      clear(){buffer=-1;pending=false;held=false;charge=0;},
      basic(interval){if(charge||now+1e-8<basic)return false;basic=(now-basic<.1?basic:now)+Math.max(.14,positive(interval,.32));buffer=-1;return true;},
      step(dt,input,config){
        const events=[];now+=Math.max(0,Number.isFinite(dt)?dt:0);
        if(input.special&&!held)pending=true;held=input.special;
        if(pending&&!charge&&now+1e-8>=special){charge=now+.28;special=now+positive(config.cooldown,6);events.push('charge');}
        pending=false;
        if(charge){if(now+1e-8>=charge){charge=0;events.push('special');}return events;}
        if((input.basic||buffer>=now)&&this.basic(config.interval))events.push('basic');
        return events;
      },
      get charging(){return charge>0;},
      get progress(){return charge?Math.max(0,Math.min(1,1-(charge-now)/.28)):0;},
      get remaining(){return Math.max(0,special-now);},
      snapshot(){return {version:1,basicRemaining:Math.max(0,basic-now),specialRemaining:Math.max(0,special-now)};},
      restore(saved){this.clear();const clamp=(v,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;basic=now+clamp(saved?.basicRemaining,5);special=now+clamp(saved?.specialRemaining,60);}
    };
  }
  function box(x,y,dx,dy,s,r=0){
    let low=0,high=1;
    for(const [p,d,a,b] of [[x,dx,s.x-r,s.x+s.w+r],[y,dy,s.y-r,s.y+s.h+r]]){
      if(Math.abs(d)<1e-10){if(p<a||p>b)return null;continue;}
      let t=(a-p)/d,u=(b-p)/d;if(t>u)[t,u]=[u,t];low=Math.max(low,t);high=Math.min(high,u);if(low>high)return null;
    }
    return low;
  }
  function circle(x,y,dx,dy,c,r){
    const ox=x-c.x,oy=y-c.y,a=dx*dx+dy*dy,b=2*(ox*dx+oy*dy),z=ox*ox+oy*oy-r*r;
    if(z<=0)return 0;if(!a)return null;const disc=b*b-4*a*z;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;
  }
  window.ByteRunner.playerCombat={create,box,circle};
})();
