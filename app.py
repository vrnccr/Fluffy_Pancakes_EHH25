from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import openai
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
    patient = {}  # 🔹 Ensure `patient` is always defined

    try:
        response = requests.get(f"{NODE_API_URL}/patient/{patient_id}")

        if response.status_code == 200:
            patient = response.json()

        else:
            return "Patient not found", 404

    except Exception as e:
        print(f"Error fetching patient details: {e}")
        return "Internal Server Error", 500

    return render_template("patient.html", patient=patient)

# Load OpenAI API Key securely
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Store conversation history per session (basic memory)
conversation_history = {}

@app.route("/chatbot", methods=["POST"])
def chatbot():
    """ Chatbot that provides insights based on patient data. """
    data = request.json
    print(data)
    query = data.get("query")
    patient_id = data.get("patient_id")
    eGFR_results = data.get("eGFR_results", [])
    uACR_results = data.get("uACR_results", [])
    recommendations = data.get("recommendations", [])

    if not query:
        return jsonify({"response": "Please provide a message."})

    # ✅ Build patient-specific prompt
    prompt = f"""
    Patient ID: {patient_id}
    eGFR History:
    {eGFR_results}

    UACR History:
    {uACR_results}

    Recommendations:
    {recommendations}

    Question: {query}
    Answer:
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7,
            max_tokens=400
        )

        assistant_reply = response.choices[0].message.content.strip()
        return jsonify({"response": assistant_reply})

    except Exception as e:
        return jsonify({"response": f"An error occurred: {str(e)}"})


if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Run Flask on port 5001 to avoid conflict with Node.js