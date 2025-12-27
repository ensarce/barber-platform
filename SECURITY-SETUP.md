# Barber Platform - Security Setup Guide

This guide provides instructions for securely configuring the Barber Platform application with proper environment variables and security settings.

## Critical Security Requirements

**⚠️ NEVER commit secrets to version control**
**⚠️ NEVER use default/example values in production**
**⚠️ ALWAYS use environment variables for sensitive configuration**

---

## Required Environment Variables

### 1. JWT Secret (CRITICAL)

The JWT secret is used to sign authentication tokens. It **MUST** be:
- At least 256 bits (32 bytes) in length
- Cryptographically random
- Different for each environment
- Never committed to git

#### Generate JWT Secret

**Option A: Using OpenSSL (Recommended)**
```bash
# Generate a 512-bit (64-byte) base64-encoded secret
openssl rand -base64 64
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Option C: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Set JWT Secret
```bash
# Linux/Mac
export JWT_SECRET="your-generated-secret-here"

# Windows PowerShell
$env:JWT_SECRET="your-generated-secret-here"

# Windows CMD
set JWT_SECRET=your-generated-secret-here
```

---

### 2. Database Credentials

#### For Development (H2 Database)
```bash
# No specific credentials needed for H2 in development
# Ensure SPRING_PROFILES_ACTIVE=dev is set
export SPRING_PROFILES_ACTIVE=dev
```

#### For Production (PostgreSQL)
```bash
# Generate strong database password (minimum 20 characters)
export DB_NAME=barber_db
export DB_USER=barber_app_user  # DO NOT use 'postgres' or 'admin'
export DB_PASSWORD="$(openssl rand -base64 32)"  # Strong random password
export DB_URL="jdbc:postgresql://localhost:5432/${DB_NAME}"
export DB_DRIVER=org.postgresql.Driver

# For production
export SPRING_PROFILES_ACTIVE=prod
```

---

### 3. Admin Account Password

The admin account is created on first application startup.

```bash
# Generate strong admin password (minimum 12 characters, complexity required)
# Include uppercase, lowercase, numbers, and special characters
export ADMIN_PASSWORD="YourSecure@Admin#Password123!"
```

**⚠️ Requirements:**
- Minimum 12 characters
- Must include: uppercase, lowercase, numbers, special characters
- Change this password immediately after first login
- Never use common passwords or dictionary words

---

### 4. Test Data Password (Development Only)

For development environments, test users are created with a configurable password:

```bash
# Optional: Override default test user password in development
export DEV_TEST_PASSWORD="TestPass123!"
```

**Note:** If not set, defaults to "TestPass123!" for dev profile only.

---

### 5. CORS Configuration

Configure allowed origins for cross-origin requests:

```bash
# Development (multiple localhost ports)
export CORS_ORIGINS="http://localhost:4200"

# Production (your actual domain)
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## Environment-Specific Configuration

### Development Environment

Create a `.env.dev` file (DO NOT commit to git):

```bash
# Development Environment Variables
SPRING_PROFILES_ACTIVE=dev
JWT_SECRET=<generated-with-openssl-rand-base64-64>
ADMIN_PASSWORD=DevAdmin123!@#
DEV_TEST_PASSWORD=TestPass123!
CORS_ORIGINS=http://localhost:4200
```

### Production Environment

Create a `.env.prod` file (DO NOT commit to git):

```bash
# Production Environment Variables
SPRING_PROFILES_ACTIVE=prod

# JWT Configuration
JWT_SECRET=<generated-with-openssl-rand-base64-64>

# Database Configuration
DB_NAME=barber_db
DB_USER=barber_app_user
DB_PASSWORD=<generated-strong-password>
DB_URL=jdbc:postgresql://your-db-host:5432/barber_db
DB_DRIVER=org.postgresql.Driver

# Admin Account
ADMIN_PASSWORD=<your-strong-admin-password>

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

---

## Docker Compose Setup

### Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: barber-db-dev
    environment:
      POSTGRES_DB: ${DB_NAME:-barber_dev}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

### Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: barber-db-prod
    environment:
      POSTGRES_DB: ${DB_NAME}  # REQUIRED from environment
      POSTGRES_USER: ${DB_USER}  # REQUIRED from environment
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # REQUIRED from environment
    ports:
      - "5432:5432"
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_prod_data:
```

Run with:
```bash
# Load environment variables
source .env.prod  # Linux/Mac
# or
$env:DOTENV_FILE=".env.prod"; docker-compose -f docker-compose.prod.yml up  # Windows

# Start containers
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## Application Startup

### Development Mode
```bash
# Set environment variables
export SPRING_PROFILES_ACTIVE=dev
export JWT_SECRET="$(openssl rand -base64 64)"
export ADMIN_PASSWORD="DevAdmin123!@#"

# Run Spring Boot application
cd backend
./mvnw spring-boot:run
```

### Production Mode
```bash
# Load production environment variables
source .env.prod

# Validate required variables
if [ -z "$JWT_SECRET" ] || [ -z "$ADMIN_PASSWORD" ] || [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: Required environment variables not set"
    exit 1
fi

# Run application
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## Security Checklist

Before deploying to production, ensure:

- [ ] Strong JWT secret generated (64+ bytes, base64 encoded)
- [ ] All database credentials use strong, unique passwords
- [ ] Admin password meets complexity requirements (12+ chars)
- [ ] `.env` files are in `.gitignore`
- [ ] No secrets committed to version control
- [ ] `SPRING_PROFILES_ACTIVE=prod` is set
- [ ] H2 console is disabled (automatic in prod profile)
- [ ] SQL logging is disabled (automatic in prod profile)
- [ ] CORS origins restricted to production domains only
- [ ] HTTPS/TLS is configured and enforced
- [ ] Database uses connection encryption (SSL/TLS)

---

## Rotating Secrets

### Rotating JWT Secret

**⚠️ WARNING:** Rotating the JWT secret will invalidate all existing user sessions.

```bash
# 1. Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 64)

# 2. Update environment variable
export JWT_SECRET="$NEW_JWT_SECRET"

# 3. Restart application
# All users will need to log in again

# 4. Update production deployment configuration
# (Kubernetes secrets, AWS Secrets Manager, etc.)
```

### Rotating Database Password

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Change password
ALTER USER barber_app_user WITH PASSWORD 'new-strong-password-here';

# 3. Update environment variable
export DB_PASSWORD="new-strong-password-here"

# 4. Restart application
```

---

## Troubleshooting

### Application Won't Start - Missing JWT_SECRET

**Error:**
```
***************************
APPLICATION FAILED TO START
***************************

Description:
Failed to bind properties under 'jwt.secret' to java.lang.String
```

**Solution:**
```bash
# Set JWT_SECRET environment variable
export JWT_SECRET="$(openssl rand -base64 64)"
```

### Application Won't Start - Missing ADMIN_PASSWORD

**Error:**
```
java.lang.IllegalStateException: ADMIN_PASSWORD environment variable must be set
```

**Solution:**
```bash
# Set ADMIN_PASSWORD environment variable
export ADMIN_PASSWORD="YourSecure@Admin#Password123!"
```

### Database Connection Failed

**Error:**
```
Cannot create PoolableConnectionFactory (FATAL: password authentication failed)
```

**Solution:**
```bash
# Verify database credentials
echo $DB_USER
echo $DB_NAME
# DO NOT echo $DB_PASSWORD (security risk)

# Test database connection
psql -h localhost -U $DB_USER -d $DB_NAME
```

---

## Additional Security Measures

### 1. Use a Secrets Management System

For production deployments, use a proper secrets management system:

- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Cloud Secret Manager**
- **Kubernetes Secrets**

### 2. Enable Database Encryption

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://host:5432/db?ssl=true&sslmode=require
```

### 3. Implement Secret Rotation Schedule

- JWT Secret: Rotate every 90 days
- Database Password: Rotate every 30 days
- Admin Password: Require change every 90 days

### 4. Monitor for Exposed Secrets

Use tools like:
- `git-secrets` - Prevent committing secrets
- `truffleHog` - Find secrets in git history
- `gitleaks` - Detect hardcoded secrets

---

## Support

For security issues or questions, please refer to the main project documentation or contact the security team.

**DO NOT share secrets in support tickets or public forums.**
