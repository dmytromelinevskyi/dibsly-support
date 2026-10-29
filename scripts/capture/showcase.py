"""Capture Dibsly's native debug showcases; no personal simulator or account is used."""
import json,os,signal,subprocess,time,sys
from pathlib import Path
from launch import DEVICE,BUNDLE,launch

scenes=['main','drafts','banks','analytics','receipt','voice','invest','premium','trends','capital','cashflow','goals','plan','calendar','chat','accounts','accountEditor','salary','shared','fop','debts','credits']
for lang in (sys.argv[1] if len(sys.argv)>1 else 'uk',):
 folder=Path('/tmp/dibsly-landing-captures')/lang/'showcase';folder.mkdir(parents=True,exist_ok=True)
 for scene in scenes:
  video=folder/f'{scene}.mp4'
  recorder=subprocess.Popen(['xcrun','simctl','io',DEVICE,'recordVideo','--codec=h264','--force',str(video)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  started=time.time()
  launch(lang,scene)
  time.sleep(8)
  subprocess.run(['xcrun','simctl','io',DEVICE,'screenshot',str(folder/f'{scene}.png')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  recorder.send_signal(signal.SIGINT);recorder.wait()
  (folder/f'{scene}.record.json').write_text(json.dumps({'language':lang,'scene':scene,'startedAt':started,'endedAt':time.time(),'source':'native-debug-showcase','commit':'5c497b974511d7ee9a37378f14711e219b8a7be6'},indent=2))
  print(f'{lang}/{scene}',flush=True)
