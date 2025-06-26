// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
  authDomain: "ponpes-darul-hikmah.firebaseapp.com",
  projectId: "ponpes-darul-hikmah",
  storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
  messagingSenderId: "981565268728",
  appId: "1:981565268728:web:057f00dde0905dd3c0910d",
  measurementId: "G-HRPEJ9GNS1"
};

// --- INISIALISASI ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi utama yang dijalankan saat halaman selesai dimuat
async function muatDetailInformasi() {
    const kontenContainer = document.getElementById('konten-informasi');
    if (!kontenContainer) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const infoId = urlParams.get('id');

        if (!infoId) {
            kontenContainer.innerHTML = '<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Error</h2><p class="text-xl text-gray-600 mt-4">ID Informasi tidak ditemukan.</p></div>';
            return;
        }

        const docRef = doc(db, "informasi", infoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const info = docSnap.data();
            document.title = `${info.judul} - PP Darul Hikmah`;

            const detailHTML = `
                <article>
                    <header class="text-center mb-8">
                        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight font-kanit">${info.judul}</h1>
                        <p class="mt-4 text-gray-500">Dipublikasikan pada ${new Date(info.createdAt.seconds * 1000).toLocaleDateString("id-ID")}</p>
                    </header>
                    <figure class="mb-8">
                        <img src="${info.gambar}" alt="Gambar untuk ${info.judul}" class="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg">
                    </figure>
                    <div class="prose prose-lg max-w-none">
                        <p class="text-lg text-gray-600">${info.deskripsi}</p>
                        <!-- Jika ada konten lengkap, bisa ditambahkan di sini -->
                    </div>
                     <div class="mt-10 text-center">
                        <a href="${info.link || 'informasi.html'}" class="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
                            Kunjungi Tautan
                        </a>
                    </div>
                </article>
            `;
            kontenContainer.innerHTML = detailHTML;
        } else {
            kontenContainer.innerHTML = '<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">404</h2><p class="text-xl text-gray-600 mt-4">Informasi tidak ditemukan.</p></div>';
        }
    } catch (error) {
        console.error("Error mengambil detail informasi:", error);
        kontenContainer.innerHTML = `<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Gagal Memuat</h2><p class="text-xl text-gray-600 mt-4">Tidak bisa terhubung ke database.</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', muatDetailInformasi);
