import llmClient from "../lib/llm-client.js";

const emptyState = document.getElementById("empty-state");
const loading = document.getElementById("loading");
const loadingDetail = document.getElementById("loading-detail");
const quizContainer = document.getElementById("quiz-container");
const errorMessage = document.getElementById("error-message");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GENERATE_QUIZ") {
    handleGenerateQuiz(request.text);
  }
});

// Check if there was a pending quiz when panel opened (race condition handling)
chrome.storage.local.get(["pendingQuizText"], (result) => {
  if (result.pendingQuizText) {
    handleGenerateQuiz(result.pendingQuizText);
    chrome.storage.local.remove("pendingQuizText");
  }
});

async function handleGenerateQuiz(text) {
  console.log("[Focus Quiz] Starting quiz generation for text:", text.substring(0, 100) + "...");
  showLoading();
  hideError();

  try {
    loadingDetail.textContent = "Analyzing text...";
    console.log("[Focus Quiz] Calling LLM...");
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timeout (30s). Check your API Key and network.")), 30000)
    );
    
    loadingDetail.textContent = "Calling AI model...";
    const quizData = await Promise.race([
      llmClient.generateQuiz(text),
      timeoutPromise
    ]);
    
    console.log("[Focus Quiz] Quiz data received:", quizData);
    renderQuiz(quizData);
  } catch (err) {
    console.error("[Focus Quiz] Error:", err);
    showError(err.message);
  }
}

function renderQuiz(data) {
  loading.classList.add("hidden");
  loading.classList.remove("flex");
  emptyState.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  quizContainer.classList.add("flex");
  quizContainer.innerHTML = "";

  if (!data.questions || data.questions.length === 0) {
    showError("No questions generated. Try selecting more text.");
    return;
  }

  data.questions.forEach((q, index) => {
    const card = createQuestionCard(q, index);
    quizContainer.appendChild(card);
  });
}

function createQuestionCard(question, index) {
  const card = document.createElement("div");
  card.className =
    "bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow";

  const title = document.createElement("div");
  title.className = "font-medium text-sm mb-3 text-zinc-900";
  title.textContent = `${index + 1}. ${question.question}`;
  card.appendChild(title);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "flex flex-col gap-2";

  let answered = false;

  question.options.forEach((optText, i) => {
    const btn = document.createElement("button");
    btn.className =
      "text-left bg-white border border-zinc-200 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer";
    btn.textContent = optText;

    btn.onclick = () => {
      if (answered) return;
      answered = true;

      const isCorrect = i === question.correctAnswer;

      // Disable all buttons
      Array.from(optionsContainer.children).forEach((b) => {
        b.classList.remove(
          "hover:bg-zinc-50",
          "hover:border-zinc-300",
          "cursor-pointer"
        );
        b.classList.add("cursor-default");
      });

      if (isCorrect) {
        btn.className =
          "text-left bg-zinc-900 border border-zinc-900 px-3 py-2.5 rounded-lg text-sm text-white cursor-default";
        btn.innerHTML = `${optText} <span class="ml-1">✓</span>`;
      } else {
        btn.className =
          "text-left bg-white border border-zinc-300 px-3 py-2.5 rounded-lg text-sm text-zinc-400 line-through cursor-default";
        btn.innerHTML = `${optText} <span class="ml-1">✗</span>`;
        // Highlight correct answer
        const correctBtn = optionsContainer.children[question.correctAnswer];
        if (correctBtn) {
          correctBtn.className =
            "text-left bg-zinc-900 border border-zinc-900 px-3 py-2.5 rounded-lg text-sm text-white cursor-default";
        }
      }

      explanation.classList.remove("hidden");
      explanation.classList.add("animate-fade-in");
    };

    optionsContainer.appendChild(btn);
  });

  card.appendChild(optionsContainer);

  const explanation = document.createElement("div");
  explanation.className =
    "hidden mt-3 p-3 bg-zinc-50 border-l-2 border-zinc-900 rounded text-xs text-zinc-600";
  explanation.textContent = `💡 ${question.explanation}`;
  card.appendChild(explanation);

  return card;
}

function showLoading() {
  emptyState.classList.add("hidden");
  quizContainer.classList.add("hidden");
  quizContainer.classList.remove("flex");
  loading.classList.remove("hidden");
  loading.classList.add("flex");
}

function hideError() {
  errorMessage.classList.add("hidden");
  errorMessage.innerHTML = "";
}

function showError(msg) {
  loading.classList.add("hidden");
  loading.classList.remove("flex");
  emptyState.classList.add("hidden");
  quizContainer.classList.add("hidden");
  quizContainer.classList.remove("flex");
  errorMessage.classList.remove("hidden");

  errorMessage.innerHTML = `<span class="font-medium">Error:</span> ${msg}`;

  if (msg.includes("API Key not set")) {
    const btn = document.createElement("button");
    btn.textContent = "Open Settings";
    btn.className =
      "mt-3 px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors";

    btn.onclick = () => {
      chrome.runtime.openOptionsPage();
    };

    errorMessage.appendChild(document.createElement("br"));
    errorMessage.appendChild(btn);
  }
}
