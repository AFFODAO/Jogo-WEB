/* Identidades estáveis dos objetivos de reparo. */
ByteRunner.repairV2Manifest=Object.freeze({
  "phase-01/socket:cpu-relay": {
    "type": "v2-fan-replacement",
    "difficulty": 2,
    "legacy": "cooling",
    "variant": "Trocar a ventoinha da CPU, fixar quatro apoios e restabelecer refrigeração."
  },
  "phase-01/ram-base:ram-relay": {
    "type": "v2-ram-install",
    "difficulty": 1,
    "legacy": "ram",
    "variant": "Três módulos e três slots com entalhes distintos, presilhas e LEDs."
  },
  "phase-01/bus-west:bus-relay": {
    "type": "v2-cpu-install",
    "difficulty": 2,
    "legacy": "circuit",
    "variant": "Instalar e travar o processador para reativar a malha dos barramentos."
  },
  "phase-01/gpu-east:gpu-relay": {
    "type": "v2-power-wiring",
    "difficulty": 2,
    "legacy": "gpu",
    "variant": "Reconectar alimentação da placa-mãe e do banco da GPU a partir da fonte."
  },
  "phase-02/root:index": {
    "type": "v2-file-recovery",
    "difficulty": 2,
    "legacy": "files",
    "variant": "Reunir seis fragmentos em dois arquivos para reconstruir o índice."
  },
  "phase-02/scheduler:scheduler": {
    "type": "v2-process-repair",
    "difficulty": 2,
    "legacy": "software",
    "variant": "Reordenar carga, validação, execução e liberação na esteira da CPU."
  },
  "phase-02/swap:paging": {
    "type": "v2-system-restore",
    "difficulty": 3,
    "legacy": "boot",
    "variant": "Reconectar carregador, memória e inicialização e reiniciar o sistema."
  },
  "phase-02/recovery:recovery": {
    "type": "v2-virus-cleanup",
    "difficulty": 2,
    "legacy": "quarantine",
    "variant": "Analisar arquivos do desktop, preservar íntegros e isolar três ameaças."
  },
  "phase-02/kernel-stack:kernel": {
    "type": "v2-process-repair",
    "difficulty": 3,
    "legacy": "software",
    "variant": "Executar módulos do núcleo, memória, serviços e saída em dependência."
  },
  "phase-03/matrix-north:table": {
    "type": "v2-packet-diverter",
    "difficulty": 2,
    "legacy": "packets",
    "variant": "Encaminhar pacotes conforme a tabela de destinos."
  },
  "phase-03/core-guard:fabric": {
    "type": "v2-packet-diverter",
    "difficulty": 3,
    "legacy": "packets",
    "variant": "Restaurar o núcleo com entrega confirmada de pacotes."
  },
  "phase-03/uplink-crown:uplink": {
    "type": "v2-uplink-clutch",
    "difficulty": 3,
    "legacy": "uplink",
    "variant": "Substituir o módulo avariado e restaurar a alimentação."
  },
  "phase-03/port04:connector": {
    "type": "v2-patch-leads",
    "difficulty": 2,
    "legacy": "ethernet",
    "variant": "Reconectar cabos RJ45 às portas numeradas."
  },
  "phase-03/port01:connector": {
    "type": "v2-patch-leads",
    "difficulty": 2,
    "legacy": "ethernet",
    "variant": "Restabelecer os enlaces das portas Ethernet."
  },
  "phase-03/channel-relay:bus": {
    "type": "v2-vlan-shutters",
    "difficulty": 3,
    "legacy": "vlan",
    "variant": "Reparar circuitos e ativar apenas as portas solicitadas."
  },
  "phase-04/gateway-tower:gateway": {
    "type": "v2-gateway-periscope",
    "difficulty": 3,
    "legacy": "gateway",
    "variant": "Restaurar o gateway com volante de destino, ponte de saída e três entregas confirmadas."
  },
  "phase-04/iface-lan:lan": {
    "type": "v2-interface-crimp",
    "difficulty": 2,
    "legacy": "interfaces",
    "variant": "Restaurar o painel LAN: retirar conectores avariados, instalar módulos e reativar os enlaces."
  },
  "phase-04/core-main:table": {
    "type": "v2-prefix-cams",
    "difficulty": 3,
    "legacy": "route-table",
    "variant": "Alinhar módulos internos, reconstruir vias eletrônicas e energizar o núcleo de roteamento."
  },
  "phase-04/wan-relay:link": {
    "type": "v2-route-rail",
    "difficulty": 3,
    "legacy": "route",
    "variant": "Reconstruir uma rota válida entre roteadores e confirmar o tráfego WAN com três pacotes."
  },
  "phase-04/iface-console:transit": {
    "type": "v2-route-rail",
    "difficulty": 3,
    "legacy": "route",
    "variant": "Reconectar a topologia de trânsito pela rota alternativa e testar a entrega ao destino."
  },
  "phase-04/iface-wan:wan": {
    "type": "v2-interface-crimp",
    "difficulty": 3,
    "legacy": "interfaces",
    "variant": "Substituir interfaces do painel WAN e restabelecer os cabos e os LEDs de enlace."
  },
  "phase-05/main-array:uplink": {
    "type": "v2-dish-gimbal",
    "difficulty": 3,
    "legacy": "antenna",
    "variant": "Girar a antena principal, alinhar o feixe ao receptor e confirmar o enlace por ondas de rádio."
  },
  "phase-05/repeater-west:west": {
    "type": "v2-repeater-mast",
    "difficulty": 3,
    "legacy": "repeaters",
    "variant": "Posicionar três repetidores em uma cadeia conectada e cobrir as zonas A, B e C."
  },
  "phase-05/repeater-east:east": {
    "type": "v2-repeater-mast",
    "difficulty": 4,
    "legacy": "repeaters",
    "variant": "Reconstruir a cobertura leste, reposicionando repetidores e evitando a base obstruída."
  },
  "phase-05/noise-center:spectrum": {
    "type": "v2-spectrum-tuner",
    "difficulty": 3,
    "legacy": "channel",
    "variant": "Aplicar filtros de rejeição aos picos de interferência sem bloquear a portadora útil."
  },
  "phase-05/transmit-west:carrier": {
    "type": "v2-rf-compressor",
    "difficulty": 3,
    "legacy": "power-signal",
    "variant": "Calibrar a potência e a ventilação do transmissor com indicadores de sinal e temperatura."
  },
  "phase-05/base-west:association": {
    "type": "v2-spectrum-tuner",
    "difficulty": 3,
    "legacy": "channel",
    "variant": "Limpar o espectro da estação-base e estabilizar a transmissão preservando o sinal útil."
  },
  "phase-06/roof-controls:antenna": {
    "type": "v2-fiber-splice",
    "difficulty": 3,
    "legacy": "fiber",
    "variant": "Alinhar os dois núcleos e travar o acoplador com transmissão óptica total."
  },
  "phase-06/upper-hub:distribution": {
    "type": "v2-cable-reel",
    "difficulty": 3,
    "legacy": "connectors",
    "variant": "Desencapar duas extremidades, alinhar condutores e restaurar o isolamento da emenda."
  },
  "phase-06/shaft-west-mid:motor": {
    "type": "v2-continuity-trace",
    "difficulty": 3,
    "legacy": "continuity",
    "variant": "Medir continuidade, localizar a ruptura e confirmar a restauração com oito LEDs."
  },
  "phase-06/maintenance-west:service": {
    "type": "v2-rj45-comb",
    "difficulty": 3,
    "legacy": "cabling",
    "variant": "Crimpar os oito fios conforme a pinagem T568A indicada no conector."
  },
  "phase-06/central-main:patch": {
    "type": "v2-cable-reel",
    "difficulty": 4,
    "legacy": "connectors",
    "variant": "Reconstruir a emenda do cabo central e fechar a manga isolante."
  },
  "phase-06/central-east:trunk": {
    "type": "v2-rj45-comb",
    "difficulty": 4,
    "legacy": "cabling",
    "variant": "Crimpar os oito fios conforme a pinagem T568B indicada no conector."
  },
  "phase-06/basement-power:power": {
    "type": "v2-continuity-trace",
    "difficulty": 4,
    "legacy": "continuity",
    "variant": "Diagnosticar duas rupturas e testar novamente após reparar os condutores."
  },
  "phase-07/gateway-plaza:gateway": {
    "type": "v2-pool-sluice",
    "difficulty": 3,
    "legacy": "ip-pool",
    "variant": "Definir intervalo DHCP sem gateway, reservas e extremos da sub-rede."
  },
  "phase-07/address-office:scope": {
    "type": "v2-pool-sluice",
    "difficulty": 4,
    "legacy": "ip-pool",
    "variant": "Dimensionar intervalo para os clientes sem incluir os dois IPs reservados."
  },
  "phase-07/reserve-main:reservation": {
    "type": "v2-lease-pneumatics",
    "difficulty": 4,
    "legacy": "ip-reservations",
    "variant": "Entregar IPs por sub-rede, preservando a reserva da impressora."
  },
  "phase-07/central-core:server": {
    "type": "v2-reservation-drum",
    "difficulty": 3,
    "legacy": "ip-distribution",
    "variant": "Restaurar o servidor central sem perder os registros de clientes e reservas."
  },
  "phase-07/conflict-core:conflict": {
    "type": "v2-conflict-localizer",
    "difficulty": 4,
    "legacy": "ip-conflicts",
    "variant": "Substituir o IP duplicado sem alterar a identidade registrada de seu titular."
  },
  "phase-07/distribution-south:relay": {
    "type": "v2-lease-pneumatics",
    "difficulty": 4,
    "legacy": "ip-distribution",
    "variant": "Entregar ao sensor retransmitido um IP livre de sua sub-rede."
  },
  "phase-08/root-core:hints": {
    "type": "v2-delegation-hoist",
    "difficulty": 3,
    "legacy": "dns-tree",
    "variant": "Restaurar a raiz, os servidores de topo e os servidores das zonas delegadas."
  },
  "phase-08/com-records:records": {
    "type": "v2-record-engraver",
    "difficulty": 4,
    "legacy": "dns-records",
    "variant": "Reconectar os nomes da zona example.com aos IPs dos registros A."
  },
  "phase-08/com-zone:delegation": {
    "type": "v2-delegation-hoist",
    "difficulty": 4,
    "legacy": "dns-tree",
    "variant": "Restaurar a hierarquia e os enlaces entre pais e filhos das zonas DNS."
  },
  "phase-08/org-records:records": {
    "type": "v2-record-engraver",
    "difficulty": 4,
    "legacy": "dns-records",
    "variant": "Conectar nomes e IPs seguindo registros A e o alias CNAME da zona example.org."
  },
  "phase-08/cache-crown:ttl": {
    "type": "v2-cache-carousel",
    "difficulty": 4,
    "legacy": "dns-cache",
    "variant": "Retirar registros com TTL expirado e inserir respostas renovadas sem apagar entradas ainda válidas."
  },
  "phase-08/cache-terminal:recursive": {
    "type": "v2-query-courier",
    "difficulty": 4,
    "legacy": "dns-query",
    "variant": "Guiar a consulta de portal.example.com pela raiz, topo e autoridade; receber a resposta no resolvedor."
  },
  "phase-08/resolve-core:resolution": {
    "type": "v2-query-courier",
    "difficulty": 4,
    "legacy": "dns-query",
    "variant": "Seguir as delegações de arquivos.example.org e trazer a resposta da autoridade correta."
  },
  "phase-09/c01": {
    "type": "v2-policy-camshaft",
    "difficulty": 4,
    "legacy": "policy-order",
    "variant": "Ordenar regras de origem, HTTPS, SSH administrativo e bloqueio final; validar primeira correspondência."
  },
  "phase-09/c02": {
    "type": "v2-inspection-airlock",
    "difficulty": 4,
    "legacy": "firewall",
    "variant": "Operar portas de liberação e descarte conforme origem, porta e estado de cada pacote."
  },
  "phase-09/c05": {
    "type": "v2-shield-iris",
    "difficulty": 4,
    "legacy": "barriers",
    "variant": "Girar e reconectar os três módulos da barreira para restaurar sua proteção."
  },
  "phase-09/c06": {
    "type": "v2-shield-iris",
    "difficulty": 4,
    "legacy": "barriers",
    "variant": "Restaurar a barreira interna com acopladores em orientações diferentes."
  },
  "phase-09/c03": {
    "type": "v2-policy-camshaft",
    "difficulty": 5,
    "legacy": "policy-order",
    "variant": "Testar regras sobrepostas e impedir que HTTPS amplo oculte uma origem bloqueada."
  },
  "phase-09/c07": {
    "type": "v2-threat-triangulation",
    "difficulty": 4,
    "legacy": "threats",
    "variant": "Inspecionar assinaturas e separar ameaças de tráfego legítimo."
  },
  "phase-09/c04": {
    "type": "v2-inspection-airlock",
    "difficulty": 5,
    "legacy": "firewall",
    "variant": "Intertravar portas para descartar pacotes perigosos e preservar tráfego autorizado."
  },
  "phase-09/c08": {
    "type": "v2-threat-triangulation",
    "difficulty": 5,
    "legacy": "threats",
    "variant": "Quarentenar assinaturas maliciosas e conteúdo com integridade inválida; preservar pacotes íntegros."
  },
  "phase-10/c01": {
    "type": "v2-rack-busbars",
    "difficulty": 4,
    "legacy": "rack-power",
    "variant": "Instalar fontes redundantes compatíveis, aterrar o rack e testar a partida."
  },
  "phase-10/c02": {
    "type": "v2-replica-flywheels",
    "difficulty": 4,
    "legacy": "servers",
    "variant": "Restaurar as ventoinhas da torre B e estabilizar o ar frio dos racks."
  },
  "phase-10/c05": {
    "type": "v2-rack-gantry",
    "difficulty": 4,
    "legacy": "fiber",
    "variant": "Distribuir os módulos de processamento do backbone sem sobrecarregar os servidores."
  },
  "phase-10/c06": {
    "type": "v2-rack-busbars",
    "difficulty": 4,
    "legacy": "rack-power",
    "variant": "Restaurar a alimentação da oficina com isolamento e aterramento."
  },
  "phase-10/c07": {
    "type": "v2-backbone-prisms",
    "difficulty": 5,
    "legacy": "fiber",
    "variant": "Reconectar relés da rede central e restaurar mecanismos em ordem de dependência."
  },
  "phase-10/c03": {
    "type": "v2-rack-gantry",
    "difficulty": 4,
    "legacy": "rack-load",
    "variant": "Redistribuir o processamento entre racks com capacidade, reserva e equilíbrio."
  },
  "phase-10/c08": {
    "type": "v2-backbone-prisms",
    "difficulty": 5,
    "legacy": "circuit",
    "variant": "Restaurar relés redundantes e carregar o núcleo pela sequência de dependências."
  },
  "phase-10/c09": {
    "type": "v2-rack-gantry",
    "difficulty": 5,
    "legacy": "rack-load",
    "variant": "Equilibrar os módulos dos bancos com uma bancada temporária para as transferências."
  },
  "phase-10/c10": {
    "type": "v2-replica-flywheels",
    "difficulty": 5,
    "legacy": "servers",
    "variant": "Restabelecer a refrigeração da contenção sem retirar a ventoinha íntegra."
  },
  "phase-10/c11": {
    "type": "v2-rack-busbars",
    "difficulty": 5,
    "legacy": "circuit",
    "variant": "Restaurar fontes A/B e controle do barramento final, sem alimentar circuitos cruzados."
  },
  "phase-10/c12": {
    "type": "v2-replica-flywheels",
    "difficulty": 5,
    "legacy": "core-relays",
    "variant": "Estabilizar a temperatura dos servidores de apoio ao núcleo."
  },
  "phase-10/c04": {
    "type": "v2-backbone-prisms",
    "difficulty": 5,
    "legacy": "core-relays",
    "variant": "Reconectar relés e ativar o núcleo em dependências; emitir apenas o reparo normal, preservando VIRUS ZERO."
  }
});
