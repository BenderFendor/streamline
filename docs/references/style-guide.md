# style-guide.md -- UI and code style conventions

## UI conventions

### Design system
- AMOLED dark theme: background `#030303`, cards `#0A0A0A`, hover `#141414`.
- Accent colors: primary pink/red `#FF3D71`, secondary blue `#0095FF`.
- Text: primary white, secondary `#B3B3B3`, tertiary `#6C6C6C`.

### Typography
- Body: Plus Jakarta Sans (`--font-body`)
- Headings: Space Grotesk (`--font-display`)
- Code/technical: JetBrains Mono (`--font-mono`)

### Effects
- Custom cursor (hidden on mobile via `md:cursor-none`)
- Glitch text effect on main heading
- Floating posters background animation
- Tilt card hover effect
- Noise texture overlay
- Glow shadows and ambient gradient orbs
- Vignette overlay on home page

### Components
- Use `CinematicNav` for navigation (not `Nav`).
- Use `PageWrapper` for pages needing cursor + ambient effects.
- Use `LoadingSpinner` for loading states.
- Use `lucide-react` for icons.

## Code conventions

### TypeScript
- Strict mode enabled in tsconfig.
- Path alias: `@/*` maps to `src/*`.
- All functions must have explicit return types.

### File organization
- Page routes: `src/app/<route>/page.tsx`
- API routes: `src/app/api/<route>/route.ts`
- Shared components: `src/app/components/`
- Library code: `src/app/lib/`

### Naming
- React components: PascalCase.
- Functions: camelCase.
- Types/interfaces: PascalCase.
- Files: PascalCase for components, kebab-case or camelCase for utilities.

### Import order
1. React/Next.js imports
2. Third-party library imports
3. Local imports (`@/...` or relative)
