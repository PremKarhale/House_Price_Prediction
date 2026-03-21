from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routers.predict import router as predict_router

app = FastAPI(
    title="House Price Prediction API",
    description="Predict house prices in Gurgaon using ML",
    version="1.0.0"
)

# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the prediction router
app.include_router(predict_router)


@app.get("/")
def root():
    return {"msg": "House Price Prediction API is running 🏠"}


@app.get("/health")
def health():
    return {"status": "ok"}
