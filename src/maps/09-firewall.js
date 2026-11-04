// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.
ByteRunner.maps.register({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-09",
  "name": "Firewall e segurança",
  "theme": "firewall",
  "objective": "Infiltre as quatro camadas da fortaleza, restaure regras e ative o terminal de segurança da cidadela.",
  "palette": [
    "#210e18",
    "#472137",
    "#ff937b",
    "#96516b",
    "#edc980"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 3600,
    "height": 1800,
    "layout": "multi-route",
    "start": {
      "x": 120,
      "y": 1512
    },
    "exit": {
      "mode": "region",
      "x": 2460,
      "y": 476,
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
          "id": "outer-west",
          "x": 80,
          "y": 1560,
          "width": 820,
          "height": 60
        },
        {
          "id": "outer-middle",
          "x": 1180,
          "y": 1560,
          "width": 670,
          "height": 60
        },
        {
          "id": "outer-east",
          "x": 2110,
          "y": 1560,
          "width": 1410,
          "height": 60
        },
        {
          "id": "inner-east",
          "x": 2000,
          "y": 1140,
          "width": 1500,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "inner-west",
          "x": 850,
          "y": 1140,
          "width": 1000,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "citadel",
          "x": 1500,
          "y": 540,
          "width": 1200,
          "height": 18,
          "collision": "one-way"
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1450,
        "y": 1560
      },
      {
        "x": 3200,
        "y": 1560
      },
      {
        "x": 2300,
        "y": 1140
      },
      {
        "x": 1050,
        "y": 1140
      },
      {
        "x": 2200,
        "y": 540
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "perímetro e inspeção",
      "bastião leste",
      "anel interno",
      "escadaria da cidadela"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "inspection-step-a",
        "x": 940,
        "y": 1500,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "inspection-step-b",
        "x": 1120,
        "y": 1420,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "route",
        "motion": {
          "axis": "y",
          "range": 10,
          "speed": 0.7
        }
      },
      {
        "id": "bastion-step-a",
        "x": 3150,
        "y": 1470,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "bastion-step-b",
        "x": 3320,
        "y": 1380,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "bastion-step-c",
        "x": 3140,
        "y": 1290,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "bastion-step-d",
        "x": 3310,
        "y": 1200,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-step-b",
        "x": 1190,
        "y": 960,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-step-c",
        "x": 1380,
        "y": 870,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-step-d",
        "x": 1570,
        "y": 780,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-step-e",
        "x": 1760,
        "y": 690,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-step-f",
        "x": 1950,
        "y": 600,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "outer-cache",
        "x": 250,
        "y": 1470,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "inner-cache",
        "x": 2870,
        "y": 1050,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "citadel-cache",
        "x": 2550,
        "y": 450,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route"
      },
      {
        "id": "inspection-breakaway",
        "x": 1940,
        "y": 1470,
        "width": 170,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "route",
        "duration": 1.9,
        "respawnDelay": 2.5
      },
      {
        "id": "rules-bridge",
        "x": 1840,
        "y": 1140,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route",
        "requiresComponentId": "c03"
      },
      {
        "id": "citadel-step-a",
        "x": 1000,
        "y": 1050,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route",
        "requiresComponentId": "c04"
      }
    ],
    "obstacles": [
      {
        "id": "perimeter-laser",
        "x": 520,
        "y": 1480,
        "width": 28,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c01",
        "window": {
          "period": 3.8,
          "active": 1.2,
          "phase": 0
        }
      },
      {
        "id": "inspection-laser",
        "x": 1300,
        "y": 1480,
        "width": 28,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c02",
        "window": {
          "period": 3.8,
          "active": 1.3,
          "phase": 1
        }
      },
      {
        "id": "inner-laser",
        "x": 2600,
        "y": 1060,
        "width": 30,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03",
        "window": {
          "period": 3.2,
          "active": 1.25,
          "phase": 0.5
        }
      },
      {
        "id": "citadel-cover",
        "x": 2310,
        "y": 474,
        "width": 44,
        "height": 66,
        "type": "heatsink",
        "collision": "solid"
      }
    ],
    "gates": [
      {
        "id": "security-layer-1",
        "x": 620,
        "y": 1160,
        "width": 28,
        "height": 400,
        "requiresComponentId": "c01"
      },
      {
        "id": "security-layer-2",
        "x": 1830,
        "y": 1180,
        "width": 28,
        "height": 380,
        "requiresComponentId": "c02"
      },
      {
        "id": "security-layer-3",
        "x": 1950,
        "y": 900,
        "width": 28,
        "height": 240,
        "requiresComponentId": "c03"
      },
      {
        "id": "security-core-lock",
        "x": 2380,
        "y": 390,
        "width": 26,
        "height": 150,
        "opensWhen": {
          "flag": "rules-on"
        }
      }
    ],
    "components": [
      {
        "id": "c01",
        "x": 400,
        "y": 1516,
        "width": 34,
        "height": 44,
        "label": "REGRAS DO PERÍMETRO"
      },
      {
        "id": "c02",
        "x": 1450,
        "y": 1516,
        "width": 34,
        "height": 44,
        "label": "POLÍTICA DE INSPEÇÃO"
      },
      {
        "id": "c03",
        "x": 2350,
        "y": 1096,
        "width": 34,
        "height": 44,
        "label": "REGRAS DO ANEL INTERNO"
      },
      {
        "id": "c04",
        "x": 1050,
        "y": 1096,
        "width": 34,
        "height": 44,
        "label": "ACESSO À CIDADELA"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "fast",
        "x": 1620,
        "y": 1536,
        "groundY": 1560,
        "navigationBounds": {
          "left": 1230,
          "right": 1760
        },
        "patrolMin": 1230,
        "patrolMax": 1760,
        "activationRegion": {
          "x": 1180,
          "y": 1290,
          "width": 670,
          "height": 330
        }
      },
      {
        "id": "e02",
        "type": "shooter",
        "x": 2850,
        "y": 1536,
        "groundY": 1560,
        "navigationBounds": {
          "left": 2400,
          "right": 3370
        },
        "patrolMin": 2400,
        "patrolMax": 3370,
        "activationRegion": {
          "x": 2110,
          "y": 1290,
          "width": 1410,
          "height": 330
        }
      },
      {
        "id": "e03",
        "type": "armored",
        "x": 3050,
        "y": 1116,
        "groundY": 1140,
        "navigationBounds": {
          "left": 2750,
          "right": 3380
        },
        "patrolMin": 2750,
        "patrolMax": 3380,
        "activationRegion": {
          "x": 2000,
          "y": 870,
          "width": 1500,
          "height": 330
        }
      },
      {
        "id": "e04",
        "type": "flyer",
        "x": 1360,
        "y": 1048,
        "groundY": 1140,
        "navigationBounds": {
          "left": 980,
          "right": 1790
        },
        "patrolMin": 980,
        "patrolMax": 1790,
        "activationRegion": {
          "x": 850,
          "y": 840,
          "width": 1000,
          "height": 360
        }
      },
      {
        "id": "e05",
        "type": "armored",
        "x": 2540,
        "y": 516,
        "groundY": 540,
        "navigationBounds": {
          "left": 2440,
          "right": 2640
        },
        "patrolMin": 2440,
        "patrolMax": 2640,
        "activationRegion": {
          "x": 1500,
          "y": 270,
          "width": 1200,
          "height": 330
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 300,
        "y": 1440,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 2940,
        "y": 1020,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 2610,
        "y": 420,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 3440,
        "y": 1530,
        "radius": 10,
        "secret": true
      }
    ],
    "features": [],
    "interactives": [
      {
        "id": "citadel-console",
        "type": "switch",
        "x": 2190,
        "y": 500,
        "width": 40,
        "height": 40,
        "requires": {
          "component": "c04"
        },
        "flag": "rules-on",
        "once": true,
        "label": "ACL",
        "message": "REGRAS RESTAURADAS // CIDADELA LIBERADA"
      }
    ]
  },
  "objectives": {
    "repairAllComponents": true,
    "defeatAllViruses": true,
    "requireExitQuestion": true,
    "goals": [
      {
        "id": "security-policy",
        "type": "condition",
        "condition": {
          "flag": "rules-on"
        }
      }
    ],
    "componentsToRepair": 4,
    "enemiesToDefeat": 5
  },
  "mechanics": [
    {
      "id": "surveillance",
      "type": "security-grid",
      "cameras": [
        {
          "id": "inspection-cam",
          "x": 1110,
          "y": 1300,
          "period": 3.8,
          "windup": 1.0,
          "region": {
            "x": 940,
            "y": 1330,
            "width": 560,
            "height": 240
          },
          "disabledWhen": {
            "component": "c02"
          }
        },
        {
          "id": "inner-cam",
          "x": 2780,
          "y": 900,
          "period": 3.2,
          "windup": 0.9,
          "region": {
            "x": 2510,
            "y": 910,
            "width": 700,
            "height": 240
          },
          "disabledWhen": {
            "component": "c03"
          }
        }
      ]
    }
  ],
  "assets": [],
  "layers": [
    {
      "id": "new-infrastructure",
      "type": "infrastructure-world",
      "theme": "firewall",
      "items": [
        {
          "kind": "fortress",
          "x": 580,
          "y": 270,
          "width": 2480,
          "height": 1320,
          "label": "FORTALEZA / DEFESA EM PROFUNDIDADE"
        },
        {
          "kind": "bastion",
          "x": 620,
          "y": 1160,
          "width": 280,
          "height": 400,
          "label": "CAMADA 1"
        },
        {
          "kind": "bastion",
          "x": 1830,
          "y": 1180,
          "width": 280,
          "height": 380,
          "label": "CAMADA 2"
        },
        {
          "kind": "security-hall",
          "x": 2000,
          "y": 870,
          "width": 1500,
          "height": 270,
          "label": "BASTIÃO LESTE / INSPEÇÃO"
        },
        {
          "kind": "security-hall",
          "x": 850,
          "y": 870,
          "width": 1000,
          "height": 270,
          "label": "ANEL INTERNO / INFILTRAÇÃO"
        },
        {
          "kind": "citadel",
          "x": 1500,
          "y": 270,
          "width": 1200,
          "height": 270,
          "label": "CIDADELA / ACL"
        }
      ],
      "pass": "midground"
    }
  ]
});
