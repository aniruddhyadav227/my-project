const examData = {
  "JEE Advanced": {
    category: "Engineering",
    duration: 30,
    questions: [
      {
        question: "The equation x² - 7x + 12 = 0 has roots:",
        options: ["3 and 4", "2 and 6", "1 and 12", "-3 and -4"],
        answer: 0
      },
      {
        question: "If a = 5 and b = 3, then a² - b² equals:",
        options: ["8", "16", "34", "36"],
        answer: 2
      },
      {
        question: "The derivative of x³ is:",
        options: ["x²", "3x²", "3x³", "x"],
        answer: 1
      },
      {
        question: "Which number is a prime number?",
        options: ["21", "27", "29", "33"],
        answer: 2
      },
      {
        question: "A triangle with all sides equal is called:",
        options: ["Scalene", "Isosceles", "Equilateral", "Right-angled"],
        answer: 2
      }
    ]
  },
  "SSC CGL": {
    category: "Government",
    duration: 25,
    questions: [
      {
        question: "Find the next number: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "48"],
        answer: 1
      },
      {
        question: "Which word is the opposite of 'Diligent'?",
        options: ["Hardworking", "Lazy", "Careful", "Smart"],
        answer: 1
      },
      {
        question: "The angle between two perpendicular lines is:",
        options: ["45°", "90°", "120°", "180°"],
        answer: 1
      },
      {
        question: "Choose the correctly spelled word:",
        options: ["Accomodation", "Accommodation", "Acomodation", "Acommodatio"],
        answer: 1
      },
      {
        question: "If 12 workers finish a job in 8 days, how many days will 16 workers take?",
        options: ["5 days", "6 days", "7 days", "8 days"],
        answer: 1
      }
    ]
  },
  "UPSC Prelims": {
    category: "Civil Services",
    duration: 40,
    questions: [
      {
        question: "The Constitution of India came into effect on:",
        options: ["15 August 1947", "26 January 1950", "26 November 1949", "2 October 1950"],
        answer: 1
      },
      {
        question: "Which is the largest river in India by volume?",
        options: ["Ganga", "Brahmaputra", "Godavari", "Indus"],
        answer: 1
      },
      {
        question: "The capital of Karnataka is:",
        options: ["Pune", "Bengaluru", "Hyderabad", "Chennai"],
        answer: 1
      },
      {
        question: "Who is known as the Father of the Indian Constitution?",
        options: ["Jawaharlal Nehru", "B.R. Ambedkar", "Sardar Patel", "Rajendra Prasad"],
        answer: 1
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Mercury", "Jupiter"],
        answer: 1
      }
    ]
  },
  "Banking PO": {
    category: "Finance",
    duration: 20,
    questions: [
      {
        question: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        answer: 2
      },
      {
        question: "A train covers 180 km in 3 hours. Its speed is:",
        options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
        answer: 2
      },
      {
        question: "Which of the following is a synonym of 'frugal'?",
        options: ["Wasteful", "Economical", "Generous", "Luxurious"],
        answer: 1
      },
      {
        question: "If all roses are flowers and some flowers fade quickly, then:",
        options: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "All flowers are roses"],
        answer: 1
      },
      {
        question: "Choose the correct arrangement: 5, 10, 15, ?",
        options: ["16", "18", "20", "25"],
        answer: 2
      }
    ]
  }
};

const examGrid = document.getElementById("examGrid");
const examSelect = document.getElementById("examSelect");
const startBtn = document.getElementById("startBtn");
const testArea = document.getElementById("testArea");
const resultArea = document.getElementById("resultArea");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const questionNav = document.getElementById("questionNav");
const timerValue = document.getElementById("timerValue");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const markQuestionBtn = document.getElementById("markQuestion");

const storageKey = "examArenaProgress";

const state = {
  selectedExam: "JEE Advanced",
  questions: [],
  currentIndex: 0,
  answers: {},
  marked: new Set(),
  timer: 0,
  timerId: null,
  started: false
};

function renderExamCards() {
  const cards = Object.entries(examData)
    .map(
      ([name, exam]) => `
        <article class="exam-card card">
          <span class="pill">${exam.category}</span>
          <h3>${name}</h3>
          <p>${exam.questions.length} questions • ${exam.duration} minute mock</p>
          <ul>
            <li>Timed practice mode</li>
            <li>Instant score summary</li>
            <li>Difficulty-based prep</li>
          </ul>
          <button class="primary-btn small practice-btn" data-exam="${name}">Practice now</button>
        </article>
      `
    )
    .join("");

  examGrid.innerHTML = cards;

  document.querySelectorAll(".practice-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const examName = button.dataset.exam;
      examSelect.value = examName;
      state.selectedExam = examName;
      startExam(examName);
      document.getElementById("practice").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function populateExamSelector() {
  examSelect.innerHTML = Object.keys(examData)
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");
  examSelect.value = state.selectedExam;
}

function loadSavedProgress() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  if (saved.selectedExam) {
    state.selectedExam = saved.selectedExam;
  }
  if (saved.lastResult) {
    updateAnalytics(saved.lastResult.accuracy);
  }
}

function saveProgress() {
  const payload = {
    selectedExam: state.selectedExam,
    lastResult: {
      exam: state.selectedExam,
      accuracy: state.lastAccuracy || 0,
      score: state.lastScore || 0,
      total: state.lastTotal || 0
    }
  };

  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function startExam(examName) {
  const exam = examData[examName];
  if (!exam) return;

  state.selectedExam = examName;
  state.questions = exam.questions.map((question, index) => ({ ...question, id: index }));
  state.currentIndex = 0;
  state.answers = {};
  state.marked = new Set();
  state.timer = exam.duration * 60;
  state.started = true;

  clearInterval(state.timerId);
  updateTimerDisplay();
  state.timerId = setInterval(() => {
    state.timer -= 1;
    updateTimerDisplay();

    if (state.timer <= 0) {
      clearInterval(state.timerId);
      submitTest();
    }
  }, 1000);

  testArea.classList.remove("hidden");
  resultArea.classList.add("hidden");
  renderQuestion();
  renderQuestionNav();
  saveProgress();
}

function updateTimerDisplay() {
  const minutes = Math.floor(state.timer / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (state.timer % 60).toString().padStart(2, "0");
  timerValue.textContent = `${minutes}:${seconds}`;
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  if (!question) return;

  questionNumber.textContent = `Question ${state.currentIndex + 1}`;
  questionText.textContent = question.question;

  const selectedOption = state.answers[state.currentIndex];
  optionsList.innerHTML = question.options
    .map((option, index) => {
      const isSelected = selectedOption === index;
      const classes = isSelected ? "option-btn selected" : "option-btn";
      return `
        <button class="${classes}" data-index="${index}">
          <span class="letter">${String.fromCharCode(65 + index)}</span>
          <span>${option}</span>
        </button>
      `;
    })
    .join("");

  optionsList.querySelectorAll(".option-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.index);
      state.answers[state.currentIndex] = selectedIndex;
      renderQuestion();
      renderQuestionNav();
      saveProgress();
    });
  });

  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.textContent = state.currentIndex === state.questions.length - 1 ? "Last" : "Next";

  if (state.marked.has(state.currentIndex)) {
    markQuestionBtn.textContent = "Unmark";
  } else {
    markQuestionBtn.textContent = "Mark for review";
  }
}

function renderQuestionNav() {
  questionNav.innerHTML = state.questions
    .map((_, index) => {
      const isActive = index === state.currentIndex;
      const isAnswered = Object.prototype.hasOwnProperty.call(state.answers, index);
      const isMarked = state.marked.has(index);

      let classes = "question-bubble";
      if (isActive) classes += " active";
      if (isAnswered) classes += " answered";
      if (isMarked && !isAnswered) classes += " review";

      return `<button class="${classes}" data-nav-index="${index}">${index + 1}</button>`;
    })
    .join("");

  questionNav.querySelectorAll(".question-bubble").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentIndex = Number(button.dataset.navIndex);
      renderQuestion();
      renderQuestionNav();
    });
  });
}

function submitTest() {
  clearInterval(state.timerId);

  const total = state.questions.length;
  let correct = 0;
  let attempted = 0;

  state.questions.forEach((question, index) => {
    const selectedAnswer = state.answers[index];
    if (selectedAnswer !== undefined) {
      attempted += 1;
    }
    if (selectedAnswer === question.answer) {
      correct += 1;
    }
  });

  const wrong = attempted - correct;
  const unanswered = total - attempted;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  state.lastAccuracy = accuracy;
  state.lastScore = correct;
  state.lastTotal = total;

  const examName = state.selectedExam;
  const resultSummary = `
    <div class="result-header">
      <p class="eyebrow dark">Test complete</p>
      <h3>${examName}</h3>
    </div>
    <div class="result-grid">
      <div class="result-box">
        <strong>${correct}/${total}</strong>
        <span>Correct</span>
      </div>
      <div class="result-box">
        <strong>${percentage}%</strong>
        <span>Accuracy</span>
      </div>
      <div class="result-box">
        <strong>${wrong}</strong>
        <span>Wrong</span>
      </div>
      <div class="result-box">
        <strong>${unanswered}</strong>
        <span>Unanswered</span>
      </div>
    </div>
    <div class="action-row">
      <button id="retakeBtn" class="primary-btn small">Retake test</button>
    </div>
  `;

  resultArea.innerHTML = resultSummary;
  resultArea.classList.remove("hidden");
  testArea.classList.add("hidden");

  document.getElementById("retakeBtn").addEventListener("click", () => {
    startExam(state.selectedExam);
  });

  updateAnalytics(accuracy);
  saveProgress();
}

function updateAnalytics(accuracy) {
  const accuracyStat = document.getElementById("accuracyStat");
  const speedStat = document.getElementById("speedStat");
  const recallStat = document.getElementById("recallStat");

  const metrics = {
    accuracy: Math.min(100, Math.max(40, accuracy)),
    speed: Math.min(100, Math.max(50, accuracy + 8)),
    recall: Math.min(100, Math.max(55, accuracy + 5))
  };

  accuracyStat.textContent = `${metrics.accuracy}%`;
  speedStat.textContent = `${metrics.speed}%`;
  recallStat.textContent = `${metrics.recall}%`;

  document.querySelector(".fill.blue").style.width = `${metrics.accuracy}%`;
  document.querySelector(".fill.purple").style.width = `${metrics.speed}%`;
  document.querySelector(".fill.green").style.width = `${metrics.recall}%`;
}

startBtn.addEventListener("click", () => {
  const selected = examSelect.value;
  startExam(selected);
});

examSelect.addEventListener("change", () => {
  state.selectedExam = examSelect.value;
  saveProgress();
});

prevBtn.addEventListener("click", () => {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
    renderQuestionNav();
  }
});

nextBtn.addEventListener("click", () => {
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
    renderQuestionNav();
  }
});

submitBtn.addEventListener("click", () => {
  submitTest();
});

markQuestionBtn.addEventListener("click", () => {
  if (state.marked.has(state.currentIndex)) {
    state.marked.delete(state.currentIndex);
  } else {
    state.marked.add(state.currentIndex);
  }

  renderQuestion();
  renderQuestionNav();
});

renderExamCards();
populateExamSelector();
loadSavedProgress();
updateAnalytics(88);

if (state.selectedExam) {
  startExam(state.selectedExam);
  clearInterval(state.timerId);
  testArea.classList.add("hidden");
  resultArea.classList.add("hidden");
}
