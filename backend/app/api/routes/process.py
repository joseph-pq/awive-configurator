from fastapi import APIRouter, UploadFile, File, Depends
import numpy as np
from typing import AsyncGenerator
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
CAMERA_CONFIGS = {
    "cameraA": {
        "camera_matrix": [
            [2343.874030606418, 0, 1750.257150554386],
            [0, 2337.355572222067, 987.3723075141146],
            [0, 0, 1],
        ],
        "dist_coeffs": [
            -0.45835142200388956,
            0.45271600570178333,
            0.0023286643488378066,
            -0.0018160985370820142,
            -0.2349399150200533,
        ],
    }
}


async def get_temp_dir() -> AsyncGenerator[str, None]:
    tempdir = tempfile.TemporaryDirectory()
    try:
        yield tempdir.name
    finally:
        del tempdir


@router.post("/undistort/")
async def undistort_image(
    file: UploadFile = File(...),
    camera: str = Form(...),
    tempdir: str = Depends(get_temp_dir),
) -> FileResponse:
    # load image
    if file.filename is None:
        raise ValueError("No file provided")
    file_ext: str = file.filename.split(".")[-1]
    image_dp = Path(tempdir)
    image_fp = image_dp / f"0001.{file_ext}"
    with open(image_fp, "wb") as image_file:
        image_file.write(await file.read())
    image = cv2.imread(str(image_fp))
    if image is None:
        raise ValueError("No image found")
    # undistort
    camera_matrix = np.array(CAMERA_CONFIGS[camera]["camera_matrix"])
    dist_coeffs = np.array(CAMERA_CONFIGS[camera]["dist_coeffs"])
    height, width = image.shape[:2]
    new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(
        camera_matrix,
        dist_coeffs,
        (width, height),
        1,
        (width, height),
    )

    map1, map2 = cv2.initUndistortRectifyMap(
        camera_matrix,
        dist_coeffs,
        None,
        new_camera_matrix,
        (width, height),
        cv2.CV_16SC2,
    )
    undistorted = cv2.remap(image, map1, map2, cv2.INTER_LINEAR)
    x, y, w, h = roi
    undistorted_image = undistorted[y : y + h, x : x + w]
    # save image
    cv2.imwrite("undistorted_image.png", undistorted_image)
    return FileResponse(
        "undistorted_image.png",
        media_type="image/png",
        filename="undistorted_image.png",
    )


@router.post("/crop/")
async def crop_image(
    file: UploadFile = File(...),
    x1: str = Form(...),
    y1: str = Form(...),
    x2: str = Form(...),
    y2: str = Form(...),
    tempdir: str = Depends(get_temp_dir),
) -> FileResponse:
    if file.filename is None:
        raise ValueError("No file provided")
    file_ext: str = file.filename.split(".")[-1]
    image_dp = Path(tempdir)
    image_fp = image_dp / f"0001.{file_ext}"
    with open(image_fp, "wb") as image_file:
        image_file.write(await file.read())
    image = cv2.imread(str(image_fp))
    if image is None:
        raise ValueError("No image found")
    x1_, y1_, x2_, y2_ = int(float(x1)), int(float(y1)), int(float(x2)), int(float(y2))
    cropped_image = image[y1_:y2_, x1_:x2_]
    cv2.imwrite("cropped_image.png", cropped_image)
    return FileResponse(
        "cropped_image.png",
        media_type="image/png",
        filename="cropped_image.png",
    )


@router.post("/rotate/")
async def rotate_image(
    file: UploadFile = File(...),
    rotation: str = Form(...),
    tempdir: str = Depends(get_temp_dir),
) -> FileResponse:
    if file.filename is None:
        raise ValueError("No file provided")

    # Save uploaded file
    file_ext: str = file.filename.split(".")[-1]
    image_dp = Path(tempdir)
    image_fp = image_dp / f"0001.{file_ext}"

    with open(image_fp, "wb") as image_file:
        image_file.write(await file.read())

    # Read the image
    image = cv2.imread(str(image_fp))
    if image is None:
        raise ValueError("Invalid image file")

    a = 1.0  # TODO: idk why is 1.0
    height, width = image.shape[:2]
    image_center = (width / 2, height / 2)
    # getRotationMatrix2D needs coordinates in reverse
    # order (width, height) compared to shape
    rotation_angle = float(rotation)

    rot_mat = cv2.getRotationMatrix2D(image_center, rotation_angle, a)
    # rotation calculates the cos and sin, taking absolutes of those.
    abs_cos = abs(rot_mat[0, 0])
    abs_sin = abs(rot_mat[0, 1])
    # find the new width and height bounds
    bound_w = int(height * abs_sin + width * abs_cos)
    bound_h = int(height * abs_cos + width * abs_sin)
    # subtract old image center (bringing image back to origo) and adding
    # the new image center coordinates
    rot_mat[0, 2] += bound_w / 2 - image_center[0]
    rot_mat[1, 2] += bound_h / 2 - image_center[1]
    bound = (bound_w, bound_h)

    rotated_image = cv2.warpAffine(image, rot_mat, bound)

    # # Save rotated image
    output_fp = "rotated_image.png"
    cv2.imwrite(str(output_fp), rotated_image)

    return FileResponse(
        output_fp,
        media_type="image/png",
        filename="rotated_image.png",
    )


@router.post("/orthorectification/")
async def apply_distortion_correction(
    file: UploadFile = File(...),
    gcps: str = Form(...),
    distances: str = Form(...),
    tempdir: str = Depends(get_temp_dir),
) -> FileResponse:
    # process_input_ = json.loads(process_input)
    # Save the uploaded file to a temporary directory
    if file.filename is None:
        raise ValueError("No file provided")

    file_ext: str = file.filename.split(".")[-1]

    image_dp = Path(tempdir)
    image_fp = image_dp / f"0001.{file_ext}"
    with open(image_fp, "wb") as image_file:
        image_file.write(await file.read())

    distances_ = {
        # (int(key.split(",")[0]), int(key.split(",")[1])): value
        f"({key.split(',')[0].strip()},{key.split(',')[1].strip()})": value
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
    cv2.imwrite("out.png", image)

    # Return the processed image as a response
    return FileResponse(
        "out.png",
        media_type="image/png",
        filename="processed_image.png",
    )
