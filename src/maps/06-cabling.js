// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-06",
  "name": "Cabeamento e infraestrutura",
  "theme": "cabling",
  "objective": "Escale os dutos do prédio: restaure os três quadros de conexão para liberar travessias e elevadores.",
  "palette": [
    "#171b20",
    "#283842",
    "#f3c57f",
    "#6b7167",
    "#b9885c"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 1600,
    "height": 3000,
    "layout": "vertical",
    "start": {
      "x": 200,
      "y": 2752
    },
    "exit": {
      "mode": "region",
      "x": 1280,
      "y": 336,
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
          "id": "building-basement",
          "x": 100,
          "y": 2800,
          "width": 1400,
          "height": 80
        },
        {
          "id": "left-floor-1",
          "x": 100,
          "y": 2200,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "right-floor-1",
          "x": 980,
          "y": 2200,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "left-floor-2",
          "x": 100,
          "y": 1600,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "right-floor-2",
          "x": 980,
          "y": 1600,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "left-floor-3",
          "x": 100,
          "y": 1000,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "right-floor-3",
          "x": 980,
          "y": 1000,
          "width": 520,
          "height": 18,
          "collision": "one-way"
        },
        {
          "id": "building-roof",
          "x": 100,
          "y": 400,
          "width": 1400,
          "height": 18,
          "collision": "one-way"
        }
      ]
    },
    "checkpoints": [
      {
        "x": 260,
        "y": 2200
      },
      {
        "x": 1190,
        "y": 1600
      },
      {
        "x": 260,
        "y": 1000
      },
      {
        "x": 1200,
        "y": 400
      }
    ],
    "checkpointMode": "proximity",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "shaft oeste",
      "shaft leste",
      "poço de elevadores",
      "passagens de manutenção"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "basement-duct-1",
        "x": 260,
        "y": 2700,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "basement-duct-2",
        "x": 450,
        "y": 2600,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "basement-duct-3",
        "x": 270,
        "y": 2500,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "basement-duct-4",
        "x": 450,
        "y": 2400,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "basement-duct-5",
        "x": 270,
        "y": 2300,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "east-duct-1",
        "x": 1050,
        "y": 2100,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "east-duct-2",
        "x": 1240,
        "y": 2000,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "east-duct-3",
        "x": 1060,
        "y": 1900,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "east-duct-4",
        "x": 1240,
        "y": 1800,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "east-duct-5",
        "x": 1060,
        "y": 1700,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "west-duct-1",
        "x": 440,
        "y": 1500,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "west-duct-2",
        "x": 250,
        "y": 1400,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "west-duct-3",
        "x": 430,
        "y": 1300,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "west-duct-4",
        "x": 250,
        "y": 1200,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "west-duct-5",
        "x": 430,
        "y": 1100,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-duct-1",
        "x": 1080,
        "y": 900,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-duct-2",
        "x": 1260,
        "y": 800,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-duct-3",
        "x": 1080,
        "y": 700,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-duct-4",
        "x": 1260,
        "y": 600,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-duct-5",
        "x": 1080,
        "y": 500,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "reconnected-tray-a",
        "x": 620,
        "y": 2200,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "reconnected-tray-b",
        "x": 620,
        "y": 1600,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c02"
      },
      {
        "id": "reconnected-tray-c",
        "x": 620,
        "y": 1000,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c03"
      },
      {
        "id": "lift-dock-a",
        "x": 560,
        "y": 2500,
        "width": 140,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "lift-dock-b",
        "x": 920,
        "y": 1900,
        "width": 100,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c02"
      },
      {
        "id": "lift-dock-c",
        "x": 920,
        "y": 700,
        "width": 100,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c03"
      },
      {
        "id": "elevator-a",
        "x": 720,
        "y": 2500,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01",
        "motion": {
          "axis": "y",
          "range": 210,
          "speed": 0.45
        }
      },
      {
        "id": "elevator-b",
        "x": 720,
        "y": 1900,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c02",
        "motion": {
          "axis": "y",
          "range": 200,
          "speed": 0.45
        }
      },
      {
        "id": "elevator-c",
        "x": 720,
        "y": 700,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c03",
        "motion": {
          "axis": "y",
          "range": 200,
          "speed": 0.45
        }
      },
      {
        "id": "basement-cache",
        "x": 1310,
        "y": 2710,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "floor1-cache",
        "x": 120,
        "y": 2110,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "floor2-cache",
        "x": 1340,
        "y": 1510,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "roof-cache",
        "x": 180,
        "y": 310,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "reconnected-tray-a-return",
        "x": 836,
        "y": 2200,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "reconnected-tray-b-return",
        "x": 836,
        "y": 1600,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c02"
      },
      {
        "id": "reconnected-tray-c-return",
        "x": 836,
        "y": 1000,
        "width": 144,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c03"
      }
    ],
    "obstacles": [
      {
        "id": "building-west-wall",
        "x": 50,
        "y": 80,
        "width": 24,
        "height": 2800,
        "collision": "solid",
        "type": "rack-wall"
      },
      {
        "id": "building-east-wall",
        "x": 1520,
        "y": 80,
        "width": 24,
        "height": 2800,
        "collision": "solid",
        "type": "rack-wall"
      },
      {
        "id": "live-cable-a",
        "x": 500,
        "y": 2130,
        "width": 28,
        "height": 70,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c01"
      },
      {
        "id": "live-cable-b",
        "x": 1400,
        "y": 1520,
        "width": 28,
        "height": 80,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c02"
      },
      {
        "id": "live-cable-c",
        "x": 490,
        "y": 930,
        "width": 28,
        "height": 70,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03"
      }
    ],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 300,
        "y": 2156,
        "width": 34,
        "height": 44,
        "label": "QUADRO DO SHAFT A"
      },
      {
        "id": "c02",
        "x": 1160,
        "y": 1556,
        "width": 34,
        "height": 44,
        "label": "PATCH PANEL B"
      },
      {
        "id": "c03",
        "x": 330,
        "y": 956,
        "width": 34,
        "height": 44,
        "label": "DISTRIBUIDOR DO TOPO"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "basic",
        "x": 800,
        "y": 2776,
        "groundY": 2800,
        "navigationBounds": {
          "left": 400,
          "right": 1100
        },
        "patrolMin": 400,
        "patrolMax": 1100,
        "activationRegion": {
          "x": 100,
          "y": 2550,
          "width": 1400,
          "height": 300
        }
      },
      {
        "id": "e02",
        "type": "fast",
        "x": 540,
        "y": 2176,
        "groundY": 2200,
        "navigationBounds": {
          "left": 210,
          "right": 590
        },
        "patrolMin": 210,
        "patrolMax": 590,
        "activationRegion": {
          "x": 100,
          "y": 1940,
          "width": 520,
          "height": 300
        }
      },
      {
        "id": "e03",
        "type": "parasite",
        "x": 1320,
        "y": 1576,
        "groundY": 1600,
        "navigationBounds": {
          "left": 1040,
          "right": 1460
        },
        "patrolMin": 1040,
        "patrolMax": 1460,
        "activationRegion": {
          "x": 980,
          "y": 1350,
          "width": 520,
          "height": 300
        }
      },
      {
        "id": "e04",
        "type": "shooter",
        "x": 550,
        "y": 976,
        "groundY": 1000,
        "navigationBounds": {
          "left": 180,
          "right": 580
        },
        "patrolMin": 180,
        "patrolMax": 580,
        "activationRegion": {
          "x": 100,
          "y": 740,
          "width": 520,
          "height": 300
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 1380,
        "y": 2680,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 180,
        "y": 2080,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 1400,
        "y": 1480,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 230,
        "y": 280,
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
    "enemiesToDefeat": 4
  },
  "mechanics": [],
  "assets": [],
  "layers": [
    {
      "id": "new-infrastructure",
      "type": "infrastructure-world",
      "theme": "cabling",
      "items": [
        {
          "kind": "building",
          "x": 80,
          "y": 180,
          "width": 1440,
          "height": 2670,
          "label": "PRÉDIO TECNOLÓGICO / SHAFTS A–B"
        },
        {
          "kind": "duct",
          "x": 100,
          "y": 450,
          "width": 520,
          "height": 2280,
          "label": "ELETROCALHA OESTE"
        },
        {
          "kind": "duct",
          "x": 980,
          "y": 450,
          "width": 520,
          "height": 2280,
          "label": "ELETROCALHA LESTE"
        },
        {
          "kind": "lift-shaft",
          "x": 690,
          "y": 410,
          "width": 220,
          "height": 2380,
          "label": "ELEVADORES"
        },
        {
          "kind": "rack",
          "x": 130,
          "y": 2200,
          "width": 220,
          "height": 100,
          "label": "RACK A"
        },
        {
          "kind": "rack",
          "x": 1160,
          "y": 1600,
          "width": 250,
          "height": 100,
          "label": "RACK B"
        },
        {
          "kind": "rack",
          "x": 160,
          "y": 1000,
          "width": 220,
          "height": 100,
          "label": "PATCH / CORE"
        }
      ],
      "pass": "midground"
    }
  ]
}));
