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

// --- FUNGSI PENDETEKSI PERANGKAT (LENGKAP) ---

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
        
        // Mencoba mengambil model dari bagian dalam kurung - Dibuat lebih aman
        const modelMatch = ua.match(/\(([^;]+);\s([^;]+);\s([^)]+)\)/);
        if(modelMatch && modelMatch[3]) {
            const modelString = modelMatch[3].trim();
            // Membersihkan 'Build/...' dari string model
            deviceModel = modelString.split(' Build/')[0];
        }

    } else if (/iPad|iPhone|iPod/.test(ua)) {
        os = "iOS";
        const osVersionMatch = ua.match(/os ([\d_]+)/i);
        if (osVersionMatch) osVersion = osVersionMatch[1].replace(/_/g, '.');
        
        if(/iPad/.test(ua)) deviceModel = "iPad";
        else if(/iPhone/.test(ua)) deviceModel = "iPhone";
        else if(/iPod/.test(ua)) deviceModel = "iPod";
        else deviceModel = "Apple Device";

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

// Fungsi getDeviceType yang sudah diisi dengan benar
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
        if (sessionStorage.getItem('visitorTracked')) return;

        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return;
        
        const locationData = await response.json();
        const userAgentInfo = parseUserAgent();
        
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
        console.log("Kunjungan (v3) berhasil dicatat:", visitData);

    } catch (error) {
        console.error("Gagal melacak pengunjung:", error);
    }
}

// Jalankan pelacak saat halaman dimuat
trackVisitor();