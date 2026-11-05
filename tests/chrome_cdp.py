"""Small standard-library CDP transport for local Chrome audits (no packages)."""
import base64, hashlib, json, os, socket, struct, time, urllib.parse, urllib.request, subprocess

class CDP:
    def __init__(self,url):
        parsed=urllib.parse.urlparse(url)
        self.socket=socket.create_connection((parsed.hostname,parsed.port),timeout=10)
        self.pending=b'';self.serial=0;self.events=[]
        key=base64.b64encode(os.urandom(16)).decode()
        request=f'GET {parsed.path} HTTP/1.1\r\nHost: {parsed.hostname}:{parsed.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'
        self.socket.sendall(request.encode())
        header=b''
        while b'\r\n\r\n' not in header:header+=self.socket.recv(4096)
        header,self.pending=header.split(b'\r\n\r\n',1)
        expected=base64.b64encode(hashlib.sha1((key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode()).digest())
        if b' 101 ' not in header or expected.lower() not in header.lower():raise RuntimeError('WebSocket handshake failed: '+header.decode())
    def read(self,size):
        while len(self.pending)<size:
            chunk=self.socket.recv(max(4096,size-len(self.pending)))
            if not chunk:raise EOFError('Chrome disconnected')
            self.pending+=chunk
        data,self.pending=self.pending[:size],self.pending[size:];return data
    def send(self,data,opcode=1):
        payload=data.encode() if isinstance(data,str) else data;size=len(payload);mask=os.urandom(4)
        header=bytes([128|opcode,128|(size if size<126 else 126 if size<=65535 else 127)])
        if size>=126:header+=struct.pack('!H' if size<=65535 else '!Q',size)
        self.socket.sendall(header+mask+bytes(value^mask[i%4] for i,value in enumerate(payload)))
    def receive(self):
        result=b''
        while True:
            a,b=self.read(2);size=b&127
            if size==126:size=struct.unpack('!H',self.read(2))[0]
            elif size==127:size=struct.unpack('!Q',self.read(8))[0]
            mask=self.read(4) if b&128 else None;payload=self.read(size)
            if mask:payload=bytes(value^mask[i%4] for i,value in enumerate(payload))
            opcode=a&15
            if opcode==8:raise EOFError('Chrome closed WebSocket')
            if opcode==9:self.send(payload,10);continue
            if opcode in [0,1]:result+=payload
            if a&128 and opcode in [0,1]:return json.loads(result)
    def call(self,method,params=None,timeout=30):
        self.serial+=1;identifier=self.serial
        self.send(json.dumps({'id':identifier,'method':method,'params':params or {}}))
        deadline=time.monotonic()+timeout
        while True:
            remaining=deadline-time.monotonic()
            if remaining<=0:raise TimeoutError(method)
            self.socket.settimeout(remaining);result=self.receive()
            if result.get('id')==identifier:
                if 'error' in result:raise RuntimeError(method+': '+json.dumps(result['error']))
                return result.get('result',{})
            if 'method' in result:self.events.append(result)
    def evaluate(self,expression):
        result=self.call('Runtime.evaluate',{'expression':expression,'returnByValue':True,'awaitPromise':True},timeout=60)
        if 'exceptionDetails' in result:raise RuntimeError(json.dumps(result['exceptionDetails']))
        return result.get('result',{}).get('value')
    def close(self):self.socket.close()

def page_endpoint(port):
    with urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list',timeout=5) as response:
        return next(page['webSocketDebuggerUrl'] for page in json.load(response) if page['type']=='page')

def source_fingerprint(root):
    digest=hashlib.sha256()
    paths=[root/'game.js',root/'index.html',root/'style.css',*root.joinpath('src').rglob('*.js'),*root.joinpath('assets').rglob('*.svg'),*root.joinpath('assets').rglob('*.png')]
    for path in sorted(paths):digest.update(path.relative_to(root).as_posix().encode());digest.update(path.read_bytes())
    return digest.hexdigest()

def close_chrome(process,cdp):
    """Close only this isolated test process tree, including Windows cache holders."""
    if cdp:
        try:cdp.close()
        except OSError:pass
    if process.poll() is None:
        if os.name=='nt':
            subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True,timeout=20)
        else:process.terminate()
    try:process.wait(timeout=15)
    except subprocess.TimeoutExpired:process.kill();process.wait(timeout=10)
