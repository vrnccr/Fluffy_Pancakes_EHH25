# Fluffy_Pancakes_EHH25

# 🚀 CKD Risk Stratification Web Application

## 📖 Introduction: Why CKD Care Matters?
Chronic Kidney Disease (CKD) is a **global health crisis**, affecting **over 850 million people worldwide**. Early detection is crucial because:
- CKD is **irreversible** and can **progress silently** without symptoms.
- Late-stage CKD requires **dialysis or transplantation**, causing a **severe impact on patient quality of life**.
- **Early intervention can slow or prevent progression**, reducing the burden on **hospitals and healthcare systems**.

### **Our Mission**
This project aims to **enhance CKD management** by integrating **real-time patient monitoring, AI-powered risk assessment, and smart alerting** into hospital workflows.

---

## **🛠️ Features & Achievements**
### **1️⃣ Fully Integrated with Hospital Databases**
✅ **Real-time patient updates** ensure **data consistency**.  
✅ Supports **eGFR, UACR, transplantation history, and risk factors**.

### **2️⃣ Smart Risk-Based Alerting**
🚨 **Flags patients tested within the last 24 hours** with critical eGFR/UACR values.  
🟠 **Prioritizes high-risk patients** while preventing **alert fatigue**.  
📩 **Clinicians can acknowledge and track patients**, preventing redundant alerts.

### **3️⃣ Interactive Patient List**
📋 **Dynamic list with filtering & sorting** based on CKD risk.  
👁️ **Click to view full patient details, graphs, and history**.

### **4️⃣ Advanced Data Visualization**
📊 **Trend graphs of eGFR & UACR** to detect disease progression.  
📍 **Transplant history & clinical background included** for better decision-making.

### **5️⃣ AI-Powered Chatbot**
💬 Provides **support for clinicians & non-specialists**, explaining risk levels.  
📖 Helps **general practitioners manage CKD patients** even without nephrology expertise.

---

## **🔬 Technical Implementation**
### **Tech Stack**
- **Frontend**: React + Vite.js
- **Backend**: Python (FastAPI, Flask)
- **Database**: PostgreSQL / MySQL (integrated with hospital DB)
- **Machine Learning**: XGBoost & Time-Series Forecasting for CKD risk prediction

### **Risk Stratification Model**
| eGFR & UACR Levels | Risk Level | Action |
|---------------------|-----------|--------|
| eGFR < 30, UACR > 300 | 🔴 **Critical** | Immediate Attention |
| eGFR 30-59, UACR 150-300 | 🟠 **High Risk** | Close Monitoring |
| eGFR 60-89, UACR 30-150 | 🟡 **Moderate Risk** | Regular Follow-up |
| eGFR > 90 | 🟢 **Low Risk** | No Immediate Concern |

---

## **📥 Installation Guide**
### **1️⃣ Clone the Repository**
git clone https://github.com/your-repo-name.git
cd your-repo-name

## **2️⃣ Create a Virtual Environment**
python3 -m venv .venv
source .venv/bin/activate  # For Mac/Linux
.venv\Scripts\activate     # For Windows

## **3️⃣ Install Required Packages**
# Install all dependencies from requirements.txt
pip install -r requirements.txt

## **4️⃣ Install Additional Dependencies**
pip install numpy pandas scikit-learn fastapi uvicorn






