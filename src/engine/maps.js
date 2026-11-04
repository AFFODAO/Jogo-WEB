// Classic browser modules intentionally also work when index.html is opened via file://.
(() => {
  'use strict';
  const api = window.ByteRunner = window.ByteRunner || {};
  const definitions = new Map();
  const layouts = new Set(['horizontal', 'vertical', 'maze', 'multi-route', 'arena', 'hub']);
  const clone = value => JSON.parse(JSON.stringify(value));
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  function validate(phase) {
    const errors = [];
    const positive = value => Number.isFinite(value) && value > 0;
    if (phase.schemaVersion !== 2) errors.push('schemaVersion must be 2');
    if (!phase.id || !phase.name || !phase.theme) errors.push('id, name and theme are required');
    if (!Array.isArray(phase.palette) || phase.palette.length < 5) errors.push('palette needs five colors');
    const map = phase.map || {};
    if (!positive(map.width) || !(map.height === 'viewport' || positive(map.height))) errors.push('invalid map size');
    if (!layouts.has(map.layout)) errors.push('invalid map layout');
    for (const name of ['start', 'exit']) {
      if (!Number.isFinite(map[name]?.x)) errors.push('invalid ' + name);
    }
    if (!Array.isArray(map.camera?.axes) || map.camera.axes.some(axis => !['x','y'].includes(axis))) errors.push('invalid camera axes');
    if (!map.bounds || !map.start || !map.exit || !Array.isArray(map.checkpoints)) errors.push('bounds, start, exit and checkpoints are required');
    if (map.progress && !['x','y','objectives'].includes(map.progress.axis)) errors.push('invalid progress axis');
    if (map.checkpointMode && !['legacy','proximity','ordered','free'].includes(map.checkpointMode)) errors.push('invalid checkpoint mode');
    const ids = new Set();
    for (const [group, entities] of Object.entries(phase.entities || {})) {
      if (!Array.isArray(entities)) { errors.push(group + ' must be an array'); continue; }
      for (const entity of entities) {
        if (!entity.id || ids.has(entity.id)) errors.push('missing or duplicate entity id: ' + entity.id);
        ids.add(entity.id);
        if (!Number.isFinite(entity.x)) errors.push('invalid x: ' + entity.id);
        if (entity.y != null && !Number.isFinite(entity.y)) errors.push('invalid y: ' + entity.id);
        for (const key of ['width','height']) if (entity[key] != null && !positive(entity[key])) errors.push('invalid '+key+': '+entity.id);
      }
    }
    const components = new Set((phase.entities?.components || []).map(entity => entity.id));
    const enemies = new Set((phase.entities?.enemies || []).map(entity => entity.id));
    function condition(value) {
      if (!value || typeof value !== 'object') { errors.push('invalid condition'); return; }
      if (value.all || value.any) {
        const children=value.all || value.any;
        if (!Array.isArray(children) || !children.length) errors.push('condition needs a non-empty array');
        else children.forEach(condition);
        return;
      }
      if (value.not) { condition(value.not); return; }
      if (value.component && !components.has(value.component)) errors.push('unknown component condition: '+value.component);
      else if (value.enemyDefeated && !enemies.has(value.enemyDefeated)) errors.push('unknown enemy condition: '+value.enemyDefeated);
      else if (!value.component && !value.enemyDefeated && !value.flag) errors.push('unknown condition');
    }
    for (const entities of Object.values(phase.entities || {})) {
      if (!Array.isArray(entities)) continue;
      for (const entity of entities) {
        if (entity.requiresComponentId && !components.has(entity.requiresComponentId)) errors.push('unknown component: ' + entity.requiresComponentId);
        for (const key of ['requires','disabledWhen','opensWhen']) if (entity[key]) condition(entity[key]);
      }
    }
    const goalIds=new Set();
    for (const goal of phase.objectives?.goals || []) {
      if (!goal.id || goalIds.has(goal.id)) errors.push('duplicate/missing goal id');
      goalIds.add(goal.id);
      if (goal.type==='condition') condition(goal.condition);
      else if (['repair','defeat','collect'].includes(goal.type)) {
        const known=goal.type==='repair'?components:goal.type==='defeat'?enemies:new Set((phase.entities?.collectibles || []).map(item=>item.id));
        if (!Array.isArray(goal.ids) || !goal.ids.length || goal.ids.some(id=>!known.has(id))) errors.push('invalid objective references: '+goal.id);
      } else if (goal.type!=='region' || !Number.isFinite(goal.x) || !Number.isFinite(goal.y) || !positive(goal.width) || !positive(goal.height)) errors.push('invalid objective: '+goal.id);
    }
    const mechanicIds=new Set();
    for (const spec of phase.mechanics || []) {
      if (!spec.id || !spec.type || mechanicIds.has(spec.id)) errors.push('invalid/duplicate mechanic');
      mechanicIds.add(spec.id);
      if (spec.type==='portals') for (const link of spec.links || []) {
        if (!Number.isFinite(link.x)||!Number.isFinite(link.y)||!positive(link.width)||!positive(link.height)||!Number.isFinite(link.to?.x)||!Number.isFinite(link.to?.y)) errors.push('invalid portal');
        if (link.requires) condition(link.requires);
      }
      if (spec.type==='environment') for (const zone of spec.zones || []) {
        if (!Number.isFinite(zone.x)||!Number.isFinite(zone.y)||!positive(zone.width)||!positive(zone.height)) errors.push('invalid environment zone');
        if (zone.requires) condition(zone.requires);
        if (zone.disabledWhen) condition(zone.disabledWhen);
      }
      if (spec.type==='security-grid') for (const camera of spec.cameras || []) {
        if(!Number.isFinite(camera.x)||!Number.isFinite(camera.y)||!positive(camera.period)||!positive(camera.windup)||camera.windup>=camera.period)errors.push('invalid security camera');
        if(camera.disabledWhen)condition(camera.disabledWhen);
      }
    }
    const assetIds=new Set();
    for (const asset of phase.assets || []) {
      if (!asset.id || assetIds.has(asset.id) || typeof asset.src!=='string') errors.push('invalid/duplicate asset');
      assetIds.add(asset.id);
      for (const key of ['frameWidth','frameHeight','columns']) if (asset[key]!=null && !positive(asset[key])) errors.push('invalid atlas '+key);
      for (const animation of Object.values(asset.animations || {})) {
        if (!Array.isArray(animation.frames) || !animation.frames.length || animation.frames.some(frame=>!Number.isInteger(frame)||frame<0)) errors.push('invalid animation frames');
        if (animation.fps!=null && !positive(animation.fps)) errors.push('invalid animation fps');
      }
    }
    for (const layer of phase.layers || []) {
      if (!layer.type || (layer.pass && !['background','midground','foreground'].includes(layer.pass))) errors.push('invalid scene layer');
    }
    if (map.ground?.mode === 'explicit') {
      if (!Array.isArray(map.ground.segments)) errors.push('explicit ground needs segments');
      else for (const segment of map.ground.segments) {
        if (!Number.isFinite(segment.x) || !Number.isFinite(segment.y) || !positive(segment.width) || !positive(segment.height)) errors.push('invalid ground segment');
        if (segment.requires) condition(segment.requires);
      }
    }
    if (map.exit?.mode === 'region' && (!Number.isFinite(map.exit.y) || !positive(map.exit.width) || !positive(map.exit.height))) errors.push('region exit needs x/y/width/height');
    return errors;
  }
  api.maps = Object.freeze({
    validate,
    register(definition) {
      const phase = clone(definition);
      phase.entities = {platforms:[], obstacles:[], components:[], enemies:[], collectibles:[], features:[], gates:[], interactives:[], ...phase.entities};
      phase.assets ??= [];
      phase.layers ??= [];
      phase.mechanics ??= [];
      phase.objectives = {defeatAllViruses:false, repairAllComponents:false, requireExitQuestion:true, enemiesToDefeat:phase.entities.enemies.length, componentsToRepair:phase.entities.components.length, goals:[], ...phase.objectives};
      const errors = validate(phase);
      if (errors.length) throw new Error('Map '+(phase.id || '?')+': '+errors.join('; '));
      if (definitions.has(phase.id)) throw new Error('Duplicate map: '+phase.id);
      definitions.set(phase.id, freeze(phase));
      return phase;
    },
    get(id) {
      if (!definitions.has(id)) throw new Error('Map not loaded: '+id);
      return definitions.get(id);
    },
    campaign(ids) { return Object.freeze(ids.map(id => this.get(id))); },
    clone,
    list() { return [...definitions.values()]; }
  });
})();
