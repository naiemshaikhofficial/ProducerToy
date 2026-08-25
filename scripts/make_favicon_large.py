import os
from PIL import Image

def process_favicon():
    src_path = "public/logo-black.png"
    if not os.path.exists(src_path):
        print(f"Source file {src_path} not found.")
        return

    img = Image.open(src_path).convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox() # (left, upper, right, lower)
    print("Original size:", img.size, "BBox:", bbox)

    left, upper, right, lower = bbox
    width = right - left
    height = lower - upper
    max_dim = max(width, height)

    # Add 5% padding around the cropped logo
    padding = int(max_dim * 0.05)
    padded_dim = max_dim + (padding * 2)

    # Create a new square transparent canvas
    square_img = Image.new("RGBA", (padded_dim, padded_dim), (0, 0, 0, 0))

    # Center the cropped logo on the square canvas
    cropped_logo = img.crop(bbox)
    offset_x = padding + (max_dim - width) // 2
    offset_y = padding + (max_dim - height) // 2
    square_img.paste(cropped_logo, (offset_x, offset_y), cropped_logo)

    # Resize to standard favicon sizes
    sizes = {
        "public/favicon.png": (512, 512),
        "public/icon.png": (512, 512),
        "public/apple-icon.png": (180, 180),
        "src/app/icon.png": (512, 512),
        "src/app/apple-icon.png": (180, 180),
    }

    for path, sz in sizes.items():
        resized = square_img.resize(sz, Image.Resampling.LANCZOS)
        resized.save(path, "PNG")
        print(f"Saved enlarged favicon: {path} ({sz[0]}x{sz[1]})")

    # Save ICO formats
    ico_img = square_img.resize((64, 64), Image.Resampling.LANCZOS)
    ico_img.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    ico_img.save("src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Saved favicon.ico to public/ and src/app/")

if __name__ == "__main__":
    process_favicon()
