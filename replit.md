# BazaarLive - Advanced Marketplace Platform

## Overview

BazaarLive is a comprehensive full-stack marketplace platform inspired by Poshmark, built with modern web technologies. The application supports multiple verticals including fashion, jobs, real estate, cars, boats, and services, with features for social commerce, live selling, and user-generated content. The platform now features a personalized feed system as the main authenticated user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Serverless connection pool via @neondatabase/serverless

## Key Components

### Core Modules

#### User Management
- Replit Auth integration for authentication
- User profiles with social features (followers, following)
- Profile customization and verification system
- Session management with PostgreSQL storage

#### Marketplace Features
- Multi-category listing system (fashion, jobs, real estate, cars, boats, services)
- Advanced search and filtering capabilities
- Social commerce features (likes, comments, follows)
- Image upload and management for listings
- View tracking and engagement metrics
- Personalized feed system with "For You" and "Following" tabs
- Brand-based content organization and discovery
- Trending items and user suggestions

#### Social Features
- User-to-user messaging system
- Comment system on listings
- Like/heart functionality
- Follow/unfollow relationships
- Activity feeds and notifications

#### UI Components
- Comprehensive design system with custom components
- Responsive layouts optimized for mobile and desktop
- Glass morphism effects and gradient styling
- Accessible components built on Radix UI

### Data Models

#### Core Entities
- **Users**: Complete profile system with social metrics
- **Listings**: Multi-category items with rich metadata
- **Social Interactions**: Likes, comments, follows, messages
- **Transactions**: Order and payment tracking (structure ready)

#### Category System
- Enum-based category definitions
- Extensible structure for new verticals
- Category-specific metadata and filtering

## Data Flow

### Authentication Flow
1. Replit Auth handles OAuth/OIDC authentication
2. User session stored in PostgreSQL via connect-pg-simple
3. Session validation middleware protects API routes
4. Frontend uses React Query for auth state management
5. Authenticated users are redirected to personalized feed as default experience

### Dynamic Routing Flow (NEW - January 26, 2025)
1. **Route Configuration Service**: Centralized route management with AOP principles
2. **Route Guard Service**: Authentication and authorization middleware with route protection
3. **Navigation Service**: Intelligent URL generation and category mapping
4. **Dynamic Route Patterns**: Support for `/marketplace/{vertical}/{category}/{subcategory}` and `/brands/{brand}/{category}`
5. **SEO-Optimized URLs**: Clean, bookmarkable paths with proper metadata generation

### Content Management Flow
1. Users create listings through form validation (React Hook Form + Zod)
2. Data validated against Drizzle schema definitions
3. API endpoints handle CRUD operations with proper authorization
4. Real-time updates via React Query invalidation

### Social Interaction Flow
1. User actions (likes, follows, comments) trigger API calls
2. Database updates maintain referential integrity
3. Optimistic updates provide immediate feedback
4. Background sync ensures data consistency

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Development Dependencies
- **typescript**: Type safety
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with TypeScript compilation via tsx
- Replit-specific plugins for development environment integration
- Environment-based configuration management

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild compiles backend to `dist/index.js`
- Served as single Express application with static file serving
- Database migrations via Drizzle Kit

### Environment Configuration
- **Development**: Local development with Replit Auth sandbox
- **Production**: Optimized builds with proper caching headers
- **Database**: Neon PostgreSQL with connection pooling
- **Sessions**: PostgreSQL-backed session storage for scalability

### Scalability Considerations
- Serverless-compatible database connections
- Stateless session management
- CDN-ready static asset structure
- Microservice-ready API design patterns

## Recent Changes (January 26, 2025)

### ✅ Dynamic Routing System Implementation
- **Enterprise-grade routing architecture** with AOP principles and best practices
- **Service-based architecture**: RouteConfigService, RouteGuardService, NavigationService
- **Advanced router hook** (`useRouter`) with route guards and metadata management
- **SEO-optimized dynamic routes**: `/marketplace/{vertical}`, `/marketplace/{vertical}/{category}`, `/brands/{brand}`
- **Intelligent navigation mapping**: Automatic vertical detection from category context
- **Type-safe routing**: Comprehensive TypeScript interfaces and validation
- **Route protection**: Authentication guards with redirect handling
- **Breadcrumb generation**: Hierarchical navigation with proper metadata
- **Clean URL structure**: No query parameters, proper slugified paths

### ✅ Updated Navigation System
- **Header vertical links** now use dynamic routes (`/marketplace/jobs`, `/marketplace/cars`, etc.)
- **Navigation dropdowns** generate category-specific dynamic routes
- **Brand navigation** with dedicated routing patterns
- **Section routing** for "Shop All" functionality

### ✅ Server-Side Enhancements
- **Marketplace API router** with validation and filtering
- **Dynamic route support** in server routes registration
- **Type-safe query validation** using Zod schemas