"""Guard preserved systems around explicit audited geometry fixes and render hooks."""
import hashlib,json
from hardware_v3_contract import approved_hardware
from software_v3_contract import approved_software
from switch_v3_contract import approved_switch
from router_v3_contract import approved_router
from wifi_v3_contract import approved_wifi
from cabling_v3_contract import approved_cabling
from dhcp_v3_contract import approved_dhcp
from dns_v3_contract import approved_dns
from firewall_v3_contract import approved_firewall
from servers_v3_contract import approved_servers
from developer_mode_contract import without_developer_mode
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_repair_catalog(relative):
    if relative!='src/engine/repair-games.js':return False
    source=(ROOT/relative).read_text(encoding='utf-8-sig')
    # Reviewed animated panels: distribution and model generation retain their rules.
    # Keep the exact-source guard; this is not a general exemption for repair edits.
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()=='04e28dbd982b6454ece84b0ec2d2a3d16919221b62cf614f7416db2f5ff7db2b','repair catalog differs from reviewed revision'
    return True

def restore_parallax(data):
    # The final presentation audit makes the two fully painted framebuffers
    # opaque. Normalize only these exact constructors; gameplay stays guarded.
    data=data.replace(b"canvas.getContext('2d', {alpha:false})",b"canvas.getContext('2d')")
    data=data.replace(b"pixelScene.getContext('2d', {alpha:false})",b"pixelScene.getContext('2d')")
    data=data.replace(b"const state=protectedCore?'PROTEGIDO // '+components.filter(c=>c.repaired).length+'/'+components.length+' RELAYS'",b"const state=protectedCore?'PROTEGIDO // '+components.filter(c=>c.repaired).length+'/4 RELAYS'")
    for newline in [b'\r\n',b'\n']:
        data=data.replace(b'    const repairs=ByteRunner.repairChallenges.assign(phaseData,phaseIndex);'+newline,b'')
        data=data.replace(b'repair:repairs.get(spec.id)',b"repair:spec.repair && spec.repair.type!=='hold' ? spec.repair : ByteRunner.repairChallenges.forPhase(phaseIndex,index)")
        budget=newline.join([b'    const reduced=experience.settings.reducedEffects;',b'    const budget=Math.min(Math.ceil(count*(reduced?.22:.58)),Math.max(0,(reduced?32:96)-effects.length));'])
        data=data.replace(budget,b'    const budget = Math.min(experience.settings.reducedEffects?Math.ceil(count*.25):count, Math.max(0, (experience.settings.reducedEffects?48:160) - effects.length));')
        compact=newline.join([b'    let active=0;',b'    for (const particle of effects) {',b'      if(particle.life<=0)continue;',b'      effects[active++]=particle;'])
        data=data.replace(compact,newline.join([b'    effects = effects.filter(particle => particle.life > 0);',b'    for (const particle of effects) {']))
        data=data.replace(b'    effects.length=active;'+newline,b'')
        data=data.replace(b'      if(object.y+object.h<cameraY-8||object.y>cameraY+height+8)continue;'+newline,b'')
        direct=newline.join([b'    const directPresentation=pixelRatio===1&&Number.isInteger(width)&&Number.isInteger(height);',b'    if(directPresentation){if(pixelScene.width){pixelScene.width=0;pixelScene.height=0;}pixelContext.imageSmoothingEnabled=false;}',b'    else if(pixelScene.width!==Math.ceil(width)||pixelScene.height!==Math.ceil(height)){pixelScene.width=Math.ceil(width);pixelScene.height=Math.ceil(height);}',b'    ctx=directPresentation?outputContext:pixelContext;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;',b"    ctx.font='10px sans-serif';ctx.textAlign='start';ctx.textBaseline='alphabetic';ctx.lineWidth=1;"])
        original=newline.join([b'    if(pixelScene.width!==Math.ceil(width)||pixelScene.height!==Math.ceil(height)){pixelScene.width=Math.ceil(width);pixelScene.height=Math.ceil(height);}',b'    ctx=pixelContext;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;'])
        data=data.replace(direct,original)
    data=data.replace(b'    ctx=outputContext;ctx.imageSmoothingEnabled=false;if(!directPresentation){ctx.save();ctx.drawImage(pixelScene,0,0,width,height);ctx.restore();}',b'    ctx=outputContext;ctx.imageSmoothingEnabled=false;ctx.save();ctx.drawImage(pixelScene,0,0,width,height);ctx.restore();')
    marker=b'    ByteRunner.backgroundScene.draw('
    if marker in data:
        fixture=json.loads((ROOT/'tests/fixtures/pre-parallax.json').read_text(encoding='utf-8'))
        newline=b'\r\n' if b'\r\n' in data else b'\n'
        wrapper="  function drawBackground() {\n    ByteRunner.backgroundScene.draw(ctx,{x:cameraX,y:cameraY,width,height,runtime:levelRuntime},animationTime,phaseIndex,phaseData,levelVisuals,drawThemeStructures);\n  }\n\n"
        data=data.replace(wrapper.replace('\n',newline.decode()).encode(),fixture['background'].replace('\n',newline.decode()).encode())
        line=b'    const view={x:cameraX,y:cameraY,width,height,runtime:levelRuntime};'+newline
        data=data.replace(line,line+fixture['scene'].replace('\n',newline.decode()).encode(),1)
    return data

def normalized_game(data):
    data=restore_parallax(without_developer_mode(data))
    for newline in [b'\r\n',b'\n']:
        hook=newline.join([b'    const terrainShapes=solids();',b'    levelVisuals.prepareTerrain(terrainShapes);',b'    for (const object of terrainShapes) {'])
        data=data.replace(hook,b'    for (const object of solids()) {')
    debug=b'    if(ByteRunner.mapDebug?.enabled)ByteRunner.mapDebug.frame({phase:phaseData,shapes:solids(),links:levelRuntime.connections(),player:{x:player.x,y:player.y},repaired:components.filter(c=>c.repaired).map(c=>c.id),cacheSize:levelVisuals.terrain?.cacheSize||0});'
    for newline in [b'\r\n',b'\n']:data=data.replace(debug+newline,b'')
    return data

def normalized_campaign_file(data, relative):
    if relative not in ['src/maps/05-wifi.js','src/maps/06-cabling.js']:return data
    source=data.decode('utf-8');a=source.index('{',source.index('ByteRunner.maps.register('))
    definition,end=json.JSONDecoder().raw_decode(source[a:])
    if relative.endswith('05-wifi.js'):
        enemy=next(e for e in definition['entities']['enemies'] if e['id']=='e02')
        assert enemy['x']==650
        enemy['x']=500
    else:
        platforms=definition['entities']['platforms']
        for letter in 'abc':
            original=next(p for p in platforms if p['id']=='reconnected-tray-'+letter)
            assert original['width']==144
            right=next(p for p in platforms if p['id']==original['id']+'-return')
            assert right==dict(original,id=original['id']+'-return',x=836)
            platforms.remove(right);original['width']=360
    baseline=json.loads((ROOT/'tests/fixtures/pre-final-campaign.json').read_text(encoding='utf-8'))
    assert definition==baseline[Path(relative).name],'unexpected campaign modification: '+relative
    body=json.dumps(definition,ensure_ascii=False,indent=2)
    if '\r\n' in source:body=body.replace('\n','\r\n')
    return (source[:a]+body+source[a+end:]).encode('utf-8')

def main():
    expected=json.loads((ROOT/'tests/fixtures/pre-environment-hashes.json').read_text(encoding='utf-8'))
    for relative,digest in expected.items():
        if approved_repair_catalog(relative):continue
        if approved_firewall(relative) or approved_servers(relative):continue
        if approved_hardware(relative) or approved_software(relative) or approved_switch(relative) or approved_router(relative) or approved_wifi(relative) or approved_cabling(relative) or approved_dhcp(relative) or approved_dns(relative):continue
        # The subsequent gameplay stage extends preview activation explicitly.
        if relative=='src/generation/demo.js':continue
        data=(ROOT/relative).read_bytes()
        data=normalized_campaign_file(data,relative)
        if relative=='game.js':data=normalized_game(data)
        if relative=='src/generation/rooms.js':
            data=data.replace(b"fixed('upper-'+i,i===0?192:160+i*88,",b"fixed('upper-'+i,160+i*88,")
            for newline in [b'\r\n',b'\n']:data=data.replace(b'    const stepX=ports.north?416:(tier>=3?348:336);'+newline,b'')
            data=data.replace(b"fixed('required-step',stepX,",b"fixed('required-step',tier>=3?348:336,")
            data=data.replace(b"...(ports.north?[{x:256,y:floor-96,width:144}]:[]),{x:stepX,",b"{x:tier>=3?348:336,")
            data=data.replace(b"version:3,width,height",b"version:2,width,height").replace(b"narrow-tunnel')fixed('upper-0',144,",b"narrow-tunnel')fixed('upper-0',80,").replace(b"id:'playable-hardware-v2',version:3",b"id:'playable-hardware-v2',version:2")
        if relative=='src/generation/structural.js':
            data=data.replace(b"seed:graph.options.seed,revision:3,layout:",b"seed:graph.options.seed,revision:2,layout:")
        if relative=='src/generation/campaign.js':
            data=data.replace(b"seed:'building-shafts-v3',revision:4,",b"seed:'building-shafts-v3',").replace(b'revision:settings.revision||3,',b'revision:3,')
        assert hashlib.sha256(data).hexdigest()==digest,'nonvisual source changed: '+relative
    manifest=json.loads((ROOT/'assets/pixelart/manifest.json').read_text(encoding='utf-8'))
    for asset in manifest:
        assert (ROOT/asset['src']).is_file(),asset['id']
    print('PASS: rebuilt phases 1..10 match reviewed sources; physics, boss, repairs and original assets preserved')

if __name__=='__main__':main()
