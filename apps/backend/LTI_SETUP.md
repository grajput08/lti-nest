# LTI 1.3 Integration Setup

This NestJS backend application implements LTI 1.3 (Learning Tools Interoperability) integration with Canvas LMS.

## Overview

The LTI implementation uses the following key components:

- **ltijs**: Core LTI 1.3 provider library
- **ltijs-sequelize**: PostgreSQL database adapter for storing LTI platform and deployment data
- **NestJS**: Framework for building scalable server-side applications

## Architecture

### Module Structure

```
src/lti/
├── types/
│   └── ltijs.types.ts       # TypeScript type definitions for ltijs library
├── lti.module.ts            # LTI module configuration
├── lti.service.ts           # Core LTI service with initialization logic
├── lti.controller.ts        # Controller handling all LTI routes
├── lti-database.service.ts  # Database configuration service
└── canvas.config.ts         # Canvas LMS platform configuration
```

## Configuration

### Environment Variables

Update your `.env` file with the following variables:

```env
PORT=8080
NODE_ENV=local

LTI_KEY=your_lti_key_here
APP_URL=http://localhost:8080
APP_TIMEOUT_URL=/timeout

DB_NAME=lti_database
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432

CANVAS_URL=https://canvas.instructure.com
CANVAS_CLIENT_ID=your_canvas_client_id_here
```

### Key Configuration Parameters

- **LTI_KEY**: Encryption key for securing LTI tokens
- **APP_URL**: Your application's base URL
- **DB_***: PostgreSQL database connection details
- **CANVAS_***: Canvas LMS integration settings

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database for LTI data storage:

```sql
CREATE DATABASE lti_database;
```

### 3. Configure Environment

Update the `.env` file with your actual database credentials and LTI configuration.

### 4. Build the Application

```bash
npm run build
```

### 5. Start the Server

```bash
npm run start:dev
```

## How It Works

### Initialization Flow

1. **App Bootstrap** (`main.ts`):
   - Creates NestJS application
   - Retrieves HTTP server instance
   - Initializes LTI service with the server

2. **LTI Setup** (`lti.service.ts`):
   - Configures database plugin
   - Sets up LTI provider with encryption key
   - Registers Canvas LMS platform
   - Configures authentication endpoints

3. **Request Handling** (`lti.controller.ts`):
   - Catches all routes using wildcard pattern
   - Delegates to LTI provider app for processing
   - Handles LTI launch, deep linking, and other LTI workflows

### Key Features

- **Secure Token Management**: Uses encryption for LTI token storage
- **Session Management**: Configurable token expiration
- **Platform Registration**: Automatic Canvas LMS platform setup
- **Cookie Configuration**: Supports both local and production environments
- **TypeScript Support**: Full type safety with custom type definitions

## Canvas LMS Integration

The application automatically registers with Canvas LMS using these endpoints:

- **Authentication**: `{CANVAS_URL}/api/lti/authorize_redirect`
- **Token**: `{CANVAS_URL}/login/oauth2/token`
- **JWKS**: `{CANVAS_URL}/api/lti/security/jwks`

## Development vs Production

### Local Development
```env
NODE_ENV=local
```
- Cookies: `secure: false`, `sameSite: ''`
- DevMode: `enabled`

### Production
```env
NODE_ENV=production
```
- Cookies: `secure: true`, `sameSite: 'None'`
- DevMode: `disabled`

## Error Handling

The application includes comprehensive error handling:

- Invalid tokens redirect to `APP_TIMEOUT_URL`
- Failed initialization logs detailed error messages
- Build-time TypeScript validation

## Type Safety

Custom TypeScript interfaces ensure type safety throughout the LTI integration:

- `IdToken`: LTI launch token structure
- `PlatformConfig`: Platform registration configuration
- `LtiProvider`: Provider interface with all methods
- `OnConnectCallback`: Type-safe connection handler

## Troubleshooting

### Build Errors

If you encounter TypeScript errors during build:

```bash
npm run build
```

All type errors have been resolved with proper type definitions.

### Database Connection

Ensure PostgreSQL is running and credentials are correct:

```bash
psql -U postgres -d lti_database
```

### LTI Launch Issues

Check the logs for detailed information about the LTI launch process:

```bash
DEBUG=provider:* npm run start:dev
```

## Security Considerations

- Always use HTTPS in production
- Keep `LTI_KEY` secure and never commit it to version control
- Use strong database passwords
- Configure CORS appropriately for your deployment
- Enable cookie security settings in production

## Next Steps

1. Configure Canvas Developer Keys with your `APP_URL`
2. Set up deployment endpoints in Canvas
3. Test LTI launch from Canvas course
4. Implement custom LTI workflows as needed
