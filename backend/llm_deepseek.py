import os
import logging
from dotenv import load_dotenv
from openai import OpenAI

logger = logging.getLogger(__name__)

load_dotenv()
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")

if DASHSCOPE_API_KEY:
    _client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    )
else:
    _client = None
    logger.warning("DASHSCOPE_API_KEY tidak ditemukan di environment variables.")

MODEL = "deepseek-v4-flash"

def get_deepseek_fallback(komoditas: str, suhu: float, curah_hujan_mm: float, predicted_price: float, current_price: float) -> str:
    """
    Menggunakan DeepSeek API untuk memberikan fallback recommendation.
    """
    if not _client:
        return "Saran Pakar AI tidak tersedia (DashScope API Key tidak ditemukan)."

    system_instruction = "You are an expert Agronomist and Market Analyst in Indonesia. Based on this data, give a 2-sentence practical recommendation for a traditional farmer. Speak in Indonesian."
    
    prompt = f"""
    Data Pertanian & Pasar:
    - Komoditas: {komoditas}
    - Suhu: {suhu} °C
    - Curah Hujan: {curah_hujan_mm} mm
    - Harga Saat Ini: Rp {current_price}
    - Prediksi Harga ML: Rp {predicted_price}
    
    Berikan rekomendasi apakah sebaiknya petani panen, tunda, atau mengambil tindakan mitigasi tertentu.
    """

    try:
        response = _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        text = response.choices[0].message.content
        return text.strip() if text else "Saran tidak tersedia."
    except Exception as e:
        logger.error(f"[DeepSeek] Gagal generate content: {e}")
        return "Sistem AI Pakar sedang mengalami kendala teknis (DeepSeek Error)."
