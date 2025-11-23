"""Analyze image savig it as numpy file."""

from pathlib import Path
import logging

from numpy.typing import NDArray
from awive.config import Config
from awive.preprocess.correct_image import Formatter
from awive.loader import Loader, make_loader
import cv2
import matplotlib.pyplot as plt
from npyplotter.plot_npy import picshow
import numpy as np
import typer


LOG = logging.getLogger(__name__)


def main(
    config_fp: Path,
    image_fp: Path | None = None,
    entire_frame: bool = False,
    lens: bool = False,
    undistort: bool = False,
    roi: bool = False,
    get_frame: bool = False,
    plot: bool = False,
) -> None:
    """Save the first image as numpy file."""
    config = Config.from_fp(config_fp)
    formatter = Formatter(config.dataset, config.preprocessing)
    if image_fp is None:
        loader: Loader = make_loader(config.dataset)
        print(f"{config.dataset=}")
        image: NDArray | None = loader.read()
    else:
        print(f"Loading image from {image_fp}")
        image = cv2.imread(str(image_fp))
    if image is None:
        raise ValueError("No image found")
    if get_frame:
        cv2.imwrite("image.png", image)
    if entire_frame:
        formatter.show_entire_image()
    if lens:
        image = formatter.apply_lens_correction(image)
        print(f"Lens-corrected shape: {image.shape}")
    if undistort:
        image = formatter.apply_distortion_correction(image)
        print(f"Undistorted shape: {image.shape}")
    if roi:
        image = formatter.apply_roi_extraction(image)
        print(f"ROI shape: {image.shape}")
        # image = formatter.apply_resolution(image)
    if get_frame:
        cv2.imwrite("image.png", image)
    np.save("tmp.npy", image)
    if plot:
        LOG.info("Plotting image")
        picshow([image])
        plt.show()


if __name__ == "__main__":
    typer.run(main)
    # parser = argparse.ArgumentParser(
    #     usage="python -m awive.analyze_image examples/datasets/river-brenta/config.json d0000 -P",
    #     description=(
    #         "Analyze image savig it as numpy file.\n"
    #         "Order of processing:\n"
    #         " 1. Crop image using gcp.pixels parameter\n"
    #         " 2. If enabled, lens correction using preprocessing.image_correction\n"
    #         " 3. Orthorectification using relation gcp.pixels and gcp.real\n"
    #         " 4. Pre crop\n"
    #         " 5. Rotation\n"
    #         " 6. Crop\n"
    #         " 7. Convert to gray scale\n"
    #     ),
    # )
    # parser.add_argument(
    #     "config_path",
    #     help="Path to configuration file path",
    # )
    # parser.add_argument(
    #     "-f", "--frame", action="store_true", help="Plot entire frame or not"
    # )
    # parser.add_argument(
    #     "-u",
    #     "--undistort",
    #     action="store_true",
    #     help="Format image using distortion correction",
    # )
    # parser.add_argument("-g", "--getframe", action="store_true", help="Get first frame")
    # parser.add_argument(
    #     "-r",
    #     "--roi",
    #     action="store_true",
    #     help="Format image using selecting only roi area",
    # )
    # parser.add_argument("-P", "--plot", action="store_true", help="Plot output image")
    # parser.add_argument("-d", "--debug", action="store_true", help="Enable debug mode")
    # args = parser.parse_args()
    # logging.getLogger("matplotlib.font_manager").disabled = True
    # logging.getLogger("PIL.PngImagePlugin").disabled = True
    # logging.getLogger("matplotlib.pyplot").disabled = True
    # logging.basicConfig(
    #     level=logging.DEBUG if args.debug else logging.INFO,
    #     format="%(asctime)s | %(levelname).1s | %(name).20s | %(message)s",
    #     datefmt="%Y-%m-%d %H:%M:%S",
    # )
    # main(
    #     config_fp=args.config_path,
    #     entire_frame=args.frame,
    #     undistort=args.undistort,
    #     roi=args.roi,
    #     get_frame=args.getframe,
    #     plot=args.plot,
    # )
