// Import fungsi-fungsi dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- INISIALISASI ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi untuk mendeteksi tipe perangkat
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "Mobile";
    }
    return "Desktop";
};

// Fungsi utama untuk melacak pengunjung
async function trackVisitor() {
    try {
        // Panggil API Geolocation untuk mendapatkan lokasi
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return; // Jika gagal, jangan lakukan apa-apa
        
        const locationData = await response.json();
        
        // Siapkan data yang akan disimpan
        const visitData = {
            timestamp: serverTimestamp(),
            deviceType: getDeviceType(),
            ip: locationData.ip,
            city: locationData.city,
            region: locationData.region,
            country: locationData.country_name,
            userAgent: navigator.userAgent
        };
        
        // Simpan data ke koleksi 'kunjungan' di Firestore
        await addDoc(collection(db, "kunjungan"), visitData);
        console.log("Kunjungan berhasil dicatat.");

    } catch (error) {
        console.error("Gagal melacak pengunjung:", error);
    }
}

// Jalankan pelacak saat halaman dimuat
trackVisitor();
