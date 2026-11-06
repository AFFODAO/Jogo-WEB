# Identidades do parallax — dez fases

[Abrir a galeria de capturas reais](../tests/identity-gallery.html). Cada fase possui vistas de camadas isoladas, início com personagem, deslocamento horizontal e deslocamento vertical. Servidores também possui uma captura da arena de VIRUS ZERO.

| Fase | Plano distante | Plano intermediário | Plano próximo e atmosfera |
| --- | --- | --- | --- |
| 1 — Hardware | Placa-mãe em grandes silhuetas, processador com contatos e poucas trilhas | Bancos de RAM e soquetes | Dissipadores, capacitores e suportes; contatos luminosos contidos |
| 2 — Software | Pilhas de janelas virtuais roxas | Diretórios, pastas e arquivos com canto dobrado | Cartões de processos, pequenas marcas de execução |
| 3 — Switch | Grandes bancos de conexão | Portas Ethernet e feixes de patch cables organizados | Interfaces e percursos curtos de pacotes |
| 4 — Roteador | Bocas de túneis octogonais | Caminhos ramificados entre interfaces | Painéis de encaminhamento e setas de rota |
| 5 — Wi-Fi | Torres abertas com grandes intervalos e movimento mais lento | Relays suspensos e ondas angulares discretas | Antenas escalonadas, sinal e pequenas falhas ocasionais |
| 6 — Cabeamento | Vãos estruturais com contraventamento | Dutos em cotovelo e braçadeiras | Painéis com cabos separados e iluminação industrial contida |
| 7 — DHCP | Distribuidor com conexões para sub-redes | Servidores de endereçamento | Terminais com grupos de endereços e fluxo discreto |
| 8 — DNS | Portais de resolução distantes | Árvore de domínio raiz e subdomínios | Arquivos de nomes e núcleo azul entre torres roxas |
| 9 — Firewall | Fortaleza com ameias e entrada recuada | Barreiras entre torres com alertas | Escudo e fechadura; vermelho discreto |
| 10 — Servidores | Portais sucessivos de corredores profundos | Racks com bandejas e ventilação | Infraestrutura de data center e fragmentos de corrupção crescentes |

As silhuetas de cada um dos três planos principais diferem em todas as dez fases, mesmo removendo as cores. A pintura é raster original por coordenadas inteiras, com cores sólidas, sem antialiasing, gradientes ou imagens externas. A unidade dos pequenos detalhes é de dois pixels; contornos de um pixel definem os módulos. O plano distante usa escala inteira 2; os módulos intermediários e próximos usam escala 1.

## Camadas, composição e câmera

Cada tema mantém seu próprio perfil imutável, atlas e cache. Hardware conserva quatro planos; as outras fases usam três planos e atmosfera separada. Todos são desenhados antes de plataformas, inimigos e personagem.

| Camada | Velocidade X | Velocidade Y | Escala |
| --- | --- | --- | --- |
| Distante padrão | 0,030 | 0,025 | 2 |
| Distante Wi-Fi | 0,015 | 0,012 | 2 |
| Intermediária padrão | 0,100 | 0,080 | 1 |
| Próxima padrão | 0,260 | 0,200 | 1 |
| Hardware distante | 0,025 | 0,020 | 2 |
| Hardware intermediária | 0,080 | 0,065 | 1 |
| Hardware próxima | 0,220 | 0,170 | 1 |
| Hardware suportes | 0,600 | 0,480 | 1 |

O deslocamento usa a posição absoluta da câmera e arredondamento inteiro em ambos os eixos. Fileiras possuem intervalo de duas alturas de célula; variantes vazias separam os motivos horizontalmente. Todas as bordas das células são transparentes e compatíveis para repetição em X e Y. Os planos usam opacidade 1; o contraste é definido pelas paletas dos próprios desenhos. Existem apenas quatro partículas ambientais por perfil, além das pequenas marcas vinculadas aos equipamentos.

As regiões arquitetônicas continuam nas coordenadas e dimensões dos mapas, indicadas por cantos e rótulos. A antiga grade opaca de painéis repetidos foi retirada para que as composições temáticas permaneçam visíveis. Sprites específicos de equipamentos, elementos interativos e plataformas foram preservados.

## Servidores e VIRUS ZERO

A corrupção cresce conforme a câmera avança na largura do mapa, de zero a seis pequenos fragmentos; a arena acrescenta quatro. Os fragmentos mudam lentamente, sem flashes de tela. O núcleo regional é um frame raster próprio, em escala 2, posicionado no centro da região `boss-arena` já existente e recortado por seus limites. Ele não se repete pelo mapa e só aparece quando a janela da câmera intersecta a arena nos dois eixos. Abaixo da arena não há vazamento do núcleo. O modo de efeitos reduzidos mantém o núcleo estático e elimina os fragmentos, marcas animadas e partículas.

## Reprodução e evidências

Uma fase pode ser gerada sem tocar no terreno, atores ou outros atlas:

```powershell
python tools/build_environment_art.py --parallax-phase 3
python tests/run_review.py --identity-phase 3
```

O ciclo inicial foi executado na ordem 1 a 10, gerando e verificando cada atlas antes de avançar. Depois dos ajustes finais, `python tests/run_identity_campaign.py` repete os testes sequencialmente, interrompe em caso de falha e gera a galeria e o resumo `tests/identity-campaign-results.json`, com as dez fases na mesma versão de fontes.

Os testes individuais verificam raster sem suavização, bordas, variantes vazias, planos com silhuetas distintas, câmera X/Y e coordenadas negativas, determinismo, cache limitado, restauração do Canvas, efeitos reduzidos e preservação de colisões, atores e objetivos. Servidores acrescenta a verificação de corrupção progressiva e limite regional nos dois eixos.

As variantes espaciais vazias são declaradas em `emptyFrames` no manifesto, exclusivamente nos atlas `vista-*`. A validação geral exige que os pixels correspondam exatamente à declaração e que cada plano tenha conteúdo; sprites de atores continuam obrigatoriamente não vazios. Isso substitui o contrato antigo, que reprovava qualquer frame vazio, inclusive áreas de descanso intencionais. A primeira regressão com essa reprovação foi preservada em `tests/identity-initial-regression.json`.

`tools/check_hardware_depth.py` agora confere a reprodução dos dez atlas, a diferença estrutural de cada plano e a concordância dos manifestos. `tools/check_parallax.py` e `tools/check_environment.py` protegem mapas, física, câmera e sistemas por hashes. A regressão completa continua sendo executada por `python tests/run_review.py`. Esta etapa não certifica 60 FPS nem substitui uma avaliação manual de balanceamento.

Resultado final: revisão sequencial 41/41, com 41 capturas; regressão completa 209/209, dez fases e 92 capturas; ambas sem erros de runtime e na versão de fontes `f8811113c246ef523a68b256ae232860fb32d8ba0a967fdc263b7ca36f8c8be2`. Relatórios: `tests/identity-campaign-results.json` e `tests/review-results.json`.
