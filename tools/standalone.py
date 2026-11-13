"""Inline the browser build for a local, single-file review."""
from base64 import b64encode
from pathlib import Path
import json
root=Path('dist')
def uri(path,kind):
    return 'data:'+kind+';base64,'+b64encode(path.read_bytes()).decode()
source=(root/'app.js').read_text()
runtime=json.dumps(uri(root/'runtime/esengine.js','text/javascript'))
wasm=uri(root/'runtime/esengine.wasm','application/wasm')
assert source.count('"./runtime/esengine.js"')==1 and source.count('locateFile:')>=1
source=source.replace('"./runtime/esengine.js"',runtime)
marker=source.rfind('locateFile:')
source=source[:marker]+'wasmBinary:Uint8Array.from(atob("'+wasm.split(',',1)[1]+'"),c=>c.charCodeAt(0)),'+source[marker:]
entry='data:text/javascript;base64,'+b64encode(source.encode()).decode()
html=(root/'index.html').read_text().replace('src="./app.js"','src="'+entry+'"')
Path('last-umbrella.html').write_text(html+'<!--\n'+(root/'ESTELLA-LICENSE').read_text()+'\n-->')
