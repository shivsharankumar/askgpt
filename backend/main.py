
from fastapi import FastAPI, HTTPException, Depends, status, Request
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import time
from dotenv import load_dotenv
load_dotenv()
import os
import sqlite3
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import json

import requests
import base64
import io
import math
from groq import Groq

# Image Processing
from rembg import remove
from PIL import Image
import numpy as np

# Personal Automation
from personal_task.agent import AutomationAgent

# --- Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey") # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DB_NAME = "users.db"

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL
        )
    ''')
    
    # Conversations Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Messages Table (for History)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            conversation_id INTEGER,
            role TEXT,
            content TEXT,
            image TEXT, 
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(conversation_id) REFERENCES conversations(id)
        )
    ''')
    
    # Attempt migration for existing messages table
    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN conversation_id INTEGER REFERENCES conversations(id)")
    except Exception:
        pass # Column likely exists
    
    conn.commit()
    conn.close()

init_db()

# --- Auth Helpers ---
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

def get_password_hash(password):
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to get current user
def get_current_user(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None # Return None if no auth, we can allow guest chat or enforce it
    
    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

# --- Models ---
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
    image: Optional[str] = None
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    model_used: str
    intent: str
    image: Optional[str] = None
    conversation_id: Optional[int] = None


client = Groq()
automation_agent = AutomationAgent()
app = FastAPI(title="AskGPT Backend")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- AI Logic ---

def clean_base64(image_str: str) -> str:
    if "," in image_str:
        return image_str.split(",")[1]
    return image_str

def generate_completion(prompt, model, tokens, image: Optional[str] = None, history: List[dict] = []):
    url = "https://api.euron.one/api/v1/euri/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer euri-e5140be39e9cc1c88bd8091d12e724e4338034ccafb7697d677bc1d1683e9c0a"
    }

    # Construct Messages from History + Current Prompt
    messages = []
    
    # Add System Prompt if needed
    messages.append({"role": "system", "content": "You are a helpful AI assistant."})

    # Add History (last 5 messages for context)
    for msg in history[-10:]: 
        # Convert our DB format/Frontend format to API format
        # If DB format: role="user"/"ai". API expects "user"/"assistant".
        role = "user" if msg['role'] == "user" else "assistant"
        content = msg['content']
        # Note: History images handling is complex. For now passing text history.
        messages.append({"role": role, "content": content})

    # Add Current Message
    if image:
        # Vision Request
        clean_img = clean_base64(image)
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{clean_img}"}}
            ]
        })
    else:
        # Text Request
        messages.append({"role": "user", "content": prompt})

    payload = {
        "messages": messages,
        "model": model,
        "max_tokens": tokens,
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error in generate_completion: {e}")
        return "Sorry, I encountered an error generating the text."


def generate_image(prompt):
    url = "https://api.euron.one/api/v1/euri/images/generations"

    headers = {
        "Authorization": "Bearer euri-e5140be39e9cc1c88bd8091d12e724e4338034ccafb7697d677bc1d1683e9c0a",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gemini-3-pro-image-preview",
        "prompt": prompt,
        "size": "1024x1024",
        "n": 1
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        image_data = data["data"][0]
        
        if "url" in image_data:
            img_response = requests.get(image_data["url"])
            return base64.b64encode(img_response.content).decode('utf-8')
        elif "b64_json" in image_data:
            b64 = image_data["b64_json"]
            padding = len(b64) % 4
            if padding != 0:
                b64 += "=" * (4 - padding)
            return b64
        else:
            raise ValueError("Unknown image response format")
    except Exception as e:
        print(f"Error in generate_image: {e}")
        return None

def process_image_background_removal(image_b64: str) -> str:
    try:
        clean_img = clean_base64(image_b64)
        input_data = base64.b64decode(clean_img)
        output_data = remove(input_data)
        return base64.b64encode(output_data).decode('utf-8')
    except Exception as e:
        print(f"Error removing background: {e}")
        return None

def process_image_change_background(image_b64: str, background_prompt: str) -> str:
    try:
        clean_img = clean_base64(image_b64)
        # 1. Remove Background (Foreground)
        input_data = base64.b64decode(clean_img)
        foreground_bytes = remove(input_data)
        foreground = Image.open(io.BytesIO(foreground_bytes)).convert("RGBA")
        
        # 2. Generate New Background
        bg_b64 = generate_image(background_prompt)
        if not bg_b64:
            return None
        background_bytes = base64.b64decode(bg_b64)
        background = Image.open(io.BytesIO(background_bytes)).convert("RGBA")
        
        # 3. Resize Background to match Foreground
        background = background.resize(foreground.size)
        
        # 4. Composite
        combined = Image.alpha_composite(background, foreground)
        
        # 5. Return Base64
        buffered = io.BytesIO()
        combined.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
        
    except Exception as e:
        print(f"Error changing background: {e}")
        return None

# Intent Classifier
def classify_intent_llm(message: str, image: Optional[str] = None) -> str:
    msg = message.lower()
    
    # Personal Automation Keywords
    if any(phrase in msg for phrase in ["mail to", "send email", "open vs code", "open app", "launch", "open file", "run command"]):
        return "personal_automation"
        
    # Strict Keywords for Background Removal/Change
    if image and any(phrase in msg for phrase in ["remove background", "delete background", "transparent background", "no background", "remove the background"]):
        return "image_manipulation"
    
    # Check for "Change Background" specifically (using history if image is None, handled in route)
    if any(phrase in msg for phrase in ["change background", "replace background", "swap background", "new background", "background of the above image"]):
        return "image_manipulation"
        
    if image:
         return "vision_analysis"

    system_prompt = """
    You are an intent classifier.
    Classify the user query into one of the following:
    - image_generation
    - research_coding
    - casual_chat

    Return ONLY the intent label.
    """
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback
        if any(word in msg for word in ["image", "picture", "draw", "generate"]):
            return "image_generation"
        elif any(word in msg for word in ["code", "python", "script", "function", "debug"]):
            return "research_coding"
        else:
            return "casual_chat"

def route_request(intent: str, message: str, image: Optional[str] = None, history: List[dict] = []) -> tuple[str, str, Optional[str]]:
    if intent == "personal_automation":
        response = automation_agent.execute(message)
        return response, "System Automation", None

    elif intent == "image_generation":
        image_b64 = generate_image(message)
        if image_b64:
             return f"Here is the generated image for: '{message}'", "Google Imagen 3", image_b64
        else:
             return "Sorry, I couldn't generate the image at this time.", "Google Imagen 3", None
             
    elif intent == "image_manipulation":
        # 1. Resolve Image (Current or History)
        target_image = image
        if not target_image:
            # Search history for the last user image
            # History list is [{'role': 'user', 'content': '...', 'image': '...'}, ...]
            # Iterate backwards
            for msg in reversed(history):
                if msg.get('role') == 'user' and msg.get('image'):
                    target_image = msg['image']
                    break
        
        if not target_image:
             return "Please upload an image or ensure there is one in our recent chat history to modify.", "System", None
        
        msg = message.lower()
        
        # 2. Determine Action
        if any(w in msg for w in ["remove", "delete", "transparent", "no background"]):
            processed_image = process_image_background_removal(target_image)
            task_desc = "background removed"
        else:
            # Change/Replace Background
            # Extract prompt? Simple heuristic: use the whole message as prompt for now, 
            # ideally we'd extract "to a city" but the generator is robust enough to ignore "change background".
            # Better: "city street", "space", "forest".
            # Let's clean the prompt slightly.
            clean_prompt = message.replace("change background", "").replace("replace background", "").replace("to a", "").strip()
            processed_image = process_image_change_background(target_image, clean_prompt)
            task_desc = "background changed"

        if processed_image:
            return f"Here is your image with the {task_desc}.", "Image Processor", processed_image
        else:
            return "Failed to process image.", "System", None

    elif intent == "vision_analysis":
        response = generate_completion(message, "gpt-4o", 2000, image, history)
        return response, "GPT-4o Vision", None
        
    elif intent == "research_coding":
        response = generate_completion(message, "gemini-2.5-pro", 5000, None, history)
        return response, "Gemini 2.5 Pro", None
        
    else:
        response = generate_completion(message, "gpt-4.1-nano", 2000, None, history)
        return response, "GPT-4o-mini", None

# --- Endpoints ---

@app.post("/api/register")
async def register(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    cursor.execute("INSERT INTO users (username, hashed_password) VALUES (?, ?)", (user.username, hashed_password))
    conn.commit()
    conn.close()
    return {"message": "User created successfully"}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user['id'] if current_user else None
    conversation_id = request.conversation_id
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Conversation if new
    if user_id and not conversation_id:
        title = request.message[:30] + "..." if len(request.message) > 30 else request.message
        cursor.execute("INSERT INTO conversations (user_id, title) VALUES (?, ?)", (user_id, title))
        conversation_id = cursor.lastrowid
        conn.commit()

    # 1. Fetch History if user is logged in
    history = []
    
    if user_id:
        # Fetch image column as well for this conversation
        # If conversation_id is explicitly passed, fetch history for THAT conversation.
        # If it was just created, history is empty anyway.
        if conversation_id:
            cursor.execute("SELECT role, content, image FROM messages WHERE user_id = ? AND conversation_id = ? ORDER BY id DESC LIMIT 10", (user_id, conversation_id))
        else:
             # Fallback if logic flow is weird, but above covers it.
             cursor.execute("SELECT role, content, image FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT 10", (user_id,))
             
        rows = cursor.fetchall()
        history = [{"role": r["role"], "content": r["content"], "image": r["image"]} for r in rows][::-1]

    # 2. Classify Intent
    intent = classify_intent_llm(request.message, request.image)
    print("category", intent)
    
    # 3. Route to Model
    response_text, model_name, image_data = route_request(intent, request.message, request.image, history)
    
    # 4. Save to DB if user is logged in
    if user_id and conversation_id:
        # Save User Message
        cursor.execute("INSERT INTO messages (user_id, conversation_id, role, content, image) VALUES (?, ?, ?, ?, ?)", 
                       (user_id, conversation_id, 'user', request.message, request.image))
        # Save AI Response
        cursor.execute("INSERT INTO messages (user_id, conversation_id, role, content, image) VALUES (?, ?, ?, ?, ?)", 
                       (user_id, conversation_id, 'ai', response_text, image_data))
        # Update Updated_At
        cursor.execute("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (conversation_id,))
        conn.commit()
    
    conn.close()
    
    return ChatResponse(
        response=response_text,
        model_used=model_name,
        intent=intent,
        image=image_data,
        conversation_id=conversation_id
    )

@app.get("/api/history")
async def get_history(conversation_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    if not current_user:
         raise HTTPException(status_code=401, detail="Not authenticated")
         
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if conversation_id:
        cursor.execute("SELECT id, role, content, image, timestamp FROM messages WHERE user_id = ? AND conversation_id = ? ORDER BY id ASC", (current_user['id'], conversation_id))
    else:
        # If no conversation ID, maybe fetch nothing or the latest one?
        # For now, let's just return empty or recent.
        # But wait, frontend logic: on mount, if no chat selected, usually New Chat.
        # So this might return empty list.
        cursor.execute("SELECT id, role, content, image, timestamp FROM messages WHERE user_id = ? ORDER BY id ASC LIMIT 50", (current_user['id'],)) # Fallback
        
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for r in rows:
        sender = "user" if r['role'] == "user" else "ai"
        messages.append({
            "id": r['id'],
            "text": r['content'],
            "sender": sender,
            "image": r['image'],
            "model": "History"
        })
    return messages

@app.get("/api/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC", (current_user['id'],))
    conversations = cursor.fetchall()
    conn.close()
    return [{"id": c["id"], "title": c["title"], "updated_at": c["updated_at"]} for c in conversations]

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    # Delete messages first
    cursor.execute("DELETE FROM messages WHERE conversation_id = ? AND user_id = ?", (conversation_id, current_user['id']))
    # Delete conversation
    cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, current_user['id']))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.delete("/api/conversations")
async def delete_all_conversations(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE user_id = ?", (current_user['id'],))
    cursor.execute("DELETE FROM conversations WHERE user_id = ?", (current_user['id'],))
    conn.commit()
    conn.close()
    return {"status": "all_deleted"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
