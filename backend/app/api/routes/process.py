from fastapi import APIRouter, UploadFile, File
import json
import cv2
from fastapi.responses import FileResponse
from awive.preprocess.correct_image import Formatter
from fastapi import Form
from pathlib import Path
import tempfile
from awive.loader import Loader, make_loader
from awive.config import (
    Dataset as DatasetConfig,
    ConfigGcp,
    PreProcessing as PreProcessingConfig,
    ImageCorrection,
)

router = APIRouter(prefix="/process", tags=["process"])


@router.post("/")
async def apply_distortion_correction(
    file: UploadFile = File(...),
    gcps: str = Form(...),
    distances: str = Form(...),
) -> FileResponse:
    # process_input_ = json.loads(process_input)
    # Save the uploaded file to a temporary directory
    if file.filename is None:
        raise ValueError("No file provided")

    file_ext: str = file.filename.split(".")[-1]

    with tempfile.TemporaryDirectory() as image_dp_:
        image_dp = Path(image_dp_)
        image_fp = image_dp / f"0001.{file_ext}"
        with open(image_fp, "wb") as image_file:
            image_file.write(await file.read())

        distances_ = {
            (int(key.split(",")[0]), int(key.split(",")[1])): value
            for key, value in json.loads(distances).items()
        }
        pixels = [(int(gcp[0]), int(gcp[1])) for gcp in json.loads(gcps)]

        dataset_config = DatasetConfig(
            image_dataset_dp=image_dp,
            image_suffix=file_ext,  # type: ignore[arg-type]
            gcp=ConfigGcp(
                pixels=pixels,
                distances=distances_,
                apply=True,
            ),
        )
        loader: Loader = make_loader(dataset_config)
        formatter = Formatter(
            dataset_config,
            PreProcessingConfig(
                pre_roi=((0, 0), (0, 0)),
                roi=((0, 0), (0, 0)),
                image_correction=ImageCorrection(apply=False, k1=0.1, c=0, f=0.1),
            ),
        )
        image = loader.read()
        if image is None:
            raise ValueError("No image found")
        image = formatter.apply_distortion_correction(image)

        # Save the processed image to a temporary file
        # out_fp = Path(image_dp) / f"processed_image.{file.filename.split('.')[-1]}"
        cv2.imwrite("out.png", image)

        # Return the processed image as a response
        return FileResponse(
            "out.png",
            media_type="image/png",
            filename="processed_image.png",
        )
