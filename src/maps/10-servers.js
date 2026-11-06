// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-10",
  "name": "Servidores e Internet",
  "theme": "servers",
  "objective": "Restaure quatro relays nas torres e no backbone; abra o núcleo elevado e derrote VIRUS ZERO.",
  "palette": [
    "#071322",
    "#14334c",
    "#8ceaff",
    "#44758d",
    "#fa719a"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 6800,
    "height": 2000,
    "layout": "multi-route",
    "start": {
      "x": 200,
      "y": 1592
    },
    "exit": {
      "mode": "region",
      "x": 6480,
      "y": 836,
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
          "id": "dc-entry",
          "x": 80,
          "y": 1640,
          "width": 1000,
          "height": 60
        },
        {
          "id": "dc-backbone",
          "x": 1280,
          "y": 1640,
          "width": 1170,
          "height": 60
        },
        {
          "id": "tower-a-roof",
          "x": 420,
          "y": 1190,
          "width": 600,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "tower-b-roof",
          "x": 1660,
          "y": 1050,
          "width": 600,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "battle-west",
          "x": 2580,
          "y": 1640,
          "width": 570,
          "height": 60
        },
        {
          "id": "battle-east",
          "x": 3450,
          "y": 1540,
          "width": 700,
          "height": 60
        },
        {
          "id": "core-airlock",
          "x": 4350,
          "y": 1170,
          "width": 470,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "virus-zero-arena",
          "x": 4800,
          "y": 900,
          "width": 1800,
          "height": 60
        }
      ]
    },
    "checkpoints": [
      {
        "x": 640,
        "y": 1190
      },
      {
        "x": 1850,
        "y": 1050
      },
      {
        "x": 2910,
        "y": 1640
      },
      {
        "x": 4450,
        "y": 1170
      },
      {
        "x": 5000,
        "y": 900
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "data center inferior",
      "torres e fibra superior",
      "backbone sob ataque",
      "airlock",
      "arena exclusiva"
    ],
    "sections": [
      {
        "x": 0,
        "label": "01 // TORRES DO DATA CENTER"
      },
      {
        "x": 2500,
        "label": "02 // BACKBONE SOB ATAQUE"
      },
      {
        "x": 4800,
        "label": "03 // ARENA DE VIRUS ZERO"
      }
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "tower-a-step1",
        "x": 400,
        "y": 1550,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-a-step2",
        "x": 600,
        "y": 1460,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-a-step3",
        "x": 420,
        "y": 1370,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-a-step4",
        "x": 620,
        "y": 1280,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "backbone-fallback",
        "x": 1110,
        "y": 1570,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-step1",
        "x": 1470,
        "y": 1540,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-step2",
        "x": 1660,
        "y": 1440,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-step3",
        "x": 1470,
        "y": 1340,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-step4",
        "x": 1660,
        "y": 1240,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-step5",
        "x": 1470,
        "y": 1140,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "dc-to-battle-a",
        "x": 2320,
        "y": 1140,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "dc-to-battle-b",
        "x": 2500,
        "y": 1230,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "dc-to-battle-c",
        "x": 2680,
        "y": 1320,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "combat-bridge-a",
        "x": 3200,
        "y": 1550,
        "width": 160,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "cable",
        "duration": 2.0,
        "respawnDelay": 2.6
      },
      {
        "id": "combat-bridge-b",
        "x": 3380,
        "y": 1460,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "cable",
        "motion": {
          "axis": "x",
          "range": 18,
          "speed": 0.65
        }
      },
      {
        "id": "airlock-step1",
        "x": 4000,
        "y": 1440,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "airlock-step2",
        "x": 4170,
        "y": 1350,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "airlock-step3",
        "x": 4350,
        "y": 1260,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "arena-approach-a",
        "x": 4700,
        "y": 1080,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "arena-approach-b",
        "x": 4580,
        "y": 990,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "core-left-low",
        "x": 5000,
        "y": 800,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-left-high",
        "x": 5200,
        "y": 700,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-middle-low",
        "x": 5410,
        "y": 800,
        "width": 190,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-middle-step",
        "x": 5540,
        "y": 720,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-aerial-lift",
        "x": 5620,
        "y": 640,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "signal",
        "motion": {
          "axis": "y",
          "range": 16,
          "speed": 0.7
        }
      },
      {
        "id": "core-right-high",
        "x": 5830,
        "y": 730,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-right-low",
        "x": 6050,
        "y": 820,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-right-step",
        "x": 6210,
        "y": 760,
        "width": 130,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "core-right-top",
        "x": 6240,
        "y": 700,
        "width": 190,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "entry-secret",
        "x": 150,
        "y": 1550,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-a-secret",
        "x": 420,
        "y": 1100,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "tower-b-secret",
        "x": 2130,
        "y": 960,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "combat-secret-a",
        "x": 2840,
        "y": 1550,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "combat-secret-b",
        "x": 3000,
        "y": 1460,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "combat-secret-top",
        "x": 2840,
        "y": 1370,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "airlock-secret",
        "x": 4460,
        "y": 1080,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "fiber-link-a",
        "x": 1080,
        "y": 1190,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "fiber-link-b",
        "x": 1260,
        "y": 1120,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "fiber-link-c",
        "x": 1450,
        "y": 1050,
        "width": 220,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "upper-backbone-a",
        "x": 2280,
        "y": 1050,
        "width": 250,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "upper-backbone-b",
        "x": 2540,
        "y": 1050,
        "width": 250,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "upper-backbone-c",
        "x": 2800,
        "y": 1140,
        "width": 200,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "restored-combat-bridge",
        "x": 3150,
        "y": 1640,
        "width": 300,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "route",
        "requiresComponentId": "c03"
      },
      {
        "id": "airlock-elevator",
        "x": 4120,
        "y": 1360,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c03",
        "motion": {
          "axis": "y",
          "range": 140,
          "speed": 0.5
        }
      }
    ],
    "obstacles": [
      {
        "id": "backbone-pulse",
        "x": 3100,
        "y": 1560,
        "width": 28,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03",
        "window": {
          "period": 3.6,
          "active": 1.2,
          "phase": 0
        }
      },
      {
        "id": "airlock-pulse",
        "x": 4010,
        "y": 1460,
        "width": 28,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03",
        "window": {
          "period": 3.4,
          "active": 1.25,
          "phase": 0.8
        }
      },
      {
        "id": "arena-cover-left",
        "x": 5160,
        "y": 826,
        "width": 52,
        "height": 74,
        "type": "heatsink",
        "collision": "solid"
      },
      {
        "id": "arena-cover-right",
        "x": 6110,
        "y": 814,
        "width": 60,
        "height": 86,
        "type": "heatsink",
        "collision": "solid"
      }
    ],
    "gates": [
      {
        "id": "core-access-lock",
        "x": 4770,
        "y": 750,
        "width": 28,
        "height": 420,
        "opensWhen": {
          "all": [
            {
              "component": "c01"
            },
            {
              "component": "c02"
            },
            {
              "component": "c03"
            },
            {
              "component": "c04"
            }
          ]
        }
      }
    ],
    "components": [
      {
        "id": "c01",
        "x": 650,
        "y": 1146,
        "width": 34,
        "height": 44,
        "label": "RELAY DA TORRE A"
      },
      {
        "id": "c02",
        "x": 1900,
        "y": 1006,
        "width": 34,
        "height": 44,
        "label": "RELAY DA TORRE B"
      },
      {
        "id": "c03",
        "x": 3730,
        "y": 1496,
        "width": 34,
        "height": 44,
        "label": "ENERGIA DO BACKBONE"
      },
      {
        "id": "c04",
        "x": 4570,
        "y": 1126,
        "width": 34,
        "height": 44,
        "label": "ESCUDO DO NÚCLEO"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "basic",
        "x": 800,
        "y": 1616,
        "groundY": 1640,
        "navigationBounds": {
          "left": 400,
          "right": 1000
        },
        "patrolMin": 400,
        "patrolMax": 1000,
        "activationRegion": {
          "x": 80,
          "y": 1360,
          "width": 1000,
          "height": 340
        }
      },
      {
        "id": "e02",
        "type": "shooter",
        "x": 900,
        "y": 1166,
        "groundY": 1190,
        "navigationBounds": {
          "left": 470,
          "right": 980
        },
        "patrolMin": 470,
        "patrolMax": 980,
        "activationRegion": {
          "x": 420,
          "y": 910,
          "width": 600,
          "height": 340
        }
      },
      {
        "id": "e03",
        "type": "flyer",
        "x": 2100,
        "y": 958,
        "groundY": 1050,
        "navigationBounds": {
          "left": 1740,
          "right": 2200
        },
        "patrolMin": 1740,
        "patrolMax": 2200,
        "activationRegion": {
          "x": 1300,
          "y": 740,
          "width": 1000,
          "height": 370
        }
      },
      {
        "id": "e04",
        "type": "shooter",
        "x": 2980,
        "y": 1616,
        "groundY": 1640,
        "navigationBounds": {
          "left": 2700,
          "right": 3090
        },
        "patrolMin": 2700,
        "patrolMax": 3090,
        "activationRegion": {
          "x": 2580,
          "y": 1360,
          "width": 570,
          "height": 340
        }
      },
      {
        "id": "e05",
        "type": "parasite",
        "x": 3570,
        "y": 1516,
        "groundY": 1540,
        "navigationBounds": {
          "left": 3500,
          "right": 4000
        },
        "patrolMin": 3500,
        "patrolMax": 4000,
        "activationRegion": {
          "x": 3450,
          "y": 1260,
          "width": 700,
          "height": 340
        }
      },
      {
        "id": "e06",
        "type": "fast",
        "x": 3970,
        "y": 1516,
        "groundY": 1540,
        "navigationBounds": {
          "left": 3500,
          "right": 4080
        },
        "patrolMin": 3500,
        "patrolMax": 4080,
        "activationRegion": {
          "x": 3450,
          "y": 1260,
          "width": 700,
          "height": 340
        }
      },
      {
        "id": "e07",
        "type": "armored",
        "x": 4660,
        "y": 1146,
        "groundY": 1170,
        "navigationBounds": {
          "left": 4430,
          "right": 4750
        },
        "patrolMin": 4430,
        "patrolMax": 4750,
        "activationRegion": {
          "x": 4350,
          "y": 890,
          "width": 470,
          "height": 340
        }
      },
      {
        "id": "e08",
        "type": "boss",
        "x": 5680,
        "y": 854,
        "groundY": 900,
        "hp": 90,
        "multiStage": true,
        "coreShieldRequiresRepairs": true,
        "bossBounds": {
          "left": 4880,
          "right": 6500
        },
        "activationRegion": {
          "x": 4800,
          "y": 320,
          "width": 1800,
          "height": 650
        },
        "armor": 0.35,
        "damage": 18,
        "speed": 58,
        "xp": 500
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 220,
        "y": 1520,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 480,
        "y": 1070,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 2190,
        "y": 930,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 2900,
        "y": 1340,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i05",
        "x": 4510,
        "y": 1050,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i06",
        "x": 6400,
        "y": 670,
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
    "componentsToRepair": 4,
    "enemiesToDefeat": 8
  },
  "mechanics": [],
  "assets": [],
  "layers": [
    {
      "id": "new-infrastructure",
      "type": "infrastructure-world",
      "theme": "servers",
      "items": [
        {
          "kind": "datacenter",
          "x": 80,
          "y": 870,
          "width": 2300,
          "height": 830,
          "label": "DATA CENTER / REDUNDÂNCIA A–B"
        },
        {
          "kind": "server-tower",
          "x": 420,
          "y": 1190,
          "width": 600,
          "height": 450,
          "label": "TORRE A"
        },
        {
          "kind": "server-tower",
          "x": 1660,
          "y": 1050,
          "width": 600,
          "height": 590,
          "label": "TORRE B"
        },
        {
          "kind": "battle-hall",
          "x": 2580,
          "y": 1150,
          "width": 1570,
          "height": 550,
          "label": "BACKBONE / COMBATE AVANÇADO"
        },
        {
          "kind": "airlock",
          "x": 4350,
          "y": 850,
          "width": 470,
          "height": 320,
          "label": "SISTEMAS DO NÚCLEO"
        },
        {
          "kind": "boss-arena",
          "x": 4800,
          "y": 380,
          "width": 1800,
          "height": 520,
          "label": "VIRUS ZERO / NÚCLEO DA INTERNET"
        }
      ],
      "pass": "midground"
    }
  ],
  "completion": {
    "type": "boss-question",
    "enemyId": "e08"
  }
}));
