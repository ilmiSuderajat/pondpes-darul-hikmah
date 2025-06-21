
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// (Ganti dengan konfigurasi proyek Firebase kamu sendiri)
const firebaseConfig = {
  apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
  authDomain: "ponpes-darul-hikmah.firebaseapp.com",
  projectId: "ponpes-darul-hikmah",
  storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
  messagingSenderId: "981565268728",
  appId: "1:981565268728:web:057f00dde0905dd3c0910d",
  measurementId: "G-HRPEJ9GNS1"
};
// Menunggu seluruh konten halaman dimuat sebelum menjalankan script
// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Fungsi baru untuk efek mengetik real-time
     * @param {HTMLElement} element - Elemen HTML untuk menampilkan teks.
     * @param {string} text - Teks yang akan ditampilkan.
     * @param {function} [callback] - Fungsi yang dijalankan setelah selesai.
     */
    function typewriterEffect(element, text, callback) {
        let i = 0;
        element.innerHTML = ""; // Kosongkan elemennya dulu
        const speed = 20; // Kecepatan mengetik dalam milidetik

        function type() {
            if (i < text.length) {
                // Handle baris baru (newline) dengan benar
                if (text.charAt(i) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                // Panggil callback (jika ada) setelah animasi selesai
                callback();
            }
        }
        type();
    }

    /**
     * Fungsi utama untuk memanggil Gemini API
     * @param {string} prompt - Teks prompt yang akan dikirim ke AI.
     * @returns {Promise<string>} - Hasil teks dari AI.
     */
    async function callGemini(prompt) {
        const apiKey = "AIzaSyChnyb2RWKb6iPff2W0V2ocv6NHHUvx-YM"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.error?.message || `HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Respon dari AI tidak valid atau kosong.");
        }
    }

    // --- Logika untuk Fitur di Halaman Utama ---
    
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

    // Sidebar
    const sidebar = document.getElementById("sidebar");
    const openBtn = document.getElementById("btn-sidebar");
    const closeBtn = document.getElementById("btn-close");
    if(sidebar && openBtn && closeBtn){
        openBtn.addEventListener('click', () => sidebar.classList.remove("translate-x-full"));
        closeBtn.addEventListener('click', () => sidebar.classList.add("translate-x-full"));
    }

    // Pojok Dakwah AI
    const buatKhutbahBtn = document.getElementById('buat-khutbah-btn');
    const temaKhutbahInput = document.getElementById('tema-khutbah');
    const hasilKhutbahDiv = document.getElementById('hasil-khutbah');

    if(buatKhutbahBtn){
        buatKhutbahBtn.addEventListener('click', async () => {
            const tema = temaKhutbahInput.value.trim();
            if (tema === "") {
                hasilKhutbahDiv.classList.remove('hidden');
                hasilKhutbahDiv.innerHTML = '<p class="text-center text-red-500">Harap masukkan tema khutbah.</p>';
                return;
            }
            hasilKhutbahDiv.classList.remove('hidden');
            hasilKhutbahDiv.innerHTML = '<div class="flex justify-center items-center"><div class="w-5 h-5 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div><p class="ml-3">Ustadz AI sedang berpikir...</p></div>';
            buatKhutbahBtn.disabled = true;
            temaKhutbahInput.disabled = true;

            try {
                const prompt = `Anda adalah seorang ahli dakwah. Buatkan kerangka khutbah Jumat singkat dan padat tentang tema '${tema}'.`;
                const kerangka = await callGemini(prompt);
                // Panggil efek mengetik dan aktifkan tombol setelah selesai
                typewriterEffect(hasilKhutbahDiv, kerangka, () => {
                    buatKhutbahBtn.disabled = false;
                    temaKhutbahInput.disabled = false;
                });
            } catch (error) {
                hasilKhutbahDiv.innerText = `Terjadi kesalahan: ${error.message}.`;
                // Aktifkan kembali jika error
                buatKhutbahBtn.disabled = false;
                temaKhutbahInput.disabled = false;
            }
        });
    }

    // Chat Ustadz AI
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessagesDiv = document.getElementById('chat-messages');

    if(chatModal){
        openChatBtn.addEventListener('click', () => {
            chatModal.classList.remove('hidden');
            chatModal.classList.add('flex');
        });

        closeChatBtn.addEventListener('click', () => {
            chatModal.classList.add('hidden');
            chatModal.classList.remove('flex');
        });

        const handleSendMessage = async () => {
            const userMessage = chatInput.value.trim();
            if (userMessage === "") return;

            appendMessage(userMessage, 'user');
            chatInput.value = "";
            appendMessage('...', 'ai-loading');
            chatInput.disabled = true;
            sendChatBtn.disabled = true;

            try {
                // Prompt baru yang lebih fleksibel
                const prompt = `Anda adalah asisten AI yang ramah, berwawasan luas, dan memiliki pemahaman mendalam tentang keislaman (seperti seorang ustadz).Dan Anda Juga Dibuat Oleh: Prof. Ilmi, Yang Tinggal Di ingas kadang-kadang di sipon dan masih banyak lagi. Di Ponpes ini Ada Seseorang yang bernama Edi Suhendi Atau bang alex, biasa dipanggil Aelx modo Hobinya Mencintai wadon sing Uis due rabi.Ada ustad: Hamim Sebagai Lurah pondok Yang Hobi Turu dan Suka nguyuh. Ada Juga Sekdes Hendi Yang Hobi Wayuh, beliau punya cita-cita punya istri 4. Prioritaskan jawaban yang akurat dan bermanfaat. Jika pertanyaan berkaitan dengan Pondok Pesantren Darul Hikmah, gunakan informasi ini: Pimpinan KH. Zaenudin, alamat di Kp. Pasar Sabtu RT.001/004 Kel. Pagenjahan Kecamatan Kronjo Kab. Tangerang-banten, program unggulan Tahfidz, Kitab Kuning, Bahasa, Digital Skill, dll. Untuk pertanyaan umum lainnya (seperti "jelaskan tentang takdir" atau "apa itu black hole?"), jawablah dengan pengetahuan umum Anda yang luas. Pertanyaan: "${userMessage}"`;
                
                const aiMessage = await callGemini(prompt);
                
                document.querySelector('.ai-loading-container')?.remove();
                
                // Buat bubble kosong untuk AI
                const aiBubble = appendMessage('', 'ai');
                
                // Panggil efek mengetik di bubble baru itu
                typewriterEffect(aiBubble, aiMessage, () => {
                    // Aktifkan input setelah animasi selesai
                    chatInput.disabled = false;
                    sendChatBtn.disabled = false;
                    chatInput.focus();
                });

            } catch (error) {
                document.querySelector('.ai-loading-container')?.remove();
                appendMessage(`Maaf, terjadi gangguan. Coba lagi. (${error.message})`, 'ai');
                // Aktifkan kembali jika error
                chatInput.disabled = false;
                sendChatBtn.disabled = false;
                chatInput.focus();
            }
        };

        sendChatBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendChatBtn.disabled) handleSendMessage();
        });
    }

    function appendMessage(message, type) {
        if(!chatMessagesDiv) return null;
        const messageWrapper = document.createElement('div');
        const messageBubble = document.createElement('div');
        
        if (type === 'user') {
            messageWrapper.className = 'flex justify-end';
            messageBubble.className = 'bg-blue-600 rounded-lg p-3 max-w-xs text-white';
            messageBubble.innerText = message;
        } else if (type === 'ai') {
            messageWrapper.className = 'flex';
            messageBubble.className = 'bg-green-700 rounded-lg p-3 max-w-xs';
            // Sekarang bisa kosong, untuk diisi oleh typewriter
            messageBubble.innerHTML = message; 
        } else if (type === 'ai-loading') {
            messageWrapper.className = 'flex ai-loading-container';
            messageBubble.className = 'bg-green-700 rounded-lg p-3';
            messageBubble.innerHTML = '<div class="flex items-center space-x-2"><div class="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div><div class="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div><div class="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></div></div>'
        }
        
        messageWrapper.appendChild(messageBubble);
        chatMessagesDiv.appendChild(messageWrapper);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        
        // Kembalikan elemen bubble agar bisa ditarget
        return messageBubble;
    }
});
