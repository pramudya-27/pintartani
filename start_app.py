import subprocess
import sys
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    logging.info("Starting PintarTani Multi-Process Runner...")

    # 1. Start Telegram Bot & Background Scheduler (main.py)
    logging.info("Launching Telegram Bot & Scheduler (main.py)...")
    bot_process = subprocess.Popen([sys.executable, "main.py"])

    # 2. Start FastAPI Web Server (uvicorn)
    logging.info("Launching FastAPI Web Server on port 7860...")
    uvicorn_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", 
        "backend.api_router:app", 
        "--host", "0.0.0.0", 
        "--port", "7860"
    ])

    try:
        # Keep runner active while uvicorn server runs
        uvicorn_process.wait()
    except KeyboardInterrupt:
        logging.info("Shutting down processes...")
        bot_process.terminate()
        uvicorn_process.terminate()

if __name__ == "__main__":
    main()
