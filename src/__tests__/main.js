import test from 'ava';
import {resembleImage, improvedResembleImage} from '../main';

const image = '../../docs/waves.jpg';

test('resembleImage() with a fidelity of 4 stops', t => {
    return resembleImage(image, {fidelity: 4}).then(stops => {
        t.deepEqual(stops, [
            {colour: '#023d33', position: 0},
            {colour: '#036357', position: 25},
            {colour: '#91aaa5', position: 50},
            {colour: '#cdcfd5', position: 75},
        ]);
    });
});

test('improvedResembleImage() with a fidelity of 4 stops', t => {
    return improvedResembleImage(image, {fidelity: 4}).then(stops => {
        t.deepEqual(stops, [
            {colour: '#043630', position: 9.77},
            {colour: '#02554b', position: 33.79},
            {colour: '#c4c6dd', position: 67.97},
            {colour: '#c4c6dd', position: 95.31},
        ]);
    });
});
