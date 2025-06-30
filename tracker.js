// Import fungsi-fungsi dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
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

// --- FUNGSI-FUNGSI PENDETEKSI ---
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

const parseUserAgent = () => {
    const ua = navigator.userAgent;
    let browser = "Lainnya", os = "Lainnya", osVersion = "", deviceModel = "";
    if (/android/i.test(ua)) {
        os = "Android";
        const androidVersionMatch = ua.match(/android\s([0-9\.]+)/i);
        if (androidVersionMatch) osVersion = androidVersionMatch[1];
        const modelMatch = ua.match(/\(([^;]+);\s([^;]+);\s([^)]+)\)/);
        if (modelMatch && modelMatch[3]) deviceModel = modelMatch[3].split(' Build/')[0].trim();
    } else if (/iPad|iPhone|iPod/.test(ua)) {
        os = "iOS";
        const osVersionMatch = ua.match(/os ([\d_]+)/i);
        if (osVersionMatch) osVersion = osVersionMatch[1].replace(/_/g, '.');
        if(/iPad/.test(ua)) deviceModel = "iPad"; else if(/iPhone/.test(ua)) deviceModel = "iPhone"; else if(/iPod/.test(ua)) deviceModel = "iPod";
    } else if (/mac/i.test(ua)) os = "macOS"; else if (/win/i.test(ua)) os = "Windows";

    if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
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

async function trackVisitor() {
    try {
        if (sessionStorage.getItem('visitorTracked_v5')) return;

        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,city,query,isp,proxy');
        if (!response.ok) return;
        
        const ipData = await response.json();
        if (ipData.status !== 'success') return;

        const userAgentInfo = parseUserAgent();
        const webglInfo = getWebGLInfo();
        
        const visitData = {
            timestamp: serverTimestamp(),
            deviceType: getDeviceType(),
            ip: ipData.query,
            city: ipData.city || "Unknown",
            country: ipData.country || "Unknown",
            isp: ipData.isp || "Unknown",
            isVPN: ipData.proxy || false,
            browser: userAgentInfo.browser,
            os: userAgentInfo.os,
            osVersion: userAgentInfo.osVersion,
            deviceModel: userAgentInfo.deviceModel,
            dpr: window.devicePixelRatio || 'N/A',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            webglVendor: webglInfo.vendor,
            webglRenderer: webglInfo.renderer
        };
        
        await addDoc(collection(db, "kunjungan"), visitData);
        sessionStorage.setItem('visitorTracked_v5', 'true');
        console.log("Kunjungan (v5 Final) berhasil dicatat:", visitData);

    } catch (error) {
        console.error("Gagal melacak pengunjung:", error);
    }
}

trackVisitor();
