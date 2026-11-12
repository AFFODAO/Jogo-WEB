/* Stable component identities; never reorder campaign entities. */
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
    "variant": "Desviar quatro pacotes conforme símbolos de destino da tabela MAC."
  },
  "phase-03/core-guard:fabric": {
    "type": "v2-packet-diverter",
    "difficulty": 3,
    "legacy": "packets",
    "variant": "Adicionar buffer intermediário e cruzamento de duas esteiras."
  },
  "phase-03/uplink-crown:uplink": {
    "type": "v2-uplink-clutch",
    "difficulty": 3,
    "legacy": "uplink",
    "variant": "Dois volantes com ritmos diferentes e transmissão redundante."
  },
  "phase-03/port04:connector": {
    "type": "v2-patch-leads",
    "difficulty": 2,
    "legacy": "ethernet",
    "variant": "Cabo curto precisa passar por uma guia antes da porta 04."
  },
  "phase-03/port01:connector": {
    "type": "v2-patch-leads",
    "difficulty": 2,
    "legacy": "ethernet",
    "variant": "Conector inferior; liberar cabo preso antes de chegar à porta 01."
  },
  "phase-03/channel-relay:bus": {
    "type": "v2-vlan-shutters",
    "difficulty": 3,
    "legacy": "vlan",
    "variant": "Separar três grupos com duas divisórias e fechar vazamento lateral."
  },
  "phase-04/gateway-tower:gateway": {
    "type": "v2-gateway-periscope",
    "difficulty": 3,
    "legacy": "gateway",
    "variant": "Três túneis, dois beacons locais e uma saída com eco externo."
  },
  "phase-04/iface-lan:lan": {
    "type": "v2-interface-crimp",
    "difficulty": 2,
    "legacy": "interfaces",
    "variant": "Terminação de cobre com medida e prensa de contatos LAN."
  },
  "phase-04/core-main:table": {
    "type": "v2-prefix-cams",
    "difficulty": 3,
    "legacy": "route-table",
    "variant": "Dois anéis de faixa e uma exceção mais específica."
  },
  "phase-04/wan-relay:link": {
    "type": "v2-route-rail",
    "difficulty": 3,
    "legacy": "route",
    "variant": "Trilho de túnel WAN com obstáculo central e duas casas livres."
  },
  "phase-04/iface-console:transit": {
    "type": "v2-route-rail",
    "difficulty": 3,
    "legacy": "route",
    "variant": "Duas sondas percorrem caminho de trânsito com bifurcação compartilhada."
  },
  "phase-04/iface-wan:wan": {
    "type": "v2-interface-crimp",
    "difficulty": 3,
    "legacy": "interfaces",
    "variant": "Terminação WAN com blindagem e ordem de fechamento da prensa."
  },
  "phase-05/main-array:uplink": {
    "type": "v2-dish-gimbal",
    "difficulty": 3,
    "legacy": "antenna",
    "variant": "Prato grande com azimute e elevação; fixar ambos os eixos."
  },
  "phase-05/repeater-west:west": {
    "type": "v2-repeater-mast",
    "difficulty": 3,
    "legacy": "repeaters",
    "variant": "Mastro atrás de parede baixa e cobertura de três zonas."
  },
  "phase-05/repeater-east:east": {
    "type": "v2-repeater-mast",
    "difficulty": 4,
    "legacy": "repeaters",
    "variant": "Dois obstáculos e cadeia com segundo mastro dependente do primeiro."
  },
  "phase-05/noise-center:spectrum": {
    "type": "v2-spectrum-tuner",
    "difficulty": 3,
    "legacy": "channel",
    "variant": "Evitar dois picos preservando largura mínima de faixa."
  },
  "phase-05/transmit-west:carrier": {
    "type": "v2-rf-compressor",
    "difficulty": 3,
    "legacy": "power-signal",
    "variant": "Reservatório pequeno; manter pulsos dentro da margem do receptor."
  },
  "phase-05/base-west:association": {
    "type": "v2-spectrum-tuner",
    "difficulty": 3,
    "legacy": "channel",
    "variant": "Faixa útil estreita e pico móvel previsível, com avanço por passos."
  },
  "phase-06/roof-controls:antenna": {
    "type": "v2-fiber-splice",
    "difficulty": 3,
    "legacy": "fiber",
    "variant": "Faces contaminadas e alinhamento do enlace de cobertura."
  },
  "phase-06/upper-hub:distribution": {
    "type": "v2-cable-reel",
    "difficulty": 3,
    "legacy": "connectors",
    "variant": "Conduàte superior com duas curvas e limite de folga."
  },
  "phase-06/shaft-west-mid:motor": {
    "type": "v2-continuity-trace",
    "difficulty": 3,
    "legacy": "continuity",
    "variant": "Sondar três trechos atà localizar falha do motor do elevador."
  },
  "phase-06/maintenance-west:service": {
    "type": "v2-rj45-comb",
    "difficulty": 3,
    "legacy": "cabling",
    "variant": "Pinagem de oito fios com gabarito T568A ilustrado."
  },
  "phase-06/central-main:patch": {
    "type": "v2-cable-reel",
    "difficulty": 4,
    "legacy": "connectors",
    "variant": "Dois conduàtes possàveis; um excede curvatura do cabo."
  },
  "phase-06/central-east:trunk": {
    "type": "v2-rj45-comb",
    "difficulty": 4,
    "legacy": "cabling",
    "variant": "Gabarito T568B e ponta danificada que precisa ser recortada."
  },
  "phase-06/basement-power:power": {
    "type": "v2-continuity-trace",
    "difficulty": 4,
    "legacy": "continuity",
    "variant": "Duas rupturas em ramificaààes e energização somente após isolamento."
  },
  "phase-07/gateway-plaza:gateway": {
    "type": "v2-pool-sluice",
    "difficulty": 3,
    "legacy": "ip-pool",
    "variant": "Excluir gateway reservado e extremos de rede/broadcast."
  },
  "phase-07/address-office:scope": {
    "type": "v2-pool-sluice",
    "difficulty": 4,
    "legacy": "ip-pool",
    "variant": "Dimensionar capacidade útil com dois endereços reservados internos."
  },
  "phase-07/reserve-main:reservation": {
    "type": "v2-reservation-drum",
    "difficulty": 4,
    "legacy": "ip-reservations",
    "variant": "Três identidades e uma reserva já fixada que nào pode mudar."
  },
  "phase-07/central-core:server": {
    "type": "v2-lease-pneumatics",
    "difficulty": 3,
    "legacy": "ip-distribution",
    "variant": "Atender três clientes por tubos com endereços exclusivos."
  },
  "phase-07/conflict-core:conflict": {
    "type": "v2-conflict-localizer",
    "difficulty": 4,
    "legacy": "ip-conflicts",
    "variant": "Localizar duplicata e manter a concessão mais antiga."
  },
  "phase-07/distribution-south:relay": {
    "type": "v2-lease-pneumatics",
    "difficulty": 4,
    "legacy": "ip-distribution",
    "variant": "Retorno de càpsula expirada antes de atender novo cliente via relay."
  },
  "phase-08/root-core:hints": {
    "type": "v2-delegation-hoist",
    "difficulty": 3,
    "legacy": "dns-tree",
    "variant": "Sustentar raiz e duas ramificaààes de servidores de topo."
  },
  "phase-08/com-records:records": {
    "type": "v2-record-engraver",
    "difficulty": 4,
    "legacy": "dns-records",
    "variant": "Gravar nome e endereço de uma zona .com com duas trilhas pràximas."
  },
  "phase-08/com-zone:delegation": {
    "type": "v2-delegation-hoist",
    "difficulty": 4,
    "legacy": "dns-tree",
    "variant": "Adicionar subzona; impedir vànculo que fecha ciclo."
  },
  "phase-08/org-records:records": {
    "type": "v2-record-engraver",
    "difficulty": 4,
    "legacy": "dns-records",
    "variant": "Nome de zona .org com trilha de alias antes do endereço final."
  },
  "phase-08/cache-crown:ttl": {
    "type": "v2-cache-carousel",
    "difficulty": 4,
    "legacy": "dns-cache",
    "variant": "Separar expiração de versão antiga; preservar entradas vàlidas."
  },
  "phase-08/cache-terminal:recursive": {
    "type": "v2-query-courier",
    "difficulty": 4,
    "legacy": "dns-query",
    "variant": "Coletar referências de raiz, topo e autoridade antes de retornar."
  },
  "phase-08/resolve-core:resolution": {
    "type": "v2-query-courier",
    "difficulty": 4,
    "legacy": "dns-query",
    "variant": "Referància desviada para outra zona; voltar e trazer selo correto."
  },
  "phase-09/c01": {
    "type": "v2-policy-camshaft",
    "difficulty": 4,
    "legacy": "policy-order",
    "variant": "Perímetro com exceção anterior à regra geral; testar três fluxos."
  },
  "phase-09/c02": {
    "type": "v2-inspection-airlock",
    "difficulty": 4,
    "legacy": "firewall",
    "variant": "Inspecionar dois selos por fluxo e manter intertravamento da eclusa."
  },
  "phase-09/c05": {
    "type": "v2-shield-iris",
    "difficulty": 4,
    "legacy": "barriers",
    "variant": "Reposicionar três lâminas e recompor vedação da eclusa."
  },
  "phase-09/c06": {
    "type": "v2-shield-iris",
    "difficulty": 4,
    "legacy": "barriers",
    "variant": "Mola com dois pontos de tensão e teste de estanqueidade dos dutos."
  },
  "phase-09/c03": {
    "type": "v2-policy-camshaft",
    "difficulty": 5,
    "legacy": "policy-order",
    "variant": "Anel interno com regras parcialmente sobrepostas e primeiro acionamento."
  },
  "phase-09/c07": {
    "type": "v2-threat-triangulation",
    "difficulty": 4,
    "legacy": "threats",
    "variant": "Triangular ameaça entre três sinais de referência conhecidos."
  },
  "phase-09/c04": {
    "type": "v2-inspection-airlock",
    "difficulty": 5,
    "legacy": "firewall",
    "variant": "Cidadela com fluxo de retorno e desvio de contenàào obrigatório."
  },
  "phase-09/c08": {
    "type": "v2-threat-triangulation",
    "difficulty": 5,
    "legacy": "threats",
    "variant": "Duas ameaças com evidàncias complementares; poupar emissor íntegro."
  },
  "phase-10/c01": {
    "type": "v2-rack-busbars",
    "difficulty": 4,
    "legacy": "rack-power",
    "variant": "Entrada do data center: duas fontes e três contatos de torque."
  },
  "phase-10/c02": {
    "type": "v2-replica-flywheels",
    "difficulty": 4,
    "legacy": "servers",
    "variant": "Sincronizar dois volantes da torre B e acoplar réplica."
  },
  "phase-10/c05": {
    "type": "v2-backbone-prisms",
    "difficulty": 4,
    "legacy": "fiber",
    "variant": "Fibra da torre A: dois receptores e um prisma divisor."
  },
  "phase-10/c06": {
    "type": "v2-rack-busbars",
    "difficulty": 4,
    "legacy": "rack-power",
    "variant": "Oficina: isolar ramificação avariada antes de religar alimentação."
  },
  "phase-10/c07": {
    "type": "v2-backbone-prisms",
    "difficulty": 5,
    "legacy": "fiber",
    "variant": "Canal de manutenção: contornar obstrução e preservar feixe de retorno."
  },
  "phase-10/c03": {
    "type": "v2-rack-gantry",
    "difficulty": 4,
    "legacy": "rack-load",
    "variant": "Transmissão: distribuir módulos entre racks com limites de capacidade."
  },
  "phase-10/c08": {
    "type": "v2-backbone-prisms",
    "difficulty": 5,
    "legacy": "circuit",
    "variant": "Rota redundante: alimentar receptores por dois caminhos independentes."
  },
  "phase-10/c09": {
    "type": "v2-rack-gantry",
    "difficulty": 5,
    "legacy": "rack-load",
    "variant": "Memória corrompida: retirar módulos do banco isolado sem reutilizá-lo."
  },
  "phase-10/c10": {
    "type": "v2-replica-flywheels",
    "difficulty": 5,
    "legacy": "servers",
    "variant": "Contenção: sincronizar três volantes sem destravar os já acoplados."
  },
  "phase-10/c11": {
    "type": "v2-rack-busbars",
    "difficulty": 5,
    "legacy": "circuit",
    "variant": "Barramento final: duas fontes, seção protegida e ordem de isolamento."
  },
  "phase-10/c12": {
    "type": "v2-replica-flywheels",
    "difficulty": 5,
    "legacy": "core-relays",
    "variant": "Backup do núcleo: acoplar réplicas seguindo referência mestre estável."
  },
  "phase-10/c04": {
    "type": "v2-rack-gantry",
    "difficulty": 5,
    "legacy": "core-relays",
    "variant": "Escudo do núcleo: reorganizar módulos de controle, respeitando dependências de relés; apenas emitir reparo normal."
  }
});
