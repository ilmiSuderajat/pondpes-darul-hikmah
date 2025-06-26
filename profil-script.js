// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// PENTING: Salin-tempel konfigurasi Firebase yang SAMA PERSIS dengan di admin-script.js
const firebaseConfig = {
  apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
  authDomain: "ponpes-darul-hikmah.firebaseapp.com",
  projectId: "ponpes-darul-hikmah",
  storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
  messagingSenderId: "981565268728",
  appId: "1:981565268728:web:057f00dde0905dd3c0910d",
  measurementId: "G-HRPEJ9GNS1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi utama yang dijalankan saat halaman selesai dimuat
async function muatHalamanProfil() {
    const kontenContainer = document.getElementById('konten-profil');
    const judulHalaman = document.getElementById('profil-page-title');

    if (!kontenContainer) return;

    try {
        // 1. Referensi langsung ke dokumen 'profil' di dalam koleksi 'halaman'
        const docRef = doc(db, "halaman", "profil");
        
        // 2. Ambil dokumennya
        const docSnap = await getDoc(docRef);

        // 3. Cek apakah dokumennya ada
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Ganti judul halaman di header
            if (judulHalaman && data.judul) {
                judulHalaman.textContent = data.judul;
            }
            
            // Ganti judul tab browser
            document.title = `${data.judul || 'Profil'} - PP Darul Hikmah`;
            
            // Tampilkan konten lengkapnya
            kontenContainer.innerHTML = data.konten || '<p>Konten belum tersedia.</p>';

        } else {
            // Jika dokumen profil belum pernah dibuat oleh admin
            kontenContainer.innerHTML = '<p class="text-center text-gray-500">Halaman profil belum diatur oleh admin.</p>';
        }
    } catch (error) {
        // Jika ada error koneksi ke Firebase
        console.error("Error mengambil data profil:", error);
        kontenContainer.innerHTML = `<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Koneksi Gagal</h2><p class="text-xl text-gray-600 mt-4">Tidak bisa memuat halaman profil.</p></div>`;
    }
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', muatHalamanProfil);
