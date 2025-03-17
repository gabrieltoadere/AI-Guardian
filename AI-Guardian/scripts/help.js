// Add at top of file
let conversationHistory = [];


document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    function generateResponse(query) {
        const lowerQuery = query.toLowerCase();
        const lastMessage = conversationHistory[conversationHistory.length - 2];
        
        // Add contextual responses
        if (lowerQuery.includes('recipe')) {
            return 'Here are some recipe suggestions based on your recent purchases...';
        }
        if (lowerQuery.includes('expire')) {
            return 'I can help track expiration dates. Scan an item to get started!';
        }
        if (lastMessage && lastMessage.content.includes('recipe')) {
            return 'Would you like detailed instructions for that recipe?';
        }
        return "I'm learning more about grocery management every day! How else can I assist?";
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
        
        // Simulate AI processing delay
          // Simulate API call
    setTimeout(() => {
        const response = generateResponse(query);
        conversationHistory.push({ role: 'bot', content: response });
        addMessage(response);
        hideTypingIndicator();
    }, 800);
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
