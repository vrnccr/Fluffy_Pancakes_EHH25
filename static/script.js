document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll(".patient-row");

    rows.forEach(row => {
        row.addEventListener("mouseover", function() {
            this.style.transform = "scale(1.02)";
            this.style.transition = "transform 0.3s ease-in-out";
        });

        row.addEventListener("mouseout", function() {
            this.style.transform = "scale(1)";
        });
    });

    // Fade-in alerts
    setTimeout(() => {
        document.querySelectorAll(".alert-box").forEach(alert => {
            alert.style.opacity = "1";
        });
    }, 500);
});


function filterPatients() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let tableRows = document.querySelectorAll("#patientTable tr");

    tableRows.forEach(row => {
        let name = row.cells[0].textContent.toLowerCase();
        if (name.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}


document.addEventListener("DOMContentLoaded", function() {
    // Kidney Function (eGFR) Chart
    new Chart(document.getElementById("eGFRChart"), {
        type: 'line',
        data: {
            labels: ["6 Years Ago", "5 Years Ago", "4 Years Ago", "3 Years Ago", "2 Years Ago", "1 Year Ago"],
            datasets: [{
                label: 'eGFR (mL/min/1.73m²)',
                data: eGFRData,
                borderColor: 'red',
                fill: false
            }]
        }
    });

    // UACR (Proteinuria) Chart
    new Chart(document.getElementById("UACRChart"), {
        type: 'bar',
        data: {
            labels: ["6 Years Ago", "5 Years Ago", "4 Years Ago", "3 Years Ago", "2 Years Ago", "1 Year Ago"],
            datasets: [{
                label: 'UACR (mg/g)',
                data: UACRData,
                backgroundColor: 'red'
            }]
        }
    });

    // Medical Visits Timeline
    new Chart(document.getElementById("visitTimeline"), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Doctor Visits',
                data: visitDates.map((date, index) => ({ x: index, y: 1 })),
                backgroundColor: 'red'
            }]
        },
        options: {
            scales: { x: { type: 'linear' } }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const chatbot = document.getElementById("chatbot-container");
    const chatHeader = document.getElementById("chatbot-header");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    // Get the patient ID from the dataset
    const patientId = document.body.getAttribute("data-patient-id");

    // Show chatbot when clicking header
    chatHeader.addEventListener("click", () => {
        chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
    });

    // Send query to backend
    sendBtn.addEventListener("click", async () => {
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;

        // Display user message
        chatMessages.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
        chatInput.value = "";

        // Fetch response from Flask backend
        const response = await fetch("/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userMessage, patient_id: patientId })
        });

        const data = await response.json();
        chatMessages.innerHTML += `<div><strong>AI:</strong> ${data.response}</div>`;
    });
});
