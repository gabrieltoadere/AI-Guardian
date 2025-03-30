let conversationHistory = [];

const products = [
    { name: "Almond Milk", tags: ["dairy-free", "vegan"] },
    { name: "Oat Cookies", tags: ["gluten-free", "vegan"] },
    { name: "Greek Yogurt", tags: ["dairy"] },
    { name: "Rice Crackers", tags: ["gluten-free"] },
    { name: "Tofu", tags: ["vegan", "dairy-free"] },
];

let userPreferences = [];



document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    function generateResponse(query) {
        const doc = nlp(query.toLowerCase());
        const nouns = doc.nouns().out('array');
        const verbs = doc.verbs().out('array');
    
        if (doc.has('gluten')) {
            return "This product appears to contain gluten. Would you like alternatives?";
        }
        if (doc.has('dairy')) {
            return "Got it! Showing you dairy-free options.";
        }
        if (doc.has('recommend')) {
            return recommendProducts(userPreferences);
        }
        
        if (nouns.includes('recipe')) {
            return "Here are some recipe suggestions based on your recent purchases...";
        }
        if (verbs.includes('expire')) {
            return "I can help track expiration dates. Scan an item to get started!";
        }
    
        return "I'm still learning to better understand you. Could you rephrase that?";
        if (query.includes("recommend")) {
            return recommendProducts(userPreferences);
        }

        
    }
    

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
        if (lowered.includes("gluten")) userPreferences.push("gluten-free");
        if (lowered.includes("dairy")) userPreferences.push("dairy-free");
        if (lowered.includes("vegan")) userPreferences.push("vegan");
        
    setTimeout(() => {
        const response = generateResponse(query);
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

    console.log('TensorFlow.js version:', tf.version.tfjs);

});
