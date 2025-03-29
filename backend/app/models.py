from typing_extensions import Self
from pydantic import BaseModel, Field, model_validator


class ProcessInput(BaseModel):
    gcps: list[tuple[int, int]] = Field(
        ...,
        examples=[[(0, 0), (0, 0), (0, 0), (0, 0)]],
    )
    distances: dict[tuple[int, int], float] = Field(
        ...,
        examples=[
            {
                (0, 1): 1.0,
                (1, 2): 2.0,
                (2, 3): 3.0,
                (3, 0): 4.0,
            }
        ],
    )

    @model_validator(mode="after")
    def check_gcps_and_distances(self) -> Self:
        if len(self.gcps) != len(self.distances):
            raise ValueError(
                "gcps and distances must have the same number of elements."
            )

        # Check if the keys in distances are tuples of indexes in gcps
        for key in self.distances.keys():
            if not (isinstance(key, tuple) and len(key) == 2):
                raise ValueError(
                    "Each key in distances must be a tuple of two indexes."
                )
            if not all(
                isinstance(index, int) and 0 <= index < len(self.gcps) for index in key
            ):
                raise ValueError(
                    "Each index in distances keys must be a valid index in gcps."
                )
        return self
