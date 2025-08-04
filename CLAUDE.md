# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with error reporting
- `npm run lint:fix` - Run ESLint and auto-fix issues

## Architecture

### Project Structure
This is a React dashboard application for monitoring AI chatbot conversations. The app uses:
- **Frontend**: React 18 + Vite + TailwindCSS
- **State Management**: React hooks (custom `useChats` hook)
- **HTTP Client**: Axios with interceptors for auth and error handling
- **Routing**: React Router DOM
- **Styling**: TailwindCSS with custom theme

### Key Architecture Patterns

**Service Layer Architecture**: API calls are centralized in service files:
- `src/services/api.js` - Generic HTTP client with auth interceptors
- `src/services/chatService.js` - Chat-specific API methods
- `src/config/api.js` - API endpoints and configuration

**Layout System**: Responsive layout with sidebar navigation:
- `src/components/layout/Layout.jsx` - Main layout wrapper
- `src/components/layout/Header.jsx` - Top navigation
- `src/components/layout/Sidebar.jsx` - Side navigation

**Custom Hooks Pattern**: Business logic abstracted into reusable hooks:
- `src/hooks/useChats.js` - Manages chat data, user selection, and search

**API Integration**: Backend expects these endpoints:
- `/auth/*` - Authentication (login, refresh tokens)
- `/chats/*` - Chat data by date/user
- `/users/*` - User information and activity
- `/dashboard/*` - Statistics and analytics
- WebSocket at `/ws/chats` for real-time updates

### Environment Variables
- `VITE_API_BASE_URL` - Backend API URL (defaults to http://localhost:8000/api)
- `VITE_WS_URL` - WebSocket URL (defaults to ws://localhost:8000)

### Authentication Flow
- JWT tokens stored in localStorage (`auth_token`, `refresh_token`)
- Automatic token refresh on 401 responses
- Redirects to `/login` on auth failure

### Styling Conventions
- Uses `cn()` utility from `src/utils/cn.js` for conditional TailwindCSS classes
- Custom color palette with primary (blue) and gray scales
- Responsive design with mobile-first approach
- Custom animations: fade-in, slide-in, pulse-slow