import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Mini E-commerce API')
    .setDescription(
      'A comprehensive Mini E-commerce API with authentication, product management, shopping cart, orders, and payment processing. Built with NestJS and TypeORM.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and registration endpoints')
    .addTag('Admin', 'Admin-only endpoints for product management')
    .addTag('Cart', 'Shopping cart management for customers')
    .addTag('Orders', 'Order placement and retrieval')
    .addTag('Payments', 'Payment processing with Stripe integration')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Mini E-commerce API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
