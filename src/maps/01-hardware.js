// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-01",
  "name": "Hardware do computador",
  "theme": "hardware",
  "objective": "Explore a placa-mãe: repare CPU, RAM e GPU para restaurar os barramentos e desligar os curtos.",
  "palette": [
    "#06191b",
    "#143b35",
    "#63f3bb",
    "#286453",
    "#d6ac64"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 2800,
    "height": 1000,
    "layout": "horizontal",
    "start": {
      "x": 70,
      "y": 802
    },
    "exit": {
      "mode": "region",
      "x": 2670,
      "y": 786,
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
          "id": "pcb-left",
          "x": 0,
          "y": 850,
          "width": 720,
          "height": 120
        },
        {
          "id": "pcb-memory",
          "x": 980,
          "y": 850,
          "width": 720,
          "height": 120
        },
        {
          "id": "pcb-gpu",
          "x": 1900,
          "y": 850,
          "width": 900,
          "height": 120
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1050,
        "y": 850
      },
      {
        "x": 1400,
        "y": 510
      },
      {
        "x": 2000,
        "y": 850
      }
    ],
    "checkpointMode": "proximity",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "trilha inferior da placa-mãe",
      "barramento da CPU",
      "torre de memória",
      "passarela da GPU"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "socket-step",
        "x": 250,
        "y": 770,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "cpu-pins",
        "x": 390,
        "y": 710,
        "width": 130,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "cpu-package",
        "x": 460,
        "y": 650,
        "width": 280,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "cpu-secret-cache",
        "x": 300,
        "y": 570,
        "width": 120,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "trace-low-a",
        "x": 720,
        "y": 830,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "trace-low-b",
        "x": 850,
        "y": 750,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "ram-pin-a",
        "x": 1030,
        "y": 670,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "ram-pin-b",
        "x": 1190,
        "y": 590,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "ram-module",
        "x": 1320,
        "y": 510,
        "width": 210,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "ram-secret-rail",
        "x": 1510,
        "y": 430,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "cpu-restored-bus",
        "x": 740,
        "y": 650,
        "width": 240,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit",
        "requiresComponentId": "c01"
      },
      {
        "id": "memory-restored-bus",
        "x": 1530,
        "y": 610,
        "width": 220,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit",
        "requiresComponentId": "c02"
      },
      {
        "id": "gpu-riser-a",
        "x": 1770,
        "y": 760,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "gpu-riser-b",
        "x": 1930,
        "y": 690,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "gpu-board",
        "x": 2070,
        "y": 620,
        "width": 300,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "gpu-cache",
        "x": 2290,
        "y": 530,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit"
      },
      {
        "id": "gpu-restored-link",
        "x": 2380,
        "y": 700,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "circuit",
        "requiresComponentId": "c03"
      }
    ],
    "obstacles": [
      {
        "id": "live-trace",
        "x": 1580,
        "y": 790,
        "width": 60,
        "height": 60,
        "type": "interference",
        "collision": "dangerous",
        "damage": 10,
        "requiresComponentId": "c02"
      },
      {
        "id": "gpu-heatsink",
        "x": 2490,
        "y": 760,
        "width": 64,
        "height": 90,
        "type": "heatsink",
        "collision": "solid"
      }
    ],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 560,
        "y": 606,
        "width": 34,
        "height": 44,
        "label": "SOQUETE DA CPU"
      },
      {
        "id": "c02",
        "x": 1390,
        "y": 466,
        "width": 34,
        "height": 44,
        "label": "BANCO DE RAM"
      },
      {
        "id": "c03",
        "x": 2200,
        "y": 576,
        "width": 34,
        "height": 44,
        "label": "ALIMENTAÇÃO DA GPU"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "basic",
        "x": 480,
        "y": 826,
        "groundY": 850,
        "navigationBounds": {
          "left": 340,
          "right": 650
        },
        "patrolMin": 340,
        "patrolMax": 650
      },
      {
        "id": "e02",
        "type": "fast",
        "x": 1260,
        "y": 566,
        "groundY": 590,
        "navigationBounds": {
          "left": 1210,
          "right": 1320
        },
        "patrolMin": 1210,
        "patrolMax": 1320
      },
      {
        "id": "e03",
        "type": "armored",
        "x": 2310,
        "y": 596,
        "groundY": 620,
        "navigationBounds": {
          "left": 2120,
          "right": 2340
        },
        "patrolMin": 2120,
        "patrolMax": 2340
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 350,
        "y": 540,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 1560,
        "y": 400,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 2350,
        "y": 500,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 1050,
        "y": 810,
        "radius": 10,
        "secret": false
      },
      {
        "id": "i05",
        "x": 2000,
        "y": 660,
        "radius": 10,
        "secret": false
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
      "id": "cpu-cooling",
      "type": "environment",
      "zones": [
        {
          "id": "cooling-fan",
          "x": 760,
          "y": 670,
          "width": 180,
          "height": 190,
          "forceX": 85,
          "label": "VENTOINHA →",
          "disabledWhen": {
            "component": "c01"
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
      "theme": "hardware",
      "items": [
        {
          "kind": "board",
          "x": 0,
          "y": 200,
          "width": 2800,
          "height": 770,
          "label": "PLACA-MÃE"
        },
        {
          "kind": "cpu",
          "x": 460,
          "y": 650,
          "width": 280,
          "height": 115,
          "label": "CPU"
        },
        {
          "kind": "ram",
          "x": 1320,
          "y": 510,
          "width": 210,
          "height": 300,
          "label": "MEMÓRIA RAM"
        },
        {
          "kind": "gpu",
          "x": 2070,
          "y": 620,
          "width": 300,
          "height": 180,
          "label": "PLACA DE VÍDEO"
        },
        {
          "kind": "fan",
          "x": 780,
          "y": 730,
          "width": 120,
          "height": 120,
          "label": "FLUXO →"
        },
        {
          "kind": "cache",
          "x": 300,
          "y": 540,
          "width": 120,
          "height": 30,
          "label": "CACHE L1"
        },
        {
          "kind": "cache",
          "x": 1510,
          "y": 400,
          "width": 150,
          "height": 30,
          "label": "CACHE RAM"
        }
      ],
      "pass": "midground"
    }
  ]
}));
