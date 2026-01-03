# ✂️ KuaförBul - Kuaför Randevu Platformu

> Türkiye'nin en iyi kuaförlerini keşfedin, kolayca online randevu alın.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Özellikler

### Müşteriler İçin
- 📍 Konum bazlı kuaför arama (il/ilçe filtreleme)
- ⭐ Gerçek müşteri değerlendirmelerini görüntüleme
- 📅 Online randevu oluşturma
- 💰 Şeffaf fiyat bilgisi
- 🔔 Randevu bildirimleri

### Kuaförler İçin
- 👤 Profesyonel profil oluşturma
- ✂️ Hizmet ve fiyat yönetimi
- 🕐 Çalışma saatleri ayarlama
- 📊 Randevu takibi ve yönetimi
- ⭐ Müşteri değerlendirmelerini görme

### Admin İçin
- ✅ Kuaför onay/red sistemi
- 📋 Platform yönetimi

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Angular 21, TypeScript, SCSS |
| **Backend** | Spring Boot 3, Java 21 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT Token |
| **Deploy** | Vercel (FE) + Render (BE) |

## 🚀 Canlı Demo

- **Frontend:** [kuaforbul.vercel.app](https://kuaforbul.vercel.app)
- **Backend API:** [kuaforbul-api.onrender.com](https://kuaforbul-api.onrender.com)

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- Java 21
- Maven 3.8+
- PostgreSQL (veya H2 for dev)

### Local Development

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend (yeni terminal)
cd frontend
npm install
npm start
```

Uygulama: http://localhost:4200

### Test Hesapları

| Rol | Email | Şifre |
|-----|-------|-------|
| Müşteri | ahmet@test.com | test123 |
| Kuaför | mustafa@barber.com | barber123 |
| Admin | admin@barber.com | admin123 |

## 🌐 Production Deployment

### 1. Supabase (Database)
```
1. supabase.com → New Project
2. Connection string'i kopyala
```

### 2. Render (Backend)
```
Root Directory: backend
Build: ./mvnw clean package -DskipTests
Start: java -jar target/*.jar

Environment Variables:
- SPRING_PROFILES_ACTIVE=prod
- DB_URL=jdbc:postgresql://...
- DB_USER=postgres
- DB_PASSWORD=<şifre>
- JWT_SECRET=<64-karakter-secret>
- CORS_ORIGINS=https://<vercel-url>
```

### 3. Vercel (Frontend)
```
Root Directory: frontend
Framework: Angular
Auto-deploy: Enabled
```

## 📁 Proje Yapısı

```
barber-platform/
├── backend/
│   ├── src/main/java/com/barber/
│   │   ├── config/          # Security, CORS
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Database access
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.yml
├── frontend/
│   └── src/app/
│       ├── core/            # Services, models
│       └── features/        # Components
│           ├── home/
│           ├── barbers/
│           ├── appointments/
│           ├── barber-panel/
│           └── admin/
└── README.md
```

## 📝 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/register | Kayıt |
| POST | /api/auth/login | Giriş |
| GET | /api/barbers | Kuaför listesi |
| GET | /api/barbers/{id} | Kuaför detayı |
| POST | /api/appointments | Randevu oluştur |
| GET | /api/appointments/my | Randevularım |

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit atın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

**Geliştirici:** Ensar Kaplan  
**İletişim:** ensarkaplan.ce@gmail.com
