# Revisão das dez fases do BYTE RUNNER

Revisão realizada em 03/11/2026. O jogo continua com dez fases.

Execute `python tests/run_review.py` a partir da pasta do projeto. Requer Python 3 e Chrome em `C:/Program Files/Google/Chrome/Application/chrome.exe`; não instala dependências. O programa usa uma cópia temporária do jogo e um perfil isolado do Chrome, sem modificar o salvamento do jogador. Retorna código diferente de zero se alguma verificação falhar.

Os resultados detalhados estão em [review-results.json](review-results.json). [review-contact.png](review-contact.png) reúne as capturas dos mapas e dos estados do chefe; os arquivos individuais estão em `snapshots/`.

## Verificações por fase

Todas as fases passaram nas verificações abaixo. A exploração usa movimento e colisão reais, com salto básico, sem propulsores. O algoritmo procura trechos de caminhada, queda e salto entre superfícies, reavalia as rotas quando consegue reparar componentes e verifica o acesso à saída. Encontrou acesso a todas as plataformas declaradas e a todos os componentes obrigatórios.

| Fase | Identidade e percurso | Acesso, combate, checkpoints, perguntas e retomada |
| --- | --- | --- |
| 01 | Hardware, circuitos e passarelas | Passou |
| 02 | Software, arquivos e janelas | Passou |
| 03 | Switch, portas e conexões | Passou |
| 04 | Roteador, caminho inferior e passarelas alternativas | Passou |
| 05 | Wi-Fi e interferências | Passou |
| 06 | Cabeamento, subida vertical com câmera nos dois eixos | Passou |
| 07 | DHCP, plataformas móveis e travessias | Passou |
| 08 | DNS, divisórias, acessos superiores e retornos | Passou |
| 09 | Firewall, lasers e caminhos de risco | Passou |
| 10 | Servidores, relays e arena final | Passou |

Em cada mapa foram executados: renderização no início, meio e fim; teste da câmera; acesso aos reparos e às plataformas; acesso à saída; combate com os projéteis reais contra cada inimigo original; ativação e retorno nos checkpoints; limites laterais e superiores; retorno após dano fatal e, onde há poços, após queda; salvamento e restauração de reparos, inimigos e XP; bloqueio inicial da saída; pergunta errada, reinício normal e reinício após retomar o salvamento; pergunta correta e transição. A retomada após a transição foi conferida nas fases 1–9 e o salvamento da vitória na fase 10.

Foram derrotados os 37 inimigos originais nos testes de combate das fases. Há verificações separadas de ataques básicos, rápidos, blindados, voadores, atiradores e invocação do parasita; escudo do chefe dependente dos relays, três etapas de ataque e derrota por disparos; XP, escolha de habilidade, aprimoramento e restauração de escolha pendente; dano com armadura, escudo e recarga, recuperação e velocidade de reparo; movimento, salto, disparo e liberação de teclas ao perder foco; desaparecimento e retorno de plataforma temporária e transporte em plataforma móvel; redimensionamento; limite de partículas; altura do salto a 30, 60 e 144 passos por segundo. Essas verificações de sistemas passaram. A ampliação da fase final e seus testes adicionais estão descritos em [FASE10.md](FASE10.md).

## Problemas corrigidos

- Cinco plataformas extras de Hardware não tinham referência ao chão e apareciam na altura errada. Uma delas também ficava coberta por outra plataforma; sua posição foi ajustada.
- Uma passarela do Wi-Fi ficava encoberta por uma plataforma superior; foi deslocada para uma posição acessível.
- Um campo de interferência atravessava a sequência obrigatória de subida do Cabeamento. Foi reposicionado, e foi acrescentado um degrau de apoio na parte superior da mesma fase.
- A resolução lateral de colisões podia empurrar o jogador para fora do mapa depois da primeira aplicação dos limites. Agora os limites também são aplicados ao fim do movimento.
- A integração da gravidade reduzia a altura do salto em taxas menores de atualização. O deslocamento usa a velocidade média do passo; a diferença de altura medida entre 30, 60 e 144 passos/s ficou abaixo de um pixel.
- Uma resposta errada não era registrada no salvamento; recarregar permitia evitar a repetição obrigatória. A necessidade de repetir agora persiste, e a resolução da pergunta também verifica essa condição.
- Fechar durante a escolha de habilidade podia consumir o nível sem conceder a escolha. A escolha pendente agora é salva e reaberta sem consumir XP novamente.
- Redimensionar deslocava inimigos e componentes, mas não acompanhava corretamente o jogador, disparos e obstáculos temporários. Os elementos agora recebem o mesmo deslocamento do chão.
- O parasita podia procurar e corromper componentes em andares distantes. A seleção agora considera a proximidade vertical.
- O progresso da fase vertical usava apenas a posição horizontal. Agora acompanha a subida.
- A coordenada vertical do checkpoint era uma variável global implícita; passou a ser declarada no estado do jogo.
- Corrigidas duas mensagens com acentuação corrompida e uma regra CSS responsiva inválida.
- Removidos os testes antigos acionados por parâmetros da URL do arquivo de produção; a nova rotina fica separada em `tests/`.

Para reforçar a variação existente, o DNS recebeu divisórias e degraus e o Roteador passou a identificar suas rotas alternativas. O bloqueio de saída também reconhece esses tipos de mapa. Foram adicionados efeitos curtos de salto, aterrissagem e checkpoint, transições dos diálogos com respeito à preferência por movimento reduzido, limite de 240 partículas e descarte visual de partículas fora da câmera nos dois eixos.

## Limitações da verificação

- Esta foi uma revisão automatizada no Chrome headless, complementada pela inspeção visual das capturas. Não houve uma partida humana contínua do início ao fim.
- Os trechos de parkour são simulados a partir de posições alcançáveis. Os testes de combate posicionam o jogador nessas regiões e usam proteção contra dano para separar a possibilidade de derrotar o inimigo da dificuldade de sobreviver. Isso comprova funcionamento e acesso nas condições testadas, mas não mede a dificuldade para jogadores iniciantes.
- A busca de rotas usa posições amostradas das plataformas móveis, não todas as combinações de tempo de plataformas, lasers e inimigos. O ciclo móvel e o ciclo temporário têm testes específicos adicionais.
- A altura do salto foi comparada em três frequências; a busca completa de rotas utiliza passos de 1/60 s. Isso não é uma medição de FPS.
- Não foram testados aparelhos móveis físicos, multitoque, áudio audível, outros navegadores ou desempenho em computadores fracos. A correção do CSS móvel foi revisada no código, sem teste físico de toque.
- A persistência foi exercitada pelas rotinas reais de gravar e retomar no mesmo perfil isolado. Não foi simulada a interrupção forçada do processo durante uma escrita.
- Os projéteis do jogador mantêm o comportamento existente de atravessar obstáculos; os projéteis inimigos são bloqueados por sólidos. Essa assimetria permanece.

Não restaram falhas nos casos automatizados executados. Esse resultado se limita à cobertura descrita acima.
