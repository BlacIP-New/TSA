# TSA (Next.js)

This project now runs on Next.js (App Router) while preserving the existing TSA UI and React Router flow during the migration.

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checking

## Environment Variables

Client-side config variables should use the `NEXT_PUBLIC_` prefix:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_AGGREGATOR_ID`
