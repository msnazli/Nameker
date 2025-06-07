# Nameker Project

## Project Overview
Nameker is a web application consisting of three main components:
- **Backend**: A Node.js + Express server for handling API requests.
- **Admin Panel**: A React-based admin panel for managing the application.
- **Mini App**: A Telegram Mini App built with Vite and React.

## Project Structure
```
Nameker/
│
├── backend/          # Node.js + Express server
├── admin/            # React-based admin panel
├── miniapp/          # Telegram Mini App (Vite + React)
└── database/         # Models, seeders, or Mongo configs
```

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Nameker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in each directory (`backend`, `admin`, `miniapp`) based on the `.env.example` files.

## Running the Project
- **Backend**:
  ```bash
  cd backend
  npm run dev
  ```
- **Admin Panel**:
  ```bash
  cd admin
  npm start
  ```
- **Mini App**:
  ```bash
  cd miniapp
  npm run dev
  ```

## Deployment Instructions
- **Deploy on Railway**:
  - Ensure all environment variables are set in Railway.
  - Deploy each service independently using the Railway CLI or dashboard.

## Environment Variables
- **Backend**:
  - `PORT`: Port for the server.
  - `DATABASE_URL`: Database connection string.
  - `JWT_SECRET`: Secret key for JWT.
  - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins.

- **Admin**:
  - `API_URL`: URL for the backend API.

- **Mini App**:
  - `VITE_API_URL`: URL for the backend API.
  - `VITE_TELEGRAM_BOT_TOKEN`: Telegram bot token.

## Additional Resources
- [Railway Documentation](https://railway.app/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)

## Technology Stack

### Admin API (Backend)
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- OpenAI integration

### Admin Panel
- React 18
- TypeScript
- React Router DOM
- TailwindCSS for styling

### Mini App
- Vite
- React 18
- TypeScript
- i18next for internationalization

## Development Progress

### Completed Tasks
1. **Project Structure Setup**
   - Initialized monorepo structure
   - Configured TypeScript
   - Set up build scripts

2. **Backend Development**
   - Created Express API structure
   - Implemented health check endpoint
   - Set up MongoDB connection
   - Added basic error handling

3. **Frontend Development**
   - Created Vite React application
   - Implemented routing
   - Added internationalization support
   - Set up production build configuration

4. **Deployment Configuration**
   - Set up Railway deployment for all services
   - Configured environment variables
   - Added health check endpoints
   - Implemented production-ready builds

### Current Status
- All components are configured as standalone applications
- Railway deployment is set up for all services
- Basic infrastructure is in place
- Ready for feature development

### Pending Tasks
1. **Admin Panel**
   - Implement authentication flow
   - Add main application features
   - Complete UI/UX design
   - Add error handling

2. **Mini App**
   - Integrate with Telegram API
   - Implement main features
   - Optimize for performance

3. **Backend**
   - Complete API endpoints
   - Implement authentication middleware
   - Add OpenAI integration
   - Set up proper logging

## Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License
[MIT License](LICENSE)