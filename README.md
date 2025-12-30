# Rental Management Backend API

Enterprise-level NestJS backend API for rental property management system with MongoDB.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

- **Modules**: Feature-based organization (auth, users, properties, rooms, tenants, payments, reminders, notifications)
- **Common**: Shared utilities, guards, filters, interceptors, pipes
- **Config**: Environment configuration and validation
- **Database**: MongoDB with Mongoose ODM

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

## 🚀 Features

- ✅ **Authentication & Authorization**: JWT-based auth with role-based access control
- ✅ **Property Management**: Manage rental properties with statistics
- ✅ **Room Management**: Track room availability, pricing, and tenant assignments
- ✅ **Tenant Management**: Manage tenant information and rental history
- ✅ **Payment Management**: Track payments, fees, and overdue amounts
- ✅ **Reminder System**: Automated payment reminders with scheduling
- ✅ **Notifications**: Real-time notifications for unpaid/overdue payments
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Security**: Helmet, CORS, rate limiting, input sanitization
- ✅ **Testing**: Unit tests, property-based tests, E2E tests

## 📋 Prerequisites

- **Node.js**: v18+ or v20+
- **npm**: v9+ or v10+
- **MongoDB**: v7.0+
- **Git**: Latest version

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd rental-backend-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/rental-management

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.100:19000

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or using local MongoDB installation
mongod
```

## 🏃 Running the Application

### Development mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production mode

```bash
npm run build
npm run start:prod
```

### Debug mode

```bash
npm run start:debug
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:cov
```

### Run E2E tests

```bash
npm run test:e2e
```

### Run property-based tests

```bash
npm test -- --testPathPattern=pbt
```

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── config/                # Configuration
├── common/                # Shared utilities
│   ├── decorators/       # Custom decorators
│   ├── filters/          # Exception filters
│   ├── guards/           # Auth guards
│   ├── interceptors/     # Interceptors
│   ├── pipes/            # Validation pipes
│   └── database/         # Database utilities
└── modules/              # Feature modules
    ├── auth/            # Authentication
    ├── users/           # User management
    ├── properties/      # Property management
    ├── rooms/           # Room management
    ├── tenants/         # Tenant management
    ├── payments/        # Payment management
    ├── reminders/       # Reminder system
    └── notifications/   # Notifications
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete structure.

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **Input Validation**: class-validator DTOs
- **Input Sanitization**: NoSQL injection prevention

## 🛡️ Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

## 📊 Database Schema

### Collections

- **users**: User accounts with authentication
- **properties**: Rental properties
- **rooms**: Rooms within properties
- **tenants**: Tenant information
- **payments**: Payment records
- **reminders**: Payment reminders
- **reminder_logs**: Reminder delivery logs

See design document for detailed schema definitions.

## 🔄 Development Workflow

### 1. Create a new feature module

```bash
nest g module modules/feature-name
nest g controller modules/feature-name
nest g service modules/feature-name
```

### 2. Create DTOs

```bash
mkdir src/modules/feature-name/dto
touch src/modules/feature-name/dto/create-feature.dto.ts
```

### 3. Create schemas

```bash
mkdir src/modules/feature-name/schemas
touch src/modules/feature-name/schemas/feature.schema.ts
```

### 4. Write tests

```bash
mkdir test/unit/feature-name
touch test/unit/feature-name/feature.service.spec.ts
```

### 5. Run tests

```bash
npm test
```

## 📝 Code Style

This project uses:

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled

### Format code

```bash
npm run format
```

### Lint code

```bash
npm run lint
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 👥 Authors

- Development Team

## 🐛 Known Issues

None at the moment.

## 📞 Support

For support, please contact the development team.

## 🗺️ Roadmap

- [x] Implement all feature modules
- [x] Add comprehensive API documentation
- [x] Add security middleware (Helmet, CORS, Rate Limiting)
- [x] Add input sanitization
- [x] Add request/response logging
- [ ] Add comprehensive test coverage (property-based tests)
- [ ] Add API rate limiting per user
- [ ] Add performance monitoring
- [ ] Add database migrations
- [ ] Add Docker support
- [ ] Add CI/CD pipeline

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Swagger Documentation](https://swagger.io/)
