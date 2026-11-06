// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-05",
  "name": "Rede Wi-Fi",
  "theme": "wifi",
  "objective": "Suba pelos sinais, repare os três pontos de acesso e elimine a interferência até alcançar a antena de uplink.",
  "palette": [
    "#08162c",
    "#143951",
    "#81ecff",
    "#386c91",
    "#e4bc6f"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 1550,
    "height": 2400,
    "layout": "vertical",
    "start": {
      "x": 160,
      "y": 2192
    },
    "exit": {
      "mode": "region",
      "x": 740,
      "y": 286,
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
          "id": "wifi-start",
          "x": 70,
          "y": 2240,
          "width": 500,
          "height": 80
        },
        {
          "id": "antenna-a",
          "x": 950,
          "y": 1880,
          "width": 300,
          "height": 90
        },
        {
          "id": "repeater",
          "x": 140,
          "y": 1520,
          "width": 290,
          "height": 90
        },
        {
          "id": "antenna-b",
          "x": 1060,
          "y": 1160,
          "width": 310,
          "height": 90
        },
        {
          "id": "uplink-antenna",
          "x": 620,
          "y": 350,
          "width": 300,
          "height": 90
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1040,
        "y": 1880
      },
      {
        "x": 240,
        "y": 1520
      },
      {
        "x": 1160,
        "y": 1160
      },
      {
        "x": 720,
        "y": 620
      }
    ],
    "checkpointMode": "proximity",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "canal principal em zigue-zague",
      "canal limpo após reparo",
      "cache abaixo da entrada",
      "antena lateral secreta"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "signal-01",
        "x": 350,
        "y": 2150,
        "width": 180,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "signal",
        "duration": 2.4,
        "respawnDelay": 2.2
      },
      {
        "id": "signal-02",
        "x": 560,
        "y": 2060,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-03",
        "x": 760,
        "y": 1970,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "signal",
        "motion": {
          "axis": "x",
          "range": 20,
          "speed": 0.65
        }
      },
      {
        "id": "signal-05",
        "x": 780,
        "y": 1790,
        "width": 170,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "signal",
        "duration": 2.4,
        "respawnDelay": 2.2
      },
      {
        "id": "signal-06",
        "x": 580,
        "y": 1700,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-07",
        "x": 380,
        "y": 1610,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "signal",
        "motion": {
          "axis": "y",
          "range": 12,
          "speed": 0.65
        }
      },
      {
        "id": "signal-09",
        "x": 400,
        "y": 1430,
        "width": 180,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "signal",
        "duration": 2.4,
        "respawnDelay": 2.2
      },
      {
        "id": "signal-10",
        "x": 620,
        "y": 1340,
        "width": 190,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-11",
        "x": 840,
        "y": 1250,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-13",
        "x": 880,
        "y": 1070,
        "width": 180,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "signal",
        "duration": 2.4,
        "respawnDelay": 2.2
      },
      {
        "id": "signal-14",
        "x": 680,
        "y": 980,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-15",
        "x": 480,
        "y": 890,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "signal",
        "motion": {
          "axis": "x",
          "range": 20,
          "speed": 0.65
        }
      },
      {
        "id": "signal-16",
        "x": 260,
        "y": 800,
        "width": 210,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-17",
        "x": 430,
        "y": 710,
        "width": 180,
        "height": 18,
        "type": "temporary",
        "collision": "one-way",
        "style": "signal",
        "duration": 2.4,
        "respawnDelay": 2.2
      },
      {
        "id": "signal-18",
        "x": 640,
        "y": 620,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-19",
        "x": 840,
        "y": 530,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "signal-20",
        "x": 980,
        "y": 440,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "entry-cache",
        "x": 650,
        "y": 2280,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "antenna-cache-step",
        "x": 1300,
        "y": 1070,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "antenna-cache-top",
        "x": 1320,
        "y": 980,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal"
      },
      {
        "id": "clean-01",
        "x": 80,
        "y": 1430,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      },
      {
        "id": "clean-02",
        "x": 180,
        "y": 1340,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      },
      {
        "id": "clean-03",
        "x": 60,
        "y": 1250,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      },
      {
        "id": "clean-04",
        "x": 220,
        "y": 1160,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      },
      {
        "id": "clean-05",
        "x": 400,
        "y": 1070,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      },
      {
        "id": "clean-06",
        "x": 530,
        "y": 1020,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "signal",
        "requiresComponentId": "c02"
      }
    ],
    "obstacles": [],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 1070,
        "y": 1836,
        "width": 34,
        "height": 44,
        "label": "PONTO DE ACESSO A"
      },
      {
        "id": "c02",
        "x": 240,
        "y": 1476,
        "width": 34,
        "height": 44,
        "label": "REPETIDOR"
      },
      {
        "id": "c03",
        "x": 1190,
        "y": 1116,
        "width": 34,
        "height": 44,
        "label": "PONTO DE ACESSO B"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "shooter",
        "x": 1180,
        "y": 1856,
        "groundY": 1880,
        "navigationBounds": {
          "left": 1020,
          "right": 1210
        },
        "patrolMin": 1020,
        "patrolMax": 1210,
        "activationRegion": {
          "x": 850,
          "y": 1650,
          "width": 650,
          "height": 350
        }
      },
      {
        "id": "e02",
        "type": "flyer",
        "x": 650,
        "y": 1438,
        "groundY": 1530,
        "navigationBounds": {
          "left": 180,
          "right": 800
        },
        "patrolMin": 180,
        "patrolMax": 800,
        "activationRegion": {
          "x": 100,
          "y": 1300,
          "width": 800,
          "height": 400
        }
      },
      {
        "id": "e03",
        "type": "basic",
        "x": 1280,
        "y": 1136,
        "groundY": 1160,
        "navigationBounds": {
          "left": 1100,
          "right": 1330
        },
        "patrolMin": 1100,
        "patrolMax": 1330,
        "activationRegion": {
          "x": 800,
          "y": 940,
          "width": 700,
          "height": 330
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 720,
        "y": 2250,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 1390,
        "y": 950,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 120,
        "y": 1220,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 320,
        "y": 770,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i05",
        "x": 740,
        "y": 320,
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
      "id": "radio-spectrum",
      "type": "environment",
      "zones": [
        {
          "id": "weak-lower",
          "x": 650,
          "y": 1740,
          "width": 630,
          "height": 390,
          "speedMultiplier": 0.84,
          "fireIntervalMultiplier": 1.45,
          "projectileSpeedMultiplier": 0.8,
          "label": "INTERFERÊNCIA / SINAL 35%",
          "disabledWhen": {
            "component": "c01"
          }
        },
        {
          "id": "weak-middle",
          "x": 400,
          "y": 1190,
          "width": 570,
          "height": 380,
          "speedMultiplier": 0.88,
          "fireIntervalMultiplier": 1.4,
          "projectileSpeedMultiplier": 0.82,
          "label": "CANAL CONGESTIONADO",
          "disabledWhen": {
            "component": "c02"
          }
        },
        {
          "id": "weak-upper",
          "x": 420,
          "y": 880,
          "width": 680,
          "height": 340,
          "speedMultiplier": 0.9,
          "fireIntervalMultiplier": 1.35,
          "projectileSpeedMultiplier": 0.85,
          "label": "SINAL FRACO",
          "disabledWhen": {
            "component": "c03"
          }
        },
        {
          "id": "clean-channel",
          "x": 40,
          "y": 1000,
          "width": 350,
          "height": 530,
          "speedMultiplier": 1.05,
          "label": "CANAL LIMPO / SINAL 100%",
          "requires": {
            "component": "c02"
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
      "theme": "wifi",
      "items": [
        {
          "kind": "antenna",
          "x": 70,
          "y": 2240,
          "width": 500,
          "height": 100,
          "label": "ASSOCIAÇÃO / ENTRADA"
        },
        {
          "kind": "antenna",
          "x": 950,
          "y": 1880,
          "width": 300,
          "height": 100,
          "label": "AP A"
        },
        {
          "kind": "antenna",
          "x": 140,
          "y": 1520,
          "width": 290,
          "height": 100,
          "label": "REPETIDOR"
        },
        {
          "kind": "antenna",
          "x": 1060,
          "y": 1160,
          "width": 310,
          "height": 100,
          "label": "AP B"
        },
        {
          "kind": "antenna",
          "x": 620,
          "y": 350,
          "width": 300,
          "height": 130,
          "label": "UPLINK / INTERNET"
        },
        {
          "kind": "cache",
          "x": 1320,
          "y": 940,
          "width": 160,
          "height": 40,
          "label": "ANTENA AUXILIAR"
        }
      ],
      "pass": "midground"
    },
    {
      "id": "hardware-faces",
      "type": "computer-world",
      "theme": "wifi",
      "pass": "foreground",
      "items": [
        {
          "kind": "antenna",
          "x": 70,
          "y": 2240,
          "width": 500,
          "height": 100,
          "label": "ASSOCIAÇÃO / ENTRADA"
        },
        {
          "kind": "antenna",
          "x": 950,
          "y": 1880,
          "width": 300,
          "height": 100,
          "label": "AP A"
        },
        {
          "kind": "antenna",
          "x": 140,
          "y": 1520,
          "width": 290,
          "height": 100,
          "label": "REPETIDOR"
        },
        {
          "kind": "antenna",
          "x": 1060,
          "y": 1160,
          "width": 310,
          "height": 100,
          "label": "AP B"
        },
        {
          "kind": "antenna",
          "x": 620,
          "y": 350,
          "width": 300,
          "height": 130,
          "label": "UPLINK / INTERNET"
        }
      ]
    }
  ]
}));
