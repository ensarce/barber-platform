# KuaförBul - Kuaför Randevu Platformu

Türkiye'nin en iyi kuaförlerini keşfedin, kolayca randevu alın.

## 🛠️ Teknolojiler

- **Backend:** Spring Boot 3, Java 21, PostgreSQL
- **Frontend:** Angular 19, SCSS
- **Auth:** JWT

## 🚀 Production Deployment

### 1. Supabase (Database)
- [supabase.com](https://supabase.com) → New Project
- Connection string'i kopyala

### 2. Render (Backend)
- [render.com](https://render.com) → New Web Service
- Repository bağla, root: `backend`
- Environment variables:
  ```
  SPRING_PROFILES_ACTIVE=prod
  DB_URL=jdbc:postgresql://...
  DB_USER=postgres
  DB_PASSWORD=<şifre>
  JWT_SECRET=<64-karakter-secret>
  CORS_ORIGINS=https://<vercel-url>
  ```

### 3. Vercel (Frontend)
- [vercel.com](https://vercel.com) → Import Project
- Root: `frontend`
- Auto-deploy enabled

## 🔧 Local Development

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
ng serve
```

## 📝 License

MIT
