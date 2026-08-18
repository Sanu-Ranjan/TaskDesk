# TaskDesk

TaskDesk is a task and project manager for teams. You create projects, add tasks, give each task an owner, set its priority and due date, and watch progress on a reports page with charts.

Self Deployed on a vps.

---

## Demo Link

[Live Demo](https://taskdesk.mernlab.com/)

---

## Demo Video

A walkthrough of every main feature:

[Video Link](https://drive.google.com/file/d/1dvpUzCkRBeHn0ZmAaf9Hj-ol5ewsFUiz/view?usp=sharing)

---

## Tech Stack

- **Frontend:** React 19, React Router 7, Bootstrap 5, Bootstrap Icons, Chart.js + react-chartjs-2, native fetch
- **Backend:** Node.js, Express 4, Mongoose 8, JWT (httpOnly cookies), bcrypt
- **Database:** MongoDB, running on my own VPS
- **Infrastructure:** Hostinger VPS (Ubuntu LTS), Nginx, PM2, HTTPS through Let's Encrypt and Certbot
- **CI/CD:** GitHub Actions, deploys automatically on every push to `main`

---

## Main Features

- **Login and signup.** The JWT lives in an httpOnly cookie. Signup, login, logout, and pages that only logged-in users can open.
- **Tasks.** Create, read, update and delete. A task has a project, a team, one or more owners, tags, an estimate in days, a due date, a priority and a status.
- **Task page.** Mark it complete, edit any field, or delete it.
- **Projects screen.** Each project shows its own task table. Filter by owner, tag or status. Sort by priority or date.
- **Projects list.** Create, edit and delete projects.
- **Teams.** Members are real user accounts, not just names. Add or remove them.
- **Team page.** Shows the member list and that team's tasks in a table you can filter and sort.
- **Dashboard.** All your projects and tasks, with a toggle between All Tasks and My Tasks. My Tasks only shows tasks belonging to whoever is logged in.
- **Filters live in the URL.** Every filter, sort and page number is part of the address. So you can share a view or refresh the page and nothing is lost.
- **Reports page with four charts:**
  - Work finished last week (bar)
  - Days of work still pending, per project (bar)
  - Tasks closed by team (pie)
  - Tasks closed by owner (pie)
- **Settings page.** Shows who is logged in, with a logout button.
- **Priority sorting.** Priorities are words, and words sort alphabetically, which is wrong. So an aggregation pipeline gives each priority a number first, then sorts on that.

---

## API Quick Reference

Every endpoint starts with `/api/v1`. Every route needs the auth cookie, except signup and login.

| Method | Endpoint                                            | Description                                                               |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/auth/signup`                                      | Register a new user                                                       |
| POST   | `/auth/login`                                       | Log in, sets the JWT cookie                                               |
| GET    | `/auth/me`                                          | Get the current logged-in user                                            |
| POST   | `/auth/logout`                                      | Clear the auth cookie                                                     |
| GET    | `/tasks`                                            | List tasks (filters: team, owner, tags, project, status, sort; paginated) |
| POST   | `/tasks`                                            | Create a task                                                             |
| GET    | `/tasks/:id`                                        | Get a single task                                                         |
| POST   | `/tasks/:id`                                        | Update a task                                                             |
| DELETE | `/tasks/:id`                                        | Delete a task                                                             |
| GET    | `/projects`                                         | List projects (paginated)                                                 |
| POST   | `/projects`                                         | Create a project                                                          |
| GET    | `/projects/:id`                                     | Get a single project                                                      |
| POST   | `/projects/:id`                                     | Update a project                                                          |
| DELETE | `/projects/:id`                                     | Delete a project                                                          |
| GET    | `/teams`                                            | List teams (members populated)                                            |
| POST   | `/teams`                                            | Create a team                                                             |
| GET    | `/teams/:id`                                        | Get a single team                                                         |
| POST   | `/teams/:id`                                        | Update a team                                                             |
| DELETE | `/teams/:id`                                        | Delete a team                                                             |
| POST   | `/teams/:id/members`                                | Add a member to a team                                                    |
| DELETE | `/teams/:id/members/:userId`                        | Remove a member from a team                                               |
| GET    | `/tags`                                             | List tags                                                                 |
| POST   | `/tags`                                             | Create a tag                                                              |
| GET    | `/users`                                            | List users (for owner and member pickers)                                 |
| GET    | `/report/last-week`                                 | Tasks completed in the last 7 days                                        |
| GET    | `/report/pending`                                   | Total pending days and tasks, plus a per-project breakdown                |
| GET    | `/report/closed-tasks?groupBy=team\|owner\|project` | Closed task counts grouped by the given key                               |

---

## Build Descisions

- **Nothing is hardcoded twice.** API paths, route names, page sizes, task statuses, priorities and sort options all sit in constants files on both the frontend and the backend. Change one of them and you change it in one place.
- **Every database call goes through a `dbTask` helper** that returns `{ data, error }`. So controllers deal with database failures the same way everywhere, instead of a try/catch in every function.
- **Every response goes through shared helpers** (`success`, `failure`, `dbError`, `serverError`). So every endpoint replies in the same `{ success, message, data }` shape.
- **Updates only accept fields I allow.** The controller picks out the fields it knows instead of spreading `req.body`. It also uses `findById` then `.save()`, so the model's pre-save hooks actually run.
- **On the frontend, filters, sorting and pagination live in the URL** through `useSearchParams`. That is what makes any view shareable and safe to refresh.
- **Shared building blocks keep the pages small.** One `AppLayout` (sidebar and top bar) wraps every page, plus a reusable `Modal` and a thin `apiGet` / `apiPost` / `apiDelete` layer.

### Design Decisions

- **The JWT sits in an httpOnly cookie,** so JavaScript can never read the token. The `secure` and `sameSite` flags only switch on when `NODE_ENV=production`, so local development over plain http still works.
- **Frontend and backend share one origin.** The Vite dev proxy and Nginx both forward `/api/v1` to the backend, so there is no CORS to configure in production.

## Known Limitations

- The unique-name index in the database is case-sensitive. The controllers check for duplicates case-insensitively, which covers every path the app uses to insert data.
- Tasks have no free-text description field. It is not part of the data model.
- Reports read live data. Nothing is snapshotted, so you cannot look at history.

---

## Feature Checklist

Every feature, checked against the running app:

[CHECKLIST.md](./CHECKLIST.md)

---

## Contact

For bugs or feature requests, email me at [ranjan.code33@gmail.com](mailto:ranjan.code33@gmail.com)
