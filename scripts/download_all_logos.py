import os
import json
import urllib.request
import urllib.parse
import re

SUPABASE_URL = "https://voalgeyexfhfitlyorfl.supabase.co"
ANON_KEY = "sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD"
OUTPUT_DIR = os.path.join(os.getcwd(), "public", "images", "brands")

os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json"
}

# 1. Fetch all brands
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/brands?select=id,name,slug,logo_url&limit=1000", headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        brands = json.loads(response.read().decode('utf-8'))
        print(f"Fetched {len(brands)} brands from Supabase.")
except Exception as e:
    print(f"Error fetching brands: {e}")
    exit(1)

downloaded_count = 0
failed_count = 0

for brand in brands:
    brand_id = brand['id']
    slug = brand['slug']
    logo_url = brand.get('logo_url')

    if not logo_url or not logo_url.startswith('http'):
        continue

    # Determine file extension
    ext = '.png'
    if '.jpg' in logo_url.lower() or '.jpeg' in logo_url.lower():
        ext = '.jpg'
    elif '.svg' in logo_url.lower():
        ext = '.svg'
    elif '.webp' in logo_url.lower():
        ext = '.webp'
    elif '.gif' in logo_url.lower():
        ext = '.gif'

    filename = f"{slug}{ext}"
    filepath = os.path.join(OUTPUT_DIR, filename)
    local_url_path = f"/images/brands/{filename}"

    # Download image
    try:
        img_req = urllib.request.Request(
            logo_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(img_req, timeout=10) as img_resp:
            data = img_resp.read()
            with open(filepath, 'wb') as f:
                f.write(data)
        
        # Update database with local URL path
        update_data = json.dumps({"logo_url": local_url_path}).encode('utf-8')
        patch_req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/brands?id=eq.{brand_id}",
            data=update_data,
            headers={**headers, "Prefer": "return=minimal"},
            method="PATCH"
        )
        with urllib.request.urlopen(patch_req) as patch_resp:
            pass

        downloaded_count += 1
        print(f"[{downloaded_count}] Downloaded & Updated: {brand['name']} -> {local_url_path}")

    except Exception as e:
        failed_count += 1
        print(f"Failed logo for {brand['name']} ({logo_url}): {e}")

print(f"\nFinished! Downloaded {downloaded_count} logos to public/images/brands/. Failed: {failed_count}.")
