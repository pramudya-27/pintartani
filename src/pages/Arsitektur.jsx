import {Smartphone, ShieldCheck, Brain, Zap} from "lucide-react";

function Arsitektur() {
  return (
    <div className="p-7 animate-fade-in max-w-3xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5">
        Cara Kerja PintarTani
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 leading-relaxed">
        Bagaimana sistem cerdas kami memproses dan menyajikan data pertanian untuk membantu Anda di ladang secara cepat dan mudah dipahami.
      </p>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#8dc868]/20 flex items-center justify-center shrink-0">
            <Smartphone size={18} className="text-[#8dc868]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Langkah 1 — Pintu Masuk (Tampilan Aplikasi)
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Halaman Web Yang Mudah Digunakan
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Seperti pintu gerbang kebun, ini adalah tempat Anda berinteraksi. Anda cukup mengisi pilihan sederhana (seperti memilih jenis tanaman atau kota) melalui HP atau komputer, lalu mengirimkannya untuk dianalisis.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#dcb45a]/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-[#dcb45a]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Langkah 2 — Penjaga Keamanan & Pembagi Tugas
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Pemeriksaan Keamanan & Kuota
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Sistem bertindak seperti mandor kebun. Bagian ini memastikan bahwa Anda telah masuk (login) secara aman, memeriksa sisa kuota harian Anda, dan merapikan pertanyaan Anda agar siap diproses tanpa kendala.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#b5cc6a]/20 flex items-center justify-center shrink-0">
            <Brain size={18} className="text-[#b5cc6a]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Langkah 3 — Otak Pintar (Asisten AI)
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Pakar Pertanian Digital
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Kami menggunakan beberapa "asisten pintar" (model Kecerdasan Buatan/AI) di belakang layar. Jika salah satu asisten sedang sibuk atau ada kendala koneksi, asisten lainnya akan secara otomatis menggantikan tugas tersebut demi memastikan sistem siap melayani Anda 24 jam nonstop.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#6496dc]/20 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[#6496dc]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Langkah 4 — Hasil Panen Informasi
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Analisis Langsung dan Cepat
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Tidak perlu menunggu berhari-hari. Data harga pasar terkini, prakiraan cuaca, dan rekomendasi takaran pupuk diolah dan disajikan secara instan detik itu juga ke layar HP Anda, lengkap dengan saran tindakan yang praktis.
        </p>
      </div>
    </div>
  );
}

export default Arsitektur;
