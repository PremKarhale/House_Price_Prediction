from fastapi import APIRouter
import pickle
import numpy as np
import pandas as pd
import json

from schemas import UserInput, PredictionResponse, LOCATION_MAP, FACING_MAP

router = APIRouter(
    prefix="",
    tags=["model"]
)

# Load the ML model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# Load society map for encoding
with open("society_map.json", "r") as f:
    SOCIETY_MAP = json.load(f)

# Load defaults for ratings
with open("defaults.json", "r") as f:
    DEFAULTS = json.load(f)


@router.post("/predict", response_model=PredictionResponse)
def predict(data: UserInput):
    """
    Takes 13 user inputs, engineers all 41 features, 
    and returns the predicted house price.
    """

    # Society encoding (inverse frequency)
    society_name = data.society.lower().strip()
    soc_freq = SOCIETY_MAP.get(society_name, 1)
    society_encoded = 1 / soc_freq
    society_israre = 1 if society_name == "rare" or society_name not in SOCIETY_MAP else 0
    is_independent = 1 if society_name == "independent" else 0

    area_log = np.log1p(data.area)

    # Build the feature DataFrame matching X_train column order exactly
    features = pd.DataFrame([{
        "area": area_log,
        "bedRoom": data.bedrooms,
        "bathroom": data.bathrooms,
        "balcony": data.balconies,
        "floorNum": data.floor_num,
        "location_target": data.location_target,
        "is_premium_loc": data.is_premium_loc,
        "is_rare": data.is_rare,
        "effective_area_log": area_log,         # same as area (log-transformed)
        "area_quality": 1,                      # default (plot area)
        "society_encoded": society_encoded,
        "society_israre": society_israre,
        "is_independent": is_independent,
        "Total_extra_rooms": data.Total_extra_rooms,
        "no_extra_room": data.no_extra_room,
        "agePossession_num": data.agePossession_num,
        "metro": int(data.metro),
        "near_hospital": int(data.near_hospital),
        "near_school": int(data.near_school),
        "near_mall": int(data.near_mall),
        "near_bank": int(data.near_bank),
        "furnish_level": data.furnish_level,
        "amenity_count": data.amenity_count,
        "zero_amenities": data.zero_amenities,
        "Environment_rating": DEFAULTS["Environment_rating"],
        "Lifestyle_rating": DEFAULTS["Lifestyle_rating"],
        "Connectivity_rating": DEFAULTS["Connectivity_rating"],
        "Safety_rating": DEFAULTS["Safety_rating"],
        "no_facing": data.no_facing,
        "facing_encoded": data.facing_encoded,
        "lux_home_bedrooms": data.lux_home_bedrooms,
        "lux_home_bathrooms": data.lux_home_bathrooms,
        "bedroom_density": data.bedroom_density,
        "lifestyle_score": data.lifestyle_score,
        "bed_loc_interaction": data.bed_loc_interaction,
        "area_bed_loc": data.area_bed_loc,
        "area_per_bedroom": data.area_per_bedroom,
        "total_rooms": data.total_rooms,
        "bath_bed_ratio": data.bath_bed_ratio,
        "premium_score": data.premium_score,
        "loc_amenity": data.loc_amenity,
    }])

    # Predict — output is linear (in Crores), so no reverse math needed!
    price = float(model.predict(features)[0])

    return PredictionResponse(
        predicted_price=round(price, 2),
        location=data.location,
        area=data.area,
        bedrooms=data.bedrooms,
        furnish_level=data.furnish_level,
    )