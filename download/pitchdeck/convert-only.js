const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const fs = require('fs');
const path = require('path');

const SLIDES_DIR = '/home/z/my-project/download/pitchdeck/slides';
const OUTPUT = '/home/z/my-project/download/TerraBrew-PitchDeck.pptx';
const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Palatino Linotype' };

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'TerraBrew';
  pptx.title = 'TerraBrew - EUDR Compliance Infrastructure for the Coffee Supply Chain';

  const slideFiles = [];
  for (let i = 1; i <= 12; i++) {
    slideFiles.push(path.join(SLIDES_DIR, `slide${i}.html`));
  }

  for (let i = 0; i < slideFiles.length; i++) {
    console.log(`Converting slide ${i + 1}...`);
    try {
      const { slide, warnings } = await html2pptx(slideFiles[i], pptx, { fontConfig });
      if (warnings && warnings.length > 0) {
        const critical = warnings.filter(w => !w.includes('overflows body by 95'));
        if (critical.length > 0) console.log(`  Warnings:`, critical);
      }
    } catch (err) {
      console.error(`  Slide ${i + 1} error:`, err.message);
    }
  }

  await pptx.writeFile({ fileName: OUTPUT });
  console.log(`\nPPTX saved to: ${OUTPUT}`);
}

build().catch(err => { console.error('Build failed:', err); process.exit(1); });
