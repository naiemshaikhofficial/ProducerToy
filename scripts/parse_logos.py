import re
import json

with open('manufacturers.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's find all manufacturer links with images or logo elements
# Pattern for manufacturer card or link in html
pattern = r'<a[^>]+href=["\'](?:https://www\.pluginboutique\.com)?/manufacturers/(\d+-[^"\'\?#]+)["\'][^>]*>(.*?)</a>'
matches = re.findall(pattern, html, re.DOTALL)

print(f"Total manufacturer links found in HTML: {len(matches)}")

logos = {}
for slug_part, content in matches:
    # Look for img tag inside content
    img_match = re.search(r'<img[^>]+src=["\']([^"\'\?]+)["\']', content)
    if not img_match:
        # Also check data-src or srcset
        img_match = re.search(r'<img[^>]+data-src=["\']([^"\'\?]+)["\']', content)
    
    if img_match:
        img_url = img_match.group(1)
        if not img_url.startswith('http'):
            img_url = 'https://www.pluginboutique.com' + img_url
        logos[slug_part] = img_url

print(f"Total logos extracted: {len(logos)}")
for k in list(logos.keys())[:15]:
    print(f"{k} => {logos[k]}")
