# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection:
```env
DATABASE_URL=mongodb://localhost:27017/rental-management
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use local MongoDB
mongod
```

### 4. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Access API Documentation
Open your browser: `http://localhost:3000/api/docs`

---

## 📁 Project Structure (Quick Reference)

```
src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── config/              # Configuration
├── common/              # Shared utilities
│   ├── decorators/     # @CurrentUser, @Roles
│   ├── filters/        # Error handling
│   ├── guards/         # Auth guards
│   ├── interceptors/   # Request/response
│   ├── pipes/          # Validation
│   └── database/       # DB utilities
└── modules/            # Feature modules
    ├── auth/          # Authentication
    ├── users/         # User management
    ├── properties/    # Properties
    ├── rooms/         # Rooms
    ├── tenants/       # Tenants
    ├── payments/      # Payments
    ├── reminders/     # Reminders
    └── notifications/ # Notifications
```

---

## 🛠️ Common Commands

### Development
```bash
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run E2E tests
```

### Code Quality
```bash
npm run lint          # Lint code
npm run format        # Format code
```

### Build
```bash
npm run build         # Build for production
npm run start:prod    # Run production build
```

---

## 📚 Documentation

- **README.md** - Project overview and setup
- **PROJECT_STRUCTURE.md** - Detailed structure guide
- **ARCHITECTURE.md** - Architecture principles
- **REFACTORING_SUMMARY.md** - What changed and why

### Module-Specific Docs
- **src/common/README.md** - Common utilities
- **src/modules/README.md** - Module development
- **test/README.md** - Testing strategy
- **src/common/database/README.md** - Database utilities

---

## 🎯 Next Steps

### For New Developers
1. Read `README.md` for project overview
2. Read `PROJECT_STRUCTURE.md` to understand structure
3. Read `ARCHITECTURE.md` to understand design
4. Start implementing features in `src/modules/`

### For Implementation
1. ✅ Project structure created
2. ✅ Database connection configured
3. ⏳ Implement Auth module (Task 6)
4. ⏳ Implement Users module (Task 5)
5. ⏳ Implement Properties module (Task 7)
6. ⏳ Implement remaining modules

### For Testing
1. Write unit tests in `test/unit/`
2. Write property-based tests in `test/property/`
3. Write E2E tests in `test/e2e/`
4. Create test fixtures in `test/fixtures/`

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
docker ps

# Start MongoDB
docker start mongodb

# Or run new container
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

---

## 💡 Tips

### Creating a New Module
```bash
# Generate module files
nest g module modules/feature-name
nest g controller modules/feature-name
nest g service modules/feature-name

# Create DTOs and schemas manually
mkdir src/modules/feature-name/dto
mkdir src/modules/feature-name/schemas
```

### Using Database Utilities
```typescript
import { baseSchemaOptions } from '@/common/database';

@Schema(baseSchemaOptions)
export class MyEntity {
  // Timestamps added automatically
}
```

### Adding Authentication
```typescript
@Controller('my-resource')
@UseGuards(JwtAuthGuard)
export class MyController {
  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    // user is automatically extracted from JWT
  }
}
```

---

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review code examples in modules
3. Contact development team

---

## 🎉 You're Ready!

The project is now properly structured and ready for development. Happy coding! 🚀
