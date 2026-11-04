// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.
ByteRunner.maps.register({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-02",
  "name": "Software do computador",
  "theme": "software",
  "objective": "Navegue pelos diretórios, restaure processos e arquivos e recupere o escalonador nas quatro salas do sistema.",
  "palette": [
    "#111025",
    "#302756",
    "#b6a0ff",
    "#575187",
    "#f297c7"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 1900,
    "height": 1400,
    "layout": "hub",
    "start": {
      "x": 280,
      "y": 1202
    },
    "exit": {
      "mode": "region",
      "x": 1660,
      "y": 1186,
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
          "id": "desktop-floor",
          "x": 80,
          "y": 1250,
          "width": 660,
          "height": 28
        },
        {
          "id": "process-floor",
          "x": 80,
          "y": 650,
          "width": 660,
          "height": 28
        },
        {
          "id": "filesystem-floor",
          "x": 1150,
          "y": 650,
          "width": 660,
          "height": 28
        },
        {
          "id": "scheduler-floor",
          "x": 1150,
          "y": 1250,
          "width": 660,
          "height": 28
        }
      ]
    },
    "checkpoints": [
      {
        "x": 180,
        "y": 650
      },
      {
        "x": 1250,
        "y": 650
      },
      {
        "x": 1300,
        "y": 1250
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "Desktop → Processos → Arquivos",
      "Desktop → Escalonador → Arquivos"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "desktop-window",
        "x": 300,
        "y": 1150,
        "width": 180,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "window",
        "motion": {
          "axis": "x",
          "range": 28,
          "speed": 0.6
        }
      },
      {
        "id": "desktop-cache",
        "x": 510,
        "y": 1060,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "process-window",
        "x": 250,
        "y": 550,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "process-monitor",
        "x": 440,
        "y": 470,
        "width": 160,
        "height": 18,
        "type": "moving",
        "collision": "one-way",
        "style": "window",
        "motion": {
          "axis": "y",
          "range": 12,
          "speed": 0.7
        }
      },
      {
        "id": "filesystem-step",
        "x": 1220,
        "y": 560,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "restored-file-window",
        "x": 1430,
        "y": 480,
        "width": 200,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window",
        "requiresComponentId": "c02"
      },
      {
        "id": "scheduler-step",
        "x": 1270,
        "y": 1170,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "scheduler-platform",
        "x": 1450,
        "y": 1090,
        "width": 230,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "restored-process-link",
        "x": 520,
        "y": 550,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window",
        "requiresComponentId": "c01"
      },
      {
        "id": "scheduler-secret",
        "x": 1650,
        "y": 1000,
        "width": 140,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "restored-scheduler-window",
        "x": 1230,
        "y": 1010,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window",
        "requiresComponentId": "c03"
      }
    ],
    "obstacles": [
      {
        "id": "desktop-wall-left",
        "x": 60,
        "y": 920,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "desktop-wall-right",
        "x": 740,
        "y": 920,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "process-wall-left",
        "x": 60,
        "y": 320,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "process-wall-right",
        "x": 740,
        "y": 320,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "files-wall-left",
        "x": 1130,
        "y": 320,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "files-wall-right",
        "x": 1810,
        "y": 320,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "scheduler-wall-left",
        "x": 1130,
        "y": 920,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "scheduler-wall-right",
        "x": 1810,
        "y": 920,
        "width": 20,
        "height": 354,
        "collision": "solid",
        "type": "corrupt"
      },
      {
        "id": "corrupt-file",
        "x": 1390,
        "y": 554,
        "width": 46,
        "height": 96,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c02"
      },
      {
        "id": "hung-process",
        "x": 540,
        "y": 570,
        "width": 38,
        "height": 80,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c01"
      }
    ],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 420,
        "y": 606,
        "width": 34,
        "height": 44,
        "label": "PROCESSO DO SISTEMA"
      },
      {
        "id": "c02",
        "x": 1510,
        "y": 606,
        "width": 34,
        "height": 44,
        "label": "ÍNDICE DE ARQUIVOS"
      },
      {
        "id": "c03",
        "x": 1510,
        "y": 1046,
        "width": 34,
        "height": 44,
        "label": "ESCALONADOR"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "fast",
        "x": 550,
        "y": 1226,
        "groundY": 1250,
        "navigationBounds": {
          "left": 220,
          "right": 650
        },
        "patrolMin": 220,
        "patrolMax": 650,
        "activationRegion": {
          "x": 80,
          "y": 900,
          "width": 660,
          "height": 400
        }
      },
      {
        "id": "e02",
        "type": "basic",
        "x": 570,
        "y": 626,
        "groundY": 650,
        "navigationBounds": {
          "left": 300,
          "right": 680
        },
        "patrolMin": 300,
        "patrolMax": 680,
        "activationRegion": {
          "x": 80,
          "y": 300,
          "width": 660,
          "height": 400
        }
      },
      {
        "id": "e03",
        "type": "shooter",
        "x": 1690,
        "y": 1066,
        "groundY": 1090,
        "navigationBounds": {
          "left": 1490,
          "right": 1650
        },
        "patrolMin": 1490,
        "patrolMax": 1650,
        "activationRegion": {
          "x": 1150,
          "y": 900,
          "width": 660,
          "height": 400
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 565,
        "y": 1030,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 510,
        "y": 435,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 1530,
        "y": 450,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 1720,
        "y": 970,
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
      "id": "directories",
      "type": "portals",
      "links": [
        {
          "id": "desktop-to-process",
          "x": 610,
          "y": 1174,
          "width": 44,
          "height": 76,
          "to": {
            "x": 150,
            "y": 602
          },
          "label": "/PROCESSOS"
        },
        {
          "id": "process-to-desktop",
          "x": 110,
          "y": 574,
          "width": 44,
          "height": 76,
          "to": {
            "x": 500,
            "y": 1202
          },
          "label": "/DESKTOP"
        },
        {
          "id": "process-to-files",
          "x": 650,
          "y": 574,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1240,
            "y": 602
          },
          "label": "/ARQUIVOS",
          "requires": {
            "component": "c01"
          }
        },
        {
          "id": "files-to-process",
          "x": 1170,
          "y": 574,
          "width": 44,
          "height": 76,
          "to": {
            "x": 530,
            "y": 602
          },
          "label": "/PROCESSOS"
        },
        {
          "id": "desktop-to-scheduler",
          "x": 120,
          "y": 1174,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1240,
            "y": 1202
          },
          "label": "/TAREFAS",
          "requires": {
            "component": "c01"
          }
        },
        {
          "id": "scheduler-to-desktop",
          "x": 1180,
          "y": 1174,
          "width": 44,
          "height": 76,
          "to": {
            "x": 240,
            "y": 1202
          },
          "label": "/DESKTOP"
        },
        {
          "id": "scheduler-to-files",
          "x": 1740,
          "y": 1174,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1680,
            "y": 602
          },
          "label": "/ARQUIVOS"
        },
        {
          "id": "files-to-scheduler",
          "x": 1740,
          "y": 574,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1270,
            "y": 1202
          },
          "label": "/TAREFAS"
        }
      ]
    }
  ],
  "assets": [],
  "layers": [
    {
      "id": "authored-scenery",
      "type": "computer-world",
      "theme": "software",
      "items": [
        {
          "kind": "window-room",
          "x": 80,
          "y": 920,
          "width": 660,
          "height": 330,
          "label": "DESKTOP / ENTRADA"
        },
        {
          "kind": "window-room",
          "x": 80,
          "y": 320,
          "width": 660,
          "height": 330,
          "label": "PROCESSOS"
        },
        {
          "kind": "window-room",
          "x": 1150,
          "y": 320,
          "width": 660,
          "height": 330,
          "label": "SISTEMA DE ARQUIVOS"
        },
        {
          "kind": "window-room",
          "x": 1150,
          "y": 920,
          "width": 660,
          "height": 330,
          "label": "ESCALONADOR"
        },
        {
          "kind": "folder",
          "x": 510,
          "y": 1020,
          "width": 150,
          "height": 40,
          "label": "CACHE"
        },
        {
          "kind": "process",
          "x": 250,
          "y": 520,
          "width": 150,
          "height": 30,
          "label": "PID 014"
        },
        {
          "kind": "process",
          "x": 1450,
          "y": 1060,
          "width": 230,
          "height": 30,
          "label": "TASK MANAGER"
        }
      ],
      "pass": "midground"
    }
  ]
});
