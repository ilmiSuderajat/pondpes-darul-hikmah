// Import fungsi-fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const storage = getStorage(app);

// Inisialisasi TinyMCE
tinymce.init({
    selector: '#konten-lengkap',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    height: 400
});

document.addEventListener('DOMContentLoaded', function() {
    // Logika navigasi halaman admin (Dashboard, Kajian, Profil, dll.)
    const pageTitle = document.getElementById('page-title');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminPages = document.querySelectorAll('.admin-page');
    
    function showPage(pageId) {
        adminPages.forEach(page => page.classList.add('hidden'));
        sidebarLinks.forEach(link => link.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        const targetLink = document.querySelector(`[data-page='${pageId}']`);

        if(targetPage && targetLink) {
            targetPage.classList.remove('hidden');
            pageTitle.textContent = targetLink.textContent.trim();
            targetLink.classList.add('active');
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showPage(this.dataset.page);
        });
    });

    showPage('page-dashboard');

    // --- Logika Manajemen Kajian dengan FIREBASE STORAGE & FIRESTORE ---
    const tabelBody = document.getElementById('tabel-kajian-body');
    const modal = document.getElementById('modal-form-kajian');
    const formKajian = document.getElementById('form-kajian');
    const btnSimpan = document.getElementById('btn-simpan');
    const gambarFileInput = document.getElementById('gambar-file');
    const imagePreview = document.getElementById('image-preview');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('progress-bar');
    const gambarUrlLamaInput = document.getElementById('gambar-url-lama');
    const btnTambah = document.getElementById('btn-tambah-kajian');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnBatal = document.getElementById('btn-batal');
    
    // Tampilkan preview gambar saat file dipilih
    gambarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
        }
    });

    // Render tabel dari Firestore (real-time)
    onSnapshot(collection(db, 'kajian'), (snapshot) => {
        tabelBody.innerHTML = '';
        snapshot.forEach(doc => {
            const kajian = doc.data();
            const tanggal = kajian.createdAt ? new Date(kajian.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
            const barisHTML = `
                <tr>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${kajian.judul}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${kajian.kategori}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${kajian.penulis}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${tanggal}</p></td>
                    <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        <button data-id="${doc.id}" class="btn-edit text-yellow-600 hover:text-yellow-900 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                        <button data-id="${doc.id}" class="btn-hapus text-red-600 hover:text-red-900" title="Hapus"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            tabelBody.innerHTML += barisHTML;
        });
    });

    // Buka modal untuk tambah/edit
    async function openModal(mode = 'tambah', id = null) {
        formKajian.reset();
        tinymce.get('konten-lengkap').setContent('');
        imagePreview.src = "https://placehold.co/100x100/e2e8f0/cbd5e0?text=Preview";
        
        if (mode === 'edit' && id) {
            document.getElementById('modal-title').textContent = 'Edit Kajian';
            const docRef = doc(db, 'kajian', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const kajian = docSnap.data();
                document.getElementById('kajian-id').value = id;
                document.getElementById('judul').value = kajian.judul;
                document.getElementById('kategori').value = kajian.kategori;
                document.getElementById('penulis').value = kajian.penulis;
                document.getElementById('ringkasan').value = kajian.ringkasan;
                imagePreview.src = kajian.gambar;
                gambarUrlLamaInput.value = kajian.gambar;
                tinymce.get('konten-lengkap').setContent(kajian.konten || '');
            }
        } else {
             document.getElementById('modal-title').textContent = 'Tambah Kajian Baru';
             document.getElementById('kajian-id').value = '';
             gambarUrlLamaInput.value = '';
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        uploadProgressContainer.classList.add('hidden');
        progressBar.style.width = '0%';
    }
    
    btnTambah.addEventListener('click', () => openModal('tambah'));
    btnCloseModal.addEventListener('click', closeModal);
    btnBatal.addEventListener('click', closeModal);
    
     // Event delegation untuk tombol Edit dan Hapus
    tabelBody.addEventListener('click', async (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        const id = targetButton.dataset.id;
        
        if (targetButton.classList.contains('btn-edit')) {
            openModal('edit', id);
        }

        if (targetButton.classList.contains('btn-hapus')) {
            if (confirm('Apakah Anda yakin ingin menghapus kajian ini?')) {
                await deleteDoc(doc(db, 'kajian', id));
                // Tabel akan update otomatis karena onSnapshot
            }
        }
    });


    // Fungsi utama: Simpan form (dengan logika upload)
    formKajian.addEventListener('submit', async function(event) {
        event.preventDefault();
        btnSimpan.disabled = true;
        btnSimpan.textContent = 'Menyimpan...';

        const file = gambarFileInput.files[0];
        let imageUrl = gambarUrlLamaInput.value;

        // JIKA ADA FILE BARU YANG DIPILIH, LAKUKAN PROSES UPLOAD
        if (file) {
            uploadProgressContainer.classList.remove('hidden');
            const storageRef = ref(storage, 'kajian-images/' + Date.now() + '-' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = progress + '%';
                }, 
                (error) => {
                    console.error("Upload gagal:", error);
                    alert("Gagal mengupload gambar!");
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = 'Simpan Kajian';
                }, 
                async () => {
                    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    await saveDataToFirestore(imageUrl);
                }
            );
        } else {
            // JIKA TIDAK ADA FILE BARU, langsung simpan data ke Firestore
            await saveDataToFirestore(imageUrl);
        }
    });

    // Fungsi terpisah untuk menyimpan data ke Firestore
    async function saveDataToFirestore(finalImageUrl) {
        const id = document.getElementById('kajian-id').value;
        const kajianData = {
            judul: document.getElementById('judul').value,
            kategori: document.getElementById('kategori').value,
            penulis: document.getElementById('penulis').value,
            gambar: finalImageUrl,
            ringkasan: document.getElementById('ringkasan').value,
            konten: tinymce.get('konten-lengkap').getContent(),
        };

        try {
            if (id) { // Mode Edit
                const docRef = doc(db, 'kajian', id);
                await updateDoc(docRef, kajianData);
            } else { // Mode Tambah
                kajianData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'kajian'), kajianData);
            }
            closeModal();
        } catch (error) {
            console.error("Error menyimpan ke Firestore: ", error);
            alert("Gagal menyimpan data kajian!");
        } finally {
            btnSimpan.disabled = false;
            btnSimpan.textContent = 'Simpan Kajian';
        }
    }
});