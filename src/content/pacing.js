/* Optional exploration rewards placed only on safe, existing ground. */
(() => {
  const lessons=[
    'Explore a placa. Pule entre circuitos; E abre o primeiro diagnóstico.',
    'Entre nos diretórios com E. Plataformas móveis transportam R-07.',
    'Explore as ramificações. Repare o switch e ative suas portas Ethernet.',
    'Procure rotas alternativas. Use as interfaces para atravessar os túneis.',
    'Espere uma janela estável nas plataformas de sinal. Evite disparos em linha reta.',
    'Use os elevadores restaurados. Colete caches em sequência para um bônus opcional.',
    'Restaure o serviço DHCP e ative as concessões. Nenhum IP deve se repetir.',
    'Siga os domínios e compare as pistas. Nem todo diretório leva ao destino.',
    'Observe a varredura das câmeras e o ciclo dos lasers antes de avançar.',
    'Repare os relays antes de atacar o núcleo. Use cobertura e as janelas de vulnerabilidade.'
  ];
  const overlap=(a,b)=>a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;
  window.ByteRunner.pacing={lessons,
    create(phase,index,runtime,context) {
      const caches=[],ground=phase.map.ground?.segments || [],limit=index<3?5:10;
      if(!/^phase-\d+$/.test(phase.id))return {caches,update(){},draw(){}};
      const shapes=context.solids(),features=[...phase.entities.components,...phase.entities.enemies,...phase.entities.collectibles,...phase.entities.interactives];
      for(const segment of ground)for(let slot=0,x=segment.x+120;x<segment.x+segment.width-65 && caches.length<limit;x+=220,slot++) {
        const y=segment.y-23,box={x:x-18,y:segment.y-55,w:36,h:54};
        if(Math.hypot(x-context.player().x,y-context.player().y)<150)continue;
        if(features.some(e=>Math.hypot(x-e.x,y-(e.y ?? segment.y))<145))continue;
        if(shapes.some(shape=>shape.y<segment.y-2 && overlap(box,shape)))continue;
        if(shapes.some(shape=>['dangerous','interference'].includes(shape.type)&&Math.hypot(x-shape.x-shape.w/2,y-shape.y-shape.h/2)<100))continue;
        if((phase.map.checkpoints || []).some(point=>Math.hypot(x-(typeof point==='number'?point:point.x),y-(point.y ?? segment.y))<90))continue;
        caches.push({id:'rhythm:'+segment.id+':'+slot,x,y});
      }
      let lastCache=-100,chain=0,elapsed=0;
      const warned=new Set();
      return {caches,
        update(dt) {
          elapsed+=dt;const p=context.player();
          for(const cache of caches) {
            if(runtime.getFlag(cache.id)||Math.hypot(p.x+p.width/2-cache.x,p.y+p.height/2-cache.y)>28)continue;
            runtime.setFlag(cache.id,true);
            chain=elapsed-lastCache<4.5?chain+1:1;lastCache=elapsed;
            const bonus=index>=5&&chain>=3?12:0;if(bonus)chain=0;
            context.reward(8+bonus,bonus?'cadeia de dados':'cache de exploração',cache);
            if(index>=5)context.hint(bonus?'CADEIA COMPLETA · +12 XP de bônus!':'CADEIA OPCIONAL · '+chain+'/3 · próximo cache em até 4,5 s.');
          }
          // Explain enemies on approach, before their contact range, once per phase/type.
          const enemy=context.enemies().find(e=>e.alive&&Math.hypot(p.x-e.x,p.y-e.y)<230&&!warned.has(e.type));
          if(enemy) {
            warned.add(enemy.type);
            const messages={basic:'COMBATE · J dispara; mova-se entre os ataques.',fast:'VÍRUS RÁPIDO · o aviso precede uma investida em linha reta.',armored:'BLINDADO · ataque pelas costas ou durante a recuperação.',shooter:'ATIRADOR · ele mira antes de disparar. Use cobertura.',flyer:'VOADOR · observe a aproximação e saia da linha de mergulho.',parasite:'PARASITA · priorize o suporte que infecta os componentes.',boss:'VIRUS ZERO · restaure os relays, observe os avisos e ataque o ponto fraco.'};
            if(messages[enemy.type])context.hint(messages[enemy.type]);
          }
        },
        draw(ctx,time,visuals,view) {
          if(index>=5&&chain>0&&elapsed-lastCache<4.5) {
            ctx.save();ctx.fillStyle='#101d31ed';ctx.fillRect(view.x+view.width-190,view.y+8,180,23);ctx.fillStyle='#b1f7e0';ctx.font='10px monospace';ctx.fillText('DADOS '+chain+'/3 · '+(4.5-elapsed+lastCache).toFixed(1)+' s',view.x+view.width-180,view.y+23);ctx.restore();
          }
          for(const cache of caches) {
            if(runtime.getFlag(cache.id)||cache.x<view.x-20||cache.x>view.x+view.width+20||cache.y<view.y-20||cache.y>view.y+view.height+20)continue;
            const bob=window.ByteRunner.experience.settings.reducedEffects?0:Math.sin(time*3+cache.x)*2;
            if(!visuals.sprite(ctx,{asset:'fx',animation:'pulse'},{x:cache.x-12,y:cache.y-12+bob,width:24,height:24},time)) {ctx.fillStyle='#9cf2d1';ctx.fillRect(cache.x-4,cache.y-4,8,8);}
          }
        }
      };
    }
  };
})();
