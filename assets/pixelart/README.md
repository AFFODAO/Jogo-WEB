# BYTE RUNNER — pixel art original

47 sprite sheets PNG, oito colunas por atlas, transparência sem antialias. `manifest.json` declara dimensões e animações; `contact-sheet.png` é uma referência visual, não um recurso carregado na campanha.

- `actors/`: R-07 em 32×48, nove ações.
- `enemies/`: sete tipos e cinco variantes, 32×32; VIRUS ZERO, 64×64.
- `tilesets/`: dez materiais em 32×32.
- `scenery/`: dez coleções de equipamentos em 64×64.
- `backgrounds/`: dez fundos modulares em 96×96.
- `objects/`: componentes, terminais e portais.
- `effects/`: projéteis, escudo, partículas e explosões.

Regere com `python tools/build_art.py`. As fontes estão em `tools/pixelart/`, usando apenas a biblioteca padrão do Python. Consulte [a integração](../../docs/pixel-art.md) e [a galeria animada](../../tests/pixelart-gallery.html).
