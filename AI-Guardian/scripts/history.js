function toggleOptions(optionsId, caretId) {
    let options = document.getElementById(optionsId);
    let caret = document.getElementById(caretId);
    options.classList.toggle("show");
    caret.classList.toggle("rotate");
    caret.textContent = options.classList.contains("show") ? "▾" : "▸";
}
