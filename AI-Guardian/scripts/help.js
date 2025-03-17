document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    // Sample AI responses
    const aiResponses = {
        'help': "You can ask me about product information, expiration dates, or recipe suggestions!",
        'expired': "Check the expiration date by scanning the product. I'll notify you when items are nearing expiration!",
        'recipe': "Based on your items, try making a vegetable stir-fry! Need more suggestions?",
        'default': "I'm constantly learning! For complex queries, our human team will follow up via email."
    };

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
        
        // Simulate AI processing delay
        setTimeout(() => {
            hideTypingIndicator();
            const lowerQuery = query.toLowerCase();
            let response = aiResponses['default'];

            if (lowerQuery.includes('help')) response = aiResponses['help'];
            if (lowerQuery.includes('expir')) response = aiResponses['expired'];
            if (lowerQuery.includes('recipe')) response = aiResponses['recipe'];

            addMessage(response);
        }, 1500);
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
});
