# 🏠 Gurgaon Real Estate Estimator (Full-Stack ML App)

A premium, data-driven AI web application designed to provide instant, high-precision property valuations for the Gurgaon real estate market. This project bridges the gap between complex Machine Learning models and a user-friendly, high-end React interface.

---

## 🚀 The Real-World Problem Solved
Real estate pricing in Gurgaon is notoriously volatile and inconsistent, influenced by dozens of hidden variables (amenities, location prestige, property age, extra rooms, nearby infrastructure). 
**GurgaonEstimate** solves this by:
- **Removing Guesswork:** Replaces "gut feeling" with a mathematical model trained on 2,500+ real property listings.
- **Handling Outliers:** Accurately values budget apartments (₹50 Lac range) AND ultra-luxury penthouses (₹20 Cr+ range) using a custom hybrid ensemble technique.
- **Internal Data Intelligence:** Dynamically calculates amenity counts based on the chosen society to ensure precision without requiring user guesswork.

---

## 🧠 Model & Algorithms (The "Brain")
Standard models (like XGBoost or Random Forest) fail to predict ultra-luxury properties because they "average out" high-end outliers. To solve this, **GurgaonEstimate** uses a **Weighted Ensemble Model (Voting Regressor)**:

1. **Gradient Boosting Regressor (70% weight):** Captures 42 complex, non-linear patterns (e.g., how the interaction of location and amenities affects price).
2. **Ridge Regression (30% weight):** Provides linear extrapolation capabilities. This allows the model to "break the ceiling" and accurately predict 20 Cr+ prices that pure tree-based models usually under-calculate.

**Key Technical Features:**
- **Feature Engineering:** 13 user inputs are transformed into **42 model features** (e.g., `bedroom_density`, `is_premium_loc`, `lux_home_interaction`).
- **Target Encoding:** Locations and Societies are encoded based on their historical median impact on price.
- **Inverse Frequency Mapping:** Rare societies and locations are handled dynamically to prevent prediction errors on unseen data.

---

## 🏗️ System Architecture
The application follows a professional, decoupled micro-architecture:

### 🧩 Backend (FastAPI + Scikit-Learn)
- **Framework:** FastAPI for ultra-fast, asynchronous request handling.
- **ML Engine:** Custom Scikit-Learn Pipeline loaded via `pickle`.
- **Validation:** Pydantic models for strict input-output schema enforcement.
- **API Endpoints:** Includes `/predict` for inferences and `/health` for monitoring.

### 🎨 Frontend (React + Vite + Tailwind CSS)
- **Engine:** Vite for lightning-fast HMR and building.
- **UI/UX:** Premium dark-themed glassmorphism design with multi-step wizard forms.
- **Logic:** Dynamic state management for 20+ form inputs and real-time result formatting (Lac vs. Cr).

---

## 🛠️ Tech Stack
- **Languages:** Python (Backend), JavaScript (Frontend/React).
- **ML Libraries:** Scikit-Learn, Pandas, NumPy, XGBoost.
- **Web:** FastAPI, Uvicorn, Vite, Tailwind CSS.
- **Hosting:** Render (Backend), Vercel (Frontend).

---

## ⚙️ How to Run Locally

### 1. Backend Setup
```bash
cd housePrice_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd housePrice_frontend
npm install
npm run dev
```

---

## 📈 Performance Summary
- **Train R² Score:** 0.94+
- **Test R² Score:** 0.90+
- **Generalization:** Successfully predicts prices across a massive range from **₹75 Lacs to ₹30.0 Crores**.

---
*Built with ❤️ by [Prem Karhale]*
