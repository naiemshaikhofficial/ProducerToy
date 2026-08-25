import urllib.request
import re
import json

url = 'https://www.pluginboutique.com/manufacturers'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

req = urllib.request.Request(url, headers=headers)
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print(f"HTML Length: {len(html)}")
    
    # Save html snippet to inspect
    with open('manufacturers.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Saved manufacturers.html successfully")
except Exception as e:
    print("Error:", e)
