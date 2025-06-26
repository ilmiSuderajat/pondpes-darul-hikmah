// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// PENTING: Salin-tempel konfigurasi Firebase yang SAMA PERSIS dengan di file lainnya
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

document.addEventListener('DOMContentLoaded', function() {
    const listContainer = document.getElementById('arsip-list-container');
    if (!listContainer) return;

    const q = query(collection(db, "kunjungan"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        // Hapus loading state atau isi sebelumnya
        listContainer.innerHTML = ''; 
        if (snapshot.empty) {
            listContainer.innerHTML = '<div class="bg-white p-10 text-center text-gray-500">Belum ada data kunjungan yang tercatat.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const kunjungan = doc.data();
            
            // Format data biar enak dibaca
            const waktu = kunjungan.timestamp ? new Date(kunjungan.timestamp.seconds * 1000).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
            const lokasi = `${kunjungan.city || 'Tidak diketahui'}, ${kunjungan.country || ''}`;
            const perangkat = `${kunjungan.deviceModel || kunjungan.deviceType || 'N/A'}`;
            const sistem = `${kunjungan.os || 'N/A'} ${kunjungan.osVersion || ''}`;
            const browser = kunjungan.browser || 'N/A';
            const halaman = kunjungan.page || '/';
            
            // Buat HTML untuk setiap item
            // Strukturnya bisa jadi kartu di mobile dan baris tabel di desktop
            const itemHTML = `
                <div class="bg-white p-4 border-b border-gray-200 md:grid md:grid-cols-5 md:gap-4 md:p-5 md:items-center">
                    
                    <!-- Kolom 1: Waktu Kunjungan -->
                    <div class="mb-2 md:mb-0">
                        <p class="font-bold text-sm text-gray-500 md:hidden">Waktu:</p>
                        <p class="text-gray-900 text-sm">${waktu}</p>
                    </div>

                    <!-- Kolom 2: IP & Lokasi -->
                    <div class="mb-2 md:mb-0">
                        <p class="font-bold text-sm text-gray-500 md:hidden">Lokasi:</p>
                        <p class="text-gray-900 font-semibold">${kunjungan.ip || 'N/A'}</p>
                        <p class="text-gray-600 text-sm">${lokasi}</p>
                    </div>

                    <!-- Kolom 3: Perangkat -->
                    <div class="mb-2 md:mb-0">
                        <p class="font-bold text-sm text-gray-500 md:hidden">Perangkat:</p>
                        <p class="text-gray-900 text-sm">${perangkat}</p>
                    </div>

                    <!-- Kolom 4: Sistem & Browser -->
                    <div class="mb-2 md:mb-0">
                        <p class="font-bold text-sm text-gray-500 md:hidden">Sistem:</p>
                        <p class="text-gray-900 font-semibold text-sm">${sistem}</p>
                        <p class="text-gray-600 text-sm">${browser}</p>
                    </div>

                    <!-- Kolom 5: Halaman -->
                    <div class="mb-2 md:mb-0">
                        <p class="font-bold text-sm text-gray-500 md:hidden">Halaman:</p>
                        <p class="text-gray-900 break-words text-sm">${halaman}</p>
                    </div>
                </div>
            `;
            listContainer.innerHTML += itemHTML;
        });
    });
});

