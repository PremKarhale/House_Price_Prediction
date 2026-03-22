from pydantic import BaseModel, Field, field_validator, computed_field
from typing import Optional, List, Literal
import json

with open("location_map.json", "r") as f:
    LOCATION_MAP = json.load(f)

with open("facing_map.json", "r") as f:
    FACING_MAP = json.load(f)

with open("amenity_map.json", "r") as f:
    AMENITY_MAP = json.load(f)

VALID_LOCATIONS = list(LOCATION_MAP.keys())
VALID_FACINGS = list(FACING_MAP.keys())

LUXURY_LOCS = [
    "golf course road", "dlf phase 1", "dlf phase 2",
    "dlf phase 4", "nirvana country", "sushant lok", "sector 66"
]

FURNISH_OPTIONS = ["Unfurnished", "Semi-furnished", "Furnished"]

AGE_OPTIONS = {
    "Within 6 months": 0.25,
    "0 to 1 Year Old": 0.5,
    "1 to 5 Year Old": 3.0,
    "5 to 10 Year Old": 7.5,
    "10+ Year Old": 12.0,
}


class UserInput(BaseModel):
    """
    Takes 13 user inputs with validation.
    Computes all 42 model features automatically.
    """

    # --- 13 User Inputs ---
    location: str = Field(..., description="Location/area name", examples=["dlf phase 2", "sector 45"])
    area: float = Field(..., gt=100, lt=50000, description="Area in sq.ft")
    bedrooms: int = Field(..., ge=1, le=10, description="Number of bedrooms")
    bathrooms: int = Field(..., ge=1, le=10, description="Number of bathrooms")
    balconies: int = Field(..., ge=0, le=5, description="Number of balconies")
    floor_num: float = Field(..., ge=0, le=50, description="Floor number")
    furnish_level: Literal["Unfurnished", "Semi-furnished", "Furnished"] = Field(
        ..., description="Furnishing level"
    )
    age_possession: Literal[
        "Within 6 months", "0 to 1 Year Old", "1 to 5 Year Old",
        "5 to 10 Year Old", "10+ Year Old"
    ] = Field(..., description="Age of property")
    facing: str = Field(default="Unknown", description="Direction the house faces")
    society: str = Field(default="independent", description="Society/builder name")

    # Extra rooms as checkboxes
    servant_room: bool = Field(default=False)
    pooja_room: bool = Field(default=False)
    study_room: bool = Field(default=False)
    store_room: bool = Field(default=False)

    # Nearby amenities as checkboxes
    metro: bool = Field(default=False)
    near_hospital: bool = Field(default=False)
    near_school: bool = Field(default=False)
    near_mall: bool = Field(default=False)
    near_bank: bool = Field(default=False)

    # Amenity count is now computed internally

    # --- Validators ---
    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in LOCATION_MAP:
            return "rare"
        return v

    @field_validator("facing")
    @classmethod
    def validate_facing(cls, v: str) -> str:
        v = v.strip()
        if v not in FACING_MAP:
            return "Unknown"
        return v

    @field_validator("society")
    @classmethod
    def validate_society(cls, v: str) -> str:
        return v.strip() if v else "independent"

    # --- Computed Fields (backend auto-generates these) ---

    @computed_field
    @property
    def location_target(self) -> float:
        return LOCATION_MAP.get(self.location, 3.5)

    @computed_field
    @property
    def is_premium_loc(self) -> int:
        return 1 if self.location in LUXURY_LOCS else 0

    @computed_field
    @property
    def is_rare(self) -> int:
        return 1 if self.location == "rare" else 0

    @computed_field
    @property
    def facing_encoded(self) -> float:
        return FACING_MAP.get(self.facing, 3.5)

    @computed_field
    @property
    def no_facing(self) -> int:
        return 1 if self.facing == "Unknown" else 0

    @computed_field
    @property
    def agePossession_num(self) -> float:
        return AGE_OPTIONS.get(self.age_possession, 3.0)

    @computed_field
    @property
    def Total_extra_rooms(self) -> int:
        return int(self.servant_room) + int(self.pooja_room) + int(self.study_room) + int(self.store_room)

    @computed_field
    @property
    def no_extra_room(self) -> int:
        return 1 if self.Total_extra_rooms == 0 else 0

    @computed_field
    @property
    def amenity_count(self) -> int:
        soc = self.society.lower().strip() if self.society else "independent"
        return AMENITY_MAP.get(soc, 8)  # Defaulting 8 amenities if society is unknown

    @computed_field
    @property
    def zero_amenities(self) -> int:
        return 1 if self.amenity_count == 0 else 0

    @computed_field
    @property
    def lux_home_bedrooms(self) -> int:
        return 1 if self.bedrooms > 5 else 0

    @computed_field
    @property
    def lux_home_bathrooms(self) -> int:
        return 1 if self.bathrooms > 6 else 0

    @computed_field
    @property
    def bedroom_density(self) -> float:
        import numpy as np
        area_log = np.log1p(self.area)
        return self.bedrooms / area_log if area_log > 0 else 0

    @computed_field
    @property
    def lifestyle_score(self) -> float:
        return int(self.near_hospital) + int(self.near_bank) + 5.0 + 5.0  # defaults for connectivity + safety

    @computed_field
    @property
    def bed_loc_interaction(self) -> float:
        return self.bedrooms * self.location_target

    @computed_field
    @property
    def area_bed_loc(self) -> float:
        import numpy as np
        return np.log1p(self.area) * self.bedrooms * self.location_target

    @computed_field
    @property
    def area_per_bedroom(self) -> float:
        import numpy as np
        return np.log1p(self.area) / (self.bedrooms + 1)

    @computed_field
    @property
    def bath_bed_ratio(self) -> float:
        return self.bathrooms / (self.bedrooms + 1)

    @computed_field
    @property
    def premium_score(self) -> float:
        return (
            self.is_premium_loc * 3
            + self.amenity_count * 0.5
            + self.Total_extra_rooms
            + self.lux_home_bedrooms * 2
        )

    @computed_field
    @property
    def loc_amenity(self) -> float:
        return self.location_target * self.amenity_count

    @computed_field
    @property
    def total_rooms(self) -> int:
        return self.bedrooms + self.bathrooms + self.balconies + self.Total_extra_rooms


class PredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted price in Lacs")
    location: str
    area: float
    bedrooms: int
    furnish_level: str