# Life Dashboard

Dashboard harian berbasis HTML, CSS, dan Vanilla JavaScript.

## Fitur utama

- Greeting dinamis berdasarkan waktu
- Jam dan tanggal real-time
- Focus timer dengan durasi yang bisa diubah
- To-do list: tambah, edit, tandai selesai, hapus
- Quick links tersimpan di browser
- Light/Dark mode
- Data persisten dengan Local Storage

## Struktur folder

```text
.
├── .kiro/
├── css/
│   └── style.css
├── js/
│   └── app.js
└── index.html
```

## Cara menjalankan

Buka `index.html` di browser modern.

## Deploy ke GitHub Pages

1. Buat repository GitHub dengan format nama: `CodingCamp-24August26-namaanda`
2. Upload semua file project, termasuk folder `.kiro`
3. Commit dan push ke branch utama
4. Buka `Settings` > `Pages`
5. Pada `Build and deployment`, pilih source `Deploy from a branch`
6. Pilih branch `main` dan folder `/ (root)`
7. Simpan, lalu tunggu URL GitHub Pages aktif

## Data storage

Semua data disimpan di browser melalui Local Storage. Tidak ada backend.
