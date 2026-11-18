# Cak.app

**Aplikasi komunikasi dan kolaborasi tim** — pesan berisi arahan bisa langsung ditindaklanjuti menjadi tugas, lengkap dengan penanggung jawab, tenggat waktu, dan status pengerjaan.

Produk dari **Sampulkreativ** untuk keperluan komunikasi dan komersial.

> **Status:** tahap perencanaan selesai (Proposal dan SRS), pengembangan aplikasi (Phase 2) akan dimulai dengan target 4 minggu. Seluruh fitur, teknologi, dan batas paket di bawah ini adalah rancangan sesuai dokumen, belum berarti sudah tersedia.

---

## Latar Belakang

Arahan kerja yang disampaikan lewat grup chat mudah tertimbun dan tersebar di banyak aplikasi. Akibatnya pengguna harus berpindah-pindah aplikasi untuk mencari pesan, menanyakan ulang instruksi, dan mencatat pekerjaan secara terpisah. Arahan pun sering tidak jelas siapa penanggung jawabnya dan kapan tenggatnya.

## Solusi

Cak.app menyatukan tiga hal dalam satu alur penggunaan yang sederhana:

1. **Chat** untuk komunikasi pribadi, grup divisi, atau proyek.
2. **Balasan berutas (thread)** agar satu topik dibahas di satu utas dan tidak tercampur dengan topik lain.
3. **Pengelolaan tugas** agar pesan berisi arahan diubah menjadi tugas dengan penanggung jawab, tenggat waktu, dan status, tanpa disalin ke aplikasi lain.

## Fitur Utama

**Pengguna**
- Login dan register
- Profil pengguna (alamat email dan paket langganan yang aktif)

**Chat dan thread**
- Kirim pesan dan lampiran/dokumen
- Balasan berutas (thread) per pesan induk
- Buat percakapan: Pribadi, Grup Divisi, atau Proyek
- Simpan pesan penting agar mudah ditemukan kembali

**Tugas**
- Ubah pesan berisi arahan menjadi tugas
- Tetapkan penanggung jawab dan tenggat waktu
- Perbarui status pengerjaan
- Pengingat menjelang tenggat (dijalankan terjadwal oleh background job)

**Langganan dan tim**
- Pembayaran langganan lewat QRIS dan transfer bank/virtual account (payment gateway)
- Paket tim aktif otomatis setelah webhook pembayaran berstatus sukses
- Undang anggota tim (khusus paket Plus dan Pro)
- Batas penggunaan sesuai paket aktif

**Pemantauan produk**
- Pencatatan jumlah pendaftar, pengguna aktif, pengguna yang mengundang anggota, perpindahan Free ke premium, serta masukan dan alasan berhenti menggunakan aplikasi

Sistem dirancang dapat diakses dari berbagai perangkat (desktop, tablet, dan ponsel pintar).

## Paket Layanan (Freemium)

| Paket | Harga | Mengundang anggota | Ringkasan |
| --- | --- | --- | --- |
| **Free** | Rp0 | Tidak bisa mengundang maupun bergabung ke tim milik pengguna Plus/Pro (penggunaan perorangan) | Chat, thread, dan pengelolaan tugas dasar dengan batas penggunaan awal |
| **Plus** | Rp29.000/tim/bulan | Hingga 10 pengguna per tim | Semua fungsi Free, penyimpanan lebih besar, riwayat pesan lebih panjang, lampiran lebih besar, pengelolaan diskusi dan tugas di atas kebutuhan dasar |
| **Pro** | Rp59.000/tim/bulan | Lebih banyak dari Plus | Semua fasilitas Plus, kapasitas anggota/penyimpanan/penggunaan lebih tinggi, pengelolaan tim dan tugas lebih rinci, dukungan prioritas bila sudah dapat dipenuhi tim pengelola |

Pembayaran bersifat langganan bulanan per tim. Karena paket Free tidak bisa mengundang pengguna lain, tim yang ingin berkolaborasi perlu menentukan jumlah anggota, berlangganan paket premium, lalu mengundang anggota.

> Angka batas yang belum teruji (batas penggunaan Free, batas anggota Pro, penyimpanan, ukuran lampiran, dan lama riwayat pesan) sengaja belum dicantumkan. Batas tersebut ditetapkan setelah uji kapasitas server pada Phase 2.

## Teknologi (Usulan Awal)

Teknologi dan penyedia hosting masih usulan dan akan dikonfirmasi setelah uji kapasitas server.

| Komponen | Teknologi |
| --- | --- |
| Frontend | Next.js 14.1.0, TypeScript 5.0, HTML5/CSS3/JavaScript |
| Backend | Go (Golang) 1.27.4 |
| Database | PostgreSQL 18.7 |
| Background job | Go Goroutine / Cron |
| Web server | Nginx 1.24.0 |
| Server (VPS) | IDCloudHost Rocket VPS 1 (acuan: 2 vCPU, RAM 4 GB, storage 60 GB) |
| Penyimpanan file | Cloudflare R2 (kuota gratis 10 GB-bulan) |
| Payment gateway | Midtrans (QRIS, transfer bank/VA), belum ditetapkan |
| Monitoring | UptimeRobot (paket gratis, interval 5 menit) |
| API testing | Postman 12.35.2 |

Kebutuhan non-fungsional yang diturunkan dari proposal: alur penggunaan sederhana, kapasitas awal sekitar 5–10 pengguna per tim, backup harian dengan retensi 7 hari (estimasi), dan pemantauan ketersediaan layanan.

## Tahapan Proyek

| Fase | Cakupan | Target |
| --- | --- | --- |
| **Phase 1 — Administratif** | Pengumpulan dokumen, pendataan kebutuhan, pembagian tugas, perencanaan, validasi | Dasar perencanaan |
| **Phase 2 — Development** | Pengembangan sesuai UI/UX yang sudah dibuat, integrasi pembayaran, pengujian awal termasuk uji kapasitas server | 4 minggu |
| **Phase 3 — Marketing** | Pengenalan ke calon pengguna lewat media sosial, demonstrasi, komunitas, dan program rekomendasi | Pengguna awal dan data evaluasi |

Jadwal Phase 2 per minggu:

| Minggu | Fokus |
| --- | --- |
| 1 | Backend: setup, autentikasi, API chat/thread/tugas |
| 2 | Backend: lanjutan API, pengingat tenggat, pembayaran dan aktivasi paket; Frontend: setup dan slicing UI |
| 3 | Frontend: lanjutan slicing UI dan integrasi API |
| 4 | Pengujian dan rilis: QA, uji kapasitas server, UAT, deploy |

## Dokumentasi

- **Proposal Pengembangan Cak.app** — latar belakang, evaluasi aplikasi pembanding, paket langganan, simulasi biaya, rencana tiga fase, risiko
- **Software Requirement Specification (SRS) Cak.app** — kebutuhan fungsional dan non-fungsional, sequence diagram, batasan dan asumsi, lini masa

Jika ada perbedaan, **Proposal menjadi acuan utama** dan SRS mengikuti isinya.

## Kepemilikan

© Sampulkreativ. Repositori ini bersifat privat dan seluruh isinya merupakan bagian dari produk Cak.app.
