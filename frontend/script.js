const form = document.querySelector("#chat-form");
const prompt = document.querySelector("#prompt");
const sendButton = document.querySelector("#send-button");

function generate(text) {
  const msg = document.createElement("div");
  msg.className =
    "mb-5 ml-auto w-fit max-w-[90%] rounded-2xl bg-[#3a3a3a] px-4 py-3 leading-relaxed sm:max-w-[80%]";
  msg.textContent = text;
  document.querySelector("#chat-container").appendChild(msg);
  msg.scrollIntoView({ behavior: "smooth" });
}

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
  const text = prompt.value.trim();
  if (!text) return;

  prompt.value = "";
  resizePrompt();
  updateSendButton();
  generate(text);
});
