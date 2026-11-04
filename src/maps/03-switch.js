// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.
ByteRunner.maps.register({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-03",
  "name": "Switch de rede",
  "theme": "switch",
  "objective": "Restaure o backplane e as conexões; ative as portas 01 e 04 para liberar a transmissão ao uplink.",
  "palette": [
    "#071b24",
    "#12384a",
    "#63e6ed",
    "#327e88",
    "#f5b969"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 2200,
    "height": 1200,
    "layout": "multi-route",
    "start": {
      "x": 1000,
      "y": 992
    },
    "exit": {
      "mode": "region",
      "x": 1050,
      "y": 386,
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
          "id": "backplane-base",
          "x": 860,
          "y": 1040,
          "width": 480,
          "height": 80
        },
        {
          "id": "port-01-floor",
          "x": 150,
          "y": 900,
          "width": 300,
          "height": 100
        },
        {
          "id": "port-02-floor",
          "x": 1600,
          "y": 920,
          "width": 350,
          "height": 100
        },
        {
          "id": "port-03-floor",
          "x": 180,
          "y": 400,
          "width": 300,
          "height": 100
        },
        {
          "id": "port-04-floor",
          "x": 1830,
          "y": 400,
          "width": 300,
          "height": 100
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1010,
        "y": 1040
      },
      {
        "x": 260,
        "y": 900
      },
      {
        "x": 1880,
        "y": 400
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "ramal da porta 01",
      "ramal da porta 02",
      "ramal superior 03",
      "ramal superior 04",
      "backplane vertical"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "port01-cable-a",
        "x": 680,
        "y": 1030,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "port01-cable-b",
        "x": 490,
        "y": 960,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "port02-packet-a",
        "x": 1370,
        "y": 990,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "port02-packet-b",
        "x": 1530,
        "y": 940,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-a",
        "x": 910,
        "y": 950,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-b",
        "x": 1030,
        "y": 860,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-c",
        "x": 1040,
        "y": 770,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-d",
        "x": 950,
        "y": 680,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-e",
        "x": 1040,
        "y": 590,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "spine-f",
        "x": 950,
        "y": 500,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "uplink-floor",
        "x": 840,
        "y": 450,
        "width": 520,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "port03-step-a",
        "x": 740,
        "y": 560,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "port03-step-b",
        "x": 660,
        "y": 480,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "port03-step-c",
        "x": 480,
        "y": 450,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "port04-step-a",
        "x": 1230,
        "y": 570,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "port04-step-b",
        "x": 1410,
        "y": 490,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet"
      },
      {
        "id": "port04-step-c",
        "x": 1600,
        "y": 410,
        "width": 190,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable"
      },
      {
        "id": "restored-left-link",
        "x": 600,
        "y": 810,
        "width": 190,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "left-link-step",
        "x": 760,
        "y": 740,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "cable",
        "requiresComponentId": "c01"
      },
      {
        "id": "restored-right-link",
        "x": 1550,
        "y": 620,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "port04-secret",
        "x": 1730,
        "y": 540,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requires": {
          "flag": "port-b"
        }
      },
      {
        "id": "port01-secret",
        "x": 340,
        "y": 800,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requires": {
          "flag": "port-a"
        }
      },
      {
        "id": "restored-backplane-link",
        "x": 1190,
        "y": 700,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c03"
      }
    ],
    "obstacles": [],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 230,
        "y": 856,
        "width": 34,
        "height": 44,
        "label": "CONECTOR ETHERNET"
      },
      {
        "id": "c02",
        "x": 1880,
        "y": 356,
        "width": 34,
        "height": 44,
        "label": "ENLACE DA PORTA 04"
      },
      {
        "id": "c03",
        "x": 1100,
        "y": 726,
        "width": 34,
        "height": 44,
        "label": "BACKPLANE"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "basic",
        "x": 1210,
        "y": 1016,
        "groundY": 1040,
        "navigationBounds": {
          "left": 920,
          "right": 1290
        },
        "patrolMin": 920,
        "patrolMax": 1290
      },
      {
        "id": "e02",
        "type": "parasite",
        "x": 380,
        "y": 876,
        "groundY": 900,
        "navigationBounds": {
          "left": 190,
          "right": 420
        },
        "patrolMin": 190,
        "patrolMax": 420
      },
      {
        "id": "e03",
        "type": "shooter",
        "x": 2050,
        "y": 376,
        "groundY": 400,
        "navigationBounds": {
          "left": 1900,
          "right": 2090
        },
        "patrolMin": 1900,
        "patrolMax": 2090
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 390,
        "y": 770,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 1750,
        "y": 510,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 290,
        "y": 365,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 1750,
        "y": 885,
        "radius": 10,
        "secret": true
      }
    ],
    "features": [],
    "interactives": [
      {
        "id": "ethernet-port-a",
        "type": "switch",
        "x": 360,
        "y": 860,
        "width": 36,
        "height": 40,
        "flag": "port-a",
        "once": true,
        "label": "01",
        "message": "PORTA 01 ATIVA // PACOTES LIBERADOS"
      },
      {
        "id": "ethernet-port-b",
        "type": "switch",
        "x": 2010,
        "y": 360,
        "width": 36,
        "height": 40,
        "flag": "port-b",
        "once": true,
        "label": "04",
        "message": "PORTA 04 ATIVA // UPLINK RESTAURADO"
      }
    ]
  },
  "objectives": {
    "repairAllComponents": true,
    "defeatAllViruses": true,
    "requireExitQuestion": true,
    "goals": [
      {
        "id": "active-ports",
        "type": "condition",
        "condition": {
          "all": [
            {
              "flag": "port-a"
            },
            {
              "flag": "port-b"
            }
          ]
        }
      }
    ],
    "componentsToRepair": 3,
    "enemiesToDefeat": 3
  },
  "mechanics": [],
  "assets": [],
  "layers": [
    {
      "id": "authored-scenery",
      "type": "computer-world",
      "theme": "switch",
      "items": [
        {
          "kind": "backplane",
          "x": 840,
          "y": 450,
          "width": 520,
          "height": 650,
          "label": "BACKPLANE / UPLINK"
        },
        {
          "kind": "ethernet",
          "x": 150,
          "y": 900,
          "width": 300,
          "height": 110,
          "label": "PORTA 01"
        },
        {
          "kind": "ethernet",
          "x": 1600,
          "y": 920,
          "width": 350,
          "height": 110,
          "label": "PORTA 02"
        },
        {
          "kind": "ethernet",
          "x": 180,
          "y": 400,
          "width": 300,
          "height": 110,
          "label": "PORTA 03"
        },
        {
          "kind": "ethernet",
          "x": 1830,
          "y": 400,
          "width": 300,
          "height": 110,
          "label": "PORTA 04"
        }
      ],
      "pass": "midground"
    },
    {
      "id": "hardware-faces",
      "type": "computer-world",
      "theme": "switch",
      "pass": "foreground",
      "items": [
        {
          "kind": "ethernet",
          "x": 150,
          "y": 900,
          "width": 300,
          "height": 110,
          "label": "PORTA 01"
        },
        {
          "kind": "ethernet",
          "x": 1600,
          "y": 920,
          "width": 350,
          "height": 110,
          "label": "PORTA 02"
        },
        {
          "kind": "ethernet",
          "x": 180,
          "y": 400,
          "width": 300,
          "height": 110,
          "label": "PORTA 03"
        },
        {
          "kind": "ethernet",
          "x": 1830,
          "y": 400,
          "width": 300,
          "height": 110,
          "label": "PORTA 04"
        }
      ]
    }
  ]
});
