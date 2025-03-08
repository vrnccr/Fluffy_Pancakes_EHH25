from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
from openai import OpenAI
import chromadb
import requests
import os
from dotenv import load_dotenv  

app = Flask(__name__)

# Initialize ChromaDB for Vector Search
chroma_client = chromadb.PersistentClient(path="chroma_db")

# Load OpenAI API Key securely
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Node.js API URL (ensure your Node.js API is running)
NODE_API_URL = "http://127.0.0.1:5000"

@app.route("/")
def index():
    """ Fetch paginated patients from Node.js API and render them in the UI """
    page = request.args.get("page", 1, type=int)  # Get page from URL
    limit = 50  # Number of patients per page

    try:
        response = requests.get(f"{NODE_API_URL}/patients?page={page}&limit={limit}")
        if response.status_code == 200:
            data = response.json()
            patients = data["patients"]
            current_page = data["currentPage"]
        else:
            patients = []
            current_page = 1
    except Exception as e:
        print(f"Error fetching patients: {e}")
        patients = []
        current_page = 1

    return render_template("index.html", patients=patients, current_page=current_page, limit=limit)


@app.route("/patient/<int:patient_id>")
def patient_detail(patient_id):
    """ Fetch a specific patient's details from the Node.js API """
    try:
        response = requests.get(f"{NODE_API_URL}/patient/{patient_id}")  # Corrected API call
        if response.status_code == 200:
            patient = response.json()
        else:
            return "Patient not found", 404
    except Exception as e:
        print(f"Error fetching patient details: {e}")
        return "Internal Server Error", 500

    return render_template("patient.html", patient=patient)

# Store conversation history per session (or use a database for persistence)
conversation_history = {}

@app.route("/chatbot", methods=["POST"])
def chatbot():
    """ Chatbot endpoint that retrieves patient data and interacts with OpenAI """
    data = request.json
    query = data.get("query")
    patient_id = int(data.get("patient_id"))

    # Fetch patient details from the Node.js API
    try:
        response = requests.get(f"{NODE_API_URL}/patient/{patient_id}")
        if response.status_code != 200:
            return jsonify({"response": "Patient not found."})

        patient = response.json()
    except Exception as e:
        return jsonify({"response": f"Error fetching patient details: {e}"})

    # Format visit dates
    visit_dates_formatted = ', '.join(date.strftime("%Y-%m-%d") for date in patient.get('visit_dates', []))

    # Construct patient context
    context = f"""
        Patient Name: {patient.get('name', 'N/A')}
        Age: {patient.get('age', 'N/A')}
        eGFR Result: {patient.get('eGFR_result', 'N/A')}
        eGFR Trend: {patient.get('eGFR_trend', [])}
        UACR Result: {patient.get('uACR_result', 'N/A')}
        UACR Trend: {patient.get('UACR_trend', [])}
        Medications: {', '.join(patient.get('medications', []))}
        Transplant Status: {patient.get('transplanted_organ', 'None')}
        Visit Dates: {visit_dates_formatted}
    """

    # Maintain conversation history
    if patient_id not in conversation_history:
        conversation_history[patient_id] = [
            {"role": "system", "content": f"You are an AI doctor assistant. Here is the patient's data:\n{context}"}
        ]

    # Append user query
    conversation_history[patient_id].append({"role": "user", "content": query})

    try:
        # Call OpenAI API
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=conversation_history[patient_id],
            temperature=0.7,
            max_tokens=400,  # Increased max_tokens to avoid cutoff
        )

        # Extract assistant response
        assistant_reply = response.choices[0].message.content.strip()
        formatted_reply = assistant_reply.replace("\n", "<br>")

        # Store in conversation history
        conversation_history[patient_id].append({"role": "assistant", "content": assistant_reply})

        return jsonify({"response": formatted_reply})

    except Exception as e:
        return jsonify({"response": f"An error occurred: {str(e)}"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Run Flask on port 5001 to avoid conflict with Node.js
