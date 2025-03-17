function toggleOptions(optionsId, caretId) {
    let options = document.getElementById(optionsId);
    let caret = document.getElementById(caretId);
    options.classList.toggle("show");
    caret.classList.toggle("rotate");
    caret.textContent = options.classList.contains("show") ? "▾" : "▸";
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});