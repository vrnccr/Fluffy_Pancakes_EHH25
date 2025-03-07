document.addEventListener("DOMContentLoaded", function() {
    // Ensure Chart.js is only used if elements exist
    if (document.getElementById("eGFRChart")) {
        new Chart(document.getElementById("eGFRChart"), {
            type: 'line',
            data: {
                labels: ["6 Years Ago", "5 Years Ago", "4 Years Ago", "3 Years Ago", "2 Years Ago", "1 Year Ago"],
                datasets: [{
                    label: 'eGFR (mL/min/1.73m²)',
                    data: eGFRData || [],
                    borderColor: 'red',
                    fill: false
                }]
            }
        });
    }

    if (document.getElementById("UACRChart")) {
        new Chart(document.getElementById("UACRChart"), {
            type: 'bar',
            data: {
                labels: ["6 Years Ago", "5 Years Ago", "4 Years Ago", "3 Years Ago", "2 Years Ago", "1 Year Ago"],
                datasets: [{
                    label: 'UACR (mg/g)',
                    data: UACRData || [],
                    backgroundColor: 'red'
                }]
            }
        });
    }

    if (document.getElementById("visitTimeline")) {
        new Chart(document.getElementById("visitTimeline"), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Doctor Visits',
                    data: (visitDates || []).map((date, index) => ({ x: index, y: 1 })),
                    backgroundColor: 'red'
                }]
            },
            options: {
                scales: { x: { type: 'linear' } }
            }
        });
    }

    // Chatbot functionality
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");

    if (!chatMessages || !chatInput) {
        console.warn("Chat elements not found on this page. Skipping chatbot initialization.");
        return;
    }

    window.sendMessage = function(patientId) {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatMessages.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
        chatInput.value = "";

        // Send to API
        fetch(`/chat/${patientId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        })
        .then(response => response.json())
        .then(data => {
            chatMessages.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    };

    chatInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const patientId = chatInput.getAttribute("data-patient-id"); // Ensure ID is retrieved
            if (patientId) sendMessage(patientId);
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    function filterPatients() {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let rows = document.getElementsByClassName("patient-row");

        for (let row of rows) {
            let name = row.getElementsByTagName("td")[0].innerText.toLowerCase();
            row.style.display = name.includes(input) ? "" : "none";
        }
    }

    document.getElementById("searchInput").addEventListener("keyup", filterPatients);
});

