// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.
ByteRunner.maps.register(ByteRunner.campaignGeneration.build({
  "schemaVersion": 2,
  "revision": 2,
  "id": "phase-08",
  "name": "DNS",
  "theme": "dns",
  "objective": "Reconstrua os registros de .com, .org e do cache recursivo; encontre a resolução de retorno à raiz.",
  "palette": [
    "#101529",
    "#302952",
    "#d2b0ff",
    "#7d68a1",
    "#83c8e7"
  ],
  "presentation": {
    "procedural": false
  },
  "map": {
    "width": 3400,
    "height": 2100,
    "layout": "maze",
    "start": {
      "x": 1600,
      "y": 352
    },
    "exit": {
      "mode": "region",
      "x": 1940,
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
          "id": "dns-root",
          "x": 1350,
          "y": 400,
          "width": 700,
          "height": 28
        },
        {
          "id": "com-domain",
          "x": 200,
          "y": 750,
          "width": 850,
          "height": 28
        },
        {
          "id": "org-domain",
          "x": 2350,
          "y": 750,
          "width": 850,
          "height": 28
        },
        {
          "id": "mail-com",
          "x": 200,
          "y": 1200,
          "width": 850,
          "height": 28
        },
        {
          "id": "api-org",
          "x": 2350,
          "y": 1200,
          "width": 850,
          "height": 28
        },
        {
          "id": "recursive-cache",
          "x": 1320,
          "y": 1550,
          "width": 760,
          "height": 28
        },
        {
          "id": "nxdomain-room",
          "x": 80,
          "y": 1700,
          "width": 420,
          "height": 28
        },
        {
          "id": "archive-cache",
          "x": 900,
          "y": 1900,
          "width": 1600,
          "height": 28
        }
      ]
    },
    "checkpoints": [
      {
        "x": 1580,
        "y": 400
      },
      {
        "x": 400,
        "y": 1200
      },
      {
        "x": 2900,
        "y": 1200
      },
      {
        "x": 1510,
        "y": 1550
      }
    ],
    "checkpointMode": "free",
    "progress": {
      "axis": "objectives"
    },
    "routes": [
      "raiz DNS",
      "domínio .com e mail.com",
      "domínio .org e api.org",
      "cache recursivo",
      "NXDOMAIN e arquivo"
    ]
  },
  "entities": {
    "platforms": [
      {
        "id": "root-com-a",
        "x": 1160,
        "y": 490,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-com-b",
        "x": 970,
        "y": 580,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-com-c",
        "x": 780,
        "y": 670,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-org-a",
        "x": 2080,
        "y": 490,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-org-b",
        "x": 2250,
        "y": 580,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-org-c",
        "x": 2440,
        "y": 670,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "com-shaft-a",
        "x": 1020,
        "y": 840,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "com-shaft-b",
        "x": 850,
        "y": 930,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "com-shaft-c",
        "x": 1020,
        "y": 1020,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "com-shaft-d",
        "x": 850,
        "y": 1110,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-shaft-a",
        "x": 3050,
        "y": 840,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-shaft-b",
        "x": 2860,
        "y": 930,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-shaft-c",
        "x": 3050,
        "y": 1020,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-shaft-d",
        "x": 2860,
        "y": 1110,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-west-a",
        "x": 1100,
        "y": 1290,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-west-b",
        "x": 1290,
        "y": 1380,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-west-c",
        "x": 1480,
        "y": 1470,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-east-a",
        "x": 2180,
        "y": 1290,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-east-b",
        "x": 1990,
        "y": 1380,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cache-east-c",
        "x": 1800,
        "y": 1470,
        "width": 180,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "archive-a",
        "x": 1100,
        "y": 1810,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "archive-b",
        "x": 1270,
        "y": 1720,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "archive-c",
        "x": 1440,
        "y": 1630,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "com-divider-step",
        "x": 520,
        "y": 660,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "mail-divider-step",
        "x": 540,
        "y": 1110,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-divider-step",
        "x": 2580,
        "y": 660,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "api-divider-step",
        "x": 2580,
        "y": 1110,
        "width": 160,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "root-cache",
        "x": 1480,
        "y": 310,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "org-secret",
        "x": 3020,
        "y": 660,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "archive-secret",
        "x": 2300,
        "y": 1810,
        "width": 150,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "window"
      },
      {
        "id": "cname-com-bridge",
        "x": 1160,
        "y": 1200,
        "width": 520,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c01"
      },
      {
        "id": "cname-org-bridge",
        "x": 1710,
        "y": 1200,
        "width": 600,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c02"
      },
      {
        "id": "cache-restored-step",
        "x": 1690,
        "y": 1340,
        "width": 170,
        "height": 18,
        "type": "fixed",
        "collision": "one-way",
        "style": "packet",
        "requiresComponentId": "c03"
      }
    ],
    "obstacles": [
      {
        "id": "com-corrupt-wall",
        "x": 680,
        "y": 590,
        "width": 35,
        "height": 160,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c01"
      },
      {
        "id": "mail-corrupt-wall",
        "x": 700,
        "y": 1040,
        "width": 35,
        "height": 160,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c01"
      },
      {
        "id": "org-corrupt-wall",
        "x": 2730,
        "y": 600,
        "width": 35,
        "height": 150,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c02"
      },
      {
        "id": "api-corrupt-wall",
        "x": 2730,
        "y": 1040,
        "width": 35,
        "height": 160,
        "type": "corrupt",
        "collision": "solid",
        "requiresComponentId": "c02"
      },
      {
        "id": "root-corruption",
        "x": 1850,
        "y": 300,
        "width": 30,
        "height": 100,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03"
      },
      {
        "id": "nxdomain-corruption",
        "x": 350,
        "y": 1630,
        "width": 30,
        "height": 70,
        "type": "interference",
        "collision": "dangerous",
        "damage": 12,
        "requiresComponentId": "c03",
        "window": {
          "period": 4,
          "active": 1.4,
          "phase": 0
        }
      }
    ],
    "gates": [],
    "components": [
      {
        "id": "c01",
        "x": 500,
        "y": 1156,
        "width": 34,
        "height": 44,
        "label": "REGISTRO MX / .COM"
      },
      {
        "id": "c02",
        "x": 2840,
        "y": 1156,
        "width": 34,
        "height": 44,
        "label": "REGISTRO A / .ORG"
      },
      {
        "id": "c03",
        "x": 1670,
        "y": 1506,
        "width": 34,
        "height": 44,
        "label": "CACHE RECURSIVO"
      }
    ],
    "enemies": [
      {
        "id": "e01",
        "type": "shooter",
        "x": 1780,
        "y": 376,
        "groundY": 400,
        "navigationBounds": {
          "left": 1460,
          "right": 1810
        },
        "patrolMin": 1460,
        "patrolMax": 1810,
        "activationRegion": {
          "x": 1350,
          "y": 150,
          "width": 700,
          "height": 310
        }
      },
      {
        "id": "e02",
        "type": "fast",
        "x": 930,
        "y": 726,
        "groundY": 750,
        "navigationBounds": {
          "left": 760,
          "right": 1010
        },
        "patrolMin": 760,
        "patrolMax": 1010,
        "activationRegion": {
          "x": 200,
          "y": 480,
          "width": 850,
          "height": 330
        }
      },
      {
        "id": "e03",
        "type": "basic",
        "x": 3090,
        "y": 726,
        "groundY": 750,
        "navigationBounds": {
          "left": 2870,
          "right": 3160
        },
        "patrolMin": 2870,
        "patrolMax": 3160,
        "activationRegion": {
          "x": 2350,
          "y": 480,
          "width": 850,
          "height": 330
        }
      },
      {
        "id": "e04",
        "type": "parasite",
        "x": 1940,
        "y": 1526,
        "groundY": 1550,
        "navigationBounds": {
          "left": 1400,
          "right": 2020
        },
        "patrolMin": 1400,
        "patrolMax": 2020,
        "activationRegion": {
          "x": 1320,
          "y": 1260,
          "width": 760,
          "height": 350
        }
      },
      {
        "id": "e05",
        "type": "armored",
        "x": 3060,
        "y": 1176,
        "groundY": 1200,
        "navigationBounds": {
          "left": 2860,
          "right": 3160
        },
        "patrolMin": 2860,
        "patrolMax": 3160,
        "activationRegion": {
          "x": 2350,
          "y": 940,
          "width": 850,
          "height": 320
        }
      }
    ],
    "collectibles": [
      {
        "id": "i01",
        "x": 1540,
        "y": 280,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i02",
        "x": 3080,
        "y": 630,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i03",
        "x": 2370,
        "y": 1780,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i04",
        "x": 460,
        "y": 1670,
        "radius": 10,
        "secret": true
      },
      {
        "id": "i05",
        "x": 980,
        "y": 1870,
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
    "enemiesToDefeat": 5
  },
  "mechanics": [
    {
      "id": "name-resolution",
      "type": "portals",
      "links": [
        {
          "id": "root-com",
          "x": 1410,
          "y": 324,
          "width": 44,
          "height": 76,
          "to": {
            "x": 350,
            "y": 702
          },
          "label": ".COM"
        },
        {
          "id": "root-org",
          "x": 1970,
          "y": 324,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2500,
            "y": 702
          },
          "label": ".ORG"
        },
        {
          "id": "com-root",
          "x": 260,
          "y": 674,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1550,
            "y": 352
          },
          "label": "RAIZ / VOLTAR"
        },
        {
          "id": "org-root",
          "x": 2410,
          "y": 674,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1750,
            "y": 352
          },
          "label": "RAIZ / VOLTAR"
        },
        {
          "id": "com-mail",
          "x": 450,
          "y": 674,
          "width": 44,
          "height": 76,
          "to": {
            "x": 350,
            "y": 1152
          },
          "label": "MAIL.COM"
        },
        {
          "id": "org-api",
          "x": 2640,
          "y": 674,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2500,
            "y": 1152
          },
          "label": "API.ORG"
        },
        {
          "id": "mail-return",
          "x": 230,
          "y": 1124,
          "width": 44,
          "height": 76,
          "to": {
            "x": 450,
            "y": 702
          },
          "label": ".COM / VOLTAR"
        },
        {
          "id": "api-return",
          "x": 2400,
          "y": 1124,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2500,
            "y": 702
          },
          "label": ".ORG / VOLTAR"
        },
        {
          "id": "cname-com-org",
          "x": 940,
          "y": 1124,
          "width": 44,
          "height": 76,
          "to": {
            "x": 2930,
            "y": 1152
          },
          "label": "CNAME → API.ORG",
          "requires": {
            "component": "c01"
          }
        },
        {
          "id": "api-cache",
          "x": 3100,
          "y": 1124,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1510,
            "y": 1502
          },
          "label": "DNS RECURSIVO",
          "requires": {
            "component": "c02"
          }
        },
        {
          "id": "cache-root",
          "x": 1950,
          "y": 1474,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1660,
            "y": 352
          },
          "label": "RAIZ / RESOLVIDO",
          "requires": {
            "component": "c03"
          }
        },
        {
          "id": "com-nxdomain",
          "x": 920,
          "y": 674,
          "width": 44,
          "height": 76,
          "to": {
            "x": 150,
            "y": 1652
          },
          "label": "WWW.INEXISTENTE"
        },
        {
          "id": "nxdomain-return",
          "x": 420,
          "y": 1624,
          "width": 44,
          "height": 76,
          "to": {
            "x": 830,
            "y": 702
          },
          "label": "NXDOMAIN / VOLTAR"
        },
        {
          "id": "archive-return",
          "x": 1800,
          "y": 1824,
          "width": 44,
          "height": 76,
          "to": {
            "x": 1510,
            "y": 1502
          },
          "label": "CACHE / VOLTAR"
        }
      ]
    }
  ],
  "assets": [],
  "layers": [
    {
      "id": "new-infrastructure",
      "type": "infrastructure-world",
      "theme": "dns",
      "items": [
        {
          "kind": "domain-root",
          "x": 1350,
          "y": 170,
          "width": 700,
          "height": 230,
          "label": ". / RAIZ"
        },
        {
          "kind": "domain-room",
          "x": 200,
          "y": 470,
          "width": 850,
          "height": 280,
          "label": ".COM"
        },
        {
          "kind": "domain-room",
          "x": 2350,
          "y": 470,
          "width": 850,
          "height": 280,
          "label": ".ORG"
        },
        {
          "kind": "domain-room",
          "x": 200,
          "y": 930,
          "width": 850,
          "height": 270,
          "label": "MAIL.COM / MX"
        },
        {
          "kind": "domain-room",
          "x": 2350,
          "y": 930,
          "width": 850,
          "height": 270,
          "label": "API.ORG / A"
        },
        {
          "kind": "domain-room",
          "x": 1320,
          "y": 1260,
          "width": 760,
          "height": 290,
          "label": "RESOLVEDOR RECURSIVO"
        },
        {
          "kind": "domain-false",
          "x": 80,
          "y": 1450,
          "width": 420,
          "height": 250,
          "label": "NXDOMAIN / SEM REGISTRO"
        },
        {
          "kind": "domain-room",
          "x": 900,
          "y": 1680,
          "width": 1600,
          "height": 220,
          "label": "ARQUIVO / CACHE TTL"
        }
      ],
      "pass": "midground"
    }
  ]
}));
