"""Serialize semantic content for React; build templates never become application pages."""
from pathlib import Path
from html.parser import HTMLParser
import json,re

class Tree(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.tree={'tag':'root','children':[]};self.stack=[self.tree]
 def handle_starttag(self,tag,attrs):
  node={'tag':tag,'attrs':dict(attrs),'children':[]};self.stack[-1]['children'].append(node)
  if tag not in ['img','input','hr','br','meta','link','source','wbr','area','base','embed']:self.stack.append(node)
 def handle_endtag(self,tag):
  for index in range(len(self.stack)-1,0,-1):
   if self.stack[index]['tag']==tag:self.stack=self.stack[:index];break
 def handle_data(self,text):
  if text.strip():self.stack[-1]['children'].append(text)

def find(nodes,tag):
 for node in nodes:
  if isinstance(node,str):continue
  if node['tag']==tag:return node
  found=find(node['children'],tag)
  if found:return found

def write_document(root,name,source):
 parser=Tree();parser.feed(source)
 lang=re.search(r'<html lang="(.*?)"',source)[1]
 head='\n'.join(re.findall(r'<(?:title\b[^>]*>.*?</title>|meta\b[^>]*>|link\b[^>]*(?:rel="(?:canonical|alternate|icon|apple-touch-icon)"|hreflang=)[^>]*>)',source,re.S))
 data={'route':name,'lang':lang,'head':head,'main':find(parser.tree['children'],'main')}
 path=Path(root)/'src/content/documents'/f'{Path(name).stem}.json'
 path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
