# lti-nest

A monorepo application with NestJS backend and Nuxt.js frontend.

## Project Structure

```
lti-nest/
├── apps/
│   ├── backend/     # NestJS backend application
│   └── frontend/    # Nuxt.js frontend application
├── package.json     # Root workspace configuration
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0 (recommended: >= 20.19.0 or >= 22.12.0 for Nuxt 4)
- npm >= 9.0.0

## Installation

Install all dependencies for both packages:

```bash
npm install
```

This will install dependencies for both the backend and frontend packages using npm workspaces.

## Development

### Run both applications

Run both backend and frontend in development mode:

```bash
npm run dev
```

### Run applications separately

**Backend (NestJS):**
```bash
# Development mode with watch
npm run backend:dev

# Production mode
npm run backend:start:prod

# Build
npm run backend:build
```

**Frontend (Nuxt.js):**
```bash
# Development mode
npm run frontend:dev

# Production mode
npm run frontend:start

# Build
npm run frontend:build
```

## Available Scripts

### Root Level Scripts

- `npm run dev` - Run both backend and frontend in development mode
- `npm run build` - Build both applications
- `npm run backend:dev` - Run backend in development mode
- `npm run backend:build` - Build backend
- `npm run backend:start` - Start backend
- `npm run backend:start:prod` - Start backend in production mode
- `npm run frontend:dev` - Run frontend in development mode
- `npm run frontend:build` - Build frontend
- `npm run frontend:start` - Start frontend

### Backend Scripts (in `apps/backend`)

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode (development)
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the project
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the code

### Frontend Scripts (in `apps/frontend`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run start` - Start production server

## Default Ports

- **Backend (NestJS)**: `http://localhost:3000`
- **Frontend (Nuxt.js)**: `http://localhost:3000` (or next available port)

## Technologies

- **Backend**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Frontend**: [Nuxt.js](https://nuxt.com/) - The Intuitive Vue Framework

## Resources

### NestJS
- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Discord](https://discord.gg/G7Qnnhy)

### Nuxt.js
- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Nuxt.js Discord](https://discord.com/invite/nuxt)

## License

MIT
