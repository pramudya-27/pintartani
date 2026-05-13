# collectors/__init__.py

# Asumsi Role A akan membuat file ini nantinya
try:
    from .weather_scraper import fetch_weather_data
    from .price_scraper import fetch_market_price
except ImportError:
    # Fallback jika Role A belum membuat filenya
    def fetch_weather_data(): 
        print("Fungsi weather_scraper belum diimplementasikan Role A")
    
    def fetch_market_price():
        print("Fungsi price_scraper belum diimplementasikan Role A")

__all__ = ['fetch_weather_data', 'fetch_market_price']