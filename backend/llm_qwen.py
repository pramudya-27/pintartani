import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

logger = logging.getLogger(__name__)

load_dotenv()
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", os.getenv("QWEN_API_KEY"))

if DASHSCOPE_API_KEY:
    _client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    )
else:
    _client = None
    logger.warning("DASHSCOPE_API_KEY tidak ditemukan di environment variables.")

MODEL = "qwen3.5-flash"


def _generate(system_instruction: str, prompt: str) -> str | None:
    """Helper: panggil Qwen via OpenAI-compatible API."""
    if not _client:
        return None
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
        return text.strip() if text else None
    except Exception as e:
        logger.error(f"[Qwen] Gagal generate content: {e}")
        return None

def analyze_market_and_weather(komoditas: str, lokasi: str) -> dict | None:
    """
    Gunakan Qwen untuk mengestimasi data pasar real-time dan prediksi cuaca
    sebagai ganti proses scraping konvensional.
    """
    system = (
        "Kamu adalah API asisten AI pertanian Indonesia. "
        "Tugasmu adalah memberikan estimasi harga pasar real-time dan analisis prediksi. "
        "Keluarkan HANYA JSON murni tanpa markdown, tanpa penjelasan."
    )
    prompt = f"""
Buat estimasi analisis harga dan cuaca saat ini untuk Komoditas: {komoditas} di Kota/Kabupaten: {lokasi}.

PENTING:
1. Berikan estimasi harga yang realistis saat ini (harga_sekarang) berdasarkan pengetahuanmu.
2. Prediksikan harga untuk 1 minggu ke depan (harga_prediksi).
3. Estimasikan suhu rata-rata dan curah hujan harian di lokasi tersebut.
4. Berikan saran/rekomendasi tindakan maksimal 2 kalimat singkat.

Kembalikan JSON murni dengan format PERSIS:
{{
    "komoditas": "{komoditas}",
    "desa": "{lokasi}",
    "harga_sekarang": 25000,
    "harga_prediksi": 27000,
    "suhu": 33.5,
    "hujan": 12.0,
    "kategori_cuaca": "Cerah/Ringan/Lebat",
    "saran": "Saran singkat untuk petani."
}}

ATURAN:
- Semua harga dalam Rupiah per KG (integer).
- Suhu dalam Celsius (float).
- Hujan dalam mm (float).
"""
    raw = _generate(system, prompt)
    if not raw:
        logger.error(f"[Qwen] Tidak ada respons dari API untuk '{komoditas}' di '{lokasi}'")
        return None

    logger.debug(f"[Qwen] Raw response: {raw[:500]}")

    # Bersihkan semua variasi markdown fence
    text = raw.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Coba cari blok JSON di dalam teks jika masih ada teks tambahan
    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            text = text[start:end]

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"[Qwen] Gagal parse JSON market data untuk '{komoditas}': {e}\nRaw: {raw[:500]}")
        return None


def analyze_land_condition(ph: str, jenis_tanah: str, ekosistem: str, curah_hujan: str) -> str:
    """
    Memberikan rekomendasi pupuk dan tindakan berdasarkan kondisi lahan.
    """
    system = (
        "Kamu adalah pakar agronomi AI yang sangat membantu petani Indonesia. "
        "Tugasmu adalah memberikan saran penanganan tanah dan rekomendasi pupuk. "
        "Gunakan bahasa Indonesia yang ramah, jelas, dan mudah dipahami."
    )
    prompt = (
        f"Seorang petani melaporkan kondisi lahannya sebagai berikut:\n"
        f"- pH Tanah: {ph}\n"
        f"- Jenis Tanah: {jenis_tanah}\n"
        f"- Indikator Ekosistem (Serangga/Hewan): {ekosistem}\n"
        f"- Curah Hujan: {curah_hujan}\n\n"
        f"Tolong berikan analisis singkat tentang kelayakan tanam, kesehatan ekosistem tersebut, "
        f"serta rekomendasi spesifik jenis pupuk atau tindakan yang harus dilakukan oleh petani."
    )
    result = _generate(system, prompt)
    return result or "Maaf, sistem sedang mengalami kendala. Silakan coba lagi nanti."
