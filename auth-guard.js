// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app); // Inisialisasi Firebase Authentication

// --- LOGIKA SATPAM PENJAGA (VERSI BARU & LEBIH SABAR) ---

// 1. Sembunyikan halaman dulu biar nggak "kedip" atau keliatan sesaat sebelum di-redirect.
document.body.style.visibility = 'hidden';

// onAuthStateChanged adalah "mata-mata" yang selalu ngecek status login.
// Dia akan nunggu sampe dapet jawaban pasti dari Firebase.
onAuthStateChanged(auth, (user) => {
  // Cek apakah ada user yang sedang login
  if (user) {
    // Jika ADA user (sudah login), baru kita tampilkan halamannya.
    console.log("Akses diizinkan untuk:", user.email);
    document.body.style.visibility = 'visible';
  } else {
    // Jika TIDAK ADA user (belum login), baru kita tendang dia balik ke halaman login.
    console.log("Akses ditolak! Mengalihkan ke halaman login...");
    // Pastikan file 'login.html' ada di folder yang sama.
    window.location.href = 'login.html';
  }
});
