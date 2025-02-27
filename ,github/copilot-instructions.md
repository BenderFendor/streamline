# Project Rules & Guidelines

## Core Development Principles
- Use meaningful comments to explain complex functionality
- Maintain clear documentation for public methods/properties
- Use descriptive function and variable names
- Design modular, testable "black box" functions
- Reference cloudflarepagedoc.md and projectrules.md and tailwind.md anilist.md and tmdb.md
- Document new features in doc.md with design philosophy

## Tech Stack

### Core Technologies
- **Next.js 14+** - React framework for production
- **React 18+** - UI library
- **TypeScript** - Programming language with strict typing
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Shadcn/ui** - React component library
- **Lucide Icons** - SVG icon library
- **Radix UI** - Headless UI components

### State Management & Data Fetching
- **React Hooks** - Local state management
- **Custom Hooks** - Reusable logic
- **Server Actions** - Data mutations

### Deployment
- **Cloudflare Pages** - Web application hosting platform

## Design Philosophy

### Core Principles
1. **Dark AMOLED Theme** - Pure black (#000000) for OLED optimization
2. **Dual Mode Interface**
    - Grid Mode: Traditional news layout
    - Doomscroll Mode: Infinite scroll experience
3. **Modular Architecture** - Self-contained components
4. **Mobile-First Design** - Responsive priority
5. **Code Quality Standards**
6. **Accessibility** - WCAG & ARIA compliance
7. **Performance** - Optimized loading & rendering

### Documentation Standards

### Modular and Testable Design

Black Box Functions: Design functions to take inputs and produce outputs without side effects, making them testable. For example, a function to fetch news articles should return data without modifying global state.
Modularity: Separate concerns into modules, such as UI components, data fetching, and business logic, for easier maintenance.
Testability: Write unit tests for each module, ensuring they can be tested independently, especially for Next.js server actions and React hooks.

#### Commenting Best Practices
- Focus on complex logic explanation
- Use block comments for multi-line `/* */`
- Use line comments for single-line `//`
- Keep comments updated during refactoring

#### JSDoc Documentation
```typescript
/**
 * Fetches user data from the API.
 * @param userId The ID of the user to fetch
 * @returns A promise resolving to user data
 */
async function fetchUserData(userId: string): Promise<User>
```

### Naming Conventions
- Functions: camelCase, descriptive (e.g., calculateTotalViews)
- Variables: camelCase, meaningful (e.g., userCount)
- Classes: PascalCase
- Tailwind: Semantic (e.g., bg-black, article-card)

### Error Handling 

Error Handling Inspired by Rust

    Explicit Error Handling: Inspired by Rust, handle errors explicitly using TypeScript's mechanisms. Use try-catch blocks for runtime errors and return custom error objects for failure cases.

    Custom Error Types: Define custom error classes extending Error, e.g.:

    Distinguish Errors: Differentiate recoverable errors (e.g., API rate limit) from unrecoverable ones (e.g., invalid state), throwing exceptions for the latter.

```typescript
class ApiError extends Error {
  constructor(message: string) {
     super(message);
     this.name = 'ApiError';
  }
}

type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

### Implementation Guidelines
- Use pure black (#000000) for AMOLED themes
- Support both grid and scroll layouts
- Implement responsive design
- Follow WCAG accessibility guidelines
- Optimize performance with lazy loading
- Adhere to TypeScript conventions
- Include comprehensive JSDoc documentation
