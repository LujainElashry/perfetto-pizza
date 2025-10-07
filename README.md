# 🍕 PERFETTO Pizza

**_Project Description_** : A full-stack **pizza ordering and management application** with a React frontend and Express/MongoDB backend.  
Built for both **customers** and **admins** to manage orders, menus, and users.

---

## 🚀 Features

- 👤 **User Roles**: Customer & Admin
- 🛒 **Customers**:

  - Browse menu
  - Add pizzas to cart
  - Place orders
  - Track orders

- 🛠️ **Admins**:

  - Manage menu items (pizza) - Add ,update and Delete
  - Manage users - See users and Delete users
  - Manage orders - change orders status

- 📸 Image uploads with **Cloudinary**
- 🔑 Authentication & Authorization (JWT + bcrypt)
- 🌍 RESTful API with validation

---

## 🏗️ Tech Stack

**Frontend**:

- React
- React Router
- Axios

**Backend**:

- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- Multer + Cloudinary

---

## 📂 Project Structure

```
PERFETTO-PIZZA/
│── backend/              # Express + MongoDB API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
│── frontend/             # React app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
│── package.json          # Root (scripts to run both projects)
│── .gitignore
│── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/perfetto-pizza.git
cd perfetto-pizza
```

### 2. Install dependencies

#### Backend:

```bash
cd backend
npm install
```

#### Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in both **backend** and **frontend**:

#### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

#### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## ▶️ Running the App

### Run backend only

```bash
npm run server
```

### Run frontend only

```bash
npm run client
```

### Run both (development)

```bash
npm run dev
```

### Run both (production)

```bash
npm start
```
---
**Live Demo**

Full website: https://your-frontend-live-url.com](https://perfetto-pizza-f976hzrjv-lujain-elashrys-projects.vercel.app/
---

## 📌 API Endpoints (Example)

- `POST /api/auth/register` → Register user
- `POST /api/auth/login` → Login
- `GET /api/pizzas` → Get all pizzas
- `POST /api/orders` → Place order

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Added new feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **ISC License**.

---
