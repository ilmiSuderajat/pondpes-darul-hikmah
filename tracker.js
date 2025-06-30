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

// Ambil WebGL fingerprint
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { webglVendor: 'Unknown', webglRenderer: 'Unknown' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

    return { webglVendor: vendor, webglRenderer: renderer };
  } catch {
    return { webglVendor: 'Error', webglRenderer: 'Error' };
  }
}

// Ambil canvas fingerprint (hash data URL)
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('darul-hikmah', 2, 15);
    return canvas.toDataURL();
  } catch {
    return 'error';
  }
}

// Tambahan fingerprint
const webglData = getWebGLFingerprint();
const canvasData = getCanvasFingerprint();
const cpuCores = navigator.hardwareConcurrency || 'Unknown';
const deviceMemory = navigator.deviceMemory || 'Unknown';


// Kirim data ini bersama data IP, screen, dll ke Firebase


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

// Fungsi hashing SHA-256 untuk canvas fingerprint
async function hashCanvasFingerprint(dataUrl) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Fungsi utama tracking visitor
async function trackVisitor() {
  try {
    if (sessionStorage.getItem('visitorTracked')) return;

    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return;

    const locationData = await response.json();
    const userAgentInfo = parseUserAgent();
     // Ambil canvas fingerprint (data URL)
    const canvasDataUrl = getCanvasFingerprint();
    // Hash canvas fingerprint-nya dulu
    const canvasHash = await hashCanvasFingerprint(canvasDataUrl);
    const isVPN = await checkVPN(locationData.ip);
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
      webglRenderer: webglData.webglRenderer,
      canvasFingerprint: canvasData,
      cpuCores: cpuCores,
      canvasFingerprintHash: canvasHash,  // simpan hash di sini
      deviceMemory: deviceMemory,
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
