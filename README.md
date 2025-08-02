# DhobiGhat Frontend

A Next.js frontend application for managing clothing items and cleaning schedules.

## Features

- **Home Page**: View all clothing items organized by type with accordion functionality
- **Add Item**: Form to create new clothing items
- **Item Details**: Individual item page with cleaning interval management
- **Type Management**: View and manage all items of a specific type
- **Responsive Design**: Modern UI with Tailwind CSS

## Pages

1. **Home (`/`)**: Displays all clothing items indexed by type with expandable accordions
2. **Add Item (`/add`)**: Form to submit new clothing items
3. **Item Details (`/item/[id]`)**: Individual item page with cleaning interval update component
4. **Type Page (`/type/[type]`)**: Shows all items of a specific type with bulk interval management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (optional):
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

1. Run linting to check for issues:
   ```bash
   npm run lint
   ```

2. Run type checking:
   ```bash
   npm run type-check
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## Vercel Deployment

The application is configured for Vercel deployment:

- ESLint errors will fail the build (configured in `next.config.js`)
- TypeScript errors will fail the build (configured in `next.config.js`)
- Environment variables can be set in Vercel dashboard
- Automatic deployments on git push to main branch

## API Integration

The frontend connects to the DhobiGhat API backend. Make sure the backend is running on `http://localhost:8000` (or update the `NEXT_PUBLIC_API_URL` environment variable).

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── add/               # Add item form
│   ├── item/[id]/         # Individual item page
│   ├── type/[type]/       # Type management page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   └── api.ts            # API client
├── types/                 # TypeScript type definitions
│   └── index.ts          # Clothing item types
└── package.json          # Dependencies and scripts
```

## Development

- The app uses the App Router (Next.js 13+)
- All pages are client-side rendered for interactivity
- API calls are handled through the `clothingApi` utility
- Responsive design with mobile-first approach
- Error handling and loading states throughout 