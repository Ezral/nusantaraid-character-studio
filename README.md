# NusantaraID Character Studio

Standalone static Ragnarok character preview hosted on GitHub Pages. No extension, login, or game connection required.

Choose gender, classic job, hair style, hair color (0–263), and clothing color (0–699). Rotate through eight directions using a mouse wheel, arrows, keyboard, or a horizontal touch drag. Zoom with the slider or buttons. On mobile, gender and job are side-by-side dropdowns. Hairstyle and palettes use compact wrapping horizontal snap selectors; palette values are zero-padded monospace numbers. Highlights update during scrolling, with character assets applied after settling. Vertical touch scrolling also works when a gesture starts over a picker. The viewer occupies the upper half of the available screen; controls scroll independently in the lower half. Equipment uses a single per-slot searchable combobox on desktop and mobile, with a 250 ms typing debounce. All controls remain usable on narrow and landscape screens.

Backgrounds are Light or Dark. PNG export stays transparent. Display settings and appearance persist locally; Reset restores defaults.

## Niktout catalogue

Character sprites, palettes, equipment, and aura textures load on demand from https://classicweb.niktoutro.com/client/. The item catalogue is generated from Niktout's public client bundle, accessory mappings, item display names, and descriptions. It currently contains 931 matched entries (852 regular headgear, 79 costumes), using actual item IDs and documented upper/middle/lower slots. Costume items override ordinary items in overlapping slots; conflicting items within the same category are cleared.

This reflects the public client catalogue, not the server's private item database, shops, or obtainable-item list. Entries without a confirmed visual mapping and slot are omitted. No garment items could be matched in those tables, so that picker is hidden rather than populated with unrelated generic assets. Item class/job/level restrictions are not enforced by this appearance tool. Missing assets are reported and disable PNG export.

To refresh the catalogue, run npm run update:catalogue. The generator downloads only public client data into ignored .cache files and writes niktout-items.js.

## Original level 99 aura

The aura uses roBrowserLegacy's original GroundAura, SwirlingAura, and Level99Bubble classes and shaders, preserved unchanged under vendor/aura. Its original pikapika2.bmp, ring_blue.tga, and whitelight.tga textures are loaded from Niktout. The custom 2D aura imitation has been removed.

A small WebGL 2 host provides a flat ground plane, the preview camera, texture loading, and additive-light transparency conversion for canvas/PNG composition. These adapters do not replace the original effect geometry or animation. The aura uses the character ACT origin and the same canvas zoom transform, with the original shaders' 35 sprite-pixels-per-world-unit conversion, with a 0.55 presentation scale to keep the aura compact. Reduced-motion mode displays a static frame. Aura animation stops rendering when disabled or the document is hidden. WebGL 2 is required for the aura.

Run npm ci and npm run build:aura to regenerate the committed aura/aura.js bundle. Normal static hosting needs no build step. Shader/class source equality, equipment loading, desktop controls, touch rotation, palette scrolling, mobile search, reset, and responsive widths were checked in Chromium; physical iOS/Android device testing has not been performed.

## Credits and license

GPL-3.0; see LICENSE. SPR/ACT/Targa loaders, job/hair/palette tables, and original aura effects are from MrAntares/roBrowserLegacy (https://github.com/MrAntares/roBrowserLegacy), retaining notices. gl-matrix retains its upstream license; Poppins is distributed under fonts/OFL.txt. Game artwork is fetched at runtime and is not covered by the code license. No Chrome extension source is required.
