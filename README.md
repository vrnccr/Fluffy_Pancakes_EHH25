# Fluffy Pancakes - CKD Risk Stratification & Prediction 🚀

## Overview 🏥
Chronic Kidney Disease (CKD) is a progressive and often undiagnosed condition affecting millions worldwide. Late detection leads to costly treatments, emergency dialysis, and reduced quality of life. Our project, **Fluffy Pancakes**, developed during the EHH25 Hackathon, aims to change this.

We built an **automated CKD risk stratification and prediction engine** that helps physicians detect CKD earlier using clinical data. By integrating risk classification, predictive modeling, and a smart alert system, we provide a powerful decision-support tool for nephrologists and general practitioners.

## 🌟 What We Achieved
During the hackathon, our team successfully:
- ✅ **Developed a CKD Risk Engine** that assigns CKD risk categories based on available lab data.
- ✅ **Implemented eGFR & uACR Calculations**, even when missing in input data.
- ✅ **Built a CKD Prediction Model** using historical patient data to predict CKD onset.
- ✅ **Designed an Alert System** to notify physicians when a patient is at risk without overwhelming them with unnecessary notifications.

## 🎯 Problem We Addressed
### Why CKD Matters?
- ⚠️ CKD is often **diagnosed too late**, leading to irreversible damage.
- 🏥 **Scattered clinical data** prevents early detection.
- ⏳ **Delayed diagnosis** increases complications and treatment costs.
- ❤️ **Early intervention** can slow disease progression and improve patient outcomes.

Our solution tackles these problems head-on by automating risk assessment and providing physicians with **actionable insights** before it’s too late.

## 🛠️ Features & Implementation

### 1️⃣ **CKD Risk Stratification Engine**
- Uses patient lab data (eGFR, uACR) to **classify CKD risk**.
- Automatically **calculates missing values** when needed.
- Recommends **additional tests** if necessary (e.g., suggesting uACR for diabetic patients).
- Ensures **transparency** by showing the logic behind risk categorization.

### 2️⃣ **CKD Prediction Model**
- Trained on historical patient data to **predict CKD probability**.
- Identifies key **risk factors** and ensures **explainability** for physicians.
- Generates **clinically relevant risk scores** to assist in decision-making.

### 3️⃣ **Smart Alert System**
- 🚨 **Notifies physicians** when a patient is at risk.
- ⚖️ **Balances urgency with usability** (avoiding alert fatigue).
- 🧠 **Provides contextual recommendations** based on individual patient data.

## 🚀 How to Install & Use (Open Source)

### Prerequisites 📋
Ensure you have the following installed:
- Python 3.8+
- pip
- Virtual environment tool (optional but recommended)

### Installation ⚙️
1. **Clone the repository**
   ```sh
   git clone https://github.com/vrnccr/Fluffy_Pancakes_EHH25.git
   cd Fluffy_Pancakes_EHH25
   ```

2. **Create a virtual environment** (optional but recommended)
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```sh
   pip install -r requirements.txt
   ```

### Running the Project ▶️
1. **Start the application**
   ```sh
   python main.py
   ```

2. **Using the API**
   - The CKD Risk Engine exposes an API endpoint where you can submit patient lab data and receive risk classification.
   - Run API tests using:
     ```sh
     python test_api.py
     ```

### Sample Usage 📊
Submit a patient’s lab results via API:
```json
{
  "serum_creatinine": 1.2,
  "urine_albumin": 50,
  "age": 55,
  "sex": "male",
  "diabetes": true,
  "hypertension": true
}
```

Expected output:
```json
{
  "ckd_risk_category": "High Risk",
  "recommended_tests": ["uACR", "eGFR"],
  "alert": "Immediate nephrologist referral advised"
}
```

## 📈 Future Improvements
- **Enhanced predictive model** with additional patient data.
- **EHR Integration** for seamless deployment in hospitals.
- **User-friendly dashboard** for non-technical medical staff.
- **Multi-language support** to increase accessibility.

## ❤️ Contributors
Our amazing hackathon team who built Fluffy Pancakes:
- Ruslan Tsibirov, Veronika Rybak, Ali Guliyev

## 🏆 Final Words
**Fluffy Pancakes** is more than just a hackathon project. It’s a step towards improving CKD diagnosis, reducing complications, and enhancing patient care. We built an intuitive, explainable, and clinically relevant solution that empowers physicians to make better decisions—**before it's too late.**

🚀 **Join us in the mission to detect CKD early and save lives!**

---
💡 **For contributions, suggestions, or questions, open an issue or contact us!**
