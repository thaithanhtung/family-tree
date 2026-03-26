# Family Tree Application

Ứng dụng quản lý cây gia phả với React Flow visualization.

## Tech Stack

**Backend:**
- Node.js + Express.js
- Prisma ORM + PostgreSQL
- Redis (caching & rate limiting)
- Pino Logger
- JWT Authentication

**Frontend:**
- React + TypeScript
- TailwindCSS
- React Flow (@xyflow/react)
- React Query + Zustand

## Cấu trúc dự án

```
backend-node/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   ├── middlewares/    # Auth, rate limit, logger
│   └── utils/          # Prisma, Redis, Logger
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migration files
├── frontend/           # React application
├── Dockerfile          # Backend Docker config
├── docker-compose.yml  # Multi-service orchestration
└── server.js           # Entry point
```

---

## Docker Commands

### Khởi động ứng dụng

```bash
# Build và chạy tất cả services (lần đầu)
docker-compose up -d --build

# Chạy services (đã build rồi)
docker-compose up -d

# Chạy và xem logs realtime
docker-compose up
```

### Dừng ứng dụng

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (XÓA DATABASE!)
docker-compose down -v

# Dừng 1 service cụ thể
docker-compose stop backend
```

### Xem logs

```bash
# Xem logs tất cả services
docker-compose logs

# Xem logs realtime
docker-compose logs -f

# Xem logs của 1 service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis

# Xem 50 dòng cuối
docker-compose logs --tail=50 backend
```

### Rebuild services

```bash
# Rebuild 1 service
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Rebuild tất cả
docker-compose up -d --build

# Rebuild không dùng cache
docker-compose build --no-cache backend
```

### Truy cập vào container

```bash
# Vào shell của backend
docker-compose exec backend sh

# Vào shell của frontend
docker-compose exec frontend sh

# Vào PostgreSQL
docker-compose exec postgres psql -U postgres -d my_app

# Vào Redis CLI
docker-compose exec redis redis-cli
```

### Prisma commands (trong Docker)

```bash
# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Reset database (XÓA TẤT CẢ DATA!)
docker-compose exec backend npx prisma migrate reset --force

# Tạo migration mới
docker-compose exec backend npx prisma migrate dev --name migration_name

# Mở Prisma Studio
docker-compose exec backend npx prisma studio
```

### Kiểm tra trạng thái

```bash
# Xem services đang chạy
docker-compose ps

# Xem resource usage
docker stats

# Kiểm tra health
curl http://localhost/health        # Frontend (qua Nginx)
curl http://localhost:3000/health   # Backend trực tiếp (nếu expose port)
```

### Database commands

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres my_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres my_app < backup.sql

# Xem danh sách tables
docker-compose exec postgres psql -U postgres -d my_app -c "\dt"

# Chạy SQL query
docker-compose exec postgres psql -U postgres -d my_app -c "SELECT * FROM users;"
```

### Redis commands

```bash
# Xem tất cả keys
docker-compose exec redis redis-cli KEYS "*"

# Xem memory usage
docker-compose exec redis redis-cli INFO memory

# Xóa cache
docker-compose exec redis redis-cli FLUSHALL

# Xem giá trị của key
docker-compose exec redis redis-cli GET "familyTree:1:persons"
```

### Cleanup

```bash
# Xóa containers đã dừng
docker container prune

# Xóa images không dùng
docker image prune

# Xóa tất cả không dùng (containers, images, networks)
docker system prune

# Xóa volumes không dùng (CẨN THẬN - XÓA DATA!)
docker volume prune
```

---

## Development (Local)

### Cài đặt

```bash
# Backend
npm install

# Frontend
cd frontend && npm install
```

### Chạy local

```bash
# Backend (cần PostgreSQL và Redis local)
npm run dev

# Frontend
cd frontend && npm run dev
```

### Environment Variables

Tạo file `.env` từ `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/my_app"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_HOST="localhost"
REDIS_PORT="6379"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Đăng ký |
| POST | /auth/login | Đăng nhập |
| POST | /auth/refresh | Refresh token |
| GET | /family-trees | Danh sách cây gia phả |
| POST | /family-trees | Tạo cây mới |
| GET | /family-trees/:id | Chi tiết cây |
| GET | /persons/family-tree/:id | Danh sách thành viên |
| POST | /persons | Thêm thành viên |
| GET | /marriages/family-tree/:id | Danh sách hôn nhân |
| POST | /marriages | Tạo quan hệ hôn nhân |
| POST | /seed/family-tree | Tạo data mẫu |

---

## Troubleshooting

### Port đã được sử dụng

```bash
# Kiểm tra port 80
lsof -i :80

# Kiểm tra port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database connection failed

```bash
# Kiểm tra postgres đang chạy
docker-compose ps postgres

# Xem logs postgres
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Backend crash loop

```bash
# Xem logs chi tiết
docker-compose logs --tail=100 backend

# Kiểm tra migrations
docker-compose exec backend npx prisma migrate status
```

### Clear everything và bắt đầu lại

```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
```
