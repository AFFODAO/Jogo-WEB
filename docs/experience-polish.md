# Fluidez, som e ritmo

O jogo usa os mapas, inimigos, sprites e diagnósticos existentes. Este passe integra apresentação, conforto e incentivos opcionais à exploração.

## Movimento e câmera

O loop visual roda com `requestAnimationFrame`. A simulação usa passos fixos de **1/120 s**, com até oito passos por quadro e descarte de atrasos maiores que 1/15 s. Isso evita grandes saltos na física após travamentos e limita o trabalho acumulado. A posição desenhada de R-07 é interpolada entre passos; teletransportes não são interpolados. Corrida usa 14 quadros/s, salto e queda 12, ataque 30, com poses de recuo e aterrissagem. As caixas de colisão e a força dos saltos continuam independentes das deformações do sprite.

A câmera antecipa até 65 pixels na direção horizontal, considera a velocidade vertical e usa amortecimento exponencial independente da taxa de quadros. Uma pequena zona morta evita oscilar com cada aterrissagem; uma margem de segurança mantém cabeça e pés visíveis em quedas. Os limites dos mapas continuam respeitados. O tremor é aplicado somente ao desenho, dura no máximo 230 ms e tem amplitude máxima de três pixels; não altera câmera lógica, colisões ou minimapa.

## Impactos e recompensas

Acertos exibem um anel curto e o dano aplicado. Golpes críticos no núcleo recebem texto e cor próprios. Impactos fortes, mudança de etapa e derrota de VIRUS ZERO usam efeitos limitados; os avisos originais, janelas de vulnerabilidade, cobertura e escudos permanecem ativos.

Ganhar XP cria um texto flutuante e realça a barra. Selecionar uma habilidade mostra seu nome e nível, com um pulso curto. Checkpoints têm som e mensagem próprios. Há limites de **16 textos**, **12 anéis**, **160 partículas** e **12 vozes simultâneas por canal de áudio**, evitando crescimento indefinido.

## Áudio original

Os efeitos e as dez ambientações são sintetizados em Web Audio. Não usam gravações, músicas ou bibliotecas de terceiros. Cada fase possui uma sequência de notas, tonalidade e andamento próprios; a ambientação de Servidores acelera durante o confronto ativo com o chefe. Os timbres são senoidais e triangulares, em volume discreto, com envelopes curtos e encerramento das vozes.

Ataque, acerto, dano, salto, aterrissagem, reparo, checkpoint, habilidade, vitória e ações dos inimigos usam frequências/envelopes distintos. O botão SOM silencia a ambientação e bloqueia novos efeitos; efeitos já iniciados terminam seu envelope curto. O áudio só começa após interação do jogador e falhas de áudio não interrompem a campanha. Pausa, diagnóstico, perguntas, escolhas e aba oculta silenciam a ambientação. Retomar troca qualquer fila anterior por uma sequência atual, sem acumular notas atrasadas.

**OPÇÕES** abre controles de volume geral, efeitos e ambientação, além de redução de efeitos e tremor. As preferências ficam em `byteRunner.experience.v1`, separadas da campanha. Abrir opções durante uma partida pausa o jogo. Ao fechar, o jogador retoma pelo menu de pausa.

## Introduções e ritmo

Cada fase nova tem uma introdução de cerca de 2,6 segundos com o ambiente visível, missão e orientação principal. Pode ser pulada com Enter, Espaço ou toque em EXPLORAR AGORA. A simulação fica congelada durante a apresentação. Retomar um save da mesma fase não repete a introdução; acessar a fase seguinte mostra a nova missão.

`src/content/pacing.js` complementa os percursos com **caches opcionais de exploração**, sobre pisos existentes, afastados de componentes, inimigos, checkpoints e obstáculos. Cada cache concede 8 XP e é salvo uma única vez nas flags do runtime. Eles dão objetivos curtos a trechos que antes serviam apenas de deslocamento, sem bloquear saídas nem substituir parkour, combate ou reparos.

A partir da fase 6, coletar três caches consecutivos, com intervalo de até 4,5 segundos entre coletas, concede mais 12 XP. O contador aparece durante a cadeia. O desafio é voluntário: perder a janela apenas reinicia a sequência, sem dano ou perda de progresso. Em salas trancadas, os caches podem depender da restauração dos sistemas; os testes verificam que são alcançáveis após os reparos relevantes.

As introduções apresentam gradualmente plataformas móveis, portas, rotas, sinais, elevadores, serviços, domínios e vigilância. Ao se aproximar de um tipo de inimigo pela primeira vez naquela sessão de fase, uma dica curta explica seu padrão e sua defesa. Os desafios mais complexos e combinações de inimigos dos mapas finais continuam intactos; o acréscimo de dificuldade deste passe é a cadeia opcional, sem aumentar arbitrariamente vida ou dano dos inimigos.

## Desempenho e conforto

O HUD é atualizado a cada 50 ms, além das mudanças imediatas de estado. Tiles e caches são desenhados apenas na região visível. A resolução do Canvas limita a escala de pixels a 1,5; o modo reduzido usa 1,25, apenas um plano de fundo e até **48 partículas**, sem tremor nem animações CSS decorativas. A preferência inicial considera `prefers-reduced-motion`. Avisos de ataque, plataformas perigosas, pontos fracos e estados dos minigames continuam visíveis nesse modo.

`src/engine/experience.js` contém preferências, efeitos, câmera e ambientação. `game.js` integra esses serviços aos eventos reais. `tools/build_art.py` continua sendo a fonte dos atlas e das velocidades de animação.

## Verificação

Execute `python tools/check_maps.py` e `python tests/run_review.py`. A regressão verifica as dez fases, combate, minigames, saves, recompensas opcionais, amortecimento da câmera, movimento em 30/60/144 Hz simulados, congelamento das introduções e limites dos efeitos/áudio. `tests/review-results.json` contém os resultados.

`python tests/capture_experience.py` captura introdução e opções com armazenamento isolado. A captura estreita limita explicitamente corpo e diálogo para compensar a largura mínima do Chrome headless.

Os testes são de lógica, renderização e limites de recursos. Não equivalem a uma medição de FPS em computadores comuns ou de latência de áudio em celulares físicos; essas medições ainda dependem de execução nos dispositivos de destino.
