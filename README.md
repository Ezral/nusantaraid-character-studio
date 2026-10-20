# NusantaraID Character Studio
Standalone, static character preview. Serve this directory with any HTTP server or GitHub Pages. No extension, login or game connection required.

Controls: gender, classic job, hair style, hair palette, clothing palette; wheel/arrow buttons/keyboard rotate eight directions; zoom slider and +/-; transparent PNG export. Selection saves locally. Bard/Dancer gender is synchronized.

Hair and costume palette selectors cover 0–699 inclusive. Palette 0 uses original sprite colors. Other palettes load on demand; availability depends on the selected job, gender, and asset source.

Headgear and costume controls provide upper, middle, and lower visual slots, plus costume garments/wings. Costume headgear overrides the ordinary headgear in the matching slot. Search the visual catalogue by name or view ID (not inventory item ID). The catalogue allows arbitrary visual combinations rather than enforcing item equip restrictions. Some source names are Korean. Server-specific custom items and newer sprites may be unavailable; missing items are reported and disable export. Garments render behind front-facing characters and in front when facing away.

Assets are fetched on demand from https://grf.robrowser.com/ (the public endpoint documented by roBrowser). Game artwork is not included in this repository. Availability and permission for production use of an asset endpoint should be agreed with its operator; this prototype does not establish redistribution rights for game artwork. Missing palettes explicitly fall back to original colors and disable PNG export. Server-specific dye/style limits are not claimed.

## Credits / license
GPL-3.0; see LICENSE. Sprite.js, Action.js, JobConst.js, JobNameTable.js, PalNameTable.js, HairIndexTable.js, HatTable.js, and RobeTable.js are from MrAntares/roBrowserLegacy (https://github.com/MrAntares/roBrowserLegacy), retaining original notices. Loader imports adapted for standalone use; minimal BinaryReader and canvas composition supplied here. No source from the Chrome extension is required. Poppins is distributed under fonts/OFL.txt.
