# BYTE RUNNER

BYTE RUNNER é um jogo de plataforma 2D ambientado no interior de um computador infectado e de uma infraestrutura de rede comprometida. Você controla R-07, uma unidade robótica criada para proteger sistemas e restaurar os setores afetados por uma ameaça digital.

A campanha percorre dez fases com cenários próprios inspirados em informática e redes: hardware, sistemas operacionais, switches, roteadores, Wi-Fi, DHCP, DNS, segurança e servidores. Explore os mapas, atravesse obstáculos, enfrente vírus e repare componentes corrompidos por meio de desafios interativos de diagnóstico. Perguntas de conhecimento também fazem parte da progressão.

O combate combina movimentação, saltos, ataques e disparos especiais. Derrotar inimigos e concluir desafios concede experiência; ao subir de nível, é possível desbloquear e aprimorar habilidades. O progresso da campanha é salvo no navegador. A missão culmina no confronto com VIRUS ZERO, no núcleo digital da rede.

## Tecnologias

- HTML5 e Canvas 2D para a estrutura e a renderização do jogo.
- CSS3 para a interface, o layout responsivo e os controles por toque.
- JavaScript para o jogo, incluindo fases, combate, minigames e salvamento local.
- Imagens PNG e spritesheets para cenários e animações em pixel art.
- Python para ferramentas de desenvolvimento e verificações; não é necessário para jogar.

## Como jogar online

Acesse [BYTE RUNNER no GitHub Pages](https://affodao.github.io/Jogo-WEB/).

## Como executar localmente

1. Baixe ou clone este repositório, preservando a estrutura de arquivos e pastas.
2. Abra `index.html` em um navegador moderno para iniciar o jogo.

O projeto não exige instalação de dependências nem compilação. Se preferir servir os arquivos localmente, execute na pasta do projeto:

```sh
python -m http.server 8000
```

Depois, acesse [http://localhost:8000](http://localhost:8000). Encerre o servidor com `Ctrl+C` no terminal.

## Controles

- **Mover:** A/D ou setas laterais.
- **Pular:** W, seta para cima ou Espaço.
- **Atacar:** J.
- **Disparo especial:** K.
- **Reparar ou interagir:** E.
- **Pausar:** Esc.

Em dispositivos com tela sensível ao toque, use os botões exibidos na interface.

## Estrutura do projeto

- `index.html` e `style.css`: interface e apresentação.
- `game.js`: lógica principal do jogo.
- `src/engine/`: sistemas reutilizáveis de fases, inimigos, visuais e reparos.
- `src/maps/`: definições das dez fases da campanha.
- `assets/`: recursos visuais e sonoros.
- `docs/`: documentação de arquitetura, mapas, arte e mecânicas.
- `tests/`: verificações e materiais de revisão do projeto.

Para detalhes de arquitetura e desenvolvimento, consulte [docs/architecture.md](docs/architecture.md), [docs/art-direction.md](docs/art-direction.md) e [tests/README.md](tests/README.md).
