"""Main's long strip without drafts in «Активність», for the landing's live Main (task 17): step 01 starts on a-d0
(no drafts, no «Активність» block), so the live Main shows that state from the hero on and step 01's first frame comes in
unseen. The strip is a-d0's own picture from the strip's top (110.2 pt, where the live strip starts) down to the gap
between «План» and «Цілі» (658 pt on a-d0), then the long strip from the same gap on.

Run: python3 tools/scenes/empty_strip.py .   — after re-shooting a-d0 or the long strip; it measures where the goals
start on the strip by matching a-d0's goals rows, prints it and writes v3/shots/<lang>-main-empty.jpg."""
import sys
import numpy as np
from PIL import Image

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
K = 750 / 402            # pixels per point on the 750-px captures
TOP, SEAM = 110.2, 658   # a-d0: where the live strip starts; the gap between «План» and «Цілі»
GOALS = (680, 705)       # a-d0 rows matched on the strip (left of Dibsly's button)

for lang in ("uk", "en"):
    frame = Image.open(f"{ROOT}/v3/scenes/{lang}-a-d0.jpg").convert("RGB")
    strip = Image.open(f"{ROOT}/v3/shots/{lang}-main-long.jpg").convert("RGB")
    f, s = (np.asarray(im.convert("L"), dtype=float) for im in (frame, strip))
    tpl = f[int(GOALS[0] * K):int(GOALS[1] * K), int(20 * K):int(300 * K)]
    rows = tpl.shape[0]
    diff, at = min((np.abs(s[y:y + rows, int(20 * K):int(300 * K)] - tpl).mean(), y) for y in range(s.shape[0] - rows))
    shift = at / K - GOALS[0]   # a-d0 point + shift = the same thing on the strip
    top, seam, cut = round(TOP * K), round(SEAM * K), round((SEAM + shift) * K)
    out = Image.new("RGB", (750, (seam - top) + (strip.height - cut)))
    out.paste(frame.crop((0, top, 750, seam)), (0, 0))
    out.paste(strip.crop((0, cut, 750, strip.height)), (0, seam - top))
    out.save(f"{ROOT}/v3/shots/{lang}-main-empty.jpg", quality=88, optimize=True, progressive=True)
    print(lang, f"goals at {at / K:.1f} pt on the strip (match {diff:.2f}), shift {shift:.1f} pt, {out.width}×{out.height}")
