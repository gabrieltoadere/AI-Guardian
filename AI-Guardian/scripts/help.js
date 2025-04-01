// help.js - Enhanced Chat Logic with OpenAI API

let chatHistory = [];

const chatBox = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");

const OPENAI_API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";



async function autoSuggestFromScan(userId) {
    try {
      const res = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
      const data = await res.json();
  
      if (!data || !data.product_name) return;
  
      const suggestions = [
        `Does "${data.product_name}" contain any of my allergens?`,
        `Is "${data.product_name}" safe for someone allergic to ${data.ingredients.slice(0, 2).join(", ")}?`,
        `What are some alternatives to "${data.product_name}"?`
      ];
  
      const container = document.createElement("div");
      container.classList.add("bot-message");
      container.innerHTML = `<strong>Suggestions:</strong><br>` + suggestions.map(s => `<button class="suggestion-btn">${s}</button>`).join("<br>");
      chatBox.appendChild(container);
  
      chatBox.scrollTop = chatBox.scrollHeight;
  
      document.querySelectorAll(".suggestion-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          userInput.value = btn.textContent;
          sendBtn.click();
        });
      });
    } catch (err) {
      console.error("Auto-suggestion error:", err);
    }
  }

  




sendBtn.addEventListener("click", () => {
  const input = userInput.value.trim();
  if (input) {
    addMessage("user", input);
    userInput.value = "";
    getBotResponse(input);
  }
});

function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `${sender}-message`;
    msg.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  
    // Store in history
    chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text });
  }
  

function showTyping() {
  typingIndicator.style.display = "flex";
}

function hideTyping() {
  typingIndicator.style.display = "none";
}

async function getBotResponse(userText) {
    showTyping();
  
    const params = new URLSearchParams(window.location.search);
const userId = parseInt(params.get("userId")) || 1;

    let userAllergens = [];
    let lastScan = { product_name: "None", ingredients: [] };
  
    if (userText.toLowerCase().includes("recommend")) {
        await recommendSafeProducts(userId);
        return;
      }
      
    try {
      const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
      userAllergens = await prefsRes.json();
  
      const scanRes = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
      lastScan = await scanRes.json();
    } catch (err) {
      console.warn("Could not fetch context from DB:", err);
    }
  
    const prompt = `
  You are an AI that helps users avoid allergens in food products.
  User is allergic to: ${userAllergens.join(", ") || "none"}.
  Last scanned product: ${lastScan.product_name || "none"}.
  Ingredients: ${lastScan.ingredients.join(", ") || "none"}.
  User's question: ${userText}
  `;
  
  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You help users with food safety and allergen analysis." },
      ...chatHistory,
      { role: "user", content: prompt }
    ]
  };
  
  
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      });
  
      const data = await res.json();
      hideTyping();
  
      if (data.choices?.length > 0) {
        addMessage("bot", data.choices[0].message.content.trim());
      } else {
        addMessage("bot", "Sorry, I couldn't understand that.");
      }
    } catch (error) {
      hideTyping();
      addMessage("bot", "Error reaching AI service.");
      console.error("OpenAI Error:", error);
    }
  }

  async function recommendSafeProducts(userId) {
    try {
      const historyRes = await fetch(`http://localhost:5501/api/scan-history/${userId}`);
      const history = await historyRes.json();
  
      const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
      const allergens = await prefsRes.json();
  
      const safeProducts = history.filter(item => {
        const ingredients = item.ingredients || [];
        return !allergens.some(allergen =>
          ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
        );
      });
  
      // Get top 3 most scanned safe products
      const counts = {};
      safeProducts.forEach(item => {
        counts[item.product_name] = (counts[item.product_name] || 0) + 1;
      });
  
      const topSafe = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
  
      if (topSafe.length === 0) {
        addMessage("bot", "You haven’t scanned enough safe foods yet to give a recommendation.");
      } else {
        addMessage("bot", `Based on your scan history, here are safe products you often choose: ${topSafe.join(", ")}.`);
      }
    } catch (err) {
      console.error("ML Recommendation Error:", err);
      addMessage("bot", "Couldn't generate a recommendation due to a server issue.");
    }
  }

  document.getElementById("recommendButton").addEventListener("click", () => {
    recommendSafeProducts(1); // Replace with dynamic user ID later
  });

  autoSuggestFromScan(1);// Replace with real user ID later


  const micButton = document.getElementById("micButton");
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.continuous = false;

  micButton.addEventListener("click", () => {
    micButton.classList.add("listening");
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    micButton.classList.remove("listening");
    sendBtn.click();
  };

  recognition.onerror = () => {
    alert("Sorry, we couldn’t hear you. Try again.");
    micButton.classList.remove("listening");
  };
} else {
  micButton.disabled = true;
  micButton.title = "Voice not supported in this browser";
}

  


  


  

// Optional: Enter key triggers send
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
