import re
import json

with open('manufacturers.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'<a[^>]+href=["\'](?:https://www\.pluginboutique\.com)?/manufacturers/(\d+-[^"\'\?#]+)["\'][^>]*>(.*?)</a>'
matches = re.findall(pattern, html, re.DOTALL)

def make_slug(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'brand'

updates = []
seen_names = set()

for slug_part, content in matches:
    # Extract brand name text inside the anchor (ignoring html tags if any)
    name_match = re.search(r'class=["\'][^"\'\?]*brand-name[^"\'\?]*["\'][^>]*>([^<]+)<', content)
    if not name_match:
        # Fallback: clean content tags
        cleaned = re.sub(r'<[^>]+>', '', content).strip()
        name = cleaned
    else:
        name = name_match.group(1).strip()

    if not name or name in seen_names:
        continue

    # Extract logo image
    img_match = re.search(r'<img[^>]+src=["\']([^"\'\?]+)["\']', content)
    if not img_match:
        img_match = re.search(r'<img[^>]+data-src=["\']([^"\'\?]+)["\']', content)

    if img_match:
        logo_url = img_match.group(1)
        if not logo_url.startswith('http'):
            logo_url = 'https://www.pluginboutique.com' + logo_url
        
        seen_names.add(name)
        slug = make_slug(name)
        updates.append((name, slug, logo_url))

print(f"Matched {len(updates)} brand logos!")

# Generate SQL batches to update logo_url in Supabase
batches = []
for i in range(0, len(updates), 40):
    chunk = updates[i:i+40]
    sql_statements = []
    for n, s, l in chunk:
        esc_n = n.replace("'", "''")
        esc_l = l.replace("'", "''")
        sql_statements.append(f"UPDATE brands SET logo_url = '{esc_l}' WHERE name = '{esc_n}' OR slug = '{s}';")
    batches.append("\n".join(sql_statements))

with open('update_logos_batches.json', 'w', encoding='utf-8') as f:
    json.dump(batches, f)

print(f"Generated {len(batches)} SQL update batches into update_logos_batches.json")
