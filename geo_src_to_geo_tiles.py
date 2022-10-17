# inspired by
# https://mauve.itch.io/addlemoth/devlog/364924/addlemoth-dev-update-march-2022

import time
import math
import os
from PIL import Image

input_img = Image.open("src/geo_raw.png")
w, h = input_img.size
assert w == h * 2, "Tileset not in the addlemoth format"
tile_size = h // 4
margin = 1

spritesheet = Image.new(
    "RGBA", ((tile_size + 2 * margin) * 4, (tile_size + 2 * margin) * 8))


def box2box(x, y, w, h):
    return (x, y, x+w, y+h)


# for n, (i, j) in enumerate([
#     (0, 3),
# ]):
for n, (i, j) in [
    (0, (0, 3)),
    (1, (7, 2)),
    (2, (4, 3)),
    (3, (1, 2)),
    (4, (6, 3)),
    (5, (3, 2)),
    (6, (2, 3)),
    (7, (5, 2)),
    (8, (7, 0)),
    (9, (0, 1)),
    (10, (1, 0)),
    (11, (4, 1)),
    (12, (3, 0)),
    (13, (6, 1)),
    (14, (5, 0)),
    (15, (2, 1)),

    (16, (7, 3)),
    (17, (3, 3)),
    (18, (0, 2)),
    (19, (6, 2)),
    (20, (0, 0)),
    (21, (6, 0)),
    (22, (7, 1)),
    (23, (3, 1)),
    (24, (1, 3)),
    (25, (5, 3)),
    (26, (4, 2)),
    (27, (2, 2)),
    (28, (4, 0)),
    (29, (2, 0)),
    (30, (1, 1)),
    (31, (5, 1))
]:
    cur_tile = input_img.crop(
        box2box(i*tile_size, j*tile_size, tile_size, tile_size))
    spritesheet.paste(cur_tile, (
        (n % 4) * (tile_size + 2*margin) + margin,
        (n // 4) * (tile_size + 2*margin) + margin
    ))


spritesheet.save("imgs/geo.png", "PNG")
