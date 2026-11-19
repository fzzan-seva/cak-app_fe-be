# Prototipe UI Aplikasi CAK.APP

Prototipe interaktif **CAK.APP** dengan alur autentikasi, chat, thread, tugas, pesan tersimpan, dan paket tim. Desain mengacu pada prototipe di folder `CAKAPP` dan disempurnakan dengan fitur yang tercantum pada Proposal dan SRS.

Aplikasi ini berjalan secara lokal (*client-side*) menggunakan **HTML5, CSS murni, dan Vanilla JavaScript**, dengan interaksi area tombol (*button area*) untuk perpindahan halaman yang lancar dan realistis.

---

## 📱 Alur Halaman

1. **Onboarding / Selamat Datang**
   - Ikon logo CAK.APP dengan gelembung pesan hijau lembut.
   - Slogan & pagination carousel dots.
   - **Button Area:** Tombol **"Mulai Percakapan"** (berpindah ke Step 2).

2. **Input Nomor Telepon**
   - Pemilih negara Indonesia (+62), kotak input nomor telepon dengan tombol hapus (×).
   - Tanda keamanan: *"Sinkronisasi kontak terenkripsi aman"*.
   - **Soft Dialpad Numerik**: Papan angka interaktif (1–9, 0, Backspace).
   - **Button Area:** Tombol **Lingkaran Hijau Berpanah (FAB)** untuk membuka Modal Konfirmasi (Step 3).

3. **Konfirmasi Nomor**
   - Efek latar belakang redup & *backdrop blur*.
   - Kartu konfirmasi: *"Apakah nomor sudah benar?"* beserta nomor telepon.
   - **Button Area:**
     - **"Edit"**: Menutup modal dan tetap di Step 2 untuk ubah nomor.
     - **"Ya ✓"**: Meminta kode OTP melalui SMS dan membuka verifikasi nomor.

4. **Verifikasi SMS**
   - Kode OTP 6 digit dikaitkan dengan nomor telepon yang dimasukkan.
   - Tombol keypad, keyboard fisik, ganti nomor, dan kirim ulang bekerja pada simulasi lokal.
   - **Button Area:**
     - Tombol **"Ganti nomor telepon"**: Kembali ke input nomor.
     - Mengetik 6 angka: Otomatis berpindah ke daftar obrolan.

5. **Daftar Obrolan**
   - Header menu, tombol **＋** untuk percakapan baru, dan kolom *"Cari Obrolan"*.
   - Filter **All Chats**, **Channels**, **Directs**, dan **Work**.
   - Daftar obrolan lengkap:
     - **Rina Wulandari** (Foto dokumen.jpg)
     - **Tim Marketing** (Budi Santoso: Laporan kampanye...)
     - **Andi Pratama ★** (File presentasi sudah saya revisi...)
     - **Budi Santoso** (Siap, kita jadwalkan rapat besok)
     - **Dimas Arya** (Sudah saya cek tadi ya, aman)
     - **Tim Desain UI/UX** (Anda: File desain Figma sudah diunggah) — **Target Klik Utama!**
     - **Dev Team Core** (Kamera 37, unread 7)
     - **Project Alpha** (Sprint review, unread 8)
   - Navigasi bawah (*Bottom Nav*): Obrolan, Tugas, Profil.
   - Menu obrolan menyediakan Arsip, Pesan Tersimpan, undangan, dan paket.
   - Pencarian, filter, arsip, pesan tersimpan, profil, paket, dan navigasi tugas dapat dicoba.
   - Klik obrolan untuk membuka ruang percakapan.

6. **Ruang Obrolan**
   - Header obrolan: Avatar grup `DT` + lencana terverifikasi (✓) & status *"8 anggota, 5 online"*.
   - Latar belakang berpola doodle lembut.
   - Percakapan tim dari Alice, David, dan balasan Anda.
   - Pencarian pesan, menu percakapan, reaksi, tugas dari pesan, dan pesan tersimpan.
   - Tombol thread membuka percakapan berutas.
   - Emoji dan lampiran dapat ditambahkan ke draf; pesan suara adalah simulasi lokal.

7. **Dedicated Thread**
   - Header: *Dedicated Thread* dengan subjudul *hybrid workspace*.
   - Baris channel: `# DESIGN-TEAM • Aktif sekarang`.
   - Kartu pesan utama (*Root message card*):
     - Profil *"Anda - Penulis"* (12:30).
     - Teks pesan validasi mockup.
     - Kartu berkas demo dengan tombol unduh; file Figma asli tidak disertakan.
     - Reaksi emoji yang dapat ditoggle.
   - Pembatas balasan: `🗨️ 3 Balasan`.
   - Balasan thread dari Bob, Sarah, dan David beserta reaksi.
   - Menu thread, simpan pesan, dan buat tugas dari thread.
   - Tombol kembali (`←`): Kembali ke ruang obrolan.
   - Kolom ketik balasan thread di bagian bawah.

8. **Daftar Tugas**
   - Tugas menampilkan judul, sumber pesan/thread, penanggung jawab, tenggat, dan status.
   - Tugas dapat dibuat dari pesan atau dari daftar tugas; status dapat diperbarui.
   - Contoh workspace menggunakan Paket Plus dan membatasi undangan hingga 10 anggota sesuai proposal.
   - Interaksi undangan dan tugas hanya simulasi lokal; belum terhubung ke backend.

9. **Pesan Tersimpan**
   - Simpan atau hapus pesan penting dari ruang obrolan.
   - Pesan tersimpan dapat dibuka dari daftar obrolan maupun sidebar desktop.

10. **Profil**
   - Profil menampilkan nomor telepon aktif dan paket tim.
   - Kelola paket dan pembayaran demo dapat dibuka dari profil.

### Fitur proposal lainnya
- Buat percakapan pribadi, grup divisi, atau proyek.
- Lihat profil dan paket aktif.
- Lihat paket Free, Plus (Rp29.000/tim/bulan), dan Pro (Rp59.000/tim/bulan).
- Simulasikan pembayaran QRIS atau transfer bank/virtual account.
- Undangan dan pembayaran bersifat demo lokal; tidak mengirim email atau memproses transaksi sungguhan.
- Login hanya memakai nomor telepon dan OTP; pengiriman SMS belum terhubung ke layanan backend.
- Email hanya digunakan sebagai alamat undangan anggota tim, bukan untuk masuk.
- Data demo tidak tersimpan setelah halaman dimuat ulang.

---

## 🎛️ Toolbar Pengujian UI

Pada layar desktop terdapat **Toolbar Presentasi & Pengujian**:
- **Tab alur**: Klik tab mana pun untuk membuka layar, dialog konfirmasi, atau profil yang sesuai.
- **Toggle Frame**: Mengubah tampilan antara bingkai smartphone (*Mobile Frame*) dan tampilan layar penuh (*Fullscreen*).
- **Reset Flow**: Mengembalikan form dan alur ke Step 1 (Onboarding).

Pada layar mobile, toolbar disembunyikan agar antarmuka memenuhi layar seperti desain referensi. Navigasi menggunakan tombol pada aplikasi, termasuk tombol kembali, tab bawah, dan menu obrolan. Layout menyesuaikan layar kecil, tablet, dan desktop.

---

## 🚀 Cara Menjalankan

Jalankan server lokal dari folder proyek:
```bash
npm start
```
Kemudian buka:
```
http://localhost:3000
```
