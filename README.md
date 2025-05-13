# 🧠 MathBuddy: A Conversational AI Math Tutor

**MathBuddy** is a conversational web-based tutoring system designed to help Class X students learn math interactively using Socratic dialogue. It integrates an LLM (Qwen) hosted on Ollama to provide step-by-step guidance, hints, and real-time feedback.

---

## 🛠 Tech Stack

- **Frontend**: React + Vite + TailwindCSS + ShadCN + MathJax
- **Backend**: Node.js + Express
- **AI Model**: Qwen3 via [Ollama](https://ollama.com/)
- **State Management**: React Query
- **Routing**: React Router
- **UI Enhancements**: Sonner, Toaster, TooltipProvider

---

## 📁 Folder Structure

```
MathBuddy/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── server/
│   └── server.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── index.html
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Ollama installed and running locally
- Qwen3 model pulled using:
  ```bash
  ollama pull qwen3
  ```

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd MathBuddy
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Start Backend

```bash
node server/server.js
```

Ensure Ollama is running on `http://localhost:11434`.

---

### 4. Start Frontend

```bash
npm run dev
```

App will run on `http://localhost:5173`

---

## 🧠 Features

- Step-by-step guided math problem solving
- Interactive student-teacher dialogue
- Real-time math rendering using KaTeX
- Socratic method: hints without revealing answers
- Support for equations, fractions, exponents, and more
- Error handling with student feedback

---

## 🧪 Example Usage

1. Student enters a question like `x - 2 = 0`.
2. Teacher responds with a question: _"What operation will help you isolate x?"_
3. Student replies.
4. Teacher provides feedback and next step.

---

## 💬 Developer Notes

- Backend endpoint for step-by-step guidance:
  ```
  POST /api/solve-step
  ```
  Accepts a JSON body with `history` (student-teacher dialogue) and responds with next teacher prompt.

- Frontend uses `react-query` to manage state and trigger model responses incrementally.

---

## 📃 License

MIT © 2025 [Your Name or Org]
