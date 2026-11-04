(() => {
  'use strict';
  const api = window.ByteRunner;
  const factories = new Map();
  const enemyBehaviors = new Map();
  function create(phase, context) {
    let flags = Object.create(null);
    let visited = new Set();
    let previousInteract = false;
    const controllers = [];
    const sessions = new Map();
    const state = {
      getFlag: name => flags[name],
      setFlag(name, value = true) { flags[name] = value; },
      matches: condition => matches(condition),
      context
    };
    for (const spec of phase.mechanics || []) {
      if (!factories.has(spec.type)) throw new Error('Unknown mechanic '+spec.type+' in '+phase.id);
      if (sessions.has(spec.id)) throw new Error('Duplicate mechanic id: '+spec.id);
      const controller = factories.get(spec.type)(spec, state) || {};
      controllers.push(controller);
      sessions.set(spec.id, controller);
    }
    function matches(condition) {
      if (!condition) return true;
      if (condition.all) return condition.all.every(matches);
      if (condition.any) return condition.any.some(matches);
      if (condition.not) return !matches(condition.not);
      if (condition.component) return context.components().some(c => c.id === condition.component && c.repaired);
      if (condition.enemyDefeated) return context.enemies().some(e => e.id === condition.enemyDefeated && !e.alive);
      if (condition.flag) return flags[condition.flag] === (condition.value ?? true);
      return false;
    }
    function goalComplete(goal) {
      switch (goal.type) {
        case 'condition': return matches(goal.condition);
        case 'repair': return goal.ids.every(id => matches({component:id}));
        case 'defeat': return goal.ids.every(id => matches({enemyDefeated:id}));
        case 'collect': return goal.ids.every(id => context.collectibles().some(item => item.id === id && item.collected));
        case 'region': return visited.has(goal.id);
        default: throw new Error('Unknown objective type: '+goal.type);
      }
    }
    function rect(spec) { return {x:spec.x, y:context.entityY(spec), w:spec.width || 32, h:spec.height || 40}; }
    function overlapsPlayer(box) {
      const p = context.player();
      return p.x < box.x+box.w && p.x+p.width > box.x && p.y < box.y+box.h && p.y+p.height > box.y;
    }
    return {
      matches,
      getFlag: state.getFlag,
      setFlag: state.setFlag,
      connections() { return controllers.flatMap(controller=>controller.connections?.() || []); },
      modifiers() {
        const result={speedMultiplier:1,fireIntervalMultiplier:1,projectileSpeedMultiplier:1,forceX:0};
        for (const controller of controllers) {
          const values=controller.modifiers?.();
          if (!values) continue;
          for (const key of ['speedMultiplier','fireIntervalMultiplier','projectileSpeedMultiplier']) result[key] *= values[key] ?? 1;
          result.forceX += values.forceX || 0;
          if (values.label) result.label=values.label;
        }
        return result;
      },
      draw(ctx,view,time) { controllers.forEach(controller=>controller.draw?.(ctx,view,time)); },
      goalsComplete: () => (phase.objectives.goals || []).every(goalComplete),
      progress() {
        const goals=phase.objectives.goals || [];
        let total=goals.length,done=goals.filter(goalComplete).length;
        if(phase.objectives.repairAllComponents){total+=phase.objectives.componentsToRepair;done+=context.components().filter(c=>c.repaired).length;}
        if(phase.objectives.defeatAllViruses){total+=phase.objectives.enemiesToDefeat;done+=context.enemies().filter(e=>!e.alive&&e.countsForObjective!==false).length;}
        return total?Math.min(1,done/total):0;
      },
      update(dt, input) {
        for (const goal of phase.objectives.goals || []) if (goal.type === 'region' && overlapsPlayer(rect(goal))) visited.add(goal.id);
        const pressed = input.keys.has('e') && !previousInteract;
        previousInteract = input.keys.has('e');
        for (const spec of phase.entities.interactives || []) {
          if (!matches(spec.requires)) continue;
          const box = rect(spec), p = context.player();
          const near = Math.hypot(p.x+p.width/2-box.x-box.w/2,p.y+p.height/2-box.y-box.h/2) < (spec.range || 82);
          if (spec.type === 'trigger' ? overlapsPlayer(box) : pressed && near && !input.repairNearby) {
            if (spec.once && flags['used:'+spec.id]) continue;
            const flag = spec.flag || spec.id;
            flags[flag] = spec.toggle ? !flags[flag] : true;
            flags['used:'+spec.id] = true;
            context.feedback?.(spec.message || 'SISTEMA ATIVADO',box);
            controllers.forEach(controller => controller.onEvent?.('interact',spec));
          }
        }
        controllers.forEach(controller => controller.update?.(dt,input));
      },
      emit(name, entity) { controllers.forEach(controller => controller.onEvent?.(name,entity)); },
      updateEnemy(enemy,dt,playerX,playerY) {
        if (!enemy.controller) return false;
        if (!enemyBehaviors.has(enemy.controller)) throw new Error('Unknown enemy controller: '+enemy.controller);
        enemyBehaviors.get(enemy.controller)(enemy,{dt,playerX,playerY,...state});
        return true;
      },
      save() {
        return {flags:{...flags}, visited:[...visited], mechanics:Object.fromEntries([...sessions].map(([id,c]) => [id,c.save?.() ?? null]))};
      },
      restore(saved) {
        if (!saved || typeof saved !== 'object') return;
        flags = Object.assign(Object.create(null),saved.flags && typeof saved.flags === 'object' ? saved.flags : {});
        visited = new Set(Array.isArray(saved.visited) ? saved.visited : []);
        sessions.forEach((controller,id) => controller.restore?.(saved.mechanics?.[id]));
      },
      dispose() { controllers.forEach(controller => controller.dispose?.()); }
    };
  }
  api.levels = Object.freeze({
    create,
    registerMechanic(type, factory) {
      if (factories.has(type) || typeof factory !== 'function') throw new Error('Invalid mechanic: '+type);
      factories.set(type,factory);
    },
    registerEnemyBehavior(type, handler) {
      if (enemyBehaviors.has(type) || typeof handler !== 'function') throw new Error('Invalid enemy behavior: '+type);
      enemyBehaviors.set(type,handler);
    }
  });
})();
