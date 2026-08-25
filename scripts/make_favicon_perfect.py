import os
from PIL import Image

def generate_perfect_favicons():
    # 1. Load logo-white.png as reference for original 1024x1024 dimensions
    white_path = "public/logo-white.png"
    if not os.path.exists(white_path):
        print("logo-white.png not found")
        return

    img_white = Image.open(white_path).convert("RGBA")
    bbox = img_white.getchannel("A").getbbox()
    print("Original logo bounding box:", bbox)

    # Re-create original logo-black.png (1024x1024) with black P logo on transparent
    r, g, b, a = img_white.split()
    # Black color for RGB, keeping same alpha mask
    black_rgb = Image.new("RGB", img_white.size, (18, 18, 18))
    img_black_orig = Image.composite(black_rgb, Image.new("RGB", img_white.size, (0, 0, 0)), a)
    img_black_orig.putalpha(a)
    img_black_orig.save("public/logo-black.png", "PNG")
    print("Restored public/logo-black.png to original 1024x1024")

    # 2. Now create the FAVICON files (favicon.ico, favicon.png, apple-icon.png)
    # Crop the logo tightly around bbox
    cropped = img_white.crop(bbox)
    w, h = cropped.size
    max_dim = max(w, h)

    # 2% padding for crisp edge-to-edge rendering in browser tabs
    pad = int(max_dim * 0.02)
    canvas_dim = max_dim + pad * 2

    # For dark theme browser tabs, white P logo pops best
    fav_canvas = Image.new("RGBA", (canvas_dim, canvas_dim), (0, 0, 0, 0))
    offset_x = pad + (max_dim - w) // 2
    offset_y = pad + (max_dim - h) // 2
    fav_canvas.paste(cropped, (offset_x, offset_y), cropped)

    # Save favicon.png (512x512)
    fav_512 = fav_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    fav_512.save("public/favicon.png", "PNG")
    fav_512.save("public/icon.png", "PNG")

    # Save apple-icon.png (180x180)
    fav_180 = fav_canvas.resize((180, 180), Image.Resampling.LANCZOS)
    fav_180.save("public/apple-icon.png", "PNG")

    # Save favicon.ico (multi-resolution 16, 32, 48, 64)
    ico_img = fav_canvas.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated edge-to-edge favicon.ico, favicon.png, apple-icon.png!")

if __name__ == "__main__":
    generate_perfect_favicons()
