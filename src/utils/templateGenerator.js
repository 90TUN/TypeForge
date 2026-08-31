import { ALPHABET } from './constants';

export const generateTemplateImage = () => {
  return new Promise((resolve) => {
    // A4 dimensions at 300 DPI
    const CANVAS_WIDTH = 2480;
    const CANVAS_HEIGHT = 3508;
    const MARGIN = 250;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    // 1. Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Draw Registration Marks (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
    const drawRegMark = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 50, y - 50, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 20, y - 20, 40, 40);
    };

    const regOffset = 100;
    drawRegMark(regOffset, regOffset);
    drawRegMark(CANVAS_WIDTH - regOffset, regOffset);
    drawRegMark(regOffset, CANVAS_HEIGHT - regOffset);
    drawRegMark(CANVAS_WIDTH - regOffset, CANVAS_HEIGHT - regOffset);

    // 3. Draw Header text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TypeForge Drawing Template', CANVAS_WIDTH / 2, MARGIN - 50);

    // 4. Calculate Grid (8 columns x 13 rows = 104 boxes)
    const cols = 8;
    const rows = 13;
    const gridWidth = CANVAS_WIDTH - (MARGIN * 2);
    const gridHeight = CANVAS_HEIGHT - (MARGIN * 2);
    const cellW = gridWidth / cols;
    const cellH = gridHeight / rows;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(MARGIN, MARGIN, gridWidth, gridHeight);

    // Draw inner grid lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#dddddd';
    
    // Draw cells
    let charIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = MARGIN + c * cellW;
        const y = MARGIN + r * cellH;

        // Draw cell border
        ctx.strokeStyle = '#aaaaaa';
        ctx.strokeRect(x, y, cellW, cellH);

        // Draw inner guides (Baseline 60%, X-height 35%, Cap-height 15%, Descender 85%)
        ctx.strokeStyle = '#e2e8f0'; // light gray dashed
        ctx.setLineDash([10, 10]);
        
        // Cap-height / Upper limit
        ctx.beginPath();
        ctx.moveTo(x, y + cellH * 0.15);
        ctx.lineTo(x + cellW, y + cellH * 0.15);
        ctx.stroke();

        // X-height
        ctx.beginPath();
        ctx.moveTo(x, y + cellH * 0.35);
        ctx.lineTo(x + cellW, y + cellH * 0.35);
        ctx.stroke();

        // Baseline (Make this one slightly darker/solid so they know which is the floor)
        ctx.strokeStyle = '#cbd5e1';
        ctx.setLineDash([]); // solid line for baseline
        ctx.beginPath();
        ctx.moveTo(x, y + cellH * 0.6);
        ctx.lineTo(x + cellW, y + cellH * 0.6);
        ctx.stroke();

        // Descender / Lower limit
        ctx.strokeStyle = '#e2e8f0'; // back to dashed
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(x, y + cellH * 0.85);
        ctx.lineTo(x + cellW, y + cellH * 0.85);
        ctx.stroke();

        // Reset dash
        ctx.setLineDash([]);

        // Draw character label if available
        if (charIndex < ALPHABET.length) {
          const char = ALPHABET[charIndex];
          ctx.fillStyle = '#cbd5e1'; // very faint text
          ctx.font = 'bold 80px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(char, x + 20, y + 80);
          charIndex++;
        }
      }
    }

    // Resolve as PNG Blob
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

