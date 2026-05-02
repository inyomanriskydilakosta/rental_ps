# Implementasi Full CRUD dengan Supabase

Mengganti semua mock data dengan data real dari Supabase database. Setiap halaman akan direfaktor menjadi Server Component untuk fetching data, dan Client Component untuk interaksi CRUD.

## Arsitektur yang Dipilih

```
Page (Server Component)  →  fetch data dari Supabase
        ↓ props
Client Component         →  UI interaktif (modal, form, tabel)
        ↓ call
Server Action            →  mutasi DB + revalidatePath
```

---

## Skema Database Supabase

SQL yang perlu dijalankan di **Supabase SQL Editor**:

```sql
-- 1. Unit PlayStation
CREATE TABLE playstation_units (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  type      TEXT NOT NULL CHECK (type IN ('PS5','PS4','PS3','PS2')),
  status    TEXT NOT NULL DEFAULT 'TERSEDIA' CHECK (status IN ('TERSEDIA','DIGUNAKAN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data Pelanggan
CREATE TABLE customers (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  member_id      TEXT UNIQUE,
  total_sessions INT  NOT NULL DEFAULT 0,
  total_spent    BIGINT NOT NULL DEFAULT 0,
  join_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sesi Aktif
CREATE TABLE active_sessions (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  ps_unit_id    BIGINT REFERENCES playstation_units(id) ON DELETE SET NULL,
  ps_type       TEXT NOT NULL,
  ps_name       TEXT NOT NULL,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'BERLANGSUNG' CHECK (status IN ('BERLANGSUNG','SELESAI')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transaksi
CREATE TABLE transactions (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  ps_type       TEXT NOT NULL,
  ps_name       TEXT NOT NULL,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  duration      INT  NOT NULL,
  amount        BIGINT NOT NULL,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'LUNAS' CHECK (status IN ('LUNAS','BELUM_LUNAS')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: disable untuk internal app (hanya penjaga yang login)
ALTER TABLE playstation_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can all" ON playstation_units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated can all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated can all" ON active_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated can all" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## File-file yang Akan Diubah / Dibuat

### 1. Types

#### [MODIFY] types/index.ts
Tambahkan tipe DB row (snake_case) dan update interface yang ada.

---

### 2. Server Actions

#### [NEW] app/data-playstation/actions.ts
- `createPS(formData)` — INSERT ke `playstation_units`
- `updatePS(id, formData)` — UPDATE
- `deletePS(id)` — DELETE

#### [NEW] app/data-pembeli/actions.ts
- `createCustomer(formData)` — INSERT ke `customers`
- `updateCustomer(id, formData)` — UPDATE
- `deleteCustomer(id)` — DELETE

#### [NEW] app/laporan/actions.ts
- `updateTransactionStatus(id, status)` — UPDATE status bayar

#### [MODIFY] app/login/actions.ts (sudah ada)
- `createSession(formData)` — INSERT ke `active_sessions` + set PS status DIGUNAKAN
- `endSession(id)` — UPDATE session SELESAI + INSERT ke `transactions` + set PS TERSEDIA

---

### 3. Pages (direfaktor ke Server Component)

#### [MODIFY] app/page.tsx — Dashboard
- Fetch: stats dari DB, active_sessions, playstation_units
- Render: `<ActiveSessionsTable>`, `<PSDataTable>`, `<PurchaseForm>`, stat cards

#### [MODIFY] app/data-pembeli/page.tsx
- Fetch customers dari Supabase
- Render `<DataPembelihClient data={customers} />`

#### [MODIFY] app/data-playstation/page.tsx
- Fetch playstation_units dari Supabase
- Render `<DataPlaystationClient data={units} />`

#### [MODIFY] app/laporan/page.tsx
- Fetch transactions dari Supabase
- Render `<LaporanClient data={transactions} />`

---

### 4. Client Components (dipisah dari pages)

#### [NEW] components/DataPembeliClient.tsx
Pindahkan seluruh UI + CRUD logic dari `data-pembeli/page.tsx`. Memanggil Server Actions.

#### [NEW] components/DataPlaystationClient.tsx
Pindahkan seluruh UI + CRUD logic dari `data-playstation/page.tsx`. Memanggil Server Actions.

#### [NEW] components/LaporanClient.tsx
Pindahkan seluruh UI dari `laporan/page.tsx` + tambah aksi update status bayar.

#### [MODIFY] components/PurchaseForm.tsx
Hubungkan ke `createSession` Server Action. Pilih unit PS dari list yang tersedia.

#### [MODIFY] components/ActiveSessionsTable.tsx
Tambah tombol "Selesaikan Sesi" yang memanggil `endSession` action.

---

## Verification Plan

### Automated
- Build: `npm run build` — harus 0 error
- Dev server tetap berjalan normal

### Manual (browser)
1. Dashboard menampilkan data real dari DB (0 data awal = tampil empty state)
2. Data PS: tambah PS baru → muncul di tabel
3. Data Pembeli: tambah, edit, hapus pelanggan → persisten setelah refresh
4. PurchaseForm: isi form → sesi muncul di "Sesi Aktif" + PS status berubah DIGUNAKAN
5. Selesaikan sesi → pindah ke Laporan, PS kembali TERSEDIA
6. Laporan: update status bayar BELUM_LUNAS → LUNAS

## Open Questions

> [!IMPORTANT]
> **Perhitungan `amount` di PurchaseForm**: Saat ini form hanya ada jam mulai & selesai tanpa harga per jam per tipe PS. Apakah perlu tambah field harga per jam, atau akan dihitung fixed? Saya akan asumsi:
> - PS5: Rp 10.000/30 menit
> - PS4: Rp 7.500/30 menit
> - PS3: Rp 5.000/30 menit
> - PS2: Rp 3.000/30 menit

> [!IMPORTANT]
> **Laporan — apakah perlu CRUD penuh (tambah/hapus transaksi manual)?** Saya asumsikan transaksi hanya dibuat otomatis saat sesi selesai, dan admin hanya bisa update status bayar. Jika perlu tambah/hapus manual, mohon beritahu.
