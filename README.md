# Customer Rewards Program

A comprehensive React.js application demonstrating a **retailer rewards program** where customers earn points based on their purchases. This project showcases modern React development patterns, Clean Architecture principles, feature-based organization, and comprehensive testing strategies.

## Architecture

### Clean Architecture Implementation

This project follows **Clean Architecture** principles with clear separation of concerns:

#### Server-Side Architecture
```
src/server/
├── routes/           # Route definitions (Express route handlers)
├── controllers/      # Request/response handling
├── services/         # Business logic layer
└── utils/            # Pure utility functions
```

**Flow:** Routes → Controllers → Services → Utils

- **Routes** (`customerRoutes.js`): Define API endpoints
- **Controllers** (`customerController.js`): Handle HTTP requests/responses, error handling
- **Services** (`customerService.js`): Business logic (point calculations, data aggregation)
- **Utils**: Pure functions (date formatting, points calculation, data loading)

#### Client-Side Architecture
```
src/
├── features/         # Feature-based modules
│   ├── customers/   # Customer-related features
│   │   ├── components/
│   │   └── hooks/
│   └── transactions/ # Transaction-related features
│       ├── hooks/
│       └── utils/
├── components/      # Shared UI components
└── screens/         # Page-level components
```

**Key Principles:**
- **Feature-Based Organization**: Related functionality grouped by feature
- **Custom Hooks**: Business logic extracted from components into reusable hooks
- **Separation of Concerns**: UI components focus on presentation, hooks handle logic

### Technology Stack

#### Frontend
- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.2** - Fast build tool and dev server
- **React Router DOM 7.8.2** - Client-side routing
- **TanStack React Table 8.21.3** - Powerful table management
- **Sass 1.92.0** - Enhanced CSS with SCSS modules
- **Vitest 3.2.4** - Fast unit testing framework
- **React Testing Library 16.3.0** - Component testing utilities

#### Backend
- **Express.js 5.1.0** - Web server framework
- **Node.js** - JavaScript runtime
- **File-based JSON storage** - Simple data persistence
- **UUID** - Unique identifier generation

#### Development Tools
- **ESLint** - Code linting and formatting
- **Concurrently** - Run multiple npm scripts simultaneously
- **JSDOM** - DOM testing environment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-rewards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   API_BASE_URL=http://localhost:3001/api
   ```

4. **Development Options**

   **Option A: Run frontend and backend separately**
   ```bash
   # Terminal 1 - Start the API server
   npm run server

   # Terminal 2 - Start the React development server
   npm run dev
   ```

   **Option B: Run both simultaneously**
   ```bash
   # Runs both API server and React dev server concurrently
   npm run dev:all
   ```

5. **Access the application**
   - **Frontend:** http://localhost:5173
   - **API Server:** http://localhost:3001
   - **API Endpoints:** http://localhost:3001/api/*

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start Express API server |
| `npm run dev:all` | Run both frontend and backend |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Business Logic

Points are calculated per transaction using the following rules:

- **2 points** for every dollar spent **over $100**
- **1 point** for every dollar spent **between $50 and $100**
- Purchases **$50 and under** earn **0 points**

**Example:** A $120 purchase = `2 × (120 - 100) + 1 × (100 - 50)` = **90 points**

The application summarizes reward points **per customer**, broken down **per month** (over a 3-month period), plus a **total**.

## Project Structure

```
react-rewards/
├── public/                          # Static assets
├── src/
│   ├── features/                   # Feature-based modules
│   │   ├── customers/              # Customer feature
│   │   │   ├── components/        # Customer-related components
│   │   │   │   ├── MonthlyCell/
│   │   │   │   └── RewardsReport/
│   │   │   └── hooks/             # Customer-related hooks
│   │   │       └── useCustomers.js
│   │   └── transactions/          # Transaction feature
│   │       ├── hooks/
│   │       │   └── useTransactions.js
│   │       └── utils/
│   │           ├── pointsCalculator.js
│   │           └── dateFormatter.js
│   ├── components/                 # Shared UI components
│   │   └── Header/
│   ├── screens/                    # Page-level components
│   │   ├── Home/
│   │   └── Transaction/
│   ├── server/                     # Backend server code
│   │   ├── routes/                # API route definitions
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   └── utils/                 # Utility functions
│   │       ├── dateUtils.js
│   │       ├── pointsCalculator.js
│   │       ├── dataLoader.js
│   │       └── uuidGenerator.js
│   ├── data/                       # JSON data files
│   │   └── transactions.json
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React app entry point
│   ├── routes.jsx                  # Route definitions
│   └── server.js                   # Express server entry point
├── dist/                           # Production build output
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── vitest.config.js                # Test configuration
└── README.md                       # Project documentation
```

## Core Features & Components

### 1. RewardsReport Component
**Location:** `src/features/customers/components/RewardsReport/RewardsReport.jsx`

The main component that displays customer rewards data in a sophisticated table format.

**Key Features:**
- **Data Fetching:** Uses `useCustomers` hook to retrieve customer points from `/api/customer-points`
- **Table Management:** Uses TanStack React Table v8 for advanced table functionality
- **Sorting:** Configurable column sorting with 3 states (none → ASC → DESC)
- **Pagination:** Built-in pagination with customizable page sizes (10, 20, 30, 40, 50)
- **Modal Integration:** Click rows to view detailed transaction history
- **Loading States:** Proper loading and error handling
- **Responsive Design:** Mobile-friendly table layout

**Custom Hooks Used:**
- `useCustomers()` - Fetches and manages customer data
- `useTransactions()` - Fetches transaction details for modal

### 2. MonthlyCell Component
**Location:** `src/features/customers/components/MonthlyCell/MonthlyCell.jsx`

A specialized table component that displays monthly breakdown data within the main rewards table.

**Features:**
- **Nested Table:** Renders a table within table cells
- **Monthly Data:** Shows points and amount spent per month
- **Currency Formatting:** Proper dollar amount formatting
- **Empty State Handling:** Displays "No data" when appropriate

### 3. Express API Server
**Location:** `src/server.js`

A robust Node.js/Express server providing RESTful APIs following Clean Architecture.

**API Endpoints:**

#### `GET /api/customer-points`
Returns aggregated customer data with points and spending information.

**Response Format:**
```javascript
{
  "success": true,
  "data": [
    {
      "customerId": "u1",
      "name": "John Doe",
      "totalPoints": 450,
      "totalAmountSpent": 275.50,
      "monthlyPoints": {
        "2025-06": { "points": 150, "amountSpent": 75.50 },
        "2025-07": { "points": 200, "amountSpent": 100.25 },
        "2025-08": { "points": 100, "amountSpent": 99.75 }
      }
    }
  ]
}
```

#### `GET /api/transactions`
Returns all transactions with enriched customer information.

#### `GET /api/customer-transactions/:customerId`
Returns detailed transaction history for a specific customer.

**Response Format:**
```javascript
{
  "success": true,
  "data": {
    "customerId": "u1",
    "customerName": "John Doe",
    "transactions": [
      {
        "transactionId": "t1",
        "amount": 75.50,
        "date": "2025-06-15T00:00:00.000Z",
        "points": 25
      }
    ]
  }
}
```

## Testing Strategy

This project includes comprehensive testing using **Vitest** and **React Testing Library**.

### Test Coverage
- **RewardsReport.test.jsx** - Component tests covering data fetching, table rendering, sorting, pagination, modal interactions, and error handling
- **MonthlyCell.test.jsx** - Component tests covering table structure, data formatting, edge cases, and empty states
- **App.test.jsx** - Route rendering and component integration tests
- **server.test.js** - API endpoint tests and utility function tests

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test RewardsReport
```

## Key Implementation Details

### Date Handling
- Uses `Intl.DateTimeFormat` for proper date formatting
- No string manipulation for dates (e.g., `.substring`)
- All date operations use proper `Date` objects

### Points Calculation
- Strict rounding/flooring implemented inside calculation utility
- Prevents fractional point errors
- Business logic isolated in service layer

### Data Integrity
- All transactions and customers have unique UUIDs
- UUIDs generated server-side if missing
- React keys use unique IDs, never array indexes

### State Management
- Custom hooks for data fetching (`useCustomers`, `useTransactions`)
- `useMemo` for derived state instead of redundant `useEffect` + `useState`
- Proper loading and error states throughout

### Code Quality
- Descriptive variable names (no single-letter variables)
- Proper separation of concerns
- DRY principles applied
- Clean, maintainable code structure

## Additional Resources

- [TanStack Table Documentation](https://tanstack.com/table/v8)
- [React Router Documentation](https://reactrouter.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)
