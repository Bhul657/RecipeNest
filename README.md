# 🍴 RecipeNest — Chef Portal (MERN Stack)

A full-stack web application where chefs share recipes and food lovers discover them.
Built with **MongoDB · Express · React · Node.js**.

---

## 📁 Project Structure

```
recipenest/
├── backend/                   # Node.js + Express API
│   ├── models/
│   │   ├── User.js            # User model (Chef / FoodLover / Admin)
│   │   └── Recipe.js          # Recipe model
│   ├── routes/
│   │   ├── authRoutes.js      # Register, Login, /me
│   │   ├── chefRoutes.js      # Chef list, profile, update
│   │   ├── recipeRoutes.js    # Full recipe CRUD + likes
│   │   └── adminRoutes.js     # Admin: stats, user/recipe management
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect + role-based authorize
│   │   └── uploadMiddleware.js# Multer image uploads
│   ├── uploads/               # Uploaded images (auto-created)
│   ├── server.js              # Entry point
│   ├── seed.js                # Seed demo data
│   └── .env                   # Environment variables
│
└── frontend/                  # React SPA
    └── src/
        ├── components/
        │   ├── Navbar.js / .css
        │   ├── Footer.js / .css
        │   ├── RecipeCard.js / .css
        │   ├── ChefCard.js / .css
        │   └── RecipeForm.js / .css  # Reusable create/edit form
        ├── pages/
        │   ├── Home.js / .css
        │   ├── Login.js
        │   ├── Register.js
        │   ├── AuthPages.css
        │   ├── ChefsList.js
        │   ├── ChefProfile.js / .css
        │   ├── RecipeList.js / .css
        │   ├── RecipeDetail.js / .css
        │   ├── ChefDashboard.js       # Recipe CRUD dashboard
        │   ├── EditProfile.js         # Chef profile editor
        │   ├── FoodLoverDashboard.js  # Liked recipes
        │   ├── AdminDashboard.js      # Full admin panel
        │   └── Dashboard.css
        ├── context/
        │   └── AuthContext.js   # Global auth state
        ├── utils/
        │   └── api.js           # Axios + all API calls
        ├── App.js               # Router + route guards
        └── index.css            # Global design tokens + styles
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+ — https://nodejs.org
- **MongoDB** (local) — https://www.mongodb.com/try/download/community
  - OR use **MongoDB Atlas** (free cloud): https://www.mongodb.com/atlas

---

### 1. Clone / Download the project

Place the `recipenest/` folder anywhere on your machine.

---

### 2. Set up the Backend

```bash
cd recipenest/backend
npm install
```

**Configure environment variables** — edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/recipenest
JWT_SECRET=recipenest_super_secret_jwt_key_2024
NODE_ENV=development
```

> If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

**Seed demo data** (creates admin, chefs, food lovers, and recipes):

```bash
npm run seed
```

**Start the backend server:**

```bash
npm run dev        # development (auto-restarts with nodemon)
# OR
npm start          # production
```

Backend runs at: **http://localhost:5000**

---

### 3. Set up the Frontend

```bash
cd recipenest/frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

> The React app proxies API calls to `http://localhost:5000` via the `"proxy"` field in `package.json`.

---

## 🔐 Demo Login Credentials

After running `npm run seed`:

| Role       | Email                       | Password  |
|------------|-----------------------------|-----------|
| Admin      | admin@recipenest.com        | admin123  |
| Chef 1     | gordon@recipenest.com       | chef123   |
| Chef 2     | maria@recipenest.com        | chef123   |
| Chef 3     | kenji@recipenest.com        | chef123   |
| Food Lover | foodlover@recipenest.com    | food123   |

> There are also **quick-login buttons** on the Login page for demo convenience.

---

## 🌟 Features

### Public (no login required)
- Browse all chefs with search
- View chef profiles with recipe portfolios
- Browse all recipes with filters (category, difficulty, sort)
- Search recipes by title, description or tag
- View full recipe detail with ingredients and step-by-step instructions

### Chef Account
- Secure JWT login / registration
- **Dashboard**: view all own recipes in a management table
- **Create Recipe**: full form with image upload, ingredients, step-by-step instructions
- **Edit Recipe**: pre-filled form, update any field
- **Delete Recipe**: with confirmation prompt
- **Edit Profile**: name, bio, specialty, profile photo, social media links
- Sort own recipe portfolio on public profile page

### Food Lover Account
- Register and log in
- **Like / Unlike** any recipe (heart button)
- **My Favourites** dashboard: see all liked recipes, unlike from dashboard
- Social share button on each recipe (Web Share API / clipboard fallback)

### Admin Account
- **Overview tab**: platform stats (users, chefs, recipes), recent activity
- **Users tab**: see all users, activate/deactivate accounts, delete users
- **Recipes tab**: see all recipes, publish/unpublish, delete any recipe

---

## 🛠 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Axios        |
| Styling    | Custom CSS (no framework), Google Fonts |
| Backend    | Node.js, Express 4                      |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (jsonwebtoken), bcryptjs            |
| File Upload| Multer (local disk storage)             |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Description         | Auth     |
|--------|----------------------|---------------------|----------|
| POST   | /api/auth/register   | Register new user   | Public   |
| POST   | /api/auth/login      | Login               | Public   |
| GET    | /api/auth/me         | Get current user    | Private  |

### Chefs
| Method | Endpoint                    | Description           | Auth         |
|--------|-----------------------------|-----------------------|--------------|
| GET    | /api/chefs                  | List all chefs        | Public       |
| GET    | /api/chefs/:id              | Chef profile + recipes| Public       |
| PUT    | /api/chefs/profile/update   | Update own profile    | Chef only    |

### Recipes
| Method | Endpoint                    | Description           | Auth         |
|--------|-----------------------------|-----------------------|--------------|
| GET    | /api/recipes                | List recipes (filters)| Public       |
| GET    | /api/recipes/:id            | Single recipe         | Public       |
| POST   | /api/recipes                | Create recipe         | Chef only    |
| PUT    | /api/recipes/:id            | Update recipe         | Chef/Admin   |
| DELETE | /api/recipes/:id            | Delete recipe         | Chef/Admin   |
| POST   | /api/recipes/:id/like       | Like / unlike         | Private      |
| GET    | /api/recipes/chef/my-recipes| Chef's own recipes    | Chef only    |

### Admin
| Method | Endpoint                        | Description            | Auth       |
|--------|---------------------------------|------------------------|------------|
| GET    | /api/admin/stats                | Platform statistics    | Admin only |
| GET    | /api/admin/users                | All users              | Admin only |
| PUT    | /api/admin/users/:id/toggle     | Activate/deactivate    | Admin only |
| DELETE | /api/admin/users/:id            | Delete user            | Admin only |
| GET    | /api/admin/recipes              | All recipes            | Admin only |
| PUT    | /api/admin/recipes/:id/toggle   | Publish/unpublish      | Admin only |
| DELETE | /api/admin/recipes/:id          | Delete recipe          | Admin only |

---

## 📝 Notes for Submission

- The application is **fully responsive** (mobile, tablet, desktop).
- Images are stored locally in `backend/uploads/` — in production you would use AWS S3 or Cloudinary.
- JWT tokens expire after 30 days.
- Passwords are hashed with bcryptjs (salt rounds: 12).
- The seed script (`npm run seed`) must be run once before first use.

📄 License

This project is built for academic and learning purposes.

👨‍💻 Author

Arun Bhul Software Engineering Student Backend & Full-Stack Enthusiast