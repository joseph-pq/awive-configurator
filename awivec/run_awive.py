import numpy as np
import typer
from awive.config import Config
from awive.correct_image import Formatter
from awive.loader import Loader, make_loader
from awive.otv import OTV
from typing_extensions import Annotated


def run_otv(
    config_path: Annotated[str, typer.Argument(help="Path to configuration file path")],
    show_video: Annotated[bool, typer.Option(help="Show video")] = False,
    debug: Annotated[int, typer.Option(help="Debug level")] = 0,
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
    config = Config.from_json(config_path)
    loader: Loader = make_loader(config.dataset)
    formatter = Formatter(config)
    image: np.ndarray = loader.read()
    prev_gray = formatter.apply_distortion_correction(image)
    prev_gray = formatter.apply_roi_extraction(prev_gray)
    otv = OTV(config, prev_gray, debug)
    x = otv.run(loader, formatter, show_video)
    for key, value in x.items():
        print(
            f"{key}: velocity: {round(value['velocity'], 4)}, count: {value['count']}"
        )


if __name__ == "__main__":
    typer.run(run_otv)
