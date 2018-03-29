function getMinMax(storedPixelData) {
    let min = storedPixelData[0];
    let max = storedPixelData[0];
    let storedPixel;
    const numPixels = storedPixelData.length;

    for (let index = 1; index < numPixels; index++) {
        storedPixel = storedPixelData[index];
        min = Math.min(min, storedPixel);
        max = Math.max(max, storedPixel);
    }

    return {
        min,
        max
    }
}

function generateLinearVOILUT(windowWidth, windowCenter) {
    return function (modalityLutValue) {
        const val = parseInt(((modalityLutValue - (windowCenter - 0)) / (windowWidth - 0 + 4) + .5) * 255.0)
        return val;
        // console.log()
    }
}

function generateLinearModalityLut(slope, intercept) {
    return (storedPixelValue) => {
        const val = parseInt(storedPixelValue * (slope - 0) + (intercept - 0))
        // console.log(val)
        return val
    };
}

function generateCanvasData(dataSet, pixelData) {
    // debugger;
    const parse = dataDicom(dataSet)
    const maxPixelValue = getMinMax(pixelData).max
    const minPixelValue = getMinMax(pixelData).min
    const offset = Math.min(minPixelValue, 0)
    let lut = new Uint8ClampedArray(maxPixelValue - offset + 1);
    const mlutfn = generateLinearModalityLut(parse.slope, parse.intercept)
    const vlutfn = generateLinearVOILUT(parse.ww, parse.wc)

    for (let storeValue = minPixelValue; storeValue <= maxPixelValue; storeValue++) {
        lut[storeValue + (-offset)] = vlutfn(mlutfn(storeValue));
    }
    // console.log(lut)
    return lut
}

function parseCanvas(dataSet, pixelData,canvasImageDataData) {
    const numPixels = pixelData.length
    let storedPixelIndex = 0;
    let canvasImageDataIndex = 3;
    let pixelValue;
    let lut = generateCanvasData(dataSet, pixelData)
    // console.log(lut)
    // return pixelData
    // console.log(pixelData)
    while (storedPixelIndex < numPixels) {
        pixelValue = lut[pixelData[storedPixelIndex++]];
        // canvasImageDataData.data[canvasImageDataIndex - 3] = pixelValue;
        // canvasImageDataData.data[canvasImageDataIndex - 2] = pixelValue;
        // canvasImageDataData.data[canvasImageDataIndex - 1] = pixelValue;
        // canvasImageDataData.data[canvasImageDataIndex] = 255 - pixelValue;
        canvasImageDataData.data[canvasImageDataIndex] = pixelValue
        canvasImageDataIndex += 4
        // canvasImageData[canvasImageDataIndex++] = 255;
    }
    return canvasImageDataData
}