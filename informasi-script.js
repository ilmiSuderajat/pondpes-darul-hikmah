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
    const informasiList = document.getElementById('informasi-list');
    
    try {
        // 1. Buat query untuk mengambil data dari koleksi 'informasi', diurutkan berdasarkan yang terbaru
        const q = query(collection(db, 'informasi'), orderBy('createdAt', 'desc'));
        
        // 2. Jalankan query untuk mendapatkan semua dokumen
        const querySnapshot = await getDocs(q);
        
        informasiList.innerHTML = ''; // Kosongkan tulisan "Memuat..."

        // Cek jika tidak ada informasi sama sekali
        if (querySnapshot.empty) {
            informasiList.innerHTML = '<p class="text-center text-gray-500">Belum ada informasi yang dipublikasikan.</p>';
            return;
        }
        
        // 3. Lakukan perulangan untuk setiap dokumen yang ditemukan
        querySnapshot.forEach(doc => {
            const info = doc.data();
            const tanggal = info.createdAt ? new Date(info.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
            
            // 4. Buat HTML untuk setiap item informasi
            const itemHTML = `
                <article class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row group">
                    <div class="md:w-1/3">
                         <a href="${info.link || '#'}" target="_blank" class="block h-full">
                            <img src="${info.gambar}" alt="Gambar untuk ${info.judul}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300">
                        </a>
                    </div>
                    <div class="p-6 flex flex-col flex-grow md:w-2/3">
                        <div>
                            <p class="text-sm text-gray-500">${tanggal}</p>
                            <a href="${info.link || '#'}" target="_blank" class="block mt-2">
                                <h3 class="text-2xl font-bold text-gray-900 group-hover:text-green-600">${info.judul}</h3>
                            </a>
                            <p class="mt-3 text-base text-gray-600">
                               ${info.deskripsi}
                            </p>
                        </div>
                        <div class="mt-6">
                           <a href="${info.link || '#'}" target="_blank" class="text-green-700 font-semibold hover:underline">
                                Selengkapnya <i class="fas fa-arrow-right ml-1"></i>
                           </a>
                        </div>
                    </div>
                </article>
            `;
            // 5. Tambahkan item ke dalam daftar
            informasiList.innerHTML += itemHTML;
        });
    } catch (error) {
        console.error("Error mengambil data informasi: ", error);
        informasiList.innerHTML = '<p class="text-center text-red-500">Gagal memuat data informasi. Coba lagi nanti.</p>';
    }
});
