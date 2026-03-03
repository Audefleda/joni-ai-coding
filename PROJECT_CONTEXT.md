# Project Context

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) | 16.x (App Router) |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.x |
| Linting | ESLint + eslint-config-next | latest |
| Runtime | Node.js | 18+ |
| Package manager | npm | — |

## Folder Structure

```
vibe_conding/
├── public/                  # Static assets served at /
├── src/
│   ├── app/                 # App Router: layouts, pages, API routes
│   │   ├── layout.tsx       # Root layout (html + body)
│   │   ├── page.tsx         # Home page (/)
│   │   └── globals.css      # Global styles + Tailwind directives
│   ├── components/          # Reusable React components
│   └── lib/                 # Shared utilities, helpers, and config
├── .eslintrc.json           # ESLint configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS config (Tailwind plugin)
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript config (strict mode enabled)
```

### Directory conventions

- **`src/app/`** — All routing lives here. Each folder maps to a URL segment. Use `page.tsx` for pages, `layout.tsx` for shared layouts, `loading.tsx` for loading UI, `error.tsx` for error boundaries, and `route.ts` for API endpoints.
- **`src/components/`** — Presentational and container components. Co-locate component-specific styles or tests alongside the component file.
- **`src/lib/`** — Pure functions, API clients, database helpers, constants, and other non-component logic. Nothing here should import from `components/`.

## Key Conventions

- **Path alias**: `@/*` maps to `src/*` — use `import { X } from "@/components/X"` instead of relative paths.
- **Server vs Client components**: Components are Server Components by default. Add `"use client"` only when you need browser APIs, event handlers, or React hooks.
- **Styling**: Use Tailwind utility classes directly. For complex, reusable patterns consider `@apply` in a CSS module or a component wrapper.
- **TypeScript strict mode**: `strict: true` is enabled — avoid `any`, use proper types and null checks throughout.

## Next Steps

- [ ] Define your data model and add any database/ORM setup (e.g., Prisma, Drizzle) in `src/lib/`
- [ ] Create your first route by adding a folder + `page.tsx` under `src/app/`
- [ ] Build shared UI pieces (Navbar, Footer, Button, etc.) in `src/components/`
- [ ] Add environment variables to `.env.local` and expose public ones with the `NEXT_PUBLIC_` prefix
- [ ] Set up authentication if needed (e.g., NextAuth.js / Auth.js)
- [ ] Configure deployment (Vercel, Docker, etc.) and add CI/CD
- [ ] Run `npm run dev` to start the development server at http://localhost:3000
