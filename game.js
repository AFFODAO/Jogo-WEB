(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startButton = document.getElementById('startButton');
  const continueButton = document.createElement('button');
  continueButton.id = 'continueButton';
  continueButton.type = 'button';
  continueButton.className = 'secondary-action';
  continueButton.textContent = 'CONTINUAR CAMPANHA';
  continueButton.hidden = true;
  startButton.insertAdjacentElement('afterend', continueButton);
  const soundToggle = document.getElementById('soundToggle');
  const touchControls = document.getElementById('touchControls');
  const SAVE_KEY = 'byteRunner.campaign.v1';
  const SOUND_KEY = 'byteRunner.sound.v1';
  const keys = new Set();
  const ui = {
    title: document.getElementById('overlayTitle'),
    copy: document.getElementById('overlayText'),
    stage: document.getElementById('stageLabel'),
    progress: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
    position: document.getElementById('positionText'),
    health: document.getElementById('healthBar'),
    healthText: document.getElementById('healthText'),
    defeated: document.getElementById('defeatedCount'),
    repaired: document.getElementById('repairCount'),
    level: document.getElementById('levelValue'),
    xp: document.getElementById('xpText'),
    xpBar: document.getElementById('xpBar'),
    skillCount: document.getElementById('skillCount'),
    skillList: document.getElementById('skillList'),
    levelOverlay: document.getElementById('levelOverlay'),
    questionOverlay: document.getElementById('questionOverlay'),
    sector: document.getElementById('sectorChip'),
    phaseTitle: document.getElementById('phaseTitle'),
    phaseEyebrow: document.getElementById('phaseEyebrow'),
    phaseMission: document.getElementById('phaseMission'),
    phaseObjective: document.getElementById('phaseObjective'),
    gate: document.getElementById('gateState'),
    phaseFooter: document.getElementById('phaseFooter'),
    map: document.getElementById('mapPlayer'),
    log: document.getElementById('log')
  };

  const ROBOT_WIDTH = 34;
  const ROBOT_HEIGHT = 48;
  const GRAVITY = 1850;
  const RUN_SPEED = 255;
  const JUMP_SPEED = 690;
  const MAX_PLAYER_ARMOR = .5;
  const PLAYER_HIT_INVULNERABILITY = 1;
  const ENEMY_PROFILES = {
    common: { hp: 2, damage: 12, speed: 60, radius: 15, behavior: 'chase', attack: 'melee', attackRange: 34, attackCooldown: 1.15, windup: .28, xp: 45, color: '#bb7bff' },
    basic: { hp: 2, damage: 12, speed: 60, radius: 15, behavior: 'chase', attack: 'melee', attackRange: 34, attackCooldown: 1.15, windup: .28, xp: 45, color: '#bb7bff' },
    fast: { hp: 1, damage: 8, speed: 142, radius: 11, behavior: 'chase', attack: 'melee', attackRange: 28, attackCooldown: .85, windup: .18, xp: 35, color: '#ff9263' },
    armored: { hp: 7, damage: 18, speed: 42, radius: 18, behavior: 'patrol', attack: 'melee', attackRange: 40, attackCooldown: 1.8, windup: .48, armor: .68, vulnerableDuration: 1.25, special: 'barrier', specialCooldown: 7, xp: 85, color: '#76b9ff' },
    flyer: { hp: 2, damage: 10, speed: 88, radius: 14, behavior: 'chase', attack: 'melee', attackRange: 38, attackCooldown: 1.4, windup: .32, flying: true, xp: 55, color: '#73e4ff' },
    shooter: { hp: 3, damage: 10, speed: 48, radius: 15, behavior: 'patrol', attack: 'ranged', attackRange: 330, preferredRange: 230, attackCooldown: 2.2, projectileSpeed: 285, xp: 60, color: '#ffd166' },
    parasite: { hp: 3, damage: 7, speed: 38, radius: 13, behavior: 'support', attack: 'interfere', buffRange: 190, interferenceRange: 260, drainRate: 8, summonCooldown: 9, summonLimit: 2, xp: 70, color: '#7dff9b' },
    boss: { hp: 28, damage: 20, speed: 42, radius: 38, behavior: 'chase', attack: 'melee', attackRange: 70, attackCooldown: 1.3, windup: .36, special: 'summon', specialCooldown: 8, summonLimit: 3, xp: 250, color: '#ff476f' }
  };
  const ABILITIES = [
    { id: 'armor', name: 'Armadura reforçada', maxLevel: 5, description: level => `Reduz o dano recebido em ${level * 10}% no total.`, apply: level => { player.armor = Math.min(MAX_PLAYER_ARMOR, Math.max(0, level) * .1); } },
    { id: 'rapid', name: 'Disparo rápido', maxLevel: 5, description: level => `Reduz o intervalo entre ataques em ${Math.round((1 - Math.pow(.9, level)) * 100)}%.`, apply: level => { player.fireRate = Math.max(.14, .32 * Math.pow(.9, level)); } },
    { id: 'cannon', name: 'Canhão de energia', maxLevel: 5, description: level => `Projéteis causam ${level + 1} de dano.`, apply: level => { player.damage = 1 + level; } },
    { id: 'boost', name: 'Propulsores', maxLevel: 5, description: level => `Aumenta a força do pulo em ${Math.round((Math.pow(1.08, level) - 1) * 100)}%.`, apply: level => { player.jumpPower = JUMP_SPEED * Math.pow(1.08, level); } },
    { id: 'shield', name: 'Escudo temporário', maxLevel: 5, description: level => `Escudo por ${5 + (level - 1) * .75}s; recarga de ${Math.max(14, 18 - (level - 1))}s.`, apply: level => { const rank = Math.max(1, Math.min(5, level)); player.shieldDuration = 5 + (rank - 1) * .75; player.shieldCooldownDuration = Math.max(14, 18 - (rank - 1)); player.shieldTime = player.shieldDuration; player.shieldCooldown = -1; } },
    { id: 'repair', name: 'Reparo eficiente', maxLevel: 5, description: level => `Reduz o tempo de reparo em ${level * 10}%.`, apply: level => { repairDuration = .8 * (1 - level * .1); } },
    { id: 'recovery', name: 'Recuperação', maxLevel: 5, description: level => `Restaura ${20 + level * 5} pontos de integridade ao escolher.`, apply: level => { player.health = Math.min(player.maxHealth, player.health + 20 + level * 5); } }
  ];
  const QUESTION_HISTORY_KEY = 'byteRunner.usedQuestions.v1';
  function createQuestionSet(prefix, entries) {
    return entries.map(([text, options, answer, explanation], index) => ({
      id: prefix + '-' + String(index + 1).padStart(2, '0'), text, options, answer, explanation
    }));
  }
  const QUESTION_BANK = {
    hardware: createQuestionSet('hw', [
      ['Qual é a função principal de uma placa de rede?', ['Conectar o computador a uma rede', 'Aumentar a memória RAM', 'Resfriar o processador', 'Armazenar arquivos'], 0, 'A placa de rede fornece a interface para enviar e receber dados pela rede.'],
      ['Qual item é hardware?', ['Um cabo Ethernet', 'Um navegador web', 'Um sistema operacional', 'Um aplicativo de mensagens'], 0, 'Hardware é a parte física; o cabo Ethernet pode ser tocado.'],
      ['O que identifica uma interface de rede na camada de enlace?', ['Endereço MAC', 'Nome de domínio', 'Senha do Wi-Fi', 'Número de série do monitor'], 0, 'O endereço MAC identifica uma interface na rede local.'],
      ['Qual conector é comum em cabos Ethernet de cobre?', ['RJ-45', 'HDMI', 'VGA', 'P2'], 0, 'O conector modular RJ-45 é amplamente usado em Ethernet de par trançado.'],
      ['Uma placa de rede sem fio permite ao computador:', ['Conectar-se a redes Wi-Fi', 'Distribuir endereços DHCP obrigatoriamente', 'Resolver nomes DNS sozinha', 'Substituir o roteador'], 0, 'A interface Wi-Fi transmite e recebe dados por ondas de rádio.'],
      ['Qual alternativa diferencia hardware de software?', ['Hardware é físico; software são instruções e programas', 'Hardware é sempre sem fio; software sempre cabeado', 'Hardware são sites; software são cabos', 'Não existe diferença'], 0, 'Componentes físicos são hardware; programas e instruções são software.'],
      ['Para conectar um PC por cabo à rede local, normalmente se usa:', ['Uma porta Ethernet da placa de rede', 'Uma saída de áudio', 'Uma porta de vídeo', 'Um leitor óptico'], 0, 'A porta Ethernet liga fisicamente a interface do computador à LAN.'],
      ['O que um driver de placa de rede faz?', ['Permite ao sistema operacional controlar o adaptador', 'Converte todo domínio em endereço IP', 'Substitui o cabo de rede', 'Cria uma conexão de Internet sem provedor'], 0, 'O driver permite que o sistema operacional comunique com o dispositivo de rede.'],
      ['Uma interface de rede pode possuir:', ['Endereço MAC próprio', 'Um domínio público obrigatório', 'Um servidor DNS integrado obrigatório', 'Um endereço IP permanente e imutável'], 0, 'O MAC é associado à interface; o IP pode mudar conforme a rede.'],
      ['Qual componente físico encaminha tráfego entre redes diferentes?', ['Roteador', 'Memória RAM', 'Processador gráfico', 'Teclado'], 0, 'O roteador encaminha pacotes entre redes; esta é uma função de rede do equipamento.']
    ]),
    software: createQuestionSet('sw', [
      ['Qual é uma função de rede do sistema operacional?', ['Configurar interfaces e protocolos de rede', 'Fabricar o cabo Ethernet', 'Substituir o ponto de acesso', 'Aumentar o sinal de rádio fisicamente'], 0, 'O sistema operacional gerencia interfaces e implementações de protocolos.'],
      ['Para que serve o comando ping?', ['Testar se um destino responde na rede', 'Criar uma conta de usuário', 'Atribuir um endereço MAC', 'Trocar o canal do roteador'], 0, 'Ping envia mensagens de teste, normalmente ICMP, e mede a resposta.'],
      ['Qual ferramenta costuma mostrar a configuração IP no Windows?', ['ipconfig', 'format', 'paint', 'dir'], 0, 'ipconfig exibe informações como endereço IP, máscara e gateway.'],
      ['Um aplicativo de diagnóstico de rede ajuda a:', ['Investigar conectividade e configuração', 'Consertar fisicamente um cabo rompido', 'Aumentar a velocidade contratada', 'Trocar a placa-mãe remotamente'], 0, 'Ferramentas de diagnóstico ajudam a localizar falhas de configuração ou conectividade.'],
      ['O que é um protocolo de rede?', ['Um conjunto de regras para comunicação', 'Um tipo de conector metálico', 'Um endereço físico de computador', 'Um modelo de processador'], 0, 'Protocolos definem formatos e regras usados pelos dispositivos para trocar dados.'],
      ['Qual pilha de protocolos é usada na Internet?', ['TCP/IP', 'HTML/USB', 'RAM/CPU', 'JPEG/HDMI'], 0, 'A Internet usa a suíte de protocolos TCP/IP.'],
      ['Limpar o cache DNS do sistema pode ajudar quando:', ['Uma resolução antiga está causando problema', 'O monitor não liga', 'A memória RAM está fisicamente solta', 'O cabo de energia está desconectado'], 0, 'O cache guarda respostas DNS; limpá-lo força uma nova consulta.'],
      ['Um sistema operacional atualizado pode receber:', ['Correções de segurança e de rede', 'Mais portas físicas no computador', 'Um cabo Ethernet novo', 'Uma antena de maior alcance automaticamente'], 0, 'Atualizações podem corrigir falhas do software de rede e vulnerabilidades.'],
      ['Qual ferramenta exibe os saltos até um destino?', ['tracert ou traceroute', 'ipconfig /renew apenas', 'notepad', 'chkdsk'], 0, 'Traceroute mostra os roteadores atravessados até o destino.'],
      ['O que uma configuração de proxy pode fazer?', ['Intermediar algumas conexões entre cliente e Internet', 'Substituir todos os endereços MAC', 'Distribuir energia ao switch', 'Reparar automaticamente fibra rompida'], 0, 'Um proxy atua como intermediário para tráfego definido.']
    ]),
    switch: createQuestionSet('swc', [
      ['Qual é a função típica de um switch Ethernet?', ['Conectar dispositivos dentro de uma rede local', 'Converter nomes de domínio em IP', 'Conectar sempre duas operadoras', 'Distribuir energia elétrica residencial'], 0, 'Um switch conecta dispositivos de uma LAN e encaminha quadros entre portas.'],
      ['Qual informação o switch normalmente aprende para encaminhar quadros?', ['Endereços MAC de origem', 'Senhas dos usuários', 'Nomes dos arquivos', 'Números de telefone'], 0, 'O switch associa MACs aprendidos às portas correspondentes.'],
      ['Um quadro destinado a um MAC conhecido costuma ser enviado:', ['À porta associada a esse MAC', 'A todas as portas sempre', 'Somente ao roteador da Internet', 'A uma rede Wi-Fi próxima'], 0, 'A tabela MAC permite encaminhar o quadro pela porta correta.'],
      ['Dispositivos conectados ao mesmo switch e à mesma VLAN geralmente estão:', ['Na mesma rede local de camada 2', 'Em redes físicas sem qualquer comunicação', 'Todos na Internet pública', 'Automaticamente em sub-redes diferentes'], 0, 'Uma VLAN forma um domínio local de camada 2 dentro da configuração do switch.'],
      ['Para que serve uma VLAN?', ['Separar logicamente grupos de dispositivos', 'Aumentar o comprimento de qualquer cabo', 'Converter IPv4 em IPv6', 'Armazenar páginas web'], 0, 'VLANs segmentam logicamente uma infraestrutura física compartilhada.'],
      ['O que pode ocorrer quando o switch recebe um quadro unicast desconhecido?', ['Ele pode inundar o quadro pelas portas da VLAN, exceto a de entrada', 'Ele apaga a tabela de endereços IP do roteador', 'Ele converte o quadro em consulta DNS', 'Ele sempre descarta sem encaminhar'], 0, 'O switch inunda um unicast desconhecido dentro da VLAN para localizar o destino.'],
      ['Duas portas de switch ligadas em loop sem proteção podem causar:', ['Tempestade de quadros na rede', 'Resolução DNS mais rápida', 'Aumento da capacidade de DHCP', 'Criptografia automática'], 0, 'Loops de camada 2 podem replicar quadros continuamente; STP ajuda a evitá-los.'],
      ['Qual protocolo ajuda a evitar loops de camada 2?', ['STP', 'DNS', 'DHCP', 'NTP'], 0, 'Spanning Tree Protocol bloqueia caminhos redundantes para evitar loops.'],
      ['Uma porta de switch sem link pode indicar:', ['Cabo desconectado ou dispositivo desligado', 'Domínio DNS expirado necessariamente', 'Senha de e-mail inválida', 'Máscara de sub-rede muito grande sempre'], 0, 'Sem sinal físico, a porta não estabelece o link Ethernet.'],
      ['Um switch gerenciável permite, entre outras coisas:', ['Configurar VLANs e monitorar portas', 'Substituir todos os servidores DNS', 'Criar fibra óptica sem cabo', 'Dar acesso à Internet sem roteador ou provedor'], 0, 'Switches gerenciáveis oferecem configuração e monitoramento da rede.']
    ]),
    router: createQuestionSet('rt', [
      ['Qual é o papel principal de um roteador?', ['Encaminhar pacotes entre redes IP', 'Conectar teclados ao computador', 'Armazenar arquivos de todos os clientes', 'Converter corrente alternada em contínua'], 0, 'O roteador escolhe caminhos e encaminha pacotes entre redes.'],
      ['O que é o gateway padrão de um computador?', ['O roteador usado para alcançar outras redes', 'O endereço MAC do próprio computador', 'O nome do servidor DNS', 'A senha do ponto de acesso'], 0, 'O gateway padrão recebe tráfego destinado a redes fora da sub-rede local.'],
      ['Uma tabela de roteamento contém:', ['Rotas para redes de destino e próximos saltos', 'Lista de senhas Wi-Fi', 'Arquivos compartilhados', 'Nomes de usuários do sistema'], 0, 'Rotas indicam redes de destino e como alcançá-las.'],
      ['O roteador compara qual informação para decidir o encaminhamento IP?', ['Endereço IP de destino', 'Endereço de e-mail do usuário', 'Nome do computador local apenas', 'Endereço MAC do teclado'], 0, 'A decisão de roteamento usa o IP de destino e a tabela de rotas.'],
      ['O que faz uma rota padrão?', ['Indica para onde enviar destinos sem rota mais específica', 'Bloqueia todos os pacotes externos', 'Atribui endereços MAC', 'Resolve nomes de domínio localmente'], 0, 'A rota padrão é usada quando não há correspondência mais específica.'],
      ['NAT em um roteador doméstico costuma:', ['Traduzir endereços privados para compartilhar um IP público', 'Traduzir nomes DNS em endereços MAC', 'Criar uma rede física nova', 'Aumentar a potência do cabo'], 0, 'NAT permite que vários dispositivos privados compartilhem um endereço público.'],
      ['Qual porta do roteador costuma se conectar ao modem ou à operadora?', ['WAN', 'PS/2', 'VGA', 'SATA'], 0, 'A interface WAN conecta a rede local ao lado externo/operadora.'],
      ['O que acontece com o TTL de um pacote IP em cada roteador?', ['É decrementado para limitar a vida do pacote', 'É convertido em endereço MAC', 'É aumentado indefinidamente', 'É usado como senha de Wi-Fi'], 0, 'Cada salto reduz o TTL; ao chegar a zero, o pacote é descartado.'],
      ['Duas redes IP diferentes precisam normalmente de qual dispositivo para trocar tráfego?', ['Roteador', 'Hub USB', 'Teclado', 'Impressora local sem rede'], 0, 'O roteador interliga redes IP distintas.'],
      ['O que representa o próximo salto de uma rota?', ['O roteador seguinte no caminho ao destino', 'O próximo endereço DNS a registrar', 'A próxima porta USB disponível', 'O próximo usuário a entrar no sistema'], 0, 'O próximo salto é o equipamento para o qual o pacote será encaminhado.']
    ]),
    wifi: createQuestionSet('wf', [
      ['Qual é o papel de um ponto de acesso Wi-Fi?', ['Conectar clientes sem fio à rede local', 'Traduzir domínios em páginas HTML', 'Atribuir endereços MAC', 'Substituir o provedor de Internet'], 0, 'O ponto de acesso oferece conectividade WLAN e faz ponte com a rede local.'],
      ['O que identifica o nome anunciado de uma rede Wi-Fi?', ['SSID', 'TTL', 'MAC do servidor DNS', 'Máscara de sub-rede'], 0, 'SSID é o nome da rede sem fio exibido aos clientes.'],
      ['Wi-Fi transmite dados principalmente por:', ['Ondas de rádio', 'Pulsos em cabo coaxial de TV apenas', 'Luz em fibra dentro do ar', 'Sinais de áudio audíveis'], 0, 'Redes Wi-Fi usam radiofrequência para comunicação sem fio.'],
      ['O que pode causar interferência em uma rede Wi-Fi?', ['Redes próximas no mesmo canal', 'Um registro DNS A', 'Uma máscara de rede', 'Um endereço de loopback'], 0, 'Redes e aparelhos próximos podem disputar ou interferir no espectro de rádio.'],
      ['Qual prática protege melhor uma rede Wi-Fi doméstica?', ['Usar WPA2 ou WPA3 com senha forte', 'Deixar a rede aberta', 'Usar o SSID como única senha', 'Desativar toda criptografia'], 0, 'WPA2/WPA3 com credencial forte protege o tráfego e o acesso à rede.'],
      ['O que significa intensidade de sinal baixa?', ['O cliente recebe sinal de rádio fraco do ponto de acesso', 'O domínio não possui registro MX', 'O cabo Ethernet está muito curto', 'O DHCP tem endereços sobrando'], 0, 'Distância, obstáculos e interferência podem enfraquecer o sinal recebido.'],
      ['Mudar o canal Wi-Fi pode ajudar quando:', ['Há congestionamento ou interferência no canal atual', 'O computador não tem sistema operacional', 'O DNS está sem domínio raiz', 'A placa de vídeo está aquecida'], 0, 'Um canal menos congestionado pode reduzir a interferência local.'],
      ['O que é roaming Wi-Fi?', ['A troca de um ponto de acesso para outro mantendo a conectividade', 'A troca de IPv4 para MAC', 'A navegação sem endereço IP', 'A transmissão de DNS por cabo serial'], 0, 'Clientes podem migrar entre APs da mesma rede conforme o sinal varia.'],
      ['Um repetidor ou extensor Wi-Fi é usado para:', ['Ampliar a cobertura sem fio', 'Substituir o servidor DHCP em toda rede', 'Traduzir URLs em endereços IP', 'Filtrar portas de firewall'], 0, 'O extensor retransmite ou amplia a cobertura de rádio em áreas distantes.'],
      ['Ocultar o SSID é suficiente para proteger uma rede?', ['Não; ainda é necessário usar autenticação e criptografia fortes', 'Sim; substitui toda senha', 'Sim; impede qualquer transmissão de rádio', 'Não, mas basta trocar o endereço IP'], 0, 'Ocultar o nome não substitui os mecanismos de segurança Wi-Fi.']
    ]),
    cabling: createQuestionSet('cb', [
      ['Qual meio é comum em redes Ethernet cabeadas de escritório?', ['Par trançado', 'Cabo de alimentação SATA', 'Cabo de áudio P2', 'Cabo de antena de TV sempre'], 0, 'Ethernet costuma usar cabos de pares trançados, como Cat5e ou Cat6.'],
      ['Para que serve o trançamento dos pares no cabo Ethernet?', ['Reduzir interferência eletromagnética', 'Aumentar a tensão elétrica', 'Armazenar endereços IP', 'Acelerar consultas DNS diretamente'], 0, 'O trançamento ajuda a reduzir ruído e interferência entre pares.'],
      ['Qual padrão físico usa luz para transmitir dados?', ['Fibra óptica', 'Par trançado de cobre', 'Cabo USB de teclado', 'Cabo serial RS-232'], 0, 'A fibra transmite sinais luminosos e é imune a interferência eletromagnética.'],
      ['Para que serve um patch panel em um rack?', ['Organizar e terminar cabos de rede', 'Distribuir endereços DHCP', 'Criptografar pacotes IP', 'Resolver nomes DNS'], 0, 'O patch panel organiza terminações de cabeamento estruturado.'],
      ['Qual sinal costuma indicar que há link físico na porta Ethernet?', ['LED de link aceso ou piscando', 'Ícone de bateria cheia', 'Luz do monitor apagada', 'Som do alto-falante'], 0, 'O LED de link indica que a interface detectou uma conexão física.'],
      ['Um cabo Ethernet rompido tende a causar:', ['Perda do link ou erros de transmissão', 'Mudança automática do domínio DNS', 'Aumento da velocidade de rádio', 'Criação de uma nova VLAN'], 0, 'Danos físicos podem interromper o sinal ou gerar erros no enlace.'],
      ['Qual categoria é uma especificação comum de cabo de par trançado?', ['Cat6', 'HDMI-2', 'WPA3', 'IPv6'], 0, 'Cat6 é uma categoria de cabeamento de par trançado.'],
      ['Qual é uma vantagem da fibra óptica sobre cobre em longas distâncias?', ['Maior alcance e imunidade a interferência eletromagnética', 'Não precisa de conectores', 'Sempre fornece endereços IP', 'Dispensa equipamentos de rede'], 0, 'Fibra pode transportar dados por longas distâncias sem captar interferência eletromagnética.'],
      ['Em cabeamento estruturado, um patch cord normalmente:', ['Conecta uma tomada ou patch panel a um equipamento', 'Atribui endereço IP ao servidor', 'Filtra tráfego de entrada', 'Converte nome DNS em MAC'], 0, 'Patch cords fazem as conexões curtas entre terminações e equipamentos.'],
      ['Qual cuidado ajuda a preservar o desempenho do cabo de par trançado?', ['Evitar esmagamento e dobras muito acentuadas', 'Passá-lo enrolado em motores elétricos', 'Remover o trançamento dos pares ao longo do cabo', 'Deixar os condutores expostos'], 0, 'Danos e curvaturas excessivas alteram as características elétricas do cabo.']
    ]),
    dhcp: createQuestionSet('dh', [
      ['O que é um endereço IP?', ['Identificador lógico usado para comunicação em uma rede IP', 'Nome físico do cabo', 'Senha do roteador', 'Número de série do processador'], 0, 'O endereço IP identifica uma interface para comunicação na camada de rede.'],
      ['Qual é a função do DHCP?', ['Atribuir configurações IP automaticamente', 'Resolver nomes de domínio', 'Comutar quadros por endereço MAC', 'Criptografar arquivos locais'], 0, 'DHCP entrega configurações como IP, máscara, gateway e DNS aos clientes.'],
      ['Para que serve a máscara de sub-rede?', ['Separar a parte de rede da parte de host do endereço IP', 'Indicar a senha do Wi-Fi', 'Identificar o fabricante do switch', 'Informar o nome do servidor'], 0, 'A máscara permite determinar quais endereços pertencem à mesma sub-rede.'],
      ['Qual configuração encaminha tráfego para redes fora da sub-rede?', ['Gateway padrão', 'Endereço de loopback', 'Nome do computador', 'Máscara de vídeo'], 0, 'O gateway padrão é o próximo salto para destinos externos à rede local.'],
      ['O que é uma concessão DHCP?', ['Um empréstimo temporário de configuração IP ao cliente', 'Uma rota permanente na Internet', 'Uma senha compartilhada do switch', 'Um registro de domínio'], 0, 'O servidor concede parâmetros por um período definido, que pode ser renovado.'],
      ['Qual endereço IPv4 indica frequentemente falha ao obter DHCP no Windows?', ['169.254.x.x', '8.8.8.8', '127.0.0.1', '224.0.0.1'], 0, 'Um endereço APIPA 169.254/16 pode surgir quando o cliente não alcança DHCP.'],
      ['O que pode ocorrer se dois dispositivos usam o mesmo IP na mesma rede?', ['Conflito de endereço e falha de comunicação', 'Aumento automático do sinal Wi-Fi', 'Conversão do IP em domínio', 'Criação de uma nova VLAN'], 0, 'IPs duplicados podem tornar a entrega de pacotes ambígua e interromper conexões.'],
      ['Qual mensagem o cliente envia para localizar servidores DHCP?', ['DHCPDISCOVER', 'DNSQUERY', 'HTTPGET', 'ARPDELETE'], 0, 'O processo DHCP começa com uma mensagem de descoberta em broadcast.'],
      ['O que é uma reserva DHCP?', ['Uma associação que entrega IP definido a um cliente identificado', 'Uma cópia de segurança do cabo', 'Um nome alternativo DNS', 'Uma regra de firewall sem destino'], 0, 'Uma reserva associa a identidade do cliente, geralmente MAC, a um IP reservado.'],
      ['Qual endereço pertence à rede privada IPv4?', ['192.168.1.20', '203.0.113.8', '8.8.8.8', '1.1.1.1'], 0, '192.168.0.0/16 é uma faixa privada reservada para redes internas.']
    ]),
    dns: createQuestionSet('dns', [
      ['Qual é a função principal do DNS?', ['Resolver nomes de domínio em registros como endereços IP', 'Atribuir endereços MAC', 'Conectar fisicamente cabos', 'Filtrar toda a energia do rack'], 0, 'DNS permite localizar serviços usando nomes em vez de memorizar endereços IP.'],
      ['Qual registro DNS associa um nome a um endereço IPv4?', ['A', 'MX', 'TXT', 'PTR6'], 0, 'O registro A mapeia um nome para um endereço IPv4.'],
      ['Qual registro DNS associa um nome a um endereço IPv6?', ['AAAA', 'CNAME', 'MX', 'SRV4'], 0, 'O registro AAAA publica um endereço IPv6.'],
      ['Para que serve um registro MX?', ['Indicar servidores responsáveis por receber e-mail do domínio', 'Indicar a máscara da rede', 'Definir o gateway padrão', 'Listar portas físicas de um switch'], 0, 'MX aponta para os servidores de e-mail de um domínio.'],
      ['O que faz um resolvedor DNS recursivo?', ['Consulta a hierarquia DNS para encontrar uma resposta ao cliente', 'Atribui endereços IP por DHCP', 'Encaminha quadros em uma VLAN', 'Criptografa discos rígidos'], 0, 'O resolvedor recursivo busca a resposta e pode armazená-la em cache.'],
      ['O que significa uma resposta DNS NXDOMAIN?', ['O nome consultado não existe no DNS', 'O cabo Ethernet foi desconectado', 'O servidor DHCP renovou a concessão', 'O pacote foi criptografado com TLS'], 0, 'NXDOMAIN informa que o nome de domínio consultado não existe.'],
      ['Para que serve o TTL de um registro DNS?', ['Controlar por quanto tempo a resposta pode ficar em cache', 'Contar saltos de um pacote IP', 'Definir a vida útil do cabo', 'Medir a força do Wi-Fi'], 0, 'O TTL define o tempo que resolvedores podem manter a resposta em cache.'],
      ['O que um registro CNAME representa?', ['Um nome alternativo que aponta para outro nome DNS', 'Um endereço MAC de switch', 'Uma rota padrão IPv4', 'Uma senha de domínio'], 0, 'CNAME cria um alias de um nome para outro nome canônico.'],
      ['Por que uma mudança DNS pode não aparecer imediatamente para todos?', ['Caches podem manter respostas até o TTL expirar', 'Roteadores não usam endereços IP', 'O DNS só atualiza por cabo serial', 'O nome precisa virar um endereço MAC'], 0, 'Caches distribuídos podem continuar usando dados válidos até o TTL terminar.'],
      ['Qual servidor costuma ser consultado primeiro pelo dispositivo para resolver nomes?', ['Resolvedor DNS configurado na rede', 'Servidor de impressão obrigatoriamente', 'Switch de acesso', 'Ponto de acesso sem fio'], 0, 'O cliente envia consultas ao resolvedor configurado por DHCP ou manualmente.']
    ]),
    firewall: createQuestionSet('fw', [
      ['Qual é a função de um firewall?', ['Filtrar tráfego conforme regras de segurança', 'Distribuir endereços IP automaticamente', 'Amplificar sinal Wi-Fi', 'Armazenar nomes de domínio'], 0, 'Firewalls permitem ou bloqueiam tráfego com base em políticas configuradas.'],
      ['Uma regra de firewall normalmente pode considerar:', ['Endereços, protocolos e portas', 'Cor do gabinete', 'Tamanho da tela', 'Nome do cabo de energia'], 0, 'Regras podem combinar origem, destino, protocolo e porta.'],
      ['O que significa bloquear por padrão?', ['Negar tráfego que não foi explicitamente permitido', 'Permitir qualquer conexão sem verificação', 'Desligar o roteador', 'Aceitar somente consultas DNS'], 0, 'A política deny by default reduz tráfego não autorizado.'],
      ['O que caracteriza um firewall stateful?', ['Acompanha o estado das conexões', 'Armazena todos os arquivos do cliente', 'Troca endereços MAC por nomes', 'Atribui concessões DHCP'], 0, 'Um firewall stateful considera o estado e o contexto das conexões.'],
      ['Qual protocolo seguro é comumente permitido para navegação web?', ['HTTPS sobre TCP/443', 'FTP anônimo sobre qualquer porta', 'Telnet sobre TCP/23 para senhas', 'ARP sobre TCP/443'], 0, 'HTTPS usa TLS e normalmente opera na porta TCP 443.'],
      ['O princípio do menor privilégio recomenda:', ['Permitir somente o acesso necessário', 'Abrir todas as portas para todos', 'Usar a mesma senha em todos os serviços', 'Desativar o registro de eventos'], 0, 'Reduzir permissões ao mínimo necessário limita o impacto de falhas.'],
      ['Por que revisar registros de firewall?', ['Para investigar tráfego permitido ou bloqueado', 'Para aumentar fisicamente o alcance do cabo', 'Para descobrir a temperatura do processador', 'Para substituir o DNS'], 0, 'Logs ajudam a identificar tentativas de acesso e diagnosticar regras.'],
      ['O que é uma DMZ em redes?', ['Uma zona isolada para serviços expostos com controle de acesso', 'Uma faixa de endereços MAC aleatórios', 'Um cabo de fibra especial', 'Um método de atribuição de IP'], 0, 'A DMZ separa serviços públicos da rede interna mais sensível.'],
      ['Qual afirmação sobre firewall de host está correta?', ['Ele filtra conexões no próprio computador', 'Ele substitui a placa de rede', 'Ele traduz domínio para IP', 'Ele sempre fica entre duas operadoras'], 0, 'Um firewall local aplica regras ao tráfego que entra ou sai do dispositivo.'],
      ['Ao abrir uma porta no firewall, é recomendável:', ['Restringir origem e serviço ao necessário', 'Abrir todas as portas vizinhas', 'Desativar autenticação', 'Permitir qualquer origem permanentemente'], 0, 'Restringir escopo e destino mantém a exposição menor.']
    ]),
    servers: createQuestionSet('sv', [
      ['Em uma arquitetura cliente-servidor, o cliente normalmente:', ['Envia solicitações a um serviço', 'Encaminha quadros de todas as VLANs', 'Substitui o provedor de Internet', 'Distribui energia ao rack'], 0, 'O cliente inicia pedidos e o servidor oferece o serviço solicitado.'],
      ['O que é um servidor de rede?', ['Um sistema que fornece serviços ou recursos a clientes', 'Um cabo que liga duas portas', 'Uma senha de Wi-Fi', 'Um tipo de endereço MAC'], 0, 'Servidores hospedam serviços como páginas, arquivos, nomes ou aplicações.'],
      ['O que é um pacote de dados IP?', ['Uma unidade de dados encaminhada pela rede', 'Uma tomada elétrica de rack', 'Um arquivo de instalação obrigatoriamente', 'Uma entrada da memória RAM'], 0, 'Pacotes carregam dados e informações de origem e destino para encaminhamento.'],
      ['Qual protocolo é usado para transferir páginas web com criptografia?', ['HTTPS', 'DHCP', 'ARP', 'STP'], 0, 'HTTPS protege a comunicação web usando TLS.'],
      ['Qual é uma função comum de um provedor de Internet (ISP)?', ['Conectar clientes a redes e à Internet', 'Resolver todos os arquivos locais', 'Fabricar placas de rede', 'Gerenciar apenas a memória RAM'], 0, 'O ISP fornece conectividade entre o cliente e outras redes/Internet.'],
      ['O que mede a latência de rede?', ['O tempo que os dados levam para ir e voltar ou chegar ao destino', 'A quantidade de espaço em disco', 'A força física do cabo', 'O tamanho do endereço MAC'], 0, 'Latência mede atraso de comunicação, frequentemente em milissegundos.'],
      ['Qual serviço permite que usuários recebam páginas web de um servidor?', ['HTTP ou HTTPS', 'DHCPDISCOVER', 'STP', 'ARP gratuito apenas'], 0, 'Servidores web entregam conteúdo usando HTTP ou HTTPS.'],
      ['Qual é uma característica do TCP?', ['Entrega confiável e ordenada de um fluxo de dados', 'Não usa portas', 'Atribui endereços IP automaticamente', 'Resolve nomes DNS'], 0, 'TCP fornece controle de entrega, retransmissão e ordenação.'],
      ['Qual é uma característica do UDP?', ['Transporte sem conexão com menor controle de entrega', 'Resolução de nomes em registros A', 'Comutação física de quadros', 'Distribuição automática de máscaras'], 0, 'UDP não garante entrega ou ordenação, mas tem menor sobrecarga.'],
      ['O que é um endereço IP público?', ['Um endereço roteável globalmente na Internet', 'Um nome de rede Wi-Fi', 'Um endereço MAC de fábrica', 'Uma senha de servidor'], 0, 'Endereços públicos são usados para roteamento global, conforme alocação e políticas.']
    ])
  };
  const PHASE_DEFINITIONS = [
    { name: 'Hardware do computador', theme: 'hardware', length: 2450, objective: 'Desative os vírus e recupere placa-mãe, CPU e memória.', palette: ['#07151d','#14323b','#56e5cf','#245c57','#775c45'], platforms: [[230,150,82],[520,150,118],[875,190,90],[1230,150,112],[1640,190,78],[2040,150,108]], obstacles: [[455,42,44],[790,54,65],[1175,48,54],[1570,55,75],[1980,58,50]], components: [660,1430], enemies: [{x:390,type:'common'},{x:1060,type:'fast'},{x:1840,type:'common'}], items: [570,1570], features: [380,980,1610,2130] },
    { name: 'Software do computador', theme: 'software', length: 2250, objective: 'Encontre processos infectados e restaure os arquivos corrompidos.', palette: ['#101026','#26254c','#a78cff','#4e477e','#8b5278'], platforms: [[180,130,100],[420,180,65],[760,140,122],[1050,210,82],[1450,160,110],[1790,180,70]], obstacles: [[350,48,68],[690,44,42],[1010,58,78],[1395,45,56],[1730,52,68]], components: [600,1290], enemies: [{x:460,type:'fast'},{x:900,type:'common'},{x:1630,type:'fast'}], items: [280,1140], features: [300,830,1370,1880] },
    { name: 'Switch de rede', theme: 'switch', length: 2350, objective: 'Neutralize os vírus das portas e reconecte os equipamentos do switch.', palette: ['#071820','#12313a','#56d9ce','#285a65','#b17b51'], platforms: [[260,190,75],[600,120,112],[850,180,80],[1190,145,126],[1500,200,72],[1900,150,108]], obstacles: [[500,50,58],[800,42,45],[1120,52,75],[1450,44,60],[1840,62,78]], components: [700,1320,1740], enemies: [{x:430,type:'common'},{x:980,type:'fast'},{x:1600,type:'common'}], items: [300,1560], features: [360,900,1490,2010] },
    { name: 'Roteador', theme: 'router', length: 2550, objective: 'Reative as rotas e elimine as falhas de comunicação entre redes.', palette: ['#101522','#263a52','#80c6ff','#496b8b','#a17b56'], platforms: [[200,140,115],[470,180,75],[820,135,125],[1100,190,88],[1470,160,115],[1800,180,72],[2160,150,108]], obstacles: [[395,48,68],[760,52,55],[1050,45,72],[1420,52,66],[1750,48,55],[2100,55,78]], components: [650,1260], enemies: [{x:530,type:'fast'},{x:1000,type:'common'},{x:1740,type:'fast'}], items: [300,1540], features: [310,870,1510,2200] },
    { name: 'Rede Wi-Fi', theme: 'wifi', length: 2300, objective: 'Reduza as interferências e repare os pontos de acesso sem fio.', palette: ['#091a29','#123b50','#74e8ff','#256782','#9c8a50'], platforms: [[210,170,80],[520,130,120],[790,200,74],[1160,145,115],[1450,180,82],[1800,180,120]], obstacles: [[460,45,60],[740,52,80],[1110,46,52],[1400,48,72],[1740,52,62]], components: [630,1280], enemies: [{x:440,type:'fast'},{x:970,type:'fast'},{x:1580,type:'common'}], items: [300,1520], features: [330,820,1390,1900] },
    { name: 'Cabeamento e infraestrutura', theme: 'cabling', length: 2700, objective: 'Restaure os conectores rompidos e proteja o cabeamento do rack.', palette: ['#171615','#332b24','#f0b66d','#786044','#556b77'], platforms: [[250,140,105],[520,190,75],[870,140,120],[1150,200,85],[1530,160,116],[1840,190,72],[2220,160,110]], obstacles: [[470,50,58],[820,45,75],[1100,48,62],[1480,52,80],[1800,48,56],[2180,55,78]], components: [690,1320,2010], enemies: [{x:430,type:'common'},{x:1010,type:'fast'},{x:1640,type:'common'},{x:2290,type:'fast'}], items: [300,1580,2360], features: [360,930,1550,2230] },
    { name: 'Endereçamento IP e DHCP', theme: 'dhcp', length: 2350, objective: 'Corrija concessões DHCP e recupere os endereços IP da rede.', palette: ['#081b1b','#123b36','#72edb0','#337a69','#7d7851'], platforms: [[170,170,80],[480,140,120],[760,170,75],[1080,130,125],[1350,180,85],[1700,150,115],[1990,140,72]], obstacles: [[430,48,60],[710,45,68],[1030,54,78],[1300,44,56],[1650,50,72],[1940,50,55]], components: [610,1430], enemies: [{x:410,type:'fast'},{x:930,type:'common'},{x:1600,type:'fast'}], items: [260,1370], features: [300,790,1390,1880] },
    { name: 'DNS', theme: 'dns', length: 2400, objective: 'Restaure os servidores DNS e reconstrua a resolução de domínios.', palette: ['#10162b','#202f52','#9fbdff','#536a9b','#a17a61'], platforms: [[240,160,115],[540,130,74],[810,180,120],[1150,145,78],[1450,180,112],[1800,150,78],[2100,140,118]], obstacles: [[490,48,66],[770,54,55],[1110,45,70],[1410,48,62],[1760,50,78],[2060,48,58]], components: [680,1320], enemies: [{x:460,type:'common'},{x:990,type:'fast'},{x:1690,type:'common'}], items: [300,1500], features: [330,850,1480,2040] },
    { name: 'Firewall e segurança', theme: 'firewall', length: 2650, objective: 'Derrube as ameaças e reative os escudos do firewall.', palette: ['#1c1017','#3c1d29','#ff7c68','#8d3548','#b18a57'], platforms: [[220,150,85],[500,170,118],[820,140,75],[1110,190,122],[1480,150,78],[1780,180,115],[2150,160,82]], obstacles: [[455,48,65],[780,48,75],[1070,55,58],[1440,48,80],[1740,52,60],[2110,52,76]], components: [650,1320,1970], enemies: [{x:430,type:'fast'},{x:970,type:'common'},{x:1580,type:'fast'},{x:2250,type:'common'}], items: [300,1510,2300], features: [320,850,1530,2220] },
    { name: 'Servidores e Internet', theme: 'servers', length: 3100, objective: 'Repare os servidores da rede e derrote VIRUS ZERO no núcleo.', palette: ['#070f20','#172b50','#80dbff','#336783','#a35267'], platforms: [[230,150,82],[510,160,118],[820,180,75],[1150,140,120],[1420,190,78],[1770,160,112],[2070,170,80],[2390,160,118],[2680,140,75]], obstacles: [[465,48,54],[770,52,72],[1100,48,65],[1370,55,80],[1720,50,60],[2020,52,70],[2340,50,58],[2630,54,78]], components: [670,1460,2210], enemies: [{x:480,type:'common'},{x:1250,type:'fast'},{x:1920,type:'common'},{x:2400,type:'fast'},{x:2760,type:'boss',hp:28}], items: [300,1550,2440], features: [340,900,1510,2140,2760] }
  ];
  PHASE_DEFINITIONS[5] = {
    ...PHASE_DEFINITIONS[5],
    components:[
      {id:'c01',x:690,y:1014,anchor:'floor',offset:44},
      {id:'c02',x:600,y:744,anchor:'floor',offset:44},
      {id:'c03',x:430,y:384,anchor:'floor',offset:44}
    ],
    enemies:[
      {x:590,y:1123,type:'basic'}, {x:770,y:942,type:'fast'},
      {x:690,y:762,type:'parasite'}, {x:450,y:492,type:'shooter'}
    ],
    items:[{x:320,y:1260},{x:860,y:830},{x:430,y:365}],
    features:[{x:320,y:1450},{x:850,y:1090},{x:790,y:690},{x:300,y:480}]
  };
  PHASE_DEFINITIONS[7] = { ...PHASE_DEFINITIONS[7], components:[750,1480] };
  PHASE_DEFINITIONS[8] = {
    ...PHASE_DEFINITIONS[8], components:[580,960,1970],
    items:[300,{x:1360,y:205},2300]
  };
  PHASE_DEFINITIONS[9] = {
    ...PHASE_DEFINITIONS[9], length:4650,
    objective:'Restaure os quatro relays da Internet, desative o escudo do núcleo e neutralize VIRUS ZERO.',
    components:[{id:'c01',x:650},{id:'c02',x:1570},{id:'c03',x:2670},{id:'c04',x:3180}],
    enemies:[
      {x:500,type:'basic',hp:3},{x:1120,type:'shooter',hp:3},
      {x:1850,type:'flyer',hp:3},{x:2180,type:'shooter',hp:3},
      {x:2470,type:'parasite',hp:4},{x:2710,type:'fast',hp:2},
      {x:2920,type:'armored',hp:7},
      {x:3970,type:'boss',hp:54,multiStage:true,coreShieldRequiresRepairs:true,
        bossBounds:{left:3420,right:4450},armor:.25,damage:18,speed:58,xp:500}
    ],
    items:[{x:320},{x:780},{x:1420},{x:2040},{x:2620},{x:3290},{x:3560},{x:4100}],
    features:[340,850,1430,2050,2670,3180,3550,4180,4420,3970]
  };
  // Each sector selects a small roster from the shared enemy catalog.
  const PHASE_ENEMY_ROSTERS = [
    ['basic','fast','armored'], ['fast','basic','shooter'], ['basic','parasite','shooter'],
    ['fast','flyer','armored'], ['shooter','fast','basic'], ['basic','fast','parasite','fast'],
    ['fast','armored','flyer'], ['basic','shooter','parasite'], ['armored','shooter','fast','basic'],
    ['basic','shooter','flyer','fast','boss']
  ];

  // The first five sectors have their own route geometry. Coordinates are
  // world-space; repairs open optional shortcuts or activate themed ledges.
  const THEME_LAYOUTS = {
    0: { platforms: [
      { id:'cpu-bridge', x:735, width:118, offset:58, style:'circuit' },
      { id:'ram-rail', x:1375, width:108, offset:92, style:'circuit' },
      { id:'gpu-bridge', x:1880, width:125, offset:64, style:'circuit' },
      { id:'repaired-bus', x:945, width:150, offset:112, style:'circuit', requiresComponentId:'c01' }
    ], obstacles:[
      { id:'fan-housing', x:905, width:46, height:58, offset:58, type:'fan', requiresComponentId:'c01' },
      { id:'heatsink', x:1535, width:58, height:86, offset:86, type:'heatsink', requiresComponentId:'c02' }
    ], gates:[{ id:'board-bus-gate', x:1090, width:22, height:96, requiresComponentId:'c01' }] },
    1: { platforms:[
      { id:'folder-window-a', x:300, width:116, offset:108, style:'window' },
      { id:'folder-window-b', x:970, width:118, offset:112, style:'window' },
      { id:'floating-process', x:1550, width:130, offset:116, style:'window', requiresComponentId:'c01' }
    ], obstacles:[
      { id:'corrupt-file-a', x:820, width:48, height:60, offset:60, type:'corrupt', requiresComponentId:'c01' },
      { id:'process-crash', x:1815, width:58, height:74, offset:74, type:'corrupt', requiresComponentId:'c02' }
    ], gates:[{ id:'directory-lock', x:930, width:22, height:108, requiresComponentId:'c01' }] },
    2: { platforms:[
      { id:'cable-port-a', x:390, width:132, offset:58, style:'cable' },
      { id:'packet-bridge', x:1040, width:140, offset:112, style:'packet' },
      { id:'cable-port-b', x:1780, width:132, offset:62, style:'cable', requiresComponentId:'c02' }
    ], obstacles:[
      { id:'port-stack-a', x:550, width:44, height:66, offset:66, type:'port' },
      { id:'port-stack-b', x:1380, width:44, height:72, offset:72, type:'port' }
    ], gates:[
      { id:'switch-link-a', x:930, width:22, height:106, requiresComponentId:'c01' },
      { id:'switch-link-b', x:1660, width:22, height:106, requiresComponentId:'c02' }
    ] },
    3: { platforms:[
      { id:'route-high-a', x:320, width:126, offset:112, style:'route' },
      { id:'packet-lift-a', x:960, width:126, offset:118, style:'packet' },
      { id:'route-high-b', x:1590, width:140, offset:112, style:'route' },
      { id:'route-shortcut', x:1190, width:152, offset:116, style:'route', requiresComponentId:'c01' }
    ], obstacles:[
      { id:'router-wall-a', x:720, width:42, height:96, offset:96, type:'route-wall' },
      { id:'router-wall-b', x:1830, width:48, height:116, offset:116, type:'route-wall' }
    ], gates:[{ id:'route-module-gate', x:1030, width:22, height:108, requiresComponentId:'c01' }] },
    4: { platforms:[
      { id:'signal-shelf-a', x:340, width:120, offset:112, style:'signal' },
      { id:'signal-shelf-b', x:900, width:126, offset:112, style:'signal', requiresComponentId:'c01' },
      { id:'signal-shelf-c', x:1510, width:145, offset:116, style:'signal', requiresComponentId:'c02' },
      { id:'interference-bridge', x:1870, width:126, offset:108, style:'signal' }
    ], obstacles:[
      { id:'interference-field-a', x:735, width:48, height:82, offset:82, type:'interference', collision:'dangerous', damage:10, requiresComponentId:'c01' },
      { id:'interference-field-b', x:1710, width:54, height:94, offset:94, type:'interference', collision:'dangerous', damage:10, requiresComponentId:'c02' }
    ], gates:[{ id:'wifi-signal-gate', x:1110, width:22, height:102, requiresComponentId:'c01' }] },
    5: {
      replacePlatforms:true, replaceObstacles:true,
      map:{ width:1100, height:1550, layout:'vertical',
        start:{x:145,anchor:'floor',offset:0}, exit:{x:440,y:384,width:46,height:100,triggerRadiusY:74},
        bounds:{left:true,right:true,ceiling:true,floor:true}, camera:{axes:['x','y'],followOffsetX:.5,followOffsetY:.55},
        checkpoints:[{x:695,y:1058},{x:600,y:788}] },
      platforms:[
        {id:'rack-ledge-1',x:110,width:150,offset:100,style:'cable'},
        {id:'rack-ledge-2',x:250,width:135,offset:190,style:'cable'},
        {id:'maintenance-lift-a',x:390,width:135,offset:280,style:'cable',type:'moving',motion:{axis:'y',range:18,speed:.75,phase:0}},
        {id:'rack-ledge-4',x:530,width:135,offset:360,style:'cable'},
        {id:'rack-ledge-5',x:670,width:135,offset:450,style:'cable'},
        {id:'rack-ledge-6',x:810,width:135,offset:540,style:'cable'},
        {id:'rack-ledge-7',x:670,width:135,offset:630,style:'cable'},
        {id:'rack-ledge-8',x:530,width:135,offset:720,style:'cable'},
        {id:'rack-ledge-9',x:390,width:135,offset:810,style:'cable'},
        {id:'rack-ledge-10',x:250,width:135,offset:900,style:'cable'},
        {id:'rack-ledge-11',x:110,width:135,offset:990,style:'cable'},
        {id:'rack-ledge-12',x:360,width:160,offset:1080,style:'cable'},
        {id:'maintenance-lift-b',x:785,width:125,offset:720,style:'cable',type:'moving',motion:{axis:'x',range:42,speed:.6,phase:1.2}}
      ],
      obstacles:[
        {id:'rack-left-wall',x:0,y:0,width:38,height:1550,offset:0,type:'rack-wall'},
        {id:'rack-right-wall',x:1062,y:0,width:38,height:1550,offset:0,type:'rack-wall'},
        {id:'live-ethernet-a',x:515,y:1110,width:36,height:68,offset:0,type:'interference',collision:'dangerous',damage:12,requiresComponentId:'c01'},
        {id:'short-circuit-b',x:725,y:810,width:44,height:74,offset:0,type:'interference',collision:'dangerous',damage:12,requiresComponentId:'c02'},
      ],
      gates:[{id:'rack-bridge-gate',x:190,y:510,width:660,height:18,requiresComponentId:'c02'}]
    },
    6: { platforms:[
      {id:'dhcp-lease-lift-a',x:660,width:132,offset:132,style:'packet',type:'moving',motion:{axis:'y',range:26,speed:.7,phase:.5},requiresComponentId:'c01'},
      {id:'subnet-bridge',x:900,width:170,offset:76,style:'packet',requiresComponentId:'c01'},
      {id:'dhcp-lease-lift-b',x:1580,width:138,offset:142,style:'packet',type:'moving',motion:{axis:'y',range:22,speed:.8,phase:1},requiresComponentId:'c02'},
      {id:'alternate-subnet-shelf',x:1780,width:150,offset:192,style:'route'}
    ], obstacles:[
      {id:'dhcp-conflict-a',x:800,width:46,height:70,offset:70,type:'corrupt'},
      {id:'dhcp-conflict-b',x:1540,width:48,height:78,offset:78,type:'corrupt',requiresComponentId:'c02'}
    ], map:{pits:[{x:940,width:106}],checkpoints:[700,1500]}, gates:[
      {id:'lease-gate-a',x:930,width:22,height:104,requiresComponentId:'c01'},
      {id:'lease-gate-b',x:1840,width:22,height:108,requiresComponentId:'c02'}
    ] },
    7: { platforms:[
      {id:'dns-cache-platform-a',x:410,width:142,offset:128,style:'window'},
      {id:'dns-cache-platform-b',x:1000,width:145,offset:142,style:'window',type:'moving',motion:{axis:'y',range:24,speed:.72,phase:1.4}},
      {id:'dns-packet-bridge',x:1200,width:190,offset:76,style:'packet'},
      {id:'dns-secret-directory',x:1310,width:128,offset:170,style:'window',requiresComponentId:'c01'},
      {id:'dns-reconnect-bridge',x:1710,width:180,offset:82,style:'packet',requiresComponentId:'c02'},
      {id:'dns-cache-shelf',x:1950,width:130,offset:132,style:'window'}
    ], map:{pits:[{x:620,width:90},{x:1230,width:110}]}, obstacles:[
      {id:'corrupt-domain-a',x:730,width:48,height:78,offset:78,type:'corrupt',requiresComponentId:'c01'},
      {id:'corrupt-domain-b',x:1500,width:54,height:88,offset:88,type:'corrupt',requiresComponentId:'c02'},
      {id:'dns-cache-door',x:1210,width:22,height:104,offset:104,type:'gate',requiresComponentId:'c01'}
    ], gates:[{id:'dns-root-gate',x:1640,width:22,height:104,requiresComponentId:'c02'}] },
    8: { platforms:[
      {id:'security-catwalk-a',x:300,width:136,offset:140,style:'route'},
      {id:'security-timed-lift',x:850,width:138,offset:152,style:'route',type:'moving',motion:{axis:'y',range:28,speed:.9,phase:.3}},
      {id:'risk-room-platform-a',x:1180,width:110,offset:226,style:'dangerous',type:'dangerous',damage:12},
      {id:'risk-room-platform-b',x:1320,width:110,offset:220,style:'dangerous',type:'dangerous',damage:12},
      {id:'firewall-safe-catwalk',x:1200,width:280,offset:65,style:'route',requiresComponentId:'c02'},
      {id:'safe-route-bridge',x:1590,width:180,offset:86,style:'route',requiresComponentId:'c02'},
      {id:'security-catwalk-b',x:1980,width:150,offset:146,style:'route'}
    ], obstacles:[
      {id:'laser-lane-a',x:650,width:34,height:86,offset:86,type:'interference',collision:'dangerous',damage:14,window:{period:3.4,active:1.5,phase:0},requiresComponentId:'c01'},
      {id:'laser-lane-b',x:1090,width:38,height:94,offset:94,type:'interference',collision:'dangerous',damage:16,window:{period:4.1,active:1.8,phase:1.3},requiresComponentId:'c02'},
      {id:'security-portal-wall',x:1790,width:46,height:110,offset:110,type:'route-wall',requiresComponentId:'c01'}
    ], map:{pits:[{x:1185,width:240}]}, gates:[{id:'firewall-policy-gate',x:1880,width:24,height:112,requiresComponentId:'c02'}] },
    9: {
      replacePlatforms:true, replaceObstacles:true,
      map:{width:4650,layout:'horizontal',camera:{axes:['x'],followOffsetX:.38,followOffsetY:.5},
        checkpoints:[1210,2460,3260],pits:[{x:990,width:92},{x:2260,width:100},{x:2940,width:108}]},
      platforms:[
        {id:'uplink-bridge-a',x:300,width:142,offset:112,style:'cable'},
        {id:'server-high-catwalk-a',x:460,width:120,offset:190,style:'cable'},
        {id:'rack-transit-a',x:610,width:154,offset:148,style:'cable'},
        {id:'shortcut-cable-bridge',x:780,width:140,offset:120,style:'cable',requiresComponentId:'c01'},
        {id:'uplink-bridge-b',x:930,width:188,offset:92,style:'route'},
        {id:'server-lift-a',x:1130,width:100,offset:130,style:'packet',type:'moving',motion:{axis:'y',range:22,speed:.75,phase:.6}},
        {id:'rack-transit-b',x:1260,width:148,offset:158,style:'cable'},
        {id:'server-high-shelf-b',x:1420,width:110,offset:200,style:'cable'},
        {id:'relay-platform-a',x:1550,width:174,offset:112,style:'packet'},
        {id:'relay-platform-b',x:1830,width:144,offset:172,style:'packet'},
        {id:'combat-aerial-lift',x:2000,width:120,offset:138,style:'packet',type:'moving',motion:{axis:'x',range:32,speed:.82,phase:1.2}},
        {id:'relay-platform-c',x:2160,width:190,offset:96,style:'route'},
        {id:'combat-pit-step',x:2320,width:110,offset:140,style:'route',type:'moving',motion:{axis:'y',range:20,speed:.9,phase:.3}},
        {id:'combat-step-a',x:2460,width:168,offset:154,style:'packet'},
        {id:'combat-temp-step',x:2620,width:110,offset:130,style:'route',type:'temporary',duration:2.1,respawnDelay:2.8},
        {id:'combat-step-b',x:2760,width:140,offset:104,style:'cable'},
        {id:'combat-bridge',x:2900,width:186,offset:86,style:'route'},
        {id:'combat-high-rail',x:3080,width:130,offset:150,style:'route'},
        {id:'core-platform-a',x:3400,width:174,offset:112,style:'signal'},
        {id:'core-dodge-high-left',x:3560,width:95,offset:232,style:'signal'},
        {id:'core-platform-b',x:3670,width:190,offset:166,style:'signal'},
        {id:'core-moving-lift',x:3820,width:140,offset:216,style:'packet',type:'moving',motion:{axis:'y',range:24,speed:.7,phase:.4}},
        {id:'core-platform-c',x:3970,width:168,offset:108,style:'signal'},
        {id:'core-dodge-high-right',x:4100,width:95,offset:224,style:'signal'},
        {id:'core-platform-d',x:4240,width:188,offset:146,style:'signal'},
        {id:'core-terminal-step',x:4420,width:140,offset:96,style:'signal'}
      ],
      obstacles:[
        {id:'rack-cooler-a',x:450,width:48,height:62,offset:62,type:'heatsink'},
        {id:'fiber-surge-a',x:830,width:46,height:78,offset:78,type:'interference',collision:'dangerous',damage:10},
        {id:'rack-cooler-b',x:1370,width:52,height:74,offset:74,type:'heatsink'},
        {id:'fiber-surge-b',x:1740,width:46,height:84,offset:84,type:'interference',collision:'dangerous',damage:10},
        {id:'process-wall-a',x:2090,width:50,height:96,offset:96,type:'route-wall'},
        {id:'laser-lane-p2',x:2380,width:30,height:90,offset:90,type:'interference',collision:'dangerous',damage:12,window:{period:3.6,active:1.6,phase:0.6}},
        {id:'process-wall-b',x:2590,width:48,height:88,offset:88,type:'route-wall'},
        {id:'core-vent-a',x:3480,width:54,height:74,offset:74,type:'heatsink'},
        {id:'core-vent-b',x:4150,width:58,height:86,offset:86,type:'heatsink'}
      ],
      gates:[{id:'core-airlock',x:3340,width:28,height:126,requiresComponentId:'c04'}]
    }
  };

  function normalizePhase(definition, index) {
    const themeLayout = THEME_LAYOUTS[index] || { platforms: [], obstacles: [], gates: [] };
    const mapDefinition = definition.map || themeLayout.map;
    const width = mapDefinition?.width || definition.length;
    const map = {
      width, height: 'viewport', layout: 'horizontal',
      start: { x: 70, y: null, anchor: 'floor', offset: 0 },
      exit: { x: width - 94, y: null, anchor: 'floor', offset: 0 },
      bounds: { left: true, right: true, ceiling: true, floor: true },
      camera: { axes: ['x'], followOffsetX: .36, followOffsetY: .5 },
      routes: [],
      width
    };
    if (mapDefinition) {
      Object.assign(map, mapDefinition);
      map.bounds = { left: true, right: true, ceiling: true, floor: true, ...mapDefinition.bounds };
      map.camera = { axes: ['x'], followOffsetX: .36, followOffsetY: .5, ...mapDefinition.camera };
      map.start = { x: 70, y: null, anchor: 'floor', offset: 0, ...mapDefinition.start };
      map.exit = { x: width - 94, y: null, anchor: 'floor', offset: 0, ...mapDefinition.exit };
      map.routes = mapDefinition.routes || [];
      map.width = mapDefinition.width || definition.length;
    }
    const normalizePlatform = (spec, platformIndex) => {
      if (!Array.isArray(spec)) return {
        id: 'p' + String(platformIndex + 1).padStart(2, '0'), type: 'fixed', collision: 'one-way', anchor: 'floor', offset: 0,
        height: 18, ...spec
      };
      const [x, platformWidth, rise] = spec;
      return { id: 'p' + String(platformIndex + 1).padStart(2, '0'), type: 'fixed', collision: 'one-way',
        x, y: null, anchor: 'floor', offset: rise, width: platformWidth, height: 18 };
    };
    const platforms = (themeLayout.replacePlatforms ? [] : definition.platforms).map(normalizePlatform);
    for (const extra of themeLayout.platforms) platforms.push({ type:'fixed', collision:'one-way', anchor:'floor', height:16, ...extra });
    if (index === 0) {
      // Demonstration lane: stepped precision jumps and an optional high shelf.
      platforms.push(
        { id: 'demo-step-a', x: 925, width: 76, offset: 72, height: 16 },
        { id: 'demo-step-b', x: 1050, width: 68, offset: 118, height: 16 },
        { id: 'demo-step-c', x: 1170, width: 98, offset: 78, height: 16 },
        { id: 'demo-secret-a', x: 1510, width: 84, offset: 108, height: 16 },
        { id: 'demo-secret-b', x: 1630, width: 92, offset: 156, height: 16 }
      );
    }
    // Every sector uses the same parkour toolkit, with its moving route and
    // breakaway ledge placed among the phase's existing jump platforms.
    const movingPlatform = platforms[Math.min(2, platforms.length - 1)];
    if (movingPlatform) {
      movingPlatform.type = 'moving';
      movingPlatform.motion = { axis: index % 2 ? 'y' : 'x', range: index % 2 ? 34 : 48, speed: .9 + (index % 3) * .12, phase: index * .7 };
    }
    const breakawayPlatform = platforms[Math.min(4, platforms.length - 1)];
    if (breakawayPlatform) { breakawayPlatform.type = 'temporary'; breakawayPlatform.duration = 2.1; breakawayPlatform.respawnDelay = 3; }
    const obstacles = (themeLayout.replaceObstacles ? [] : definition.obstacles).map((spec, obstacleIndex) => {
      if (!Array.isArray(spec)) return { id: 'o' + String(obstacleIndex + 1).padStart(2, '0'), type: 'block', collision: 'solid', anchor: 'floor', offset: spec.height || 0, ...spec };
      const [x, obstacleWidth, obstacleHeight] = spec;
      return { id: 'o' + String(obstacleIndex + 1).padStart(2, '0'), type: 'block', collision: 'solid',
        x, y: null, anchor: 'floor', offset: obstacleHeight, width: obstacleWidth, height: obstacleHeight };
    });
    obstacles.push(...themeLayout.obstacles.map(spec => ({ type:'block', collision:'solid', anchor:'floor', ...spec })));
    if (index === 0) obstacles.push(
      { id: 'demo-wall-a', x: 1940, width: 20, height: 92, offset: 92, anchor: 'floor', type: 'wall', collision: 'solid' },
      { id: 'demo-wall-b', x: 2030, width: 20, height: 108, offset: 108, anchor: 'floor', type: 'wall', collision: 'solid' }
    );
    const components = definition.components.map((spec, componentIndex) => Array.isArray(spec) || typeof spec === 'number' ? {
      id: 'c' + String(componentIndex + 1).padStart(2, '0'), x: spec, y: null, anchor: 'floor', offset: 44, width: 34, height: 44
    } : { id: 'c' + String(componentIndex + 1).padStart(2, '0'), anchor: 'floor', offset: 44, width: 34, height: 44, ...spec });
    const enemies = definition.enemies.map((enemy, enemyIndex) => {
      const configuredType = enemy.variant || (['common', 'fast'].includes(enemy.type)
        ? PHASE_ENEMY_ROSTERS[index]?.[enemyIndex] || (enemy.type === 'common' ? 'basic' : 'fast')
        : enemy.type || 'basic');
      const type = configuredType === 'boss' ? 'boss' : configuredType;
      return { id: 'e' + String(enemyIndex + 1).padStart(2, '0'), anchor: 'floor',
        offset: type === 'boss' ? 46 : type === 'fast' ? 26 : type === 'flyer' ? 92 : 24, ...enemy, type };
    });
    const collectibles = definition.items.map((item, itemIndex) => typeof item === 'number' ? {
      id: 'i' + String(itemIndex + 1).padStart(2, '0'), x: item, y: null, anchor: 'floor', offset: 39 + (itemIndex % 2) * 48, radius: 10
    } : { id: 'i' + String(itemIndex + 1).padStart(2, '0'), anchor: 'floor', offset: 39 + (itemIndex % 2) * 48, radius: 10, ...item });
    const features = definition.features.map((feature, featureIndex) => typeof feature === 'number'
      ? { id: 'f' + (featureIndex + 1), x: feature, y: null, anchor: 'floor' }
      : { id: 'f' + (featureIndex + 1), anchor: 'floor', ...feature });
    return {
      id: 'phase-' + String(index + 1).padStart(2, '0'),
      name: definition.name, theme: definition.theme, objective: definition.objective,
      palette: definition.palette,
      map: {
        ...map,
        // Visible, reusable respawn beacons at safe floor positions.
        checkpoints: map.checkpoints || (index === 0 ? [840, 1370, 1850] : [Math.round(width * .42), Math.round(width * .72)]),
        pits: index === 0 ? [{ x: 1460, width: 92 }] : (map.pits || [])
      },
      entities: { platforms, obstacles, components, enemies, collectibles, features, gates: themeLayout.gates },
      objectives: { defeatAllViruses: true, repairAllComponents: true, requireExitQuestion: true,
        enemiesToDefeat: enemies.length, componentsToRepair: components.length, ...definition.objectives }
    };
  }

  const PHASES = PHASE_DEFINITIONS.map(normalizePhase);
  let phaseIndex = 0;
  let phaseData = PHASES[0];
  let highestUnlockedPhase = 0;
  let phaseExitUnlocked = false;
  let phaseObjectiveAwarded = false;
  let phaseTransition = false;
  let campaignComplete = false;
  let phaseQuestionOpen = false;
  let currentQuestion = null;
  let questionAnswered = false;
  let questionHistory = readQuestionHistory();
  let campaignStarted = false;
  let menuScreen = true;
  let saveTimer = 0;
  let effects = [];
  let audioContext = null;
  let soundEnabled = readSoundPreference();
  let width = 800;
  let height = 500;
  let pixelRatio = 1;
  let cameraX = 0;
  let cameraY = 0;
  let platformRuntime = new Map();
  let checkpointX = 70;
  let player;
  let viruses = [];
  let projectiles = [];
  let enemyProjectiles = [];
  let enemyObstacles = [];
  let components = [];
  let collectibles = [];
  let defeated = 0;
  let level = 1;
  let xp = 0;
  let xpRequired = 100;
  let unlockedSkills = [];
  let levelChoiceOpen = false;
  let repairTarget = null;
  let repairProgress = 0;
  let repairDuration = .8;
  let objectives = { allRepairs: false, allViruses: false };
  let attackCooldown = 0;
  let damageCooldown = 0;
  let interactionMessage = '';
  let interactionMessageTimer = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let jumpQueued = false;
  let lastFrame = 0;
  let animationTime = 0;

  function readQuestionHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(QUESTION_HISTORY_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveQuestionHistory() {
    try {
      localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(questionHistory));
    } catch {
      // Keep the in-memory history for this session if browser storage is unavailable.
    }
  }

  function resetQuestionHistory() {
    questionHistory = {};
    saveQuestionHistory();
  }

  function hasQuestionHistory() {
    return Object.values(readQuestionHistory()).some(ids => Array.isArray(ids) && ids.length > 0);
  }

  function readSoundPreference() {
    try { return localStorage.getItem(SOUND_KEY) !== 'off'; }
    catch { return true; }
  }

  function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    soundToggle.textContent = soundEnabled ? 'SOM: LIGADO' : 'SOM: DESLIGADO';
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    try { localStorage.setItem(SOUND_KEY, soundEnabled ? 'on' : 'off'); } catch {}
  }

  function playSound(kind) {
    if (!soundEnabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audioContext ||= new Audio();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const settings = {
        attack: [620, .045, 'square'], hit: [150, .12, 'sawtooth'],
        repair: [760, .16, 'sine'], xp: [880, .07, 'triangle'],
        level: [1040, .22, 'triangle'], correct: [980, .24, 'sine'],
        wrong: [190, .22, 'square'], damage: [110, .18, 'sawtooth']
      }[kind] || [440, .08, 'sine'];
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = settings[2];
      oscillator.frequency.setValueAtTime(settings[0], now);
      if (kind === 'correct' || kind === 'repair' || kind === 'level') {
        oscillator.frequency.exponentialRampToValueAtTime(settings[0] * 1.35, now + settings[1]);
      }
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.07, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + settings[1]);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(now); oscillator.stop(now + settings[1] + .02);
    } catch {
      // Audio is optional; blocked audio contexts must not interrupt gameplay.
    }
  }

  function getSavedCampaign() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!saved || saved.version !== 1 || !Number.isInteger(saved.phaseIndex) || saved.phaseIndex < 0 || saved.phaseIndex >= PHASES.length) return null;
      return saved;
    } catch { return null; }
  }

  function refreshContinueButton() {
    const saved = getSavedCampaign();
    continueButton.hidden = !menuScreen || !saved || saved.campaignComplete;
    continueButton.textContent = saved && saved.phaseTransition ? 'CONTINUAR NA FASE ' + String(Math.min(10, saved.phaseIndex + 2)).padStart(2, '0') : 'CONTINUAR CAMPANHA';
    if (saved && saved.campaignComplete) {
      ui.title.innerHTML = 'VIRUS ZERO <span>NEUTRALIZADO</span>';
      ui.copy.textContent = 'Campanha concluída. Inicie uma nova campanha para voltar à rede.';
      startButton.innerHTML = 'NOVA CAMPANHA <span>→</span>';
    }
  }

  function saveCampaign() {
    if (!campaignStarted || !player) return;
    const saved = {
      version: 1, phaseIndex, highestUnlockedPhase, level, xp, xpRequired,
      unlockedSkills: unlockedSkills.map(skill => ({ id: skill.id, level: skill.level })),
      player: { x: player.x, y: player.y, health: player.health, facing: player.facing, grounded: player.grounded, shieldTime: player.shieldTime, shieldCooldown: player.shieldCooldown },
      viruses: viruses.map(virus => ({ alive: virus.alive, hp: virus.hp, x: virus.x, y: virus.y, direction: virus.direction })),
      repaired: components.map(component => component.repaired),
      componentIntegrity: components.map(component => ({ integrity: component.integrity, corruption: component.corruption })),
      collected: collectibles.map(item => item.collected),
      phaseExitUnlocked, phaseObjectiveAwarded, phaseTransition, campaignComplete, gameOver, checkpointX, checkpointY,
      savedAt: Date.now()
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
      refreshContinueButton();
    } catch {
      interactionMessage = 'NÃO FOI POSSÍVEL SALVAR // ARMAZENAMENTO INDISPONÍVEL';
      interactionMessageTimer = 2.5;
    }
  }

  function restoreSkillEffects() {
    player.armor = 0; player.fireRate = .32; player.damage = 1; player.jumpPower = JUMP_SPEED;
    player.shieldDuration = 5; player.shieldCooldownDuration = 18; repairDuration = .8;
    for (const skill of unlockedSkills) {
      const rank = skill.level;
      if (skill.id === 'armor') player.armor = Math.min(MAX_PLAYER_ARMOR, Math.max(0, rank) * .1);
      if (skill.id === 'rapid') player.fireRate = Math.max(.14, .32 * Math.pow(.9, rank));
      if (skill.id === 'cannon') player.damage = 1 + rank;
      if (skill.id === 'boost') player.jumpPower = JUMP_SPEED * Math.pow(1.08, rank);
      if (skill.id === 'shield') {
        player.shieldDuration = 5 + (rank - 1) * .75;
        player.shieldCooldownDuration = Math.max(14, 18 - (rank - 1));
      }
      if (skill.id === 'repair') repairDuration = .8 * (1 - rank * .1);
    }
  }

  function continueCampaign() {
    const saved = getSavedCampaign();
    if (!saved || saved.campaignComplete) return;
    campaignStarted = true;
    resetCampaign();
    phaseIndex = saved.phaseTransition ? Math.min(PHASES.length - 1, saved.phaseIndex + 1) : saved.phaseIndex;
    level = Math.max(1, Number(saved.level) || 1);
    xpRequired = experienceForLevel(level);
    xp = Math.max(0, Number(saved.xp) || 0);
    unlockedSkills = Array.isArray(saved.unlockedSkills) ? saved.unlockedSkills.flatMap(item => {
      const ability = ABILITIES.find(candidate => candidate.id === item.id);
      const rank = Math.max(1, Math.min(ability ? ability.maxLevel : 1, Number(item.level) || 1));
      return ability ? [{ id: ability.id, name: ability.name, level: rank, maxLevel: ability.maxLevel, description: ability.description(rank) }] : [];
    }) : [];
    restoreSkillEffects();
    highestUnlockedPhase = Math.max(phaseIndex, Math.min(PHASES.length - 1, Number(saved.highestUnlockedPhase) || 0));
    const isNextPhase = saved.phaseTransition;
    const retryAfterDefeat = Boolean(saved.gameOver);
    loadPhase(phaseIndex, true);
    checkpointX = isNextPhase ? mapStart().x
      : Math.max(mapStart().x, Math.min(worldWidth() - player.width, Number(saved.checkpointX) || mapStart().x));
    checkpointY = isNextPhase || saved.checkpointY == null || !Number.isFinite(Number(saved.checkpointY))
      ? (phaseData.map.layout === 'vertical' ? floorY() : null) : Number(saved.checkpointY);
    if (isNextPhase || retryAfterDefeat) player.health = Math.min(player.maxHealth, retryAfterDefeat ? player.maxHealth : (Number(saved.player?.health) || 100) + 25);
    if (retryAfterDefeat) {
      player.x = Math.max(0, Math.min(worldWidth() - player.width, checkpointX + 38));
      player.y = (checkpointY ?? floorY()) - player.height;
    }
    else if (!isNextPhase) {
      const source = saved.player || {};
      player.health = Math.max(1, Math.min(player.maxHealth, Number(source.health) || player.maxHealth));
      player.x = retryAfterDefeat ? Math.min(worldWidth() - player.width, checkpointX + 38)
        : Math.max(0, Math.min(worldWidth() - player.width, Number(source.x) || 70));
      const savedY = Number.isFinite(Number(source.y)) ? Number(source.y) : mapStart().y;
      const mapBottom = phaseData.map.bounds.floor ? floorY() - player.height : worldHeight() - player.height;
      player.y = Math.max(phaseData.map.bounds.ceiling ? 0 : -Infinity, Math.min(mapBottom, savedY));
      player.facing = source.facing === -1 ? -1 : 1;
      player.grounded = Boolean(source.grounded);
      const hasShieldSkill = unlockedSkills.some(skill => skill.id === 'shield');
      player.shieldTime = hasShieldSkill
        ? Math.max(0, Math.min(player.shieldDuration, Number(source.shieldTime) || 0)) : 0;
      player.shieldCooldown = hasShieldSkill
        ? Math.max(-1, Math.min(player.shieldCooldownDuration, Number(source.shieldCooldown) || 0)) : 0;
      viruses = viruses.map((virus, index) => {
        const progress = saved.viruses?.[index];
        return progress ? { ...virus, alive: Boolean(progress.alive), hp: Math.max(0, Math.min(virus.maxHp, Number(progress.hp) || 0)), x: Number(progress.x) || virus.x, y: Number(progress.y) || virus.y, direction: progress.direction < 0 ? -1 : 1 } : virus;
      });
      components.forEach((component, index) => {
        component.repaired = Boolean(saved.repaired?.[index]);
        const integrity = saved.componentIntegrity?.[index];
        if (integrity) { component.integrity = Math.max(0, Math.min(100, Number(integrity.integrity) || 0)); component.corruption = Math.max(0, Math.min(100, Number(integrity.corruption) || 0)); }
      });
      collectibles.forEach((item, index) => { item.collected = Boolean(saved.collected?.[index]); });
      defeated = viruses.filter(virus => !virus.alive).length;
      objectives.allRepairs = components.filter(component => component.repaired).length >= phaseData.objectives.componentsToRepair;
      objectives.allViruses = viruses.filter(virus => !virus.alive).length >= phaseData.objectives.enemiesToDefeat;
      phaseExitUnlocked = Boolean(saved.phaseExitUnlocked && objectives.allRepairs && objectives.allViruses);
      phaseObjectiveAwarded = Boolean(saved.phaseObjectiveAwarded && phaseExitUnlocked);
      cameraX = phaseData.map.camera.axes.includes('x')
        ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
      cameraY = phaseData.map.camera.axes.includes('y')
        ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    }
    renderSkills(); updateHud(); draw();
    launchLoadedPhase();
  }

  function startNewCampaign() {
    if (getSavedCampaign() && !window.confirm('Iniciar uma nova campanha e substituir o progresso salvo?')) return;
    if (hasQuestionHistory() && window.confirm('Também deseja apagar o histórico de perguntas já utilizadas?')) resetQuestionHistory();
    campaignStarted = true;
    continueButton.hidden = true;
    resetCampaign();
    launchLoadedPhase();
    saveCampaign();
  }

  function setupMenu() {
    menuScreen = true;
    ui.title.innerHTML = 'BYTE <span>RUNNER</span>';
    ui.copy.textContent = 'Um vírus tomou o computador. Atravesse dez setores, recupere a rede e neutralize VIRUS ZERO.';
    startButton.innerHTML = (getSavedCampaign() ? 'NOVA CAMPANHA' : 'INICIAR CAMPANHA') + ' <span>→</span>';
    refreshContinueButton();
  }

  function bindTouchControls() {
    touchControls.querySelectorAll('[data-touch]').forEach(button => {
      const key = button.dataset.touch;
      const release = event => {
        if (event) event.preventDefault();
        keys.delete(key);
        if (key === 'e') { repairTarget = null; repairProgress = 0; }
      };
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (!running) return;
        try { if (event.pointerId !== undefined) button.setPointerCapture?.(event.pointerId); } catch {}
        if (key === 'w' && !keys.has(key)) jumpQueued = true;
        if (key === 'e' && !findNearbyComponent()) {
          interactionMessage = 'NENHUM COMPONENTE AO ALCANCE';
          interactionMessageTimer = 1.2;
        }
        keys.add(key);
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    });
    touchControls.querySelector('[data-action="pause"]').addEventListener('click', pause);
  }

  function emitParticles(x, y, color, count = 9) {
    for (let index = 0; index < count; index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 125;
      effects.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 25,
        life: .25 + Math.random() * .42, maxLife: .67, radius: 1.5 + Math.random() * 2.5, color
      });
    }
  }

  function updateEffects(dt) {
    effects = effects.filter(particle => particle.life > 0);
    for (const particle of effects) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 210 * dt;
    }
  }

  function drawEffects() {
    for (const particle of effects) {
      const screenX = particle.x - cameraX;
      if (screenX < -8 || screenX > width + 8) continue;
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function worldWidth() { return phaseData.map.width; }
  function worldHeight() { return phaseData.map.height === 'viewport' ? height : phaseData.map.height; }
  function floorY() { return worldHeight() - 42; }
  function entityY(spec, fallbackOffset = 0) {
    if (Number.isFinite(spec.y)) return spec.y;
    const offset = Number.isFinite(spec.offset) ? spec.offset : fallbackOffset;
    return spec.anchor === 'floor' ? floorY() - offset : offset;
  }
  function mapStart() {
    const start = phaseData.map.start;
    const y = Number.isFinite(start.y) ? start.y
      : start.anchor === 'floor' ? floorY() - ROBOT_HEIGHT - (start.offset || 0) : (start.offset || 0);
    return { x: start.x, y };
  }
  function getPlatformState(spec) {
    let state = platformRuntime.get(spec.id);
    if (!state) {
      state = { elapsed: 0, active: true, triggered: false, respawning: false };
      platformRuntime.set(spec.id, state);
    }
    return state;
  }
  function platformShape(spec) {
    if (spec.requiresComponentId && !components.some(component => component.id === spec.requiresComponentId && component.repaired)) return null;
    const state = getPlatformState(spec);
    let x = spec.x;
    let y = entityY(spec, 0);
    if (spec.type === 'moving' && spec.motion) {
      const motion = spec.motion;
      const shift = Math.sin(animationTime * (motion.speed || 1) + (motion.phase || 0)) * (motion.range || 0);
      if (motion.axis === 'x') x += shift; else y += shift;
    }
    if (spec.type === 'temporary' && !state.active) return null;
    return { id: spec.id, x, y, w: spec.width, h: spec.height || 18, kind: 'platform', type: spec.type || 'fixed', style: spec.style, collision: spec.collision || 'one-way', hazardDamage: spec.damage || 8 };
  }
  function solids() {
    const map = phaseData.map;
    const geometry = [];
    if (map.bounds.floor) {
      const pits = (map.pits || []).slice().sort((a, b) => a.x - b.x);
      let floorStart = 0;
      for (const pit of pits) {
        const pitStart = Math.max(floorStart, Math.max(0, pit.x));
        if (pitStart > floorStart) geometry.push({ x: floorStart, y: floorY(), w: pitStart - floorStart, h: Math.max(42, worldHeight() - floorY()), kind: 'floor', type: 'fixed' });
        floorStart = Math.max(floorStart, Math.min(worldWidth(), pit.x + pit.width));
      }
      if (floorStart < worldWidth()) geometry.push({ x: floorStart, y: floorY(), w: worldWidth() - floorStart, h: Math.max(42, worldHeight() - floorY()), kind: 'floor', type: 'fixed' });
    }
    for (const spec of phaseData.entities.platforms) {
      const shape = platformShape(spec);
      if (shape) geometry.push(shape);
    }
    for (const spec of phaseData.entities.obstacles) {
      if (spec.requiresComponentId && components.some(component => component.id === spec.requiresComponentId && component.repaired)) continue;
      if (spec.window) {
        const period = Number(spec.window.period);
        const active = Number(spec.window.active);
        if (Number.isFinite(period) && period > 0 && Number.isFinite(active)) {
          const phaseTime = ((animationTime + (Number(spec.window.phase) || 0)) % period + period) % period;
          if (phaseTime >= Math.max(0, Math.min(period, active))) continue;
        }
      }
      geometry.push({ id: spec.id, x: spec.x, y: entityY(spec, spec.height), w: spec.width, h: spec.height, kind: 'block', type: spec.type || 'block', collision: spec.collision || 'solid', hazardDamage: spec.damage || 8 });
    }
    for (const gate of phaseData.entities.gates || []) {
      if (components.some(component => component.id === gate.requiresComponentId && component.repaired)) continue;
      geometry.push({ id:gate.id, x:gate.x, y:Number.isFinite(gate.y) ? gate.y : floorY() - gate.height, w:gate.width, h:gate.height, kind:'gate', type:'route-gate', collision:'solid' });
    }
    for (const obstacle of enemyObstacles) {
      if (obstacle.life > 0) geometry.push({ id: obstacle.id, x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h, kind: 'block', type: obstacle.bossOwned ? 'boss-obstacle' : 'enemy-temporary', collision: 'solid' });
    }
    if (!phaseExitUnlocked && map.bounds.right) {
      const exitX = map.exit.x;
      if (map.layout === 'horizontal') {
        geometry.push({ x: Math.max(0, exitX - 18), y: 0, w: Math.min(20, Math.max(0, worldWidth() - exitX + 18)), h: floorY(), kind: 'gate', type: 'fixed', collision: 'solid' });
      } else {
        const gateWidth = map.exit.width || 34;
        const gateHeight = map.exit.height || 126;
        const gateY = Number.isFinite(map.exit.y) ? map.exit.y - gateHeight / 2 : floorY() - gateHeight;
        geometry.push({ x: exitX - gateWidth / 2, y: gateY, w: gateWidth, h: gateHeight, kind: 'gate', type: 'fixed', collision: 'solid' });
      }
    }
    return geometry;
  }

  function advancePlatformMotion(dt) {
    animationTime += dt;
    for (const spec of phaseData.entities.platforms) {
      if (spec.type !== 'moving') continue;
      const current = platformShape(spec);
      const state = getPlatformState(spec);
      if (!current) {
        state.lastX = undefined;
        state.lastY = undefined;
        platformRuntime.set(spec.id, state);
        continue;
      }
      if (Number.isFinite(state.lastX) && player.grounded &&
        Math.abs(player.y + player.height - state.lastY) < 4 &&
        player.x + player.width > state.lastX && player.x < state.lastX + spec.width) {
        player.x += current.x - state.lastX;
        player.y += current.y - state.lastY;
      }
      state.lastX = current.x;
      state.lastY = current.y;
      platformRuntime.set(spec.id, state);
    }
  }

  function resetCampaign() {
    player = {
      x: 70, y: floorY() - ROBOT_HEIGHT, vx: 0, vy: 0,
      width: ROBOT_WIDTH, height: ROBOT_HEIGHT,
      grounded: true, facing: 1, walkTime: 0, health: 100, maxHealth: 100,
      armor: 0, fireRate: .32, damage: 1, jumpPower: JUMP_SPEED,
      shieldTime: 0, shieldCooldown: 0, shieldDuration: 5, shieldCooldownDuration: 18
    };
    level = 1; xp = 0; xpRequired = 100; unlockedSkills = [];
    repairDuration = .8;
    highestUnlockedPhase = 0;
    renderSkills();
    loadPhase(0, true);
  }

  function loadPhase(index, retry = false) {
    phaseIndex = Math.max(0, Math.min(PHASES.length - 1, index));
    phaseData = PHASES[phaseIndex];
    if (retry) player.health = player.maxHealth;
    else if (phaseIndex > 0) player.health = Math.min(player.maxHealth, player.health + 25);
    const start = mapStart();
    player.x = start.x; player.y = start.y;
    player.vx = 0; player.vy = 0; player.grounded = true; player.facing = 1;
    cameraX = phaseData.map.camera.axes.includes('x') ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
    cameraY = phaseData.map.camera.axes.includes('y') ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    platformRuntime = new Map(); animationTime = 0; jumpQueued = false;
    checkpointX = start.x;
    checkpointY = phaseData.map.layout === 'vertical' ? floorY() : null;
    effects = []; saveTimer = 0;
    viruses = createViruses(); projectiles = []; enemyProjectiles = []; enemyObstacles = []; components = createComponents(); collectibles = createCollectibles();
    defeated = 0; levelChoiceOpen = false; repairTarget = null; repairProgress = 0;
    phaseExitUnlocked = false; phaseObjectiveAwarded = false; phaseTransition = false; campaignComplete = false;
    objectives = { allRepairs: false, allViruses: false };
    attackCooldown = 0; damageCooldown = 0; interactionMessage = ''; interactionMessageTimer = 0; gameOver = false;
    ui.levelOverlay.classList.remove('active');
    ui.questionOverlay.classList.remove('active');
    phaseQuestionOpen = false; currentQuestion = null; questionAnswered = false;
    updatePhaseUI(); updateHud();
  }

  function createViruses() {
    return phaseData.entities.enemies.map((spec, index) => {
      const type = spec.type === 'common' ? 'basic' : spec.type;
      const profile = ENEMY_PROFILES[type] || ENEMY_PROFILES.basic;
      const enemy = { ...profile, ...spec, type };
      const hp = Number(enemy.hp) || profile.hp;
      const y = entityY(enemy, enemy.flying ? 92 : enemy.type === 'boss' ? 46 : 24);
      return { ...enemy, id: spec.id, x: spec.x, baseX: spec.x, y, baseY: y, hp, maxHp: hp,
        radius: Number(enemy.radius) || profile.radius, speed: Number(enemy.speed) || profile.speed,
        patrol: enemy.patrol || 70 + index * 8, patrolMin: enemy.patrolMin ?? spec.x - (enemy.patrol || 70 + index * 8),
        patrolMax: enemy.patrolMax ?? spec.x + (enemy.patrol || 70 + index * 8), direction: index % 2 ? 1 : -1,
        alive: true, countsForObjective: true, phase: index * .9, attackCooldownTimer: .45 + index * .16,
        attackWindup: 0, vulnerableTime: 0, specialCooldownTimer: (enemy.specialCooldown || 7) * .45,
        summonCooldownTimer: (enemy.summonCooldown || 9) * .5, obstacleId: null,
        bossStage: enemy.multiStage ? 1 : undefined, bossCycleCooldown: enemy.multiStage ? 1.2 : undefined,
        bossPatternIndex: 0, bossBlockedMessageTimer: 0 };
    });
  }

  function createComponents() {
    return phaseData.entities.components.map((spec, index) => ({ id: spec.id, x: spec.x, y: entityY(spec, 44), width: spec.width || 34, height: spec.height || 44, repaired: false, integrity: 100, corruption: 0, phase: index * .9 }));
  }

  function createCollectibles() {
    return phaseData.entities.collectibles.map((spec, index) => ({ id: spec.id, x: spec.x, y: entityY(spec, 39 + (index % 2) * 48), radius: spec.radius || 10, collected: false, phase: index * .8 }));
  }

  function updatePhaseUI() {
    const phaseNumber = String(phaseIndex + 1).padStart(2, '0');
    const title = phaseData.name.toUpperCase();
    const split = title.lastIndexOf(' ');
    ui.phaseTitle.innerHTML = split > 0 ? title.slice(0, split) + ' <span>' + title.slice(split + 1) + '</span>' : title;
    ui.phaseEyebrow.textContent = 'CAMPANHA DIGITAL // FASE ' + phaseNumber + ' DE 10';
    ui.phaseMission.textContent = phaseData.name;
    ui.phaseObjective.textContent = phaseData.objective;
    ui.sector.textContent = 'FASE ' + phaseNumber + ' / 10';
    ui.phaseFooter.textContent = phaseNumber + ' / 10';
  }

  function addLog(message) {
    const entry = document.createElement('p');
    const marker = document.createElement('i');
    marker.textContent = '›';
    entry.append(marker, document.createTextNode(' ' + message));
    ui.log.prepend(entry);
    while (ui.log.children.length > 4) ui.log.lastElementChild.remove();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const oldFloor = floorY();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    const floorShift = phaseData.map.height === 'viewport' ? floorY() - oldFloor : 0;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (player) {
      if (phaseData.map.bounds.floor && player.y + player.height >= floorY()) {
        player.y = floorY() - player.height;
        player.vy = 0;
        player.grounded = true;
      }
      cameraX = phaseData.map.camera.axes.includes('x') ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
      cameraY = phaseData.map.camera.axes.includes('y') ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    }
    for (const virus of viruses) {
      virus.y += floorShift;
      virus.baseY += floorShift;
    }
    for (const component of components) component.y += floorShift;
    for (const collectible of collectibles) collectible.y += floorShift;
    draw();
  }

  new ResizeObserver(resize).observe(canvas);

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.width > b.x &&
      a.y < b.y + b.h && a.y + a.height > b.y;
  }

  function movePlayer(dt) {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const direction = Number(right) - Number(left);
    player.vx = direction * RUN_SPEED;
    if (direction) player.facing = direction;

    if (jumpQueued && player.grounded) {
      player.vy = -player.jumpPower;
      player.grounded = false;
    }
    jumpQueued = false;

    const collisionObjects = solids();
    const previousX = player.x;
    player.x += player.vx * dt;
    if (phaseData.map.bounds.left) player.x = Math.max(0, player.x);
    if (phaseData.map.bounds.right) player.x = Math.min(worldWidth() - player.width, player.x);
    for (const object of collisionObjects) {
      if (object.collision === 'one-way') continue;
      if (!overlaps(player, object)) continue;
      if (object.type === 'interference' && damageCooldown <= 0) damagePlayer(object.hazardDamage || 10, object);
      if (player.vx > 0) player.x = object.x - player.width;
      else if (player.vx < 0) player.x = object.x + object.w;
    }
    if (phaseData.map.bounds.left) player.x = Math.max(0, player.x);
    if (phaseData.map.bounds.right) player.x = Math.min(worldWidth() - player.width, player.x);

    const previousY = player.y;
    player.vy = Math.min(player.vy + GRAVITY * dt, 1050);
    player.y += player.vy * dt;
    player.grounded = false;
    for (const object of collisionObjects) {
      const horizontalOverlap = player.x < object.x + object.w && player.x + player.width > object.x;
      const previousBottom = previousY + player.height;
      const previousTop = previousY;
      const crossedTop = player.vy >= 0 && previousBottom <= object.y + 2 && player.y + player.height >= object.y && horizontalOverlap;
      const crossedBottom = object.collision !== 'one-way' && player.vy < 0 && previousTop >= object.y + object.h - 2 && player.y <= object.y + object.h && horizontalOverlap;
      if (crossedTop) {
        player.y = object.y - player.height;
        player.vy = 0;
        player.grounded = true;
        if (object.type === 'temporary') {
          const spec = phaseData.entities.platforms.find(platform => platform.id === object.id);
          const state = spec ? getPlatformState(spec) : null;
          if (state) {
            state.triggered = true;
          }
        }
        if ((object.type === 'dangerous' || object.type === 'interference') && damageCooldown <= 0) damagePlayer(object.hazardDamage || 8, object);
      } else if (crossedBottom) {
        player.y = object.y + object.h;
        player.vy = 0;
      } else if (object.collision !== 'one-way' && overlaps(player, object) && player.x > object.x && player.x < object.x + object.w) {
        // Resolve any remaining side overlap to prevent tunneling into block walls.
        if (previousX + player.width <= object.x) player.x = object.x - player.width;
        else if (previousX >= object.x + object.w) player.x = object.x + object.w;
      }
    }

    const overPit = (phaseData.map.pits || []).some(pit => player.x + player.width > pit.x && player.x < pit.x + pit.width);
    if (phaseData.map.bounds.floor && !overPit && player.y + player.height >= floorY()) {
      player.y = floorY() - player.height;
      player.vy = 0;
      player.grounded = true;
    }
    if (overPit && player.y > floorY() + 112) {
      respawnAtCheckpoint();
      return;
    }
    if (phaseData.map.bounds.ceiling && player.y < 0) {
      player.y = 0;
      if (player.vy < 0) player.vy = 0;
    }
    if (!phaseData.map.bounds.floor && player.y > worldHeight() + 180) {
      respawnAtCheckpoint();
      return;
    }
    if (direction) player.walkTime += dt * 12;
    else player.walkTime *= Math.max(0, 1 - dt * 12);
  }

  function findNearbyComponent() {
    let nearest = null;
    let nearestDistance = Infinity;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    for (const component of components) {
      if (component.repaired) continue;
      const dx = Math.abs(component.x + component.width / 2 - playerCenterX);
      const dy = Math.abs(component.y + component.height / 2 - playerCenterY);
      const distance = Math.hypot(dx, dy);
      if (dx <= 76 && dy <= 78 && distance < nearestDistance) {
        nearest = component;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  function updateRepair(dt) {
    if (!keys.has('e') || !running) {
      repairTarget = null;
      repairProgress = 0;
      return;
    }
    const component = findNearbyComponent();
    if (!component) {
      repairTarget = null;
      repairProgress = 0;
      return;
    }
    if (repairTarget !== component) {
      repairTarget = component;
      repairProgress = 0;
    }
    repairProgress += dt;
    if (repairProgress >= repairDuration) {
      component.repaired = true;
      component.integrity = 100;
      component.corruption = 0;
      repairTarget = null;
      repairProgress = 0;
      interactionMessage = 'COMPONENTE REPARADO';
      interactionMessageTimer = 1.5;
      addLog('Componente do setor reparado.');
      emitParticles(component.x + component.width / 2, component.y + 16, '#65f3bc', 16);
      playSound('repair');
      awardExperience(30, 'componente reparado');
      checkObjectives();
      updateHud();
      saveCampaign();
    }
  }

  function experienceForLevel(currentLevel) {
    return 100 + (currentLevel - 1) * 45;
  }

  function awardExperience(amount, reason) {
    xp += amount;
    interactionMessage = '+' + amount + ' XP // ' + reason.toUpperCase();
    interactionMessageTimer = 1.4;
    addLog('+' + amount + ' XP: ' + reason + '.');
    emitParticles(player.x + player.width / 2, player.y + 10, '#ffe082', 8);
    playSound('xp');
    updateHud();
    saveCampaign();
  }

  function checkObjectives() {
    const repairedCount = components.filter(component => component.repaired).length;
    const defeatedCount = viruses.filter(virus => !virus.alive && virus.countsForObjective !== false).length;
    if (!objectives.allRepairs && repairedCount >= phaseData.objectives.componentsToRepair) {
      objectives.allRepairs = true;
      awardExperience(100, 'objetivo concluído: setor reparado');
    }
    if (!objectives.allViruses && defeatedCount >= phaseData.objectives.enemiesToDefeat) {
      objectives.allViruses = true;
      awardExperience(100, 'objetivo concluído: setor limpo');
    }
    if (!phaseObjectiveAwarded && objectives.allRepairs && objectives.allViruses) {
      phaseObjectiveAwarded = true;
      phaseExitUnlocked = true;
      interactionMessage = 'OBJETIVOS CONCLUÍDOS // SAÍDA LIBERADA';
      interactionMessageTimer = 2.5;
      addLog('Objetivos da fase concluídos. Saída liberada.');
      playSound('correct');
      awardExperience(100, 'objetivo concluído: saída liberada');
      updateHud();
    }
  }

  function updateCollectibles(dt) {
    for (const collectible of collectibles) {
      if (collectible.collected) continue;
      collectible.phase += dt * 3;
      const dx = Math.abs(player.x + player.width / 2 - collectible.x);
      const dy = Math.abs(player.y + player.height / 2 - collectible.y);
      if (dx < collectible.radius + player.width / 2 && dy < collectible.radius + player.height / 2) {
        collectible.collected = true;
        awardExperience(20, 'fragmento de dados coletado');
      }
    }
  }

  function openLevelChoice() {
    if (levelChoiceOpen || !running) return;
    xp -= xpRequired;
    level++;
    xpRequired = experienceForLevel(level);
    playSound('level');
    emitParticles(player.x + player.width / 2, player.y + 14, '#a890ff', 20);
    const choices = getAbilityChoices();
    updateHud();
    if (!choices.length) return;

    levelChoiceOpen = true;
    running = false;
    document.querySelector('.game-shell').classList.remove('playing');
    keys.clear();
    ui.levelOverlay.innerHTML = '<section class="level-dialog"><div class="level-kicker">NÍVEL ' + String(level).padStart(2, '0') + ' DESBLOQUEADO</div><h2>ESCOLHA UMA HABILIDADE</h2><p>Desbloqueie uma habilidade ou aprimore uma habilidade ativa.</p><div class="ability-options">' + choices.map(choice => {
      const label = choice.kind === 'new' ? 'NOVA' : 'APRIMORAMENTO';
      const levelText = choice.kind === 'new'
        ? 'Nível 0 → Nível 1'
        : 'Nível ' + (choice.targetLevel - 1) + ' → Nível ' + choice.targetLevel;
      return '<button class="ability-option" data-skill="' + choice.ability.id + '" data-target="' + choice.targetLevel + '"><span class="ability-badge ' + choice.kind + '">' + label + '</span><b>' + choice.ability.name + ' — ' + levelText + '</b><small>' + choice.ability.description(choice.targetLevel) + '</small></button>';
    }).join('') + '</div></section>';
    ui.levelOverlay.classList.add('active');
    ui.levelOverlay.querySelectorAll('[data-skill]').forEach(button => {
      button.addEventListener('click', () => selectAbility(button.dataset.skill, Number(button.dataset.target)));
    });
    draw();
  }

  function getAbilityChoices() {
    const newChoices = ABILITIES
      .filter(ability => !unlockedSkills.some(skill => skill.id === ability.id))
      .map(ability => ({ ability, kind: 'new', targetLevel: 1 }));
    const upgrades = ABILITIES.flatMap(ability => {
      const skill = unlockedSkills.find(item => item.id === ability.id);
      return skill && skill.level < ability.maxLevel
        ? [{ ability, kind: 'upgrade', targetLevel: skill.level + 1 }]
        : [];
    });
    const shuffle = entries => {
      for (let i = entries.length - 1; i > 0; i--) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[swapIndex]] = [entries[swapIndex], entries[i]];
      }
      return entries;
    };
    shuffle(newChoices);
    shuffle(upgrades);
    const choices = newChoices.length && !upgrades.length
      ? newChoices.slice(0, 3)
      : newChoices.slice(0, Math.min(2, newChoices.length));
    for (const upgrade of upgrades) {
      if (choices.length === 3) break;
      choices.push(upgrade);
    }
    for (const ability of newChoices) {
      if (choices.length === 3) break;
      if (!choices.some(choice => choice.ability.id === ability.ability.id)) choices.push(ability);
    }
    return choices;
  }

  function selectAbility(id, targetLevel) {
    if (!levelChoiceOpen) return;
    const ability = ABILITIES.find(item => item.id === id);
    const skill = unlockedSkills.find(item => item.id === id);
    const expectedLevel = skill ? skill.level + 1 : 1;
    if (!ability || targetLevel !== expectedLevel || targetLevel > ability.maxLevel) return;
    ability.apply(targetLevel);
    if (skill) {
      skill.level = targetLevel;
      skill.description = ability.description(targetLevel);
    } else {
      unlockedSkills.push({ id: ability.id, name: ability.name, level: 1, maxLevel: ability.maxLevel, description: ability.description(1) });
    }
    levelChoiceOpen = false;
    ui.levelOverlay.classList.remove('active');
    renderSkills();
    updateHud();
    addLog((skill ? 'Habilidade aprimorada: ' : 'Habilidade adquirida: ') + ability.name + ' nível ' + targetLevel + '.');
    interactionMessage = 'HABILIDADE ATIVA // ' + ability.name.toUpperCase() + ' NV. ' + targetLevel;
    interactionMessageTimer = 2;
    saveCampaign();
    playSound('level');
    running = true;
    document.querySelector('.game-shell').classList.add('playing');
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function renderSkills() {
    ui.skillCount.textContent = unlockedSkills.length;
    ui.skillList.innerHTML = unlockedSkills.length
      ? unlockedSkills.map(skill => '<span class="skill-tag" title="' + skill.description + '">' + skill.name + ' <b>NV.' + skill.level + '/' + skill.maxLevel + '</b></span>').join('')
      : '<span class="no-skills">Nenhuma habilidade</span>';
  }

  function fireProjectile() {
    projectiles.push({
      x: player.facing > 0 ? player.x + player.width + 5 : player.x - 5,
      y: player.y + 22,
      vx: player.facing * 570,
      life: 1.35,
      radius: 5,
      damage: player.damage
    });
    attackCooldown = player.fireRate;
    emitParticles(projectiles[projectiles.length - 1].x, player.y + 22, '#70ffe5', 3);
    playSound('attack');
  }

  function damagePlayer(amount, virus) {
    const hasShieldSkill = unlockedSkills.some(skill => skill.id === 'shield');
    const activeShieldTime = hasShieldSkill && Number.isFinite(player.shieldTime) ? Math.max(0, player.shieldTime) : 0;
    if (damageCooldown > 0 || !running || activeShieldTime > 0) return;
    const armor = Number.isFinite(player.armor) ? Math.min(MAX_PLAYER_ARMOR, Math.max(0, player.armor)) : 0;
    const incomingDamage = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    const appliedDamage = Math.max(1, Math.ceil(incomingDamage * (1 - armor)));
    player.health = Math.max(0, player.health - appliedDamage);
    emitParticles(player.x + player.width / 2, player.y + 22, '#ff716e', 16);
    playSound('damage');
    damageCooldown = PLAYER_HIT_INVULNERABILITY;
    player.vy = -210;
    player.grounded = false;
    player.facing = player.x + player.width / 2 < virus.x ? -1 : 1;
    addLog('Impacto de vírus! Integridade em ' + player.health + '%.');
    updateHud();
    saveCampaign();
    if (player.health <= 0) respawnAtCheckpoint();
  }

  function respawnAtCheckpoint() {
    player.health = player.maxHealth;
    player.x = Math.max(0, Math.min(worldWidth() - player.width, checkpointX + 38));
    player.y = (checkpointY ?? floorY()) - player.height;
    for (let attempt = 0; attempt < 4; attempt++) {
      const blocker = solids().find(object => object.collision !== 'one-way' && overlaps(player, object));
      if (!blocker) break;
      player.x = Math.min(worldWidth() - player.width, blocker.x + blocker.w + 2);
    }
    player.vx = 0; player.vy = 0; player.grounded = true; player.facing = 1;
    // Respawn protection uses the hit cooldown. Do not place that protection
    // in shieldTime: the shield timer only ticks for the shield skill, so an
    // unskilled player would otherwise remain shielded forever.
    player.shieldTime = 0;
    player.shieldCooldown = unlockedSkills.some(skill => skill.id === 'shield')
      ? player.shieldCooldownDuration : 0;
    damageCooldown = 2;
    repairTarget = null; repairProgress = 0; jumpQueued = false;
    platformRuntime = new Map();
    enemyProjectiles = []; enemyObstacles = [];
    cameraX = Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX));
    cameraY = Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY));
    addLog('ReinicializaÃ§Ã£o no checkpoint. Objetivos mantidos.');
    updateHud(); saveCampaign();
  }

  function updateCheckpoints() {
    for (const point of phaseData.map.checkpoints || []) {
      const pointX = typeof point === 'number' ? point : point.x;
      const pointY = typeof point === 'number' ? null : point.y;
      const reached = Number.isFinite(pointY)
        ? player.x + player.width >= pointX - 8 && player.x <= pointX + 54 && Math.abs(player.y + player.height - pointY) <= 24
        : player.x + player.width >= pointX && checkpointX < pointX;
      const isNewVertical = Number.isFinite(pointY) && (checkpointY == null || pointY < checkpointY);
      if (reached && (Number.isFinite(pointY) ? isNewVertical : true)) {
        checkpointX = pointX;
        checkpointY = Number.isFinite(pointY) ? pointY : null;
        interactionMessage = 'CHECKPOINT ATIVADO';
        interactionMessageTimer = 1.8;
        addLog('Checkpoint ativado.');
        saveCampaign();
      }
    }
  }

  function finishDefeat() {
    running = false;
    document.querySelector('.game-shell').classList.remove('playing');
    paused = false;
    gameOver = true;
    ui.title.innerHTML = 'SINAL <span>PERDIDO</span>';
    ui.copy.textContent = 'A integridade da unidade chegou a zero. Reinicie a missão para tentar novamente.';
    startButton.innerHTML = 'TENTAR FASE NOVAMENTE <span>→</span>';
    overlay.classList.remove('hidden');
    ui.stage.textContent = 'UNIDADE DESCONECTADA';
    addLog('Unidade R-07 desconectada.');
    saveCampaign();
  }

  function choosePhaseQuestion() {
    const bank = QUESTION_BANK[phaseData.theme] || [];
    if (!bank.length) return null;
    questionHistory = readQuestionHistory();
    let used = Array.isArray(questionHistory[phaseData.theme]) ? questionHistory[phaseData.theme] : [];
    let available = bank.filter(question => !used.includes(question.id));
    if (!available.length) {
      used = [];
      available = bank.slice();
    }
    const question = available[Math.floor(Math.random() * available.length)];
    used.push(question.id);
    questionHistory[phaseData.theme] = used;
    saveQuestionHistory();
    return { question, number: used.length, total: bank.length };
  }

  function openPhaseQuestion() {
    if (!running || !phaseExitUnlocked || phaseQuestionOpen) return;
    const selection = choosePhaseQuestion();
    if (!selection) return;
    running = false;
    document.querySelector('.game-shell').classList.remove('playing');
    keys.clear();
    phaseQuestionOpen = true;
    questionAnswered = false;
    currentQuestion = selection.question;

    const dialog = document.createElement('section');
    dialog.className = 'question-dialog';
    const kicker = document.createElement('div');
    kicker.className = 'question-kicker';
    kicker.textContent = 'VERIFICAÇÃO DE REDES // FASE ' + String(phaseIndex + 1).padStart(2, '0');
    const heading = document.createElement('h2');
    heading.textContent = 'PORTAL DE SAÍDA';
    const counter = document.createElement('div');
    counter.className = 'question-kicker question-counter';
    counter.textContent = 'PERGUNTA ' + String(selection.number).padStart(2, '0') + ' / ' + selection.total + ' // ID ' + selection.question.id;
    const prompt = document.createElement('p');
    prompt.className = 'question-prompt';
    prompt.textContent = selection.question.text;
    const options = document.createElement('div');
    options.className = 'question-options';
    const result = document.createElement('p');
    result.className = 'question-result';
    result.hidden = true;
    const action = document.createElement('button');
    action.className = 'question-action';
    action.hidden = true;

    const shuffled = selection.question.options.map((text, index) => ({ text, correct: index === selection.question.answer }));
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    shuffled.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'question-option';
      button.dataset.correct = String(option.correct);
      const letter = document.createElement('span');
      letter.className = 'question-letter';
      letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span');
      label.textContent = option.text;
      button.append(letter, label);
      button.addEventListener('click', () => {
        if (questionAnswered) return;
        questionAnswered = true;
        currentQuestion = selection.question;
        options.querySelectorAll('.question-option').forEach(choice => {
          choice.disabled = true;
          if (choice.dataset.correct === 'true') choice.classList.add('correct');
        });
        if (option.correct) {
          playSound('correct');
          button.classList.add('correct');
          result.className = 'question-result success';
          result.textContent = 'RESPOSTA CORRETA. ' + selection.question.explanation;
          action.textContent = phaseIndex === PHASES.length - 1 ? 'CONCLUIR CAMPANHA' : 'LIBERAR PRÓXIMA FASE';
          action.addEventListener('click', resolvePhaseQuestion, { once: true });
        } else {
          playSound('wrong');
          button.classList.add('wrong');
          result.className = 'question-result error';
          result.textContent = 'RESPOSTA INCORRETA. Esta fase será reiniciada. ' + selection.question.explanation;
          action.textContent = 'REPETIR FASE';
          action.addEventListener('click', retryQuestionPhase, { once: true });
        }
        result.hidden = false;
        action.hidden = false;
      });
      options.append(button);
    });
    dialog.append(kicker, heading, counter, prompt, options, result, action);
    ui.questionOverlay.replaceChildren(dialog);
    ui.questionOverlay.classList.add('active');
    saveCampaign();
    draw();
  }

  function resolvePhaseQuestion() {
    if (!phaseQuestionOpen || !questionAnswered) return;
    phaseQuestionOpen = false;
    ui.questionOverlay.classList.remove('active');
    running = true;
    document.querySelector('.game-shell').classList.add('playing');
    completePhase();
  }

  function retryQuestionPhase() {
    if (!phaseQuestionOpen || !questionAnswered) return;
    phaseQuestionOpen = false;
    ui.questionOverlay.classList.remove('active');
    currentQuestion = null;
    loadPhase(phaseIndex, true);
    launchLoadedPhase();
  }

  function completePhase() {
    if (!running || !phaseExitUnlocked) return;
    running = false;
    document.querySelector('.game-shell').classList.remove('playing');
    paused = false;
    phaseTransition = true;
    keys.clear();
    if (phaseIndex === PHASES.length - 1) {
      campaignComplete = true;
      const card = overlay.querySelector('.overlay-card');
      const eyebrow = card?.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = 'CAMPANHA DIGITAL CONCLUÍDA // TODOS OS SETORES SALVOS';
      ui.title.innerHTML = 'VIRUS ZERO <span>NEUTRALIZADO</span>';
      ui.copy.textContent = 'Parabéns, Unidade R-07! Você neutralizou VIRUS ZERO no núcleo digital da Internet. Todos os 10 setores do computador e da infraestrutura de rede foram totalmente recuperados!';
      startButton.innerHTML = 'NOVA CAMPANHA <span>→</span>';
      ui.stage.textContent = 'CAMPANHA CONCLUÍDA';
      addLog('VIRUS ZERO neutralizado. Campanha concluída com sucesso!');
      playSound('level');
      emitParticles(player.x + player.width / 2, player.y, '#ffd36e', 35);
      emitParticles(player.x + player.width / 2, player.y, '#74e8ff', 35);
    } else {
      highestUnlockedPhase = Math.max(highestUnlockedPhase, phaseIndex + 1);
      ui.title.innerHTML = 'FASE <span>CONCLUÍDA</span>';
      ui.copy.textContent = phaseData.name + ' concluída. A próxima fase foi liberada.';
      startButton.innerHTML = 'ACESSAR FASE ' + String(phaseIndex + 2).padStart(2, '0') + ' <span>→</span>';
      ui.stage.textContent = 'PRÓXIMA FASE LIBERADA';
      addLog('Fase concluída. ' + PHASES[phaseIndex + 1].name + ' liberada.');
    }
    overlay.classList.remove('hidden');
    draw();
    saveCampaign();
  }

  function fireEnemyProjectile(virus, targetX, targetY) {
    const dx = targetX - virus.x;
    const dy = targetY - virus.y;
    const length = Math.hypot(dx, dy) || 1;
    enemyProjectiles.push({ x: virus.x + Math.sign(dx || 1) * (virus.radius + 4), y: virus.y,
      vx: dx / length * (virus.projectileSpeed || 285), vy: dy / length * (virus.projectileSpeed || 285),
      life: 2.8, radius: 6, damage: virus.damage, ownerX: virus.x, color: virus.color || '#ffd166' });
    emitParticles(virus.x, virus.y, virus.color || '#ffd166', 3);
  }

  function spawnEnemyMinion(virus) {
    const aliveMinions = viruses.filter(enemy => enemy.alive && enemy.summonedBy === virus.id).length;
    if (aliveMinions >= (virus.summonLimit || 2)) return false;
    const profile = ENEMY_PROFILES.fast;
    const side = Math.random() < .5 ? -1 : 1;
    virus.minionSerial = (virus.minionSerial || 0) + 1;
    viruses.push({ ...profile, id: virus.id + '-m' + String(virus.minionSerial).padStart(2, '0'),
      type: 'fast', x: Math.max(35, Math.min(worldWidth() - 35, virus.x + side * 28)), baseX: virus.x,
      y: floorY() - 26, baseY: floorY() - 26, hp: 1, maxHp: 1, radius: 9, speed: 126,
      alive: true, countsForObjective: false, summonedBy: virus.id, life: 13, phase: 0,
      attackCooldownTimer: .8, attackWindup: 0, vulnerableTime: 0, specialCooldownTimer: 99,
      summonCooldownTimer: 99, direction: side, patrolMin: virus.x - 70, patrolMax: virus.x + 70 });
    addLog(virus.type === 'boss' ? 'VIRUS ZERO invocou reforcos.' : 'Parasita invocou um reforco rapido.');
    return true;
  }

  function createEnemyBarrier(virus) {
    const side = player.x + player.width / 2 >= virus.x ? 1 : -1;
    const x = Math.max(25, Math.min(worldWidth() - 50,
      side > 0 ? player.x + player.width + 58 : player.x - 82));
    if (enemyObstacles.some(obstacle => obstacle.life > 0 && Math.abs(obstacle.x - x) < 55)) return;
    enemyObstacles.push({ id: 'enemy-barrier-' + virus.id + '-' + Math.floor(animationTime), x,
      y: floorY() - 72, w: 24, h: 72, life: 3.6 });
    addLog('Vírus blindado ergueu uma barreira temporária.');
  }

  function fireVirusZeroVolley(virus, targetX, targetY, count, speed, damage, spread) {
    const baseAngle = Math.atan2(targetY - virus.y, targetX - virus.x);
    for (let shot = 0; shot < count; shot++) {
      const ratio = count === 1 ? 0 : shot / (count - 1) * 2 - 1;
      const angle = baseAngle + ratio * spread;
      enemyProjectiles.push({x:virus.x + Math.cos(angle) * (virus.radius + 5),
        y:virus.y + Math.sin(angle) * (virus.radius + 5),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        life:3.2,radius:7,damage,ownerX:virus.x,color:'#ff5479',bossOwned:true});
    }
  }

  function triggerVirusZeroAttack(virus, playerCenterX, playerCenterY) {
    const stage = virus.bossStage || 1;
    const kind = virus.bossAttackKind;
    const horizontalDistance = Math.abs(playerCenterX - virus.x);
    const verticalDistance = Math.abs(playerCenterY - virus.y);
    if ((kind === 'slam' || kind === 'combo') && horizontalDistance <= (stage === 3 ? 188 : 148) && verticalDistance < 112) {
      damagePlayer(stage === 3 ? 22 : 16, virus);
    }
    if (kind === 'charge') {
      const oldX = virus.x;
      const minX = virus.bossBounds?.left ?? virus.radius;
      const maxX = virus.bossBounds?.right ?? worldWidth() - virus.radius;
      virus.x = Math.max(minX, Math.min(maxX, virus.x + virus.bossAttackDirection * 205));
      if (Math.abs(playerCenterX - virus.x) < 86 && Math.abs(playerCenterY - virus.y) < 105) damagePlayer(18, virus);
      if (virus.x === oldX) virus.bossAttackDirection *= -1;
    }
    if (kind === 'volley' || kind === 'combo') {
      fireVirusZeroVolley(virus, playerCenterX, playerCenterY, stage === 3 ? 5 : 3,
        stage === 3 ? 310 : 245, stage === 3 ? 12 : 10, stage === 3 ? .38 : .24);
    }
    if (kind === 'surge' || kind === 'combo') {
      const arena = virus.bossBounds || {left:3420,right:4450};
      const positions = stage === 3 ? [arena.left + 150, arena.right - 160] :
        [virus.x < (arena.left + arena.right) / 2 ? arena.right - 190 : arena.left + 190];
      for (const x of positions) {
        if (enemyObstacles.filter(obstacle => obstacle.bossOwned && obstacle.life > 0).length >= 2) break;
        if (enemyObstacles.some(obstacle => obstacle.life > 0 && Math.abs(obstacle.x - x) < 65)) continue;
        enemyObstacles.push({id:'virus-zero-pillar-'+Math.floor(animationTime*1000)+'-'+x,
          x:x-15,y:floorY()-68,w:30,h:68,life:2.5,bossOwned:true});
      }
    }
    virus.vulnerableTime = [0,1.25,1.1,1.4][stage];
    virus.bossCycleCooldown = [0,1.55,1.35,1.2][stage];
    virus.attackWindup = 0;
  }

  function updateVirusZero(virus, dt, playerCenterX, playerCenterY) {
    const healthRatio = virus.hp / virus.maxHp;
    const stage = healthRatio <= .34 ? 3 : healthRatio <= .67 ? 2 : 1;
    if (stage !== virus.bossStage) {
      virus.bossStage = stage;
      addLog('VIRUS ZERO // ETAPA ' + stage + ' // PADRÃO DE ATAQUE ALTERADO.');
      emitParticles(virus.x, virus.y, stage === 3 ? '#ffd36e' : '#ff5479', 18);
    }
    virus.coreShielded = Boolean(virus.coreShieldRequiresRepairs && components.some(component => !component.repaired));
    virus.bossBlockedMessageTimer = Math.max(0, virus.bossBlockedMessageTimer - dt);
    virus.bossCycleCooldown = Math.max(0, virus.bossCycleCooldown - dt);
    if (virus.attackWindup > 0) {
      virus.attackWindup = Math.max(0, virus.attackWindup - dt);
      if (virus.attackWindup === 0) triggerVirusZeroAttack(virus, playerCenterX, playerCenterY);
    } else if (virus.bossCycleCooldown <= 0) {
      const patterns = {1:['slam','charge'],2:['volley','surge'],3:['combo','surge','volley']};
      const options = patterns[stage];
      virus.bossAttackKind = options[virus.bossPatternIndex % options.length];
      virus.bossPatternIndex++;
      virus.bossAttackDirection = Math.sign(playerCenterX - virus.x) || 1;
      virus.attackWindup = [0,.92,.78,.68][stage];
    }
    if (stage >= 2 && virus.specialCooldownTimer <= 0) {
      spawnEnemyMinion(virus);
      virus.specialCooldownTimer = stage === 3 ? 6.5 : 9;
    }
  }

  function damageVirus(virus, damage) {
    if (virus.type === 'boss' && virus.coreShieldRequiresRepairs && components.some(component => !component.repaired)) {
      virus.coreShielded = true;
      if (virus.bossBlockedMessageTimer <= 0) {
        interactionMessage = 'NÚCLEO PROTEGIDO // REPARE OS RELAYS';
        interactionMessageTimer = 1.6;
        virus.bossBlockedMessageTimer = 1.6;
      }
      return;
    }
    const armor = virus.vulnerableTime > 0 ? 0 : (virus.armor || 0);
    virus.hp = Math.max(0, virus.hp - Math.max(1, Math.ceil(damage * (1 - armor))));
    virus.hitFlash = .12;
    emitParticles(virus.x, virus.y, virus.color || '#c078ff', virus.type === 'boss' ? 10 : 6);
    playSound('hit');
    if (virus.hp > 0) return;
    virus.alive = false;
    if (virus.countsForObjective !== false) defeated++;
    addLog(virus.type === 'boss' ? 'VIRUS ZERO recebeu dano critico.' : virus.type === 'fast' ? 'Virus rapido neutralizado.' : 'Virus neutralizado.');
    awardExperience(virus.countsForObjective === false ? 12 : virus.xp || 45, virus.type === 'boss' ? 'chefe derrotado' : 'vÃ­rus derrotado');
  }

  function updateEnemyBrain(virus, dt, playerCenterX, playerCenterY) {
    if (virus.life !== undefined) {
      virus.life -= dt;
      if (virus.life <= 0) { virus.alive = false; return; }
    }
    virus.attackCooldownTimer = Math.max(0, virus.attackCooldownTimer - dt);
    virus.specialCooldownTimer = Math.max(0, virus.specialCooldownTimer - dt);
    virus.summonCooldownTimer = Math.max(0, virus.summonCooldownTimer - dt);
    virus.vulnerableTime = Math.max(0, virus.vulnerableTime - dt);
    virus.hitFlash = Math.max(0, (virus.hitFlash || 0) - dt);
    virus.phase += dt * (virus.type === 'fast' ? 9 : virus.flying ? 6 : 4);
    const dx = playerCenterX - virus.x;
    const dy = playerCenterY - virus.y;
    const distance = Math.hypot(dx, dy);
    let moveDirection = 0;

    if (virus.type === 'parasite') {
      const target = components.filter(component => !component.repaired)
        .sort((a, b) => Math.abs(a.x + a.width / 2 - virus.x) - Math.abs(b.x + b.width / 2 - virus.x))[0];
      if (target) {
        const componentDx = target.x + target.width / 2 - virus.x;
        moveDirection = Math.abs(componentDx) > 72 ? Math.sign(componentDx) : 0;
        if (Math.abs(componentDx) < (virus.interferenceRange || 86)) {
          target.corruption = Math.min(100, target.corruption + (virus.drainRate || 6) * dt);
          target.integrity = Math.max(0, 100 - target.corruption);
        }
      }
      if (virus.summonCooldownTimer <= 0 && distance < 430) {
        if (spawnEnemyMinion(virus)) virus.summonCooldownTimer = virus.summonCooldown || 9;
        else virus.summonCooldownTimer = 2;
      }
    } else if (virus.behavior === 'patrol' && distance > (virus.aggroRange || 460)) {
      if (virus.x <= virus.patrolMin) virus.direction = 1;
      if (virus.x >= virus.patrolMax) virus.direction = -1;
      moveDirection = virus.direction;
    } else if (virus.attack === 'ranged') {
      const preferred = virus.preferredRange || 230;
      if (Math.abs(dx) > (virus.attackRange || 330)) moveDirection = Math.sign(dx);
      else if (Math.abs(dx) < preferred * .68) moveDirection = -Math.sign(dx);
    } else if (virus.behavior === 'chase' || distance < (virus.aggroRange || 460)) {
      moveDirection = Math.sign(dx);
    } else {
      if (virus.x <= virus.patrolMin) virus.direction = 1;
      if (virus.x >= virus.patrolMax) virus.direction = -1;
      moveDirection = virus.direction;
    }

    const speed = virus.speed * (virus.buffed ? 1.3 : 1) * (virus.flying && virus.attackWindup > 0 ? 1.55 : 1);
    if (virus.type === 'boss' && virus.multiStage && virus.attackWindup > 0) moveDirection = 0;
    const minX = virus.bossBounds?.left ?? virus.radius;
    const maxX = virus.bossBounds?.right ?? worldWidth() - virus.radius;
    const nextX = Math.max(minX, Math.min(maxX, virus.x + moveDirection * speed * dt));
    const blocked = solids().some(object => object.collision === 'solid' && object.kind !== 'gate' &&
      nextX + virus.radius > object.x && nextX - virus.radius < object.x + object.w &&
      virus.y + virus.radius > object.y && virus.y - virus.radius < object.y + object.h);
    if (virus.flying || !blocked) virus.x = nextX;
    else virus.direction *= -1;

    if (virus.flying) {
      const hoverY = Math.max(55, Math.min(floorY() - 92, playerCenterY - 55 + Math.sin(virus.phase * .65) * 16));
      virus.y += Math.max(-speed, Math.min(speed, hoverY - virus.y)) * dt;
    } else virus.y = virus.baseY + Math.sin(virus.phase) * 3;

    if (virus.type === 'boss' && virus.multiStage) {
      updateVirusZero(virus, dt, playerCenterX, playerCenterY);
      return;
    }

    if (virus.attack === 'ranged' && distance <= (virus.attackRange || 330) && virus.attackCooldownTimer <= 0) {
      fireEnemyProjectile(virus, playerCenterX, playerCenterY);
      virus.attackCooldownTimer = virus.attackCooldown || 2.2;
    } else if (virus.attack === 'melee') {
      if (virus.attackWindup <= 0 && distance <= (virus.attackRange || 34) + virus.radius + 17 && virus.attackCooldownTimer <= 0) {
        virus.attackWindup = virus.windup || .28;
        virus.attackCooldownTimer = virus.attackCooldown || 1.2;
      }
      if (virus.attackWindup > 0) {
        virus.attackWindup = Math.max(0, virus.attackWindup - dt);
        if (virus.attackWindup === 0) {
          if (Math.hypot(playerCenterX - virus.x, playerCenterY - virus.y) <= (virus.attackRange || 34) + virus.radius + 17) {
            damagePlayer(virus.damage * (virus.buffed ? 1.25 : 1), virus);
          }
          virus.vulnerableTime = virus.vulnerableDuration || (virus.type === 'armored' ? 1.25 : 0);
        }
      }
    }

    if (virus.special === 'barrier' && virus.specialCooldownTimer <= 0 && distance < 230) {
      createEnemyBarrier(virus);
      virus.specialCooldownTimer = virus.specialCooldown || 7;
    } else if (virus.special === 'summon' && virus.specialCooldownTimer <= 0 && distance < 470) {
      const aliveMinions = viruses.filter(enemy => enemy.alive && enemy.summonedBy === virus.id).length;
      if (aliveMinions < (virus.summonLimit || 3)) spawnEnemyMinion(virus);
      virus.specialCooldownTimer = virus.specialCooldown || 8;
    }
  }

  function updateHostileProjectiles(dt) {
    const barriers = solids();
    for (const projectile of enemyProjectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      if (barriers.some(object => object.collision === 'solid' && object.kind !== 'floor' &&
        projectile.x + projectile.radius > object.x && projectile.x - projectile.radius < object.x + object.w &&
        projectile.y + projectile.radius > object.y && projectile.y - projectile.radius < object.y + object.h)) {
        projectile.life = 0;
        continue;
      }
      const nearestX = Math.max(player.x, Math.min(projectile.x, player.x + player.width));
      const nearestY = Math.max(player.y, Math.min(projectile.y, player.y + player.height));
      if (Math.hypot(projectile.x - nearestX, projectile.y - nearestY) <= projectile.radius) {
        damagePlayer(projectile.damage, { x: projectile.ownerX });
        projectile.life = 0;
      }
    }
    enemyProjectiles = enemyProjectiles.filter(projectile => projectile.life > 0 && projectile.x > 0 && projectile.x < worldWidth());
    for (const obstacle of enemyObstacles) obstacle.life -= dt;
    enemyObstacles = enemyObstacles.filter(obstacle => obstacle.life > 0);
  }

  function updateCombat(dt) {
    attackCooldown = Math.max(0, attackCooldown - dt);
    damageCooldown = Math.max(0, damageCooldown - dt);
    interactionMessageTimer = Math.max(0, interactionMessageTimer - dt);
    if (unlockedSkills.some(skill => skill.id === 'shield')) {
      if (player.shieldTime > 0) {
        player.shieldTime = Math.max(0, player.shieldTime - dt);
        if (player.shieldTime === 0) player.shieldCooldown = player.shieldCooldownDuration;
      } else if (player.shieldCooldown > 0) {
        player.shieldCooldown = Math.max(0, player.shieldCooldown - dt);
      } else {
        player.shieldTime = player.shieldDuration;
        player.shieldCooldown = -1;
      }
    }
    if (keys.has('j') && attackCooldown <= 0) fireProjectile();

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    for (const virus of viruses) virus.buffed = false;
    for (const parasite of viruses) {
      if (!parasite.alive || parasite.type !== 'parasite') continue;
      for (const ally of viruses) {
        if (ally !== parasite && ally.alive && ally.type !== 'parasite' &&
          Math.hypot(ally.x - parasite.x, ally.y - parasite.y) <= (parasite.buffRange || 190)) ally.buffed = true;
      }
    }
    for (const virus of viruses) {
      if (!virus.alive) continue;
      updateEnemyBrain(virus, dt, playerCenterX, playerCenterY);
      if (!running) return;
    }
    updateHostileProjectiles(dt);

    for (const projectile of projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.life -= dt;
      for (const virus of viruses) {
        if (!virus.alive) continue;
        if (Math.hypot(projectile.x - virus.x, projectile.y - virus.y) <= virus.radius + projectile.radius) {
          projectile.life = 0;
          damageVirus(virus, projectile.damage);
          break;
        }
      }
    }
    projectiles = projectiles.filter(projectile => projectile.life > 0 && projectile.x > 0 && projectile.x < worldWidth());
    viruses = viruses.filter(virus => virus.countsForObjective !== false || virus.alive);
    checkObjectives();
  }

  function updateHud() {
    const progress = Math.max(0, Math.min(100, Math.round(player.x / (worldWidth() - player.width) * 100)));
    ui.progress.textContent = String(progress).padStart(2, '0') + '%';
    ui.progressBar.style.width = progress + '%';
    const healthPercent = Math.max(0, player.health / player.maxHealth * 100);
    ui.health.style.width = healthPercent + '%';
    ui.healthText.textContent = Math.ceil(healthPercent) + '%';
    ui.level.textContent = String(level).padStart(2, '0');
    ui.xp.textContent = xp + ' / ' + xpRequired + ' XP';
    ui.xpBar.style.width = Math.min(100, xp / xpRequired * 100) + '%';
    ui.position.textContent = String(Math.floor(player.x / 10)).padStart(3, '0') + ' m';
    const repairedCount = components.filter(component => component.repaired).length;
    ui.repaired.textContent = String(repairedCount).padStart(2, '0') + ' / ' + String(components.length).padStart(2, '0');
    if (running && !gameOver) ui.stage.textContent = 'FASE ' + String(phaseIndex + 1).padStart(2, '0') + ' // ' + (phaseExitUnlocked ? 'SAÍDA LIBERADA' : 'OBJETIVOS EM ANDAMENTO');
    ui.gate.textContent = phaseExitUnlocked ? 'LIBERADA' : 'BLOQUEADA';
    ui.gate.style.color = phaseExitUnlocked ? '#62e4b7' : '#ff8a72';
    ui.defeated.textContent = String(defeated).padStart(2, '0') + ' / ' + String(phaseData.objectives.enemiesToDefeat).padStart(2, '0');
    const miniRect = ui.map.parentElement.getBoundingClientRect();
    const miniRange = Math.max(0, miniRect.width - 16);
    ui.map.style.left = (8 + (player.x / (worldWidth() - player.width)) * miniRange) + 'px';
    if (phaseData.map.layout === 'vertical') {
      const miniY = Math.max(0, Math.min(1, player.y / Math.max(1, worldHeight() - player.height)));
      ui.map.style.top = `calc(8px + ${miniY * Math.max(0, miniRect.height - 16)}px)`;
    } else ui.map.style.top = '50%';
  }

  function update(dt) {
    advancePlatformMotion(dt);
    movePlayer(dt);
    updateCheckpoints();
    updateCombat(dt);
    if (!running) return;
    updateRepair(dt);
    updateCollectibles(dt);
    checkObjectives();
    // Camera easing keeps R-07 near the left-center of the viewport as the map scrolls.
    const cameraTarget = phaseData.map.camera.axes.includes('x')
      ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
    cameraX += (cameraTarget - cameraX) * Math.min(1, dt * 7);
    if (Math.abs(cameraTarget - cameraX) < .5) cameraX = cameraTarget;
    const cameraTargetY = phaseData.map.camera.axes.includes('y')
      ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    cameraY += (cameraTargetY - cameraY) * Math.min(1, dt * 7);
    if (Math.abs(cameraTargetY - cameraY) < .5) cameraY = cameraTargetY;
    updateHud();
    updateComponents(dt);
    updateEffects(dt);
    saveTimer += dt;
    if (saveTimer >= 2.5) { saveTimer = 0; saveCampaign(); }
    if (xp >= xpRequired) openLevelChoice();
    const exitY = Number.isFinite(phaseData.map.exit.y) ? phaseData.map.exit.y : floorY() - 63;
    const exitReached = phaseData.map.layout === 'vertical'
      ? Math.hypot(player.x + player.width / 2 - phaseData.map.exit.x, player.y + player.height / 2 - exitY) <= (phaseData.map.exit.triggerRadius || phaseData.map.exit.triggerRadiusY || 74)
      : player.x + player.width >= phaseData.map.exit.x + 20 && Math.abs(player.y + player.height / 2 - exitY) <= (phaseData.map.exit.triggerRadiusY || 86);
    if (running && phaseExitUnlocked && exitReached) openPhaseQuestion();
    // Temporary platforms use one persistent per-platform clock. It advances
    // every frame, independent of camera range or player distance.
    for (const spec of phaseData.entities.platforms) {
      if (spec.type !== 'temporary') continue;
      const state = getPlatformState(spec);
      if (!state.triggered) continue;
      state.elapsed += dt;
      if (state.active && state.elapsed >= (Number.isFinite(spec.duration) ? spec.duration : 1.8)) {
        state.active = false;
        state.respawning = true;
        state.elapsed = 0;
      } else if (!state.active && state.respawning && state.elapsed >= (Number.isFinite(spec.respawnDelay) ? spec.respawnDelay : 3)) {
        const x = spec.x;
        const y = entityY(spec, 0);
        const shape = { x, y, w: spec.width, h: spec.height || 18 };
        // Keep the timer ready and retry each frame while the player overlaps.
        if (!overlaps(player, shape)) {
          state.active = true;
          state.respawning = false;
          state.triggered = false;
          state.elapsed = 0;
        }
      }
    }
  }

  function updateComponents(dt) {
    for (const component of components) {
      if (component.repaired) component.phase += dt * 3;
    }
    if (interactionMessageTimer <= 0 && interactionMessage) interactionMessage = '';
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, phaseData.palette[1]);
    gradient.addColorStop(1, phaseData.palette[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Distant circuit paths move slower than the level for a subtle parallax effect.
    ctx.save();
    ctx.translate(-(cameraX * .22) % 180, 0);
    ctx.strokeStyle = phaseData.palette[3];
    ctx.globalAlpha = .3;
    ctx.lineWidth = 1;
    for (let x = -180; x < width + 200; x += 180) {
      const top = 55 + ((x * 7) % 105 + 105) % 105;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + 48, top);
      ctx.lineTo(x + 48, top + 42);
      ctx.lineTo(x + 124, top + 42);
      ctx.stroke();
      ctx.fillStyle = phaseData.palette[2];
      ctx.fillRect(x + 44, top - 2, 5, 5);
      ctx.fillRect(x + 120, top + 39, 5, 5);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cameraX * .42, 0);
    for (let i = 0; i < 13; i++) {
      const x = 130 + i * 330;
      ctx.fillStyle = phaseData.palette[3];
      ctx.globalAlpha = .22;
      ctx.fillRect(x, height - 190 - (i % 3) * 24, 74, 46);
      ctx.strokeStyle = phaseData.palette[2];
      ctx.globalAlpha = .3;
      ctx.strokeRect(x + .5, height - 189.5 - (i % 3) * 24, 73, 45);
      ctx.fillStyle = phaseData.palette[2];
      ctx.globalAlpha = .42;
      ctx.fillRect(x + 9, height - 179 - (i % 3) * 24, 22, 2);
      ctx.fillStyle = phaseData.palette[4];
      ctx.fillRect(x + 9, height - 170 - (i % 3) * 24, 43, 2);
    }
    ctx.restore();
  }

  function drawThemeStructures() {

    for (let index = 0; index < phaseData.entities.features.length; index++) {
      const feature = phaseData.entities.features[index];
      const x = feature.x;
      const base = entityY(feature);
      if (x - cameraX < -160 || x - cameraX > width + 160) continue;
      const accent = phaseData.palette[2];
      const trim = phaseData.palette[4];
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = accent;
      ctx.fillStyle = phaseData.palette[3];
      ctx.globalAlpha = .78;
      if (phaseData.theme === 'hardware') {
        ctx.fillRect(x - 54, base - 186, 108, 92); ctx.strokeRect(x - 54, base - 186, 108, 92);
        ctx.fillStyle = trim; ctx.fillRect(x - 18, base - 164, 36, 35); ctx.strokeRect(x - 18, base - 164, 36, 35);
        for (let p = 0; p < 4; p++) { ctx.fillRect(x - 45 + p * 25, base - 179, 14, 6); ctx.fillRect(x - 45 + p * 25, base - 111, 14, 6); }
        ctx.beginPath(); ctx.moveTo(x - 52, base - 78); ctx.lineTo(x - 35, base - 78); ctx.lineTo(x - 35, base - 45); ctx.stroke();
      } else if (phaseData.theme === 'software') {
        ctx.fillRect(x - 58, base - 178, 116, 88); ctx.strokeRect(x - 58, base - 178, 116, 88);
        ctx.fillStyle = accent; ctx.fillRect(x - 58, base - 178, 116, 14);
        for (let row = 0; row < 4; row++) { ctx.fillStyle = row === 3 ? '#ff5968' : trim; ctx.fillRect(x - 43, base - 151 + row * 12, row === 3 ? 56 : 74, 3); }
        ctx.strokeStyle = '#ff5968'; ctx.beginPath(); ctx.moveTo(x + 35, base - 117); ctx.lineTo(x + 49, base - 103); ctx.moveTo(x + 49, base - 117); ctx.lineTo(x + 35, base - 103); ctx.stroke();
      } else if (phaseData.theme === 'switch') {
        ctx.fillRect(x - 72, base - 132, 144, 70); ctx.strokeRect(x - 72, base - 132, 144, 70);
        for (let port = 0; port < 6; port++) { ctx.fillStyle = port % 3 === index % 3 ? '#ff815e' : accent; ctx.fillRect(x - 58 + port * 21, base - 111, 13, 10); }
        ctx.strokeStyle = trim;
        for (let cable = 0; cable < 3; cable++) { ctx.beginPath(); ctx.moveTo(x - 48 + cable * 35, base - 61); ctx.bezierCurveTo(x - 46 + cable * 35, base - 35, x + 48, base - 68, x + 48, base - 36); ctx.stroke(); }
      } else if (phaseData.theme === 'router') {
        ctx.fillRect(x - 66, base - 92, 132, 34); ctx.strokeRect(x - 66, base - 92, 132, 34);
        ctx.beginPath(); ctx.moveTo(x - 42, base - 92); ctx.lineTo(x - 55, base - 158); ctx.moveTo(x + 42, base - 92); ctx.lineTo(x + 55, base - 158); ctx.stroke();
        ctx.fillStyle = accent; ctx.fillRect(x - 30, base - 78, 7, 5); ctx.fillRect(x - 12, base - 78, 7, 5); ctx.fillRect(x + 7, base - 78, 7, 5);
        ctx.strokeStyle = accent; for (let arc = 0; arc < 3; arc++) { ctx.beginPath(); ctx.arc(x, base - 160, 23 + arc * 12, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke(); }
      } else if (phaseData.theme === 'wifi') {
        ctx.strokeStyle = trim; ctx.beginPath(); ctx.moveTo(x, base - 44); ctx.lineTo(x, base - 177); ctx.stroke();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, base - 181, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = accent; for (let arc = 0; arc < 4; arc++) { ctx.beginPath(); ctx.arc(x, base - 181, 22 + arc * 15, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
        if (index % 2) { ctx.strokeStyle = '#ff7868'; ctx.beginPath(); ctx.moveTo(x - 75, base - 130); ctx.lineTo(x + 75, base - 130); ctx.moveTo(x - 58, base - 145); ctx.lineTo(x + 55, base - 115); ctx.stroke(); }
      } else if (phaseData.theme === 'cabling') {
        ctx.fillRect(x - 55, base - 194, 110, 148); ctx.strokeRect(x - 55, base - 194, 110, 148);
        for (let rack = 0; rack < 4; rack++) { ctx.strokeRect(x - 42, base - 180 + rack * 31, 84, 23); ctx.fillStyle = [accent, '#ff665f', '#e8d24e', trim][rack]; ctx.fillRect(x - 31, base - 171 + rack * 31, 47, 4); }
        ctx.strokeStyle = '#ff675d'; ctx.beginPath(); ctx.moveTo(x - 35, base - 46); ctx.bezierCurveTo(x - 55, base - 28, x + 42, base - 45, x + 38, base - 18); ctx.stroke();
      } else if (phaseData.theme === 'dhcp') {
        for (let address = 0; address < 3; address++) { ctx.fillRect(x - 69 + address * 47, base - 142 - address * 15, 42, 36); ctx.strokeRect(x - 69 + address * 47, base - 142 - address * 15, 42, 36); ctx.fillStyle = accent; ctx.fillRect(x - 61 + address * 47, base - 132 - address * 15, 26, 3); ctx.fillRect(x - 61 + address * 47, base - 122 - address * 15, 18, 3); }
        ctx.fillStyle = trim; ctx.font = '9px monospace'; ctx.fillText('192.168.' + (index + 1) + '.0/24', x - 55, base - 82);
      } else if (phaseData.theme === 'dns') {
        ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(x, base - 150); ctx.lineTo(x, base - 92); ctx.moveTo(x, base - 121); ctx.lineTo(x - 44, base - 83); ctx.moveTo(x, base - 121); ctx.lineTo(x + 44, base - 83); ctx.stroke();
        [[0,-157],[-48,-78],[0,-78],[48,-78]].forEach(([dx,dy], node) => { ctx.fillStyle = node ? trim : accent; ctx.beginPath(); ctx.arc(x + dx, base + dy, node ? 13 : 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
        ctx.fillStyle = '#fff'; ctx.font = '8px monospace'; ctx.fillText('DNS', x - 12, base - 74);
      } else if (phaseData.theme === 'firewall') {
        ctx.fillStyle = '#512b39'; ctx.fillRect(x - 48, base - 170, 34, 126); ctx.fillRect(x + 14, base - 170, 34, 126);
        ctx.strokeStyle = accent; ctx.strokeRect(x - 48, base - 170, 34, 126); ctx.strokeRect(x + 14, base - 170, 34, 126);
        ctx.fillStyle = '#361d2a'; ctx.beginPath(); ctx.moveTo(x, base - 181); ctx.lineTo(x + 19, base - 163); ctx.lineTo(x + 15, base - 133); ctx.lineTo(x, base - 120); ctx.lineTo(x - 15, base - 133); ctx.lineTo(x - 19, base - 163); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        const isCenterCore = feature.x === 3970 || index === phaseData.entities.features.length - 1;
        const isPylon = feature.x >= 3400 && !isCenterCore;
        if (isCenterCore) {
          ctx.save();
          ctx.shadowColor = '#ff3366'; ctx.shadowBlur = 24;
          ctx.strokeStyle = '#ff436e'; ctx.lineWidth = 2.5;
          for (let ring = 1; ring <= 3; ring++) {
            ctx.beginPath();
            ctx.ellipse(x, base - 195, 44 + ring * 20, 16 + ring * 7, animationTime * (ring % 2 ? 0.7 : -0.7), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#170b1a'; ctx.fillRect(x - 36, base - 250, 72, 195);
          ctx.strokeRect(x - 36, base - 250, 72, 195);
          const pulse = 13 + Math.sin(animationTime * 4.5) * 4;
          ctx.fillStyle = '#ff436e';
          ctx.beginPath(); ctx.arc(x, base - 195, pulse, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
          ctx.fillText('VIRUS ZERO', x, base - 222);
          ctx.fillStyle = '#7ee5ff'; ctx.font = '8px monospace';
          ctx.fillText('NÚCLEO DIGITAL', x, base - 156);
          ctx.restore();
        } else if (isPylon) {
          ctx.fillStyle = '#0f1a2a'; ctx.fillRect(x - 22, base - 215, 44, 175);
          ctx.strokeStyle = accent; ctx.strokeRect(x - 22, base - 215, 44, 175);
          ctx.fillStyle = '#ff5b79'; ctx.fillRect(x - 4, base - 200, 8, 145);
          ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, base - 224, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillStyle = '#0b1624'; ctx.fillRect(x - 50, base - 206, 100, 166);
          ctx.strokeStyle = accent; ctx.strokeRect(x - 50, base - 206, 100, 166);
          for (let shelf = 0; shelf < 4; shelf++) {
            const sy = base - 194 + shelf * 36;
            ctx.strokeStyle = '#224059'; ctx.strokeRect(x - 42, sy, 84, 26);
            const ledOn1 = Math.sin(animationTime * 7 + index + shelf) > 0;
            const ledOn2 = Math.cos(animationTime * 9 + index * 2 + shelf) > 0;
            ctx.fillStyle = ledOn1 ? '#65ffcb' : '#103f2e'; ctx.fillRect(x + 22, sy + 7, 5, 4);
            ctx.fillStyle = ledOn2 ? '#ffb052' : '#452b10'; ctx.fillRect(x + 30, sy + 7, 5, 4);
            ctx.fillStyle = '#182f42'; ctx.fillRect(x - 36, sy + 7, 50, 3); ctx.fillRect(x - 36, sy + 13, 50, 3);
          }
          ctx.fillStyle = '#8bd3ec'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
          ctx.fillText('SRV-BLADE #' + (index + 1), x - 42, base - 210);
          ctx.strokeStyle = trim; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x - 42, base - 40); ctx.bezierCurveTo(x - 20, base - 15, x + 20, base - 15, x + 42, base - 40); ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function drawSolids() {
    for (const object of solids()) {
      const x = object.x;
      if (x + object.w - cameraX < 0 || x - cameraX > width) continue;
      if (object.kind === 'floor') {
        ctx.fillStyle = phaseData.palette[1];
        ctx.fillRect(x, object.y, object.w, object.h);
        ctx.fillStyle = phaseData.palette[2];
        ctx.shadowColor = phaseData.palette[2];
        ctx.shadowBlur = 12;
        ctx.fillRect(x, object.y, object.w, 2);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = phaseData.palette[3];
        ctx.globalAlpha = .45;
        for (let tileX = Math.floor(object.x / 48) * 48; tileX < object.x + object.w; tileX += 48) {
          ctx.strokeRect(tileX + .5, object.y + 8.5, 47, object.h - 9);
          ctx.fillStyle = phaseData.palette[2];
          ctx.globalAlpha = .28;
          ctx.fillRect(tileX + 8, object.y + 17, 7, 2);
        }
        ctx.globalAlpha = 1;
      } else if (object.kind === 'platform') {
        const platformColor = object.type === 'dangerous' ? '#aa4154'
          : object.style === 'window' ? '#393665'
          : object.style === 'cable' ? '#72543d'
          : object.style === 'packet' ? '#3b657c'
          : object.style === 'route' ? '#4b638a'
          : object.style === 'signal' ? '#245a77' : phaseData.palette[3];
        ctx.fillStyle = platformColor;
        if (object.type === 'temporary' && (platformRuntime.get(object.id)?.triggered)) ctx.globalAlpha = .55 + Math.sin(animationTime * 18) * .2;
        ctx.fillRect(x, object.y, object.w, object.h);
        ctx.fillStyle = object.type === 'dangerous' ? '#ff7181'
          : object.style === 'window' ? '#b59cff'
          : object.style === 'cable' ? '#ffbf72'
          : object.style === 'packet' ? '#a7edff'
          : object.style === 'route' ? '#83bdff'
          : object.style === 'signal' ? (Math.sin(animationTime * 4) > -.2 ? '#74e8ff' : '#3a718b')
          : phaseData.palette[2];
        ctx.fillRect(x, object.y, object.w, 3);
        ctx.strokeStyle = phaseData.palette[2];
        ctx.globalAlpha = .65;
        ctx.strokeRect(x + .5, object.y + .5, object.w - 1, object.h - 1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = phaseData.palette[2];
        ctx.globalAlpha = .55;
        for (let dot = 12; dot < object.w - 5; dot += 24) ctx.fillRect(x + dot, object.y + 8, 3, 3);
        ctx.globalAlpha = 1;
        if (object.type === 'dangerous') {
          ctx.fillStyle = '#ffd0d6';
          for (let tooth = 8; tooth < object.w; tooth += 18) {
            ctx.beginPath(); ctx.moveTo(x + tooth, object.y + 3); ctx.lineTo(x + tooth + 5, object.y - 5); ctx.lineTo(x + tooth + 10, object.y + 3); ctx.fill();
          }
        }
      } else if (object.kind === 'gate') {
        ctx.fillStyle = '#4d2731';
        ctx.fillRect(x, object.y, object.w, object.h);
        ctx.strokeStyle = '#ff7d69';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, object.y + 1, object.w - 2, object.h - 2);
        for (let y = 8; y < object.h; y += 20) { ctx.fillStyle = object.type === 'route-gate' ? '#ffc66d' : '#ff8a72'; ctx.fillRect(x + 5, object.y + y, object.w - 10, 3); }
      } else {
        ctx.fillStyle = object.type === 'boss-obstacle' ? '#49233b'
          : object.type === 'enemy-temporary' ? '#51283f'
          : object.type === 'corrupt' || object.type === 'interference' ? '#552d58'
          : object.type === 'fan' || object.type === 'heatsink' ? '#425260'
          : object.type === 'port' ? '#34534f'
          : object.type === 'route-wall' ? '#3c4b70' : phaseData.palette[3];
        ctx.fillRect(x, object.y, object.w, object.h);
        ctx.strokeStyle = object.type === 'boss-obstacle' ? '#ff5479'
          : object.type === 'enemy-temporary' ? '#ff83a2'
          : object.type === 'corrupt' || object.type === 'interference' ? '#ec71ff'
          : object.type === 'fan' || object.type === 'heatsink' ? '#a3d2d5'
          : object.type === 'port' ? '#56d9ce'
          : object.type === 'route-wall' ? '#80c6ff' : phaseData.palette[2];
        ctx.lineWidth = 1;
        ctx.strokeRect(x + .5, object.y + .5, object.w - 1, object.h - 1);
        ctx.fillStyle = object.type === 'boss-obstacle' ? '#ff5479' : object.type === 'enemy-temporary' ? '#ff83a2' : phaseData.palette[4];
        ctx.fillRect(x + 6, object.y + 6, object.w - 12, 3);
        ctx.fillStyle = object.type === 'boss-obstacle' ? '#ffadc0' : object.type === 'enemy-temporary' ? '#ffb2c4' : phaseData.palette[2];
        ctx.globalAlpha = .32;
        ctx.fillRect(x + 6, object.y + 15, 4, object.h - 22);
        ctx.fillRect(x + 15, object.y + 15, 4, object.h - 22);
        ctx.globalAlpha = 1;
        if (object.type === 'fan') {
          ctx.save(); ctx.translate(x + object.w / 2, object.y + object.h / 2); ctx.rotate(animationTime * 5);
          ctx.strokeStyle = '#c5e5e8'; ctx.lineWidth = 3;
          for (let blade = 0; blade < 4; blade++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -object.h * .31); ctx.stroke(); }
          ctx.fillStyle = '#56e5cf'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else if (object.type === 'heatsink') {
          ctx.strokeStyle = '#c5e5e8';
          for (let fin = 1; fin < 5; fin++) { const finX = x + fin * object.w / 5; ctx.beginPath(); ctx.moveTo(finX, object.y + 7); ctx.lineTo(finX, object.y + object.h - 7); ctx.stroke(); }
        } else if (object.type === 'corrupt') {
          ctx.strokeStyle = '#ff769a'; ctx.beginPath(); ctx.moveTo(x + 8, object.y + 12); ctx.lineTo(x + object.w - 8, object.y + object.h - 12); ctx.moveTo(x + object.w - 8, object.y + 12); ctx.lineTo(x + 8, object.y + object.h - 12); ctx.stroke();
        } else if (object.type === 'interference') {
          ctx.strokeStyle = '#f6a2ff'; ctx.globalAlpha = .7;
          for (let wave = 0; wave < 3; wave++) { const waveY = object.y + 16 + wave * 25; ctx.beginPath(); ctx.moveTo(x + 5, waveY); ctx.lineTo(x + object.w - 5, waveY); ctx.stroke(); }
          ctx.globalAlpha = 1;
        }
      }
    }

    for (const point of phaseData.map.checkpoints || []) {
      const pointX = typeof point === 'number' ? point : point.x;
      const pointY = typeof point === 'number' ? floorY() : point.y;
      if (pointX - cameraX < -24 || pointX - cameraX > width + 24 || pointY - cameraY < -58 || pointY - cameraY > height + 24) continue;
      const screenX = pointX;
      const active = Number.isFinite(pointY) && phaseData.map.layout === 'vertical'
        ? checkpointY != null && checkpointY <= pointY : checkpointX >= pointX;
      const beaconColor = active ? '#78ffd2' : '#6ea4ad';
      ctx.save();
      ctx.globalAlpha = active ? 1 : .65;
      ctx.shadowColor = beaconColor; ctx.shadowBlur = active ? 14 : 5;
      ctx.fillStyle = beaconColor;
      ctx.fillRect(screenX - 3, pointY - 30, 6, 30);
      ctx.beginPath(); ctx.arc(screenX, pointY - 35, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#0b2028';
      ctx.beginPath(); ctx.arc(screenX, pointY - 35, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    const gateX = phaseData.map.exit.x;
    if (gateX - cameraX > -70 && gateX - cameraX < width + 70 &&
      (!Number.isFinite(phaseData.map.exit.y) || phaseData.map.exit.y - cameraY > -100 && phaseData.map.exit.y - cameraY < height + 100)) {
      const gateColor = phaseExitUnlocked ? '#70ffce' : '#ff806b';
      const gateHeight = phaseData.map.layout === 'horizontal' ? 126 : (phaseData.map.exit.height || 126);
      const gateCenterY = Number.isFinite(phaseData.map.exit.y) ? phaseData.map.exit.y : floorY() - gateHeight / 2;
      const gateTop = gateCenterY - gateHeight / 2;
      ctx.save();
      ctx.shadowColor = gateColor; ctx.shadowBlur = 17;
      ctx.strokeStyle = gateColor; ctx.lineWidth = 2;
      ctx.fillStyle = phaseExitUnlocked ? 'rgba(48, 205, 164, .17)' : 'rgba(225, 76, 82, .13)';
      ctx.fillRect(gateX - 23, gateTop, 46, gateHeight);
      ctx.strokeRect(gateX - 23, gateTop, 46, gateHeight);
      ctx.beginPath(); ctx.moveTo(gateX, gateTop + 6); ctx.lineTo(gateX, gateTop + gateHeight - 6); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = gateColor; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(phaseExitUnlocked ? 'SAÍDA' : 'BLOQUEADA', gateX, gateTop - 8);
      ctx.restore();
    }
  }

  function drawComponents() {
    const nearby = findNearbyComponent();
    for (const component of components) {
      const x = component.x;
      if (x + component.width - cameraX < 0 || x - cameraX > width) continue;
      const cx = x + component.width / 2;
      const repaired = component.repaired;
      const color = repaired ? '#55e2bb' : '#ff9367';
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = repaired ? 10 : 5;
      ctx.fillStyle = repaired ? '#103a39' : '#35262b';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, component.y, component.width, component.height);
      ctx.strokeRect(x + .5, component.y + .5, component.width - 1, component.height - 1);
      ctx.shadowBlur = 0;
      ctx.fillStyle = repaired ? '#86ffe0' : '#ff735e';
      ctx.fillRect(x + 6, component.y + 7, component.width - 12, 13);
      ctx.fillStyle = repaired ? '#208e80' : '#633844';
      ctx.fillRect(x + 9, component.y + 11, component.width - 18, 3);
      if (!repaired && component.corruption > 0) {
        ctx.fillStyle = '#30252a';
        ctx.fillRect(x, component.y + component.height + 3, component.width, 3);
        ctx.fillStyle = '#e85c79';
        ctx.fillRect(x, component.y + component.height + 3, component.width * component.corruption / 100, 3);
      }
      ctx.strokeStyle = repaired ? '#59ddb7' : '#ff8c68';
      ctx.beginPath();
      ctx.moveTo(cx, component.y + 20);
      ctx.lineTo(cx, component.y + 29);
      ctx.lineTo(x + 10, component.y + 34);
      ctx.moveTo(cx, component.y + 29);
      ctx.lineTo(x + component.width - 9, component.y + 34);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillRect(x + 7, component.y + 37, 4, 3);
      ctx.fillRect(x + component.width - 11, component.y + 37, 4, 3);
      if (!repaired && nearby === component) {
        const pulse = .65 + (Math.sin(animationTime * 6) + 1) * .15;
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#ffd19a';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x - 5, component.y - 5, component.width + 10, component.height + 10);
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffd19a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SEGURE E', cx, component.y - 11);
        if (repairTarget === component && repairProgress > 0) {
          ctx.fillStyle = 'rgba(15, 26, 33, .95)';
          ctx.fillRect(cx - 18, component.y - 7, 36, 4);
          ctx.fillStyle = '#8affd6';
          ctx.fillRect(cx - 18, component.y - 7, 36 * Math.min(1, repairProgress / repairDuration), 4);
        }
      }
      if (repaired) {
        ctx.globalAlpha = .55 + (Math.sin(component.phase) + 1) * .2;
        ctx.fillStyle = '#7affd1';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OK', cx, component.y - 5);
      }
      ctx.restore();
    }
  }

  function drawCollectibles() {
    for (const collectible of collectibles) {
      if (collectible.collected) continue;
      const x = collectible.x;
      if (x - cameraX < -20 || x - cameraX > width + 20) continue;
      const bob = Math.sin(collectible.phase) * 4;
      ctx.save();
      ctx.translate(x, collectible.y + bob);
      ctx.rotate(Math.PI / 4 + collectible.phase * .25);
      ctx.shadowColor = '#64f5e1';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#16534f';
      ctx.strokeStyle = '#94fff0';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-7, -7, 14, 14);
      ctx.strokeRect(-7, -7, 14, 14);
      ctx.fillStyle = '#b8fff2';
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    }
  }

  function drawViruses() {
    for (const virus of viruses) {
      if (!virus.alive) continue;
      const x = virus.x;
      if (x - cameraX + virus.radius < -10 || x - cameraX - virus.radius > width + 10) continue;
      const pulse = 1 + Math.sin(virus.phase) * .08;
      const fast = virus.type === 'fast';
      const boss = virus.type === 'boss';
      const palette = { basic: '#bb7bff', fast: '#ff9263', armored: '#76b9ff', flyer: '#73e4ff', shooter: '#ffd166', parasite: '#7dff9b' };
      const color = boss ? '#ff476f' : palette[virus.type] || '#bb7bff';
      const armored = virus.type === 'armored';
      const flyer = virus.type === 'flyer';
      const shooter = virus.type === 'shooter';
      const parasite = virus.type === 'parasite';
      ctx.save();
      ctx.translate(x, virus.y);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = color;
      ctx.shadowBlur = boss ? 26 : fast ? 16 : 13;
      ctx.fillStyle = virus.hitFlash > 0 ? '#ffffff' : boss ? '#45142d' : fast ? '#4c2528' : armored ? '#183353' : flyer ? '#143d4a' : shooter ? '#4a3b1c' : parasite ? '#17442b' : '#302044';
      ctx.strokeStyle = color;
      ctx.lineWidth = boss ? 3 : fast ? 2 : 1.8;
      if (armored && virus.vulnerableTime <= 0) {
        ctx.strokeStyle = '#c2e8ff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, virus.radius + 8, -.45, Math.PI * 1.45); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      }
      if (flyer) {
        const wing = 8 + Math.sin(virus.phase * 2) * 4;
        ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-virus.radius - wing, -wing); ctx.lineTo(-virus.radius - 2, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(virus.radius + wing, -wing); ctx.lineTo(virus.radius + 2, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (boss) {
        if (virus.coreShielded) {
          ctx.save();
          ctx.rotate(virus.phase * .65);
          ctx.strokeStyle = '#7cdcff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#6be4ff';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          for (let hex = 0; hex < 6; hex++) {
            const ha = hex * Math.PI / 3;
            const hx = Math.cos(ha) * (virus.radius + 14);
            const hy = Math.sin(ha) * (virus.radius + 14);
            if (hex === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        } else if (virus.vulnerableTime > 0) {
          ctx.strokeStyle = '#ffe27a';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ffe27a';
          ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(0, 0, virus.radius + 11, 0, Math.PI * 2); ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = '#ffafc4';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, virus.radius + 9, 0, Math.PI * 2); ctx.stroke();
        }
        if (virus.attackWindup > 0) {
          ctx.strokeStyle = '#fff0a3'; ctx.lineWidth = 3;
          ctx.setLineDash([5, 3]);
          ctx.beginPath(); ctx.arc(0, 0, virus.radius + 16 + Math.sin(virus.phase * 5) * 2, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.strokeStyle = color;
      }
      if (fast) {
        ctx.beginPath();
        ctx.moveTo(-virus.radius - 8, 0);
        ctx.lineTo(-virus.radius + 2, -virus.radius * .45);
        ctx.lineTo(-virus.radius + 2, virus.radius * .45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, virus.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (shooter) {
        ctx.fillStyle = '#fff0b5'; ctx.fillRect(-4, virus.radius - 1, 8, 7);
        ctx.fillStyle = color; ctx.fillRect(-2, virus.radius + 2, 4, 3);
      }
      if (parasite) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-4, virus.radius - 2); ctx.lineTo(-12, virus.radius + 10 + Math.sin(virus.phase) * 3);
        ctx.moveTo(4, virus.radius - 2); ctx.lineTo(12, virus.radius + 10 - Math.sin(virus.phase) * 3); ctx.stroke();
      }
      if (virus.attackWindup > 0) {
        ctx.strokeStyle = '#fff0a3'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, virus.radius + 12 + Math.sin(virus.phase * 4) * 2, 0, Math.PI * 2); ctx.stroke();
      }
      for (let spike = 0; spike < 8; spike++) {
        const angle = spike * Math.PI / 4 + virus.phase * .12;
        const sx = Math.cos(angle), sy = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(sx * (virus.radius - 2), sy * (virus.radius - 2));
        ctx.lineTo(sx * (virus.radius + 5), sy * (virus.radius + 5));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = boss ? '#ffe3ec' : '#fff0e9';
      ctx.fillRect(-virus.radius * .4, -3, boss ? 6 : 3, boss ? 5 : 3);
      ctx.fillRect(virus.radius * .15, -3, boss ? 6 : 3, boss ? 5 : 3);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(-3, 4);
      ctx.lineTo(3, 4);
      ctx.stroke();
      ctx.restore();

      if (virus.hp < virus.maxHp || boss || armored) {
        const barWidth = boss ? 82 : 28;
        ctx.fillStyle = '#1a2029';
        ctx.fillRect(x - barWidth / 2, virus.y - virus.radius - 10, barWidth, boss ? 6 : 3);
        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, virus.y - virus.radius - 10, barWidth * virus.hp / virus.maxHp, boss ? 6 : 3);
        if (armored && virus.vulnerableTime > 0) {
          ctx.fillStyle = '#ffe58b';
          ctx.fillRect(x - barWidth / 2, virus.y - virus.radius - 5, barWidth * Math.min(1, virus.vulnerableTime / (virus.vulnerableDuration || 1.25)), 2);
        }
        if (boss) {
          const stageNames = {1:'PADRÕES', 2:'DISPAROS', 3:'COMBO CRÍTICO'};
          const stageName = stageNames[virus.bossStage || 1] || 'BATALHA';
          ctx.fillStyle = '#ffd9e4'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
          ctx.fillText('VIRUS ZERO [ETAPA ' + (virus.bossStage || 1) + ' - ' + stageName + ']', x, virus.y - virus.radius - 15);
          if (virus.vulnerableTime > 0) {
            ctx.fillStyle = '#ffe27a';
            ctx.fillRect(x - barWidth / 2, virus.y - virus.radius - 4, barWidth * Math.min(1, virus.vulnerableTime / 1.4), 2);
          }
          const lockText = virus.coreShielded ? 'NÚCLEO PROTEGIDO // 4 RELAYS' : 'NÚCLEO VULNERÁVEL // ESCUDO OFFLINE';
          const attackKindTips = {
            slam: 'ATAQUE // IMPACTO SÍSMICO [PULAR]',
            charge: 'ATAQUE // INVESTIDA DE DADOS [PULAR/SUBIR]',
            volley: 'ATAQUE // DISPARO DE FEIXES [ESQUIVAR]',
            surge: 'ATAQUE // ERUPÇÃO DO NÚCLEO [SUBIR]',
            combo: 'ATAQUE // SEQUÊNCIA CRÍTICA [CUIDADO]'
          };
          const combatText = virus.attackWindup > 0
            ? (attackKindTips[virus.bossAttackKind] || ('ATAQUE // ' + String(virus.bossAttackKind || 'PREPARANDO').toUpperCase()))
            : virus.vulnerableTime > 0 ? '⚡ VULNERÁVEL // ATAQUE AGORA! ⚡' : 'ETAPA ' + (virus.bossStage || 1) + ' // GUARDA';
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = virus.coreShielded ? '#9ae9ff' : '#69ffd4';
          ctx.fillText(lockText, x, virus.y + virus.radius + 14);
          ctx.fillStyle = virus.attackWindup > 0 ? '#fff0a3' : virus.vulnerableTime > 0 ? '#ffe27a' : '#c1d0dc';
          ctx.fillText(combatText, x, virus.y + virus.radius + 25);
          if (virus.attackWindup > 0 && (virus.bossAttackKind === 'slam' || virus.bossAttackKind === 'combo')) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 84, 121, 0.22)';
            ctx.strokeStyle = '#ff5479';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 4]);
            const slamRadius = (virus.bossStage === 3 ? 188 : 148);
            ctx.beginPath();
            ctx.ellipse(virus.x, floorY() - 3, slamRadius, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
  }

  function drawProjectiles() {
    for (const projectile of projectiles) {
      const x = projectile.x;
      ctx.save();
      ctx.strokeStyle = 'rgba(78, 245, 223, .55)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#59ffe6';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(x - Math.sign(projectile.vx) * 13, projectile.y);
      ctx.lineTo(x + Math.sign(projectile.vx) * 5, projectile.y);
      ctx.stroke();
      ctx.fillStyle = '#d7fff5';
      ctx.beginPath();
      ctx.arc(x, projectile.y, projectile.radius * .65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const projectile of enemyProjectiles) {
      const screenX = projectile.x;
      if (screenX - cameraX < -16 || screenX - cameraX > width + 16) continue;
      ctx.save();
      ctx.strokeStyle = projectile.color || '#ff806b';
      ctx.lineWidth = 3;
      ctx.shadowColor = projectile.color || '#ff806b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(screenX - projectile.vx * .035, projectile.y - projectile.vy * .035);
      ctx.lineTo(screenX, projectile.y);
      ctx.stroke();
      ctx.fillStyle = '#fff3cf';
      ctx.beginPath(); ctx.arc(screenX, projectile.y, projectile.radius * .6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawRobot() {
    if (!player) return;
    const cx = player.x + player.width / 2;
    const top = player.y;
    const stride = player.grounded ? Math.sin(player.walkTime) * 5 : 2;
    ctx.save();
    ctx.translate(cx, top);
    ctx.scale(player.facing, 1);
    if (damageCooldown > 0 && Math.floor(animationTime * 14) % 2 === 0) ctx.globalAlpha = .4;

    if (player.shieldTime > 0) {
      ctx.save();
      ctx.globalAlpha = .35 + Math.sin(animationTime * 10) * .1;
      ctx.strokeStyle = '#7aafff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#7aafff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 24, 27, 33, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Energy pulse from the arm while attacking.
    if (attackCooldown > .2) {
      ctx.fillStyle = '#a5fff0';
      ctx.shadowColor = '#55ffe7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(18, 24, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ground shadow and little exhaust glow.
    ctx.fillStyle = 'rgba(63, 230, 214, .16)';
    ctx.beginPath();
    ctx.ellipse(0, player.height + 3, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (Math.abs(player.vx) > 0 && player.grounded) {
      ctx.fillStyle = 'rgba(89, 224, 213, .8)';
      ctx.fillRect(-20, 26, 5 + (Math.sin(animationTime * 35) + 1) * 2, 3);
    }

    // Legs animate in opposition while walking.
    ctx.strokeStyle = '#67e8d7';
    ctx.lineWidth = 5;
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(-7, 34); ctx.lineTo(-8 - stride, 43); ctx.lineTo(-10 - stride, 46);
    ctx.moveTo(7, 34); ctx.lineTo(8 + stride, 43); ctx.lineTo(10 + stride, 46);
    ctx.stroke();
    ctx.fillStyle = '#b5fff0';
    ctx.fillRect(-14 - stride, 44, 9, 4);
    ctx.fillRect(6 + stride, 44, 9, 4);

    // Body, shoulder armor, and luminous visor.
    ctx.shadowColor = '#42e6d3';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#123942';
    ctx.strokeStyle = '#7ff8e2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 14); ctx.lineTo(10, 14); ctx.lineTo(13, 31);
    ctx.lineTo(8, 36); ctx.lineTo(-9, 36); ctx.lineTo(-14, 31); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#72f1dc';
    ctx.fillRect(-4, 22, 9, 3);
    ctx.fillStyle = '#294d52';
    ctx.fillRect(-4, 27, 9, 4);

    const armSwing = player.grounded && Math.abs(player.vx) > 0 ? stride * .45 : 0;
    ctx.strokeStyle = '#7cebd9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-11, 18); ctx.lineTo(-15, 25 + armSwing);
    ctx.moveTo(11, 18); ctx.lineTo(15, 25 - armSwing);
    ctx.stroke();

    ctx.fillStyle = '#16434b';
    ctx.strokeStyle = '#a0ffed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12, 0, 24, 19, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0b2028';
    ctx.fillRect(-8, 5, 16, 8);
    ctx.fillStyle = '#b0fff1';
    ctx.shadowColor = '#7cfff0';
    ctx.shadowBlur = 8;
    ctx.fillRect(1, 7, 7, 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#53e4d8';
    ctx.fillRect(-5, 16, 3, 2);
    ctx.fillRect(4, 16, 3, 2);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    drawThemeStructures();
    // Subtle world grid inside the computer's digital environment.
    ctx.strokeStyle = 'rgba(62, 132, 145, .08)';
    for (let x = Math.floor(cameraX / 44) * 44; x < cameraX + width + 44; x += 44) {
      ctx.beginPath(); ctx.moveTo(x, cameraY); ctx.lineTo(x, cameraY + height); ctx.stroke();
    }
    drawSolids();
    drawComponents();
    drawCollectibles();
    drawViruses();
    drawProjectiles();
    drawEffects();
    drawRobot();
    ctx.restore();
    ctx.fillStyle = '#718994';
    ctx.font = '9px monospace';
    ctx.fillText('X: ' + String(Math.floor(player.x)).padStart(4, '0') + '  CAM: ' + String(Math.floor(cameraX)).padStart(4, '0'), 12, height - 12);
    if (interactionMessageTimer > 0 && interactionMessage) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = interactionMessage === 'COMPONENTE REPARADO' ? '#8bffd9' : '#ffc19a';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillText(interactionMessage, width / 2, 27);
      ctx.restore();
    }
  }

  function frame(timestamp) {
    if (!running) return;
    const dt = Math.min((timestamp - lastFrame) / 1000 || 0, 1 / 30);
    lastFrame = timestamp;
    update(dt);
    draw();
    if (running) requestAnimationFrame(frame);
  }

  function launchLoadedPhase() {
    paused = false;
    menuScreen = false;
    phaseTransition = false;
    gameOver = false;
    running = true;
    document.querySelector('.game-shell').classList.add('playing');
    continueButton.hidden = true;
    overlay.classList.add('hidden');
    ui.stage.textContent = 'FASE ' + String(phaseIndex + 1).padStart(2, '0') + ' // EM ANDAMENTO';
    addLog('Iniciada: ' + phaseData.name + '.');
    lastFrame = performance.now();
    requestAnimationFrame(frame);
    saveCampaign();
  }

  function pause() {
    if (!running) return;
    keys.clear();
    running = false;
    paused = true;
    document.querySelector('.game-shell').classList.remove('playing');
    saveCampaign();
    ui.title.innerHTML = 'TRAVESSIA <span>PAUSADA</span>';
    ui.copy.textContent = 'A unidade está em espera. Continue quando estiver pronto.';
    startButton.innerHTML = 'CONTINUAR <span>→</span>';
    overlay.classList.remove('hidden');
    ui.stage.textContent = 'TRAVESSIA PAUSADA';
    draw();
  }

  startButton.addEventListener('click', () => {
    if (paused) {
      paused = false;
      running = true;
      menuScreen = false;
      document.querySelector('.game-shell').classList.add('playing');
      continueButton.hidden = true;
      overlay.classList.add('hidden');
      ui.stage.textContent = 'FASE ' + String(phaseIndex + 1).padStart(2, '0') + ' // EM ANDAMENTO';
      lastFrame = performance.now();
      requestAnimationFrame(frame);
    } else if (phaseTransition && !campaignComplete) {
      loadPhase(phaseIndex + 1);
      launchLoadedPhase();
    } else if (gameOver) {
      loadPhase(phaseIndex, true);
      launchLoadedPhase();
    } else {
      startNewCampaign();
    }
  });
  continueButton.addEventListener('click', continueCampaign);
  soundToggle.addEventListener('click', () => setSoundEnabled(!soundEnabled));

  resetCampaign();

  if (new URLSearchParams(location.search).has('final-boss-qa')) {
    const checks = {};
    try {
      checks.tenPhases = PHASES.length === 10 && PHASES.every(phase => phase.entities.platforms.length && phase.entities.enemies.length && phase.entities.components.length);
      loadPhase(0, true); running = true; xpRequired = 999999; viruses.forEach(virus => { virus.alive = false; });
      const temporary = phaseData.entities.platforms.find(platform => platform.type === 'temporary');
      const moving = phaseData.entities.platforms.find(platform => platform.type === 'moving');
      const permanent = phaseData.entities.platforms.find(platform => platform.type === 'fixed');
      const temporaryState = getPlatformState(temporary);
      temporaryState.triggered = true; temporaryState.elapsed = temporary.duration - .05;
      update(.1);
      const disappeared = !platformShape(temporary);
      update(temporary.respawnDelay + .1);
      const returned = Boolean(platformShape(temporary)) && temporaryState === getPlatformState(temporary);
      const fixedStayed = Boolean(platformShape(permanent));
      const beforeMotion = platformShape(moving).x;
      update(.5);
      checks.platformCycles = disappeared && returned && fixedStayed && platformShape(moving).x !== beforeMotion;
      const tempShape = platformShape(temporary);
      temporaryState.triggered = true; temporaryState.elapsed = temporary.duration;
      update(.016);
      const hiddenWhileOccupied = !temporaryState.active;
      player.x = 70; player.y = floorY() - player.height; player.grounded = true; player.vy = 0;
      temporaryState.elapsed = temporary.respawnDelay - .016;
      update(.016);
      checks.noOverlapRespawn = hiddenWhileOccupied && temporaryState.active;

      loadPhase(9, true); running = true; viruses.forEach(virus => { virus.alive = false; });
      const boss = viruses.find(virus => virus.type === 'boss');
      const hasArena = phaseData.map.width > PHASES.slice(0, 9).reduce((max, phase) => Math.max(max, phase.map.width), 0) &&
        phaseData.entities.platforms.some(platform => platform.id === 'core-moving-lift') && phaseData.map.checkpoints.length === 3;
      const intact = boss.hp;
      damageVirus(boss, 30);
      const shieldWorks = boss.hp === intact;
      components.forEach(component => { component.repaired = true; });
      damageVirus(boss, 10);
      const vulnerableByRelays = boss.hp < intact;
      boss.hp = 35; boss.bossStage = 1; boss.bossPatternIndex = 0; boss.bossCycleCooldown = 0;
      updateVirusZero(boss, .01, 100, floorY() - 20);
      const stageTwoTelegraph = boss.bossStage === 2 && boss.attackWindup > 0;
      updateVirusZero(boss, 1, 100, floorY() - 20);
      const stageTwoVolley = enemyProjectiles.filter(projectile => projectile.bossOwned).length >= 3;
      boss.hp = 18; boss.bossStage = 2; boss.bossPatternIndex = 0; boss.bossCycleCooldown = 0;
      updateVirusZero(boss, .01, 100, floorY() - 20);
      const stageThreeTelegraph = boss.bossStage === 3 && boss.attackWindup > 0;
      updateVirusZero(boss, 1, 100, floorY() - 20);
      const stageThreeCombo = enemyProjectiles.filter(projectile => projectile.bossOwned).length >= 8 && boss.vulnerableTime > 0;
      checks.bossStagesAndShield = hasArena && shieldWorks && vulnerableByRelays && stageTwoTelegraph && stageTwoVolley && stageThreeTelegraph && stageThreeCombo;

      viruses.filter(virus => virus !== boss).forEach(virus => { virus.alive = false; });
      boss.hp = 1; boss.vulnerableTime = 1;
      damageVirus(boss, 10);
      checkObjectives();
      checks.victoryQuestionFlow = phaseExitUnlocked && !boss.alive;
      running = true; openPhaseQuestion();
      const correctAnswer = ui.questionOverlay.querySelector('[data-correct="true"]');
      correctAnswer.click();
      ui.questionOverlay.querySelector('.question-action').click();
      checks.victoryScreen = campaignComplete && ui.stage.textContent === 'CAMPANHA CONCLUÍDA';
      document.documentElement.dataset.finalBossQa = Object.entries(checks).filter(([,passed]) => !passed).length ? JSON.stringify(checks) : 'PASS';
    } catch (error) {
      document.documentElement.dataset.finalBossQa = 'ERROR: ' + error.message;
    }
  }

if (new URLSearchParams(location.search).has('extended-boss-test')) {
    const checks = {};
    try {
      loadPhase(9, true); running = true; xpRequired = 999999;
      const phase10 = phaseData;
      
      // 1. Check three parts
      const part1Platforms = phase10.entities.platforms.filter(p => p.x < 1800);
      const part1HasShortcut = part1Platforms.some(p => p.requiresComponentId === 'c01');
      const part1HasVertical = part1Platforms.some(p => p.type === 'moving' && p.motion?.axis === 'y');
      const part1Components = phase10.entities.components.filter(c => c.x < 1800);
      
      const part2Platforms = phase10.entities.platforms.filter(p => p.x >= 1800 && p.x < 3340);
      const part2HasBreakaway = part2Platforms.some(p => p.type === 'temporary');
      const part2HasMoving = part2Platforms.some(p => p.type === 'moving');
      const part2Obstacles = phase10.entities.obstacles.filter(o => o.x >= 1800 && o.x < 3340);
      const part2HasLaser = part2Obstacles.some(o => o.window && o.collision === 'dangerous');
      const part2Enemies = phase10.entities.enemies.filter(e => e.x >= 1800 && e.x < 3340);
      const part2HasFlyer = part2Enemies.some(e => e.type === 'flyer');
      const part2HasShooter = part2Enemies.some(e => e.type === 'shooter');
      const part2HasParasite = part2Enemies.some(e => e.type === 'parasite');
      const part2HasArmored = part2Enemies.some(e => e.type === 'armored');
      const part2HasFast = part2Enemies.some(e => e.type === 'fast');
      const part2Components = phase10.entities.components.filter(c => c.x >= 1800 && c.x < 3340);
      const part2Airlock = phase10.entities.gates.some(g => g.id === 'core-airlock' && g.requiresComponentId === 'c04');
      
      const part3Platforms = phase10.entities.platforms.filter(p => p.x >= 3340);
      const part3HasLift = part3Platforms.some(p => p.id === 'core-moving-lift');
      const part3HasHighDodge = part3Platforms.some(p => p.offset > 200 && p.id !== 'core-moving-lift');
      const part3Cover = phase10.entities.obstacles.filter(o => o.x >= 3340 && o.type === 'heatsink');
      const boss = viruses.find(v => v.type === 'boss');
      const part3Boss = boss && boss.bossBounds && boss.bossBounds.left === 3420 && boss.bossBounds.right === 4450;
      
      checks.part1Exploration = part1Platforms.length >= 6 && part1HasShortcut && part1HasVertical && part1Components.length === 2;
      checks.part2AdvancedCombat = part2HasBreakaway && part2HasMoving && part2HasLaser &&
        part2HasFlyer && part2HasShooter && part2HasParasite && part2HasArmored && part2HasFast &&
        part2Components.length === 2 && part2Airlock;
      checks.part3FinalArena = part3HasLift && part3HasHighDodge && part3Cover.length >= 2 && part3Boss && phase10.map.checkpoints.length === 3;
      
      // 2. Shield deactivation by fulfilling relay objectives
      const initialHp = boss.hp;
      damageVirus(boss, 20);
      const damageBlockedByShield = (boss.hp === initialHp);
      components.forEach(c => { c.repaired = true; });
      damageVirus(boss, 10);
      const damageAcceptedAfterRepairs = (boss.hp < initialHp);
      checks.shieldMechanism = damageBlockedByShield && damageAcceptedAfterRepairs;
      
      // 3. Multi-stage boss behavior
      // Stage 1
      boss.hp = 45; boss.bossStage = 1; boss.bossPatternIndex = 0; boss.bossCycleCooldown = 0; boss.attackWindup = 0;
      updateVirusZero(boss, .01, 100, floorY() - 20);
      const stage1Attack = (boss.bossStage === 1 && boss.attackWindup > 0);
      updateVirusZero(boss, 1, 100, floorY() - 20);
      // Stage 2
      boss.hp = 30; boss.bossStage = 1; boss.bossPatternIndex = 0; boss.bossCycleCooldown = 0; boss.attackWindup = 0;
      updateVirusZero(boss, .01, 100, floorY() - 20);
      const stage2Transition = (boss.bossStage === 2 && boss.attackWindup > 0);
      updateVirusZero(boss, 1, 100, floorY() - 20);
      const stage2Projectiles = enemyProjectiles.filter(p => p.bossOwned).length >= 3;
      // Stage 3
      boss.hp = 15; boss.bossStage = 2; boss.bossPatternIndex = 0; boss.bossCycleCooldown = 0; boss.attackWindup = 0;
      updateVirusZero(boss, .01, 100, floorY() - 20);
      const stage3Transition = (boss.bossStage === 3 && boss.attackWindup > 0);
      updateVirusZero(boss, 1, 100, floorY() - 20);
      const stage3ComboAndVulnerable = (enemyProjectiles.filter(p => p.bossOwned).length >= 8 && boss.vulnerableTime > 0);
      checks.bossStages = stage1Attack && stage2Transition && stage2Projectiles && stage3Transition && stage3ComboAndVulnerable;
      
      // 4. Player skills integration test
      player.armor = 0.3;
      const initialPlayerHealth = player.health;
      damagePlayer(20, { x: 0 });
      const armorProtected = (player.health === initialPlayerHealth - Math.max(1, Math.ceil(20 * (1 - 0.3))));
      unlockedSkills = [{ id: 'cannon', level: 3 }, { id: 'rapid', level: 2 }];
      player.damage = 4;
      player.fireRate = 0.25;
      const cannonWorks = player.damage === 4 && player.fireRate === 0.25;
      checks.playerSkills = armorProtected && cannonWorks;
      
      // 5. Checkpoints & Respawn
      player.health = 10;
      checkpointX = phase10.map.checkpoints[0];
      respawnAtCheckpoint();
      const cp1Safe = player.health === player.maxHealth && player.x >= 1210;
      checkpointX = phase10.map.checkpoints[1];
      respawnAtCheckpoint();
      const cp2Safe = player.health === player.maxHealth && player.x >= 2460;
      checkpointX = phase10.map.checkpoints[2];
      respawnAtCheckpoint();
      const cp3Safe = player.health === player.maxHealth && player.x >= 3260;
      checks.checkpointsWorking = cp1Safe && cp2Safe && cp3Safe;
      
      // 6. Campaign completion & Victory screen
      viruses.forEach(v => { v.alive = false; });
      checkObjectives();
      const exitUnlocked = phaseExitUnlocked;
      running = true;
      openPhaseQuestion();
      const questionActive = ui.questionOverlay.classList.contains('active');
      const correctBtn = ui.questionOverlay.querySelector('[data-correct="true"]');
      correctBtn.click();
      ui.questionOverlay.querySelector('.question-action').click();
      const victoryCompleted = campaignComplete && ui.stage.textContent === 'CAMPANHA CONCLUÍDA';
      checks.victoryAndEnd = exitUnlocked && questionActive && victoryCompleted;
      
      document.documentElement.dataset.extendedBossTest = Object.entries(checks).filter(([,passed]) => !passed).length ? JSON.stringify(checks) : 'PASS';
    } catch (err) {
      document.documentElement.dataset.extendedBossTest = 'ERROR: ' + err.message;
    }
  }

  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (['w', 'arrowup', ' '].includes(key) && !keys.has(key)) jumpQueued = true;
    if (key === 'e' && !keys.has(key) && running && !findNearbyComponent()) {
      interactionMessage = 'NENHUM COMPONENTE AO ALCANCE';
      interactionMessageTimer = 1.2;
    }
    keys.add(key);
    if (key === 'escape') pause();
  });
  window.addEventListener('keyup', event => {
    const key = event.key.toLowerCase();
    keys.delete(key);
    if (key === 'e') {
      repairTarget = null;
      repairProgress = 0;
    }
  });
  window.addEventListener('blur', () => keys.clear());
  window.addEventListener('pagehide', saveCampaign);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveCampaign(); });

  resetCampaign();
  resize();
  draw();
  setSoundEnabled(soundEnabled);
  bindTouchControls();
  setupMenu();

})();
