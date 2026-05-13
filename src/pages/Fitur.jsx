import {useState} from "react";
import axios from "axios";
import {LineChart, CloudRain, FlaskConical, Bot, Sparkles} from "lucide-react";

function Fitur({openCard, setOpenCard, setQuota, loggedInUser}) {
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  // States for Harga
  const [komoditas, setKomoditas] = useState("");
  const [kotaHarga, setKotaHarga] = useState("");
  const [resHarga, setResHarga] = useState(null);

  // States for Cuaca
  const [kotaCuaca, setKotaCuaca] = useState("");
  const [resCuaca, setResCuaca] = useState(null);

  // States for Tanah
  const [ph, setPh] = useState("");
  const [tekstur, setTekstur] = useState("");
  const [lokasiTanah, setLokasiTanah] = useState("");
  const [resTanah, setResTanah] = useState(null);

  // States for Prediksi
  const [komoditasPred, setKomoditasPred] = useState("");
  const [bulanPred, setBulanPred] = useState("");
  const [wilayahPred, setWilayahPred] = useState("");
  const [resPrediksi, setResPrediksi] = useState(null);

  const toggleCard = (id) => {
    setOpenCard(openCard === id ? null : id);
  };

  const callAI = async (prompt, setResState) => {
    const token = localStorage.getItem("pt_token");
    if (!token) {
      setResState({error: "Anda harus login terlebih dahulu di menu Akun."});
      return;
    }

    setLoading(true);
    setResState(null);
    setActiveForm(openCard);

    try {
      const res = await axios.post(
        "/api/ask",
        {prompt},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      const data = res.data;
      localStorage.setItem("pt_quota", data.quota_left);
      setQuota(data.quota_left);

      setResState({
        content: data.content,
        source: data.data_source,
        quota_left: data.quota_left,
      });

      // Simpan ke Riwayat
      try {
        const historyItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          type: openCard === "c-harga" ? "Harga Pasar" :
                openCard === "c-cuaca" ? "Cuaca & Risiko" :
                openCard === "c-tanah" ? "Analisis Lahan" :
                openCard === "c-prediksi" ? "Prediksi Tanam" : "Analisis AI",
          prompt: prompt,
          content: data.content,
          source: data.data_source,
        };
        const username = loggedInUser || localStorage.getItem("pt_user");
        const historyKey = username ? `pt_history_${username}` : "pt_history";
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
        localStorage.setItem(historyKey, JSON.stringify([historyItem, ...existingHistory]));
      } catch (historyErr) {
        console.error("Gagal menyimpan riwayat:", historyErr);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("pt_token");
        setResState({error: "Sesi berakhir, silakan login kembali."});
      } else {
        setResState({
          error: err.response?.data?.detail || "Terjadi kesalahan server.",
        });
      }
    } finally {
      setLoading(false);
      setActiveForm(null);
    }
  };

  const aiHarga = () => {
    if (!komoditas || !kotaHarga) {
      setResHarga({error: "Pilih komoditas dan kota terlebih dahulu."});
      return;
    }
    const prompt = `Berikan analisis harga ${komoditas} di ${kotaHarga} saat ini. Sertakan:
1. 📊 Estimasi harga saat ini (Rp/kg) berdasarkan data pasar riil
2. 📈 Tren harga 7 hari terakhir (naik/turun/stabil dan persentase)
3. 🏙️ Perbandingan harga di 3 kota besar lainnya
4. 💡 Rekomendasi: apakah ini waktu yang baik untuk menjual?
5. ⚠️ Faktor yang mempengaruhi harga saat ini`;
    callAI(prompt, setResHarga);
  };

  const aiCuaca = () => {
    if (!kotaCuaca) {
      setResCuaca({error: "Pilih kota terlebih dahulu."});
      return;
    }
    const prompt = `Berikan analisis cuaca dan dampak pertanian untuk ${kotaCuaca}:
1. 🌡️ Kondisi cuaca saat ini (suhu, kelembapan, curah hujan)
2. 🌧️ Prakiraan 3 hari ke depan
3. 🌾 Dampak ke tanaman: apa yang harus diwaspadai?
4. ⚠️ Tingkat risiko pertanian: rendah/sedang/tinggi dan alasannya
5. ✅ Rekomendasi tindakan petani hari ini
6. 🚚 Kondisi distribusi hasil panen ke pasar`;
    callAI(prompt, setResCuaca);
  };

  const aiTanah = () => {
    if (!ph || !tekstur || !lokasiTanah) {
      setResTanah({error: "Isi semua data lahan terlebih dahulu."});
      return;
    }
    const prompt = `Analisis lahan pertanian dengan data berikut:
- pH Tanah: ${ph}
- Tekstur: ${tekstur}  
- Lokasi: ${lokasiTanah}

Berikan:
1. 🧪 Diagnosis kondisi tanah (asam/netral/basa dan artinya)
2. 💊 Amendemen tanah yang diperlukan (kapur/belerang/dll + dosis per hektar)
3. 🌿 Rekomendasi pupuk utama (NPK + pupuk organik + dosis)
4. 🌱 Komoditas yang paling cocok (3-5 tanaman terbaik)
5. ⚡ Komoditas yang harus dihindari
6. 📅 Waktu persiapan lahan yang disarankan`;
    callAI(prompt, setResTanah);
  };

  const aiPrediksi = () => {
    if (!komoditasPred || !bulanPred || !wilayahPred) {
      setResPrediksi({error: "Isi semua data prediksi terlebih dahulu."});
      return;
    }
    const prompt = `Buat prediksi dan saran tanam untuk petani dengan rencana:
- Komoditas: ${komoditasPred}
- Bulan tanam: ${bulanPred}
- Wilayah: ${wilayahPred}

Analisis dan berikan:
1. 📅 Kalender tanam: bulan tanam → panen → jual terbaik
2. 🌧️ Kesesuaian dengan pola curah hujan dan musim di wilayah tersebut
3. 📈 Prediksi harga saat panen (berdasarkan tren dan musim)
4. ⚠️ Risiko utama dan cara mitigasinya
5. 💰 Estimasi keuntungan per hektar (kasar)
6. 🏆 Rekomendasi akhir: lanjutkan atau pertimbangkan alternatif?`;
    callAI(prompt, setResPrediksi);
  };

  const renderResult = (res) => {
    if (!res) return null;
    if (res.error) {
      return (
        <div className="mt-2.5 bg-black/30 border border-brand-accent/20 rounded-lg p-3 text-xs text-red-400">
          ⚠️ {res.error}
        </div>
      );
    }
    return (
      <div className="mt-2.5 bg-black/30 border border-brand-accent/20 rounded-lg p-3 text-xs text-brand-light/80 whitespace-pre-wrap leading-relaxed">
        {res.content}
        <div className="mt-2.5 text-[10px] text-brand-accent/50 border-t border-brand-accent/10 pt-2 flex justify-between">
          <span>Model: {res.source}</span>
          <span>Sisa Kuota: {res.quota_left}/5</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-7 animate-fade-in max-w-5xl mx-auto">
      <div className="text-[10px] text-brand-light/30 uppercase tracking-wide mb-4 text-center md:text-left">
        Pilih salah satu fitur cerdas di bawah untuk memulai analisis AI Gemini & Qwen
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Left Side: 4 Compact Cards */}
        <div className="md:col-span-2 flex flex-col gap-3">
          {/* Harga Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-harga"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-harga")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4a8c32]/20 flex items-center justify-center shrink-0">
                <LineChart size={18} className="text-[#8dc868]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Harga Pasar Real-Time
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Analisis harga & estimasi pakar AI
                </p>
              </div>
            </div>
          </div>

          {/* Cuaca Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-cuaca"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-cuaca")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b4781e]/20 flex items-center justify-center shrink-0">
                <CloudRain size={18} className="text-[#dcb45a]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Cuaca BMKG & Risiko Tani
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Prakiraan cuaca cerdas & risiko bertani
                </p>
              </div>
            </div>
          </div>

          {/* Tanah Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-tanah"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-tanah")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b5cc6a]/15 flex items-center justify-center shrink-0">
                <FlaskConical size={18} className="text-[#b5cc6a]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Analisis Lahan & Pupuk
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Rekomendasi pupuk & kecocokan lahan
                </p>
              </div>
            </div>
          </div>

          {/* Prediksi Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-prediksi"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-prediksi")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3264b4]/20 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-[#6496dc]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Prediksi & Saran Tanam
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Decision engine AI gabungan tren & musim
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Workspace Panel */}
        <div className="md:col-span-3">
          {openCard ? (
            <div className="glass-card p-6 border border-[rgba(180,220,140,0.1)] rounded-xl bg-brand-bg/40">
              {openCard === "c-harga" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#4a8c32]/20 flex items-center justify-center">
                      <LineChart size={14} className="text-[#8dc868]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Harga Pasar Real-Time
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Komoditas
                      </label>
                      <select
                        className="form-input w-full"
                        value={komoditas}
                        onChange={(e) => setKomoditas(e.target.value)}
                      >
                        <option value="">— Pilih komoditas —</option>
                        <option>Beras Medium</option>
                        <option>Beras Premium</option>
                        <option>Cabai Merah Keriting</option>
                        <option>Cabai Rawit Merah</option>
                        <option>Bawang Merah</option>
                        <option>Bawang Putih</option>
                        <option>Tomat</option>
                        <option>Jagung Pipilan Kering</option>
                        <option>Kedelai Biji Kering</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Kota / Wilayah
                      </label>
                      <select
                        className="form-input w-full"
                        value={kotaHarga}
                        onChange={(e) => setKotaHarga(e.target.value)}
                      >
                        <option value="">— Pilih kota —</option>
                        <option>Jakarta</option>
                        <option>Surabaya</option>
                        <option>Bandung</option>
                        <option>Medan</option>
                        <option>Makassar</option>
                        <option>Semarang</option>
                        <option>Yogyakarta</option>
                      </select>
                    </div>
                    <button
                      disabled={loading && activeForm === "c-harga"}
                      onClick={aiHarga}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <LineChart size={14} /> Analisis Harga
                    </button>
                  </div>
                  {loading && activeForm === "c-harga" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> AI sedang
                      menganalisis data...
                    </div>
                  )}
                  {renderResult(resHarga)}
                </div>
              )}

              {openCard === "c-cuaca" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#b4781e]/20 flex items-center justify-center">
                      <CloudRain size={14} className="text-[#dcb45a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Risiko & Prakiraan Cuaca
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Kota / Provinsi
                      </label>
                      <select
                        className="form-input w-full"
                        value={kotaCuaca}
                        onChange={(e) => setKotaCuaca(e.target.value)}
                      >
                        <option value="">— Pilih kota/provinsi —</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Surabaya</option>
                        <option>Medan</option>
                        <option>Makassar</option>
                        <option>Semarang</option>
                        <option>Yogyakarta</option>
                        <option>Palembang</option>
                        <option>Denpasar</option>
                      </select>
                    </div>
                    <button
                      disabled={loading && activeForm === "c-cuaca"}
                      onClick={aiCuaca}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <CloudRain size={14} /> Cek Cuaca & Risiko
                    </button>
                  </div>
                  {loading && activeForm === "c-cuaca" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> AI sedang
                      menganalisis data...
                    </div>
                  )}
                  {renderResult(resCuaca)}
                </div>
              )}

              {openCard === "c-tanah" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#b5cc6a]/15 flex items-center justify-center">
                      <FlaskConical size={14} className="text-[#b5cc6a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Analisis Kondisi Lahan
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        pH Tanah
                      </label>
                      <input
                        type="number"
                        className="form-input w-full"
                        placeholder="pH tanah (contoh: 6.5)"
                        value={ph}
                        onChange={(e) => setPh(e.target.value)}
                        min="3.5"
                        max="9"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Tekstur Tanah
                      </label>
                      <select
                        className="form-input w-full"
                        value={tekstur}
                        onChange={(e) => setTekstur(e.target.value)}
                      >
                        <option value="">— Tekstur tanah —</option>
                        <option>Lempung (Loam)</option>
                        <option>Berpasir (Sandy Loam)</option>
                        <option>Berliat (Clay)</option>
                        <option>Gambut (Peat)</option>
                        <option>Pasir (Sandy)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Lokasi Lahan
                      </label>
                      <select
                        className="form-input w-full"
                        value={lokasiTanah}
                        onChange={(e) => setLokasiTanah(e.target.value)}
                      >
                        <option value="">— Lokasi lahan —</option>
                        <option>Jawa</option>
                        <option>Sumatera</option>
                        <option>Kalimantan</option>
                        <option>Sulawesi</option>
                        <option>Bali & Nusa Tenggara</option>
                        <option>Papua</option>
                      </select>
                    </div>
                    <button
                      disabled={loading && activeForm === "c-tanah"}
                      onClick={aiTanah}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <FlaskConical size={14} /> Analisis Lahan
                    </button>
                  </div>
                  {loading && activeForm === "c-tanah" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> AI sedang
                      menganalisis data...
                    </div>
                  )}
                  {renderResult(resTanah)}
                </div>
              )}

              {openCard === "c-prediksi" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#3264b4]/20 flex items-center justify-center">
                      <Bot size={14} className="text-[#6496dc]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Prediksi & Saran Tanam
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Komoditas
                      </label>
                      <select
                        className="form-input w-full"
                        value={komoditasPred}
                        onChange={(e) => setKomoditasPred(e.target.value)}
                      >
                        <option value="">— Komoditas —</option>
                        <option>Padi</option>
                        <option>Jagung</option>
                        <option>Cabai Merah</option>
                        <option>Bawang Merah</option>
                        <option>Tomat</option>
                        <option>Kedelai</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Bulan Tanam
                      </label>
                      <select
                        className="form-input w-full"
                        value={bulanPred}
                        onChange={(e) => setBulanPred(e.target.value)}
                      >
                        <option value="">— Bulan tanam —</option>
                        <option>Januari</option>
                        <option>Februari</option>
                        <option>Maret</option>
                        <option>April</option>
                        <option>Mei</option>
                        <option>Juni</option>
                        <option>Juli</option>
                        <option>Agustus</option>
                        <option>September</option>
                        <option>Oktober</option>
                        <option>November</option>
                        <option>Desember</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Wilayah
                      </label>
                      <select
                        className="form-input w-full"
                        value={wilayahPred}
                        onChange={(e) => setWilayahPred(e.target.value)}
                      >
                        <option value="">— Wilayah —</option>
                        <option>Jawa Barat</option>
                        <option>Jawa Tengah</option>
                        <option>Jawa Timur</option>
                        <option>Sumatera Utara</option>
                        <option>Sulawesi Selatan</option>
                        <option>Bali</option>
                      </select>
                    </div>
                    <button
                      disabled={loading && activeForm === "c-prediksi"}
                      onClick={aiPrediksi}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <Bot size={14} /> Dapatkan Prediksi
                    </button>
                  </div>
                  {loading && activeForm === "c-prediksi" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> AI sedang
                      menganalisis data...
                    </div>
                  )}
                  {renderResult(resPrediksi)}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] border border-brand-border/10 rounded-xl bg-brand-bg/40 animate-fade-in">
              <Sparkles
                size={36}
                className="text-brand-accent/30 mb-3 animate-pulse"
              />
              <h3 className="text-sm font-semibold text-brand-light mb-1">
                Mulai Analisis Cerdas
              </h3>
              <p className="text-[11px] text-brand-light/40 max-w-[240px] leading-relaxed">
                Pilih salah satu fitur cerdas di sebelah kiri untuk membuka form
                input dan memulai analisis AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fitur;
