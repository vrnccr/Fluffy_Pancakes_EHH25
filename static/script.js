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
        chatMessages.innerHTML += `<div style="white-space: pre-line; margin-bottom: 10px;"><strong>You:</strong> ${userMessage}</div>`;
        chatInput.value = "";

        // Fetch response from Flask backend
        const response = await fetch("/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userMessage, patient_id: patientId })
        });

        const data = await response.json();

        // Display AI response with formatting
        chatMessages.innerHTML += `<div style="white-space: pre-line; margin-bottom: 10px;"><strong>AI:</strong> ${data.response}</div>`;

        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});



function toggleChatbot() {
    var chatbot = document.getElementById("chatbot-container");
    var toggleBtn = document.getElementById("chatbot-toggle");

    if (chatbot.style.display === "none" || chatbot.style.opacity === "0") {
        chatbot.style.display = "flex";
        setTimeout(() => {
            chatbot.style.opacity = "1";
            chatbot.style.transform = "translateY(0)";
        }, 10); // Smooth animation
        toggleBtn.style.display = "none"; // Hide button when chatbot is open
    } else {
        chatbot.style.opacity = "0";
        chatbot.style.transform = "translateY(20px)";
        setTimeout(() => {
            chatbot.style.display = "none"; // Hide after animation
        }, 300);
        toggleBtn.style.display = "block"; // Show button when chatbot is closed
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const paginationButtons = document.querySelectorAll(".pagination a");

    paginationButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const url = this.getAttribute("href");

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    document.body.innerHTML = html;
                    history.pushState(null, "", url);

                    // ✅ Re-run alert visibility check after updating content
                    checkAndHideAlerts();
                    setupPagination();
                })
                .catch(error => console.error("Pagination Error:", error));
        });
    });
});

// ✅ Function to check and hide alerts on non-first pages
function checkAndHideAlerts() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get("page") ? parseInt(urlParams.get("page")) : 1;

    console.log("📄 Current Page:", currentPage);

    const alertsSection = document.getElementById("alertsSection");

    if (currentPage !== 1 && alertsSection) {
        console.log("⏳ Hiding alerts section (not on page 1)");
        alertsSection.style.display = "none";
    } else if (alertsSection) {
        alertsSection.style.display = "block"; // Ensure alerts show on page 1
    }
}

// ✅ Function to reinitialize pagination event listeners after page change
function setupPagination() {
    const paginationButtons = document.querySelectorAll(".pagination a");

    paginationButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const url = this.getAttribute("href");

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    document.body.innerHTML = html;
                    history.pushState(null, "", url);

                    // ✅ Re-run functions after pagination update
                    checkAndHideAlerts();
                    setupPagination();
                })
                .catch(error => console.error("Pagination Error:", error));
        });
    });
}

// ✅ Initial check when the page first loads
checkAndHideAlerts();
setupPagination();


document.addEventListener("DOMContentLoaded", () => {
    fetchAlerts();  // ✅ Fetch alerts when the homepage loads
});