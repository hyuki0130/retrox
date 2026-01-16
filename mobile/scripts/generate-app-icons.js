#!/usr/bin/env node

const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IOS_SIZES = [
  { size: 20, scale: 2, filename: 'Icon-20@2x.png' },
  { size: 20, scale: 3, filename: 'Icon-20@3x.png' },
  { size: 29, scale: 2, filename: 'Icon-29@2x.png' },
  { size: 29, scale: 3, filename: 'Icon-29@3x.png' },
  { size: 40, scale: 2, filename: 'Icon-40@2x.png' },
  { size: 40, scale: 3, filename: 'Icon-40@3x.png' },
  { size: 60, scale: 2, filename: 'Icon-60@2x.png' },
  { size: 60, scale: 3, filename: 'Icon-60@3x.png' },
  { size: 1024, scale: 1, filename: 'Icon-1024.png' },
];

const ANDROID_SIZES = [
  { size: 48, density: 'mdpi' },
  { size: 72, density: 'hdpi' },
  { size: 96, density: 'xhdpi' },
  { size: 144, density: 'xxhdpi' },
  { size: 192, density: 'xxxhdpi' },
  { size: 512, density: 'playstore', filename: 'ic_launcher-playstore.png' },
];

async function svgToPng(svgPath, outputPath, width, height) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: width },
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  await sharp(pngBuffer)
    .resize(width, height, { fit: 'fill' })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
}

async function generateIcons(svgPath, conceptName) {
  const projectRoot = path.resolve(__dirname, '..');
  const assetsDir = path.join(projectRoot, 'src', 'assets', 'app-icon');
  
  const iosOutputDir = path.join(assetsDir, conceptName, 'ios');
  const androidOutputDir = path.join(assetsDir, conceptName, 'android');
  
  fs.mkdirSync(iosOutputDir, { recursive: true });
  fs.mkdirSync(androidOutputDir, { recursive: true });
  
  console.log(`\nGenerating icons for ${conceptName}...`);
  console.log(`Source: ${svgPath}`);
  
  console.log('\niOS Icons:');
  for (const spec of IOS_SIZES) {
    const pixelSize = spec.size * spec.scale;
    const outputPath = path.join(iosOutputDir, spec.filename);
    await svgToPng(svgPath, outputPath, pixelSize, pixelSize);
    console.log(`  ${spec.filename} (${pixelSize}x${pixelSize})`);
  }
  
  console.log('\nAndroid Icons:');
  for (const spec of ANDROID_SIZES) {
    const filename = spec.filename || 'ic_launcher.png';
    const outputPath = path.join(androidOutputDir, `${spec.density}_${filename}`);
    await svgToPng(svgPath, outputPath, spec.size, spec.size);
    console.log(`  ${spec.density}/${filename} (${spec.size}x${spec.size})`);
  }
  
  console.log(`\nDone! Icons saved to ${path.join(assetsDir, conceptName)}`);
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const assetsDir = path.join(projectRoot, 'src', 'assets', 'app-icon');
  
  const concepts = [
    { name: 'neon-bright', file: 'concept-a-neon-bright.svg' },
    { name: 'crt-dark', file: 'concept-b-crt-dark.svg' },
  ];
  
  for (const concept of concepts) {
    const svgPath = path.join(assetsDir, concept.file);
    if (fs.existsSync(svgPath)) {
      await generateIcons(svgPath, concept.name);
    } else {
      console.error(`SVG not found: ${svgPath}`);
    }
  }
}

main().catch(console.error);
