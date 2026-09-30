import json,re,urllib.request,concurrent.futures
from pathlib import Path
base='https://www.larevueltaconsultora.com'
paths={'/images/hero.webp','/logo.png'}
for p in Path('reference').glob('*.json'):
 d=json.loads(p.read_text());paths.update(i['src'] for i in d['images'] if i['src'].startswith('/'))
 for bg in d['backgrounds']:
  paths.update(x.replace(base,'') for x in re.findall(r'url\("(.*?)"\)',bg))
css=urllib.request.urlopen(base+'/_next/static/css/d85581fb3a55dff9.css').read().decode()
Path('reference/original.css').write_text(css)
paths.update('/_next/static/'+x[3:] if x.startswith('../') else x for x in re.findall(r'url\(([^)]+)\)',css) if '.woff' in x)
def get(p):
 try:
  content=urllib.request.urlopen(base+p).read();dest=Path('public'+p);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(content);return p,len(content)
 except Exception as e:return p,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for result in pool.map(get,paths): print(*result)
