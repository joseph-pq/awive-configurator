"""Play  a video."""
import argparse

import cv2
import numpy as np

from awive.correct_image import Formatter
from awive.loader import Loader, make_loader
from awive.config import Config


RESIZE_RATIO = 5


def play(
    loader: Loader,
    formatter: Formatter,
    undistort=True,
    roi=True,
    time_delay=1,
    resize=False,
    wlcrop=None,
    blur=True
) -> None:
    """Plays a video."""
    i: int = 0

    while loader.has_images():
        image = loader.read()
        if undistort:
            image = formatter.apply_distortion_correction(image)
        if roi:
            image = formatter.apply_roi_extraction(image)
        elif wlcrop is not None:
            image = image[wlcrop[0], wlcrop[1]]
        if blur:
            image = cv2.medianBlur(image, 5)
        if resize:
            lil_im = cv2.resize(image, (800, 800))
        else:
            lil_im = image
        cv2.imshow('Video', lil_im)
        # np.save(f'{config.dataset.image_path}/im_{i:04}.npy', lil_im)
        if cv2.waitKey(time_delay) & 0xFF == ord('q'):
            print('Finished by key \'q\'')
            break
        i += 1
    cv2.destroyAllWindows()


def main(
    config_path: str,
    undistort=True,
    roi=True,
    time_delay=1,
    resize=True,
    wlcrop=True,
    blur=True
) -> None:
    """Read configurations and play video."""
    config: Config = Config.from_json(config_path)
    loader: Loader = make_loader(config.dataset)
    formatter = Formatter(config)
    if wlcrop:
        pass
        # roi2 = config.water_level.['roi']
        # wr0 = slice(roi2[0][0], roi2[1][0])
        # wr1 = slice(roi2[0][1], roi2[1][1])
        # crop = (wr0, wr1)
        crop= None
    else:
        crop = None
    play(loader, formatter, undistort, roi, time_delay, resize, crop, blur)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-u',
        '--undistort',
        action='store_true',
        help='Format image using distortion correction'
    )
    parser.add_argument(
        "config_path",
        help="Path to configuration file path",
    )
    parser.add_argument(
        '-r',
        '--roi',
        action='store_true',
        help='Format image using selecting only roi area'
    )
    parser.add_argument(
        '-c',
        '--wlcrop',
        action='store_true',
        help='Water level crop'
    )
    parser.add_argument(
        '-b',
        '--blur',
        action='store_true',
        help='Blur image'
    )
    parser.add_argument(
        '-z',
        '--resize',
        action='store_true',
        help='Resizer image to 1000x1000'
    )
    parser.add_argument(
        '-t',
        '--time',
        default=1,
        type=int,
        help='Time delay between each frame (ms)'
    )
    args = parser.parse_args()
    main(
        config_path=args.config_path,
        undistort=args.undistort,
        roi=args.roi,
        time_delay=args.time,
        resize=args.resize,
        wlcrop=args.wlcrop,
        blur=args.blur,
    )
