# AskGPT Multimodal AI Platform

A "ChatGPT-like" advanced AI assistant built with React, FastAPI, and generic AI routing. It features intent-based routing to optimal models, multimodal capabilities (Vision, Image Generation), and local PC automation.

![AskGPT Chat Interface](./public/preview_screenshot.png) *Note: Add a screenshot here*

## Features

### 🧠 Intelligent Agentic Routing
- **Text & Code**: Routes complex queries to **GPT-4o / Claude 3.5**.
- **Image Generation**: Detects prompts like "generate an image" and routes to **Google Imagen 3**.
- **Vision Analysis**: Analyzes uploaded images using Vision models.
- **Local Automation**: Can perform PC tasks like sending emails and opening applications.

### 🎨 Multimodal Capabilities
- **Image Upload**: Drag & Drop images for analysis.
- **Background Manipulation**:
  - **Remove Background**: Uses `rembg` to create transparent PNGs.
  - **Change Background**: Intelligent compositing—removes background and generates a new one based on your description (e.g., "Change background to a forest").
  - **Context Aware**: Supports "Change background of the **above image**" references.

### 💬 Chat Management
- **History Tracking**: Full conversation history saved to local SQLite database.
- **Sessions**: Create new chats, delete individual chats, or clear all history.
- **Authentication**: Secure Login/Signup with robust JWT session management.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, Python 3.12.
- **Database**: SQLite (Local file-based).
- **AI/ML**: 
  - `groq` (LLM Inference)
  - `rembg` (Background Removal)
  - `Pillow` (Image Processing)
  - `Google Generative AI` (Image Gen)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `backend` folder:
   ```env
   GROQ_API_KEY=your_groq_key
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SECRET_KEY=your_jwt_secret
   ```

4. Run the Server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Open a new terminal and navigate to the root:
   ```bash
   cd .. # Back to root if in backend
   npm install
   ```

2. Start the Development Server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Personal Automation Usage

To use features like "Send Email" or "Open App", ensure you have configured the `.env` file correctly.
- **Email**: "Send an email to user@example.com saying hello."
- **Apps**: "Open VS Code", "Open Calculator".

## License

MIT
