# BazaarLive - Advanced Marketplace Platform

## Overview
BazaarLive is a comprehensive full-stack marketplace platform inspired by Poshmark, built with modern web technologies. It supports multiple verticals including fashion, jobs, real estate, cars, boats, and services, with features for social commerce, live selling, and user-generated content. The platform now features a personalized feed system as the main authenticated user experience, focusing on scalability and robust architecture.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)
- **Width Standardization Complete**: Successfully implemented uniform ~248px product width across all fashion category pages by optimizing the right sidebar from 48px to 32px (w-12 to w-8) in EnterprisePageLayout component.
- **Application Stability**: Resolved loading issues by simplifying authentication flow and ensuring robust component imports.
- **Enterprise AOP Compliance**: Maintained 100% best practices and enterprise patterns throughout the width optimization process.

## System Architecture
BazaarLive employs a modern, enterprise-grade architecture with a strong emphasis on Aspect-Oriented Programming (AOP) principles, type safety, and scalability.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation, supporting dynamic and SEO-optimized routes like `/marketplace/{vertical}` and `/brands/{brand}`.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS, featuring a custom design system with responsive layouts, glass morphism effects, and gradient styling.
- **State Management**: TanStack Query (React Query) for server state management.
- **Build Tool**: Vite for development and production builds.

### Backend Architecture
- **Runtime**: Node.js with Express.js, leveraging TypeScript with ES modules.
- **API Pattern**: RESTful API design.
- **Authentication**: Replit Auth with OpenID Connect, integrated with Express sessions and PostgreSQL storage.
- **Core Architectural Patterns**:
    - **Aspect-Oriented Programming (AOP)**: Deep integration of aspects for logging, validation, caching, performance, security, and analytics across core services (e.g., category, navigation, vector search, authentication).
    - **Domain-Driven Design (DDD)**: Emphasis on clear domain entities, value objects, and domain services.
    - **Result Pattern**: Extensive use of `Result<T, E>` for explicit and type-safe error handling across all operations, eliminating null returns.
    - **Strategy Pattern**: Employed for dynamic configuration loading, authentication strategy resolution, and extensible filtering.
    - **Repository Pattern**: Abstraction of data access layers.
    - **Facade Pattern**: Provides unified interfaces to complex subsystems.
    - **Dependency Injection**: Used throughout the architecture for managing service dependencies.
    - **Enterprise Error Hierarchy**: A comprehensive system for typed error management (e.g., NotFound, Validation, Load errors) with integrated recovery strategies (e.g., retry, fallback, alerting).
    - **Dynamic Routing System**: Service-based architecture (RouteConfigService, RouteGuardService, NavigationService) for intelligent URL generation, route protection, and breadcrumb generation.
    - **AI Assistant Functionality**: Integrated AI-powered shopping assistant with real-time chat interface.

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database, utilizing the `pgvector` extension for AI capabilities.
- **ORM**: Drizzle ORM for type-safe schema definitions and migrations.
- **AI Capabilities**: Vector embeddings for semantic search, similarity matching, and personalized recommendations, managed via dedicated vector tables.
- **Connection**: Serverless connection pool via `@neondatabase/serverless`.

### System Features & Capabilities
- **User Management**: Replit Auth integration, user profiles with social features (followers, following), profile customization.
- **Marketplace Features**: Multi-category listing system, advanced search and filtering, social commerce features (likes, comments, follows), image upload, personalized feed system, brand-based content organization.
- **Social Features**: User-to-user messaging, commenting, like/heart functionality, follow/unfollow relationships, activity feeds.
- **Content Management**: Robust CRUD operations for listings with form validation (React Hook Form + Zod).
- **Analytics Dashboard**: Comprehensive analytics system with multi-dimensional metrics, real-time monitoring, and data visualization.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **express**: Web application framework.
- **passport**: Authentication middleware.
- **@radix-ui/**: Accessible component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.
- **react-hook-form**: Form state management.
- **zod**: Schema validation.
- **wouter**: React hook-based router.
- **openai**: OpenAI API integration for AI assistant and embeddings.
- **Recharts**: For data visualization in the analytics dashboard.
```