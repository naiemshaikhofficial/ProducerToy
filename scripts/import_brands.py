import re
import json

content_path = r'C:\Users\Naiem\.gemini\antigravity\brain\be7610d7-ef90-434d-8d0e-b87a8d49cf01\.system_generated\steps\200\content.md'

with open(content_path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\[(.*?)\]\(https://www\.pluginboutique\.com/manufacturers/\d+-(.*?)\)'
matches = re.findall(pattern, text)

brands = []
seen_names = set()
seen_slugs = set()

def make_slug(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'brand'

for name, raw_slug in matches:
    name = name.strip()
    if not name or name in seen_names or 'Letter' in name or 'manufacturers#' in raw_slug:
        continue
    
    slug = make_slug(name)
    if slug in seen_slugs:
        slug = f"{slug}-1"
    
    seen_names.add(name)
    seen_slugs.add(slug)
    brands.append((name, slug))

print(f"Total valid brands: {len(brands)}")

batches = []
for i in range(0, len(brands), 50):
    chunk = brands[i:i+50]
    values = []
    for n, s in chunk:
        esc_n = n.replace("'", "''")
        esc_s = s.replace("'", "''")
        values.append(f"('{esc_n}', '{esc_s}')")
    
    sql = f"INSERT INTO brands (name, slug) VALUES {', '.join(values)} ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;"
    batches.append(sql)

with open('brands_batches.json', 'w', encoding='utf-8') as f:
    json.dump(batches, f)

print(f"Generated {len(batches)} SQL batches into brands_batches.json")
