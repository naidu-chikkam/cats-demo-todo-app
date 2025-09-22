# Full-Featured Todo List Application

A comprehensive todo list application built with Next.js (Pages Router), Drizzle ORM, and Shadcn/UI.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - Sign up, sign in, logout with session management
- ✅ **Todo Management** - Create, read, update, delete todos with rich details
- ✅ **Dual View System**:
  - **List View** - Traditional todo list with filtering, sorting, and search
  - **Kanban Board** - Drag-and-drop interface with three columns (To Do, In Progress, Completed)

### Todo Features
- Title and description
- Priority levels (Low, Medium, High, Urgent)
- Due dates
- Status tracking (To Do, In Progress, Completed)
- Mark as complete/incomplete
- Inline editing
- Bulk operations

### UI/UX Features
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works on mobile and desktop
- 🎨 **Modern UI** - Built with Shadcn/UI components
- 🔔 **Toast Notifications** - Real-time feedback for actions
- ⚡ **Loading States** - Smooth user experience
- 🎯 **Form Validation** - Client and server-side validation

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (Pages Router), React 19, TypeScript
- **UI Components**: Shadcn/UI, Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with HTTP-only cookies
- **Drag & Drop**: @dnd-kit
- **Validation**: Zod
- **Notifications**: Sonner
- **Themes**: next-themes

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cats-demo-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGDATABASE=your_db_name
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the database**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npx drizzle-kit push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 📋 Usage

### Getting Started
1. Navigate to `http://localhost:3000`
2. Click "Create Account" to register a new user
3. Or click "Sign In" if you already have an account

### Managing Todos
1. After logging in, you'll see the dashboard with two view options
2. **List View**: Traditional interface with search, filtering, and sorting
3. **Kanban Board**: Drag todos between columns to change their status

### Todo Operations
- **Create**: Click "Add Todo" and fill in the details
- **Edit**: Click the edit icon on any todo
- **Delete**: Click the trash icon to remove a todo
- **Complete**: Check the checkbox or drag to "Completed" column
- **Filter**: Use the dropdown to filter by status
- **Search**: Type in the search box to find specific todos
- **Sort**: Choose sorting criteria (date, priority, title)

### Theme Management
- Click the sun/moon icon in the header to toggle between light and dark themes

## 🗄 Database Schema

The application uses three main tables:

### Users
- `id` - Primary key
- `name` - User's display name
- `email` - Unique email address
- `password` - Hashed password
- `created_at`, `updated_at` - Timestamps

### Todos
- `id` - Primary key
- `user_id` - Foreign key to users table
- `title` - Todo title (required)
- `description` - Optional description
- `status` - Enum: 'todo', 'in_progress', 'completed'
- `priority` - Enum: 'low', 'medium', 'high', 'urgent'
- `due_date` - Optional due date
- `completed` - Boolean flag
- `created_at`, `updated_at` - Timestamps

### Sessions
- `id` - Session identifier
- `user_id` - Foreign key to users table
- `expires_at` - Session expiration
- `created_at` - Timestamp

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx drizzle-kit generate    # Generate migrations
npx drizzle-kit push        # Push migrations to database
npx drizzle-kit studio      # Open database studio

# Code Quality
npm run lint         # Run linter
npm run format       # Format code
```

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn/UI components
│   ├── Layout.tsx       # Main layout component
│   ├── ProtectedRoute.tsx
│   ├── TodoForm.tsx     # Todo creation/edit form
│   ├── TodoListView.tsx # List view component
│   ├── TodoKanbanView.tsx # Kanban board component
│   └── theme-provider.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── db/
│   ├── index.ts         # Database connection
│   ├── schema.ts        # Database schema
│   └── migrations/      # Generated migrations
├── hooks/
│   └── useTodos.ts      # Todo management hook
├── lib/
│   ├── auth.ts          # Authentication utilities
│   ├── middleware.ts    # API middleware
│   └── utils.ts         # Utility functions
├── pages/
│   ├── api/             # API routes
│   ├── index.tsx        # Home page
│   ├── login.tsx        # Login page
│   ├── register.tsx     # Registration page
│   ├── dashboard.tsx    # Main dashboard
│   └── _app.tsx         # App wrapper
├── styles/
│   └── globals.css      # Global styles
└── util/
    └── env.ts           # Environment configuration
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT tokens with secure HTTP-only cookies
- CSRF protection through same-site cookies
- SQL injection prevention with Drizzle ORM
- Input validation on client and server
- Protected API routes
- User data isolation

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   - Ensure PostgreSQL is running
   - Update environment variables
   - Run migrations: `npx drizzle-kit push`

3. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

Built with ❤️ using Next.js, Drizzle ORM, and Shadcn/UI
