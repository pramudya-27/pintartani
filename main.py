# main.py
import os
import sys
import logging
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from apscheduler.schedulers.background import BackgroundScheduler
from telegram.ext import ApplicationBuilder, CommandHandler

# 1. PATH CONFIGURATION
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# 2. LOAD ENVIRONMENT VARIABLES
load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")

# 3. IMPORT INTERNAL MODULES
try:
    # Mengimpor dari paket (memanfaatkan __init__.py)
    from scheduler import daily_scraping, weekly_retrain, health_check
    from bot import start, input_tanah_handler, rekomendasi_cmd, help_cmd 
    print("✅ Semua modul internal berhasil dimuat!")
except ImportError as e:
    print(f"❌ Gagal memuat modul: {e}")
    sys.exit(1)

# 4. LOGGING SETUP
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/main.log"),
        logging.StreamHandler()
    ]
)

def setup_scheduler():
    scheduler = BackgroundScheduler(timezone="Asia/Jakarta")
    scheduler.add_job(daily_scraping, 'cron', hour=1, minute=0)
    scheduler.add_job(weekly_retrain, 'cron', day_of_week='sun', hour=2, minute=0)
    scheduler.add_job(health_check, 'interval', hours=1)
    scheduler.start()
    logging.info("⏰ Scheduler aktif.")
    return scheduler

def main():
    if not TOKEN:
        logging.error("TELEGRAM_TOKEN tidak ditemukan!")
        return

    sched = setup_scheduler()
    application = ApplicationBuilder().token(TOKEN).build()

    # Registrasi Handlers
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('help', help_cmd)) # Perintah Help baru
    application.add_handler(CommandHandler('rekomendasi', rekomendasi_cmd))
    application.add_handler(input_tanah_handler) 

    logging.info("🚀 PintarTani Bot sedang berjalan...")
    
    try:
        application.run_polling(drop_pending_updates=True)
    except Exception as e:
        logging.error(f"Terjadi kesalahan: {e}")
    finally:
        if sched.running:
            sched.shutdown()
        logging.info("Sistem dihentikan.")

if __name__ == "__main__":
    main()