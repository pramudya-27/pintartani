# bot/handler.py
from telegram import Update
from telegram.ext import (
    ContextTypes, 
    ConversationHandler, 
    CommandHandler, 
    MessageHandler, 
    filters
)

# State untuk percakapan
PH, TEKSTUR, PUPUK = range(3)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🌿Selamat Datang di PintarTani Sayangku!\n\n"
        "Saya adalah asisten AI untuk petani. Gunakan perintah berikut:\n"
        "/rekomendasi - Cek saran tanam/panen\n"
        "/input_tanah - Catat kondisi lahan Anda\n"
        "/help - Lihat panduan lengkap"
    )

from backend.ml_service import ml_service_instance
from backend.decision_engine import get_recommendation
from backend.llm_gemini import is_extreme_condition, get_gemini_fallback
import asyncio

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "❓Panduan Penggunaan PintarTani by michaellogos\n\n"
        "1. Ketik `/rekomendasi` diikuti nama tanaman (Bawang Merah/Cabai Rawit/Tomat) untuk cek saran AI.\n"
        "2. Ketik `/input_tanah` untuk mulai pendataan lahan.\n"
        "3. Ketik `/cancel` kapan saja untuk membatalkan input data."
    )
    await update.message.reply_text(help_text)

async def rekomendasi_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Kirim pesan loading awal
    loading_msg = await update.message.reply_text("🔍 Sedang menganalisis prediksi harga dan data lapangan dengan AI... Mohon tunggu sebentar ya!")
    
    try:
        # Ambil input komoditas dari user jika ada
        komoditas = " ".join(context.args) if context.args else "Bawang Merah"
        
        # Cek apakah komoditas didukung oleh ML
        supported_komoditas = ["bawang merah", "cabai rawit", "tomat"]
        is_supported = komoditas.lower() in supported_komoditas

        # Setup data dummy/default untuk Telegram karena belum ada input lengkap
        suhu = 27.5
        hujan = 5.0
        harga_sekarang = 25000
        
        req_data = {
            'komoditas': komoditas if is_supported else "Bawang Merah", # Default if not supported to prevent format error but we won't use the ML result anyway
            'suhu_celsius': suhu,
            'curah_hujan_mm': hujan,
            'harga_sekarang': harga_sekarang,
            'harga_h-1': harga_sekarang,
            'harga_h-3': harga_sekarang,
        }

        # Format input untuk ML
        feature_array = ml_service_instance.format_input(req_data)
        
        # Eksekusi ML Prediksi
        predicted_price = ml_service_instance.predict(feature_array, harga_sekarang)
        
        # Jalankan logika fallback (memanggil Gemini bersifat sync, jadi dibungkus ke_thread)
        def process_ai():
            if not is_supported:
                # Jika komoditas tidak di-train di ML, gunakan murni Gemini
                saran = get_gemini_fallback(komoditas, suhu, hujan, 0, harga_sekarang)
                return f"✨ Analisis AI Gemini (Model belum dilatih untuk {komoditas}):\n{saran}"
            elif is_extreme_condition(hujan, predicted_price, harga_sekarang):
                saran = get_gemini_fallback(komoditas, suhu, hujan, predicted_price, harga_sekarang)
                return f"✨ Saran Pakar AI Gemini:\n{saran}"
            else:
                saran = get_recommendation(predicted_price, harga_sekarang)
                return f"📋 Rekomendasi Sistem:\n{saran}"
                
        # Menggunakan asyncio.to_thread agar bot tidak frozen / "lama loading"
        saran_teks = await asyncio.to_thread(process_ai)

        # Buat balasan akhir
        if is_supported:
            hasil_teks = (
                f"📊 **Hasil Analisis PintarTani**\n\n"
                f"🌱 Komoditas: {komoditas.title()}\n"
                f"💰 Harga Saat Ini: Rp {harga_sekarang:,.0f}\n"
                f"🔮 Prediksi ML (AI): Rp {predicted_price:,.0f}\n\n"
                f"{saran_teks}"
            )
        else:
            hasil_teks = (
                f"📊 **Hasil Analisis PintarTani**\n\n"
                f"🌱 Komoditas: {komoditas.title()}\n"
                f"💰 Harga Survei/Pasar: Rp {harga_sekarang:,.0f}\n"
                f"⚠️ *Model ML khusus {komoditas.title()} sedang dalam pengumpulan data.*\n\n"
                f"{saran_teks}"
            )
        
        await loading_msg.edit_text(hasil_teks, parse_mode="Markdown")

    except Exception as e:
        await loading_msg.edit_text(f"❌ Terjadi kesalahan pada server AI: {str(e)}")

# --- Alur Input Tanah ---
async def input_tanah_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Berapa pH tanah lahan Anda saat ini?")
    return PH

async def get_ph(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['ph'] = update.message.text
    await update.message.reply_text("Apa tekstur tanahnya? (Lempung/Pasir/Liat)")
    return TEKSTUR

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Proses input dibatalkan.")
    return ConversationHandler.END

# Definisi Handler untuk diekspor
input_tanah_handler = ConversationHandler(
    entry_points=[CommandHandler('input_tanah', input_tanah_start)],
    states={
        PH: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_ph)],
        # Tambahkan state lain di sini jika perlu
    },
    fallbacks=[CommandHandler('cancel', cancel)]
)