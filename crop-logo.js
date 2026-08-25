const sharp = require('sharp');
const fs = require('fs');

async function cropLogo() {
  const original = 'C:/Users/Naiem/.gemini/antigravity/brain/1c383d31-b728-48ce-a67c-e3586d160671/media__1787551039160.png';
  
  // Trim black background padding automatically
  const trimmed = await sharp(original)
    .trim({ threshold: 40 })
    .toBuffer();

  // Get trimmed metadata
  const meta = await sharp(trimmed).metadata();
  const maxDim = Math.max(meta.width, meta.height);
  const padding = Math.round(maxDim * 0.04); // subtle 4% padding so icon fills 92% of space

  const result = await sharp(trimmed)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .resize(512, 512)
    .toBuffer();

  // Save tight cropped images
  fs.writeFileSync('public/logo.png', result);
  fs.writeFileSync('public/favicon.ico', result);
  fs.writeFileSync('public/favicon.png', result);
  fs.writeFileSync('public/icon.png', result);
  fs.writeFileSync('public/apple-icon.png', result);
  fs.writeFileSync('src/app/favicon.ico', result);
  fs.writeFileSync('src/app/icon.png', result);
  fs.writeFileSync('src/app/apple-icon.png', result);

  console.log('✅ Cropped logo successfully! Trimmed dimensions:', meta.width, 'x', meta.height);
}

cropLogo().catch(err => console.error(err));
