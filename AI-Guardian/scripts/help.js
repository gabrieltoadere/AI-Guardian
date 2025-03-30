let conversationHistory = [];

const products = [
    { name: "Alpro Soya Milk", tags: ["contains-nuts", "egg-free", "low-sugar", "nut-free"] },
    { name: "Glenisk Organic Greek Yogurt", tags: ["gluten-free", "nut-free", "vegetarian"] },
    { name: "BFree Brown Seeded Loaf", tags: ["vegan", "gluten-free", "nut-free"] },
    { name: "O'Donnells Mature Cheese & Red Onion Crisps", tags: ["gluten-free", "egg-free"] },
    { name: "Ballygowan Still Water", tags: ["vegetarian", "low-sugar", "gluten-free"] },
    { name: "SuperValu Free From Chocolate Chip Cookies", tags: ["vegan", "organic", "egg-free", "nut-free"] },
    { name: "Flahavan’s Organic Porridge Oats", tags: ["organic", "nut-free", "egg-free", "gluten-free"] },
    { name: "Lindt 90% Cocoa Chocolate", tags: ["gluten-free", "contains-nuts", "low-sugar"] },
    { name: "Tesco Plant Chef Vegan Burgers", tags: ["egg-free", "low-sugar", "vegan"] },
    { name: "Avonmore Full Fat Milk", tags: ["egg-free", "contains-nuts", "dairy-free"] },
    { name: "Tesco Free From Egg Pasta", tags: ["organic", "egg-free", "dairy-free", "vegetarian"] },
    { name: "Kerrygold Butter", tags: ["dairy-free", "gluten-free", "nut-free", "low-sugar"] },
    { name: "Carroll’s Roast Chicken Slices", tags: ["vegan", "egg-free"] },
    { name: "Heinz Baked Beans", tags: ["egg-free", "low-sugar", "dairy-free"] },
    { name: "Lindt Hazelnut Chocolate", tags: ["gluten-free", "nut-free", "low-sugar"] },
    { name: "Oatly Barista Edition", tags: ["dairy-free", "low-sugar", "gluten-free"] },
    { name: "SuperValu Organic Carrots", tags: ["vegetarian", "gluten-free", "low-sugar", "organic"] },
    { name: "Glenisk Kids Yogurt Tubes", tags: ["dairy-free", "vegan", "organic"] },
    { name: "Fulfil Protein Bar", tags: ["gluten-free", "contains-nuts", "egg-free"] },
    { name: "McCambridge Gluten Free Brown Bread", tags: ["nut-free", "egg-free", "gluten-free", "vegetarian"] },
    { name: "Aldi Vegan Sausages", tags: ["egg-free", "vegan", "low-sugar", "nut-free"] },
    { name: "Denny Traditional Rashers", tags: ["vegetarian", "egg-free", "low-sugar"] },
    { name: "Batchelors Mushy Peas", tags: ["organic", "nut-free", "egg-free", "gluten-free"] },
    { name: "Pat The Baker Gluten Free White Bread", tags: ["gluten-free", "egg-free", "vegan"] },
    { name: "Nature Valley Protein Bars", tags: ["low-sugar", "contains-nuts", "vegetarian"] },
    { name: "Tesco Organic Free Range Eggs", tags: ["egg-free", "vegetarian", "organic", "gluten-free"] },
    { name: "Clonakilty Black Pudding", tags: ["egg-free", "nut-free", "dairy-free", "low-sugar"] },
    { name: "Green Isle Mixed Vegetables", tags: ["gluten-free", "vegan", "organic"] },
    { name: "Yazoo Strawberry Milk", tags: ["low-sugar", "gluten-free", "egg-free"] },
    { name: "Cadbury Dairy Milk", tags: ["vegetarian", "contains-nuts"] },
    { name: "Milbona Greek Style Yogurt", tags: ["dairy-free", "low-sugar", "vegetarian", "egg-free"] },
    { name: "Innocent Smoothie", tags: ["vegan", "gluten-free", "organic", "low-sugar"] },
    { name: "Odlums Wholemeal Flour", tags: ["gluten-free", "organic", "low-sugar"] },
    { name: "Baxters Tomato Soup", tags: ["egg-free", "low-sugar", "vegan", "nut-free"] },
    { name: "Irish Cheddar Cheese", tags: ["vegetarian", "gluten-free", "nut-free", "egg-free"] },
    { name: "Keogh's Atlantic Sea Salt Crisps", tags: ["gluten-free", "vegan", "egg-free"] },
    { name: "Irish Apple Juice", tags: ["organic", "low-sugar", "vegan"] },
    { name: "SuperValu Tuna Chunks in Brine", tags: ["nut-free", "egg-free", "low-sugar"] },
    { name: "Goodfella's Gluten Free Pizza", tags: ["gluten-free", "dairy-free", "vegetarian"] },
    { name: "Nairn's Oat Biscuits", tags: ["gluten-free", "low-sugar", "vegan"] }
];


let userPreferences = [];
userPreferences = JSON.parse(localStorage.getItem("userPreferences")) || [];




document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    function generateResponse(query) {
        const doc = nlp(query.toLowerCase());
        const lowerQuery = query.toLowerCase();
    
        if (lowerQuery.includes("ingredient") || lowerQuery.includes("contains")) {
            // Extract portion after "contains"
            const match = query.toLowerCase().match(/contains(.*)/);
            const ingredientText = match ? match[1].trim() : query;
        
            return analyzeIngredients(ingredientText).then(result => {
        
                if (result && result.labels && result.scores) {
                    const labels = result.labels;
                    const scores = result.scores;
                    const top = labels.filter((_, i) => scores[i] > 0.5);
    
                    const msg = top.length > 0
                        ? `⚠️ Potential allergens detected: ${top.join(", ")}`
                        : "✅ No common allergens detected.";
    
                    return msg;
                } else {
                    console.error("Unexpected Hugging Face response:", result);
                    return "Sorry, I couldn't analyze the ingredients.";
                }
            });
        }
    
        // Synchronous responses
        if (doc.has("recommend")) return Promise.resolve(recommendProducts(userPreferences));
        if (doc.has("recipe")) return Promise.resolve("Here are some recipe suggestions based on your recent purchases...");
        if (doc.has("expire")) return Promise.resolve("I can help track expiration dates. Scan an item to get started!");
    
        return Promise.resolve("I'm still learning to understand you better. Try asking me about ingredients or for product suggestions!");
    }
    
    
    
    

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        function speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-GB"; // English
            speechSynthesis.speak(utterance);
        }

        if (!isUser) {
            speak(text);
        }
        
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function processQuery(query) {
        showTypingIndicator();
        conversationHistory.push({ role: 'user', content: query });
        
        const lowered = query.toLowerCase();

if (lowered.includes("gluten") && !userPreferences.includes("gluten-free")) {
    userPreferences.push("gluten-free");
}
if (lowered.includes("dairy") && !userPreferences.includes("dairy-free")) {
    userPreferences.push("dairy-free");
}
if (lowered.includes("vegan") && !userPreferences.includes("vegan")) {
    userPreferences.push("vegan");
}
if (lowered.includes("vegetarian") && !userPreferences.includes("vegetarian")) {
    userPreferences.push("vegetarian");
}

localStorage.setItem("userPreferences", JSON.stringify(userPreferences));

setTimeout(async () => {
    const response = await generateResponse(query);
    conversationHistory.push({ role: 'bot', content: response });
    addMessage(response);
    hideTypingIndicator();
}, 800);

}


function recommendProducts(preferences) {
    const recommended = products.filter(product =>
        preferences.every(pref => product.tags.includes(pref))
    );

    if (recommended.length > 0) {
        return "Based on your preferences, I recommend: " + recommended.map(p => p.name).join(", ");
    } else {
        return "I couldn't find a perfect match, but here are some popular options: Almond Milk, Oat Cookies.";
    }
}


    sendButton.addEventListener('click', () => {
        const query = userInput.value.trim();
        if (query) {
            addMessage(query, true);
            processQuery(query);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    const micButton = document.getElementById("micButton");

if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-GB"; //  English
    recognition.interimResults = false;

    micButton.addEventListener("click", () => {
        recognition.start();
    });

    recognition.onstart = () => {
        micButton.classList.add("listening");
        console.log("Voice recognition started...");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendButton.click(); // Auto-send the message
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
    };

    recognition.onend = () => {
        micButton.classList.remove("listening");
        console.log("Voice recognition ended.");
    };
} else {
    micButton.disabled = true;
    alert("Sorry, your browser doesn't support speech recognition.");
}

async function analyzeIngredients(text) {
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", {
        method: "POST",
        headers: {
            "Authorization": "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",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: text,
            parameters: {
                candidate_labels: ["gluten", "dairy", "nuts", "soy", "egg", "vegan", "vegetarian"]
            }
        })
    });
  
    return await response.json();
}




    console.log('TensorFlow.js version:', tf.version.tfjs);

});
