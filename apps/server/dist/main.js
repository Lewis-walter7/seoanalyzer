"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const prisma_client_exception_filter_1 = require("./common/filters/prisma-client-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS for development - allow Next.js origin
    app.enableCors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
    });
    // Serve static files
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    // Apply global filters
    app.useGlobalFilters(new prisma_client_exception_filter_1.PrismaClientExceptionFilter());
    // Enable global validation
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    // Use proper structured logging for application startup
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🚀 SEO Analyzer API running on http://localhost:${port}`);
    }
    else {
        console.info(`SEO Analyzer API started on port ${port}`);
    }
}
bootstrap();
