# NusantaraID Character Studio

Standalone static Ragnarok character preview hosted on GitHub Pages. No extension, login, or game connection required.

Choose gender, classic job, hair style, hair color (0–263), and clothing color (0–699). Rotate through eight directions using a mouse wheel, arrows, keyboard, or a horizontal touch drag. Zoom defaults to 3×. Zoom with the vertical slider or buttons beside the viewer, or swipe up/down on the character. Gestures lock to rotation or zoom after the initial movement. On mobile, gender and job are side-by-side dropdowns. Hairstyle and palettes use compact wrapping ruler selectors with tick marks and a fixed center pointer; palette values are zero-padded monospace numbers. Highlights update during scrolling, with character assets applied after settling. Vertical touch scrolling also works when a gesture starts over a picker. The viewer occupies the upper half of the available screen; controls scroll independently in the lower half, organized into Style and Equipment tabs. Switching tabs preserves the current look. At the top of the controls, overscroll can reach the browser’s native pull-to-refresh; this browser gesture requires physical-device verification. Tapping an equipment slot opens a panel from the right, with a fixed filter, a complete scrollable slot list, and identified-item BMP thumbnails from Niktout. Filtering uses a 200 ms typing debounce; thumbnails load as rows approach the viewport. Icons load on demand, are cached, and show a placeholder when unavailable. All controls remain usable on narrow and landscape screens.

All appearance changes retain the previous visible character until the next look is ready. Loaded sprite/action data is reused; failed changes leave the previous look visible. Palette-only changes replace only the affected part's palette. Cached palettes are reused and stale responses are ignored.

Backgrounds are Light or Dark. PNG export stays transparent. Display settings and appearance persist locally; Reset restores defaults.

## Niktout catalogue

Character sprites, palettes, equipment, and aura textures load on demand from https://classicweb.niktoutro.com/client/. The item catalogue is generated from Niktout's public client bundle, accessory mappings, item display names, and descriptions. It currently contains 933 entries (852 regular headgear, 81 costumes), using actual item IDs and documented upper/middle/lower slots. Costume items override ordinary items in overlapping slots; conflicting items within the same category are cleared.

This reflects the public client catalogue, not the server's private item database, shops, or obtainable-item list. Entries without a confirmed visual mapping and slot are omitted. The back/garment slot includes Costume Poring Bag (20507, robe 16) and Costume Adventurer's Backpack (20512, robe 2). These two views are absent from Niktout's bundled item table; they were cross-checked against [rAthena item definitions](https://github.com/rathena/rathena/blob/master/db/re/item_db_equip.yml), Niktout's named robe IDs, item descriptions and served SPR/ACT assets. Other garment mappings remain unverified. Item class/job/level restrictions are not enforced by this appearance tool. Missing assets are reported and disable PNG export.

To refresh the catalogue, run npm run update:catalogue. The generator downloads only public client data into ignored .cache files and writes niktout-items.js.

## Original level 99 aura

The aura uses roBrowserLegacy's original GroundAura, SwirlingAura, and Level99Bubble classes and shaders, preserved unchanged under vendor/aura. Its original pikapika2.bmp, ring_blue.tga, and whitelight.tga textures are loaded from Niktout. The custom 2D aura imitation has been removed.

A small WebGL 2 host provides a flat ground plane, the preview camera, texture loading, and additive-light transparency conversion for canvas/PNG composition. These adapters do not replace the original effect geometry or animation. The aura uses the character ACT origin and the same canvas zoom transform, with the original shaders' 35 sprite-pixels-per-world-unit conversion, with no additional size or height adjustment. Ground size 100, distance 15, blue swirling bands and bubble flag 1 match the upstream level 99 effect table. Aura opacity is adjustable from 0–100%, defaults to 50%, and persists locally; it affects the aura only, including PNG export. Aura size is adjustable from 25–200%, defaults to 100%, and scales around the foot anchor. Older aura preferences migrate to the new defaults. Reduced-motion mode displays a static frame. Aura animation stops rendering when disabled or the document is hidden. WebGL 2 is required for the aura.

Run npm ci and npm run build:aura to regenerate the committed aura/aura.js bundle. Normal static hosting needs no build step. Shader/class source equality, equipment loading, desktop controls, touch rotation, palette scrolling, mobile search, reset, and responsive widths were checked in Chromium; physical iOS/Android device testing has not been performed.

## Credits and license

GPL-3.0; see LICENSE. SPR/ACT/Targa loaders, job/hair/palette tables, and original aura effects are from MrAntares/roBrowserLegacy (https://github.com/MrAntares/roBrowserLegacy), retaining notices. gl-matrix retains its upstream license; Poppins is distributed under fonts/OFL.txt. Game artwork is fetched at runtime and is not covered by the code license. No Chrome extension source is required.
