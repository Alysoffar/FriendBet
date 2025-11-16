# Database Setup Instructions

## Quick Setup Guide

### 1. Install PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- During installation, set a password for the `postgres` user (remember this!)
- Keep default port: 5432

### 2. Create Database
Open PowerShell and run:
```powershell
psql -U postgres
```
Enter your password, then run:
```sql
CREATE DATABASE friendbet;
\q
```

### 3. Update .env File
Edit `.env` and replace `postgres:postgres` with your actual credentials:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/friendbet?schema=public"
```

### 4. Initialize Database Tables
Run these commands in order:
```powershell
npx prisma generate
npx prisma db push
```

### 5. Restart Dev Server
```powershell
npm run dev
```

Now go to http://localhost:3000/auth/register and create your account!

---

## Alternative: Use Docker (If you prefer)
```powershell
docker run --name friendbet-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=friendbet -p 5432:5432 -d postgres
```
Then use: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/friendbet?schema=public"`
