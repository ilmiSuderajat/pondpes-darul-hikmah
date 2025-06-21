// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// PENTING: Salin-tempel konfigurasi Firebase lo di sini juga!
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

// Fungsi utama untuk mengambil dan menampilkan data
async function muatKajian() {
    const kontenKajianContainer = document.getElementById('konten-kajian');
    
    // 1. Baca ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const kajianId = urlParams.get('id');

    // MATA-MATA 1: Cek apakah ID-nya kebaca dengan benar
    console.log("Mencoba memuat kajian dengan ID:", kajianId);

    // Jika tidak ada ID di URL, tampilkan error
    if (!kajianId) {
         kontenKajianContainer.innerHTML = '<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Error</h2><p class="text-xl text-gray-600 mt-4">ID Kajian tidak ditemukan di URL.</p></div>';
         return;
    }

    try {
        // 2. Ambil satu dokumen spesifik dari Firestore berdasarkan ID
        const docRef = doc(db, "kajian", kajianId);

        // MATA-MATA 2: Cek path yang dicari di Firestore
        console.log("Mencari dokumen di path:", docRef.path);

        const docSnap = await getDoc(docRef);

        // 3. Cek apakah dokumennya ada
        if (docSnap.exists()) {
            // MATA-MATA 3: Konfirmasi kalau dokumennya ketemu
            console.log("Dokumen ditemukan!", docSnap.data());

            const kajianData = docSnap.data();
            
            // Ganti judul halaman
            document.title = `${kajianData.judul} - PP Darul Hikmah`;
            
            // Buat HTML lengkapnya
            const tanggal = kajianData.createdAt ? new Date(kajianData.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'Tanggal tidak tersedia';
            const detailHTML = `
                <article>
                    <header class="text-center mb-8">
                        <p class="text-base text-green-700 font-semibold">${kajianData.kategori}</p>
                        <h1 class="mt-2 text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight font-kanit">${kajianData.judul}</h1>
                        <div class="mt-6 flex justify-center items-center">
                            <!-- Foto Penulis bisa ditambahkan di sini jika ada di data -->
                            <div class="ml-4 text-left">
                                <p class="text-sm font-medium text-gray-900">${kajianData.penulis}</p>
                                <div class="flex space-x-1 text-sm text-gray-500">
                                    <time datetime="${kajianData.createdAt?.toDate().toISOString() || ''}">${tanggal}</time>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <figure class="mb-8">
                        <img src="${kajianData.gambar}" alt="Gambar utama untuk ${kajianData.judul}" class="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg">
                    </figure>
                    
                    <div class="prose prose-lg max-w-none article-content">
                        ${kajianData.konten}
                    </div>
                </article>
            `;
            
            // Tampilkan hasilnya
            kontenKajianContainer.innerHTML = detailHTML;

        } else {
            // MATA-MATA 4: Konfirmasi kalau dokumennya GAGAL ditemukan
            console.log("Dokumen TIDAK ditemukan untuk ID:", kajianId, ". Pastikan ID dan nama koleksi sudah benar.");
            
            // Jika dokumen tidak ditemukan di Firebase
            kontenKajianContainer.innerHTML = '<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Error 404</h2><p class="text-xl text-gray-600 mt-4">Kajian yang Anda cari tidak ditemukan di database!</p><a href="kajian.html" class="mt-8 inline-block bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600">Kembali ke Daftar Kajian</a></div>';
        }
    } catch (error) {
        // Jika ada error koneksi ke Firebase
        console.error("Error mengambil dokumen:", error);
        kontenKajianContainer.innerHTML = `<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-600">Koneksi Gagal</h2><p class="text-xl text-gray-600 mt-4">Tidak bisa terhubung ke database. Pastikan koneksi internet dan konfigurasi Firebase Anda benar.</p><p class="text-xs text-gray-400 mt-2">${error.message}</p></div>`;
    }
}

// Jalankan fungsi saat halaman selesai dimuat
muatKajian();
