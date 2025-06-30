// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config (sesuaikan)
const firebaseConfig = {
  apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
  authDomain: "ponpes-darul-hikmah.firebaseapp.com",
  projectId: "ponpes-darul-hikmah",
  storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
  messagingSenderId: "981565268728",
  appId: "1:981565268728:web:057f00dde0905dd3c0910d",
  measurementId: "G-HRPEJ9GNS1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getWebGLInfo = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { vendor: "N/A", renderer: "N/A" };
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            return {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
        }
        return { vendor: "N/A", renderer: "N/A" };
    } catch (e) {
        return { vendor: "Error", renderer: "Error" };
    }
};

// Fungsi parse User Agent (pakai yang sudah kamu punya)
const parseUserAgent = () => {
  const ua = navigator.userAgent;
  // ... (sesuai kode sebelumnya)
  // Buat lengkap sesuai yang kamu punya di tracker.js
  // Contoh singkat:
  let browser = "Lainnya";
  let os = "Lainnya";
  let osVersion = "";
  let deviceModel = "";
  if (/android/i.test(ua)) {
    os = "Android";
    const androidVersionMatch = ua.match(/android\s([0-9\.]+)/i);
    if (androidVersionMatch) osVersion = androidVersionMatch[1];
    const modelMatch = ua.match(/\(([^;]+);\s([^;]+);\s([^)]+)\)/);
    if (modelMatch && modelMatch[3]) deviceModel = modelMatch[3].split(' Build/')[0].trim();
  }
  // Tambahkan deteksi lain sesuai kebutuhan...
  if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  return { browser, os, osVersion, deviceModel };
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
};

// Fungsi cek VPN menggunakan ip-api.com
async function checkVPN(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,lat,lon,isp,proxy,query`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.status === "success") {
      return data.proxy === true;
    }
    return false;
  } catch {
    return false;
  }
}

// Fungsi utama tracking visitor
async function trackVisitor() {
  try {
    if (sessionStorage.getItem('visitorTracked')) return;

    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return;

    const locationData = await response.json();
    const userAgentInfo = parseUserAgent();

    const isVPN = await checkVPN(locationData.ip);
    const webglInfo = getWebGLInfo(); // <-- "KAMERA" DINYALAKAN DI SINI

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
      dpr: window.devicePixelRatio,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isVPN: isVPN,
      page: window.location.pathname,
      webglVendor: webglInfo.vendor,
      webglRenderer: webglInfo.renderer
    };

    await addDoc(collection(db, "kunjungan"), visitData);
    sessionStorage.setItem('visitorTracked', 'true');
    console.log("Kunjungan berhasil dicatat:", visitData);
  } catch (error) {
    console.error("Gagal melacak pengunjung:", error);
  }
}

// Jalankan tracking
trackVisitor();
