// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// (Ganti dengan konfigurasi proyek Firebase kamu sendiri)
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
    const kajianGrid = document.getElementById('kajian-grid');
    
    try {
        // 1. Buat query untuk mengambil data dari koleksi 'kajian', diurutkan berdasarkan yang terbaru
        const q = query(collection(db, 'kajian'), orderBy('createdAt', 'desc'));
        
        // 2. Jalankan query untuk mendapatkan semua dokumen
        const querySnapshot = await getDocs(q);
        
        // Kosongkan tulisan "Memuat..."
        kajianGrid.innerHTML = ''; 

        // Cek jika tidak ada kajian sama sekali
        if (querySnapshot.empty) {
            kajianGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada kajian yang dipublikasikan.</p>';
            return;
        }
        
        // 3. Lakukan perulangan untuk setiap dokumen yang ditemukan
        querySnapshot.forEach(doc => {
            const kajian = doc.data();
            // Format tanggal biar lebih cantik
            const tanggal = kajian.createdAt ? new Date(kajian.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
            
            // 4. Buat HTML untuk kartu kajian
            const kartuHTML = `
                <article class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group">
                    <!-- INI KUNCINYA: href sekarang pake ID asli dari Firebase (doc.id) -->
                    <a href="detail-kajian.html?id=${doc.id}" class="block">
                        <img src="${kajian.gambar}" alt="Gambar untuk ${kajian.judul}" class="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300">
                    </a>
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex-grow">
                            <p class="text-sm text-green-700 font-semibold">${kajian.kategori}</p>
                            <a href="detail-kajian.html?id=${doc.id}" class="block mt-2">
                                <h3 class="text-2xl font-bold text-gray-900 group-hover:text-green-600">${kajian.judul}</h3>
                            </a>
                            <p class="mt-3 text-base text-gray-600">${kajian.ringkasan}</p>
                        </div>
                        <div class="mt-6 flex items-center">
                            <!-- Foto penulis bisa ditambahkan di sini jika ada -->
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">${kajian.penulis}</p>
                                <div class="flex space-x-1 text-sm text-gray-500">
                                    <time datetime="${kajian.createdAt?.seconds}">${tanggal}</time>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
            // 5. Tambahkan kartu ke dalam grid
            kajianGrid.innerHTML += kartuHTML;
        });
    } catch (error) {
        console.error("Error mengambil data kajian: ", error);
        kajianGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat data kajian. Coba lagi nanti.</p>';
    }
});
