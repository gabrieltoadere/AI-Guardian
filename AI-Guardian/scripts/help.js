// // help.js - Enhanced Chat Logic with OpenAI API

// let chatHistory = [];

// const chatBox = document.getElementById("chatMessages");
// const userInput = document.getElementById("userInput");
// const sendBtn = document.getElementById("sendButton");
// const typingIndicator = document.getElementById("typingIndicator");

// const OPENAI_API_KEY = "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";
// const API_URL = "https://api.openai.com/v1/chat/completions";

// const params = new URLSearchParams(window.location.search);
// const userId = parseInt(params.get("userId")) || 1;

// async function autoSuggestFromScan(userId) {
//   try {
//     const res = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
//     const data = await res.json();

//     if (!data || !data.product_name) return;

//     const suggestions = [
//       `Does "${data.product_name}" contain any of my allergens?`,
//       `Is "${data.product_name}" safe for someone allergic to ${data.ingredients.slice(0, 2).join(", " )}?`,
//       `What are some alternatives to "${data.product_name}"?`
//     ];

//     const container = document.createElement("div");
//     container.classList.add("bot-message");
//     container.innerHTML = `<strong>Suggestions:</strong><br>` + suggestions.map(s => `<button class="suggestion-btn">${s}</button>`).join("<br>");
//     chatBox.appendChild(container);

//     chatBox.scrollTop = chatBox.scrollHeight;

//     document.querySelectorAll(".suggestion-btn").forEach(btn => {
//       btn.addEventListener("click", () => {
//         userInput.value = btn.textContent;
//         sendBtn.click();
//       });
//     });
//   } catch (err) {
//     console.error("Auto-suggestion error:", err);
//   }
// }

// sendBtn.addEventListener("click", () => {
//   const input = userInput.value.trim();
//   if (input) {
//     addMessage("user", input);
//     userInput.value = "";
//     getBotResponse(input);
//   }
// });

// function addMessage(sender, text) {
//   const msg = document.createElement("div");
//   msg.className = `${sender}-message`;
//   msg.innerHTML = `<p>${text}</p>`;
//   chatBox.appendChild(msg);
//   chatBox.scrollTop = chatBox.scrollHeight;

//   chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text });
// }

// function showTyping() {
//   typingIndicator.style.display = "flex";
// }

// function hideTyping() {
//   typingIndicator.style.display = "none";
// }

// let cooldown = false;

// async function getBotResponse(userText) {
//   if (cooldown) {
//     addMessage("bot", "Please wait a moment before asking another question.");
//     return;
//   }

//   cooldown = true;
//   sendBtn.disabled = true;
//   userInput.disabled = true;
//   showTyping();

//   // Reset cooldown in 3 seconds
//   setTimeout(() => {
//     cooldown = false;
//     sendBtn.disabled = false;
//     userInput.disabled = false;
//   }, 3000);

//   let userAllergens = [];
//   let lastScan = { product_name: "None", ingredients: [] };

//   if (userText.toLowerCase().includes("recommend")) {
//     await recommendSafeProducts(userId);
//     hideTyping();
//     return;
//   }

//   try {
//     const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
//     userAllergens = await prefsRes.json();

//     const scanRes = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
//     lastScan = await scanRes.json();
//   } catch (err) {
//     console.warn("Could not fetch context from DB:", err);
//   }

//   const prompt = `
// You are an AI that helps users avoid allergens in food products.
// User is allergic to: ${userAllergens.join(", ") || "none"}.
// Last scanned product: ${lastScan.product_name || "none"}.
// Ingredients: ${Array.isArray(lastScan.ingredients) ? lastScan.ingredients.join(", ") : lastScan.ingredients || "none"}.
// User's question: ${userText}
// `;

//   const payload = {
//     model: "gpt-3.5-turbo",
//     messages: [
//       { role: "system", content: "You help users with food safety and allergen analysis." },
//       ...chatHistory,
//       { role: "user", content: prompt }
//     ]
//   };

//   try {
//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENAI_API_KEY}`
//       },
//       body: JSON.stringify(payload)
//     });

//     hideTyping();
//     sendBtn.disabled = false;
//     userInput.disabled = false;

//     if (res.status === 429) {
//       addMessage("bot", "⚠️ Too many requests. Please wait a bit before trying again.");
//       return;
//     }

//     const data = await res.json();

//     if (data.choices?.length > 0) {
//       addMessage("bot", data.choices[0].message.content.trim());
//     } else {
//       addMessage("bot", "Sorry, I couldn't understand that.");
//     }
//   } catch (error) {
//     hideTyping();
//     sendBtn.disabled = false;
//     userInput.disabled = false;
//     addMessage("bot", "Error reaching AI service.");
//     console.error("OpenAI Error:", error);
//   }
// }

// async function recommendSafeProducts(userId) {
//   try {
//     const historyRes = await fetch(`http://localhost:5501/api/scan-history/${userId}`);
//     const history = await historyRes.json();

//     const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
//     const allergens = await prefsRes.json();

//     const safeProducts = history.filter(item => {
//       const ingredients = item.ingredients || [];
//       return !allergens.some(allergen =>
//         ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
//       );
//     });

//     const counts = {};
//     safeProducts.forEach(item => {
//       counts[item.product_name] = (counts[item.product_name] || 0) + 1;
//     });

//     const topSafe = Object.entries(counts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 3)
//       .map(entry => entry[0]);

//     if (topSafe.length === 0) {
//       addMessage("bot", "You haven’t scanned enough safe foods yet to give a recommendation.");
//     } else {
//       addMessage("bot", `Based on your scan history, here are safe products you often choose: ${topSafe.join(", ")}.`);
//     }
//   } catch (err) {
//     console.error("ML Recommendation Error:", err);
//     addMessage("bot", "Couldn't generate a recommendation due to a server issue.");
//   }
// }

// document.getElementById("recommendButton").addEventListener("click", () => {
//   recommendSafeProducts(userId);
// });

// autoSuggestFromScan(userId);

// const micButton = document.getElementById("micButton");
// const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
//   ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
//   : null;

// if (recognition) {
//   recognition.lang = "en-US";
//   recognition.continuous = false;

//   micButton.addEventListener("click", () => {
//     micButton.classList.add("listening");
//     recognition.start();
//   });

//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     userInput.value = transcript;
//     micButton.classList.remove("listening");
//     sendBtn.click();
//   };

//   recognition.onerror = () => {
//     alert("Sorry, we couldn’t hear you. Try again.");
//     micButton.classList.remove("listening");
//   };
// } else {
//   micButton.disabled = true;
//   micButton.title = "Voice not supported in this browser";
// }

// userInput.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") sendBtn.click();
// });



let chatHistory = [];

// Import axios (make sure axios is installed if running via Node.js)
const axios = window.axios;

// Azure OpenAI Setup
const endpoint = "https://ai-chatbott.openai.azure.com/"; // NO trailing slash
const apiKey = "RYXzx2E4wR6NOIbNIlk9rCZfQCKAjxTlShDpMDEhIxWtEQNMqGBXJQQJ99BDACYeBjFXJ3w3AAABACOGykDJ";
const deploymentName = "chatbot"; // e.g. 'gpt-35-turbo'
const apiVersion = "2023-12-01-preview"; // or newer if available




async function getTopSafeProducts(userId) {
  try {
    const historyRes = await fetch(`http://localhost:5501/api/scanHistory/${userId}`);
    const history = await historyRes.json();

    const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
    const allergens = await prefsRes.json();

    const safeProducts = history.filter(item => {
      const ingredients = item.ingredients || [];
      return !allergens.some(allergen =>
        ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
      );
    });

    const counts = {};
    safeProducts.forEach(item => {
      counts[item.product_name] = (counts[item.product_name] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]); // product names only
  } catch (err) {
    console.error("Top product fetch error:", err);
    return [];
  }
}

document.getElementById("recommendButton").addEventListener("click", () => {
  recommendSafeProducts(userId);
});



async function recommendSafeProducts(userId) {
  try {
    const topSafe = await getTopSafeProducts(userId);

    if (topSafe.length === 0) {
      addMessage("bot", "You haven’t scanned enough safe foods yet to give a recommendation.");
      return;
    }

// Fetch user's real allergens
const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
const allergens = await prefsRes.json(); // comes back as an array

// Build system prompt with real data
const systemPrompt = `
You are Grocery Guardian, a smart allergen-aware assistant.

The user is allergic to: ${allergens.join(", ") || "none"}

Your job:
- Filter unsafe ingredients
- Recommend suitable products
- Explain clearly and kindly

If the user asks if something is safe, always double check ingredients.
If recommending, avoid allergens.
`;


    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "What do you recommend I try next?" }
      ],
      temperature: 0.7,
      max_tokens: 400
    };

    const res = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.choices?.length > 0) {
      addMessage("bot", data.choices[0].message.content.trim());
    } else {
      addMessage("bot", "I found some safe products, but couldn't generate a recommendation.");
    }
  } catch (err) {
    console.error("Azure AI Recommendation Error:", err);
    addMessage("bot", "Sorry, I couldn't generate a recommendation right now.");
  }
}





async function getAzureReply(userInput) {
  
  const url = `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey
  };


  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });


//this give the ai context as to what the app is about
  const systemPrompt = `
You are Grocery Guardian, a smart and safety-conscious grocery assistant.

Your job is to:
- Help users find food that fits their dietary preferences.
- Warn them if a product contains allergens they want to avoid.
- Explain things clearly in a natural, helpful tone.

User preferences:
• Allergies: peanuts, gluten
• Diet: vegetarian

Example conversations:
User: Can you suggest a peanut-free snack?
Assistant: Sure! Hippeas Organic Chickpea Puffs are nut-free and gluten-free.

User: Can I eat this cereal if I’m avoiding dairy?
Assistant: Let me check the ingredients... no milk or lactose, so it should be safe for you!

Always prioritize safety and personalize answers based on the user's preferences.
`;

const body = {
  messages: [
    { role: "system", content: systemPrompt },
    ...chatHistory.slice(-5), // include up to last 5 exchanges
    { role: "user", content: userInput }
  ],
  temperature: 0.7,
  max_tokens: 500
};


  

  try {
    const response = await axios.post(url, body, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Azure OpenAI Error:", error);
    return "Sorry, I couldn't respond at the moment.";
  }


  if (userText.toLowerCase().includes("ingredients")) {
    const analysis = await analyzeIngredients(userId);
    return analysis;
  }
  
}



// Hook into the chat form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userText = input.value.trim();
    if (!userText) return;
    
    
    chatBox.innerHTML += `
  <div class="user-message bg-blue-100 rounded-lg p-3 shadow text-sm self-end max-w-[70%] ml-auto">
    🧑 ${userText}
  </div>`;


    input.value = '';
    chatHistory.push({ role: "user", content: userText });

    const botReply = await getAzureReply(userText);
    chatBox.innerHTML += `
  <div class="bot-message bg-gray-200 rounded-lg p-3 shadow text-sm self-start max-w-[70%]">
    🤖 ${botReply}
  </div>`;


    chatBox.scrollTop = chatBox.scrollHeight;
    chatHistory.push({ role: "assistant", content: botReply });

  });
});



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
    input.value = transcript;
    micButton.classList.remove("listening");
    sendBtn.click();
  };

  recognition.onerror = () => {
    alert("Voice recognition failed. Please try again.");
    micButton.classList.remove("listening");
  };
} else {
  micButton.disabled = true;
  micButton.title = "Voice not supported in this browser";
}




async function analyzeIngredients(userId) {
  try {
    // Get user allergens
    const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
    const allergens = await prefsRes.json();

    // Get latest scanned product
    const scanRes = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
    const lastScan = await scanRes.json();
    const ingredients = Array.isArray(lastScan.ingredients) ? lastScan.ingredients.join(", ") : lastScan.ingredients;

    const systemPrompt = `
You are an allergen expert. A user has scanned a food product.
Their allergies are: ${allergens.join(", ") || "none"}.

Your task:
- Analyze the ingredient list below
- Warn if any ingredients may contain or be related to the user's allergens
- Be cautious and prioritize safety

Example:
Allergen: peanuts
Ingredients: sugar, milk, peanut oil
→ Response: This product may be unsafe due to peanut oil.

Now analyze:
${ingredients}
`;

    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Are there any allergen risks here?" }
      ],
      temperature: 0.7,
      max_tokens: 400
    };

    const res = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "I couldn't analyze the ingredients.";
  } catch (err) {
    console.error("Ingredient NLP Error:", err);
    return "Sorry, I couldn’t analyze the ingredients right now.";
  }
}
