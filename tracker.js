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
// --- FUNGSI BARU YANG LEBIH PINTAR UNTUK MENDETEKSI DETAIL PERANGKAT ---
const parseUserAgent = () => {
    const ua = navigator.userAgent;
    let browser = "Lainnya";
    let os = "Lainnya";
    let osVersion = "";
    let deviceModel = "";

    // Deteksi OS dan Versinya
    if (/windows phone/i.test(ua)) {
        os = "Windows Phone";
    } else if (/android/i.test(ua)) {
        os = "Android";
        const androidVersionMatch = ua.match(/android\s([0-9\.]+)/i);
        if (androidVersionMatch) osVersion = androidVersionMatch[1];
        // Mencoba mengambil model dari bagian dalam kurung
        const modelMatch = ua.match(/\(([^;]+); ([^;]+); ([^\)]+)\)/);
        if(modelMatch && modelMatch[3]) deviceModel = modelMatch[3].trim();

    } else if (/iPad|iPhone|iPod/.test(ua)) {
        os = "iOS";
        const osVersionMatch = ua.match(/os ([\d_]+)/i);
        if (osVersionMatch) osVersion = osVersionMatch[1].replace(/_/g, '.');
        deviceModel = "Apple Device"; // Model spesifik sulit didapat dari UA
    } else if (/mac/i.test(ua)) {
        os = "macOS";
    } else if (/win/i.test(ua)) {
        os = "Windows";
    } else if (/linux/i.test(ua)) {
        os = "Linux";
    }

    // Deteksi Browser
    if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
    else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    
    return { browser, os, osVersion, deviceModel };
};

// Fungsi untuk mendeteksi tipe perangkat
const getDeviceType = () => {
    // ... (fungsi getDeviceType tetap sama)
};

// Fungsi utama untuk melacak pengunjung
async function trackVisitor() {
    try {
        if (sessionStorage.getItem('visitorTracked')) return;

        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return;
        
        const locationData = await response.json();
        const userAgentInfo = parseUserAgent();
        
        // Siapkan data yang lebih lengkap
        const visitData = {
            timestamp: serverTimestamp(),
            deviceType: getDeviceType(),
            ip: locationData.ip,
            city: locationData.city || "Unknown",
            country: locationData.country_name || "Unknown",
            browser: userAgentInfo.browser,
            os: userAgentInfo.os,
            osVersion: userAgentInfo.osVersion,
            deviceModel: userAgentInfo.deviceModel,
            page: window.location.pathname,
        };
        
        await addDoc(collection(db, "kunjungan"), visitData);
        sessionStorage.setItem('visitorTracked', 'true');
        console.log("Kunjungan (dengan detail model) berhasil dicatat:", visitData);

    } catch (error) {
        console.error("Gagal melacak pengunjung:", error);
    }
}

// Jalankan pelacak saat halaman dimuat
trackVisitor();

