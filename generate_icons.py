"""Generate Scrap extension icons."""
from PIL import Image, ImageDraw
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

for size in [16, 48, 128]:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    m = size // 8  # margin

    # Trash can body
    draw.rectangle(
        [m * 2, size // 3, size - m * 2, size - m], fill=(231, 76, 60)
    )
    # Lid
    draw.rectangle(
        [m, size // 5, size - m, size // 3], fill=(200, 60, 50)
    )
    # Handle
    draw.rectangle(
        [size // 3, m, size * 2 // 3, size // 5], fill=(200, 60, 50)
    )

    img.save(f"extension/icon-{size}.png")
    print(f"Created extension/icon-{size}.png")