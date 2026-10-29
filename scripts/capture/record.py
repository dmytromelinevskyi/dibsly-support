"""Record only the task-owned disposable simulator. UI actions are performed separately."""
import json,signal,subprocess,sys,time
from pathlib import Path
DEVICE='2C6C6D51-405C-4517-AE31-38F7FA60CBB1'
lang,chapter=sys.argv[1:3]
if lang not in ('uk','en') or not chapter.replace('-','').isalnum():raise SystemExit('Invalid capture name')
folder=Path('/tmp/dibsly-landing-captures')/lang;folder.mkdir(parents=True,exist_ok=True)
meta={'device':DEVICE,'language':lang,'chapter':chapter,'startedAt':time.time(),'video':str(folder/f'{chapter}.mp4')}
(folder/f'{chapter}.record.json').write_text(json.dumps(meta,indent=2))
process=subprocess.Popen(['xcrun','simctl','io',DEVICE,'recordVideo','--codec=h264','--force',meta['video']])
def finish(*_):
 if process.poll() is None:process.send_signal(signal.SIGINT)
signal.signal(signal.SIGINT,finish);signal.signal(signal.SIGTERM,finish)
result=process.wait();meta['endedAt']=time.time();(folder/f'{chapter}.record.json').write_text(json.dumps(meta,indent=2));print(json.dumps({'chapter':chapter,'language':lang,'seconds':round(meta['endedAt']-meta['startedAt'],1)}))
