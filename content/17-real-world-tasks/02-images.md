---
title: Working with images using Pillow
minutes: 7
---
**Pillow** is the standard Python imaging library. Install it with `pip install pillow` (you import it as `PIL`).

```py
from PIL import Image

img = Image.open("photo.jpg")
print(img.size, img.mode, img.format)     # (4000, 3000) RGB JPEG
```

## Common operations

```py
from PIL import Image, ImageFilter, ImageOps

img = Image.open("photo.jpg")

thumb = img.copy()
thumb.thumbnail((400, 400))                 # resize in place, keeps aspect ratio
thumb.save("thumb.jpg", quality=85)

img.crop((100, 100, 900, 700)).save("crop.png")      # (left, top, right, bottom)
img.rotate(90, expand=True).save("rotated.jpg")
ImageOps.grayscale(img).save("bw.jpg")
img.filter(ImageFilter.GaussianBlur(4)).save("blur.jpg")
img.convert("RGB").save("photo.webp")       # change format by extension
```

## Batch processing a folder

This is where Python beats doing it by hand:

```py
from pathlib import Path
from PIL import Image

src, out = Path("photos"), Path("web")
out.mkdir(exist_ok=True)
for path in src.glob("*.jpg"):
    with Image.open(path) as im:
        im.thumbnail((1200, 1200))
        im.save(out / f"{path.stem}.webp", quality=80)
        print("saved", path.stem)
```

## Making images from scratch

```py
from PIL import Image, ImageDraw

banner = Image.new("RGB", (800, 200), "#18181b")
draw = ImageDraw.Draw(banner)
draw.rectangle((20, 20, 780, 180), outline="#6366f1", width=4)
draw.text((40, 85), "Generated with Pillow", fill="white")
banner.save("banner.png")
```

> [!TIP]
> Always use `with Image.open(...) as im:` in loops so file handles are closed promptly, especially on Windows.
