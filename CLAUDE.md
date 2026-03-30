# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify embedded app built with React Router (formerly Remix-based), using the Shopify App React Router package. The app is a voucher management system for Shopify stores.

## Common Commands

```bash
# Development - starts the app with Shopify CLI (handles tunneling, environment, etc.)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint

# Type check
npm run typecheck

# Database setup (generate Prisma client + run migrations)
npm run setup

# Generate Prisma client only
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Deploy app to Shopify
npm run deploy
```

## Architecture

### Tech Stack
- **Framework**: React Router v7 with file-based routing (`@react-router/fs-routes`)
- **Shopify Integration**: `@shopify/shopify-app-react-router` for authentication, webhooks, and Admin API
- **Database**: Prisma ORM with SQLite (dev) - stores sessions and app settings
- **UI**: Polaris Web Components (prefixed with `s-`, e.g., `<s-page>`, `<s-button>`)
- **Bundler**: Vite

### Key Files
- [app/shopify.server.js](app/shopify.server.js) - Shopify app configuration and authentication exports
- [app/db.server.js](app/db.server.js) - Prisma client singleton
- [app/routes.js](app/routes.js) - File-system routing configuration
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema (Session + AppSettings models)
- [shopify.web.toml](shopify.web.toml) - Shopify CLI web configuration

### Route Structure
Routes use React Router flat routes convention in `app/routes/`:
- `app._index.jsx` - Main app page (authenticated)
- `app.*.jsx` - Other authenticated app pages
- `auth.$.jsx` - OAuth callback handler
- `webhooks.*.jsx` - Webhook handlers (e.g., `webhooks.app.uninstalled.jsx`)
- `_index/route.jsx` - Public landing page

### Authentication Pattern
```javascript
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // Use admin.graphql() for Admin API calls
};
```

### Webhook Pattern
```javascript
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  // Handle webhook
};
```

## Shopify-Specific Guidelines

- Use `redirect` from `authenticate.admin` for redirects, not from `react-router` (embedded app requirement)
- Use `Link` from `react-router` or Polaris, never raw `<a>` tags
- GraphQL queries use the Admin API (October25 version) via `admin.graphql()`
- App-specific webhooks should be defined in `shopify.app.toml`, not registered programmatically
- Environment variables are managed by Shopify CLI during `npm run dev`

## MCP Integration

The project includes Shopify Dev MCP configuration (`.mcp.json`) for AI-assisted development with Shopify-specific context.
