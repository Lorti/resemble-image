import Jimp from 'jimp';
import {palette as quant} from 'neuquant-js';

function scaleValue (value, min, max) {
    const newMin = 0;
    const newMax = 100;
    const percent = (value - min) / (max - min);
    return percent * (newMax - newMin) + newMin;
}

function colourStopFactory (width) {
    return function colourStop (colour, index) {
        return {
            colour,
            position: scaleValue(index, 0, width),
        };
    };
}

function rgbToHex ({r, g, b}) {
    function convert (c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    return '#' + convert(r) + convert(g) + convert(b);
}

function findClosest (palette, r, g, b) {
    let minPos = 0;
    let minD = Number.MAX_SAFE_INTEGER;

    for (let i = 0, l = palette.length; i < l;) {
        const dR = r - palette[i++];
        const dG = g - palette[i++];
        const dB = b - palette[i];
        const d = dR * dR + dG * dG + dB * dB;

        if (d < minD) {
            minD = d;
            minPos = i / 3 | 0;
        }

        i++;
    }

    return minPos;
}

export function resembleImage (path, {fidelity}) {
    return new Promise((resolve, reject) => {
        Jimp.read(path, (err, image) => {
            if (err) {
                reject(err);
            }
            let width;
            let height;
            let chunk;
            try {
                width = image.bitmap.width;
                height = image.bitmap.height;
                chunk = width / fidelity;
            } catch (e) {
                return reject(e);
            }
            const stops = [];
            const colourStop = colourStopFactory(width);
            for (let i = 0; i < width; i += chunk) {
                let colour = image.clone()
                    .crop(i, 0, chunk, height)
                    .resize(1, 1, Jimp.RESIZE_BICUBIC)
                    .getPixelColor(0, 0);
                colour = rgbToHex(Jimp.intToRGBA(colour));
                stops.push(colourStop(colour, i));
            }
            return resolve(stops);
        });
    });
}

export function improvedResembleImage (path) {
    return new Promise((resolve, reject) => {
        Jimp.read(path, (err, image) => {
            if (err) {
                reject(err);
            }

            let strip;

            try {
                strip = image.clone().resize(256, 4, Jimp.RESIZE_BICUBIC);
            } catch (e) {
                return reject(e);
            }

            const palette = quant(strip.bitmap.data, {
                netsize: 16,
                samplefac: 10,
            });

            strip.scan(0, 0, strip.bitmap.width, strip.bitmap.height, function (x, y, idx) {
                const colourIndex = findClosest(
                    palette,
                    this.bitmap.data[idx],
                    this.bitmap.data[idx + 1],
                    this.bitmap.data[idx + 2]
                );
                this.bitmap.data[idx] = palette[colourIndex * 3];
                this.bitmap.data[idx + 1] = palette[colourIndex * 3 + 1];
                this.bitmap.data[idx + 2] = palette[colourIndex * 3 + 2];
            });

//            strip.write('quantized.png');

            strip.resize(256, 1, Jimp.RESIZE_BICUBIC);

//            strip.write('strip.png');

            const groups = [];
            let previous = '#';

            for (let x = 0; x < strip.bitmap.width; x++) {
                const colour = rgbToHex(Jimp.intToRGBA(strip.getPixelColor(x, 0)));
                if (colour !== previous) {
                    groups.push({
                        colour: colour,
                        pixels: [x],
                        weight: 1,
                        center: x / strip.bitmap.width,
                    });
                } else {
                    const group = groups[groups.length - 1];
                    group.pixels.push(x);
                    group.weight += 1;
                    group.center = 100 * (group.pixels.reduce((a, b) => a + b) / group.weight) / strip.bitmap.width;
                }
                previous = colour;
            }

            const weighted = groups.sort((a, b) => a.weight - b.weight);

            const sorted = weighted.slice(-4).sort((a, b) => a.center - b.center);

            const stops = sorted.map((group) => {
                return {
                    colour: group.colour,
                    position: Math.round(group.center * 100) / 100,
                };
            });

            return resolve(stops);
        });
    });
}
