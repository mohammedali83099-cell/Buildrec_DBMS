# BUILDREC Backend API

The high-performance REST API backend for the **BUILDREC Construction Site Management System**.

## Tech Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript (`tsx` for dev hot-reload)
- **Database Driver**: `mysql2` with connection pooling
- **Architecture**: Modular routes with automated database trigger parity and in-memory store fallback

## Directory Structure
- `src/config/`: Database connection pool (`db.ts`) and verified in-memory fallback store (`initialData.ts`)
- `src/routes/`: Modular REST route controllers:
  - `projects.ts`: Projects and Sites endpoints
  - `procurement.ts`: Suppliers, Purchase Orders, Deliveries, and Delivery Items
  - `materials.ts`: Catalog Materials, Live Site Stock, and Material Issues
  - `progress.ts`: Contractors, Labour Teams, Work Packages, and Progress Entries
  - `billing.ts`: Contractor Bills and Payment Disbursals
  - `reports.ts`: Analytical reporting and aggregated views
- `src/types/`: Domain TypeScript entity models (`index.ts`)
- `src/index.ts`: Express application bootstrap and middleware configuration

## Development
```bash
npm install
npm run dev      # Starts API server at http://localhost:5000 with hot-reload
npm run build    # Compiles TypeScript to dist/
```
