# SEO Analyzer - Comprehensive Website Analysis Platform

A full-stack SEO analysis platform built with Next.js, NestJS, and Prisma. Features advanced web crawling, real-time SEO auditing, project management, and subscription-based access controls.

## 🚀 Features

### 🕷️ Advanced Web Crawler
- **JavaScript Rendering**: Playwright-powered crawler with configurable render times
- **SEO-Focused Filtering**: Intelligent URL filtering to crawl only SEO-valuable content
- **Robots.txt Compliance**: Respects robots.txt with configurable allowed paths override
- **Real-time Progress**: WebSocket-based progress updates and job management
- **Performance Optimized**: Efficient crawling with depth control and rate limiting

### 🔍 Comprehensive SEO Analysis
- **On-Page SEO**: Title tags, meta descriptions, headings structure analysis
- **Technical SEO**: Schema markup, meta tags, canonical URLs, HTTPS validation
- **Content Quality**: Word count, content-to-HTML ratio, language detection
- **Image Optimization**: Alt attributes, title attributes, optimization checks
- **Link Analysis**: Internal/external link categorization and nofollow detection

### 👥 User Management & Authentication
- **NextAuth Integration**: Secure JWT-based authentication with Google OAuth
- **Role-Based Access**: Admin and user roles with granular permissions
- **Profile Management**: User profile updates with validation
- **Email Verification**: Automated email verification system
- **Rate Limiting**: IP-based rate limiting for security

### 💰 Subscription Management
- **Flexible Plans**: Multiple subscription tiers with feature restrictions
- **Trial System**: 14-day free trial for new users
- **Usage Tracking**: Project limits and feature access control
- **Payment Integration**: Ready for Intasend/payment provider integration

### 📊 Project & Analytics
- **Project Organization**: Multi-project management with domain tracking
- **Historical Data**: Track SEO improvements over time
- **Performance Metrics**: Page load times, crawl statistics
- **Export Capabilities**: Data export for reporting and analysis

## 🏗️ Architecture

### Monorepo Structure
```
├── apps/
│   ├── client/          # Next.js frontend application
│   └── server/          # NestJS backend API
├── packages/            # Shared utilities and types
├── docs/               # Documentation and guides
└── scripts/            # Build and deployment scripts
```

### Technology Stack

**Frontend (Next.js 14)**
- React 18 with TypeScript
- Tailwind CSS for styling
- NextAuth.js for authentication
- SWR for data fetching
- Recharts for data visualization
- Radix UI components

**Backend (NestJS)**
- TypeScript-first architecture
- Prisma ORM with MongoDB
- JWT authentication
- WebSocket support
- Rate limiting with express-rate-limit
- Comprehensive API documentation

**Infrastructure**
- MongoDB for data persistence
- Redis for caching (optional)
- Playwright for browser automation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- MongoDB instance
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/seo-analyzer.git
cd seo-analyzer
```

2. **Install dependencies**
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

3. **Environment Configuration**

Create `.env` files in both `apps/client` and `apps/server`:

**Client (.env.local)**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

**Server (.env)**
```env
DATABASE_URL="mongodb://localhost:27017/seo-analyzer"
NEXTAUTH_SECRET=your-super-secret-key
JWT_SECRET=your-jwt-secret-key
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

4. **Database Setup**
```bash
# Generate Prisma client
cd apps/server
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

5. **Start Development Servers**
```bash
# Start both client and server
bun run dev

# Or start individually
bun run dev:client  # Frontend on :3000
bun run dev:server  # Backend on :3001
```

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Account created successfully!",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "trialEndsAt": "2024-01-07T00:00:00.000Z"
  }
}
```

### Crawler Endpoints

#### POST `/api/crawler/jobs`
Start a new crawl job.

**Request Body:**
```json
{
  "urls": ["https://example.com"],
  "maxDepth": 2,
  "maxPages": 100,
  "respectRobotsTxt": true,
  "crawlDelay": 1000,
  "renderTime": 5000,
  "allowedPaths": ["/special-pages/*"]
}
```

#### GET `/api/crawler/jobs/{jobId}`
Get crawl job status and results.

**Response:**
```json
{
  "jobId": "job_id",
  "completed": false,
  "progress": {
    "totalUrls": 50,
    "processedUrls": 25,
    "pendingUrls": 25,
    "errorUrls": 0,
    "currentDepth": 1
  },
  "pages": [...],
  "errors": [...]
}
```

### User Management

#### GET `/api/users/me`
Get current user profile with subscription details.

#### PATCH `/api/users/me`
Update user profile information.

#### GET `/api/admin/users` (Admin only)
List all users with pagination and filtering.

For complete API documentation, see [API Documentation](./docs/api.md).

## 🔧 Configuration

### Crawler Configuration

The crawler supports extensive configuration options:

```typescript
interface CrawlJob {
  urls: string[];              // Starting URLs
  maxDepth: number;           // Maximum crawl depth
  maxPages: number;           // Maximum pages to crawl
  userAgent?: string;         // Custom user agent
  disableJavaScript?: boolean; // Disable JS rendering
  respectRobotsTxt?: boolean; // Respect robots.txt
  crawlDelay?: number;        // Delay between requests (ms)
  renderTime?: number;        // JS render timeout (ms)
  allowedPaths?: string[];    // Override robots.txt for paths
  excludePatterns?: string[]; // URL patterns to exclude
  includePatterns?: string[]; // URL patterns to prioritize
  customHeaders?: Record<string, string>;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;           // Request timeout
  retries?: number;          // Retry failed requests
}
```

### SEO Analysis Configuration

The SEO analyzer performs comprehensive analysis including:

- **Title Tags**: Length validation, duplicate detection
- **Meta Descriptions**: Length validation, missing descriptions
- **Headings Structure**: H1-H6 hierarchy analysis
- **Image Optimization**: Alt text, title attributes
- **Link Analysis**: Internal/external, nofollow detection
- **Technical SEO**: Schema markup, meta tags, HTTPS
- **Content Quality**: Word count, content ratio
- **Social Meta**: Open Graph, Twitter Cards

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run frontend tests
bun run test:client

# Run backend tests
bun run test:server

# Run with coverage
bun run test:coverage
```

### Test Categories

- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Crawler performance benchmarks

## 🚀 Deployment

### Docker Deployment

1. **Build containers**
```bash
docker-compose build
```

2. **Start services**
```bash
docker-compose up -d
```

### Manual Deployment

1. **Build applications**
```bash
bun run build
```

2. **Start production servers**
```bash
bun run start
```

### Environment Variables for Production

Ensure all environment variables are properly set:
- Database connection strings
- Authentication secrets
- API keys for external services
- CORS origins
- Rate limiting configurations

## 📊 Monitoring & Analytics

### Performance Monitoring
- Crawler job performance metrics
- API response times
- Database query performance
- Memory usage tracking

### Business Metrics
- User registration and retention
- Subscription conversions
- Feature usage analytics
- Crawl success rates

### Logging
- Structured logging with Winston
- Error tracking and alerting
- Audit logs for admin actions
- Crawler job logs

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
```bash
bun test
```

6. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```

7. **Push to your branch**
```bash
git push origin feature/amazing-feature
```

8. **Open a Pull Request**

### Code Standards

- **TypeScript**: Strict typing required
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: Use conventional commit messages
- **Test Coverage**: Maintain >80% coverage

### Project Structure Guidelines

```
apps/client/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions

apps/server/
├── src/
│   ├── auth/           # Authentication modules
│   ├── crawler/        # Crawler services
│   ├── users/          # User management
│   ├── projects/       # Project management
│   └── utils/          # Utility functions
└── test/               # Test files
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [API Documentation](./docs/api.md)
- [Authentication Guide](./docs/AUTHENTICATION.md)
- [Crawler Documentation](./docs/crawler.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🐛 Known Issues & Roadmap

### Known Issues
- Large HTML documents may experience slower processing times
- WebSocket connections may need reconnection handling
- Rate limiting may be too restrictive for some use cases

### Roadmap
- [ ] Machine learning for SEO recommendations
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] API rate limiting improvements
- [ ] Webhook integrations
- [ ] Advanced user role management
- [ ] Custom SEO rule configurations
- [ ] Integration with Google Search Console
- [ ] Automated SEO alerts and notifications
- [ ] Advanced competitor analysis

## 💬 Support

For support, bug reports, or feature requests:

- **Issues**: [GitHub Issues](https://github.com/yourusername/seo-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/seo-analyzer/discussions)
- **Email**: support@seo-analyzer.com
- **Documentation**: [docs.seo-analyzer.com](https://docs.seo-analyzer.com)

---

Built with ❤️ by the SEO Analyzer team
