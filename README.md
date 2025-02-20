
# Taskly - Task Management Site

Taskly is a task management application that helps users efficiently organize their tasks, manage projects, and collaborate with team members in real-time. It is built with Node.js, Express, and MongoDB, featuring live updates via Socket.io.

## Table of Contents

- [Taskly - Task Management Site](#taskly---task-management-site)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Short Description](#short-description)
  - [Live Links](#live-links)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [Examples](#examples)
  - [Troubleshooting](#troubleshooting)
  - [Contributors](#contributors)

## Introduction

Taskly is designed to simplify task management for individuals and teams by providing a collaborative platform with real-time task updates. Whether you're tracking personal goals or working with a team, Taskly streamlines the process.

## Short Description

Taskly is a full-stack task management application offering real-time task updates, task tracking, and team collaboration features.

## Live Links

- **Live Site:** [https://task-manager-c5ec9.web.app](https://task-manager-c5ec9.web.app)

## Features

- Create, assign, and manage tasks.
- Real-time updates using **Socket.io**.
- RESTful API built with **Express**.
- Database management using **MongoDB**.
- Environment configuration using **dotenv**.
- Cross-Origin Resource Sharing enabled with **CORS**.

## Technologies Used

- **Node.js** – JavaScript runtime environment.
- **Express** – Backend web framework for Node.js.
- **MongoDB** – NoSQL database.
- **Socket.io** – Real-time bidirectional event-based communication.
- **dotenv** – Environment variable management.
- **CORS** – Middleware for Cross-Origin Resource Sharing.

## Dependencies

The following dependencies are required to run this project:

| Package    | Version |
|------------|----------|
| cors       | ^2.8.5   |
| dotenv     | ^16.4.7  |
| express    | ^4.21.2  |
| mongodb    | ^6.13.0  |
| socket.io  | ^4.8.1   |

## Installation

Follow these steps to set up Taskly on your local machine:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/nodeNINJAr/Task-Management-App-server
   cd taskly
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add:

   ```plaintext
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Run the Application:**

   ```bash
   node index.js
   ```

5. **Access the Application:**

   Open your browser and visit:

   ```
   http://localhost:5000
   ```

## Usage

- Open the app in your browser.
- Register or log in (if applicable).
- Create tasks, assign them to team members, and monitor their progress.
- View real-time updates when task statuses are changed.

## Configuration

Ensure your `.env` file is properly configured:

```plaintext
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Adjust `PORT` if needed.

## Examples

Sample API Endpoint to Fetch Tasks:

```javascript
app.get('/tasks', async (req, res) => {
  const tasks = await db.collection('tasks').find({}).toArray();
  res.json(tasks);
});
```

## Troubleshooting

- **Database Connection Issues:** Ensure **MongoDB** is running, and your `MONGO_URI` is correct.
- **Port Conflicts:** If port `3000` is in use, update the `PORT` in the `.env` file.
- **CORS Errors:** Ensure your frontend origin is added to the CORS middleware setup if applicable.

## Contributors

- Mehedi Hasan Ridoy – [GitHub Profile](https://github.com/nodeNINJAr)
