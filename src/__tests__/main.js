import test from 'ava';
import { resembleImage, improvedResembleImage } from '../main';

const image = '../../docs/waves.jpg';

test('resembleImage() with a fidelity of 4 stops', t => resembleImage(image, { fidelity: 4 }).then((stops) => {
    t.deepEqual(stops, [
        { color: '#023d33', position: 0 },
        { color: '#036357', position: 25 },
        { color: '#91aaa5', position: 50 },
        { color: '#cdcfd5', position: 75 },
    ]);
}));

test('improvedResembleImage() with a fidelity of 4 stops', t => improvedResembleImage(image, { fidelity: 4 }).then((stops) => {
    t.deepEqual(stops, [
        { color: '#043630', position: 9.77 },
        { color: '#02554b', position: 33.79 },
        { color: '#c4c6dd', position: 67.97 },
        { color: '#c4c6dd', position: 95.31 },
    ]);
}));
