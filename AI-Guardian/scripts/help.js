// help.js - Enhanced Chat Logic with OpenAI API

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const OPENAI_API_KEY = "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"; // <-- Replace with your key
const API_URL = "https://api.openai.com/v1/chat/completions";

sendBtn.addEventListener("click", () => {
  const input = userInput.value.trim();
  if (input) {
    addMessage("user", input);
    userInput.value = "";
    getBotResponse(input);
  }
});

function addMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator() {
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.id = "typing-indicator";
  typing.textContent = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

async function getBotResponse(userText) {
  addTypingIndicator();

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that answers questions about food products and allergens." },
      { role: "user", content: userText }
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
    removeTypingIndicator();

    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content.trim();
      addMessage("bot", reply);
    } else {
      addMessage("bot", "Sorry, I couldn't understand that. Try again.");
    }
  } catch (error) {
    removeTypingIndicator();
    addMessage("bot", "Error reaching AI service.");
    console.error("OpenAI Error:", error);
  }
}

// Optional: Enter key triggers send
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
