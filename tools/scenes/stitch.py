import subprocess, sys
import os
W=120; H=2622; TOP=330; BOT=int(os.environ.get("BOT","2280"))
def gray(p):
    return subprocess.run(["ffmpeg","-v","error","-i",p,"-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
def row(buf,y): return buf[y*W:(y+1)*W]
def shift(a,b):
    best=None
    for d in range(60,1900,2):
        tot=0;n=0
        for y in range(TOP+d, BOT, 6):
            ra=row(a,y); rb=row(b,y-d)
            tot+=sum(abs(ra[i]-rb[i]) for i in range(0,W,3)); n+=1
        if n<20: continue
        s=tot/n
        if best is None or s<best[0]: best=(s,d)
    return best
frames=sys.argv[1:]
g=[gray(f) for f in frames]
ds=[]
for i in range(1,len(g)):
    s,d=shift(g[i-1],g[i]); ds.append(d); print(frames[i],"shift",d,"score",round(s,2))
print("DS"," ".join(map(str,ds)))
