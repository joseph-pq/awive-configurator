from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from awive.preprocess.correct_image import Formatter
from pathlib import Path
import tempfile
from awive.loader import Loader, make_loader
from awive.config import Dataset as DatasetConfig, ConfigGcp
from app.models import ProcessPublic, ProcessInput

router = APIRouter(prefix="/process", tags=["process"])


@router.post("/", response_model=ProcessPublic)
async def apply_distortion_correction(
    process_input: ProcessInput,
    file: UploadFile = File(...),
) -> FileResponse:
    # Save the uploaded file to a temporary directory
    if file.filename is None:
        raise ValueError("No file provided")
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=Path(file.filename).suffix
    ) as temp_file:
        temp_file.write(await file.read())
        image_dp = Path(temp_file.name)

    dataset_config = DatasetConfig(
        image_dataset_dp=image_dp,
        gcp=ConfigGcp(
            pixels=process_input.gcps,
            distances=process_input.distances,
            apply=True,
        ),
    )
    loader: Loader = make_loader(dataset_config)
    formatter = Formatter(config)
    image = loader.read()
    image = formatter.apply_distortion_correction(image)

    # Save the processed image to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as processed_file:
        processed_image.save(processed_file.name)
        processed_image_path = processed_file.name

    # Return the processed image as a response
    return FileResponse(processed_image_path, media_type="image/png", filename="processed_image.png")
