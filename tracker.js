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

// Ambil WebGL fingerprint (dipanggil di dalam fungsi utama)
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

// Ambil canvas fingerprint (hash dari data URL)
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

// Hashing SHA-256 untuk canvas fingerprint (async)
async function hashCanvasFingerprint(dataUrl) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Parsing User Agent sederhana
const parseUserAgent = () => {
  const ua = navigator.userAgent;
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
  if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  return { browser, os, osVersion, deviceModel };
};

// Deteksi device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
};

// Cek VPN dari ip-api.com (pakai HTTPS biar aman)
async function checkVPN(ip) {
  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,proxy`);
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

async function trackVisitor() {
  try {
    // Cegah tracking ganda dalam sesi yang sama
    if (sessionStorage.getItem('visitorTracked')) return;

    // Ambil IP dan lokasi dari ipapi.co
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return;

    const locationData = await response.json();

    // Ambil fingerprint WebGL & Canvas
    const webglData = getWebGLFingerprint();
    const canvasDataUrl = getCanvasFingerprint();
    const canvasHash = await hashCanvasFingerprint(canvasDataUrl);

    // User Agent info
    const userAgentInfo = parseUserAgent();

    // VPN detection
    const isVPN = await checkVPN(locationData.ip);

    // Data device lain
    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
    const deviceMemory = navigator.deviceMemory || 'Unknown';

    // Siapkan data kunjungan
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
      webglVendor: webglData.webglVendor,
      canvasFingerprintHash: canvasHash,
      cpuCores: cpuCores,
      deviceMemory: deviceMemory,
    };

    // Kirim ke Firestore
    await addDoc(collection(db, "kunjungan"), visitData);

    sessionStorage.setItem('visitorTracked', 'true');
    console.log("Kunjungan berhasil dicatat:", visitData);
  } catch (error) {
    console.error("Gagal melacak pengunjung:", error);
  }
}

// Jalankan tracking
trackVisitor();
