import os
from PIL import Image

def crop_logo_to_edges():
    path = "public/logo-black.png"
    img = Image.open(path).convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    print("Original size:", img.size, "BBox:", bbox)
    
    if not bbox:
        print("No content found")
        return

    # Crop tightly to the P graphic
    cropped = img.crop(bbox)
    w, h = cropped.size
    print(f"Cropped graphic size: {w}x{h}")

    # Create a square box with minimal padding so the P fills the tab edge-to-edge
    max_dim = max(w, h)
    # Add minimal margin (1%) so it doesn't get clipped by rounded tab edges
    pad = max(1, int(max_dim * 0.01))
    canvas_size = max_dim + pad * 2

    square_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = pad + (max_dim - w) // 2
    offset_y = pad + (max_dim - h) // 2
    square_img.paste(cropped, (offset_x, offset_y), cropped)

    # Save high-res cropped logo-black.png (1024x1024)
    final_1024 = square_img.resize((1024, 1024), Image.Resampling.LANCZOS)
    final_1024.save("public/logo-black.png", "PNG")
    print("Updated public/logo-black.png (1024x1024 edge-to-edge)")

    # Save favicon.png (512x512)
    final_512 = square_img.resize((512, 512), Image.Resampling.LANCZOS)
    final_512.save("public/favicon.png", "PNG")
    final_512.save("public/icon.png", "PNG")
    
    # Save apple-icon.png (180x180)
    final_180 = square_img.resize((180, 180), Image.Resampling.LANCZOS)
    final_180.save("public/apple-icon.png", "PNG")

    # Save multi-size favicon.ico
    ico_img = square_img.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Successfully generated edge-to-edge favicons!")

if __name__ == "__main__":
    crop_logo_to_edges()
