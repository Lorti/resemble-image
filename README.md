# resemble-image

> Provide a gradient fallback for an image that loosely resembles the original.

This package contains the algorithms described in [Thoughts on Linear Gradients That Resemble Images][3].

```
npm install resemble-image --save-dev
```

```
import { resembleImage, improvedResembleImage } from 'resemble-image';
resembleImage(image, { stops: 4 }).then((stops) => console.log(stops));
improvedResembleImage(image, { stops: 4, palette: 16, intermediate: 256 }).then((stops) => console.log(stops));
```

## Documentation
* [Ben Briggs' `postcss-resemble-image`][1]
* [Improving Perceived Performance with Multiple Background Images][2]
* [Thoughts on Linear Gradients That Resemble Images][3]

[1]: https://github.com/ben-eb/postcss-resemble-image
[2]: http://csswizardry.com/2016/10/improving-perceived-performance-with-multiple-background-images/
[3]: https://manu.ninja/thoughts-on-linear-gradients-that-resemble-images
