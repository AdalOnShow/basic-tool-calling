const form = document.querySelector("#chat-form");
const prompt = document.querySelector("#prompt");
const sendButton = document.querySelector("#send-button");

function createLoadingIndicator() {
  const loader = document.createElement("div");
  loader.className =
    "mb-5 mr-auto flex w-fit max-w-[90%] items-center gap-1.5 rounded-2xl bg-[#2c2c2c] px-4 py-3.5 leading-relaxed sm:max-w-[80%]";
  loader.setAttribute("aria-label", "Assistant is typing");
  loader.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  return loader;
}

async function generate(text) {
  const chatContainer = document.querySelector("#chat-container");

  const msg = document.createElement("div");
  msg.className =
    "mb-5 ml-auto w-fit max-w-[90%] rounded-2xl bg-[#3a3a3a] px-4 py-3 leading-relaxed sm:max-w-[80%]";
  msg.textContent = text;
  chatContainer.appendChild(msg);
  msg.scrollIntoView({ behavior: "smooth" });

  const loader = createLoadingIndicator();
  chatContainer.appendChild(loader);
  loader.scrollIntoView({ behavior: "smooth" });

  try {
    const assistantMessage = await callServer(text);
    loader.remove();

    const assistantMsg = document.createElement("div");
    assistantMsg.className =
      "mb-5 mr-auto w-fit max-w-[90%] rounded-2xl bg-[#2c2c2c] px-4 py-3 leading-relaxed sm:max-w-[80%]";
    assistantMsg.textContent = assistantMessage;
    chatContainer.appendChild(assistantMsg);
    assistantMsg.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    loader.remove();

    const errorMsg = document.createElement("div");
    errorMsg.className =
      "mb-5 mr-auto w-fit max-w-[90%] rounded-2xl bg-[#3a2424] px-4 py-3 leading-relaxed text-[#f1a9a9] sm:max-w-[80%]";
    errorMsg.textContent =
      "Something went wrong. Please make sure the server is running and try again.";
    chatContainer.appendChild(errorMsg);
    errorMsg.scrollIntoView({ behavior: "smooth" });
  }
}

async function callServer(text) {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: text }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result.message;
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!text) return;

  prompt.value = "";
  resizePrompt();
  updateSendButton();
  await generate(text);
});
