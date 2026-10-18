const form = document.querySelector("#chat-form");
const prompt = document.querySelector("#prompt");
const sendButton = document.querySelector("#send-button");

function resizePrompt() {
  prompt.style.height = "auto";
  prompt.style.height = `${Math.min(prompt.scrollHeight, 144)}px`;
}

function updateSendButton() {
  sendButton.disabled = !prompt.value.trim();
}

prompt.addEventListener("input", () => {
  resizePrompt();
  updateSendButton();
});

prompt.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.ctrlKey) {
    event.preventDefault();
    form.requestSubmit();
  } else if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    const start = prompt.selectionStart;
    const end = prompt.selectionEnd;
    prompt.setRangeText("\n", start, end, "end");
    prompt.dispatchEvent(new Event("input"));
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  prompt.value = "";
  resizePrompt();
  updateSendButton();
});
