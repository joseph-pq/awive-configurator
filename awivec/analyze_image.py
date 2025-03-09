"""Analyze image savig it as numpy file."""

import argparse
import logging

from awive.config import Config
from awive.correct_image import Formatter
from awive.loader import Loader, make_loader
import cv2
import matplotlib.pyplot as plt
from npyplotter.plot_npy import picshow
import numpy as np


LOG = logging.getLogger(__name__)


def main(
    config_path: str,
    entire_frame=False,
    undistort=True,
    roi=True,
    get_frame=True,
    plot=False
) -> None:
    """Save the first image as numpy file."""
    config = Config.from_json(config_path)
    loader: Loader = make_loader(config.dataset)
    formatter = Formatter(config)
    image: np.ndarray = loader.read()
    if get_frame:
        cv2.imwrite("image.png", image)
    if entire_frame:
        formatter.show_entire_image()
    if undistort:
        image = formatter.apply_distortion_correction(image)
    if roi:
        image = formatter.apply_roi_extraction(image)
    if get_frame:
        cv2.imwrite("image.png", image)
    np.save("tmp.npy", image)
    if plot:
        LOG.info("Plotting image")
        picshow([image])
        plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        usage="python -m awive.analyze_image examples/datasets/river-brenta/config.json d0000 -P",
        description=(
            "Analyze image savig it as numpy file.\n"
            "Order of processing:\n"
            " 1. Crop image using gcp.pixels parameter\n"
            " 2. If enabled, lens correction using preprocessing.image_correction\n"
            " 3. Orthorectification using relation gcp.pixels and gcp.real\n"
            " 4. Pre crop\n"
            " 5. Rotation\n"
            " 6. Crop\n"
            " 7. Convert to gray scale\n"
        ),
    )
    parser.add_argument(
        "config_path",
        help="Path to configuration file path",
    )
    parser.add_argument(
        "-f",
        "--frame",
        action="store_true",
        help="Plot entire frame or not")
    parser.add_argument(
        "-u",
        "--undistort",
        action="store_true",
        help="Format image using distortion correction")
    parser.add_argument(
        "-g",
        "--getframe",
        action="store_true",
        help="Get first frame")
    parser.add_argument(
        "-r",
        "--roi",
        action="store_true",
        help="Format image using selecting only roi area")
    parser.add_argument(
        "-P",
        "--plot",
        action="store_true",
        help="Plot output image")
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Enable debug mode"
    )
    args = parser.parse_args()
    logging.getLogger("matplotlib.font_manager").disabled = True
    logging.getLogger("PIL.PngImagePlugin").disabled = True
    logging.getLogger("matplotlib.pyplot").disabled = True
    logging.basicConfig(
        level=logging.DEBUG if args.debug else logging.INFO,
        format="%(asctime)s | %(levelname).1s | %(name).20s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    main(
        config_path=args.config_path,
        entire_frame=args.frame,
        undistort=args.undistort,
        roi=args.roi,
        get_frame=args.getframe,
        plot=args.plot
    )
