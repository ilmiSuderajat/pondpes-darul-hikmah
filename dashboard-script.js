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
            listContainer.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-gray-500">Belum ada data kunjungan.</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const d = doc.data();
            
            const waktu = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
            const lokasi = `${d.city || 'N/A'}, ${d.country || ''}`;
            const perangkat = `${d.deviceModel || d.deviceType || 'N/A'} (${d.screenWidth || ''}x${d.screenHeight || ''})`;
            const sistem = `${d.os || 'N/A'} ${d.osVersion || ''}`;
            const browser = d.browser || 'N/A';
            const webglVendor = d.webglVendor || 'N/A';
            const webglRenderer = d.webglRenderer || 'N/A';

            const vpnBadge = d.isVPN 
                ? `<span class="bg-red-200 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">VPN/Proxy</span>` 
                : `<span class="bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Aman</span>`;

            const rowHTML = `
                <tr class="text-sm">
                    <td class="px-5 py-4 bg-white">
                        <p class="text-gray-900 font-semibold whitespace-nowrap">${waktu}</p>
                        <p class="text-gray-600">${lokasi}</p>
                    </td>
                    <td class="px-5 py-4 bg-white">
                        <p class="text-gray-900 font-semibold">${perangkat}</p>
                        <p class="text-gray-600">${sistem} - ${browser}</p>
                    </td>
                    <td class="px-5 py-4 bg-white">
                        <p class="text-gray-900 font-semibold">${d.ip || 'N/A'}</p>
                        <p class="text-gray-600">${d.isp || 'N/A'}</p>
                        <div class="mt-1">${vpnBadge}</div>
                    </td>
                    <td class="px-5 py-4 bg-white">
                         <p class="text-gray-900 font-semibold break-all" title="${webglRenderer}">${webglRenderer}</p>
                         <p class="text-gray-600 break-all" title="${webglVendor}">${webglVendor}</p>
                    </td>
                </tr>
            `;
            listContainer.innerHTML += rowHTML;
        });
    });
});
