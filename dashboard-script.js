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
    const tabelBody = document.getElementById('tabel-arsip-body');
    if (!tabelBody) return;

    const q = query(collection(db, "kunjungan"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        tabelBody.innerHTML = ''; 
        if (snapshot.empty) {
            tabelBody.innerHTML = '<tr><td colspan="5" class="text-center p-10 text-gray-500">Belum ada data kunjungan yang tercatat.</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const kunjungan = doc.data();
            
            const waktu = kunjungan.timestamp ? new Date(kunjungan.timestamp.seconds * 1000).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
            const lokasi = `${kunjungan.city || 'N/A'}, ${kunjungan.country || ''}`;
            const perangkat = `${kunjungan.deviceModel || kunjungan.deviceType || 'N/A'}`;
            const sistem = `${kunjungan.os || 'N/A'} ${kunjungan.osVersion || ''}`;
            const browser = kunjungan.browser || 'N/A';
            const halaman = kunjungan.page || '/';
            
            const barisHTML = `
                <tr>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${waktu}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p class="text-gray-900 font-semibold">${kunjungan.ip || 'N/A'}</p>
                        <p class="text-gray-600">${lokasi}</p>
                    </td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${perangkat}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p class="text-gray-900 font-semibold">${sistem}</p>
                        <p class="text-gray-600">${browser}</p>
                    </td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${halaman}</p></td>
                </tr>
            `;
            tabelBody.innerHTML += barisHTML;
        });
    });
});

