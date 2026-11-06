// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-07",
  "name": "Endereçamento IP e DHCP",
  "theme": "dhcp",
  "objective": "Restaure o DHCP, resolva conflitos e habilite reservas antes de alcançar o gateway da rede.",
  "palette": [
    "#0a2021",
    "#244d42",
    "#8df0b7",
    "#3f866a",
    "#c3d687"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 2800,
    "height": 1700,
    "layout": "hub",
    "start": {
      "x": 1370,
      "y": 952
    },
    "exit": {
      "mode": "region",
      "x": 2490,
      "y": 696,
      "width": 90,
      "height": 64
    },
    "bounds": {
      "left": true,
      "right": true,
      "ceiling": true,
      "floor": true
    },
    "camera": {
      "axes": [
        "x",
        "y"
      ],
      "followOffsetX": 0.44,
      "followOffsetY": 0.55
    },
    "ground": {
      "mode": "explicit",
      "segments": [
        {
          "id": "dhcp-core",
          "x": 1120,
          "y": 1000,
          "width": 600,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "scope-a",
          "x": 140,
          "y": 650,
          "width": 680,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "diagnostic-scope",
          "x": 140,
          "y": 1380,
          "width": 680,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "scope-b",
          "x": 2040,
          "y": 760,
          "width": 630,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "relay-scope",
          "x": 1940,
          "y": 1450,
          "width": 710,
          "height": 18,
          "collision": "one-way"
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1430,
        "y": 1000
      },
      {
        "x": 300,
        "y": 650
      },
      {
        "x": 2270,
        "y": 1450
      },
      {
        "x": 2330,
        "y": 760
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "núcleo DHCP",
      "escopo 10.0.10/24",
      "rede de diagnóstico",
      "relay e reservas",
      "gateway de saída"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "lease-left-a",
        "x": 950,
        "y": 1090,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01",
        "motion": {
          "axis": "x",
          "range": 18,
          "speed": 0.55
        }
      },
      {
        "id": "lease-left-b",
        "x": 760,
        "y": 1180,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01"
      },
      {
        "id": "lease-left-c",
        "x": 580,
        "y": 1270,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01",
        "motion": {
          "axis": "y",
          "range": 8,
          "speed": 0.55
        }
      },
      {
        "id": "lease-right-a",
        "x": 1730,
        "y": 1090,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01"
      },
      {
        "id": "lease-right-b",
        "x": 1900,
        "y": 1180,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01",
        "motion": {
          "axis": "x",
          "range": 18,
          "speed": 0.55
        }
      },
      {
        "id": "lease-right-c",
        "x": 2080,
        "y": 1270,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01"
      },
      {
        "id": "lease-right-d",
        "x": 2260,
        "y": 1360,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01"
      },
      {
        "id": "scope-return-a",
        "x": 820,
        "y": 740,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "scope-return-b",
        "x": 1000,
        "y": 830,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02",
        "motion": {
          "axis": "y",
          "range": 8,
          "speed": 0.55
        }
      },
      {
        "id": "scope-return-c",
        "x": 1120,
        "y": 920,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "gateway-lease-a",
        "x": 1740,
        "y": 920,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requires": {
          "flag": "dhcp-on"
        }
      },
      {
        "id": "gateway-lease-b",
        "x": 1910,
        "y": 840,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requires": {
          "flag": "dhcp-on"
        },
        "motion": {
          "axis": "x",
          "range": 18,
          "speed": 0.55
        }
      },
      {
        "id": "conflict-bypass",
        "x": 490,
        "y": 560,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "reserved-route",
        "x": 2100,
        "y": 670,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c03"
      },
      {
        "id": "diagnostic-cache",
        "x": 220,
        "y": 1290,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "scope-cache",
        "x": 170,
        "y": 560,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "gateway-cache",
        "x": 2260,
        "y": 670,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "relay-cache",
        "x": 2460,
        "y": 1360,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      }
    ],
    "obstacles": [
      {
        "id": "duplicate-address",
        "x": 510,
        "y": 540,
        "width": 32,
        "height": 110,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c02"
      }
    ],
    "gates": [
      {
        "id": "gateway-service-lock",
        "x": 2380,
        "y": 630,
        "width": 24,
        "height": 130,
        "opensWhen": {
          "all": [
            {
              "flag": "dhcp-on"
            },
            {
              "flag": "reservation"
            }
          ]
        }
      }
    ],
    "components": [
      {
        "id": "c01",
        "x": 1380,
        "y": 956,
        "width": 34,
        "height": 44,
        "label": "SERVIÇO DHCP"
      },
      {
        "id": "c02",
        "x": 370,
        "y": 606,
        "width": 34,
        "height": 44,
        "label": "POOL EM CONFLITO"
      },
      {
        "id": "c03",
        "x": 2290,
        "y": 1406,
        "width": 34,
        "height": 44,
        "label": "RELAY DHCP"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "fast",
        "x": 600,
        "y": 1356,
        "groundY": 1380,
        "navigationBounds": {
          "left": 220,
          "right": 740
        },
        "patrolMin": 220,
        "patrolMax": 740,
        "activationRegion": {
          "x": 140,
          "y": 1100,
          "width": 680,
          "height": 340
        }
      },
      {
        "id": "e02",
        "type": "armored",
        "x": 740,
        "y": 626,
        "groundY": 650,
        "navigationBounds": {
          "left": 570,
          "right": 770
        },
        "patrolMin": 570,
        "patrolMax": 770,
        "activationRegion": {
          "x": 140,
          "y": 390,
          "width": 680,
          "height": 320
        }
      },
      {
        "id": "e03",
        "type": "flyer",
        "x": 2500,
        "y": 668,
        "groundY": 760,
        "navigationBounds": {
          "left": 2110,
          "right": 2600
        },
        "patrolMin": 2110,
        "patrolMax": 2600,
        "activationRegion": {
          "x": 1950,
          "y": 440,
          "width": 760,
          "height": 380
        }
      },
      {
        "id": "e04",
        "type": "basic",
        "x": 2480,
        "y": 1426,
        "groundY": 1450,
        "navigationBounds": {
          "left": 2070,
          "right": 2600
        },
        "patrolMin": 2070,
        "patrolMax": 2600,
        "activationRegion": {
          "x": 1940,
          "y": 1190,
          "width": 710,
          "height": 320
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 280,
        "y": 1260,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 230,
        "y": 530,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 2320,
        "y": 640,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 2520,
        "y": 1330,
        "radius": 10,
        "secret": true
      }
    ],
    "features": [],
    "interactives": [
      {
        "id": "dhcp-start",
        "type": "switch",
        "x": 1570,
        "y": 960,
        "width": 38,
        "height": 40,
        "flag": "dhcp-on",
        "requires": {
          "component": "c01"
        },
        "once": true,
        "label": "DHCP",
        "message": "DHCP ATIVO // CONCESSÕES LIBERADAS"
      },
      {
        "id": "address-reservation",
        "type": "switch",
        "x": 690,
        "y": 610,
        "width": 38,
        "height": 40,
        "flag": "reservation",
        "requires": {
          "component": "c02"
        },
        "once": true,
        "label": "FIXO",
        "message": "RESERVA ATIVA // CONFLITOS RESOLVIDOS"
      }
    ]
  },
  "objectives": {
    "repairAllComponents": true,
    "defeatAllViruses": true,
    "requireExitQuestion": true,
    "goals": [
      {
        "id": "ip-services",
        "type": "condition",
        "condition": {
          "all": [
            {
              "flag": "dhcp-on"
            },
            {
              "flag": "reservation"
            }
          ]
        }
      }
    ],
    "componentsToRepair": 3,
    "enemiesToDefeat": 4
  },
  "mechanics": [
    {
      "id": "subnet-gateways",
      "type": "portals",
      "links": [
        {
          "id": "dhcp-diagnostic",
          "x": 1150,
          "y": 924,
          "width": 44,
          "height": 76,
          "to": {
            "x": 380,
            "y": 1332
          },
          "label": "169.254 / DIAG"
        },
        {
          "id": "diagnostic-dhcp",
          "x": 690,
          "y": 1304,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1220,
            "y": 952
          },
          "label": "DHCP / VOLTAR"
        },
        {
          "id": "dhcp-scope-a",
          "x": 1660,
          "y": 924,
          "width": 44,
          "height": 76,
          "to": {
            "x": 240,
            "y": 602
          },
          "label": "10.0.10/24",
          "requires": {
            "all": [
              {
                "component": "c01"
              },
              {
                "flag": "dhcp-on"
              }
            ]
          }
        },
        {
          "id": "scope-a-dhcp",
          "x": 220,
          "y": 574,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1260,
            "y": 952
          },
          "label": "10.0.0/24"
        },
        {
          "id": "dhcp-relay",
          "x": 1300,
          "y": 924,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2060,
            "y": 1402
          },
          "label": "10.0.20/24",
          "requires": {
            "flag": "dhcp-on"
          }
        },
        {
          "id": "relay-dhcp",
          "x": 1990,
          "y": 1374,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1480,
            "y": 952
          },
          "label": "DHCP / CORE"
        },
        {
          "id": "relay-gateway",
          "x": 2570,
          "y": 1374,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2150,
            "y": 712
          },
          "label": "10.0.30/24",
          "requires": {
            "component": "c03"
          }
        },
        {
          "id": "gateway-relay",
          "x": 2580,
          "y": 684,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2350,
            "y": 1402
          },
          "label": "RELAY / VOLTAR"
        }
      ]
    }
  ],
  "assets": [],
  "layers": [
    {
      "id": "new-infrastructure",
      "type": "infrastructure-world",
      "theme": "dhcp",
      "items": [
        {
          "kind": "address-sector",
          "x": 1120,
          "y": 690,
          "width": 600,
          "height": 310,
          "label": "DHCP / 10.0.0.0/24"
        },
        {
          "kind": "address-sector",
          "x": 140,
          "y": 340,
          "width": 680,
          "height": 310,
          "label": "10.0.10.0/24 / RESERVAS"
        },
        {
          "kind": "address-sector",
          "x": 140,
          "y": 1070,
          "width": 680,
          "height": 310,
          "label": "169.254.0.0/16 / DIAGNÓSTICO"
        },
        {
          "kind": "address-sector",
          "x": 2040,
          "y": 450,
          "width": 630,
          "height": 310,
          "label": "10.0.30.0/24 / GATEWAY"
        },
        {
          "kind": "address-sector",
          "x": 1940,
          "y": 1140,
          "width": 710,
          "height": 310,
          "label": "10.0.20.0/24 / RELAY"
        },
        {
          "kind": "conflict",
          "x": 500,
          "y": 505,
          "width": 180,
          "height": 35,
          "label": "IP DUPLICADO: .42"
        }
      ],
      "pass": "midground"
    }
  ]
}));
