# resemble-image

> Provide a gradient fallback for an image that loosely resembles the original.

This package contains the algorithms `resembleImage` and `improvedResembleImage` as described in [Thoughts on Linear Gradients That Resemble Images.][3]

```
npm install resemble-image --save-dev
```

```
import { resembleImage, improvedResembleImage } from 'resemble-image';
```

```
var resembleImage = require('resemble-image').resembleImage;
var improvedResembleImage = require('resemble-image').improvedResembleImage;
```

The functions return promises, which resolve in an array of color–position pairs.
```
resembleImage(image, { stops: 4 }).then((stops) => console.log(stops));
// [ { color: '#023d33', position: 0 },
//   { color: '#036357', position: 25 },
//   { color: '#91aaa5', position: 50 },
//   { color: '#cdcfd5', position: 75 } ]

improvedResembleImage(image, { stops: 4, palette: 16, intermediate: 256 }).then((stops) => console.log(stops));
// [ { color: '#043630', position: 9.77 },
//   { color: '#02554b', position: 33.79 },
//   { color: '#c4c6dd', position: 67.97 },
//   { color: '#c4c6dd', position: 95.31 } ]
```

## Documentation
* [Ben Briggs' `postcss-resemble-image`][1]
* [Improving Perceived Performance with Multiple Background Images][2]
* [Thoughts on Linear Gradients That Resemble Images][3]

[1]: https://github.com/ben-eb/postcss-resemble-image
[2]: http://csswizardry.com/2016/10/improving-perceived-performance-with-multiple-background-images/
[3]: https://manu.ninja/thoughts-on-linear-gradients-that-resemble-images
