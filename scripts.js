// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// PENTING: Pastikan lo udah isi ini pake konfigurasi asli dari proyek Firebase lo.
const firebaseConfig = {
  apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
  authDomain: "ponpes-darul-hikmah.firebaseapp.com",
  projectId: "ponpes-darul-hikmah",
  storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
  messagingSenderId: "981565268728",
  appId: "1:981565268728:web:057f00dde0905dd3c0910d",
  measurementId: "G-HRPEJ9GNS1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Menunggu seluruh konten halaman HTML dimuat, baru jalankan semua script.
document.addEventListener('DOMContentLoaded', () => {

    // --- FUNGSI UNTUK MEMUAT KAJIAN TERBARU DI SIDEBAR ---
    async function loadLatestKajian() {
        const widgetContainer = document.getElementById('kajian-terbaru-widget');
        if (!widgetContainer) return;

        try {
            const q = query(collection(db, "kajian"), orderBy("createdAt", "desc"), limit(4));
            const querySnapshot = await getDocs(q);

            if(querySnapshot.empty) {
                widgetContainer.innerHTML = '<p class="text-sm text-gray-500">Belum ada kajian terbaru.</p>';
                return;
            }

            widgetContainer.innerHTML = ''; // Kosongkan tulisan "Memuat..."
            querySnapshot.forEach(doc => {
                const kajian = doc.data();
                const tanggal = kajian.createdAt ? new Date(kajian.createdAt.seconds * 1000).toLocaleDateString("id-ID") : '';
                
                const itemHTML = `
                    <a href="detail-kajian.html?id=${doc.id}" class="block group">
                        <p class="text-gray-500 text-sm">${tanggal}</p>
                        <h4 class="font-semibold text-gray-800 group-hover:text-green-700">${kajian.judul}</h4>
                    </a>
                `;
                widgetContainer.innerHTML += itemHTML;
            });
        } catch (error) {
            console.error("Error memuat kajian terbaru:", error);
            widgetContainer.innerHTML = '<p class="text-sm text-red-500">Gagal memuat kajian.</p>';
        }
    }

    // --- FUNGSI UNTUK MEMUAT INFORMASI PENTING DI SIDEBAR ---
    async function loadLatestInformasi() {
        const widgetContainer = document.getElementById('informasi-penting-widget');
        if (!widgetContainer) return;

        try {
            const q = query(collection(db, "informasi"), orderBy("createdAt", "desc"), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                widgetContainer.innerHTML = '<p class="text-sm text-gray-500">Tidak ada informasi penting saat ini.</p>';
                return;
            }

            widgetContainer.innerHTML = '';
            const doc = querySnapshot.docs[0];
            const info = doc.data();
            
            const itemHTML = `
                <a href="${info.link || '#'}" class="flex items-start space-x-4 group">
                    <img src="${info.gambar}" alt="${info.judul}" class="w-20 h-20 object-cover rounded-md flex-shrink-0">
                    <div>
                        <h4 class="font-semibold text-gray-800 group-hover:text-green-700">${info.judul}</h4>
                        <p class="text-gray-500 text-sm mt-1">${info.deskripsi}</p>
                    </div>
                </a>
            `;
            widgetContainer.innerHTML = itemHTML;
        } catch (error) {
            console.error("Error memuat informasi penting:", error);
            widgetContainer.innerHTML = '<p class="text-sm text-red-500">Gagal memuat informasi.</p>';
        }
    }

    // Panggil kedua fungsi ini saat halaman dimuat
    loadLatestKajian();
    loadLatestInformasi();

    // --- Logika untuk Fitur Lainnya (Slider, Sidebar Navigasi, dll) ---
    // Pastikan semua ID elemennya ada di file HTML utama.
    
    // Slider
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let current = 0;
        let interval = setInterval(nextSlide, 5000); 

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('opacity-100', i === index);
                slide.classList.toggle('opacity-0', i !== index);
            });
        }
        function nextSlide() {
            current = (current + 1) % slides.length;
            showSlide(current);
        }
        function prevSlide() {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        }
        function resetInterval() {
            clearInterval(interval);
            interval = setInterval(nextSlide, 5000);
        }

        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
    }

    // Sidebar Navigasi
    const sidebar = document.getElementById("sidebar");
    const openBtn = document.getElementById("btn-sidebar");
    const closeBtn = document.getElementById("btn-close");
    if(sidebar && openBtn && closeBtn){
        openBtn.addEventListener('click', () => sidebar.classList.remove("translate-x-full"));
        closeBtn.addEventListener('click', () => sidebar.classList.add("translate-x-full"));
    }

    // (Logika untuk fitur AI bisa ditambahkan di sini jika dibutuhkan di halaman ini)
});
