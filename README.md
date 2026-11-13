# BYTE RUNNER

BYTE RUNNER é um jogo de plataforma 2D ambientado no interior de um computador infectado e de uma infraestrutura de rede comprometida. Você assume o controle da unidade robótica R-07, criada para proteger sistemas e restaurar os setores afetados por uma ameaça digital.

A campanha atravessa dez fases com ambientes e percursos próprios, inspirados em componentes e conceitos de informática, como hardware, sistemas operacionais, switches, roteadores, Wi-Fi, DHCP, DNS, segurança e servidores. Em cada setor, será preciso explorar o cenário, superar obstáculos de plataforma, enfrentar vírus e recuperar componentes corrompidos. Reparos são apresentados como desafios interativos de diagnóstico; perguntas de conhecimento fazem parte da progressão da campanha.

O combate combina movimentação, saltos, ataques e disparos especiais. Ao derrotar inimigos e concluir desafios, R-07 ganha experiência, sobe de nível e pode desbloquear ou aprimorar habilidades. O progresso da campanha, incluindo a evolução do personagem, é salvo no navegador para que você possa continuar depois. A missão culmina no confronto contra VIRUS ZERO, no núcleo digital da rede.

## Tecnologias utilizadas

- HTML5 e Canvas 2D: estrutura da página e renderização do jogo.
- CSS3: interface, layout responsivo e controles por toque.
- JavaScript: física, combate, fases, minigames e salvamento local.
- PNG e spritesheets: cenários e animações em pixel art.
- Python: ferramentas auxiliares e testes; não é necessário para jogar.

## Como executar

1. Baixe ou clone o projeto, mantendo a estrutura das pastas.
2. Abra o arquivo index.html em um navegador moderno, como Chrome, Edge ou Firefox.
3. Inicie a campanha pela interface do jogo.

Não é necessário instalar dependências ou compilar o projeto.

Se preferir usar um servidor local, com Python instalado, execute na pasta do projeto:

python -m http.server 8000

Acesse http://localhost:8000 no navegador. Para encerrar o servidor, pressione Ctrl+C no terminal.

## Controles básicos

- A/D ou setas laterais: mover.
- W, seta para cima ou Espaço: pular.
- J: atacar; K: disparo especial.
- E: reparar ou interagir.
- Esc: pausar.

Em dispositivos com tela sensível ao toque, use os botões exibidos na interface.
