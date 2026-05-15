function Arsitektur() {
  return (
    <div className="p-7 animate-fade-in max-w-3xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5">
        Arsitektur Sistem
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 leading-relaxed">
        Arsitektur Pure LLM — cerdas, responsif, dan berjalan secara on-the-fly
        tanpa dependensi scraper eksternal.
      </p>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-brand-accent/40 mb-2">
          Layer 1 — Antarmuka Pengguna
        </div>
        <h3 className="text-[13px] font-medium text-brand-light mb-1.5">
          Web Dashboard & Telegram Bot
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Petani dapat berinteraksi melalui Web Dashboard interaktif atau
          melalui Telegram Bot. Keduanya dirancang agar mudah digunakan oleh
          petani di lapangan.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-brand-accent/40 mb-2">
          Layer 2 — Core API & Auth
        </div>
        <h3 className="text-[13px] font-medium text-brand-light mb-1.5">
          FastAPI Backend + MySQL
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Semua request dari klien akan diproses oleh FastAPI. Layer ini
          bertugas melakukan autentikasi user via JWT, memastikan batas kuota
          tercukupi, dan mengatur rute ke Decision Engine.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-brand-accent/40 mb-2">
          Layer 3 — Kecerdasan & Logika
        </div>
        <h3 className="text-[13px] font-medium text-brand-light mb-1.5">
          Decision Engine & Multi-LLM
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Sistem menggunakan arsitektur fallback. Backend akan mencoba memanggil
          model Deepseek terlebih dahulu. Jika terjadi limitasi atau kegagalan,
          sistem secara mulus beralih ke model lainnya untuk memastikan
          ketersediaan 24/7.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-brand-accent/40 mb-2">
          Layer 4 — Active Analysis
        </div>
        <h3 className="text-[13px] font-medium text-brand-light mb-1.5">
          Analisis On-The-Fly
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Data harga, cuaca, dan rekomendasi pupuk tidak lagi membutuhkan proses
          cron job mingguan yang berat. Semua laporan disintesis secara
          real-time berdasarkan pengetahuan model AI.
        </p>
      </div>
    </div>
  );
}

export default Arsitektur;
