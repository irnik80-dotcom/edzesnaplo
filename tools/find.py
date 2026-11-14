# Videókereső: python3 tools/find.py  (a tools/lib.py gyakorlataihoz keres YouTube shortot, és oEmbeddel ellenőrzi, hogy nyilvános és beágyazható-e)
import json, re, subprocess, sys, urllib.parse, time
sys.path.insert(0,'tools'); from lib import LIB
def sh(args): return subprocess.run(args, capture_output=True, text=True, timeout=40).stdout
def search(q):
    url='https://www.youtube.com/results?search_query='+urllib.parse.quote(q)
    html=sh(['curl','-s','--max-time','20','-H','Accept-Language: en-US,en','-H','Cookie: CONSENT=YES+1',url])
    ids=[]; 
    for m in re.finditer(r'"videoId":"([A-Za-z0-9_-]{11})"', html):
        if m.group(1) not in ids: ids.append(m.group(1))
    return ids[:8]
def oembed(i):
    out=sh(['curl','-s','--max-time','15','-w','\n%{http_code}','https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v='+i])
    body,code=out.rsplit('\n',1)
    if code!='200': return None
    try: return json.loads(body)
    except: return None
def is_short(i):
    code=sh(['curl','-s','-o','/dev/null','--max-time','15','-w','%{http_code}','https://www.youtube.com/shorts/'+i])
    return code=='200'
qs=[x[2] for x in LIB]+sys.argv[1:]
res={}
try: res=json.load(open('tools/videos.json'))
except: pass
for q in qs:
    if q in res: continue
    words=[w for w in re.split(r'\W+',q.lower()) if len(w)>2 and w not in ('form','machine','cable','dumbbell','barbell')]
    best=None
    for i in search(q+' form #shorts'):
        o=oembed(i)
        if not o: continue
        t=o.get('title','').lower()
        if words and not any(w in t for w in words): continue
        s=is_short(i)
        best={'id':i,'title':o['title'],'author':o.get('author_name'),'short':s}
        if s: break
    res[q]=best
    print(q,'->',best and (best['id'],best['short'],best['title'][:60],best['author']),flush=True)
    json.dump(res,open('tools/videos.json','w'),ensure_ascii=False,indent=1)
