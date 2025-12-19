# Hatunoğlu Otomotiv - Araç Takip ve Finans Yönetimi

## Render'da Deploy Etme

### 1. PostgreSQL Veritabanı Oluşturma
1. [Render Dashboard](https://dashboard.render.com)'a git
2. **New** → **PostgreSQL** tıkla
3. İsim: `hatunoglu-db`
4. Plan: **Free** seç
5. **Create Database** tıkla
6. **Internal Database URL**'i kopyala (sonra lazım olacak)

### 2. Web Service Oluşturma
1. **New** → **Web Service** tıkla
2. GitHub repo'yu bağla: `Saltukxx/hatunogluotomativ`
3. Ayarlar:
   - **Name:** `hatunoglu-otomotiv`
   - **Region:** Frankfurt (EU)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3. Environment Variables
Web Service ayarlarında **Environment** sekmesine git:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (PostgreSQL Internal URL'i yapıştır) |
| `NODE_ENV` | `production` |

### 4. Deploy
**Create Web Service** tıkla ve bekle!

---

## Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı migration
npx prisma migrate dev

# Geliştirme sunucusu
npm run dev
```

## Teknolojiler
- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (production) / SQLite (development)
- Shadcn/UI
