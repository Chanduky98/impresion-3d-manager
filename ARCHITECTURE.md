# Application Architecture

## Overview

This is a full-stack Next.js 14 application for managing 3D printing operations, with a Turso Cloud database backend.

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js 14 Application                       │   │
│  │  ┌────────────────┐          ┌─────────────────┐    │   │
│  │  │  Frontend      │          │  API Routes     │    │   │
│  │  │  (React)       │◄────────►│  (Node.js)      │    │   │
│  │  │                │          │                 │    │   │
│  │  │  - Dashboard   │          │  - Auth         │    │   │
│  │  │  - Printers    │          │  - Printers     │    │   │
│  │  │  - Orders      │          │  - Orders       │    │   │
│  │  │  - Pieces      │          │  - Pieces       │    │   │
│  │  │  - Costing     │          │  - Maintenance  │    │   │
│  │  │  - Maintenance │          │  - Dashboard    │    │   │
│  │  └────────────────┘          └─────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTP/HTTPS
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Turso      │ │   Vercel     │ │  Vercel      │
   │  Database    │ │   Analytics  │ │  Edge Config │
   │  (SQLite)    │ │              │ │              │
   └──────────────┘ └──────────────┘ └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (Vercel serverless)
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Authentication**: JWT tokens + bcrypt
- **Database Driver**: @libsql/client

### Database
- **Type**: Turso Cloud (SQLite-compatible)
- **Connection**: libSQL protocol with auth token
- **Migrations**: Prisma migrations + custom script

## Authentication Flow

```
User Login
    │
    ├─► POST /api/auth/login
    │   ├─► Verify email exists
    │   ├─► Verify password with bcrypt
    │   ├─► Generate JWT token
    │   └─► Return token
    │
    ├─► Store token in localStorage
    │
    └─► Include in Authorization header
        Bearer <token>
        
Protected Endpoint
    │
    ├─► Extract token from header
    ├─► Validate token with validateSession()
    ├─► Load user from database
    ├─► Check permissions (admin/user)
    └─► Return protected data or error
```

## Database Schema

Main tables:
- **User**: Authentication credentials and roles
- **Session**: Token tracking and validation
- **Printer**: 3D printer inventory and status
- **Piece**: Printable designs and specifications
- **Material**: Filament and material costs
- **Order**: Customer orders
- **OrderItem**: Individual items in orders
- **PrintJob**: Actual print runs
- **Client**: Customer information
- **Maintenance**: Maintenance records
- **Settings**: Application configuration

## Deployment Architecture

### Local Development
```
Your Machine
    │
    ├─► SQLite (dev.db)
    ├─► Next.js Dev Server
    └─► Prisma Client
```

### Production (Vercel + Turso)
```
Vercel Edge Network
    │
    ├─► Serverless Functions
    │   └─► API Routes
    │
    ├─► Static Assets
    │   └─► CSS, JS, Images
    │
    └─► Environment Variables
        └─► DATABASE_URL (libSQL)

    │
    ▼

Turso Cloud Database
    │
    ├─► libSQL Protocol
    ├─► Auth Token
    └─► SQLite Backend
```

## Data Flow Example: Creating an Order

```
1. User clicks "New Order"
   └─► Frontend shows form dialog

2. User submits form
   └─► POST /api/orders with JWT token

3. Backend validates:
   ├─► Check authentication token
   ├─► Validate order data (Zod schema)
   └─► Check client exists

4. Database operation:
   ├─► Prisma creates Order record
   ├─► Creates associated OrderItems
   └─► Stores in Turso

5. Response sent back:
   ├─► Return created order ID
   └─► Frontend refreshes list

6. Data persisted:
   └─► Available in Turso until deleted
```

## Performance Considerations

### Frontend
- Optimized images with Next.js Image component
- CSS bundling and minification
- Code splitting by route
- Client-side caching with localStorage

### Backend
- Serverless functions (Vercel) scale automatically
- Database queries optimized with Prisma includes
- Token validation cached per request
- CORS enabled for specific origins

### Database
- Turso handles scaling automatically
- SQLite optimized for read-heavy workloads
- Indexes on frequently queried fields
- Connection pooling built-in

## Security Measures

1. **Authentication**
   - JWT tokens with timestamp validation
   - 24-hour token expiration
   - Bcrypt password hashing (10 rounds)

2. **Authorization**
   - Admin vs User role separation
   - Token validation on every protected route
   - Session tracking in database

3. **API Security**
   - CORS configured to specific origins
   - Input validation with Zod schemas
   - SQL injection prevention via Prisma ORM
   - XSS prevention via React

4. **Data Protection**
   - Environment variables for secrets
   - .env files excluded from git
   - HTTPS required on production

## Scalability

As your business grows:
- Vercel auto-scales serverless functions
- Turso handles increased data volume
- Database can be upgraded to larger tiers
- CDN automatically caches static assets
- Additional databases can be created for redundancy

## Monitoring & Logs

Available in:
- **Vercel Dashboard**: Deployment status, function logs
- **Turso Console**: Database usage, query logs
- **Browser Console**: Frontend errors and logs
- **Server Logs**: API errors and validation issues
