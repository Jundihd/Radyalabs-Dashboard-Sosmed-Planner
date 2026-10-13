# Radya Labs Social Media Content Manager

> Multi-brand Social Media Planning, AI Generation, Approval Workflow & Calendar System for **Radya Labs** and its business entities.

## 🚀 Panduan Handover Pengembang
Dokumentasi lengkap per bab/seksi mengenai arsitektur sistem, skema Supabase, alur kerja pembuatan konten, penjelasan setiap fitur dashboard, serta evaluasi teknis dan rekomendasi perbaikan telah disusun secara komprehensif di:

👉 **[BACA DOKUMEN HANDOVER LENGKAP: HANDOVER.md](./HANDOVER.md)**

---

## ⚡ Quick Start

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment
Salin template environment:
```bash
cp .env.example .env.local
```
Lengkapi nilai variabel di `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (dari [Google AI Studio](https://aistudio.google.com/apikey))

### 3. Setup Basis Data & Storage Supabase
Jalankan file SQL berikut secara berurutan di Supabase SQL Editor:
1. `supabase/schema.sql` (Tabel, RLS, Storage Bucket)
2. `supabase/seed.sql` (Master Brand & User Default)

### 4. Verifikasi Koneksi
Periksa kesehatan koneksi database dan API di:
`http://localhost:3000/api/health`

### 5. Jalankan Server Lokal
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 📁 Ringkasan Fitur
- **Dashboard (`/dashboard`)**: Metrik analitik & snapshot Instagram Insights `@radyalabs`, demografi audiens, dan arsip referensi.
- **Content Calendar (`/calendar`)**: Kalender konten interaktif tampilan Bulan (grid 42 hari), Minggu, dan Hari dengan status terwarnai.
- **Content Post (`/create`)**: Pembuatan draf konten, caption AI Gemini, dual-mode visual (AI Image Generator & Upload manual), dan penjadwalan.
- **Content Video (`/create/video`)**: Studio video AI multi-mode (Prompt only, Face reference, Poster reference, Video reference) dengan preset & polling.
- **Approval Queue (`/approval`)**: Antrean peninjauan konten, sistem persetujuan/penolakan dengan catatan wajib, serta *Manual Publishing Toolkit*.
- **Role Switcher**: Simulasi hak akses antara *Aloysius (Approver)* dan *Arif (Creator)* di Sidebar.

Untuk penjelasan teknis dan arsitektur lebih mendalam, silakan merujuk ke **[HANDOVER.md](./HANDOVER.md)**.
