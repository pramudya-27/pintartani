import {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Beranda from "./pages/Beranda";
import Fitur from "./pages/Fitur";
import Arsitektur from "./pages/Arsitektur";
import Tentang from "./pages/Tentang";
import Akun from "./pages/Akun";
import Riwayat from "./pages/Riwayat";

function App() {
  const [currentPage, setCurrentPage] = useState("beranda");
  const [openCard, setOpenCard] = useState(null);
  
  const [quota, setQuota] = useState(() => {
    const q = localStorage.getItem("pt_quota");
    return q !== null ? parseInt(q, 10) : 5;
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    return localStorage.getItem("pt_user") || null;
  });

  useEffect(() => {
    if (!loggedInUser && currentPage === "riwayat") {
      setCurrentPage("beranda");
    }
  }, [loggedInUser, currentPage]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col animate-web-entry">
      <div className="bg-grid-pattern absolute inset-0 z-0 pointer-events-none"></div>

      <Navbar currentPage={currentPage} setPage={setCurrentPage} loggedInUser={loggedInUser} />

      <main className="flex-1 overflow-y-auto z-10 flex flex-col">
        <div key={currentPage} className="animate-page-entry flex-1 flex flex-col">
          {currentPage === "beranda" && (
            <Beranda setPage={setCurrentPage} setOpenCard={setOpenCard} />
          )}
          {currentPage === "fitur" && (
            <Fitur
              openCard={openCard}
              setOpenCard={setOpenCard}
              setQuota={setQuota}
              loggedInUser={loggedInUser}
            />
          )}
          {currentPage === "arsitektur" && <Arsitektur />}
          {currentPage === "riwayat" && <Riwayat loggedInUser={loggedInUser} />}
          {currentPage === "tentang" && <Tentang />}
          {currentPage === "akun" && (
            <Akun
              quota={quota}
              setQuota={setQuota}
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
            />
          )}
        </div>
      </main>

      <footer className="flex items-center justify-between px-6 py-3 border-t border-brand-border bg-brand-bg relative z-10 mt-auto">
        <span className="text-[10px] text-brand-light/20">
          © 2025 PintarTani
        </span>
        <span className="text-[10px] text-brand-accent/30">
          Built by Jobank
        </span>
      </footer>
    </div>
  );
}

export default App;
