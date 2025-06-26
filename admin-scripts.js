 // Import fungsi-fungsi dari Firebase SDK
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // --- KONFIGURASI FIREBASE & CLOUDINARY ---
                const firebaseConfig = {
        apiKey: "AIzaSyBcap3A_gPJMOvUKvUQ79Sn3ZaZ1j_UyJI",
        authDomain: "ponpes-darul-hikmah.firebaseapp.com",
        projectId: "ponpes-darul-hikmah",
        storageBucket: "ponpes-darul-hikmah.firebasestorage.app",
        messagingSenderId: "981565268728",
        appId: "1:981565268728:web:057f00dde0905dd3c0910d",
        measurementId: "G-HRPEJ9GNS1"
        };
        const CLOUDINARY_CLOUD_NAME = "drlciqeyf";
        const CLOUDINARY_UPLOAD_PRESET = "kajian";

        // --- INISIALISASI ---
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        tinymce.init({ 
            selector: '#konten-lengkap, #profil-konten', 
            height: 400,
            plugins: 'lists link image table code help wordcount',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code'
        });

        document.addEventListener('DOMContentLoaded', function() {
            
            // --- NAVIGASI UTAMA PANEL ADMIN ---
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
                link.addEventListener('click', e => {
                    // PERUBAHAN DI SINI: Cek dulu apakah linknya punya 'data-page'
                    if (link.dataset.page) {
                        // Kalau punya, baru kita cegah dan ganti konten
                        e.preventDefault();
                        showPage(link.dataset.page);
                    }
                    // Kalau tidak punya 'data-page', biarkan dia berfungsi normal (membuka link href)
                });
            });
            showPage('page-dashboard');

            // =======================================================
            // --- DEPARTEMEN MANAJEMEN KAJIAN ---
            // =======================================================
            const setupKajianManagement = () => {
                const tabelBody = document.getElementById('tabel-kajian-body');
                const modal = document.getElementById('modal-form-kajian');
                if (!tabelBody || !modal) return;

                const form = document.getElementById('form-kajian');
                const btnTambah = document.getElementById('btn-tambah-kajian');
                const btnCloseModal = document.getElementById('btn-close-kajian-modal');
                const btnBatal = document.getElementById('btn-batal-kajian');
                const imagePreview = document.getElementById('kajian-image-preview');
                const gambarUrlInput = document.getElementById('kajian-gambar-url');
                const idInput = document.getElementById('kajian-id');
                
                const kajianWidget = cloudinary.createUploadWidget({
                    cloudName: CLOUDINARY_CLOUD_NAME, 
                    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                    folder: 'kajian-images'
                }, (error, result) => { 
                    if (!error && result && result.event === "success") { 
                        imagePreview.src = result.info.secure_url;
                        gambarUrlInput.value = result.info.secure_url;
                    }
                });
                
                if(imagePreview) imagePreview.addEventListener('click', e => { e.preventDefault(); kajianWidget.open(); });
                
                const q = query(collection(db, 'kajian'), orderBy("createdAt", "desc"));
                onSnapshot(q, (snapshot) => {
                    tabelBody.innerHTML = '';
                    snapshot.forEach(doc => {
                        const kajian = doc.data();
                        const tanggal = kajian.createdAt ? new Date(kajian.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
                        tabelBody.innerHTML += `
                            <tr>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${kajian.judul}</p></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${kajian.kategori}</p></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 whitespace-no-wrap">${tanggal}</p></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button data-id="${doc.id}" class="btn-edit-kajian text-yellow-600 hover:text-yellow-900 mr-3"><i class="fas fa-edit"></i></button>
                                    <button data-id="${doc.id}" class="btn-hapus-kajian text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });
                });

                const openKajianModal = async (mode = 'tambah', id = null) => {
                    form.reset();
                    tinymce.get('konten-lengkap').setContent('');
                    imagePreview.src = "https://placehold.co/200x200/e2e8f0/cbd5e0?text=Klik";
                    document.getElementById('kajian-modal-title').textContent = (mode === 'edit') ? 'Edit Kajian' : 'Tambah Kajian Baru';
                    idInput.value = id || '';
                    gambarUrlInput.value = '';

                    if (mode === 'edit' && id) {
                        const docRef = doc(db, 'kajian', id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            document.getElementById('kajian-judul').value = data.judul || '';
                            document.getElementById('kajian-kategori').value = data.kategori || '';
                            document.getElementById('kajian-penulis').value = data.penulis || '';
                            document.getElementById('kajian-ringkasan').value = data.ringkasan || '';
                            imagePreview.src = data.gambar || 'https://placehold.co/200x200/e2e8f0/cbd5e0?text=Klik';
                            gambarUrlInput.value = data.gambar || '';
                            tinymce.get('konten-lengkap').setContent(data.konten || '');
                        }
                    }
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                };
                const closeKajianModal = () => modal.classList.add('hidden');

                btnTambah.addEventListener('click', () => openKajianModal('tambah'));
                btnCloseModal.addEventListener('click', closeKajianModal);
                btnBatal.addEventListener('click', closeKajianModal);
                
                form.addEventListener('submit', async e => {
                    e.preventDefault();
                    const id = idInput.value;
                    const data = {
                        judul: document.getElementById('kajian-judul').value,
                        kategori: document.getElementById('kajian-kategori').value,
                        penulis: document.getElementById('kajian-penulis').value,
                        gambar: gambarUrlInput.value,
                        ringkasan: document.getElementById('kajian-ringkasan').value,
                        konten: tinymce.get('konten-lengkap').getContent()
                    };
                    if (!data.gambar) { alert("Harap upload gambar dulu."); return; }

                    if (id) {
                        await updateDoc(doc(db, 'kajian', id), {...data, updatedAt: serverTimestamp()});
                    } else {
                        await addDoc(collection(db, 'kajian'), {...data, createdAt: serverTimestamp()});
                    }
                    closeKajianModal();
                });

                tabelBody.addEventListener('click', async e => {
                    const target = e.target.closest('button');
                    if(!target) return;
                    const id = target.dataset.id;
                    if(target.classList.contains('btn-edit-kajian')) openKajianModal('edit', id);
                    if(target.classList.contains('btn-hapus-kajian')) {
                        if(confirm('Yakin mau hapus kajian ini?')) await deleteDoc(doc(db, 'kajian', id));
                    }
                });
            };
            
            // =======================================================
            // --- DEPARTEMEN MANAJEMEN INFORMASI ---
            // =======================================================
            const setupInformasiManagement = () => {
                const tabelBody = document.getElementById('tabel-informasi-body');
                const modal = document.getElementById('modal-form-informasi');
                if (!tabelBody || !modal) return;

                const form = document.getElementById('form-informasi');
                const btnTambah = document.getElementById('btn-tambah-informasi');
                const btnCloseModal = document.getElementById('btn-close-info-modal');
                const btnBatal = document.getElementById('btn-batal-info');
                const infoImagePreview = document.getElementById('info-image-preview');
                const infoGambarUrlInput = document.getElementById('info-gambar-url');
                const infoIdInput = document.getElementById('info-id');
                
                const infoCollection = collection(db, 'informasi');

                const infoWidget = cloudinary.createUploadWidget({
                    cloudName: CLOUDINARY_CLOUD_NAME, 
                    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                    folder: 'informasi-images'
                }, (error, result) => { 
                    if (!error && result && result.event === "success") { 
                        infoImagePreview.src = result.info.secure_url;
                        infoGambarUrlInput.value = result.info.secure_url;
                    }
                });
                
                infoImagePreview.addEventListener('click', e => { e.preventDefault(); infoWidget.open(); });
                
                const q = query(infoCollection, orderBy("createdAt", "desc"));
                onSnapshot(q, (snapshot) => {
                    tabelBody.innerHTML = '';
                    snapshot.forEach(doc => {
                        const info = doc.data();
                        const tanggal = info.createdAt ? new Date(info.createdAt.seconds * 1000).toLocaleDateString("id-ID") : 'N/A';
                        tabelBody.innerHTML += `
                            <tr>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><img src="${info.gambar}" alt="${info.judul}" class="w-20 h-20 object-cover rounded-md"></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900 w-64 whitespace-normal">${info.judul}</p></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p class="text-gray-900">${tanggal}</p></td>
                                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button data-id="${doc.id}" class="btn-edit-info text-yellow-600 hover:text-yellow-900 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                                    <button data-id="${doc.id}" class="btn-hapus-info text-red-600 hover:text-red-900" title="Hapus"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });
                });
                
                const openInfoModal = async (mode = 'tambah', id = null) => {
                    form.reset();
                    infoImagePreview.src = "https://placehold.co/200x200/e2e8f0/cbd5e0?text=Klik";
                    document.getElementById('info-modal-title').textContent = (mode === 'edit') ? 'Edit Informasi' : 'Tambah Informasi Baru';
                    infoIdInput.value = id || '';
                    infoGambarUrlInput.value = '';

                    if (mode === 'edit' && id) {
                        const docRef = doc(db, 'informasi', id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            document.getElementById('info-judul').value = data.judul || '';
                            document.getElementById('info-deskripsi').value = data.deskripsi || '';
                            document.getElementById('info-link').value = data.link || '';
                            infoImagePreview.src = data.gambar || '...';
                            infoGambarUrlInput.value = data.gambar || '';
                        }
                    }
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
                
                const closeInfoModal = () => modal.classList.add('hidden');
                
                btnTambah.addEventListener('click', () => openInfoModal('tambah'));
                btnCloseModal.addEventListener('click', closeInfoModal);
                btnBatal.addEventListener('click', closeInfoModal);

                form.addEventListener('submit', async e => {
                    e.preventDefault();
                    const btnSimpanInfo = form.querySelector('button[type="submit"]');
                    btnSimpanInfo.disabled = true;

                    const id = infoIdInput.value;
                    const dataToSave = {
                        judul: document.getElementById('info-judul').value,
                        deskripsi: document.getElementById('info-deskripsi').value,
                        link: document.getElementById('info-link').value,
                        gambar: infoGambarUrlInput.value,
                    };
                    
                    if (!dataToSave.gambar) {
                        alert("Harap upload gambar.");
                        btnSimpanInfo.disabled = false;
                        return;
                    }

                    try {
                        if (id) {
                            await updateDoc(doc(db, 'informasi', id), {...dataToSave, updatedAt: serverTimestamp()});
                        } else {
                            await addDoc(collection(db, 'informasi'), {...dataToSave, createdAt: serverTimestamp()});
                        }
                        closeInfoModal();
                    } catch (error) {
                        console.error("Gagal menyimpan informasi:", error);
                    } finally {
                        btnSimpanInfo.disabled = false;
                    }
                });

                tabelBody.addEventListener('click', async e => {
                    const target = e.target.closest('button');
                    if (!target) return;
                    const id = target.dataset.id;
                    if (target.classList.contains('btn-edit-info')) openInfoModal('edit', id);
                    if (target.classList.contains('btn-hapus-info')) {
                        if (confirm('Yakin mau hapus informasi ini?')) await deleteDoc(doc(db, 'informasi', id));
                    }
                });
            };
            
            // =======================================================
            // --- DEPARTEMEN MANAJEMEN PROFIL ---
            // =======================================================
            const setupProfilManagement = () => {
                const formProfil = document.getElementById('form-profil');
                if (!formProfil) return;

                const btnSimpanProfil = document.getElementById('btn-simpan-profil');
                const judulInput = document.getElementById('profil-judul');
                
                const profilDocRef = doc(db, "halaman", "profil");

                const muatDataProfil = async () => {
                    try {
                        const docSnap = await getDoc(profilDocRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            judulInput.value = data.judul || '';
                            tinymce.get('profil-konten').setContent(data.konten || '');
                        }
                    } catch (error) {
                        console.error("Gagal memuat data profil:", error);
                    }
                };

                formProfil.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    btnSimpanProfil.disabled = true;
                    btnSimpanProfil.textContent = 'Menyimpan...';

                    const dataToSave = {
                        judul: judulInput.value,
                        konten: tinymce.get('profil-konten').getContent(),
                        updatedAt: serverTimestamp()
                    };

                    try {
                        await setDoc(profilDocRef, dataToSave, { merge: true });
                        alert('Halaman Profil berhasil diperbarui!');
                    } catch (error) {
                        alert('Gagal menyimpan perubahan.');
                    } finally {
                        btnSimpanProfil.disabled = false;
                        btnSimpanProfil.textContent = 'Simpan Perubahan Profil';
                    }
                });

                muatDataProfil();
            };

                // =======================================================
            // --- DEPARTEMEN LOGIKA DASHBOARD ---
            // =======================================================
            const setupDashboard = () => {
                const statKajian = document.getElementById('stat-total-kajian');
                const statInformasi = document.getElementById('stat-total-informasi');
                const statKunjungan = document.getElementById('stat-total-kunjungan');
                const listLokasi = document.getElementById('list-lokasi');
                const ctxKunjungan = document.getElementById('grafik-kunjungan')?.getContext('2d');
                const ctxPerangkat = document.getElementById('grafik-perangkat')?.getContext('2d');

                if(!statKajian || !ctxKunjungan || !ctxPerangkat) return;

                let grafikKunjunganChart, grafikPerangkatChart;

                // Update statistik angka
                onSnapshot(collection(db, 'kajian'), snap => statKajian.textContent = snap.size);
                onSnapshot(collection(db, 'informasi'), snap => statInformasi.textContent = snap.size);
                
                // Update statistik kunjungan secara real-time
                onSnapshot(collection(db, 'kunjungan'), snap => {
                    statKunjungan.textContent = snap.size;
                    const dataKunjungan = snap.docs.map(doc => doc.data());
                    processDataGrafik(dataKunjungan);
                });

                function processDataGrafik(data) {
                    // 1. Grafik Kunjungan Harian (7 Hari Terakhir)
                    const kunjunganPerHari = {};
                    const tujuhHariLalu = new Date();
                    tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 6);
                    tujuhHariLalu.setHours(0, 0, 0, 0);

                    for (let i = 0; i < 7; i++) {
                        const d = new Date(tujuhHariLalu);
                        d.setDate(d.getDate() + i);
                        const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                        kunjunganPerHari[label] = 0;
                    }

                    data.forEach(visit => {
                        if (visit.timestamp?.seconds) {
                            const visitDate = new Date(visit.timestamp.seconds * 1000);
                            if (visitDate >= tujuhHariLalu) {
                                const label = visitDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                                if (kunjunganPerHari[label] !== undefined) {
                                    kunjunganPerHari[label]++;
                                }
                            }
                        }
                    });
                    
                    if (grafikKunjunganChart) grafikKunjunganChart.destroy();
                    grafikKunjunganChart = new Chart(ctxKunjungan, {
                        type: 'line',
                        data: {
                            labels: Object.keys(kunjunganPerHari),
                            datasets: [{
                                label: 'Kunjungan',
                                data: Object.values(kunjunganPerHari),
                                borderColor: 'rgb(22, 163, 74)',
                                tension: 0.1,
                                fill: true,
                                backgroundColor: 'rgba(22, 163, 74, 0.1)'
                            }]
                        }
                    });

                    // 2. Grafik Perangkat
                    const perangkatCount = { Desktop: 0, Mobile: 0, Lainnya: 0 };
                    data.forEach(visit => {
                        if (visit.deviceType === 'Desktop') perangkatCount.Desktop++;
                        else if (visit.deviceType === 'Mobile') perangkatCount.Mobile++;
                        else perangkatCount.Lainnya++;
                    });
                    
                    if(grafikPerangkatChart) grafikPerangkatChart.destroy();
                    grafikPerangkatChart = new Chart(ctxPerangkat, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(perangkatCount),
                            datasets: [{
                                data: Object.values(perangkatCount),
                                backgroundColor: ['#3b82f6', '#16a34a', '#a855f7']
                            }]
                        }
                    });

                    // 3. Top Lokasi
                    const lokasiCount = {};
                    data.forEach(visit => {
                        if (visit.city && visit.country) {
                            const lokasi = `${visit.city}, ${visit.country}`;
                            lokasiCount[lokasi] = (lokasiCount[lokasi] || 0) + 1;
                        }
                    });
                    const sortedLokasi = Object.entries(lokasiCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
                    listLokasi.innerHTML = '';
                    if(sortedLokasi.length > 0){
                        sortedLokasi.forEach(([lokasi, count]) => {
                            listLokasi.innerHTML += `<li class="flex justify-between items-center"><span><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>${lokasi}</span> <strong>${count}</strong></li>`;
                        });
                    } else {
                        listLokasi.innerHTML = '<li>Data lokasi belum tersedia.</li>';
                    }
                }
            };

            // Jalankan semua departemen
            setupDashboard();
            setupKajianManagement();
            setupInformasiManagement();
            setupProfilManagement();
        });