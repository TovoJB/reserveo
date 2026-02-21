const fs = require('fs');
const path = require('path');

const inputFile = '/home/tovo/Bureau/reserveo/mobile/data/florplan1.excalidraw';
const outputFile = '/home/tovo/Bureau/reserveo/mobile/data/floorplan_data.json';

try {
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const elements = data.elements || [];
    const files = data.files || {};

    const interactiveElements = elements
        .filter(el => !el.isDeleted)
        .map(el => {
            let imageSource = null;
            if (el.type === 'image' && el.fileId && files[el.fileId]) {
                imageSource = files[el.fileId].dataURL;
            }

            return {
                id: el.id,
                type: el.type,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                angle: el.angle,
                backgroundColor: el.backgroundColor,
                strokeColor: el.strokeColor,
                name: el.customData?.name || (el.type === 'image' ? 'Image' : 'Element'),
                price: el.customData?.price,
                workingDays: el.customData?.workingDays,
                children: el.customData?.children,
                imageSource: imageSource,
                opacity: el.opacity,
                locked: el.locked
            };
        });

    // Filter out the background "Miason" or main floor plan image if it's too big or meant to be background
    // Or just keep all and let the UI handle it.

    fs.writeFileSync(outputFile, JSON.stringify(interactiveElements, null, 2));
    console.log(`Success: Exported ${interactiveElements.length} elements to ${outputFile}`);
} catch (err) {
    console.error('Error processing excalidraw file:', err);
}
