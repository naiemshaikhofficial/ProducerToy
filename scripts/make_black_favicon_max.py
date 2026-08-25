import os
from PIL import Image

def generate_black_max_favicons():
    white_path = "public/logo-white.png"
    if not os.path.exists(white_path):
        print("logo-white.png not found")
        return

    img_white = Image.open(white_path).convert("RGBA")
    bbox = img_white.getchannel("A").getbbox()
    print("Original logo bounding box:", bbox)

    # Crop tightly around P graphic
    cropped = img_white.crop(bbox)
    w, h = cropped.size
    print(f"Cropped graphic size: {w}x{h}")

    # Convert graphic to PURE BLACK (#000000) while keeping alpha channel
    r, g, b, a = cropped.split()
    black_rgb = Image.new("RGB", cropped.size, (0, 0, 0))
    black_cropped = Image.composite(black_rgb, Image.new("RGB", cropped.size, (0, 0, 0)), a)
    black_cropped.putalpha(a)

    # 1:1 square canvas with 0 margin for max size
    max_dim = max(w, h)
    fav_canvas = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    offset_x = (max_dim - w) // 2
    offset_y = (max_dim - h) // 2
    fav_canvas.paste(black_cropped, (offset_x, offset_y), black_cropped)

    # Save 100% MAX size black favicons
    fav_512 = fav_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    fav_512.save("public/favicon.png", "PNG")
    fav_512.save("public/icon.png", "PNG")

    fav_180 = fav_canvas.resize((180, 180), Image.Resampling.LANCZOS)
    fav_180.save("public/apple-icon.png", "PNG")

    ico_img = fav_canvas.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Successfully generated 100% MAX scale PURE BLACK favicons!")

if __name__ == "__main__":
    generate_black_max_favicons()
