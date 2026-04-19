# 🧠 NeuroNote – A Knowledge Graph Based Second Brain

## 🚀 Overview

NeuroNote is a **knowledge graph-based note-taking application** that helps users not only store notes but also **connect ideas and visualize relationships** between them.

Unlike traditional note apps, NeuroNote focuses on **thinking in networks**, similar to how the human brain organizes information.

---

## 🎯 Problem Statement

Most note-taking apps allow users to store information, but they fail to help users:

* Connect related ideas
* Understand relationships between concepts
* Visualize knowledge structure

This leads to **fragmented learning and poor retention**.

---

## 💡 Solution

NeuroNote solves this by:

* Allowing users to **link notes together**
* Representing notes as **nodes**
* Representing relationships as **edges**
* Visualizing everything in an interactive **graph view**

---

## ✨ Key Features

### 🔐 Authentication

* Secure user login/signup using Firebase
* Protected routes

### 📝 Notes Management

* Create, edit, delete notes
* Persistent storage using Firestore

### 🔗 Linking System (Core Feature)

* Connect notes with each other
* Bidirectional relationship system

### 🌐 Graph Visualization

* Interactive graph using React Flow
* Nodes = Notes
* Edges = Connections

### 🎨 Smart Visual Encoding

* Highlight most connected nodes
* Color-based importance system
* Clean visual hierarchy

### 📊 Insights

* Total notes
* Total connections
* Identify important and isolated nodes

### 🌙 Theme Toggle

* Dark / Light mode
* Persistent user preference

---

## 🏗️ Tech Stack

### Frontend

* React (Functional Components + Hooks)
* Tailwind CSS
* React Router
* Context API

### Backend

* Firebase Authentication
* Firestore Database

### Visualization

* React Flow

---

## 📁 Project Structure

```
/src
  /components
  /pages
  /context
  /services
  /hooks
  /utils
```

---

## 🔐 Security

* Implemented **Firestore security rules**
* Users can only access their own data
* Authentication-based access control

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/w3bxrj/Neuro-Notes
cd neuronote
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Firebase

Create a `.env` file and add:

```env
VITE_API_KEY=your_key
VITE_AUTH_DOMAIN=your_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_bucket
VITE_MESSAGING_SENDER_ID=your_id
VITE_APP_ID=your_app_id
```

### 4. Run the app

```bash
npm run dev
```

---

## 🧠 How It Works

* Each note is stored as a **node**
* Each connection is stored as an **edge**
* Graph is dynamically generated from Firestore data
* Visual encoding highlights important concepts

---

## 🌐 Live Demo

> 

---

## 🧪 Future Improvements

* Tag-based clustering
* AI-based suggestion of related notes
* Graph filtering and advanced search
* Collaboration features

---

## 🧑‍💻 Author

* w3bxrj

---

## 🏁 Final Note

> “NeuroNote is not just a note-taking app — it’s a system for thinking.”

---
