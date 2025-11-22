const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG with blue lowercase h for houle
const svgFavicon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <text x="256" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="380" font-weight="700" fill="#2563eb" text-anchor="middle">h</text>
</svg>
`.trim();

const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('Generating favicons with blue h...');
  
  const svgBuffer = Buffer.from(svgFavicon);
  
  // Generate favicon.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Created favicon.png (32x32)');
  
  // Generate favicon.ico (multiple sizes)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico (32x32)');
  
  // Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png (180x180)');
  
  // Generate favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
  console.log('✓ Created favicon.svg');
  
  console.log('\nFavicons generated successfully!');
}

generateFavicons().catch(console.error);
