# ✅ Real-Time Todo App – GraphQL + React + Docker

This project is a real-time synced task manager application, developed as part of the Corellian Software Technical Assessment. It features:

- 🧠 A GraphQL-powered ASP.NET Core backend
- 💻 A clean and responsive frontend using React + Adobe React Spectrum
- 🐳 Full containerization with Docker Compose

---

## 🚀 How to Run Locally

### ✅ Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [Git](https://git-scm.com/) installed (optional, for cloning)

---

### 🛠️ Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/KhalilMohammad/Todo
   cd Todo
   ```

2. **Start all services using Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. ✅ This will start:

   - **Backend API** → [http://localhost:8080/graphql](http://localhost:8080/graphql)
   - **Frontend (React)** → [http://localhost:5173](http://localhost:5173)

---

## 🧪 Features

### 🔧 Backend (ASP.NET Core + GraphQL)

- `getAllTasks` – Retrieve all tasks (supports filtering and sorting)
- `createTask` – Create a new task
- `updateTaskStatus` – Update task status (e.g., mark as completed)
- `deleteTask` – Delete a task
- ✅ Automatic EF Core database migrations on startup

### 💻 Frontend (React + Adobe React Spectrum)

- Add, update, and delete tasks
- Toggle task completion status
- Priority indicators and due date highlighting
- Responsive UI with accessible design (via Spectrum)

---

## ⚙️ Docker Services

```yaml
- todo-frontend   → React app running on Vite dev server
- todobackend     → ASP.NET Core GraphQL API
- db              → SQL Server 2019 Express instance
```

---

## ✅ Project Breakdown

| Layer     | Stack                                 |
|-----------|----------------------------------------|
| Backend   | ASP.NET Core, HotChocolate, EF Core    |
| Frontend  | Vite + React + Adobe React Spectrum    |
| Database  | SQL Server (Dockerized)                |
| GraphQL   | Queries, Mutations, Projections        |
| DevOps    | Docker + Docker Compose                |

---

## 🤖 AI Tools Used

- **ChatGPT-4 (OpenAI)** – For scaffolding GraphQL schemas, queries, and mutations
- **GitHub Copilot** – For assisting with React UI and component logic
- **Docker AI Suggestions** – For optimizing Docker volumes and multi-service setup

---

## 💡 Reflections on AI Effectiveness

AI tools significantly accelerated my workflow by reducing boilerplate time, suggesting GraphQL best practices, and simplifying layout logic in Adobe React Spectrum. Manual review and polish were still essential to ensure quality, accessibility, and alignment with project goals.