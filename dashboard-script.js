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

  // Simpan IP unik agar bisa tandai IP duplikat
  const ipSet = new Set();

  onSnapshot(q, (snapshot) => {
    listContainer.innerHTML = '';

    if (snapshot.empty) {
      listContainer.innerHTML = '<div class="bg-white p-10 text-center text-gray-500">Belum ada data kunjungan yang tercatat.</div>';
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();

      // Format waktu
      const waktu = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

      const ip = d.ip || 'N/A';
      const city = d.city || 'Tidak diketahui';
      const country = d.country || '';

      // Tandai merah jika IP sudah muncul sebelumnya
      let ipClass = '';
      if (ipSet.has(ip)) ipClass = 'text-red-600 font-bold';
      else ipSet.add(ip);

      // Tandai merah jika VPN detected
      // ... bagian lain tetap sama

        const vpnText = d.isVPN ? "Ya" : "Tidak";
        const vpnClass = d.isVPN ? 'text-yellow-600 font-bold' : 'text-green-600';




      const lokasi = `${city}, ${country}`;
      const perangkat = d.deviceModel || d.deviceType || 'N/A';
      const sistem = `${d.os || 'N/A'} ${d.osVersion || ''}`;
      const browser = d.browser || 'N/A';
      const halaman = d.page || '/';
      const dpr = d.dpr || 'N/A';
      const resolusi = (d.screenWidth && d.screenHeight) ? `${d.screenWidth} x ${d.screenHeight}` : 'N/A';
      const timezone = d.timezone || 'N/A';

       // PERBAIKAN DI SINI: Kita kasih pengecekan sebelum memanggil substring
            const webglRenderer = d.webglRenderer ? d.webglRenderer.substring(0, 30) + '...' : 'N/A';
            const webglVendor = d.webglVendor ? d.webglVendor.substring(0, 30) + '...' : 'N/A';

      const itemHTML = `
            <div class="bg-white p-4 border-b border-gray-200 md:grid md:grid-cols-10 md:gap-4 md:p-5 md:items-center text-sm text-gray-900">

                <!-- Waktu -->
                <div class="mb-3 md:mb-0">
                <p class="font-bold text-gray-500 md:hidden">Waktu Kunjungan</p>
                <p>${waktu}</p>
                </div>

                <!-- IP & Lokasi -->
                <div class="mb-3 md:mb-0">
                <p class="font-bold text-gray-500 md:hidden">IP & Lokasi</p>
                <p class="${ipClass}">${ip}</p>
                <p class="text-gray-600">${lokasi}</p>
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
                <p>${timezone} ${d.isVPN ? '(VPN)' : ''}</p>
                </div>

                <!-- VPN -->
                <div class="mb-3 md:mb-0">
                <p class="font-bold text-gray-500 md:hidden">VPN</p>
                <p class="${vpnClass}">${vpnText}</p>
                </div>

                <!-- Info Grafis (WebGL) -->
                <div class="mb-3 md:mb-0">
                <p class="text-gray-600" title="${d.webglRenderer || ''}">${webglRenderer}</p>
                        <p class="text-gray-600 text-xs" title="${d.webglVendor || ''}">${webglVendor}</p></div>
            </div>
            `;

      listContainer.innerHTML += itemHTML;
    });
  });
});
