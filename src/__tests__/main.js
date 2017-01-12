import test from 'ava';
import { getEqualWidthStops, getVariableWidthStops } from '../main';

const image = 'waves.jpg';
const text = '../README.md';

function assertRejection(t, promise) {
    promise.then(null, (error) => {
        t.truthy(error.length);
    });
}

function assertColorStops(t, promise, expected) {
    promise.then((stops) => {
        t.deepEqual(stops.length, expected);
        stops.forEach((stop) => {
            t.truthy(/^#[0-9a-f]{6}$/i.test(stop.color));
        });
    });
}

test('getEqualWidthStops() with a fidelity of 4 stops', (t) => {
    getEqualWidthStops(image, { fidelity: 4 }).then((stops) => {
        t.deepEqual(stops, [
            { color: '#023d33', position: 0 },
            { color: '#036357', position: 25 },
            { color: '#91aaa5', position: 50 },
            { color: '#cdcfd5', position: 75 },
        ]);
    });
});

test('getVariableWidthStops() with a fidelity of 4 stops', (t) => {
    getVariableWidthStops(image, { fidelity: 4 }).then((stops) => {
        t.deepEqual(stops, [
            { color: '#043630', position: 9.77 },
            { color: '#02554b', position: 33.79 },
            { color: '#c4c6dd', position: 67.97 },
            { color: '#c4c6dd', position: 95.31 },
        ]);
    });
});

test('getEqualWidthStops() with a fidelity of 8 stops',
    assertColorStops,
    getEqualWidthStops(image, { fidelity: 8 }),
    8,
);

test('getVariableWidthStops() with a fidelity of 8 stops',
    assertColorStops,
    getVariableWidthStops(image, { fidelity: 8 }),
    8,
);

test('should throw when opening an unreadable file', (t) => {
    t.throws(getEqualWidthStops(text, {}));
    t.throws(getVariableWidthStops(text, {}));
});

test('should error when passing a weird fidelity', assertRejection, getEqualWidthStops(image, { fidelity: 0 }));
test('should error when passing a weird fidelity', assertRejection, getVariableWidthStops(image, { fidelity: 0 }));

test('should error when passing no fidelity', assertRejection, getEqualWidthStops(image, {}));
test('should error when passing a NaN fidelity', assertRejection, getEqualWidthStops(image, { fidelity: 'Test' }));
test('should error when passing a negative fidelity', assertRejection, getEqualWidthStops(image, { fidelity: -64 }));
test('should error when passing an exaggerated fidelity', assertRejection, getEqualWidthStops(image, { fidelity: 64 }));
