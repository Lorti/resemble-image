import Jimp from 'jimp';
import { palette as quant } from 'neuquant-js';

function roundNumber(number, precision) {
    const magnitude = 10 ** precision;
    return Math.round(number * magnitude) / magnitude;
}

function rgbToHex({ r, g, b }) {
    function convert(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    return `#${convert(r)}${convert(g)}${convert(b)}`;
}

function findClosest(palette, r, g, b) {
    let minPos = 0;
    let minD = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < palette.length; i += 3) {
        const dR = r - palette[i];
        const dG = g - palette[i + 1];
        const dB = b - palette[i + 2];
        const d = (dR * dR) + (dG * dG) + (dB * dB);

        if (d < minD) {
            minD = d;
            minPos = Math.floor((i + 2) / 3);
        }
    }

    return minPos;
}

export function getEqualWidthStops(path, { fidelity }) {
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

            for (let i = 0; i < width; i += chunk) {
                const color = image.clone()
                    .crop(i, 0, chunk, height)
                    .resize(1, 1, Jimp.RESIZE_BICUBIC)
                    .getPixelColor(0, 0);

                stops.push({
                    color: rgbToHex(Jimp.intToRGBA(color)),
                    position: roundNumber(i * 100 / width, 2),
                });
            }

            return resolve(stops);
        });
    });
}

export function getVariableWidthStops(path, { fidelity }) {
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
                const colorIndex = findClosest(
                    palette,
                    this.bitmap.data[idx],
                    this.bitmap.data[idx + 1],
                    this.bitmap.data[idx + 2],
                );
                this.bitmap.data[idx] = palette[colorIndex * 3];
                this.bitmap.data[idx + 1] = palette[(colorIndex * 3) + 1];
                this.bitmap.data[idx + 2] = palette[(colorIndex * 3) + 2];
            });

            strip.resize(256, 1, Jimp.RESIZE_BICUBIC);

            const groups = [];
            let previous = '#';

            for (let x = 0; x < strip.bitmap.width; x++) {
                const color = rgbToHex(Jimp.intToRGBA(strip.getPixelColor(x, 0)));
                if (color !== previous) {
                    groups.push({
                        color,
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
                previous = color;
            }

            const weighted = groups.sort((a, b) => a.weight - b.weight);

            const sorted = weighted.slice(-fidelity).sort((a, b) => a.center - b.center);

            const stops = sorted.map(group => ({
                color: group.color,
                position: Math.round(group.center * 100) / 100,
            }));

            return resolve(stops);
        });
    });
}
