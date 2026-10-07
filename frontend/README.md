# BUILDREC Frontend Application

The modern, responsive web frontend for the **BUILDREC Construction Site Management System**.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism Theme
- **Icons**: Lucide React
- **Analytics/Charts**: Recharts

## Directory Structure
- `src/components/`: Reusable UI elements (`Navbar.tsx`, `Sidebar.tsx`, `Modal.tsx`, `StatCard.tsx`)
- `src/pages/`: Module views (`DashboardPage`, `ProjectsSitesPage`, `ProcurementPage`, `MaterialsStockPage`, `ProgressPage`, `BillingPaymentsPage`, `ReportsPage`)
- `src/api.ts`: Centralized, type-safe API client connecting to the backend
- `src/types.ts`: TypeScript domain models
- `public/`: Brand assets, official logos, and favicons

## Development
```bash
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
npm run build    # Produces production bundle
```
