from pathlib import Path
import logging
import typer
from awive.config import Config
from numpy.typing import NDArray
from awive.preprocess.correct_image import Formatter
from awive.loader import Loader, make_loader
from awive.algorithms.otv import OTV
from awive.algorithms.sti import STIV
from typing_extensions import Annotated


def run_otv(
    config_fp: Annotated[Path, typer.Argument(help="Path to configuration file path")],
    show_video: Annotated[bool, typer.Option(help="Show video")] = False,
    images_dp: Annotated[Path | None, typer.Option(help="Save images")] = None,
    debug: Annotated[bool, typer.Option(help="Debug level")] = False,
    algorithm: Annotated[str, typer.Option(help="otv or stiv")] = "otv",
):
    """Basic example of OTV

    Processing for each frame
        1. Crop image using gcp.pixels parameter
        2. If enabled, lens correction using preprocessing.image_correction
        3. Orthorectification using relation gcp.pixels and gcp.real
        4. Pre crop
        5. Rotation
        6. Crop
        7. Convert to gray scale
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname).1s | %(name).20s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    if debug:
        logging.getLogger("awive.algorithms.otv").setLevel(logging.DEBUG)
        logging.getLogger("awive.algorithms.sti").setLevel(logging.DEBUG)

    config = Config.from_fp(config_fp)
    loader: Loader = make_loader(config.dataset)
    formatter = Formatter(config)
    image: NDArray | None = loader.read()
    if image is None:
        raise ValueError("No image found")
    prev_gray = formatter.apply_distortion_correction(image)
    prev_gray = formatter.apply_roi_extraction(prev_gray)
    prev_gray = formatter.apply_resolution(prev_gray)

    if algorithm == "otv":
        otv = OTV(config, prev_gray, lines=config.lines, formatter=formatter)
        x = otv.run(loader, show_video)
    elif algorithm == "stiv" and config.stiv is not None:
        stiv = STIV(
            config=config.stiv,
            loader=loader,
            lines=config.lines,
            formatter=formatter,
            images_dp=images_dp,
        )
        x = stiv.run()
    else:
        raise ValueError("Algorithm not found")
    for key, value in x.items():
        print(
            f"{key}: "
            f"velocity: {round(value['velocity'], 4)}, "
            f"count: {value.get('count', 0)}, "
            f"position: {value.get('position', 0)}"
        )


if __name__ == "__main__":
    typer.run(run_otv)
