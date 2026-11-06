// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-04",
  "name": "Roteador",
  "theme": "router",
  "objective": "Explore túneis e interfaces: corrija as tabelas LAN, de trânsito e WAN para abrir novas rotas.",
  "palette": [
    "#0b1426",
    "#233954",
    "#80c6ff",
    "#426e97",
    "#ffbe80"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 2200,
    "height": 1500,
    "layout": "maze",
    "start": {
      "x": 150,
      "y": 1272
    },
    "exit": {
      "mode": "region",
      "x": 1950,
      "y": 436,
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
          "id": "lan-tunnel",
          "x": 80,
          "y": 1320,
          "width": 2020,
          "height": 50
        },
        {
          "id": "routing-west",
          "x": 300,
          "y": 950,
          "width": 800,
          "height": 28
        },
        {
          "id": "routing-east",
          "x": 1560,
          "y": 950,
          "width": 500,
          "height": 28
        },
        {
          "id": "wan-tunnel",
          "x": 740,
          "y": 500,
          "width": 1320,
          "height": 28
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1740,
        "y": 1320
      },
      {
        "x": 600,
        "y": 950
      },
      {
        "x": 1830,
        "y": 500
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "túnel LAN inferior",
      "trânsito com bifurcação",
      "WAN superior",
      "interfaces de retorno"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "lan-detour-a",
        "x": 740,
        "y": 1230,
        "width": 140,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "lan-detour-b",
        "x": 850,
        "y": 1150,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "left-shaft-a",
        "x": 220,
        "y": 1230,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "left-shaft-b",
        "x": 380,
        "y": 1140,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "left-shaft-c",
        "x": 220,
        "y": 1050,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "transit-detour-a",
        "x": 1100,
        "y": 860,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "transit-detour-b",
        "x": 1280,
        "y": 780,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "transit-detour-c",
        "x": 1440,
        "y": 860,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "restored-transit",
        "x": 1100,
        "y": 950,
        "width": 460,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route",
        "requiresComponentId": "c02"
      },
      {
        "id": "right-shaft-a",
        "x": 1900,
        "y": 860,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "right-shaft-b",
        "x": 1780,
        "y": 770,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "right-shaft-c",
        "x": 1930,
        "y": 680,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "right-shaft-d",
        "x": 1780,
        "y": 590,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "wan-detour-a",
        "x": 1340,
        "y": 410,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "wan-detour-b",
        "x": 1210,
        "y": 330,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "wan-cache-a",
        "x": 760,
        "y": 410,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "wan-cache-b",
        "x": 640,
        "y": 330,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      }
    ],
    "obstacles": [
      {
        "id": "lan-route-failure",
        "x": 920,
        "y": 1140,
        "width": 44,
        "height": 180,
        "type": "route-wall",
        "collision": "solid",
        "requiresComponentId": "c01"
      },
      {
        "id": "wan-route-failure",
        "x": 1200,
        "y": 320,
        "width": 40,
        "height": 180,
        "type": "route-wall",
        "collision": "solid",
        "requiresComponentId": "c03"
      }
    ],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 1800,
        "y": 1276,
        "width": 34,
        "height": 44,
        "label": "TABELA LAN"
      },
      {
        "id": "c02",
        "x": 620,
        "y": 906,
        "width": 34,
        "height": 44,
        "label": "TABELA DE TRÂNSITO"
      },
      {
        "id": "c03",
        "x": 900,
        "y": 456,
        "width": 34,
        "height": 44,
        "label": "TABELA WAN"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "fast",
        "x": 1510,
        "y": 1296,
        "groundY": 1320,
        "navigationBounds": {
          "left": 1250,
          "right": 1960
        },
        "patrolMin": 1250,
        "patrolMax": 1960,
        "activationRegion": {
          "x": 1000,
          "y": 1100,
          "width": 1100,
          "height": 270
        }
      },
      {
        "id": "e02",
        "type": "flyer",
        "x": 1680,
        "y": 848,
        "groundY": 940,
        "navigationBounds": {
          "left": 1500,
          "right": 2040
        },
        "patrolMin": 1500,
        "patrolMax": 2040,
        "activationRegion": {
          "x": 1050,
          "y": 670,
          "width": 1080,
          "height": 350
        }
      },
      {
        "id": "e03",
        "type": "armored",
        "x": 1600,
        "y": 476,
        "groundY": 500,
        "navigationBounds": {
          "left": 1460,
          "right": 1900
        },
        "patrolMin": 1460,
        "patrolMax": 1900,
        "activationRegion": {
          "x": 740,
          "y": 280,
          "width": 1340,
          "height": 300
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 700,
        "y": 300,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 1350,
        "y": 750,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 430,
        "y": 1110,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 1980,
        "y": 1290,
        "radius": 10,
        "secret": true
      }
    ],
    "features": [],
    "interactives": []
  },
  "objectives": {
    "repairAllComponents": true,
    "defeatAllViruses": true,
    "requireExitQuestion": true,
    "goals": [],
    "componentsToRepair": 3,
    "enemiesToDefeat": 3
  },
  "mechanics": [
    {
      "id": "network-interfaces",
      "type": "portals",
      "links": [
        {
          "id": "lan-interface",
          "x": 200,
          "y": 1244,
          "width": 44,
          "height": 76,
          "to": {
            "x": 400,
            "y": 902
          },
          "label": "LAN 0",
          "requires": {
            "component": "c01"
          }
        },
        {
          "id": "lan-return",
          "x": 360,
          "y": 874,
          "width": 44,
          "height": 76,
          "to": {
            "x": 300,
            "y": 1272
          },
          "label": "LAN 1"
        },
        {
          "id": "wan-interface",
          "x": 1960,
          "y": 874,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1830,
            "y": 452
          },
          "label": "WAN 0",
          "requires": {
            "component": "c02"
          }
        },
        {
          "id": "wan-return",
          "x": 2000,
          "y": 424,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1750,
            "y": 902
          },
          "label": "WAN 1"
        },
        {
          "id": "route-backup",
          "x": 2010,
          "y": 1244,
          "width": 44,
          "height": 76,
          "to": {
            "x": 780,
            "y": 452
          },
          "label": "ROTA RESERVA",
          "requires": {
            "all": [
              {
                "component": "c01"
              },
              {
                "component": "c02"
              }
            ]
          }
        }
      ]
    }
  ],
  "assets": [],
  "layers": [
    {
      "id": "authored-scenery",
      "type": "computer-world",
      "theme": "router",
      "items": [
        {
          "kind": "tunnel",
          "x": 80,
          "y": 1030,
          "width": 2020,
          "height": 290,
          "label": "LAN / ROTA INFERIOR →"
        },
        {
          "kind": "tunnel",
          "x": 300,
          "y": 670,
          "width": 800,
          "height": 280,
          "label": "← TABELA DE TRÂNSITO"
        },
        {
          "kind": "tunnel",
          "x": 1560,
          "y": 670,
          "width": 500,
          "height": 280,
          "label": "WAN ↑"
        },
        {
          "kind": "tunnel",
          "x": 740,
          "y": 220,
          "width": 1320,
          "height": 280,
          "label": "WAN / ROTA SUPERIOR"
        },
        {
          "kind": "cache",
          "x": 640,
          "y": 290,
          "width": 160,
          "height": 40,
          "label": "ROTA DE DIAGNÓSTICO"
        }
      ],
      "pass": "midground"
    }
  ]
}));
