// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// --- ELEMEN-ELEMEN FORM ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loginErrorDiv = document.getElementById('login-error');
const errorMessageSpan = document.getElementById('error-message');
const btnText = loginButton.querySelector('.btn-text');
const btnLoading = loginButton.querySelector('.btn-loading');


// --- FUNGSI UTAMA SAAT FORM DI-SUBMIT ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah form refresh halaman

    // Tampilkan loading & matikan tombol
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    loginButton.disabled = true;
    loginErrorDiv.classList.add('hidden');

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Coba login pake email dan password ke Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Jika BERHASIL:
        const user = userCredential.user;
        console.log('Login berhasil:', user.email);
        
        // Alihkan ke halaman panel admin
        window.location.href = 'admin.html';

    } catch (error) {
        // Jika GAGAL:
        console.error('Error login:', error);
        
        // Tampilkan pesan error yang lebih ramah
        let message = 'Terjadi kesalahan. Coba lagi.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = 'Email atau password yang Anda masukkan salah.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Format email tidak valid.';
        }
        
        errorMessageSpan.textContent = message;
        loginErrorDiv.classList.remove('hidden');

    } finally {
        // Kembalikan tombol ke kondisi semula
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        loginButton.disabled = false;
    }
});
