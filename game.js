(() => {
  const canvas = document.getElementById('game');
  const displayContext = canvas.getContext('2d');
  let ctx = displayContext;
  const pixelScene=document.createElement('canvas');
  const pixelContext=pixelScene.getContext('2d');
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
  const experience = ByteRunner.experience;
  const SAVE_KEY = ByteRunner.proceduralDemo?.storageKey || 'byteRunner.campaign.v1';
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

  const ROBOT_WIDTH = ByteRunner.platformPhysics.base.width;
  const ROBOT_HEIGHT = ByteRunner.platformPhysics.base.height;
  const GRAVITY = ByteRunner.platformPhysics.base.gravity;
  const RUN_SPEED = ByteRunner.platformPhysics.base.speed;
  const JUMP_SPEED = ByteRunner.platformPhysics.base.jump;
  const MAX_PLAYER_ARMOR = .5;
  const PLAYER_HIT_INVULNERABILITY = 1;
  const ENEMY_PROFILES = ByteRunner.enemies.profiles;
  const ABILITIES = [
    { id: 'armor', name: 'Armadura reforçada', maxLevel: 5, description: level => `Reduz o dano recebido em ${level * 10}% no total.`, apply: level => { player.armor = Math.min(MAX_PLAYER_ARMOR, Math.max(0, level) * .1); } },
    { id: 'rapid', name: 'Disparo rápido', maxLevel: 5, description: level => `Reduz o intervalo entre ataques em ${Math.round((1 - Math.pow(.9, level)) * 100)}%.`, apply: level => { player.fireRate = Math.max(.14, .32 * Math.pow(.9, level)); } },
    { id: 'cannon', name: 'Canhão de energia', maxLevel: 5, description: level => `Projéteis causam ${level + 1} de dano.`, apply: level => { player.damage = 1 + level; } },
    { id: 'boost', name: 'Propulsores', maxLevel: 5, description: level => `Aumenta a força do pulo em ${Math.round((Math.pow(1.08, level) - 1) * 100)}%.`, apply: level => { player.jumpPower = JUMP_SPEED * Math.pow(1.08, level); } },
    { id: 'shield', name: 'Escudo temporário', maxLevel: 5, description: level => `Escudo por ${5 + (level - 1) * .75}s; recarga de ${Math.max(14, 18 - (level - 1))}s.`, apply: level => { const rank = Math.max(1, Math.min(5, level)); player.shieldDuration = 5 + (rank - 1) * .75; player.shieldCooldownDuration = Math.max(14, 18 - (rank - 1)); player.shieldTime = player.shieldDuration; player.shieldCooldown = -1; } },
    { id: 'repair', name: 'Reparo eficiente', maxLevel: 5, description: level => `+${level} dicas por tentativa e +${Math.floor(level / 2)} verificações antes da falha.`, apply: level => { repairDuration = .8 * (1 - level * .1); } },
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
  const PHASES = ByteRunner.maps.campaign(ByteRunner.campaign);
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
  let checkpointY = null;
  let checkpointIndex = -1;
  let levelRuntime = null;
  let levelVisuals = null;
  let repairSession = null;
  let visualGeometry = new Map();
  let minimapKey = '';
  let questionRetryRequired = false;
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
  let deathEcho = null;
  let pacing = null;
  let phaseIntroTime = 0;
  let noticeTime = 0;
  let frameAccumulator = 0;
  let previousRenderPlayer = null;
  let renderAlpha = 1;
  let landingSpring = 0;
  let shotPose = 0;
  let abilityPose = 0;
  let actorAnimationTime = 0;
  let activeSounds = 0;
  let hudTimer = 0;

  function notifyExperience(text) {
    const notice=document.getElementById('experienceNotice');
    notice.textContent=text;notice.classList.add('visible');noticeTime=4;
  }

  function endPhaseIntro() {
    phaseIntroTime=0;keys.clear();jumpQueued=false;frameAccumulator=0;
    document.getElementById('phaseIntro').hidden=true;
    document.querySelector('.game-shell').classList.remove('introducing');
  }

  function beginPhaseIntro() {
    phaseIntroTime=experience.settings.reducedEffects?1.6:2.6;
    document.getElementById('introSector').textContent='SETOR '+String(phaseIndex+1).padStart(2,'0')+' / 10';
    document.getElementById('introTitle').textContent=phaseData.name;
    document.getElementById('introMission').textContent=phaseData.objective;
    document.getElementById('introLesson').textContent=ByteRunner.pacing.lessons[phaseIndex];
    document.getElementById('phaseIntro').hidden=false;
    document.querySelector('.game-shell').classList.add('introducing');keys.clear();jumpQueued=false;
  }

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
    if(!enabled)experience.silence(audioContext);
  }

  function playSound(kind) {
    if (!soundEnabled || experience.settings.volume===0 || experience.settings.sfx===0 || activeSounds>=12) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audioContext ||= new Audio();
      if (audioContext.state === 'suspended') audioContext.resume()?.catch?.(()=>{});
      const now = audioContext.currentTime;
      const settings = {
        attack: [620, .045, 'square'], hit: [150, .12, 'sawtooth'],
        repair: [760, .16, 'sine'], xp: [880, .07, 'triangle'],
        level: [1040, .22, 'triangle'], correct: [980, .24, 'sine'],
        checkpoint: [1320,.28,'sine'], victory:[660,.6,'triangle'], start:[330,.18,'sine'], jump:[420,.08,'triangle'], land:[100,.05,'sine'],
        wrong: [190, .22, 'square'], damage: [110, .18, 'sawtooth'],
        enemyWarning:[360,.16,'triangle'], dashWarning:[480,.2,'sawtooth'],
        enemyDash:[220,.12,'sawtooth'], enemyShot:[820,.09,'square'],
        enemyStrike:[180,.1,'triangle'], enemyDive:[560,.15,'sine'],
        infectWarning:[130,.25,'sine'], enemySummon:[260,.3,'triangle'],
        dnsEcho:[1020,.12,'sine'], enemyDeath:[90,.22,'sawtooth'],
        bossTransition:[75,.45,'sawtooth'], bossWarning:[290,.24,'square'], bossImpact:[65,.2,'triangle']
      }[kind] || [440, .08, 'sine'];
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = settings[2];
      oscillator.frequency.setValueAtTime(settings[0], now);
      if (kind === 'correct' || kind === 'repair' || kind === 'level' || kind === 'victory') {
        oscillator.frequency.exponentialRampToValueAtTime(settings[0] * (kind==='victory'?2:1.35), now + settings[1]);
      }
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001,.07*experience.settings.volume*experience.settings.sfx), now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + settings[1]);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(now); oscillator.stop(now + settings[1] + .02);
      activeSounds++;
      oscillator.onended=()=>{activeSounds=Math.max(0,activeSounds-1);oscillator.disconnect?.();gain.disconnect?.();};
    } catch {
      // Audio is optional; blocked audio contexts must not interrupt gameplay.
    }
  }

  function getSavedCampaign() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (saved?.phaseId) saved.phaseIndex = PHASES.findIndex(phase => phase.id === saved.phaseId);
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
      version: 1, phaseIndex, phaseId:phaseData.id, mapRevision:phaseData.revision || 1, highestUnlockedPhase, level, xp, xpRequired,
      levelState:levelRuntime?.save(), checkpointIndex,
      unlockedSkills: unlockedSkills.map(skill => ({ id: skill.id, level: skill.level })),
      player: { x: player.x, y: player.y, health: player.health, facing: player.facing, grounded: player.grounded, shieldTime: player.shieldTime, shieldCooldown: player.shieldCooldown },
      viruses: viruses.map(virus => ({ alive: virus.alive, hp: virus.hp, x: virus.x, y: virus.y, baseY:virus.baseY, direction: virus.direction, state:virus.state,
        enemyMemory:{forked:Boolean(virus.forked),totalSummons:virus.totalSummons||0,minionSerial:virus.minionSerial||0,altitudeIndex:virus.altitudeIndex||0} })),
      repaired: components.map(component => component.repaired),
      componentIntegrity: components.map(component => ({ integrity: component.integrity, corruption: component.corruption })),
      collected: collectibles.map(item => item.collected),
      phaseExitUnlocked, phaseObjectiveAwarded, phaseTransition, campaignComplete, gameOver, checkpointX, checkpointY, questionRetryRequired,
      pendingAbility: levelChoiceOpen,
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
    const mapChanged=(saved.mapRevision || 1)!==(PHASES[phaseIndex].revision || 1);
    const isNextPhase = saved.phaseTransition || mapChanged;
    const retryAfterDefeat = Boolean(saved.gameOver || saved.questionRetryRequired);
    loadPhase(phaseIndex, true);
    checkpointX = isNextPhase ? mapStart().x
      : Math.max(0, Math.min(worldWidth() - player.width, Number.isFinite(saved.checkpointX) ? saved.checkpointX : mapStart().x));
    checkpointY = isNextPhase || saved.checkpointY == null || !Number.isFinite(Number(saved.checkpointY))
      ? (phaseData.map.layout === 'vertical' || phaseData.map.ground?.mode === 'explicit' ? mapStart().y+player.height : null) : Number(saved.checkpointY);
    checkpointIndex = isNextPhase ? -1 : Number.isInteger(saved.checkpointIndex) ? saved.checkpointIndex
      : phaseData.map.checkpoints.findIndex(point => (typeof point === 'number' ? point : point.x) === checkpointX);
    if (isNextPhase || retryAfterDefeat) player.health = Math.min(player.maxHealth, retryAfterDefeat ? player.maxHealth : (Number(saved.player?.health) || 100) + 25);
    if (retryAfterDefeat) {
      player.x = Math.max(0, Math.min(worldWidth() - player.width, checkpointX + 38));
      player.y = (checkpointY ?? floorY()) - player.height;
    }
    else if (!isNextPhase) {
      const source = saved.player || {};
      player.health = Math.max(1, Math.min(player.maxHealth, Number(source.health) || player.maxHealth));
      player.x = retryAfterDefeat ? Math.min(worldWidth() - player.width, checkpointX + 38)
        : Math.max(0, Math.min(worldWidth() - player.width, Number.isFinite(source.x) ? source.x : mapStart().x));
      const savedY = Number.isFinite(Number(source.y)) ? Number(source.y) : mapStart().y;
      const mapBottom = phaseData.map.bounds.floor && phaseData.map.ground?.mode !== 'explicit' ? floorY() - player.height : worldHeight() - player.height;
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
        return progress ? { ...virus, state:progress.state || {}, alive: Boolean(progress.alive), hp: Math.max(0, Math.min(virus.maxHp, Number(progress.hp) || 0)), x: Number.isFinite(progress.x) ? progress.x : virus.x, y: Number.isFinite(progress.y) ? progress.y : virus.y,
          baseY:Number.isFinite(progress.baseY)?Math.max(0,Math.min(worldHeight(),progress.baseY)):virus.baseY,
          forked:Boolean(progress.enemyMemory?.forked),totalSummons:Math.max(0,Math.min(4,Number(progress.enemyMemory?.totalSummons)||0)),
          minionSerial:Math.max(0,Number(progress.enemyMemory?.minionSerial)||0),altitudeIndex:Math.max(0,Math.floor(Number(progress.enemyMemory?.altitudeIndex)||0)),
          direction: progress.direction < 0 ? -1 : 1 } : virus;
      });
      components.forEach((component, index) => {
        component.repaired = Boolean(saved.repaired?.[index]);
        const integrity = saved.componentIntegrity?.[index];
        if (integrity) { component.integrity = Math.max(0, Math.min(100, Number(integrity.integrity) || 0)); component.corruption = Math.max(0, Math.min(100, Number(integrity.corruption) || 0)); }
      });
      collectibles.forEach((item, index) => { item.collected = Boolean(saved.collected?.[index]); });
      levelRuntime.restore(saved.levelState);
      defeated = viruses.filter(virus => !virus.alive).length;
      objectives.allRepairs = phaseData.objectives.repairAllComponents === false || components.filter(component => component.repaired).length >= phaseData.objectives.componentsToRepair;
      objectives.allViruses = phaseData.objectives.defeatAllViruses === false || viruses.filter(virus => !virus.alive).length >= phaseData.objectives.enemiesToDefeat;
      phaseExitUnlocked = Boolean(saved.phaseExitUnlocked && objectives.allRepairs && objectives.allViruses && levelRuntime.goalsComplete());
      phaseObjectiveAwarded = Boolean(saved.phaseObjectiveAwarded && phaseExitUnlocked);
      cameraX = phaseData.map.camera.axes.includes('x')
        ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
      cameraY = phaseData.map.camera.axes.includes('y')
        ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    }
    renderSkills(); updateHud(); draw();
    launchLoadedPhase(Boolean(saved.phaseTransition));
    if(mapChanged){addLog('Mapa reconstruído: fase reiniciada, XP e habilidades mantidos.');interactionMessage='NOVO MAPA // XP E HABILIDADES PRESERVADOS';interactionMessageTimer=4;}
    if (saved.pendingAbility && !saved.phaseTransition) openLevelChoice(true);
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
        if (key === 'e' && !repairSession?.blocksWorld) cancelRepair();
      };
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (!running || repairSession?.blocksWorld || phaseIntroTime>0 || document.getElementById('settingsDialog').open) return;
        try { if (event.pointerId !== undefined) button.setPointerCapture?.(event.pointerId); } catch {}
        if (key === 'w' && !keys.has(key)) jumpQueued = true;
        if (key === 'e' && !findNearbyComponent()) {
          interactionMessage = 'NENHUM COMPONENTE AO ALCANCE';
          interactionMessageTimer = 1.2;
        }
        keys.add(key);
        if(key==='e' && findNearbyComponent())updateRepair(0);
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    });
    touchControls.querySelector('[data-action="pause"]').addEventListener('click', pause);
  }

  function emitParticles(x, y, color, count = 9) {
    const budget = Math.min(experience.settings.reducedEffects?Math.ceil(count*.25):count, Math.max(0, (experience.settings.reducedEffects?48:160) - effects.length));
    for (let index = 0; index < budget; index++) {
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
      const screenY = particle.y - cameraY;
      if (screenX < -8 || screenX > width + 8 || screenY < -8 || screenY > height + 8) continue;
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 0;
      const size=Math.max(1,Math.round(particle.radius));ctx.fillRect(Math.round(particle.x),Math.round(particle.y),size,size);
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
    if (levelRuntime && !levelRuntime.matches(spec.requires)) return null;
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
    if (spec.type === 'falling') {if (!state.active) return null;y += state.drop || 0;}
    return { id: spec.id, x, y, w: spec.width, h: spec.height || 18, kind: 'platform', type: spec.type || 'fixed', style: spec.style, collision: spec.collision || 'one-way', hazardDamage: spec.damage || 8 };
  }
  function solids() {
    const map = phaseData.map;
    const geometry = [];
    if (map.ground?.mode === 'explicit') {
      for (const spec of map.ground.segments) {
        if (levelRuntime && !levelRuntime.matches(spec.requires)) continue;
        geometry.push({id:spec.id,x:spec.x,y:spec.y,w:spec.width,h:spec.height,kind:'floor',type:'fixed',collision:spec.collision || 'solid'});
      }
    } else if (map.bounds.floor) {
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
      if (levelRuntime && (!levelRuntime.matches(spec.requires) || (spec.disabledWhen && levelRuntime.matches(spec.disabledWhen)))) continue;
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
      if (levelRuntime && (!levelRuntime.matches(gate.requires) || (gate.opensWhen && levelRuntime.matches(gate.opensWhen)))) continue;
      if (components.some(component => component.id === gate.requiresComponentId && component.repaired)) continue;
      geometry.push({ id:gate.id, x:gate.x, y:Number.isFinite(gate.y) ? gate.y : floorY() - gate.height, w:gate.width, h:gate.height, kind:'gate', type:'route-gate', collision:'solid' });
    }
    for (const obstacle of enemyObstacles) {
      if (obstacle.life > 0) geometry.push({ id: obstacle.id, x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h, kind: 'block', type: obstacle.bossOwned ? 'boss-obstacle' : 'enemy-temporary', collision: 'solid' });
    }
    if (!phaseExitUnlocked && map.bounds.right) {
      const exitX = map.exit.x;
      if (map.exit.mode === 'region') {
        // A room/arena exit is an objective region, not an invisible map-wide wall.
        // Authors may place an explicit gate with opensWhen if a physical lock is needed.
      } else if (map.layout !== 'vertical') {
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
      if (spec.type !== 'moving' && spec.type !== 'falling') continue;
      if (spec.type === 'falling') ByteRunner.fallingPlatforms.update(spec,getPlatformState(spec),dt,box=>overlaps(player,{x:box.x,y:entityY(box),w:box.width,h:box.height || 18}));
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
    player.interferenceTime=0;
    phaseIndex = Math.max(0, Math.min(PHASES.length - 1, index));
    loadMap(PHASES[phaseIndex], retry);
  }

  function loadMap(definition, retry = false) {
    endPhaseIntro();experience.reset();pacing=null;previousRenderPlayer=null;landingSpring=0;shotPose=0;abilityPose=0;actorAnimationTime=0;frameAccumulator=0;
    document.getElementById('experienceNotice').classList.remove('visible');noticeTime=0;
    levelRuntime?.dispose();
    levelVisuals?.dispose();
    cancelRepair();
    phaseData = definition;
    visualGeometry = new Map([...phaseData.entities.platforms,...phaseData.entities.obstacles,...phaseData.entities.gates].filter(spec=>spec.visual).map(spec=>[spec.id,spec]));
    if (retry) player.health = player.maxHealth;
    else if (phaseIndex > 0) player.health = Math.min(player.maxHealth, player.health + 25);
    const start = mapStart();
    player.x = start.x; player.y = start.y;
    player.vx = 0; player.vy = 0; player.grounded = true; player.facing = 1;
    cameraX = phaseData.map.camera.axes.includes('x') ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
    cameraY = phaseData.map.camera.axes.includes('y') ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    platformRuntime = new Map(); animationTime = 0; deathEcho = null; jumpQueued = false;
    checkpointX = start.x;
    checkpointIndex = -1;
    checkpointY = phaseData.map.layout === 'vertical' || phaseData.map.ground?.mode === 'explicit' ? start.y+player.height : null;
    effects = []; saveTimer = 0;
    viruses = createViruses(); projectiles = []; enemyProjectiles = []; enemyObstacles = []; components = createComponents(); collectibles = createCollectibles();
    levelRuntime = ByteRunner.levels.create(phaseData, {
      player:() => player, components:() => components, enemies:() => viruses, collectibles:() => collectibles,
      entityY, emitParticles, damagePlayer, damageVirus, fireEnemyProjectile, spawnEnemyMinion, solids, worldWidth, worldHeight, floorY,
      teleportPlayer(x,y) {
        player.x=Math.max(0,Math.min(worldWidth()-player.width,x));player.y=Math.max(0,Math.min(worldHeight()-player.height,y));
        player.vx=0;player.vy=0;player.grounded=true;jumpQueued=false;damageCooldown=Math.max(damageCooldown,.5);
        cameraX=Math.max(0,Math.min(worldWidth()-width,player.x-width*phaseData.map.camera.followOffsetX));
        cameraY=Math.max(0,Math.min(worldHeight()-height,player.y-height*phaseData.map.camera.followOffsetY));
        saveCampaign();
      },
      feedback(message, box) { interactionMessage=message; interactionMessageTimer=1.5; emitParticles(box.x,box.y,'#74e8ff',12); }
    });
    levelVisuals = ByteRunner.visuals.create(phaseData);
    pacing=ByteRunner.pacing.create(phaseData,phaseIndex,levelRuntime,{
      solids,player:()=>player,enemies:()=>viruses,
      reward(amount,reason,cache){awardExperience(amount,reason);experience.impact(cache.x,cache.y);},
      hint:notifyExperience
    });
    const activeVisuals=levelVisuals;
    activeVisuals.ready.then(() => {if (levelVisuals===activeVisuals && canvas.isConnected) draw();});
    defeated = 0; levelChoiceOpen = false; repairTarget = null; repairProgress = 0;
    phaseExitUnlocked = false; phaseObjectiveAwarded = false; phaseTransition = false; campaignComplete = false;
    objectives = { allRepairs: false, allViruses: false };
    attackCooldown = 0; damageCooldown = 0; interactionMessage = ''; interactionMessageTimer = 0; gameOver = false;
    ui.levelOverlay.classList.remove('active');
    ui.questionOverlay.classList.remove('active');
    phaseQuestionOpen = false; currentQuestion = null; questionAnswered = false;
    questionRetryRequired = false;
    updatePhaseUI(); updateHud();
  }

  function createViruses() {
    return phaseData.entities.enemies.map((spec, index) => {
      const type = spec.type === 'common' ? 'basic' : spec.type;
      const profile = ENEMY_PROFILES[type] || ENEMY_PROFILES.basic;
      const enemy = { ...profile, ...spec, type, variant:spec.variant || ByteRunner.enemies.variantFor(phaseIndex+1,type) };
      const hp = Number(enemy.hp) || profile.hp;
      const y = entityY(enemy, enemy.flying ? 92 : enemy.type === 'boss' ? 46 : 24);
      const spawnX=Math.max(enemy.navigationBounds?.left??0,Math.min(enemy.navigationBounds?.right??worldWidth(),spec.x));
      return { ...enemy, state:JSON.parse(JSON.stringify(enemy.state || {})), id: spec.id, x: spawnX, baseX: spawnX, y, baseY: y, hp, maxHp: hp,
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
    return phaseData.entities.components.map((spec, index) => ({ ...spec, repair:spec.repair && spec.repair.type!=='hold' ? spec.repair : ByteRunner.repairChallenges.forPhase(phaseIndex,index), id: spec.id, x: spec.x, y: entityY(spec, 44), width: spec.width || 34, height: spec.height || 44, repaired: false, integrity: 100, corruption: 0, phase: index * .9 }));
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
    const nextRatio=Math.min(window.devicePixelRatio || 1, experience.settings.reducedEffects?1.25:1.5);
    if(width===rect.width&&height===rect.height&&pixelRatio===nextRatio&&canvas.width===Math.round(rect.width*nextRatio)&&canvas.height===Math.round(rect.height*nextRatio)){draw();return;}
    const oldFloor = floorY();
    pixelRatio = nextRatio;
    width = rect.width;
    height = rect.height;
    const floorShift = phaseData.map.height === 'viewport' ? floorY() - oldFloor : 0;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (player) {
      player.y += floorShift;
      projectiles.forEach(projectile => { projectile.y += floorShift; });
      enemyProjectiles.forEach(projectile => { projectile.y += floorShift; });
      enemyObstacles.forEach(obstacle => { obstacle.y += floorShift; });
      if (phaseData.map.bounds.floor && phaseData.map.ground?.mode !== 'explicit' && player.y + player.height >= floorY()) {
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

  // Canvas buffer writes inside a ResizeObserver delivery can trigger another
  // delivery in the same layout pass. Defer them and coalesce repeated changes.
  const requestCanvasResize=window.requestAnimationFrame.bind(window);
  let canvasResizeRequest=0;
  new ResizeObserver(()=>{
    if(canvasResizeRequest)return;
    canvasResizeRequest=requestCanvasResize(()=>{
      canvasResizeRequest=0;
      const rect=canvas.getBoundingClientRect();
      const ratio=Math.min(window.devicePixelRatio || 1,experience.settings.reducedEffects?1.25:1.5);
      if(rect.width!==width||rect.height!==height||ratio!==pixelRatio)resize();
    });
  }).observe(canvas.parentElement);

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.width > b.x &&
      a.y < b.y + b.h && a.y + a.height > b.y;
  }

  function movePlayer(dt) {
    const wasGrounded = player.grounded;
    const fallingSpeed = player.vy;
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const direction = Number(right) - Number(left);
    const environment=levelRuntime.modifiers();
    player.interferenceTime=Math.max(0,(player.interferenceTime||0)-dt);
    player.vx = direction * RUN_SPEED * environment.speedMultiplier * (player.interferenceTime>0?.82:1) + environment.forceX;
    if (direction) player.facing = direction;

    if (jumpQueued && player.grounded) {
      playSound('jump');
      emitParticles(player.x + player.width / 2, player.y + player.height, phaseData.palette[2], 5);
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
    const previousVelocityY = player.vy;
    player.vy = Math.min(player.vy + GRAVITY * dt, 1050);
    player.y += (previousVelocityY + player.vy) * .5 * dt;
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
        if (object.type === 'temporary' || object.type === 'falling') {
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
    if (phaseData.map.bounds.floor && phaseData.map.ground?.mode !== 'explicit' && !overPit && player.y + player.height >= floorY()) {
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
    if ((!phaseData.map.bounds.floor || phaseData.map.ground?.mode === 'explicit') && player.y > worldHeight() + 180) {
      respawnAtCheckpoint();
      return;
    }
    // Side resolution can move the robot after the initial bounds clamp.
    if (phaseData.map.bounds.left) player.x = Math.max(0, player.x);
    if (phaseData.map.bounds.right) player.x = Math.min(worldWidth() - player.width, player.x);
    if (!wasGrounded && player.grounded && fallingSpeed > 180) {
      landingSpring=.14;playSound('land');
      emitParticles(player.x + player.width / 2, player.y + player.height, phaseData.palette[2], 6);
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

  function cancelRepair() {
    if (repairSession?.blocksWorld) jumpQueued=false;
    if (repairSession?.status === 'running') repairSession.cancel();
    repairSession?.dispose?.();
    document.getElementById('repairContent').replaceChildren();
    repairSession = null;
    repairTarget = null;
    repairProgress = 0;
    document.getElementById('repairPanel').hidden = true;
  }

  function updateRepair(dt) {
    if (!running) return;
    const component = repairSession?.blocksWorld ? repairTarget : findNearbyComponent();
    if (!component || (repairTarget && repairTarget !== component)) cancelRepair();
    if (!component) return;
    if (!repairSession) {
      if (!keys.has('e')) return;
      repairTarget = component;
      repairSession = ByteRunner.repairs.create(component.repair || ByteRunner.repairChallenges.forPhase(phaseIndex), {
        duration:repairDuration, component, player,
        repairRank:unlockedSkills.find(skill=>skill.id==='repair')?.level || 0,
        isActive:()=>running && !paused,
        onFailure:()=>{
          player.health=Math.max(1,player.health-5);
          addLog('Diagnóstico falhou: até 5 de integridade. Nova tentativa disponível.');
          updateHud();saveCampaign();
        }
      });
      if(repairSession.blocksWorld) {
        keys.clear();jumpQueued=false;
        document.getElementById('repairPanel').hidden=false;
        document.getElementById('repairPrompt').textContent=repairSession.label?.() || 'DIAGNÓSTICO DO COMPONENTE';
      }
      repairSession.mount?.(document.getElementById('repairContent'));
    }
    repairSession.update(dt * (component.infected?.65:1), {keys});
    repairProgress = repairSession.progress * repairDuration;
    if (['failed','cancelled'].includes(repairSession.status)) {
      const failed=repairSession.status === 'failed';
      cancelRepair();
      if (failed) { keys.clear(); interactionMessage='REPARO NÃO CONCLUÍDO // TENTE NOVAMENTE'; interactionMessageTimer=1.5; }
      return;
    }
    if (repairSession.status === 'success') {
      const wasModal = repairSession.blocksWorld;
      component.repaired = true;
      component.integrity = 100;
      component.corruption = 0;
      cancelRepair();
      if (wasModal) keys.clear();
      interactionMessage = 'COMPONENTE REPARADO';
      interactionMessageTimer = 1.5;
      addLog('Componente do setor reparado.');
      emitParticles(component.x + component.width / 2, component.y + 16, '#65f3bc', 16);
      playSound('repair');
      levelRuntime.emit('repair',component);
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
    experience.pop('+'+amount+' XP',player.x+player.width/2,player.y-8,'#ffe097');
    ui.xpBar.parentElement.classList.remove('xp-gain');void ui.xpBar.parentElement.offsetWidth;ui.xpBar.parentElement.classList.add('xp-gain');
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
    const requireRepairs=phaseData.objectives.repairAllComponents !== false;
    const requireEnemies=phaseData.objectives.defeatAllViruses !== false;
    if (!objectives.allRepairs && (!requireRepairs || repairedCount >= phaseData.objectives.componentsToRepair)) {
      objectives.allRepairs = true;
      if (requireRepairs) awardExperience(100, 'objetivo concluído: setor reparado');
    }
    if (!objectives.allViruses && (!requireEnemies || defeatedCount >= phaseData.objectives.enemiesToDefeat)) {
      objectives.allViruses = true;
      if (requireEnemies) awardExperience(100, 'objetivo concluído: setor limpo');
    }
    if (!phaseObjectiveAwarded && objectives.allRepairs && objectives.allViruses && levelRuntime.goalsComplete()) {
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

  function openLevelChoice(restorePending = false) {
    if (levelChoiceOpen || !running) return;
    if (!restorePending) {
      xp -= xpRequired;
      level++;
      xpRequired = experienceForLevel(level);
    }
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
    saveCampaign();
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
    abilityPose=.65;
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
    notifyExperience('HABILIDADE ATIVA · '+ability.name+' · NÍVEL '+targetLevel);
    experience.impact(player.x+17,player.y+24,true,'#c3a1ff');
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
    shotPose=.18;
    projectiles.push({
      x: player.facing > 0 ? player.x + player.width + 5 : player.x - 5,
      y: player.y + 22,
      vx: player.facing * 570 * levelRuntime.modifiers().projectileSpeedMultiplier,
      life: 1.35,
      radius: 5,
      damage: player.damage
    });
    attackCooldown = player.fireRate * levelRuntime.modifiers().fireIntervalMultiplier;
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
    experience.impact(player.x+17,player.y+22,appliedDamage>=16,'#ff9a9a');
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
    deathEcho = {x:player.x,y:player.y,start:animationTime};
    player.interferenceTime=0;
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
    cancelRepair(); jumpQueued = false;
    platformRuntime = new Map();
    enemyProjectiles = []; enemyObstacles = [];
    cameraX = phaseData.map.camera.axes.includes('x') ? Math.max(0, Math.min(worldWidth() - width, player.x - width * phaseData.map.camera.followOffsetX)) : 0;
    cameraY = phaseData.map.camera.axes.includes('y') ? Math.max(0, Math.min(worldHeight() - height, player.y - height * phaseData.map.camera.followOffsetY)) : 0;
    addLog('Reinicialização no checkpoint. Objetivos mantidos.');
    updateHud(); saveCampaign();
  }

  function updateCheckpoints() {
    for (const [index,point] of (phaseData.map.checkpoints || []).entries()) {
      if (phaseData.map.checkpointMode === 'ordered' && index !== checkpointIndex+1) continue;
      const pointX = typeof point === 'number' ? point : point.x;
      const pointY = typeof point === 'number' ? null : point.y;
      const reached = Number.isFinite(pointY)
        ? player.x + player.width >= pointX - 8 && player.x <= pointX + 54 && Math.abs(player.y + player.height - pointY) <= 24
        : phaseData.map.checkpointMode && phaseData.map.checkpointMode !== 'legacy'
          ? Math.abs(player.x+player.width/2-pointX) <= 54
          : player.x + player.width >= pointX && checkpointX < pointX;
      if (reached && (phaseData.map.checkpointMode==='free' ? index!==checkpointIndex : index>checkpointIndex)) {
        checkpointIndex = index;
        checkpointX = pointX;
        checkpointY = Number.isFinite(pointY) ? pointY : null;
        interactionMessage = 'CHECKPOINT ATIVADO';
        emitParticles(pointX + 12, (pointY ?? floorY()) - 22, '#74e8ff', 16);
        playSound('checkpoint');
        experience.pop('CHECKPOINT',pointX+12,(pointY ?? floorY())-40,'#a6ddff');
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
          questionRetryRequired = true;
          saveCampaign();
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
    if (!phaseQuestionOpen || !questionAnswered || questionRetryRequired) return;
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
      playSound('victory');
      emitParticles(player.x + player.width / 2, player.y, '#ffd36e', 35);
      emitParticles(player.x + player.width / 2, player.y, '#74e8ff', 35);
    } else {
      highestUnlockedPhase = Math.max(highestUnlockedPhase, phaseIndex + 1);
      ui.title.innerHTML = 'FASE <span>CONCLUÍDA</span>';
      ui.copy.textContent = phaseData.name + ' concluída. A próxima fase foi liberada.';
      startButton.innerHTML = 'ACESSAR FASE ' + String(phaseIndex + 2).padStart(2, '0') + ' <span>→</span>';
      ui.stage.textContent = 'PRÓXIMA FASE LIBERADA';
      addLog('Fase concluída. ' + PHASES[phaseIndex + 1].name + ' liberada.');
      playSound('victory');
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
      life: 2.8, radius: 6, damage: virus.damage, slowOnHit:virus.slowOnHit, ownerX: virus.x, color: virus.color || '#ffd166' });
    emitParticles(virus.x, virus.y, virus.color || '#ffd166', 3);
  }

  function spawnEnemyMinion(virus) {
    const aliveMinions = viruses.filter(enemy => enemy.alive && enemy.summonedBy === virus.id).length;
    if (aliveMinions >= (virus.summonLimit || 2) || (!virus.multiStage && (virus.totalSummons||0)>=4)) return false;
    const profile = ENEMY_PROFILES.fast;
    const side = Math.random() < .5 ? -1 : 1;
    const spawnY=virus.baseY ?? virus.y;
    const geometry=solids();
    const spot=[virus.x+side*28,virus.x-side*28].map(x=>({x,lane:ByteRunner.enemies.lane({...virus,x},geometry)})).find(({x,lane})=>
      lane&&x>=lane.left&&x<=lane.right&&!geometry.some(s=>s.collision==='solid'&&x+9>s.x&&x-9<s.x+s.w&&spawnY+9>s.y&&spawnY-9<s.y+s.h));
    if(!spot)return false;
    const {x:spawnX,lane}=spot;
    virus.minionSerial = (virus.minionSerial || 0) + 1;
    virus.totalSummons=(virus.totalSummons||0)+1;
    viruses.push({ ...profile, id: virus.id + '-m' + String(virus.minionSerial).padStart(2, '0'),
      type: 'fast', x: spawnX, baseX: spawnX,
      y: lane.y-24, baseY: lane.y-24, groundY:lane.y, navigationBounds:virus.navigationBounds, activationRegion:virus.activationRegion, hp: 1, maxHp: 1, radius: 9, speed: 126,
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
      y: (virus.groundY ?? floorY()) - 72, w: 24, h: 72, life: 3.6 });
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

  function bossGroundY(virus) { return Number.isFinite(virus.groundY) ? virus.groundY : floorY(); }

  function triggerVirusZeroAttack(virus, playerCenterX, playerCenterY) {
    playSound('bossImpact');virus.attackFlash=.25;
    experience.impact(virus.x,bossGroundY(virus)-8,true,'#ff759b');
    const stage = virus.bossStage || 1;
    const kind = virus.bossAttackKind;
    const horizontalDistance = Math.abs(playerCenterX - virus.x);
    const ground=bossGroundY(virus);
    if ((kind === 'slam' || kind === 'combo') && horizontalDistance <= (stage === 3 ? 188 : 148) && player.y + player.height > ground - 28) {
      damagePlayer(stage === 3 ? 22 : 16, virus);
    }
    if (kind === 'charge') {
      virus.chargeTime = .48;
    }
    if (kind === 'volley' || kind === 'combo') {
      fireVirusZeroVolley(virus, virus.bossAimX ?? playerCenterX, virus.bossAimY ?? playerCenterY, stage === 3 ? 5 : 3,
        stage === 3 ? 310 : 245, stage === 3 ? 12 : 10, stage === 3 ? .38 : .24);
    }
    if (kind === 'surge' || kind === 'combo') {
      const arena = virus.bossBounds || {left:3420,right:4450};
      const positions = stage === 3 ? [arena.left + 150, arena.right - 160] :
        [virus.x < (arena.left + arena.right) / 2 ? arena.right - 190 : arena.left + 190];
      for (const x of positions) {
        if (enemyObstacles.filter(obstacle => obstacle.bossOwned && obstacle.life > 0).length >= 2) break;
        if (enemyObstacles.some(obstacle => obstacle.life > 0 && Math.abs(obstacle.x - x) < 65)) continue;
        const pillar = { x:x-15,y:ground-68,w:30,h:68 };
        if (overlaps(player, pillar)) continue;
        if (viruses.some(enemy=>enemy.alive&&enemy.x+enemy.radius>pillar.x&&enemy.x-enemy.radius<pillar.x+pillar.w&&enemy.y+enemy.radius>pillar.y&&enemy.y-enemy.radius<pillar.y+pillar.h)) continue;
        enemyObstacles.push({id:'virus-zero-pillar-'+Math.floor(animationTime*1000)+'-'+x,
          x:x-15,y:ground-68,w:30,h:68,life:2.5,bossOwned:true});
      }
    }
    virus.vulnerableTime = kind === 'charge' ? 0 : [0,1.25,1.1,1.65][stage];
    virus.bossCycleCooldown = [0,1.9,1.6,1.9][stage];
    virus.attackWindup = 0;
  }

  function updateVirusZero(virus, dt, playerCenterX, playerCenterY) {
    if (playerCenterX < virus.bossBounds.left - 120) return;
    const region=virus.activationRegion;
    if(region&&(playerCenterX<region.x||playerCenterX>region.x+region.width||playerCenterY<region.y||playerCenterY>region.y+region.height))return;
    const stage = virus.hp <= virus.maxHp*.34+1e-6 ? 3 : virus.hp <= virus.maxHp*.67+1e-6 ? 2 : 1;
    if (stage !== virus.bossStage) {
      experience.impact(virus.x,virus.y,true,stage===3?'#ffd36e':'#c79aff');
      experience.pop('NÚCLEO · ETAPA '+stage,virus.x,virus.y-virus.radius-30,'#ffd6a0');
      virus.bossStage = stage;
      playSound('bossTransition');
      virus.attackWindup=0;virus.chargeTime=0;virus.vulnerableTime=0;virus.bossPatternIndex=0;virus.bossCycleCooldown=0;virus.bossPhaseTransitionTime=.6;virus.summonWindup=0;
      addLog('VIRUS ZERO // ETAPA ' + stage + ' // PADRÃO DE ATAQUE ALTERADO.');
      emitParticles(virus.x, virus.y, stage === 3 ? '#ffd36e' : '#ff5479', 18);
    }
    virus.coreShielded = Boolean(virus.coreShieldRequiresRepairs && components.some(component => !component.repaired));
    virus.bossBlockedMessageTimer = Math.max(0, virus.bossBlockedMessageTimer - dt);
    virus.bossCycleCooldown = Math.max(0, virus.bossCycleCooldown - dt);
    virus.bossPhaseTransitionTime=Math.max(0,(virus.bossPhaseTransitionTime || 0)-dt);
    if(virus.bossPhaseTransitionTime>0)return;
    if(virus.summonWindup>0) {
      virus.summonWindup=Math.max(0,virus.summonWindup-dt);
      if(!virus.summonWindup){spawnEnemyMinion(virus);playSound('enemySummon');}
    }
    if (virus.chargeTime > 0) {
      const step = Math.min(dt, virus.chargeTime);
      const oldX = virus.x;
      virus.x = Math.max(virus.bossBounds.left, Math.min(virus.bossBounds.right, virus.x + virus.bossAttackDirection * 460 * step));
      const blocked = solids().find(s => s.collision === 'solid' && s.kind !== 'floor' && s.kind !== 'gate' &&
        virus.x + virus.radius > s.x && virus.x - virus.radius < s.x + s.w && virus.y + virus.radius > s.y && virus.y - virus.radius < s.y + s.h);
      if (blocked) {
        virus.x = oldX; virus.chargeTime = 0;
        interactionMessage='INVESTIDA BLOQUEADA // NÚCLEO EXPOSTO';interactionMessageTimer=1.5;emitParticles(virus.x,virus.y,'#ffe27a',14);
      }
      if (!blocked && playerCenterX >= Math.min(oldX,virus.x)-55 && playerCenterX <= Math.max(oldX,virus.x)+55 && player.y+player.height > bossGroundY(virus)-76) damagePlayer(18,virus);
      virus.chargeTime = Math.max(0,virus.chargeTime-step);
      if (!virus.chargeTime) virus.vulnerableTime = blocked ? 1.8 : 1.25;
      return;
    }
    if (virus.attackWindup > 0) {
      virus.attackWindup = Math.max(0, virus.attackWindup - dt);
      if (virus.attackWindup === 0) triggerVirusZeroAttack(virus, playerCenterX, playerCenterY);
    } else if (virus.bossCycleCooldown <= 0) {
      const patterns = {1:['slam','charge'],2:['volley','surge'],3:['combo','charge','surge','volley']};
      const options = patterns[stage];
      virus.bossAttackKind = options[virus.bossPatternIndex % options.length];
      virus.bossPatternIndex++;
      virus.bossAttackDirection = Math.sign(playerCenterX - virus.x) || 1;
      virus.bossAimX = playerCenterX; virus.bossAimY = playerCenterY;
      virus.attackWindup = [0,1.05,.85,.8][stage];
      playSound('bossWarning');
    }
    if (stage >= 2 && virus.specialCooldownTimer <= 0) {
      virus.summonWindup=.9;playSound('infectWarning');
      virus.specialCooldownTimer = stage === 3 ? 6.5 : 9;
    }
  }

  function damageVirus(virus, damage, sourceX=player.x+player.width/2) {
    if(!virus.alive)return;
    if(virus.multiStage&&virus.bossPhaseTransitionTime>0)return;
    if (virus.type === 'boss' && virus.coreShieldRequiresRepairs && components.some(component => !component.repaired)) {
      virus.coreShielded = true;
      if (virus.bossBlockedMessageTimer <= 0) {
        interactionMessage = 'NÚCLEO PROTEGIDO // REPARE OS RELAYS';
        interactionMessageTimer = 1.6;
        virus.bossBlockedMessageTimer = 1.6;
      }
      return;
    }
    const bossWeakPoint = virus.multiStage && virus.vulnerableTime > 0;
    if (bossWeakPoint) damage *= 2;
    damage*=ByteRunner.enemies.damageMultiplier(virus,sourceX);
    const armor = virus.type==='armored' || virus.vulnerableTime > 0 ? 0 : (virus.armor || 0);
    let nextHp=Math.max(0, virus.hp - Math.max(1, Math.ceil(damage * (1 - armor))));
    if(virus.multiStage) {
      for(const threshold of [virus.maxHp*.67,virus.maxHp*.34])if(virus.hp>threshold+1e-6&&nextHp<threshold){nextHp=threshold;break;}
    }
    const applied=virus.hp-nextHp;
    virus.hp=nextHp;
    experience.impact(virus.x,virus.y,bossWeakPoint || applied>=4,virus.color || '#c078ff');
    experience.pop((bossWeakPoint?'CRÍTICO ':'')+'−'+Math.round(applied),virus.x,virus.y-virus.radius-10,bossWeakPoint?'#ffda81':'#e1fff3');
    virus.hitFlash = .12;
    emitParticles(virus.x, virus.y, virus.color || '#c078ff', virus.type === 'boss' ? 10 : 6);
    playSound('hit');
    if (virus.hp > 0) return;
    virus.alive = false;
    virus.deathAt=animationTime;playSound('enemyDeath');
    levelRuntime.emit('enemyDefeated',virus);
    if (virus.multiStage) {
      experience.impact(virus.x,virus.y,true,'#a9fff2');
      enemyProjectiles = enemyProjectiles.filter(shot => !shot.bossOwned);
      enemyObstacles = enemyObstacles.filter(obstacle => !obstacle.bossOwned);
      viruses.forEach(enemy => { if (enemy.summonedBy === virus.id) enemy.alive = false; });
      interactionMessage = 'VIRUS ZERO NEUTRALIZADO // VERIFICAÇÃO FINAL DISPONÍVEL';
      interactionMessageTimer = 4;
      emitParticles(virus.x,virus.y,'#74e8ff',40);
    }
    if (virus.countsForObjective !== false) defeated++;
    addLog(virus.type === 'boss' ? 'VIRUS ZERO recebeu dano critico.' : virus.type === 'fast' ? 'Virus rapido neutralizado.' : 'Virus neutralizado.');
    awardExperience(virus.countsForObjective === false ? 12 : virus.xp || 45, virus.type === 'boss' ? 'chefe derrotado' : 'vírus derrotado');
  }

  function updateEnemyBrain(virus, dt, playerCenterX, playerCenterY) {
    const region=virus.activationRegion;
    if (region && (playerCenterX<region.x || playerCenterX>region.x+region.width || playerCenterY<region.y || playerCenterY>region.y+region.height)) return;
    if (levelRuntime.updateEnemy(virus,dt,playerCenterX,playerCenterY)) return;
    if (virus.multiStage && playerCenterX < virus.bossBounds.left - 120) return;
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
    if(!virus.multiStage && ByteRunner.enemies.update(virus,{
      playerX:playerCenterX,playerY:playerCenterY,player,shapes:solids(),width:worldWidth(),height:worldHeight(),
      components,damage:damagePlayer,fire:fireEnemyProjectile,spawn:spawnEnemyMinion,sound:playSound
    },dt))return;
    const dx = playerCenterX - virus.x;
    const dy = playerCenterY - virus.y;
    const distance = Math.hypot(dx, dy);
    let moveDirection = 0;

    if (virus.type === 'parasite') {
      const target = components.filter(component => !component.repaired && Math.abs(component.y - virus.y) < 100)
        .sort((a, b) => Math.hypot(a.x - virus.x, a.y - virus.y) - Math.hypot(b.x - virus.x, b.y - virus.y))[0];
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
    if(virus.multiStage && virus.bossStage>=2 && Math.abs(dx)<220)moveDirection=-Math.sign(dx);
    if (virus.type === 'boss' && virus.multiStage && (virus.attackWindup > 0 || virus.chargeTime > 0 || virus.vulnerableTime > 0 || virus.bossPhaseTransitionTime>0)) moveDirection = 0;
    const minX = virus.bossBounds?.left ?? virus.navigationBounds?.left ?? virus.radius;
    const maxX = virus.bossBounds?.right ?? virus.navigationBounds?.right ?? worldWidth() - virus.radius;
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
        const health=player.health;
        damagePlayer(projectile.damage, { x: projectile.ownerX });
        if(player.health<health && projectile.slowOnHit)player.interferenceTime=Math.max(player.interferenceTime||0,projectile.slowOnHit);
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
        abilityPose=.65;
      }
    }
    if (keys.has('j') && attackCooldown <= 0) fireProjectile();

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    for(const component of components)component.infected=false;
    for (const virus of viruses) virus.buffed = false;
    for (const parasite of viruses) {
      if (!parasite.alive || parasite.type !== 'parasite') continue;
      for (const ally of viruses) {
        if (ally !== parasite && ally.alive && ally.type !== 'parasite' &&
          Math.hypot(ally.x - parasite.x, ally.y - parasite.y) <= (parasite.buffRange || 190) && ByteRunner.enemies.sight(parasite,ally.x,ally.y,solids())) ally.buffed = true;
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
        if(virus.variant==='packet' && virus.attackWindup>0 && !virus.intercepted && Math.hypot(projectile.x-virus.x,projectile.y-virus.y)<virus.radius+35) {
          virus.intercepted=true;virus.stolenShot=true;projectile.life=0;emitParticles(projectile.x,projectile.y,'#60ffd4',6);break;
        }
        if (Math.hypot(projectile.x - virus.x, projectile.y - virus.y) <= virus.radius + projectile.radius) {
          projectile.life = 0;
          damageVirus(virus, projectile.damage, projectile.x-Math.sign(projectile.vx)*12);
          break;
        }
      }
    }
    projectiles = projectiles.filter(projectile => projectile.life > 0 && projectile.x > 0 && projectile.x < worldWidth());
    viruses = viruses.filter(virus => virus.countsForObjective !== false || virus.alive);
    checkObjectives();
  }

  function updateHud() {
    const progressAxis=phaseData.map.progress?.axis || (phaseData.map.layout === 'vertical' ? 'y' : 'x');
    const progress = Math.max(0, Math.min(100, Math.round(player.x / (worldWidth() - player.width) * 100)));
    const authoredProgress=progressAxis === 'objectives' ? Math.round(levelRuntime.progress()*100) : progressAxis === 'y'
      ? Math.max(0,Math.min(100,Math.round((mapStart().y-player.y)/Math.max(1,mapStart().y-phaseData.map.exit.y)*100))) : progress;
    ui.progress.textContent = String(authoredProgress).padStart(2, '0') + '%';
    ui.progressBar.style.width = authoredProgress + '%';
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
    const mapCanvas=document.getElementById('mapGeometry');
    mapCanvas.hidden=!(phaseData.revision>=2);
    if(phaseData.revision>=2) {
      const s=Math.min(Math.max(1,miniRect.width-16)/worldWidth(),Math.max(1,miniRect.height-16)/worldHeight());
      const ox=(miniRect.width-worldWidth()*s)/2,oy=(miniRect.height-worldHeight()*s)/2;
      const key=phaseData.id+':'+miniRect.width+':'+Math.floor(animationTime*5)+':'+components.map(c=>Number(c.repaired)).join('')+phaseData.entities.interactives.map(i=>Number(Boolean(levelRuntime.getFlag(i.flag || i.id)))).join('');
      if(key!==minimapKey) {
        minimapKey=key;mapCanvas.width=Math.max(1,Math.round(miniRect.width));mapCanvas.height=Math.max(1,Math.round(miniRect.height));
        const mc=mapCanvas.getContext('2d');mc.clearRect(0,0,mapCanvas.width,mapCanvas.height);
        for(const shape of solids()){mc.fillStyle=shape.kind==='floor'?'#7397a4':shape.kind==='platform'?'#63e4d6':'#a46e86';mc.fillRect(ox+shape.x*s,oy+shape.y*s,Math.max(1,shape.w*s),Math.max(1,shape.h*s));}
        mc.fillStyle='#ffbd79';components.filter(c=>!c.repaired).forEach(c=>mc.fillRect(ox+c.x*s-1,oy+c.y*s-1,3,3));
        mc.fillStyle='#87baff';levelRuntime.connections().forEach(p=>mc.fillRect(ox+p.x*s-1,oy+p.y*s-1,3,3));
        mc.strokeStyle='#c7b7ff';mc.lineWidth=1;
        mc.strokeRect(ox+cameraX*s,oy+cameraY*s,Math.min(width,worldWidth())*s,Math.min(height,worldHeight())*s);
        mc.fillStyle=phaseExitUnlocked?'#8affce':'#ff7994';
        mc.fillRect(ox+phaseData.map.exit.x*s-2,oy+(phaseData.map.exit.y ?? floorY())*s-2,4,4);
      }
      ui.map.style.left=(ox+(player.x+17)*s-3)+'px';ui.map.style.top=(oy+(player.y+24)*s-3)+'px';
      return;
    }
    const miniRange = Math.max(0, miniRect.width - 16);
    ui.map.style.left = (8 + (player.x / (worldWidth() - player.width)) * miniRange) + 'px';
    if (phaseData.map.camera.axes.includes('y')) {
      const miniY = Math.max(0, Math.min(1, player.y / Math.max(1, worldHeight() - player.height)));
      ui.map.style.top = `calc(8px + ${miniY * Math.max(0, miniRect.height - 16)}px)`;
    } else ui.map.style.top = '50%';
  }

  function update(dt) {
    // Sprite-only clock keeps the repair tool alive while world physics is frozen.
    actorAnimationTime+=dt;
    if(phaseIntroTime>0) {
      phaseIntroTime=Math.max(0,phaseIntroTime-dt);if(phaseIntroTime===0)endPhaseIntro();return;
    }
    if(!repairSession && keys.has('e') && findNearbyComponent()) updateRepair(0);
    if (repairSession?.blocksWorld) {
      updateRepair(dt); return;
    }
    levelRuntime.update(dt,{keys,repairNearby:Boolean(findNearbyComponent())});
    advancePlatformMotion(dt);
    movePlayer(dt);
    updateCheckpoints();
    updateCombat(dt);
    if (!running) return;
    updateRepair(dt);
    updateCollectibles(dt);
    checkObjectives();
    const follow=experience.camera(player,{x:cameraX,y:cameraY,width,height},{width:worldWidth(),height:worldHeight(),axes:phaseData.map.camera.axes,offsetX:phaseData.map.camera.followOffsetX,offsetY:phaseData.map.camera.followOffsetY},dt);
    cameraX=follow.x;cameraY=follow.y;
    landingSpring=Math.max(0,landingSpring-dt);shotPose=Math.max(0,shotPose-dt);abilityPose=Math.max(0,abilityPose-dt);
    experience.update(dt);pacing?.update(dt);
    noticeTime=Math.max(0,noticeTime-dt);if(noticeTime===0)document.getElementById('experienceNotice').classList.remove('visible');
    hudTimer+=dt;if(hudTimer>=.05){hudTimer=0;updateHud();}
    updateComponents(dt);
    updateEffects(dt);
    saveTimer += dt;
    if (saveTimer >= 2.5) { saveTimer = 0; saveCampaign(); }
    if (xp >= xpRequired) openLevelChoice();
    const exitY = Number.isFinite(phaseData.map.exit.y) ? phaseData.map.exit.y : floorY() - 63;
    const exitReached = phaseData.map.exit.mode === 'region'
      ? overlaps(player,{x:phaseData.map.exit.x,y:phaseData.map.exit.y,w:phaseData.map.exit.width,h:phaseData.map.exit.height})
      : phaseData.map.layout === 'vertical'
      ? Math.hypot(player.x + player.width / 2 - phaseData.map.exit.x, player.y + player.height / 2 - exitY) <= (phaseData.map.exit.triggerRadius || phaseData.map.exit.triggerRadiusY || 74)
      : player.x + player.width >= phaseData.map.exit.x + 20 && Math.abs(player.y + player.height / 2 - exitY) <= (phaseData.map.exit.triggerRadiusY || 86);
    const finalCoreCleared = phaseData.completion?.type === 'boss-question' && viruses.some(virus => virus.id === phaseData.completion.enemyId && !virus.alive);
    if (running && phaseExitUnlocked && (exitReached || finalCoreCleared)) {
      if (phaseData.objectives.requireExitQuestion !== false) openPhaseQuestion();
      else completePhase();
    }
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
    ByteRunner.art.background(ctx,{x:cameraX,y:cameraY,width,height},animationTime,phaseIndex,phaseData.palette,levelVisuals);
    if (phaseData.presentation?.procedural === false) return;

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
    const terrainShapes=solids();
    levelVisuals.prepareTerrain(terrainShapes);
    for (const object of terrainShapes) {
      const x = object.x;
      if (x + object.w - cameraX < 0 || x - cameraX > width) continue;
      if (ByteRunner.art.platform(ctx,levelVisuals,object,animationTime,phaseIndex,{x:cameraX,y:cameraY,width,height})) continue;
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
        if ((object.type === 'temporary' || object.type === 'falling') && (platformRuntime.get(object.id)?.triggered)) ctx.globalAlpha = .55 + Math.sin(animationTime * 18) * .2;
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

    for (const [index,point] of (phaseData.map.checkpoints || []).entries()) {
      const pointX = typeof point === 'number' ? point : point.x;
      const pointY = typeof point === 'number' ? floorY() : point.y;
      if (pointX - cameraX < -24 || pointX - cameraX > width + 24 || pointY - cameraY < -58 || pointY - cameraY > height + 24) continue;
      const screenX = pointX;
      const active = phaseData.revision>=2 ? (phaseData.map.checkpointMode==='free'?index===checkpointIndex:index<=checkpointIndex) : Number.isFinite(pointY) && phaseData.map.layout === 'vertical'
        ? checkpointY != null && checkpointY <= pointY : checkpointX >= pointX;
      const beaconColor = active ? '#78ffd2' : '#6ea4ad';
      if(levelVisuals.sprite(ctx,{asset:'terminal'},{x:pointX-12,y:pointY-32,width:24,height:32},animationTime,active?'active':'idle'))continue;
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

    const regionExit=phaseData.map.exit.mode === 'region';
    const gateX = phaseData.map.exit.x + (regionExit ? phaseData.map.exit.width/2 : 0);
    if (gateX - cameraX > -70 && gateX - cameraX < width + 70 &&
      (!Number.isFinite(phaseData.map.exit.y) || phaseData.map.exit.y - cameraY > -100 && phaseData.map.exit.y - cameraY < height + 100)) {
      const gateColor = phaseExitUnlocked ? '#70ffce' : '#ff806b';
      const gateHeight = phaseData.map.layout === 'horizontal' ? 126 : (phaseData.map.exit.height || 126);
      const gateCenterY = Number.isFinite(phaseData.map.exit.y) ? phaseData.map.exit.y + (regionExit ? gateHeight/2 : 0) : floorY() - gateHeight / 2;
      const gateTop = gateCenterY - gateHeight / 2;
      levelVisuals.sprite(ctx,{asset:'portal'},{x:gateX-28,y:gateTop,width:56,height:gateHeight},animationTime,phaseExitUnlocked?'active':'idle');
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
      const spriteDrawn = levelVisuals.sprite(ctx,component.visual || {asset:"component"},component,animationTime,repaired?'repaired':'idle');
      if (!spriteDrawn) {
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
      }
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
        ctx.fillText('E // DIAGNÓSTICO', cx, component.y - 11);
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
      if(levelVisuals.sprite(ctx,{asset:'fx',animation:'pulse'},{x:x-14,y:collectible.y+bob-14,width:28,height:28},animationTime))continue;
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
      ByteRunner.enemies.draw(ctx,virus,animationTime,components);
      if (!virus.alive) {
        if(Number.isFinite(virus.deathAt) && animationTime-virus.deathAt<.75){
          const size=virus.type==='boss'?64:32,asset='virus-'+(virus.variant || virus.type);
          levelVisuals.sprite(ctx,{asset,animation:'death',instance:'death-'+virus.id},{x:Math.round(virus.x-size/2),y:Math.round(virus.y-size/2),width:size,height:size},animationTime);
        }
        continue;
      }
      const x = virus.x;
      if (x - cameraX + virus.radius < -10 || x - cameraX - virus.radius > width + 10) continue;
      const pulse = 1 + Math.sin(virus.phase) * (virus.animationState==='patrol'?.035:.08);
      const fast = virus.type === 'fast';
      const boss = virus.type === 'boss';
      const palette = { basic: '#bb7bff', fast: '#ff9263', armored: '#76b9ff', flyer: '#73e4ff', shooter: '#ffd166', parasite: '#7dff9b' };
      const color = boss ? '#ff476f' : palette[virus.type] || '#bb7bff';
      const armored = virus.type === 'armored';
      const flyer = virus.type === 'flyer';
      const shooter = virus.type === 'shooter';
      const parasite = virus.type === 'parasite';
      const spriteSize=boss?64:32;
      const spriteDrawn = levelVisuals.sprite(ctx,virus.visual || {asset:'virus-'+(virus.variant || virus.type),flipX:virus.direction<0},{id:virus.id,x:Math.round(x-spriteSize/2),y:Math.round(virus.y-spriteSize/2),width:spriteSize,height:spriteSize},animationTime,virus.hitFlash>0?'hit':virus.vulnerableTime>0?'vulnerable':virus.attackWindup>0?'prepare':virus.attackFlash>0?'attack':virus.type==='boss'?'stage'+(virus.bossStage || 1):virus.animationState||'idle');
      if (!spriteDrawn) {
      ctx.save();
      ctx.translate(x, virus.y);
      ctx.rotate(virus.hitFlash>0?Math.sin(virus.hitFlash*90)*.2:virus.dashTime>0?virus.attackDirection*.16:0);
      if(virus.attackWindup>0)ctx.scale(1.1,.9);
      else if(virus.attackFlash>0)ctx.scale(.9,1.12);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = color;
      ctx.shadowBlur = boss ? 26 : fast ? 16 : 13;
      ctx.fillStyle = virus.hitFlash > 0 ? '#ffffff' : boss ? '#45142d' : fast ? '#4c2528' : armored ? '#183353' : flyer ? '#143d4a' : shooter ? '#4a3b1c' : parasite ? '#17442b' : '#302044';
      ctx.strokeStyle = color;
      ctx.lineWidth = boss ? 3 : fast ? 2 : 1.8;
      if (armored && virus.vulnerableTime <= 0) {
        ctx.strokeStyle = '#c2e8ff'; ctx.lineWidth = 3;
        const shieldAngle=virus.direction>0?0:Math.PI;
        ctx.beginPath(); ctx.arc(0, 0, virus.radius + 8, shieldAngle-1.3, shieldAngle+1.3); ctx.stroke();
        ctx.fillStyle='#ffe27a';ctx.fillRect(-virus.direction*(virus.radius+3)-3,-3,6,6);
        ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      }
      if (flyer) {
        const wing = 8 + Math.sin(virus.phase * 2) * 4;
        ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-virus.radius - wing, -wing); ctx.lineTo(-virus.radius - 2, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(virus.radius + wing, -wing); ctx.lineTo(virus.radius + 2, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (boss) {
        ctx.save();ctx.rotate(virus.phase*(virus.bossStage||1)*.22);
        ctx.strokeStyle=virus.bossPhaseTransitionTime>0?'#7cdcff':'#ffafc4';ctx.lineWidth=2;
        for(let ring=0;ring<(virus.bossStage||1);ring++) {
          ctx.beginPath();ctx.arc(0,0,virus.radius+18+ring*6,ring*2,ring*2+1.2);ctx.stroke();
        }
        ctx.restore();
        if(virus.summonWindup>0){ctx.strokeStyle='#7dff9b';ctx.setLineDash([3,4]);ctx.strokeRect(-virus.radius-12,-virus.radius-12,virus.radius*2+24,virus.radius*2+24);ctx.setLineDash([]);}
        if (virus.coreShielded || virus.bossPhaseTransitionTime>0) {
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
      }
      if(spriteDrawn && ((armored && virus.vulnerableTime<=0) || (boss && virus.coreShielded))) {
        ctx.save();ctx.strokeStyle=armored?'#c4e4ff':'#ffadc7';ctx.lineWidth=2;
        ctx.beginPath();
        const angle=virus.direction>0?0:Math.PI;
        ctx.arc(x,virus.y,virus.radius+5,boss?0:angle-1.3,boss?Math.PI*2:angle+1.3);ctx.stroke();ctx.restore();
      }
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
          const ground=bossGroundY(virus);
          const stageNames = {1:'PADRÕES', 2:'DISPAROS', 3:'COMBO CRÍTICO'};
          const stageName = stageNames[virus.bossStage || 1] || 'BATALHA';
          ctx.fillStyle = '#ffd9e4'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
          ctx.fillText('VIRUS ZERO [ETAPA ' + (virus.bossStage || 1) + ' - ' + stageName + ']', x, virus.y - virus.radius - 15);
          if (virus.vulnerableTime > 0) {
            ctx.fillStyle = '#ffe27a';
            ctx.fillRect(x - barWidth / 2, virus.y - virus.radius - 4, barWidth * Math.min(1, virus.vulnerableTime / 1.4), 2);
          }
          const lockText = virus.coreShielded ? 'NÚCLEO PROTEGIDO // REPARE OS RELAYS' : virus.bossPhaseTransitionTime>0 ? 'RECONFIGURANDO // ESCUDO DE TRANSIÇÃO' : virus.vulnerableTime > 0 ? 'PONTO FRACO EXPOSTO // DANO x2' : 'ESCUDO OFFLINE // GUARDA ATIVA';
          const attackKindTips = {
            slam: 'ATAQUE // IMPACTO SÍSMICO [PULAR]',
            charge: 'ATAQUE // INVESTIDA DE DADOS [PULAR/SUBIR]',
            volley: 'ATAQUE // DISPARO DE FEIXES [ESQUIVAR]',
            surge: 'ATAQUE // ERUPÇÃO DO NÚCLEO [SUBIR]',
            combo: 'ATAQUE // SEQUÊNCIA CRÍTICA [CUIDADO]'
          };
          const combatText = virus.chargeTime > 0 ? 'INVESTIDA // PULE OU USE A COBERTURA' : virus.attackWindup > 0
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
            ctx.ellipse(virus.x, ground - 3, slamRadius, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          if (virus.attackWindup > 0) {
            ctx.save(); ctx.strokeStyle='#fff0a3';ctx.fillStyle='rgba(255,84,121,.18)';ctx.setLineDash([5,5]);
            if (virus.bossAttackKind === 'charge') {
              const end=Math.max(virus.bossBounds.left,Math.min(virus.bossBounds.right,virus.x+virus.bossAttackDirection*221));
              ctx.fillRect(Math.min(virus.x,end)-38,ground-76,Math.abs(end-virus.x)+76,76);
              ctx.strokeRect(Math.min(virus.x,end)-38,ground-76,Math.abs(end-virus.x)+76,76);
            }
            if (virus.bossAttackKind === 'volley' || virus.bossAttackKind === 'combo') {
              ctx.beginPath();ctx.moveTo(virus.x,virus.y);ctx.lineTo(virus.bossAimX,virus.bossAimY);ctx.stroke();
            }
            if (virus.bossAttackKind === 'surge' || virus.bossAttackKind === 'combo') {
              const arena=virus.bossBounds;
              const positions=virus.bossStage===3?[arena.left+150,arena.right-160]:[virus.x<(arena.left+arena.right)/2?arena.right-190:arena.left+190];
              positions.forEach(px=>{ctx.fillRect(px-20,ground-68,40,68);ctx.strokeRect(px-20,ground-68,40,68);});
            }
            ctx.restore();
          }
        }
      }
    }
  }

  function drawProjectiles() {
    for (const projectile of projectiles) {
      const x = projectile.x;
      if(levelVisuals.sprite(ctx,{asset:'fx',animation:'bolt',flipX:projectile.vx<0},{x:x-16,y:projectile.y-12,width:32,height:24},animationTime))continue;
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
      if(levelVisuals.sprite(ctx,{asset:"fx",animation:"enemy",flipX:projectile.vx<0},{x:projectile.x-12,y:projectile.y-12,width:24,height:24},animationTime))continue;
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
    if(deathEcho && animationTime-deathEcho.start<.7) {
      levelVisuals.sprite(ctx,{asset:'r07',animation:'death',instance:'death-echo-'+deathEcho.start}, {x:Math.round(deathEcho.x+1),y:Math.round(deathEcho.y),width:32,height:48},actorAnimationTime);
    }
    const state=repairTarget?'repair':damageCooldown>.7?'hit':abilityPose>0?'ability':shotPose>0?'attack':!player.grounded?(player.vy<0?'jump':'fall'):Math.abs(player.vx)>1?'run':'idle';
    ctx.save();
    if(damageCooldown>0 && Math.floor(animationTime*16)%2===0)ctx.globalAlpha=.45;
    const interpolate=previousRenderPlayer && !repairSession && phaseIntroTime===0 && Math.hypot(previousRenderPlayer.x-player.x,previousRenderPlayer.y-player.y)<50;
    const px=interpolate?previousRenderPlayer.x+(player.x-previousRenderPlayer.x)*renderAlpha:player.x;
    const py=interpolate?previousRenderPlayer.y+(player.y-previousRenderPlayer.y)*renderAlpha:player.y;
    const recoil=experience.settings.reducedEffects?0:shotPose>.12?-player.facing*2:0;
    const rendered=levelVisuals.sprite(ctx,{asset:'r07',...phaseData.playerVisual,instance:'player',flipX:player.facing<0}, {x:Math.round(px+1+recoil),y:Math.round(py),width:32,height:48},actorAnimationTime,state);
    ctx.restore();
    if(rendered) {
      if(player.shieldTime>0)levelVisuals.sprite(ctx,{asset:'fx',animation:'shield'}, {x:player.x-14,y:player.y-10,width:player.width+28,height:player.height+20},animationTime);
      if(repairTarget)levelVisuals.sprite(ctx,{asset:'fx',animation:'repair'}, {x:player.x+player.facing*20,y:player.y+8,width:32,height:32},actorAnimationTime);
      return;
    }
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
    const activeBoss=viruses.find(v=>v.multiStage&&v.alive&&player.x+17>=v.bossBounds.left-120&&(!v.activationRegion || (player.y+24>=v.activationRegion.y && player.y+24<=v.activationRegion.y+v.activationRegion.height)));
    experience.audio(audioContext,phaseIndex,soundEnabled&&running&&!repairSession?.blocksWorld&&!document.getElementById('settingsDialog').open,activeBoss?.bossStage || 0);
    const outputContext=ctx;
    if(pixelScene.width!==Math.ceil(width)||pixelScene.height!==Math.ceil(height)){pixelScene.width=Math.ceil(width);pixelScene.height=Math.ceil(height);}
    ctx=pixelContext;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
    const shake=experience.offset();
    ctx.save();ctx.translate(shake.x,shake.y);
    drawBackground();
    const view={x:cameraX,y:cameraY,width,height,runtime:levelRuntime};
    levelVisuals.layers(ctx,'background',view,animationTime);
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    if (phaseData.presentation?.procedural !== false) drawThemeStructures();
    ctx.restore();
    levelVisuals.layers(ctx,'midground',view,animationTime);
    ctx.save();
    ctx.translate(-cameraX,-cameraY);
    // Subtle world grid inside the computer's digital environment.
    ctx.strokeStyle = 'rgba(62, 132, 145, .08)';
    for (let x = Math.floor(cameraX / 44) * 44; x < cameraX + width + 44; x += 44) {
      ctx.beginPath(); ctx.moveTo(x, cameraY); ctx.lineTo(x, cameraY + height); ctx.stroke();
    }
    drawSolids();
    levelRuntime.draw(ctx,view,animationTime);
    if (visualGeometry.size) for (const object of solids()) {
      const spec=visualGeometry.get(object.id);
      if (spec?.visual) levelVisuals.sprite(ctx,spec.visual,{x:object.x,y:object.y,width:object.w,height:object.h},animationTime);
    }
    for (const spec of phaseData.entities.interactives) {
      if (spec.hidden || !levelRuntime.matches(spec.requires)) continue;
      const box={x:spec.x,y:entityY(spec),width:spec.width || 32,height:spec.height || 40};
      if (!levelVisuals.sprite(ctx,spec.visual || {asset:/portal|link/.test(spec.type)?"portal":"terminal"},box,animationTime,levelRuntime.getFlag(spec.flag || spec.id)?'active':'idle')) {
        ctx.fillStyle=levelRuntime.getFlag(spec.flag || spec.id)?'#65f3bc':'#ffd166';
        ctx.fillRect(box.x,box.y,box.width,box.height);
        ctx.fillStyle='#0a1822';ctx.font='bold 10px monospace';ctx.fillText(spec.label || 'E',box.x+4,box.y+20);
      }
    }
    for(const link of levelRuntime.connections()) {
      levelVisuals.sprite(ctx,{asset:'portal'},{x:link.x,y:link.y,width:link.width,height:link.height},animationTime,'active');
    }
    drawComponents();
    drawCollectibles();
    pacing?.draw(ctx,animationTime,levelVisuals,view);
    drawViruses();
    drawProjectiles();
    drawEffects();
    drawRobot();
    experience.draw(ctx);
    ctx.restore();
    levelVisuals.layers(ctx,'foreground',view,animationTime);
    ByteRunner.art.atmosphere(ctx,view,animationTime,phaseData.palette[2]);
    if(ByteRunner.mapDebug?.enabled)ByteRunner.mapDebug.frame({phase:phaseData,shapes:solids(),links:levelRuntime.connections(),player:{x:player.x,y:player.y},repaired:components.filter(c=>c.repaired).map(c=>c.id),cacheSize:levelVisuals.terrain?.cacheSize||0});
    ctx.restore();
    ctx=outputContext;ctx.imageSmoothingEnabled=false;ctx.save();ctx.drawImage(pixelScene,0,0,width,height);ctx.restore();
    if(animationTime<.65 && phaseIntroTime===0) {ctx.fillStyle='rgba(7,11,29,'+(.7*(1-animationTime/.65))+')';ctx.fillRect(0,0,width,height);}
    const environment=levelRuntime.modifiers();
    if (environment.label) {ctx.fillStyle='#d5c5ff';ctx.font='bold 11px monospace';ctx.fillText(environment.label,12,height-28);}
    if (phaseData.map.sections?.length) {
      const section=phaseData.map.sections.filter(section=>player.x>=section.x).at(-1);
      ctx.fillStyle='#b8eaff';ctx.font='bold 10px monospace';ctx.fillText(section?.label || 'SERVIDORES E INTERNET',12,15);
      const boss=viruses.find(enemy=>enemy.multiStage && enemy.alive);
      if (boss && player.x>=boss.bossBounds.left-140 && (!boss.activationRegion || (player.y+24>=boss.activationRegion.y-100&&player.y+24<=boss.activationRegion.y+boss.activationRegion.height+100))) {
        const barWidth=Math.min(360,width-32), x=(width-barWidth)/2;
        const protectedCore=components.some(component=>!component.repaired);
        const state=protectedCore?'PROTEGIDO // '+components.filter(c=>c.repaired).length+'/4 RELAYS':boss.bossPhaseTransitionTime>0?'RECONFIGURAÇÃO // AGUARDE':boss.chargeTime>0?'INVESTIDA // PULE':boss.attackWindup>0?'ATAQUE EM PREPARAÇÃO':boss.vulnerableTime>0?'PONTO FRACO // DANO x2':'GUARDA';
        ctx.fillStyle='rgba(5,12,24,.88)';ctx.fillRect(x-8,40,barWidth+16,45);
        ctx.fillStyle=protectedCore?'#80dbff':boss.vulnerableTime>0?'#ffe27a':'#ff7197';
        ctx.font='bold 10px monospace';ctx.fillText('VIRUS ZERO // ETAPA '+(boss.bossStage||1)+' // '+state,x,54,barWidth);
        ctx.fillStyle='#322332';ctx.fillRect(x,62,barWidth,8);
        ctx.fillStyle=protectedCore?'#80dbff':'#ff5479';ctx.fillRect(x,62,barWidth*boss.hp/boss.maxHp,8);
        ctx.fillStyle='#cadbe8';ctx.font='9px monospace';ctx.fillText('A/D MOVER  •  ESPAÇO PULAR  •  J ATACAR',x,80,barWidth);
      }
    }
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
    const repairPanel=document.getElementById('repairPanel');
    repairPanel.hidden=!(running && repairSession?.blocksWorld);
    if (repairSession?.blocksWorld) {
      document.getElementById('repairPrompt').textContent=repairSession.label?.() || 'REPARO EM ANDAMENTO';
    }
  }

  function frame(timestamp) {
    if (!running) return;
    const dt = Math.min(Math.max(0,(timestamp - lastFrame) / 1000 || 0), 1 / 15);
    lastFrame = timestamp;
    frameAccumulator+=dt;
    for(let step=0;frameAccumulator>=1/120 && step<8 && running;step++) {
      previousRenderPlayer={x:player.x,y:player.y};
      update(1/120);frameAccumulator=Math.max(0,frameAccumulator-1/120);
    }
    renderAlpha=Math.min(1,frameAccumulator*120);
    draw();
    if (running) requestAnimationFrame(frame);
  }

  function launchLoadedPhase(showIntro = true) {
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
    if(showIntro)beginPhaseIntro();
    playSound('start');frameAccumulator=0;previousRenderPlayer=null;
    lastFrame = performance.now();
    requestAnimationFrame(frame);
    saveCampaign();
  }

  function pause() {
    if (!running) return;
    keys.clear();
    running = false;
    frameAccumulator=0;previousRenderPlayer=null;
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
  document.getElementById('skipIntro').addEventListener('click',endPhaseIntro);
  experience.mountSettings(()=>{if(running)pause();},resize);
  document.getElementById('cancelRepairButton').addEventListener('click', () => {cancelRepair();keys.clear();draw();});
  document.getElementById('repairPauseButton').addEventListener('click', pause);

  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if(document.getElementById('settingsDialog').open)return;
    if(phaseIntroTime>0 && running) {
      if(key==='escape')pause();
      else if(key==='enter'||key===' '){event.preventDefault();endPhaseIntro();}
      return;
    }
    if(repairSession?.blocksWorld && running) {
      if(key==='escape'){event.preventDefault();pause();return;}
      if(repairSession.handleKey){repairSession.handleKey(event);return;}
    }
    if(key==='e' && event.repeat)return;
    if ([' ', 'arrowup', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (['w', 'arrowup', ' '].includes(key) && !keys.has(key)) jumpQueued = true;
    if (key === 'e' && !keys.has(key) && running && !findNearbyComponent()) {
      interactionMessage = 'NENHUM COMPONENTE AO ALCANCE';
      interactionMessageTimer = 1.2;
    }
    keys.add(key);
    if(key==='e' && running && findNearbyComponent())updateRepair(0);
    if (key === 'escape') pause();
  });
  window.addEventListener('keyup', event => {
    const key = event.key.toLowerCase();
    keys.delete(key);
    if (key === 'e' && !repairSession?.blocksWorld) cancelRepair();
  });
  window.addEventListener('blur', () => keys.clear());
  window.addEventListener('pagehide', saveCampaign);
  document.addEventListener('visibilitychange', () => { if (document.hidden) {if(running)pause();experience.silence(audioContext);saveCampaign();} });

  resetCampaign();
  resize();
  draw();
  setSoundEnabled(soundEnabled);
  bindTouchControls();
  setupMenu();

})();
