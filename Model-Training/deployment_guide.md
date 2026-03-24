# Deployment Guide — From 42 Features to 13 User Inputs

## The Key Insight

Your model needs 42 features, but the **user only provides ~13 simple inputs**. 
Your backend **computes the other 29 features automatically**.

---

## 📋 Feature Origin Map

### 🟢 User Inputs (13 fields — what the user fills in a form)

| # | User Input | Form Type | Example |
|---|---|---|---|
| 1 | **Location** | Dropdown | "DLF Phase 2", "Sector 45", etc. |
| 2 | **Area (sq.ft)** | Number | 1500 |
| 3 | **Bedrooms** | Dropdown (1-10) | 3 |
| 4 | **Bathrooms** | Dropdown (1-8) | 2 |
| 5 | **Balconies** | Dropdown (0-3) | 2 |
| 6 | **Floor Number** | Number | 4 |
| 7 | **Furnish Level** | Dropdown | "Semi-furnished" |
| 8 | **Age/Possession** | Dropdown | "1 to 5 Year Old" |
| 9 | **Facing** | Dropdown | "North", "South", "Unknown" |
| 10 | **Society Name** | Text/Dropdown | "DLF Capital Greens" |
| 11 | **Extra Rooms** | Checkboxes | ☑ Servant ☑ Study ☐ Pooja ☐ Store |
| 12 | **Nearby** | Checkboxes | ☑ Metro ☑ Hospital ☐ School ☑ Mall ☐ Bank |
| 13 | **Amenity Count** | Number/Slider | 8 |

> [!TIP]
> Ratings (Environment, Lifestyle, Connectivity, Safety) can either be asked from the user via sliders (1-10), or set to median defaults if you want to keep the form simpler.

### 🔵 Computed by Backend (29 features — user never sees these)

| Feature | Formula | Computed From |
|---|---|---|
| `location_target` | Lookup from saved dict | Location |
| `is_premium_loc` | 1 if location in luxury list | Location |
| `is_rare` | 1 if location == 'rare' | Location |
| `society_encoded` | Lookup from saved dict | Society |
| `society_israre` | 1 if society == 'rare' | Society |
| `is_independent` | 1 if society == 'independent' | Society |
| `facing_encoded` | Lookup from saved dict | Facing |
| `no_facing` | 1 if facing == 'Unknown' | Facing |
| `Total_extra_rooms` | sum of room checkboxes | Extra Rooms |
| `no_extra_room` | 1 if no rooms checked | Extra Rooms |
| `zero_amenities` | 1 if amenity_count == 0 | Amenity Count |
| `area_quality` | Default to 1 (plot) or ask | — |
| `carpet_eff_missing` | Default to 1 | — |
| `construction_dens_missing` | Default to 1 | — |
| `lux_home_bedrooms` | 1 if bedrooms > 5 | Bedrooms |
| `lux_home_bathrooms` | 1 if bathrooms > 6 | Bathrooms |
| `bedroom_density` | bedRoom / area | Bedrooms, Area |
| `lifestyle_score` | hospital + bank + connectivity + safety | Nearby, Ratings |
| `bed_loc_interaction` | bedRoom × location_target | Bedrooms, Location |
| `area_bed_loc` | area × bedRoom × location_target | Area, Bedrooms, Location |
| `area_per_bedroom` | area / (bedRoom + 1) | Area, Bedrooms |
| `bath_bed_ratio` | bathroom / (bedRoom + 1) | Bathrooms, Bedrooms |
| `premium_score` | premium×3 + amenity×0.5 + extras + lux×2 | Multiple |
| `loc_amenity` | location_target × amenity_count | Location, Amenities |
| `total_rooms` | bed + bath + balcony + extras | Multiple |
| `agePossession_num` | Map from age dropdown | Age/Possession |
| `Environment_rating` | User input or default median | — |
| `Lifestyle_rating` | User input or default median | — |
| `Connectivity_rating` | User input or default median | — |
| `Safety_rating` | User input or default median | — |

---

## 📦 What to Save from Training (artifacts needed for deployment)

```python
import pickle
import json

# 1. The model pipeline
pickle.dump(pipeline_gb, open('model.pkl', 'wb'))

# 2. Location target encoding map
loc_price = df.groupby('location')['price'].mean().to_dict()
json.dump(loc_price, open('location_map.json', 'w'))

# 3. Facing encoding map
facing_dict = df.groupby('facing')['price'].mean().to_dict()  
json.dump(facing_dict, open('facing_map.json', 'w'))

# 4. Society encoding map (inverse frequency)
society_freq = df['society'].value_counts().to_dict()
json.dump(society_freq, open('society_map.json', 'w'))

# 5. Median defaults for ratings (for when user doesn't provide)
defaults = {
    'Environment_rating': float(df['Environment_rating'].median()),
    'Lifestyle_rating': float(df['Lifestyle_rating'].median()),
    'Connectivity_rating': float(df['Connectivity_rating'].median()),
    'Safety_rating': float(df['Safety_rating'].median()),
}
json.dump(defaults, open('defaults.json', 'w'))

print("All artifacts saved ✅")
```

---

## 🖥️ Backend: predict.py

```python
import pickle
import json
import numpy as np
import pandas as pd

# Load artifacts
model = pickle.load(open('model.pkl', 'rb'))
loc_map = json.load(open('location_map.json', 'r'))
facing_map = json.load(open('facing_map.json', 'r'))
society_map = json.load(open('society_map.json', 'r'))
defaults = json.load(open('defaults.json', 'r'))

LUXURY_LOCS = ['golf course road', 'dlf phase 1', 'dlf phase 2', 
               'dlf phase 4', 'nirvana country', 'sushant lok', 'sector 66']

AGE_MAP = {
    'Within 6 months': 0.25,
    '0 to 1 Year Old': 0.5,
    '1 to 5 Year Old': 3,
    '5 to 10 Year Old': 7.5,
    '10+ Year Old': 12,
}

def predict_price(
    location, area, bedrooms, bathrooms, balconies, floor_num,
    furnish_level, age_possession, facing, society,
    servant_room, pooja_room, study_room, store_room,
    metro, near_hospital, near_school, near_mall, near_bank,
    amenity_count,
    env_rating=None, lifestyle_rating=None, 
    connectivity_rating=None, safety_rating=None
):
    """Takes ~13-17 user inputs, engineers all 42 features, returns predicted price."""
    
    # --- Lookups ---
    location_target = loc_map.get(location, np.median(list(loc_map.values())))
    is_premium = 1 if location in LUXURY_LOCS else 0
    is_rare = 1 if location == 'rare' else 0
    
    facing_encoded = facing_map.get(facing, np.median(list(facing_map.values())))
    no_facing = 1 if facing == 'Unknown' else 0
    
    soc_freq = society_map.get(society, 1)
    society_encoded = 1 / soc_freq
    society_israre = 1 if society == 'rare' or society not in society_map else 0
    is_independent = 1 if society == 'independent' else 0
    
    # --- Age ---
    age_num = AGE_MAP.get(age_possession, 3)  # default: 1-5 years
    
    # --- Rooms ---
    total_extra = servant_room + pooja_room + study_room + store_room
    no_extra = 1 if total_extra == 0 else 0
    
    # --- Ratings (use defaults if not provided) ---
    env_r = env_rating or defaults['Environment_rating']
    life_r = lifestyle_rating or defaults['Lifestyle_rating']
    conn_r = connectivity_rating or defaults['Connectivity_rating']
    safe_r = safety_rating or defaults['Safety_rating']
    
    # --- Derived features ---
    area_log = np.log1p(area)
    lux_bed = 1 if bedrooms > 5 else 0
    lux_bath = 1 if bathrooms > 6 else 0
    bedroom_density = bedrooms / area_log if area_log > 0 else 0
    lifestyle_score = near_hospital + near_bank + conn_r + safe_r
    bed_loc = bedrooms * location_target
    area_bed_loc = area_log * bedrooms * location_target
    area_per_bed = area_log / (bedrooms + 1)
    bath_bed = bathrooms / (bedrooms + 1)
    premium_score = is_premium * 3 + amenity_count * 0.5 + total_extra + lux_bed * 2
    loc_amenity = location_target * amenity_count
    total_rooms = bedrooms + bathrooms + balconies + total_extra
    zero_amenities = 1 if amenity_count == 0 else 0
    
    # --- Build feature DataFrame (must match training column order!) ---
    features = pd.DataFrame([{
        'area': area_log,
        'bedRoom': bedrooms,
        'bathroom': bathrooms,
        'balcony': balconies,
        'floorNum': floor_num,
        'location_target': location_target,
        'is_premium_loc': is_premium,
        'is_rare': is_rare,
        'area_quality': 1,               
        'society_encoded': society_encoded,
        'society_israre': society_israre,
        'is_independent': is_independent,
        'Total_extra_rooms': total_extra,
        'no_extra_room': no_extra,
        'agePossession_num': age_num,
        'metro': metro,
        'near_hospital': near_hospital,
        'near_school': near_school,
        'near_mall': near_mall,
        'near_bank': near_bank,
        'furnish_level': furnish_level,
        'amenity_count': amenity_count,
        'zero_amenities': zero_amenities,
        'Environment_rating': env_r,
        'Lifestyle_rating': life_r,
        'Connectivity_rating': conn_r,
        'Safety_rating': safe_r,
        'no_facing': no_facing,
        'facing_encoded': facing_encoded,
        'lux_home_bedrooms': lux_bed,
        'lux_home_bathrooms': lux_bath,
        'bedroom_density': bedroom_density,
        'lifestyle_score': lifestyle_score,
        'bed_loc_interaction': bed_loc,
        'area_bed_loc': area_bed_loc,
        'area_per_bedroom': area_per_bed,
        'bath_bed_ratio': bath_bed,
        'premium_score': premium_score,
        'loc_amenity': loc_amenity,
        'total_rooms': total_rooms,
    }])
    
    # Predict 
    log_price = model.predict(features)[0]
    
    return round(price, 2)


# === EXAMPLE USAGE ===
if __name__ == '__main__':
    price = predict_price(
        location='dlf phase 2',
        area=1800,
        bedrooms=3,
        bathrooms=2,
        balconies=2,
        floor_num=4,
        furnish_level='Semi-furnished',
        age_possession='1 to 5 Year Old',
        facing='North',
        society='DLF Capital Greens',
        servant_room=1, pooja_room=0, study_room=1, store_room=0,
        metro=1, near_hospital=1, near_school=1, near_mall=0, near_bank=1,
        amenity_count=8
    )
    print(f"Predicted Price: ₹{price:} Lacs")
```

---

## 🎨 Streamlit App (Optional Frontend)

```python
# app.py
import streamlit as st

st.title("🏠 House Price Predictor")

col1, col2 = st.columns(2)

with col1:
    location = st.selectbox("Location", list(loc_map.keys()))
    area = st.number_input("Area (sq.ft)", 500, 10000, 1500)
    bedrooms = st.slider("Bedrooms", 1, 10, 3)
    bathrooms = st.slider("Bathrooms", 1, 8, 2)
    balconies = st.slider("Balconies", 0, 3, 1)
    floor_num = st.number_input("Floor", 0, 50, 3)

with col2:
    furnish = st.selectbox("Furnishing", ["Unfurnished", "Semi-furnished", "Furnished"])
    age = st.selectbox("Age", list(AGE_MAP.keys()))
    facing = st.selectbox("Facing", list(facing_map.keys()))
    society = st.text_input("Society", "independent")
    amenities = st.slider("Amenity Count", 0, 20, 5)

st.subheader("Extra Rooms")
c1, c2, c3, c4 = st.columns(4)
servant = c1.checkbox("Servant")
pooja = c2.checkbox("Pooja")
study = c3.checkbox("Study")
store = c4.checkbox("Store")

st.subheader("Nearby")
n1, n2, n3, n4, n5 = st.columns(5)
metro = n1.checkbox("Metro")
hospital = n2.checkbox("Hospital")
school = n3.checkbox("School")
mall = n4.checkbox("Mall")
bank = n5.checkbox("Bank")

if st.button("Predict Price 🏠"):
    price = predict_price(
        location, area, bedrooms, bathrooms, balconies, floor_num,
        furnish, age, facing, society,
        int(servant), int(pooja), int(study), int(store),
        int(metro), int(hospital), int(school), int(mall), int(bank),
        amenities
    )
    st.success(f"### Estimated Price: ₹{price:.2f} Lacs")
```

Run with: `streamlit run app.py`
