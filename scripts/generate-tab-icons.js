const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const baseDir = path.resolve(__dirname, '..', 'assets', 'images', 'icons');
const outDir = path.resolve(__dirname, '..', 'assets', 'images', 'tab-bar');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const icons = [
  { name: 'home', src: 'homepage.svg' },
  { name: 'heritage', src: 'heritage.svg' },
  { name: 'products', src: 'featured.svg' },
  { name: 'profile', src: 'my.svg' }
];
(async () => {
  for (const icon of icons) {
    const input = path.join(baseDir, icon.src);
    const baseName = 'tab-' + icon.name;
    const normalOut = path.join(outDir, baseName + '.png');
    const activeOut = path.join(outDir, baseName + '-active.png');
    await sharp(input)
      .resize(64, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({ top: 12, bottom: 4, left: 0, right: 0, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(normalOut);
    await sharp(input)
      .resize(64, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .tint({ r: 0, g: 188, b: 212 })
      .extend({ top: 12, bottom: 4, left: 0, right: 0, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(activeOut);
    console.log('Generated', normalOut, 'and', activeOut);
  }
})();
