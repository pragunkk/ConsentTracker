# Data Consent Management System

## Overview

This is a full-stack consent management application built with React and Express. The system allows users to track and manage data consent records, including who has access to what data, when consent was given, and when it expires. The application features a modern dashboard interface with filtering, searching, and consent lifecycle management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Data Models
- **Users**: Basic user authentication with username/password
- **Consent Records**: Comprehensive consent tracking with fields for:
  - Document information (name, type, size)
  - Access details (data accessed, access level, purpose)
  - User relationships (host user, guest user)
  - Temporal data (access date, expiry date)
  - Status tracking (active, expiring, expired)

### Frontend Components
- **ConsentDashboard**: Main dashboard with stats, filters, and table
- **ConsentTable**: Paginated table with sorting and action buttons
- **ConsentFilters**: Search, status filtering, and date range filtering
- **ConsentModal**: Detailed view of consent records
- **ConsentStats**: Summary statistics cards

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handlers**: RESTful endpoints for consent record CRUD operations
- **Database Schema**: Drizzle ORM schema definitions in shared module

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Routes**: Express routes handle requests and validate data
3. **Storage Layer**: Abstracted storage interface processes business logic
4. **Database Operations**: Drizzle ORM handles PostgreSQL interactions
5. **Response**: JSON responses sent back to client
6. **Client Updates**: React Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **react-hook-form**: Form validation and management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool with hot module replacement
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite bundles React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Development**: Uses Vite dev server with Express backend
- **Production**: Serves static files from Express with built frontend

### Development Workflow
- `npm run dev`: Starts development server with hot reloading
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs production build
- `npm run db:push`: Pushes schema changes to database

### Architecture Decisions

**Database Choice**: PostgreSQL with Drizzle ORM was chosen for:
- Strong typing and schema validation
- Excellent PostgreSQL feature support
- Migration system for schema evolution
- Serverless compatibility with Neon

**Frontend State Management**: TanStack Query was selected for:
- Excellent caching and synchronization
- Optimistic updates support
- Background refetching capabilities
- Simplified server state management

**UI Component Strategy**: Radix UI + shadcn/ui provides:
- Accessible, unstyled components
- Consistent design system
- Customizable with Tailwind CSS
- Comprehensive component coverage

**Storage Abstraction**: Interface-based storage layer enables:
- Easy testing with in-memory implementation
- Future database provider swapping
- Clean separation of concerns
- Simplified business logic testing