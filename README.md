# 🧠 NeuroNote – AI-Powered Knowledge Graph Second Brain

## 🚀 Overview

NeuroNote is an **AI-powered knowledge graph-based note-taking system** that enables users to not only store notes but also **connect, visualize, and transform knowledge intelligently**.

Unlike traditional note apps, NeuroNote focuses on **thinking in networks**, enhanced with **Markdown support and AI-driven document processing**.

---

## 🎯 Problem Statement

Most note-taking apps allow users to store information, but they fail to help users:

* Connect related ideas
* Understand relationships between concepts
* Visualize knowledge structure
* Convert unstructured content into usable notes

This leads to **fragmented learning and poor knowledge organization**.

---

## 💡 Solution

NeuroNote solves this by:

* Representing notes as **nodes**
* Representing relationships as **edges**
* Visualizing knowledge as an interactive **graph**
* Enabling **Markdown-based structured note writing**
* Using **AI to convert documents into clean notes**

---

## ✨ Key Features

### 🔐 Authentication

* Secure login/signup using Firebase
* Protected user-specific data

---

### 📝 Markdown Notes System

* Write notes using Markdown syntax

  * `# Heading`
  * `- Lists`
  * `**Bold text**`
* Live preview using Markdown renderer
* Structured and readable notes

---

### 📂 File Support

#### 📄 Markdown Import

* Upload `.md` files
* Automatically populate note content

#### 📑 Document Upload (PDF/DOCX)

* Extract text from files
* Convert into structured notes

---

### 🤖 AI-Powered Features

#### 🧠 AI Summary

* Generate concise summaries of notes
* Dynamic regeneration on content change

#### 🔄 Document → Markdown Conversion

* Convert raw PDF/DOCX text into clean Markdown
* Automatically structure headings, lists, and content

---

### 🔗 Linking System (Core Feature)

* Connect notes with each other
* Bidirectional relationships
* Build a knowledge network

---

### 🌐 Graph Visualization

* Interactive graph using React Flow
* Nodes = Notes
* Edges = Connections
* Zoom, pan, and explore knowledge

---

### 🎨 Smart Visual Encoding

* Highlight most connected nodes
* Visual importance hierarchy
* Clean and intuitive UI

---

### 📊 Insights

* Total notes
* Total connections
* Identify important and isolated nodes

---

### ⚙️ Settings Control Panel

* Graph controls (layout reset, visualization toggles)
* AI feature toggles
* Data management (clear notes, reset graph)

---

### 🌙 Theme System

* Dark / Light mode
* Persistent preference

---

## 🏗️ Tech Stack

### Frontend

* React (Hooks + Functional Components)
* Tailwind CSS
* React Router
* Context API

### Backend

* Firebase Authentication
* Firestore Database

### Visualization

* React Flow

### AI & Processing

* OpenAI / Gemini API (for summarization & conversion)
* pdfjs (PDF parsing)
* mammoth (DOCX parsing)

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

* Firestore security rules implemented
* Users can only access their own data
* Environment variables used for API keys

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/w3bxrj/Neuro-Notes
cd neuronote
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create a `.env` file:

```env
VITE_API_KEY=your_key
VITE_AUTH_DOMAIN=your_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_bucket
VITE_MESSAGING_SENDER_ID=your_id
VITE_APP_ID=your_app_id

# Optional AI
VITE_OPENAI_API_KEY=your_key
```

---

### 4. Run the app

```bash
npm run dev
```

---

## 🧠 How It Works

* Notes are stored as **Markdown content**
* Graph is generated using **note relationships**
* AI enhances notes by:

  * Generating summaries
  * Converting documents into structured Markdown
* Users interact with knowledge as a **connected system**

---

## 🌐 Live Demo

👉 https://neuro-notes-teal.vercel.app/

---

## 🧪 Future Improvements

* AI-based smart linking suggestions
* Graph clustering & filtering
* Collaborative editing
* Offline mode
* Advanced search

---

## 🧑‍💻 Author

* w3bxrj

---

## 🏁 Final Note

> “NeuroNote is not just a note-taking app — it’s an intelligent system for thinking, connecting, and transforming knowledge.”
