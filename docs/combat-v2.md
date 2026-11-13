# BYTE RUNNER — auditoria e proposta de combate v2

**Estado: proposta para implementação posterior. Nenhuma alteração de jogabilidade faz parte desta etapa.**

Base auditada: `66731ddb71d3902566438e8792440f69157bd721`, checkout local com origem `https://github.com/AFFODAO/Jogo-WEB.git`. Auditoria em 12/11/2026. Toda interface futura, incluindo habilidades, consumo de recursos, redistribuição e mensagens de migração, deve permanecer em **português brasileiro**.

O principal problema é a multiplicação de vantagens permanentes: o ataque sustentado máximo chega a aproximadamente **10,16×** o inicial, enquanto armadura e escudo automático reduzem fortemente a exposição. Os mapas ampliados fornecem pontos suficientes para maximizar quatro habilidades de combate antes do fim da campanha. A solução proposta limita o crescimento permanente, torna especiais manuais e finitos e desacopla exploração de poder de combate. **Não aumentar HP de inimigos para compensar os aprimoramentos atuais.**

## 1. Combate atual: fórmulas, limites e DPS

### Fontes e método

Foram inspecionados:

- [`game.js`](../game.js): constantes, `ABILITIES`, `restoreSkillEffects`, escolha de habilidades, `fireProjectile`, `damagePlayer`, `damageVirus`, `updateCombat`, checkpoint, XP, snapshot e restauração.
- [`src/engine/enemies.js`](../src/engine/enemies.js): perfis, controladores realmente executados, navegação, avisos, variantes e multiplicadores direcionais.
- [`src/engine/level-runtime.js`](../src/engine/level-runtime.js), [`src/content/first-five.js`](../src/content/first-five.js), [`src/content/last-five.js`](../src/content/last-five.js), [`src/content/pacing.js`](../src/content/pacing.js): modificadores, câmeras e recompensas opcionais.
- Mapas efetivos em `src/maps/01-hardware.js` até `10-servers.js`, física compartilhada e testes relacionados, detalhados na seção 7.

O inventário das dez fases foi extraído no Chrome com perfil temporário isolado, carregando o jogo real e instrumentando sua resposta HTTP **em memória**, sem editar o jogo nem usar o armazenamento do jogador. Os números de inimigos incluem os perfis após os overrides dos mapas. O caso DNS foi conferido adicionalmente contra `tests/fixtures/dns-v3.json`, cujo hash de fonte coincide com o mapa auditado. As tabelas de DPS e níveis são cálculos, não medições de precisão, duração de combate ou desempenho humano.

### Ataque básico

Para níveis válidos de Canhão `c` e Disparo rápido `r`, entre 0 e 5:

```text
dano bruto por projétil = 1 + c
intervalo da habilidade = max(0,14; 0,32 × 0,9^r) segundos
intervalo efetivo = intervalo da habilidade × modificador ambiental
DPS bruto nominal = dano bruto / intervalo efetivo
```

O piso de `0,14 s` **não é atingido** com os cinco níveis permitidos: o menor intervalo normal é `0,1889568 s`. Não há munição, aquecimento ou custo por tiro. Segurar J dispara automaticamente. O dano é copiado para o projétil ao criá-lo.

| Nível de Canhão e Disparo rápido | Dano/tiro | Intervalo nominal | DPS bruto nominal | Multiplicador sobre 3,125 DPS |
| --- | ---: | ---: | ---: | ---: |
| 0 / 0 | 1 | 0,320000 s | 3,125 | 1,00× |
| 1 / 1 | 2 | 0,288000 s | 6,944 | 2,22× |
| 2 / 2 | 3 | 0,259200 s | 11,574 | 3,70× |
| 3 / 3 | 4 | 0,233280 s | 17,147 | 5,49× |
| 4 / 4 | 5 | 0,209952 s | 23,815 | 7,62× |
| 5 / 5 | 6 | 0,1889568 s | 31,753 | 10,16× |

Canhão 5 sozinho produz `18,75 DPS`; Disparo rápido 5 sozinho, `5,292 DPS`. A combinação é multiplicativa: `6 × 1,6935`, não um bônus aditivo de cadência e dano.

O simulador roda em passos de `1/120 s`. Como o cooldown é substituído pelo intervalo completo ao disparar, sem carregar o excesso de tempo, a aproximação estacionária é:

```text
intervalo quantizado ≈ ceil(intervalo nominal × 120) / 120
```

Sem modificadores, são aproximadamente `3,077 DPS` iniciais e `31,304 DPS` com ambos no nível 5. Contagens em janelas curtas também dependem do primeiro disparo. Não confundir esses valores com DPS contra um inimigo: colisão, mira, armadura, invulnerabilidade, distância e fases alteram o resultado.

O projétil tem velocidade inicial de `570 px/s`, vida de `1,35 s` e raio de 5 px: alcance nominal de `769,5 px`, antes de modificadores. As zonas Wi-Fi multiplicam o intervalo por `1,45` ou `1,35` e a velocidade do projétil por `0,8` ou `0,85`; esses fatores são multiplicativos no runtime, não bônus permanentes. Não foi encontrado acelerador ambiental de tiro nos dez mapas auditados.

### Dano aplicado aos inimigos

`damageVirus` faz, nesta ordem:

1. Ignora alvo morto, transição protegida do chefe e escudo do núcleo enquanto houver componente pendente.
2. Multiplica por 2 se VIRUS ZERO estiver com ponto fraco exposto.
3. Aplica `ByteRunner.enemies.damageMultiplier`.
4. Aplica armadura residual e `max(1, ceil(dano))`.
5. No chefe, limita a perda de HP ao próximo limiar de fase, quando necessário.

No blindado, o multiplicador é `0,32` pela frente, `1,5` pelas costas ou na vulnerabilidade. O campo `armor: 0,68` do perfil **não é aplicado outra vez**: o ramo de `damageVirus` zera essa armadura para o tipo `armored`. Um interceptador com `interceptTime > 0` pode ter multiplicador `0,5`.

| Alvo/situação | Tiro básico | Canhão 5 | Observação |
| --- | ---: | ---: | --- |
| Inimigo sem armadura | 1 | 6 | Muitos perfis têm só 1–3 HP |
| Blindado pela frente | 1 | 2 | `ceil(0,32 × dano)` impede redução fracionária contínua |
| Blindado pelas costas/exposto | 2 | 9 | O blindado normal tem 7 HP |
| VIRUS ZERO fora da exposição | 1 | 4 | Override do mapa: armadura de 35% |
| VIRUS ZERO exposto | 2 | 12 | Dano dobrado e armadura residual ignorada |

Consequências de limiares: Canhão 1 já mata básico e voador de 2 HP com um tiro; Canhão 2 mata atirador e parasita de 3 HP com um tiro; Canhão 4 mata o blindado padrão pelas costas com um tiro. O Canhão 5 dá cerca de `21,169 DPS` nominais no chefe protegido apenas por armadura e `63,507 DPS` durante exposição, sem descontar as janelas de ataque. Os limiares e a proteção de transição impedem pular suas fases com uma única rajada.

**Assimetria adicional encontrada:** os projéteis do jogador, em `updateCombat`, verificam inimigos, vida e limites horizontais, mas não colisão com sólidos. Os projéteis hostis verificam sólidos, com exceção do tipo `floor`, e os atiradores usam linha de visão. Assim, o jogador pode atingir através de cobertura que bloqueia a resposta inimiga. Isto reduz o valor de posicionamento independentemente dos upgrades e precisa de contrato explícito na implementação futura.

### Defesa, escudo, cura e mobilidade

```text
armadura = clamp(0,1 × nível; 0; 0,5)
dano recebido = max(1, ceil(max(0, dano de entrada) × (1 − armadura)))
```

`damagePlayer` retorna sem dano enquanto houver `damageCooldown`, jogo parado ou escudo ativo com habilidade realmente adquirida. O cooldown após acerto é de **1 s**. O arredondamento importa: um ataque de 12 causa, do nível 0 ao 5 de armadura, `12, 11, 10, 9, 8, 6`. O caso de entrada zero ou não finita ainda pode resultar em 1 de dano pelo piso atual; a API futura deve rejeitar eventos sem dano antes desse piso.

Escudo é automático, inclusive quando o jogador não está sendo atacado:

| Nível | Duração | Recarga após expirar | Ciclo completo | Fração nominal invulnerável |
| --- | ---: | ---: | ---: | ---: |
| 1 | 5,00 s | 18 s | 23,00 s | 21,74% |
| 2 | 5,75 s | 17 s | 22,75 s | 25,27% |
| 3 | 6,50 s | 16 s | 22,50 s | 28,89% |
| 4 | 7,25 s | 15 s | 22,25 s | 32,58% |
| 5 | 8,00 s | 14 s | 22,00 s | 36,36% |

Adquirir ou melhorar Escudo também o ativa imediatamente e redefine a recarga. Armadura 5 representa aproximadamente 200 HP efetivos contra dano contínuo não arredondado. Com o ciclo do Escudo 5, o modelo médio idealizado sobe para `100 / (0,5 × (1 − 8/22)) ≈ 314,3 HP efetivos`, sem contar cooldown de impacto. Não é uma previsão de sobrevivência: pressupõe ataques uniformes, sem knockback, mortes ou reposicionamento.

Não há evidência de invulnerabilidade permanente no fluxo normal atual: a expiração reinicia a recarga; sem a habilidade, `shieldTime` residual não protege; o respawn usa cooldown de impacto de 2 s e limpa o escudo. Isso já possui testes de regressão. O problema confirmado é a janela automática longa, renovável indefinidamente, e sua combinação com outras defesas.

Recuperação concede `20 + 5 × nível`: 25, 30, 35, 40 e 45 HP, até o máximo de 100. São **175 HP potenciais em cinco escolhas**, com excesso desperdiçado. Não há cura por segundo, nem reaplicação de cura em `restoreSkillEffects`. Portanto, a habilidade não cura ilimitadamente por si só. Entretanto:

- Morrer chama `respawnAtCheckpoint`, devolvendo 100 HP, preservando XP, inimigos mortos e reparos; o HP já retirado dos inimigos vivos também não é restaurado por essa função. Isso permite desgaste de encontros, inclusive do chefe, por tentativas sucessivas.
- Passagem normal de fase cura até 25 HP; repetição/retry usa integridade cheia.
- Repetir a fase após erro no quiz recria inimigos, fragmentos, flags e recompensas, mas mantém XP e habilidades. Cura e progressão precisam ser analisadas junto desse reinício, não só do botão Recuperação.

Propulsores multiplica o impulso por `1,08^nível`. A física base é salto 690, gravidade 1850 e velocidade 255. No nível 5, o impulso chega a `1013,84`, e a altura balística passa de `128,68` para `277,80 px`: **+115,9% de altura**, apesar de o impulso subir 46,9%. Os mapas e testes de travessia usam a física base sem upgrades; isso deve continuar sendo obrigatório.

## 2. Inimigos: HP, ataques e avisos efetivos

Os dados declarados não são toda a lógica. `createViruses` combina perfil e mapa; `levelRuntime.updateEnemy` tem precedência para controladores explícitos; os tipos registrados em `enemies.js` retornam antes do controlador antigo de `game.js`. Nos mapas auditados, o inventário não encontrou `controller` explícito nas entidades inimigas.

| Tipo | HP padrão | Dano/XP de perfil | Ataque efetivamente executado |
| --- | ---: | --- | --- |
| Básico (`common` vira `basic`) | 2 | 12 / 45 XP | Mesmo piso alcançável, linha de visão, perseguição; aviso mínimo **0,36 s**, cooldown 1,15 s e recuperação 0,4 s. O `windup: 0,28` declarado não prevalece sobre o mínimo do controlador. |
| Rápido | 1 | 8 / 35 XP | Aviso **0,58 s**, direção fixada, investida 0,32 s a `2,6 × 142 = 369,2 px/s`, recuo 0,7 s; cooldown efetivo **2,1 s**, não os 0,85 s do perfil. |
| Blindado | 7 | 18 / 85 XP | Aviso 0,48 s, cooldown 1,8 s, recuperação 0,4 s e núcleo vulnerável por 1,35 s; ataque frontal/traseiro conforme seção 1. |
| Voador | 2 | 10 / 55 XP | Aproximações em três alturas, aviso **0,75 s**, mergulho 0,48 s a 2,2× velocidade, recuperação 0,65 s; cooldown efetivo 2,4 s. |
| Atirador | 3 | 10 / 60 XP | Reposiciona por piso e visibilidade, recua a curta distância; mira fixada em aviso **0,7 s**, recuperação 0,35 s, cooldown 2,2 s; projétil a 285 px/s. |
| Parasita | 3 | 7 declarado / 70 XP | O controlador não usa esse dano como ataque direto regular: infecta componente a 8 pontos/s, fortalece aliados e anuncia invocação por 1 s. Limite de dois reforços vivos e quatro no total por pai. |
| Chefe genérico | 28 | 20 / 250 XP | Perfil-base, **não** os valores finais de VIRUS ZERO. |
| VIRUS ZERO do mapa 10 | **90** | 18 declarado / **500 XP** | Controlador próprio de três fases; armadura 0,35; velocidade 58. O dano dos ataques é definido pelo padrão, não simplesmente pelo campo `damage`. |

Os básicos/blindados verificam alcance e visibilidade ao executar o golpe. Suporte parasita pode aumentar dano de melee em 25% e velocidade no controlador terrestre em 30%; não assumir que todos os handlers multiplicam todos os atributos. O perfil do blindado declara a especialidade de barreira, mas o ramo antigo que cria essa barreira não é alcançado pelo controlador registrado desse tipo. Preservar distinção entre configuração declarada e comportamento observado no código.

### Distribuição real na campanha

B = básico; R = rápido; BL = blindado; V = voador; A = atirador; P = parasita; C = chefe. São entidades originais, sem invocações.

| Fase | B | R | BL | V | A | P | C | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 Hardware | 6 | 2 | 2 | 0 | 3 | 0 | 0 | 13 |
| 2 Software | 7 | 3 | 3 | 0 | 3 | 0 | 0 | 16 |
| 3 Switch | 7 | 3 | 3 | 0 | 4 | 1 | 0 | 18 |
| 4 Roteador | 11 | 2 | 4 | 0 | 4 | 0 | 0 | 21 |
| 5 Wi-Fi | 10 | 2 | 4 | 2 | 4 | 0 | 0 | 22 |
| 6 Cabeamento | 10 | 2 | 11 | 0 | 7 | 0 | 0 | 30 |
| 7 DHCP | 12 | 1 | 4 | 0 | 5 | 0 | 0 | 22 |
| 8 DNS | 11 | 2 | 5 | 0 | 6 | 0 | 0 | 24 |
| 9 Firewall | 2 | 4 | 7 | 4 | 8 | 0 | 0 | 25 |
| 10 Servidores | 3 | 6 | 6 | 5 | 11 | 1 | 1 | 33 |

Total: **224 inimigos originais**, dos quais quatro no desvio DNS são opcionais. As exceções de HP/XP são esses quatro: blindado 11 HP/110 XP, dois atiradores de 4 HP/80 XP e rápido de 3 HP/110 XP. Os demais inimigos regulares usam os valores da tabela de perfis; VIRUS ZERO usa seu override de 90 HP/500 XP.

### Variantes e chefe que precisam permanecer significativos

- **Software:** sete básicos com variante de arquivo; cada um pode gerar um fork anunciado de 0,9 s após sofrer dano. Um tiro que já o mate pode impedir essa oportunidade.
- **Switch:** quatro atiradores interceptam no máximo um projétil por preparação; devolvem disparo com dano +2 e velocidade 210. Tiros rápidos subsequentes podem atravessar essa defesa limitada.
- **Wi-Fi:** dois voadores lançam sinais de dano 6 e lentidão de 0,7 s durante o mergulho; a interferência de movimento não reduz o salto.
- **DNS:** seis atiradores podem produzir eco 0,4 s após o disparo, na mesma mira fixada.
- **Firewall:** sete blindados têm contramedida anunciada de 0,8 s, disparo de dano 10 a 210 px/s e exposição do núcleo por 1 s.
- **Câmeras/obstáculos:** não entram no inventário de inimigos/XP; câmeras usam dano 10 e projéteis a 260 px/s, com aviso e desativação por reparo. Hazards possuem contratos próprios de período e dano.

VIRUS ZERO continua exigindo todos os 12 reparos, com limiares de HP em **60,3 e 30,6** (67% e 34%) e proteção de transição de 0,6 s. Padrões: fase 1, impacto/investida; fase 2, rajada/surto; fase 3, combinação/investida/surto/rajada. Avisos de 1,05/0,85/0,8 s por fase. Impacto causa 16 ou 22; investida causa 18 e dura 0,48 s a 460 px/s; rajada tem 3 ou 5 projéteis, dano 10 ou 12 e velocidade 245 ou 310. Cobertura interrompe investida e expõe o ponto fraco por 1,8 s. Invocação nas fases avançadas tem aviso de 0,9 s; há limite de reforços vivos, mas não de invocações totais do chefe. A pergunta final e a vitória persistida devem permanecer obrigatórias.

## 3. XP e aquisição de upgrades nas dez fases

### Economia atual

- Inimigo original: XP do perfil/override; reforço derrotado: **12 XP**. Morte repetida da mesma instância já morta não recompensa outra vez.
- Reparo normal: **30 XP**; objetivos de reparos, limpeza e saída: até **100 XP cada**, uma vez por instância carregada da fase.
- Fragmento: **20 XP**.
- Cache de exploração: **8 XP**; a partir da fase 6, cada trio em cadeia, com intervalo menor que 4,5 s entre coletas, pode acrescentar 12 XP. Flags impedem recolher o mesmo cache na mesma instância/salvamento.
- Perguntas não concedem XP adicional pelo acerto; liberam progressão. Erro com repetição recria a fase e suas fontes de recompensa.

**Exceção DNS:** `defeatAllViruses: false`; os 20 guardiões obrigatórios são exigidos por uma meta explícita. Não há bônus genérico de 100 XP por limpeza. Os quatro opcionais somam 380 XP. Assim, são 200 XP de bônus de objetivos, não 300.

O piso estrutural abaixo soma apenas reparos, inimigos exigidos e bônus de objetivos. Não é uma rota mínima medida: fragmentos/caches no caminho podem acrescentar XP inevitável. “Exploração completa” soma todos os inimigos originais, fragmentos e caches gerados no início da fase, sem cadeias nem reforços. Não certifica que uma única rota recolha todos sem tentativas extras.

| Fase | Reparos | Fragmentos | Caches | XP inimigos originais, todos | Piso estrutural | XP de exploração completa |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 Hardware | 4 | 26 | 5 | 690 | 1.110 | 1.670 |
| 2 Software | 5 | 25 | 5 | 855 | 1.305 | 1.845 |
| 3 Switch | 6 | 53 | 1 | 985 | 1.465 | 2.533 |
| 4 Roteador | 6 | 40 | 5 | 1.145 | 1.625 | 2.465 |
| 5 Wi-Fi | 6 | 39 | 2 | 1.210 | 1.690 | 2.486 |
| 6 Cabeamento | 7 | 54 | 4 | 1.875 | 2.385 | 3.497 |
| 7 DHCP | 6 | 38 | 7 | 1.215 | 1.695 | 2.511 |
| 8 DNS | 7 | 56 | 9 | 1.490 — 1.110 obrigatórios | 1.520 | 3.092 |
| 9 Firewall | 8 | 40 | 10 | 1.525 | 2.065 | 2.945 |
| 10 Servidores | 12 | 57 | 10 | 2.360 | 3.020 | 4.240 |
| **Total** | **67** | **428** | **58** | **13.350** | **17.880** | **27.284** |

Para conferir: `XP exploração = XP inimigos + 30 × reparos + 20 × fragmentos + bônus objetivos + 8 × caches`. O piso DNS usa os 1.110 XP dos guardiões exigidos. As dez fases têm 2.900 XP de bônus de objetivos no total. Sem caches, a exploração completa dá 26.820 XP; caches acrescentam 464.

O teto aritmético adicional das cadeias, sem provar tempos de rota, é 144 XP: fases 6–10 acrescentariam 12/24/36/36/36. Forks e parasitas regulares permitem até mais 180 XP: sete forks na fase 2 e quatro reforços por parasita nas fases 3 e 10. Somados, esses extras limitados chegam a **27.608 XP**, antes de repetições e farm do chefe. Invocações de VIRUS ZERO e repetição de fase tornam o XP total **não limitado por esse inventário**.

### Curva e escolhas disponíveis

```text
XP necessário para sair do nível L = 100 + 45 × (L − 1)
XP acumulado para n subidas = 100n + 22,5n(n − 1)
```

Uma subida consome XP, incrementa o nível e oferece até três escolhas. Não há limite de equipamentos: habilidades já adquiridas continuam juntas. Enquanto existem habilidades novas e aprimoramentos, a oferta prioriza até duas novas e completa com upgrades embaralhados; depois pode preencher vagas restantes com novas. Não há garantia geral de obter uma build específica na primeira oferta.

| Fase concluída | XP acumulado do piso | Escolhas acumuladas possíveis | XP acumulado com exploração | Escolhas acumuladas possíveis |
| --- | ---: | ---: | ---: | ---: |
| 1 | 1.110 | 5 | 1.670 | 7 |
| 2 | 2.415 | 8 | 3.515 | 10 |
| 3 | 3.880 | 11 | 6.048 | 14 |
| 4 | 5.505 | 14 | 8.513 | 17 |
| 5 | 7.195 | 16 | 10.999 | 20 |
| 6 | 9.580 | 18 | 14.496 | 23 |
| 7 | 11.275 | 20 | 17.007 | 25 |
| 8 | 12.795 | 22 | 20.099 | 28 |
| 9 | 14.860 | 24 | 23.044 | 30 |
| 10 | 17.880 | 26 | 27.284 | 33 |

“Escolhas possíveis” é a quantidade de thresholds que o XP comporta, assumindo que as escolhas pendentes sejam resolvidas; não é um registro de uma campanha jogada. O nível correspondente é escolhas + 1. O nível 1 começa sem escolha gratuita.

Maximizar Canhão, Cadência, Armadura e Escudo exige 20 escolhas, ou **10.550 XP**. Esse orçamento cabe na exploração até a fase 5 ou no piso acumulado até a fase 7. Um único investimento de cinco ranks custa 950 XP acumulados: se Canhão aparecer primeiro e o jogador insistir nele, seus aprimoramentos podem ser oferecidos sucessivamente e chegar ao máximo ainda na fase 1.

Existem 35 ranks totais, custando 30.275 XP para obter todos. A exploração finita calculada não maximiza os sete skills: permite 33 escolhas. Portanto, não confundir “várias habilidades máximas” com “todas já máximas em qualquer percurso”. Repetição e farm podem preencher a diferença. Depois de não haver escolhas, o código ainda pode consumir thresholds e aumentar o nível, sem conceder novo poder.

## 4. Riscos de combinação e prioridades da revisão

| Prioridade | Risco confirmado | Implicação |
| --- | --- | --- |
| P0 | Canhão e cadência multiplicam DPS em 10,16× | Vários inimigos perdem a oportunidade de executar seus avisos; não corrigir aumentando HP |
| P0 | Escudo automático + 50% de armadura + cooldown de impacto | A exposição deixa de depender de decisão, timing e posição |
| P0 | Morte cura por completo sem restaurar HP dos inimigos vivos | Tentativas podem desgastar um encontro preservando a vantagem já causada |
| P0 | Repetição por erro no quiz recria fontes mantendo progressão | Economia de aprimoramentos pode ser cultivada sem limite de fase |
| P0 | Invocações totais do chefe sem limite e com recompensa de 12 XP | Farm de reforços pode eliminar a limitação natural de escolhas |
| P1 | Projéteis do jogador ignoram sólidos | Cobertura vira proteção unilateral e pode dispensar aproximação |
| P1 | Boost 5 mais que dobra a altura de salto | Pode contornar rotas e sinalização; nunca exigir essa habilidade para concluir mapas |
| P1 | Upgrade de Escudo recarrega a proteção imediatamente | Pontos/níveis guardados podem renovar defesa em momentos oportunos |
| P1 | Arredondamento por impacto muda fortemente os limiares | Bônus fracionário de dano não equivale a bônus fracionário de DPS: `ceil(1,1)` já vira 2 |

Já existe um custo de oportunidade por gastar cada escolha em uma habilidade; o que falta é um limite de poder equipado, custo de recursos e incompatibilidades relevantes. Não afirmar que os ranks são infinitos ou que a defesa atual é literalmente permanente.

Reparo eficiente também participa da economia: no sistema interativo, aumenta dicas e tolerância a falhas; no legado, reduz a duração de `0,8` para `0,4 s` no máximo. Não tratar essa redução como tempo universal dos novos minigames. Recuperação disputa escolhas, mas não resolve o problema das curas repetíveis por reinício.

## 5. Proposta de limites de poder — valores para a primeira implementação

Os valores seguintes são **alvos de projeto**, ainda não implementados nem validados em sessões humanas. Preservar HP atuais, formas de esquiva e requisitos de objetivos. Primeiro ajustar poder do jogador, colisão e economia; depois avaliar encontros.

### Orçamento e equipamento

1. Limitar a **11 pontos de aprimoramento** por campanha: dois disponíveis ao concluir o primeiro marco de treinamento da fase 1, mais um ao liberar pela primeira vez cada fase 2–10 pela progressão normal. Assim, o orçamento final já pode ser usado antes de enfrentar VIRUS ZERO. O registro de cada marco é persistente; repetir quiz, fase ou carregar save não concede outro ponto.
2. XP de inimigos, exploração e reparos continua sendo feedback de progressão/maestria, mas **não compra poder sem limite**. O nível de maestria pode continuar subindo; pontos de combate dependem dos marcos. Uma implementação deve garantir que esse primeiro treinamento seja acessível na rota base, sem adicionar salto obrigatório.
3. Máximo de **dois passivos de combate equipados e um especial equipado**. Armadura, Cadência e Propulsores disputam os dois passivos; Canhão e Escudo disputam o especial. Ranks de progressão limitados a três; a Recuperação antiga vira a carga finita de cura, sem cura por compra de rank. Alternar equipamento só em checkpoint seguro, fora de combate; trocar, melhorar ou redistribuir não cura, não ativa escudo e não devolve recurso gasto.
4. Reparo e opções de acessibilidade não devem consumir os dois slots de combate nem modificar dano/cadência. Manter dica e tolerância dos minigames separadas da dificuldade de luta.

### Limites quantitativos

| Sistema | Limite proposto | Custo/contrapartida |
| --- | --- | --- |
| Tiro básico | **1 de dano**, sem crescimento passivo de Canhão | Conserva limiares atuais dos inimigos; sem munição para o ataque básico |
| Cadência | Intervalo final mínimo **0,28 s**, depois de todos os modificadores | Máximo nominal ≈3,571 DPS básico; upgrades sugeridos 0,31/0,295/0,28 s; sem acumular aceleradores além do teto |
| Armadura | Ranks de **8%, 14%, 20%**, teto global 20% | Ocupa um passivo; mostrar/testar dano inteiro efetivo, não prometer exatamente 20% em todo impacto |
| Canhão especial | Disparo manual de **3 de dano bruto**, preparação 0,35 s e recuperação mínima 2 s | Custa 25 de energia; exige escolher janela/posição. Mesmo pipeline direcional e ponto fraco, sem multiplicador oculto extra |
| Escudo especial | Manual, **um impacto ou 0,6 s**, o que vier antes; recarga mínima de 10 s | Custa 50 de energia; não se ativa sozinho nem ao subir de nível |
| Energia dos especiais | **100 por fase na primeira entrada**, sem regeneração passiva | Quatro disparos carregados **ou** dois escudos **ou** uma combinação limitada; consumo persistente, sem reabastecer por morte, menu, save/load ou quiz |
| Cura em combate | **Uma carga de 20 HP por fase**, sem regeneração e sem cura ao adquirir rank | Carga registrada por ID da fase; sem reposição por respec, morte, repetição ou reload |
| Proteção após impacto | Alvo inicial **0,65 s**, independente do escudo | Não somar durações indefinidamente; validar encontros com múltiplos projéteis |
| Proteção de respawn | Até **1,5 s**, encerrada no primeiro ataque do jogador | Não converter em escudo adquirido; não permitir disparo ofensivo protegido repetível |
| Mobilidade | Salto base **690** e gravidade **1850** preservados | Propulsores passa a opção de controle aéreo, até +15%, sem aumentar altura obrigatória nem liberar salto adicional |

O limite do tiro básico é intencional: manter base 1 e acrescentar um “pequeno” bônus fracionário sob o `ceil` atual já pode dobrar o dano contra inimigos comuns. Canhão deixa de ser passivo e vira uma ação forte, manual e com orçamento finito. Alterações de arredondamento devem ser explícitas e cobertas por testes, sem introduzir aumento disfarçado.

Com apenas cadência no teto, o ataque básico cresce aproximadamente 14,3% nominalmente, em vez de 916%. No passo de 120 Hz, `0,28 s` ocupa aproximadamente 34 ticks, ou 3,529 tiros/s; a comparação deve usar a mesma simulação para base e build. Um especial exposto no chefe pode causar 6 de dano bruto antes dos demais passos aplicáveis, mas seu número de usos é limitado.

A energia e a cura são orçamentos de campanha por fase, não bônus de login. Se futuramente houver estação de recarga, ela precisa de ID e consumo único persistente, com teto total previamente incluído no orçamento; não incluir recarga repetível na primeira versão. As constantes são da simulação do jogo, não recomendações de hardware ou segurança real.

### Morte, XP e encontros

- A morte continua permitindo retry justo no checkpoint, mas **restaura o encontro ativo**, inclusive HP/fase do chefe ao snapshot de início desse encontro. Preservar reparos, objetivos anteriores, plataformas e inimigos de encontros já concluídos. Isso remove o desgaste por mortes sem apagar a campanha.
- Restaurar HP no início de uma tentativa não é uma cura utilizável dentro da luta. Não permitir reset voluntário preservar dano no chefe ou devolver consumíveis. O orçamento de especiais precisa permitir vencer com ataque básico quando esgotado.
- Registrar recompensas por identidade estável `(phaseId, entityId/tipoDeEvento)`, incluindo inimigo original, reparo, fragmento, cache e bônus de objetivo. Recarregar ou repetir não pode conceder novamente o mesmo prêmio de progressão.
- Reforços gerados durante combate não concedem pontos de combate. Proposta inicial: **zero XP de progressão** para invocações/forks; se houver pontuação visual, ela não compra poder nem cura. Manter limites vivos e avisos existentes.
- Quiz continua obrigatório. Repetição mantém a função pedagógica e os objetivos previstos; não cria novo orçamento de cura, energia ou pontos.

### Sensação de combate e inimigos

- Manter os HP de perfis e overrides atuais; básico de 2 HP continua exigindo dois tiros básicos, rápido de 1 HP continua frágil. Não remover a identidade de cada tipo com vida artificialmente maior.
- Preservar avisos existentes de 0,58 s no rápido, 0,7 s no atirador, 0,75 s no voador e 0,8–1,05 s no chefe. Ataques de melee devem continuar tendo preparação legível de pelo menos 0,35 s. Não adicionar dano de contato silencioso por trás desses avisos.
- Manter mira/direção fixadas durante a preparação, verificações de alcance na execução, interrupção por cobertura e janelas de recuperação. Evitar homing oculto para compensar menor poder ofensivo.
- Unificar o contrato de cobertura para projéteis amigos e hostis: bloquear em geometria opaca definida explicitamente, com testes para pisos, paredes, portas e plataformas atravessáveis. Não ativar colisão indiscriminada sem conferir todos os encontros alcançáveis.
- Bloqueio por recarga deve ter retorno visual/sonoro e comando ignorado não deve gastar energia. Input durante pausa/reparo não produz ação ao retornar; o ataque básico continua responsivo.
- Os dez mapas devem continuar concluíveis com física base e **sem Propulsores**. A arena final deve ser vencível sem escudo/curas disponíveis; especiais facilitam uma janela, não são chave obrigatória.
- Texto proposto: “DISPARO CARREGADO”, “ENERGIA INSUFICIENTE”, “ESCUDO ESGOTADO”, “CURA DISPONÍVEL: 1”, “REDISTRIBUIR APRIMORAMENTOS”. Não apresentar implementação, versão do save ou termos de depuração no fluxo do jogador.

## 6. Migração de saves

### Contrato atual e riscos

A chave é `byteRunner.campaign.v1` — ou a chave isolada do modo procedural — e o documento exige `version: 1`. `getSavedCampaign` rejeita outra versão; apenas trocar o número ou o nome da chave faria o progresso parecer perdido.

O snapshot contém fase/ID/revisão do mapa, nível, XP e threshold, ranks, HP/posição, tempos de escudo, inimigos com HP e memória de invocação, arrays de reparos/fragmentos, flags do runtime, checkpoints, objetivos, pergunta pendente e conclusão. Os atributos de combate são recalculados dos ranks em `restoreSkillEffects`; a cura de Recuperação não é reexecutada no load.

O loader limita ranks por habilidade, mas não deduplica IDs, não exige ranks inteiros e não verifica finitude de todos os números. Nível/XP inválidos, campos em string e duplicatas precisam ser normalizados. Duplicatas não somam automaticamente todos os efeitos: vários atributos são sobrescritos em sequência, enquanto escolhas procuram a primeira ocorrência; isso pode gerar inconsistência.

`attackCooldown` e `damageCooldown` não são salvos; `loadMap` os zera. O load de mesma revisão restaura os timers do escudo com limites, incluindo o sentinel `-1`. Mudança de revisão pode reiniciar entidades mantendo XP/habilidades; retry por derrota/quiz também reinicia a fase. O histórico de perguntas e preferências usam chaves próprias e não devem ser apagados.

### Requisitos da implementação v2

1. **Despachar formatos v1 e v2:** manter descoberta do save existente; introduzir `combatRulesVersion: 2` e formato raiz v2 com leitura explícita de v1. Não usar `mapRevision` como versão de balanceamento nem incrementar revisão de mapa para forçar reset de combate.
2. Fazer backup do snapshot v1 antes da primeira gravação v2. Migração idempotente: executá-la de novo não cria pontos, cura, cargas ou recompensas. Em falha de armazenamento, preservar o original e oferecer retomada segura, sem sobrescrever dados parcialmente convertidos.
3. Validar números finitos, ranks inteiros, intervalos e enums; remover habilidades desconhecidas; deduplicar por ID com política explícita, sugerida maior rank válido. Recalcular dano, cadência, armadura e salto da configuração v2, nunca de campos numéricos recebidos.
4. Preservar `phaseId`, maior fase liberada, reparos, objetivos, fragmentos, checkpoints, flags, quiz e conclusão. Converter arrays para identidades estáveis com o mapa de **mesma revisão**; não reinterpretar índices contra geometria diferente. Não conceder reparo ou resposta correta durante migração.
5. Preservar HP válido de inimigos, inclusive HP fracionário nos limiares de VIRUS ZERO, e manter todos os requisitos dos 12 reparos. Não derrotar o chefe nem abrir a pergunta por migrar. Não restaurar consumo/recursos alterando `savedAt` ou esperando offline.
6. Arquivar ranks e XP legados como histórico de maestria. Converter disponibilidade inicial de ranks por `min(3, ceil(rankV1/2))`, mas **não equipar tudo automaticamente**. Abrir redistribuição pausada dentro do teto de pontos obtidos pelos marcos; excesso legado vira histórico/opções desbloqueadas, não cura, munição, energia ou pontos ilimitados.
7. Derivar pontos de combate de marcos concluídos e do treinamento acessível na fase 1, não de `saved.level` ou XP potencialmente cultivado. Resolver o caso de jogador no meio da fase 1 sem ponto de treinamento já registrado; oferecer o treinamento seguro sem repetir recompensas.
8. Preservar uma escolha pendente sem consumir threshold novamente. Converter seu significado para a alocação v2 quando houver orçamento; uma escolha além do teto fica registrada como maestria, sem criar poder extra. Não reabrir infinitamente o mesmo respec ao recarregar.
9. Para o ledger inicial, marcar fases anteriores já concluídas como premiadas. Na fase atual, usar inimigos mortos, reparos, fragmentos e flags `rhythm:*` para marcar recompensas já recebidas. O v1 não guarda histórico completo de todos os resets: não é possível reconstruir perfeitamente o XP de origem. Preservar o valor como histórico e impedir novos pagamentos duplicados a partir da migração.
10. Remover o ciclo automático do escudo. Converter temporizadores para estado manual com cooldown e recurso limitados; sentinel negativo não pode disparar proteção gratuita. A primeira concessão do orçamento v2 precisa de flag persistente por fase, para não reabastecer em cada load. Respec, aquisição e aplicação de efeitos não ativam especiais nem curam.
11. Apresentar a redistribuição com simulação pausada, em posição/checkpoint seguro quando necessário, e texto pt-BR: “O combate foi reequilibrado. Seu progresso foi mantido; redistribua seus aprimoramentos.” A saída desse fluxo não oferece imunidade permanente nem muda a vida do chefe silenciosamente.
12. Salvar consumo, equipamento, cooldown restante e estado de encontro necessário a retry justo. Pausa, modal, perda de foco, recarga de página e aba oculta precisam seguir o mesmo relógio de simulação; nenhuma recarga offline automática na proposta inicial.

## 7. Plano de regressão e critérios de aceitação

### Base existente a preservar/adaptar

- [`tests/review.js`](../tests/review.js): escolha pendente, efeitos de habilidades, dano/escudo/cura, controles, combate, salto, checkpoint, save, fases do chefe, esquivas, ponto fraco e pergunta final. Vários asserts codificam **os valores v1**; precisam de baseline legado e novos asserts v2, não simples remoção das falhas.
- [`tests/enemies.js`](../tests/enemies.js): piso/linha de visão, dash e esquiva, armadura direcional, mira travada, voador, parasita, variantes, XP único e limites de invocação persistidos.
- [`tests/audit.js`](../tests/audit.js): escudo residual sem habilidade não concede invulnerabilidade. [`tests/final-maps.js`](../tests/final-maps.js): proteção de respawn expira.
- [`tests/experience.js`](../tests/experience.js): passo fixo, intro/pausa e caches recompensados uma vez. [`tests/last-five.js`](../tests/last-five.js): restauração da infraestrutura, checkpoints, câmera/laser, escudo e cobertura do chefe, saves antigos.
- `tests/hardware-v3.js` até `tests/servers-v3.js`, testes de travessia e geração: mapas ainda navegáveis sem upgrades de mobilidade. Alguns testes de combate usam `damageCooldown = 99999`; provam alcançabilidade/colisão, **não balanceamento de sobrevivência**.
- [`tests/repairs-servers-v2.js`](../tests/repairs-servers-v2.js) e demais reparos: XP de reparo único, congelamento do mundo, integridade, save, todos os relés do chefe e vitória. A revisão de combate não pode alterar os minigames nem sua conclusão normal.
- `tests/ui-bridge.js` e auditorias de navegador: reabertura, armazenamento, controles e modais. Perfis de teste sempre isolados do save real.

### Casos novos obrigatórios

| Grupo | Casos e resultados exigidos |
| --- | --- |
| Fórmulas | Matriz de todos os ranks/equipamentos válidos; limites após modificadores; zero/negativo/NaN/Infinity; dano inteiro e limiares; tiros em voo mantêm o dano da criação |
| DPS | Simular 30/60/120/144 Hz de render com passo fixo; contar disparos em 60 s e descontar o primeiro tiro; nenhum equipamento ultrapassa o intervalo mínimo final de 0,28 s |
| Armadura | Todos os ataques reais — melee, projétil, câmera, especial do chefe — com teto 20%; dano mínimo apenas para evento positivo; nenhuma dupla redução direcional do blindado |
| Especiais | Manualidade, preparação, consumo antecipado e recuperação; energia 100 suporta no máximo quatro canhões ou dois escudos; pressionar durante cooldown/pausa não gasta nem enfileira ação indevida |
| Invulnerabilidade | Escudo expira em 0,6 s ou um impacto; hit cooldown e respawn expiram; sem soma ilimitada, autoativação, recarga por upgrade, sentinel negativo ou proteção de habilidade inexistente |
| Cura | Uma carga de 20 HP por fase; teto de HP; zero cura ao aprender/reaplicar/redistribuir; morte, quiz, reload e migração não recriam cargas |
| Economia | Auditoria das dez fases, incluindo DNS de 20 guardiões/200 XP de bônus; ledger por evento; repetir quiz não aumenta pontos; invocações sem XP de progressão; caches/cadeias sem pagamento duplicado |
| Escolhas | Dois passivos e um especial; três ranks; 11 pontos de campanha; ofertas válidas para jogador novo, veterano, orçamento esgotado e escolha pendente |
| Saves | Fixtures reais v1 novas, intermediárias e máximas; duplicatas/frações/strings inválidas; restauração v2; idempotência; storage cheio; backup; reload durante alocação, escudo e chefe; chaves de preferências preservadas |
| Geometria | Projéteis amigos/hostis contra paredes, portas, pisos e one-way; nenhuma vitória atirando através de parede opaca; todos os inimigos exigidos continuam alcançáveis e elimináveis |
| Esquiva | Rápido, tiro fixado, mergulho, contramedida e combinação final evitáveis com física base; avisos antes do dano, legíveis também sem áudio e com efeitos reduzidos |
| Morte/encontro | Retry restaura o encontro ativo sem manter dano parcial no chefe; conserva reparos e encontros anteriores; não devolve energia/cura/pontos; checkpoint nunca prende o jogador |
| VIRUS ZERO | Todos os 12 relés necessários; HP 90, limiares 67%/34%, proteção de transição, cobertura/ponto fraco, invocações limitadas em simultâneo, pergunta final e conclusão persistida; nenhum minigame o derrota |
| Interface | Mouse, toque e teclado; nomes, limites e causas de bloqueio em pt-BR; HUD distingue cooldown, energia, cura e proteção; nenhum detalhe técnico de migração vaza no fluxo normal |

### Ordem de implementação e liberação

1. Congelar fixtures e contratos v1; acrescentar leitor/migrador v2 e ledger antes de mudar recompensas ou atributos.
2. Centralizar cálculo de atributos e dano; aplicar tetos e equipamento sem alterar HP, mapas ou avisos inimigos.
3. Introduzir especiais manuais/recursos finitos e novas regras de cura/retry, com testes de consumo e persistência.
4. Corrigir o contrato de colisão/visibilidade e verificar novamente todos os caminhos e inimigos obrigatórios.
5. Executar suites relevantes por meio de `python tests/run_review.py`, revisões focadas existentes e testes novos de migração/combat-v2 quando implementados. Não usar flags de foco inexistentes como evidência de aprovação.
6. Realizar campanhas humanas com build básica, ofensiva, defensiva e suporte, nas dez fases. Registrar tempo de luta, acertos recebidos/evitados, mortes, uso de especiais, consumo de cura e escolhas por fase. O inventário de XP não substitui essa avaliação.

Critérios de liberação: nenhuma travessia exige Propulsores; nenhum chefe exige consumível restante; primeira correspondência de dano/armadura é determinística; não há cura ou proteção ilimitada dentro do encontro; não há farm de poder por retry; os saves v1 continuam utilizáveis e os objetivos/quiz final permanecem intactos. Ajustar encontros por posição, cobertura, avisos e composição — nunca por multiplicar HP para perseguir builds excessivas.

### Validação realizada nesta etapa

Leitura de fontes e testes, extração dos dez mapas no runtime isolado, conferência da fixture DNS e cálculos independentes das tabelas. **A suíte completa de jogabilidade não foi executada nesta auditoria documental; os valores propostos não foram implementados.** A única entrega de repositório desta etapa é este documento.
