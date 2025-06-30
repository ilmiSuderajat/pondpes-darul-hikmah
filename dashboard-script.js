// dashboard-script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('arsip-list-container');
  if (!listContainer) return;

  const q = query(collection(db, "kunjungan"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    listContainer.innerHTML = '';

    if (snapshot.empty) {
      listContainer.innerHTML = '<div class="bg-white p-10 text-center text-gray-500">Belum ada data kunjungan yang tercatat.</div>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();

      const waktu = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
      const ip = data.ip || 'N/A';
      const city = data.city || 'Tidak diketahui';
      const country = data.country || '';
      const perangkat = data.deviceModel || data.deviceType || 'N/A';
      const sistem = `${data.os || 'N/A'} ${data.osVersion || ''}`;
      const browser = data.browser || 'N/A';
      const halaman = data.page || '/';
      const dpr = data.dpr || 'N/A';
      const resolusi = (data.screenWidth && data.screenHeight) ? `${data.screenWidth} x ${data.screenHeight}` : 'N/A';
      const timezone = data.timezone || 'N/A';
      const vpnText = data.isVPN ? "Ya" : "Tidak";
      const vpnClass = data.isVPN ? 'text-yellow-600 font-bold' : 'text-green-600';
      const webglRenderer = data.webglRenderer ? data.webglRenderer.substring(0, 30) + '...' : 'N/A';
      const webglVendor = data.webglVendor ? data.webglVendor.substring(0, 30) + '...' : 'N/A';
      // Ambil hash canvas fingerprint, tampilkan rapi
      const canvasFingerprintHash = data.canvasFingerprintHash || 'N/A';
      const deviceMemory = data.deviceMemory || 'N/A';

      const itemHTML = `
      <div class="bg-white p-4 border-b border-gray-200 md:grid md:grid-cols-12 md:gap-2 md:p-5 md:items-center text-xs md:text-sm text-gray-900">

        <!-- Waktu -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Waktu Kunjungan</p>
          <p>${waktu}</p>
        </div>

        <!-- IP & Lokasi -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">IP & Lokasi</p>
          <p>${ip}</p>
          <p class="text-gray-600">${city}, ${country}</p>
        </div>

        <!-- Perangkat -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Perangkat</p>
          <p>${perangkat}</p>
        </div>

        <!-- Sistem & Browser -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Sistem & Browser</p>
          <p class="font-semibold">${sistem}</p>
          <p class="text-gray-600">${browser}</p>
        </div>

        <!-- Halaman -->
        <div class="mb-3 md:mb-0 break-words">
          <p class="font-bold text-gray-500 md:hidden">Halaman</p>
          <p>${halaman}</p>
        </div>

        <!-- DPR -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">DPR</p>
          <p>${dpr}</p>
        </div>

        <!-- Resolusi -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Resolusi</p>
          <p>${resolusi}</p>
        </div>

        <!-- Timezone -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Timezone</p>
          <p>${timezone} ${data.isVPN ? '(VPN)' : ''}</p>
        </div>

        <!-- VPN -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">VPN</p>
          <p class="${vpnClass}">${vpnText}</p>
        </div>

        <!-- WebGL Grafis -->
        <div class="mb-3 md:mb-0">
          <p class="text-gray-600" title="${data.webglRenderer || ''}">${webglRenderer}</p>
          <p class="text-gray-600 text-xs" title="${data.webglVendor || ''}">${webglVendor}</p>
        </div>

        <!-- Canvas Fingerprint Hash -->
        <div class="mb-3 md:mb-0 break-all max-w-[150px]">
          <p class="font-bold text-gray-500 md:hidden">Canvas Fingerprint Hash</p>
          <p class="text-xs md:text-sm font-mono">${canvasFingerprintHash}</p>
        </div>

        <!-- Device Memory -->
        <div class="mb-3 md:mb-0">
          <p class="font-bold text-gray-500 md:hidden">Device Memory</p>
          <p>${deviceMemory}</p>
        </div>

      </div>
      `;

      listContainer.innerHTML += itemHTML;
    });
  });
});
