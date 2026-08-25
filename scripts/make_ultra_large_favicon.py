import os
from PIL import Image

def generate_ultra_large_favicons():
    white_path = "public/logo-white.png"
    if not os.path.exists(white_path):
        print("logo-white.png not found")
        return

    img_white = Image.open(white_path).convert("RGBA")
    bbox = img_white.getchannel("A").getbbox()
    print("Original logo bounding box:", bbox)

    # Crop tightly around P graphic (925x960)
    cropped = img_white.crop(bbox)
    w, h = cropped.size
    print(f"Cropped graphic size: {w}x{h}")

    # Convert graphic to PURE BLACK (#000000) keeping alpha channel
    r, g, b, a = cropped.split()
    black_rgb = Image.new("RGB", cropped.size, (0, 0, 0))
    black_cropped = Image.composite(black_rgb, Image.new("RGB", cropped.size, (0, 0, 0)), a)
    black_cropped.putalpha(a)

    # DIRECT RESIZE to 512x512 - fills 100% of the canvas to all 4 edges with 0 margin
    ultra_512 = black_cropped.resize((512, 512), Image.Resampling.LANCZOS)
    ultra_512.save("src/app/icon.png", "PNG")

    # Apple icon (180x180)
    ultra_180 = black_cropped.resize((180, 180), Image.Resampling.LANCZOS)
    ultra_180.save("src/app/apple-icon.png", "PNG")

    # Multi-resolution ICO (64x64)
    ico_img = black_cropped.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save("src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    
    print("Successfully generated ULTRA LARGE 100% fill favicons in src/app/")

if __name__ == "__main__":
    generate_ultra_large_favicons()
