import os
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime

# Import Internal Services
from backend.ml_service import ml_service_instance
from backend.decision_engine import get_recommendation
from backend.llm_gemini import is_extreme_condition, get_gemini_fallback
from backend.llm_deepseek import get_deepseek_fallback
from backend.auth_router import router as auth_router

# Create APIRouter - can be mounted to another app or run directly
router = APIRouter()

class PredictionRequest(BaseModel):
    komoditas: str = Field(..., description="Jenis komoditas: Bawang Merah, Cabai Rawit, Tomat")
    suhu_celsius: float = Field(..., description="Suhu saat ini dalam Celsius")
    curah_hujan_mm: float = Field(..., description="Curah hujan saat ini dalam mm")
    harga_sekarang: float = Field(..., description="Harga komoditas saat ini per kg")
    harga_h_1: float = Field(None, description="Harga H-1. Jika kosong akan menggunakan harga_sekarang")
    harga_h_3: float = Field(None, description="Harga H-3. Jika kosong akan menggunakan harga_sekarang")
    target_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

class PredictionResponse(BaseModel):
    predicted_price: float
    weather_context: str
    recommendation: str
    is_gemini_fallback: bool
    status: str

@router.post("/api/predict", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):
    try:
        # 1. Format Request Data
        req_data = request.dict()
        req_data['harga_h-1'] = request.harga_h_1 if request.harga_h_1 is not None else request.harga_sekarang
        req_data['harga_h-3'] = request.harga_h_3 if request.harga_h_3 is not None else request.harga_sekarang
        
        # 2. Get Machine Learning Prediction
        feature_array = ml_service_instance.format_input(req_data)
        predicted_price = ml_service_instance.predict(feature_array, request.harga_sekarang)

        weather_context = f"Suhu {request.suhu_celsius}°C, Curah Hujan {request.curah_hujan_mm}mm"
        
        # 3. Handle Fallback / Decision Engine
        if is_extreme_condition(request.curah_hujan_mm, predicted_price, request.harga_sekarang):
            # Coba menggunakan Gemini AI Fallback
            recommendation = get_gemini_fallback(
                request.komoditas, 
                request.suhu_celsius, 
                request.curah_hujan_mm, 
                predicted_price, 
                request.harga_sekarang
            )
            is_gemini = True

            # Jika Gemini gagal atau tidak ada API Key, gunakan DeepSeek-v4-flash
            if "tidak tersedia" in recommendation or "kendala teknis" in recommendation:
                deepseek_recommendation = get_deepseek_fallback(
                    request.komoditas, 
                    request.suhu_celsius, 
                    request.curah_hujan_mm, 
                    predicted_price, 
                    request.harga_sekarang
                )
                if "tidak tersedia" not in deepseek_recommendation and "kendala teknis" not in deepseek_recommendation:
                    recommendation = deepseek_recommendation
                    
        else:
            # Use Standard Decision Rules
            recommendation = get_recommendation(predicted_price, request.harga_sekarang)
            is_gemini = False

        return PredictionResponse(
            predicted_price=round(predicted_price, 0),
            weather_context=weather_context,
            recommendation=recommendation,
            is_gemini_fallback=is_gemini,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Standalone application if run directly
app = FastAPI(title="PintarTani API Web Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(auth_router)

if __name__ == "__main__":
    import uvicorn
    # To run: python -m backend.api_router
    uvicorn.run(app, host="0.0.0.0", port=8000)
