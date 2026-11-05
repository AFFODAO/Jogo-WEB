# Pixel art 2D — biblioteca PNG e integração

A arte principal agora é uma biblioteca de **47 atlas PNG originais**, gerados sem dependências externas. O trabalho começou pelo robô de 32×48 e pelo conjunto de Hardware; o mesmo vocabulário de contornos escuros, metal em três tons, agrupamentos de pixels e luzes de acento foi aplicado ao restante.

## Recursos

| Pasta em `assets/pixelart/` | Conteúdo e tamanho nativo |
| --- | --- |
| `actors/` | R-07: 32×48; parado, corrida, salto, queda, ataque, dano, reparo, morte e ativação de habilidade. |
| `enemies/` | Sete famílias: básico, rápido, blindado, voador, atirador, parasita e VIRUS ZERO. Cinco variantes próprias: arquivo, pacote, Wi-Fi, DNS e firewall. Normais em 32×32, chefe em 64×64. |
| `tilesets/` | Dez conjuntos de 32×32: superfície, móvel, temporária, preenchimento, base, parede, perigo, acabamento, fio, tela e fundo. |
| `scenery/` | Dez atlas de equipamentos em 64×64: CPU, RAM, GPU, ventoinha, terminal, núcleo, antena, rack, arquivo, Ethernet, gateway, domínio, firewall, cabo, parede e janela. |
| `backgrounds/` | Dez panoramas modulares de 96×96, em três profundidades de paralaxe. |
| `objects/` | Componentes e terminais em 32×48; portal em 48×64. Estados danificado/reparado e inativo/ativo. |
| `effects/` | Tiros aliados/inimigos, explosão, escudo, ferramenta de reparo e pulso de coleta em 32×32. |

Cada linha tem **oito quadros**. Corrida/movimentação usa 16 quadros/s; ataque 24; salto, queda, morte e habilidade 12; os demais ciclos 8. Morte, explosão e ativação não repetem. Os estados de patrulha, perseguição, mira e recuo reaproveitam a linha de movimento adequada. VIRUS ZERO mantém linhas visuais distintas para suas três etapas.

Os PNGs têm transparência binária, sem pixels parcialmente transparentes nem antialias na fonte. O robô possui visor com piscada, placas assimétricas, reator nas costas, canhão/ferramenta, joelhos e botas articulados. Os vírus têm silhuetas diferentes, não apenas recolorações. Os dez materiais também possuem padrões geométricos próprios: circuitos/chips, arquivos, contatos Ethernet, setas de rota, antenas, cabos, terminais IP, árvore DNS, blocos de segurança e servidores.

## Geração e inspeção

```powershell
python tools/build_art.py
```

O comando grava todos os PNGs, `assets/pixelart/manifest.json`, `src/engine/art-manifest.js` e uma prancha de referência em `assets/pixelart/contact-sheet.png`. A biblioteca usa aproximadamente 370 KB comprimidos, incluindo a prancha; a memória decodificada no navegador é maior que o tamanho dos arquivos.

Fontes editáveis:

- `tools/pixelart/raster.py`: desenho inteiro e escrita PNG RGBA com `struct` e `zlib` da biblioteca padrão.
- `tools/pixelart/actors.py`: silhuetas, armaduras e poses dos atores.
- `tools/pixelart/environment.py`: materiais, peças e cenografia das dez fases.
- `tools/pixelart/build.py`: montagem dos atlas e manifesto.

Abra [a galeria animada](../tests/pixelart-gallery.html) para escolher atlas, ação e escala inteira. A prancha [contact-sheet.png](../assets/pixelart/contact-sheet.png) reúne as nove linhas do robô, inimigos e amostras de tiles. Os SVGs antigos em `assets/sprites/` são recursos históricos; o manifesto e a interface atuais usam os PNGs novos.

## Como o jogo utiliza a arte

`visuals.js` carrega imagens com cache compartilhado, seleciona a célula pelo estado, velocidade e relógio da instância e sempre desenha com `imageSmoothingEnabled=false`. A abertura local de `index.html` continua funcionando. Recursos de mapa personalizados ainda têm precedência. Um recurso que falha retorna `false`, preservando o desenho alternativo do motor.

`pixel-art.js` compõe pisos, bases, paredes, plataformas móveis/temporárias, equipamentos e fundos. Texturas repetidas usam `CanvasPattern` com cache; o recorte e os testes de visibilidade limitam o trabalho à região da câmera. Equipamentos são ampliados em fatores inteiros e nunca com interpolação bilinear. Rótulos de cenário usam letras bitmap 5×7.

Os renderizadores `computer-world` e `infrastructure-world` usam os PNGs para a cenografia existente. Isso substitui os grandes equipamentos vetoriais suaves da campanha, mantendo os mapas e suas relações. As cores dos dez conjuntos são próprias e os fundos usam azuis, verdes, violetas e vermelhos em faixas discretas. A iluminação de borda usa degraus de pixels, e as partículas são pixels quadrados.

O mundo é composto em um framebuffer de um pixel por unidade visual e apresentado ao Canvas principal com nearest-neighbor. O HUD de texto continua em resolução de interface. A interpolação de movimento permanece, mas a posição final do sprite é arredondada; não há deformação fracionária do robô. A célula 32×48 é desenhada nesse tamanho, alinhada à caixa física existente de 34×48.

`game.js` seleciona as nove ações reais de R-07. Selecionar uma habilidade ou ativar automaticamente o escudo dispara a linha `ability`. O relógio visual do robô avança durante um diagnóstico, mas o relógio da física, inimigos e combate permanece congelado. A morte aparece no ponto anterior ao respawn, sem atrasar o retorno ao checkpoint. Os vírus usam suas linhas de movimento, preparação, ataque, dano, vulnerabilidade e morte; a variante temática é selecionada quando ela existe na entidade.

Geometria, colisões, dano, controles, habilidades, reparos, perguntas, objetivos e salvamentos continuam independentes dos desenhos. PNGs indisponíveis acionam os desenhos alternativos existentes. Contornos de perigo e instruções de combate continuam disponíveis no modo de efeitos reduzidos.

## Verificação e limites

```powershell
python tools/check_maps.py
python tests/run_review.py --pixel-only
python tests/run_review.py
python tests/run_browser_audit.py
```

Os novos testes conferem dimensões, todos os quadros declarados, transparência sem antialias, animações que mudam pixels, materiais estruturalmente distintos sem considerar sua paleta, seleção efetiva das variantes e estados de morte/habilidade. O relógio de reparo é conferido separadamente do estado físico. A suíte de regressão cobre mapas, inimigos, minigames e salvamento.

Os panoramas de teste são exportados em até 1600×1000 com nearest-neighbor, evitando manter todas as capturas gigantes em memória ao mesmo tempo; os PNGs fonte e o framebuffer de jogo não são reduzidos por esse limite de exportação. A suíte passou a usar o relógio real do Chrome pelo depurador, com o perfil de teste isolado, em vez de depender do carregamento PNG sob tempo virtual.

Os resultados efetivamente executados ficam nos JSONs em `tests/`. Isso não substitui medição de FPS, avaliação do áudio ou teste de toque em aparelhos físicos, nem uma partida humana contínua da campanha inteira.

Na execução final desta reformulação, `tools/check_maps.py` aprovou os dez mapas; `tests/run_review.py` aprovou **86/86 verificações** e gerou 68 capturas; `tests/run_browser_audit.py` aprovou **70/70 cenários em sete resoluções**, além de teclado, toque e retomada após navegação real. Ambos terminaram sem erros JavaScript e registram a mesma assinatura dos arquivos atuais, incluindo os PNGs. As primeiras tentativas tiveram problemas de tempo virtual e encerramento de perfis do Chrome no Windows; o runner passou a usar CDP com tempo real, capturas de tamanho limitado e encerramento do seu próprio processo isolado.
