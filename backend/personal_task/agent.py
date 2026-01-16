
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import subprocess
import shlex
import re
from openai import OpenAI
from groq import Groq

# Configuration (ideally from env)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

class AutomationAgent:
    def __init__(self):
        self.client = Groq()

    def parse_command(self, user_command: str) -> dict:
        """
        Uses LLM to parse natural language into structured command.
        """
        system_prompt = """
        You are an intelligent automation parser. 
        Extract the INTENT and PARAMETERS from the user's request.
        
        Intents:
        1. SEND_EMAIL
           - Params: to_email, subject (infer if missing), body (infer if missing)
        2. OPEN_APP
           - Params: app_name (e.g. 'code', 'chrome', 'firefox')
        3. OPEN_FILE
           - Params: file_path, app_name (optional)
        
        Output JSON ONLY.
        Example: { "intent": "SEND_EMAIL", "params": { "to_email": "hr@xyz.com", "subject": "Hello", "body": "Hi there" } }
        Example: { "intent": "OPEN_APP", "params": { "app_name": "code" } }
        """
        
        try:
            response = self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_command}
                ],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            import json
            return json.loads(content)
        except Exception as e:
            print(f"Error parsing command: {e}")
            return {"intent": "UNKNOWN", "error": str(e)}

    def execute(self, user_command: str) -> str:
        parsed = self.parse_command(user_command)
        intent = parsed.get("intent")
        params = parsed.get("params", {})
        
        if intent == "SEND_EMAIL":
            return self.send_email(
                params.get("to_email"),
                params.get("subject", "No Subject"),
                params.get("body", "")
            )
        elif intent == "OPEN_APP":
            return self.open_app(params.get("app_name"))
        elif intent == "OPEN_FILE":
            return self.open_file(params.get("file_path"), params.get("app_name"))
        else:
            return "Sorry, I couldn't understand the automation verification."

    def send_email(self, to_email, subject, body):
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            return "Error: SMTP credentials not configured in backend/.env"

        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_EMAIL
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(SMTP_EMAIL, to_email, text)
            server.quit()
            return f"Email sent successfully to {to_email}."
        except Exception as e:
            return f"Failed to send email: {str(e)}"

    def open_app(self, app_name):
        # Map friendly names to actual commands
        app_map = {
            "vs code": "code",
            "vscode": "code",
            "chrome": "google-chrome",
            "calculator": "gnome-calculator"
        }
        cmd = app_map.get(app_name.lower(), app_name)
        
        try:
            subprocess.Popen([cmd])
            return f"Opened {app_name}."
        except Exception as e:
            return f"Failed to open {app_name}: {str(e)}"

    def open_file(self, file_path, app_name=None):
        try:
            if app_name:
                subprocess.Popen([app_name, file_path])
                return f"Opened {file_path} with {app_name}."
            else:
                # Default open (xdg-open on Linux)
                subprocess.Popen(['xdg-open', file_path])
                return f"Opened {file_path}."
        except Exception as e:
            return f"Failed to open file: {str(e)}"
