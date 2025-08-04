# Darban AI Dashboard

A modern, responsive React dashboard for managing AI chatbot conversations and analytics. Built with React, Tailwind CSS, and industry-standard practices.

## Features

### 🎯 Core Features
- **Dashboard Overview**: Real-time statistics and performance metrics
- **Chat Management**: View and manage all user conversations
- **User Management**: Track user activity and engagement
- **Date-based Filtering**: Browse conversations by specific dates
- **Real-time Updates**: Live chat monitoring and notifications
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Dark/Light Theme**: Adaptive color schemes
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design
- **Mobile-First**: Responsive design for all screen sizes

### 🔧 Technical Features
- **Industry Standards**: Modern React patterns and best practices
- **TypeScript Ready**: Easy migration to TypeScript
- **API Integration**: Centralized API configuration for easy endpoint management
- **Mock Data**: Development-ready with realistic mock data
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized rendering and lazy loading

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   ├── layout/         # Layout components (Sidebar, Header, Layout)
│   └── chat/           # Chat-specific components
├── pages/              # Page components
├── services/           # API services and data fetching
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── config/             # Configuration files
└── data/               # Mock data for development
```

## API Integration

### Development Mode
The application uses mock data by default for development. This allows you to:
- Test all features without a backend
- Develop UI components independently
- Demonstrate functionality to stakeholders

### Production Setup
To connect to your real API:

1. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

2. **Update API endpoints in `.env`**
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   VITE_WS_URL=wss://your-api-domain.com
   ```

3. **API Endpoints Structure**
   The application expects these endpoints:
   ```
   GET /api/chats/by-date?date=YYYY-MM-DD
   GET /api/chats/user?user_id=123&date=YYYY-MM-DD
   GET /api/dashboard/stats?date=YYYY-MM-DD
   GET /api/chats/search?q=query
   ```

## Key Components

### Chat Management
- **UserList**: Displays users who chatted on selected date
- **ChatView**: Shows conversation history with proper formatting
- **DatePicker**: Navigate between different dates
- **Search**: Find specific users or conversations

### Dashboard
- **StatsCard**: Display key metrics with trend indicators
- **Activity Feed**: Recent user interactions
- **Performance Metrics**: AI bot analytics

### Layout
- **Responsive Sidebar**: Collapsible navigation with icons
- **Header**: Search, notifications, and user profile
- **Layout**: Consistent page structure

## Customization

### Styling
The application uses Tailwind CSS with a custom design system:
- **Colors**: Primary blue theme with customizable color palette
- **Typography**: Inter font family for modern readability
- **Components**: Consistent spacing and styling patterns

### API Endpoints
All API endpoints are centralized in `src/config/api.js`:
```javascript
export const API_ENDPOINTS = {
  CHATS: {
    LIST: '/chats',
    BY_DATE: '/chats/by-date',
    BY_USER: '/chats/user',
    // ... more endpoints
  }
}
```

### Mock Data
Customize mock data in `src/data/mockData.js` to match your data structure.

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**