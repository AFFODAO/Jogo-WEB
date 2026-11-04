# Revisão após a reformulação — 04/11/2026

A revisão foi executada no Chrome headless no Windows, com servidor em localhost e perfis temporários. O salvamento real do jogador não foi usado. Os resultados abaixo são das execuções posteriores às correções encontradas nesta revisão.

**Resultado:** dez fases verificadas, **77/77 verificações de sistemas aprovadas**, **70/70 cenários de interface aprovados** em sete viewports, teclado/toque pelo protocolo do Chrome e retomada após navegação real aprovados. Zero erros JavaScript nos cenários executados. Isso não equivale a uma partida humana contínua nem a testes em todos os dispositivos.

Os dois relatórios finais registram a mesma assinatura SHA-256 dos arquivos do jogo: `779094c2d0f1301dd42adbc37c0ad1c021698f3ac570c2a0bf8b2fd6509d7608`.

## Comandos realmente executados

| Comando | Resultado final | Evidência |
| --- | --- | --- |
| `python tools/check_maps.py` | Passou: dez módulos e referências válidas | Auditoria estática dos mapas e manifesto |
| `python tests/run_review.py` | Passou: dez fases, 77 sistemas, zero falhas | [review-results.json](review-results.json) |
| `python tests/run_browser_audit.py` | Passou: 70 cenários, entrada real, retomada real, zero falhas | [browser-audit-results.json](browser-audit-results.json) |
| `python tests/run_review.py --capture-structures` | Prancha geométrica gerada; também gerada pela execução completa final | [structures-contact.png](structures-contact.png) |
| `git diff --check` | Passou, sem erros de whitespace | Mensagens LF/CRLF são avisos de normalização do Git |

As primeiras execuções responsivas falharam pelos problemas descritos abaixo. Eles foram corrigidos e ambas as suítes executadas novamente. Os JSONs representam as execuções finais.

## Cobertura dos 18 pontos

| # | Item | Evidência automatizada e alcance |
| --- | --- | --- |
| 1 | Dez fases carregam | Imagens decodificadas, runtime criado e renderização. Repetido na auditoria responsiva. |
| 2 | Estruturas diferentes | Comparação dos 45 pares por máscaras de colisão normalizadas, sem cores ou fundos, mais capturas geométricas. |
| 3 | Objetivos alcançáveis | Busca com física real de salto/movimento e uso das interfaces. Reparos e interativos liberam caminhos progressivamente; componentes, plataformas e saída acessíveis. A busca reposiciona R-07 entre arestas verificadas. |
| 4 | Minigames concluíveis | Todos os 32 componentes e 80 variações semeadas resolvidos por controles DOM, usando a solução do modelo. Não é enumeração de todas as variações nem teste de compreensão humana. |
| 5 | Reparos modificam cenários | Os 32 componentes foram reparados vencendo o minigame; colisões, interfaces, zonas ambientais e câmeras comparadas antes/depois. |
| 6 | Inimigos funcionais | Patrulha, detecção, investida, armadura, mira, disparo, voo, infecção, invocação e variantes exercitados. Os 41 inimigos originais foram derrotados com projéteis reais em testes isolados de combate. |
| 7 | Sprites/animações | 22 atlas decodificados; estados e quadros pintam pixels. Robô e vírus também têm comparação de pixels entre quadros, detectando animações estáticas. Fallback de imagem ausente testado. |
| 8 | Plataformas temporárias | As sete temporárias desapareceram, retornaram e respeitaram o impedimento de reaparecer dentro do robô. |
| 9 | Dano após respawn | 40 combinações: dez fases × sem habilidade/armadura/escudo/todas no máximo. Proteção inicial e dano após 2,1 s, mais amostras durante 30 s simulados. |
| 10 | Sem invulnerabilidade permanente | Ciclos legítimos de escudo voltaram a permitir dano. `shieldTime` residual sem habilidade também não bloqueou dano. |
| 11 | Perguntas obrigatórias | Entrada física no gatilho da saída abre a pergunta sem liberar transição. Banco presente nas dez fases. |
| 12 | Resposta errada exige repetir | Segundo clique não contorna erro; retomar o save reinicia fase, reparos e inimigos. REPETIR também testado. |
| 13 | Progresso salvo/restaurado | XP, habilidades, reparos, inimigos, checkpoints, flags e escolha pendente. Navegação real e clique em CONTINUAR preservaram posição, XP, habilidade, reparo, inimigo e flag. |
| 14 | VIRUS ZERO derrotável | Derrota por disparos básicos; relays, etapas, avisos, cobertura e vulnerabilidade testados. Pergunta final e save da vitória aprovados. O combate automatizado usa proteção contra dano ao jogador. |
| 15 | Erros JavaScript | Instrumentação antes dos scripts captura `error`, `unhandledrejection` e `console.error`. Auditoria CDP terminou sem exceções, erros de console/runtime ou falhas de rede. |
| 16 | Sem habilidades opcionais | Acesso aos objetivos/saída, reparos e combate isolado passaram com atributos básicos; a busca afirma que não há habilidade equipada. Partida humana contínua sobrevivendo sem habilidades permanece pendente. |
| 17 | Câmera | Limites nas dez fases, antecipação horizontal, margem vertical, amortecimento independente da taxa e movimento simulado em 30/60/144 Hz. Tremor não altera câmera lógica. |
| 18 | Interface/resoluções | Sete viewports reais, dez estados por viewport. Sem overflow horizontal, Canvas visível, descrições legíveis e controles dos painéis alcançáveis por rolagem. |

O fallback solicita propositalmente `assets/absent.svg`: o HTTP 404 dessa imagem é esperado naquela suíte e não é erro JavaScript. A auditoria separada de navegação/interface não solicita essa imagem e terminou com zero falhas de rede ou console.

## Comparação das estruturas

[Prancha dos dez mapas](structures-contact.png) · [Galeria geométrica](structures.html) · [Cenários renderizados](gallery.html)

As capturas `phase-XX-overview.png` mostram a arte carregada. `phase-XX-structure.png` mostra apenas pisos, plataformas, obstáculos, conexões, entrada, saída e componentes após restaurar os caminhos. A escala dentro de cada mapa é uniforme e suas dimensões estão indicadas.

| Fase | Dimensões | Pisos / plataformas | Diferença estrutural |
| --- | --- | --- | --- |
| 1 Hardware | 2800 × 1000 | 3 / 17 | Horizontal, três ilhas de piso e pontes de circuito. |
| 2 Software | 1900 × 1400 | 4 / 11 | Quatro salas em dois andares, oito interfaces. |
| 3 Switch | 2200 × 1200 | 5 / 23 | Ramificações de um backplane central para portas em alturas diferentes. |
| 4 Roteador | 2200 × 1500 | 4 / 17 | Túneis LAN/roteamento/WAN, paredes e cinco conexões. |
| 5 Wi-Fi | 1550 × 2400 | 5 / 26 | Subida aberta em zigue-zague entre antenas e sinais. |
| 6 Cabeamento | 1600 × 3000 | 8 / 33 | Prédio alto fechado nas laterais, andares, shaft e elevadores. |
| 7 DHCP | 2800 × 1700 | 5 / 18 | Núcleo central e escopos laterais, oito conexões de serviço. |
| 8 DNS | 3400 × 2100 | 8 / 33 | Domínios ramificados, sala falsa, caches inferiores e 14 conexões. |
| 9 Firewall | 3600 × 1800 | 6 / 17 | Muralha externa, percursos internos e cidadela superior. |
| 10 Servidores | 6800 × 2000 | 8 / 44 | Data center longo, torres, batalha, airlock e arena elevada. |

Os 45 pares passaram. A maior interseção sobre união (IoU) das máscaras normalizadas foi **0,2675**, entre Roteador e Firewall; máscaras idênticas dariam 1. A amostragem 128 × 96 é complementada por contagens, conexões e inspeção das capturas; não mede dificuldade ou qualidade de game design.

## Interface e entrada reais

Viewports: **1920×1080, 1366×768, 1024×768, 800×600, 390×844, 360×640 e 844×390**. Os três últimos usam emulação móvel e toque do Chromium. Não há largura artificial aplicada ao corpo ou ao diálogo.

Foram capturados menu, jogo, introdução, pausa, reparo Hardware, reparo Cabeamento, reparo Wi-Fi, pergunta, habilidades e opções em cada viewport. As 70 capturas estão em [ui-snapshots](ui-snapshots/), listadas no JSON. Exemplos corrigidos: [paisagem](ui-snapshots/844x390-play-phase-01.png), [800×600](ui-snapshots/800x600-play-phase-01.png) e [habilidades móveis](ui-snapshots/390x844-skills-phase-01.png).

Teclado e toque foram enviados por `Input.dispatchKeyEvent`/`Input.dispatchTouchEvent`, com RAF real. Ambos moveram R-07 e liberaram as teclas. O salvamento foi retomado por navegação real e clique em CONTINUAR. Os estados de menu/minigame das capturas são preparados por uma ponte presente apenas na cópia temporária de testes; são cenas congeladas, não partidas contínuas.

## Problemas encontrados e corrigidos

1. **ResizeObserver:** havia `ResizeObserver loop completed with undelivered notifications`. Escritas no buffer agora são adiadas para o próximo quadro, agrupadas e evitadas quando tamanho/escala já correspondem; a observação usa o contêiner.
2. **Tamanho do Canvas:** o tamanho intrínseco do bitmap podia afetar o layout e ultrapassar a área visível. O Canvas ocupa explicitamente seu contêiner, com altura limitada também na faixa de 761–1000 px, antes sujeita a `max-height:none`.
3. **Paisagem curta:** em 844×390 os controles ficavam abaixo da tela. A disposição compacta esconde os painéis laterais e reserva espaço para o jogo e os controles.
4. **Habilidades móveis:** um grid antigo reservava somente 25 px para a descrição. Os cartões agora usam coluna flexível e texto com largura integral.
5. **Painéis compridos:** menus, perguntas e habilidades ganharam limites e rolagem. A auditoria verifica acesso aos controles, inclusive nos reparos de oito pinos.
6. **Lacunas dos testes:** erros eram coletados tarde, capturas não esperavam todas as imagens e a comparação não isolava geometria. A coleta começa antes dos scripts, imagens são aguardadas e há comparação sem arte. Respawn, escudo e temporárias têm testes explícitos ampliados.

## Testes manuais ainda necessários

- Campanha contínua com dano normal, para avaliar sobrevivência, ritmo e dificuldade; repetir sem depender de habilidades opcionais.
- Qualidade, mistura e latência do áudio ouvido de fato. A automação verifica geração e limites, não percepção auditiva.
- FPS, energia e fluidez em computadores comuns e celulares físicos; taxas simuladas não são medição de FPS nesses aparelhos.
- Android/iOS reais, gestos, barras dinâmicas e mudanças físicas de orientação.
- Firefox, Safari e outros navegadores/OS. Esta execução usou Chrome no Windows.
- Clareza das instruções e dificuldade dos minigames com pessoas, leitor de tela e sessões prolongadas.

Não há evidência para declarar o jogo “totalmente testado”. Há evidência reproduzível para os casos listados e para as correções específicas desta revisão.
