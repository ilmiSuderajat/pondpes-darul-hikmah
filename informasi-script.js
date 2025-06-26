// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
document.addEventListener('DOMContentLoaded', async function() {
    const informasiGrid = document.getElementById('informasi-grid');
    if (!informasiGrid) return;
    
    try {
        // 1. Buat query untuk mengambil data dari koleksi 'informasi', diurutkan berdasarkan yang terbaru
        const q = query(collection(db, 'informasi'), orderBy('createdAt', 'desc'));
        
        // 2. Jalankan query untuk mendapatkan semua dokumen
        const querySnapshot = await getDocs(q);
        
        informasiGrid.innerHTML = ''; // Kosongkan tulisan "Memuat..."

        // Cek jika tidak ada informasi sama sekali
        if (querySnapshot.empty) {
            informasiGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada informasi yang dipublikasikan.</p>';
            return;
        }
        
        // 3. Lakukan perulangan untuk setiap dokumen yang ditemukan
        querySnapshot.forEach(doc => {
            const info = doc.data();
            const tanggal = info.createdAt ? new Date(info.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
            
            // PERUBAHAN DI SINI: Link sekarang mengarah ke detail-informasi.html dengan ID yang benar
            const linkTujuan = `detail-informasi.html?id=${doc.id}`;

            const kartuHTML = `
                <article class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group">
                    <a href="${linkTujuan}" class="block">
                        <img src="${info.gambar}" alt="Gambar untuk ${info.judul}" class="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300">
                    </a>
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex-grow">
                            <p class="text-sm text-blue-700 font-semibold">Pengumuman</p>
                            <a href="${linkTujuan}" class="block mt-2">
                                <h3 class="text-2xl font-bold text-gray-900 group-hover:text-blue-600">${info.judul}</h3>
                            </a>
                            <p class="mt-3 text-base text-gray-600">
                               ${info.deskripsi}
                            </p>
                        </div>
                        <div class="mt-6 flex items-center justify-between text-sm text-gray-500">
                           <span>${tanggal}</span>
                           <span class="font-semibold text-blue-600 group-hover:underline">Baca Selengkapnya &rarr;</span>
                        </div>
                    </div>
                </article>
            `;
            // 4. Tambahkan kartu ke dalam grid
            informasiGrid.innerHTML += kartuHTML;
        });
    } catch (error) {
        console.error("Error mengambil data informasi: ", error);
        informasiGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat data informasi. Coba lagi nanti.</p>';
    }
});

