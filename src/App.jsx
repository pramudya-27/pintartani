import {useState} from "react";
import axios from "axios";
import PredictForm from "./components/PredictForm";
import ResultCard from "./components/ResultCard";

const API_URL = "https://daimyo27-pintartani-backend.hf.space/api/predict";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  const handlePredict = async (formData) => {
    setLoading(true);
    setError("");
    setCurrentPrice(formData.harga_sekarang);

    try {
      // Setup payload matching our FastAPI request model
      const payload = {
        komoditas: formData.komoditas,
        suhu_celsius: formData.suhu_celsius,
        curah_hujan_mm: formData.curah_hujan_mm,
        harga_sekarang: formData.harga_sekarang,
      };

      const response = await axios.post(API_URL, payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Terjadi kesalahan saat mengambil prediksi dari AI. Pastikan backend bejalan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
              PintarTani
            </h1>
          </div>
          <div className="hidden sm:block">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
              Dashboard AI
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            Agen AI Analisa Pasar
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-gray-500 md:mx-0">
            Dapatkan rekomendasi cerdas berdasarkan peramalan cuaca dan model
            Harga Random Forest.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <PredictForm onPredict={handlePredict} loading={loading} />
          </div>

          <div className="lg:col-span-5 relative">
            {result ? (
              <ResultCard result={result} currentPrice={currentPrice} />
            ) : (
              <div className="bg-white/50 border border-dashed border-gray-300 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <svg
                  className="w-16 h-16 mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  ></path>
                </svg>
                <p>
                  Silakan isi form di samping untuk mulai Menganalisis kondisi
                  pasar dan mendapat rekomendasi AI.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
