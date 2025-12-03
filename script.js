// script.js (updated)
// Wrap all DOM reads and wiring inside DOMContentLoaded to ensure elements exist
(function () {
  // --- Questions array (same as before) ---
  const QUESTIONS = [
    {
      q: "Which HTML element is used for the largest heading?",
      choices: ["<h1>", "<heading>", "<title>"],
      answer: 0,
      explanation: "<h1> is the largest HTML heading element."
    },
    {
      q: "What does CSS stand for?",
      choices: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Styling System"],
      answer: 1,
      explanation: "CSS = Cascading Style Sheets — it controls presentation of HTML."
    },
    {
      q: "Which loop repeats while a condition is true in JavaScript?",
      choices: ["for", "do-while", "while"],
      answer: 2,
      explanation: "The while loop repeats as long as its condition evaluates to true."
    },
    {
      q: "Which HTTP method is commonly used to submit form data to a server?",
      choices: ["GET", "POST", "DELETE"],
      answer: 1,
      explanation: "POST sends data in the request body and is commonly used for form submissions."
    },
    {
      q: "In PHP, which symbol starts a variable name?",
      choices: ["#", "$", "@"],
      answer: 1,
      explanation: "PHP variables start with the dollar sign, e.g. $name."
    },
    {
      q: "Which attribute makes an input required in HTML forms?",
      choices: ["mandatory", "required", "validate"],
      answer: 1,
      explanation: "Use the required attribute to prevent form submission until filled."
    },
    {
      q: "Which CSS property changes text color?",
      choices: ["color", "font-color", "text-color"],
      answer: 0,
      explanation: "The CSS property 'color' sets the foreground color of text."
    },
    {
      q: "What's the file extension for a PHP file?",
      choices: [".php", ".html", ".js"],
      answer: 0,
      explanation: "PHP files typically use the .php extension."
    },
    {
      q: "Which HTML attribute adds alternative text to an image?",
      choices: ["alt", "title", "src"],
      answer: 0,
      explanation: "The 'alt' attribute provides alternative text used by screen readers."
    },
    {
      q: "In JavaScript, which function converts a JSON string into an object?",
      choices: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()"],
      answer: 0,
      explanation: "JSON.parse converts a JSON string into a JavaScript object."
    }
  ];

  // Wait until DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const startBtn = document.getElementById('startBtn');
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');

    const qIndexEl = document.getElementById('qIndex');
    const qTotalEl = document.getElementById('qTotal');
    const scoreEl = document.getElementById('score');
    const questionText = document.getElementById('questionText');
    const choicesEl = document.getElementById('choices');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    const quitBtn = document.getElementById('quitBtn');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');

    const finalScoreEl = document.getElementById('finalScore');
    const finalTotalEl = document.getElementById('finalTotal');
    const gradeText = document.getElementById('gradeText');
    const restartBtn = document.getElementById('restartBtn');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const playerNameInput = document.getElementById('playerName');
    const submitMsg = document.getElementById('submitMsg');

    const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
    const viewLeaderboardBtn2 = document.getElementById('viewLeaderboardBtn2');
    const leaderboardList = document.getElementById('leaderboardList');
    const backToStart = document.getElementById('backToStart');

    const numQuestionsSelect = document.getElementById('numQuestions');
    const timePerQSelect = document.getElementById('timePerQ');

    // --- State ---
    let quizQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let totalQuestions = 10;
    let timePerQuestion = 15;
    let timer = null;
    let timeLeft = 0;
    let answered = false;

    // --- Helpers ---
    function shuffle(arr){
      return arr.slice().sort(()=>Math.random()-0.5);
    }

    function startQuiz(){
      totalQuestions = Math.min(parseInt(numQuestionsSelect.value,10), QUESTIONS.length);
      timePerQuestion = parseInt(timePerQSelect.value,10);
      quizQuestions = shuffle(QUESTIONS).slice(0, totalQuestions);
      currentIndex = 0;
      score = 0;
      scoreEl.textContent = score;
      qTotalEl.textContent = totalQuestions;
      startScreen.classList.add('hidden');
      leaderboardScreen.classList.add('hidden');
      resultScreen.classList.add('hidden');
      quizScreen.classList.remove('hidden');
      showQuestion();
    }

    function showQuestion(){
      const q = quizQuestions[currentIndex];
      qIndexEl.textContent = currentIndex + 1;
      questionText.innerHTML = q.q;
      choicesEl.innerHTML = '';
      feedbackEl.classList.add('hidden');
      feedbackEl.innerHTML = '';
      nextBtn.disabled = true;
      answered = false;

      q.choices.forEach((c, idx)=>{
        const btn = document.createElement('button');
        btn.className = 'choice';
        btn.innerHTML = c;
        btn.dataset.idx = idx;
        btn.addEventListener('click', () => selectAnswer(idx));
        choicesEl.appendChild(btn);
      });

      // Timer
      startTimer(timePerQuestion);
    }

    function startTimer(seconds){
      clearInterval(timer);
      timeLeft = seconds;
      updateTimerBar();
      timer = setInterval(()=>{
        timeLeft -= 0.2;
        if (timeLeft <= 0){
          clearInterval(timer);
          timeoutAnswer();
        }
        updateTimerBar();
      }, 200);
    }

    function updateTimerBar(){
      const pct = Math.max(0, timeLeft / timePerQuestion) * 100;
      timerBar.style.width = pct + '%';
      timerText.textContent = Math.ceil(timeLeft) + 's';
    }

    function selectAnswer(selectedIdx){
      if (answered) return;
      answered = true;
      clearInterval(timer);
      const q = quizQuestions[currentIndex];
      const correct = selectedIdx === q.answer;
      markChoices(selectedIdx, q.answer);
      showFeedback(correct, q.explanation);
      if (correct){
        score++;
        scoreEl.textContent = score;
      }
      nextBtn.disabled = false;
    }

    function timeoutAnswer(){
      if (answered) return;
      answered = true;
      markChoices(null, quizQuestions[currentIndex].answer, true);
      showFeedback(false, "Time's up! " + (quizQuestions[currentIndex].explanation || ''));
      nextBtn.disabled = false;
    }

    function markChoices(selectedIdx, correctIdx, timedOut = false){
      const buttons = Array.from(choicesEl.children);
      buttons.forEach((b, i)=>{
        b.classList.add('disabled');
        if (i === correctIdx) b.classList.add('correct');
        if (selectedIdx !== null && i === selectedIdx && i !== correctIdx) b.classList.add('incorrect');
        if (timedOut && i === correctIdx) b.classList.add('correct');
      });
    }

    function showFeedback(isCorrect, explanation){
      feedbackEl.classList.remove('hidden');
      if (isCorrect){
        feedbackEl.innerHTML = `<strong>Correct!</strong> ${explanation ? ('<div class="muted">'+explanation+'</div>') : ''}`;
      } else {
        const correctText = quizQuestions[currentIndex].choices[quizQuestions[currentIndex].answer];
        feedbackEl.innerHTML = `<strong>${isCorrect ? 'Correct' : 'Incorrect'}</strong> ${explanation ? ('<div class="muted">'+explanation+'</div>') : '' } <div class="muted">Answer: ${correctText}</div>`;
      }
    }

    nextBtn.addEventListener('click', ()=>{
      currentIndex++;
      if (currentIndex >= totalQuestions){
        endQuiz();
      } else {
        showQuestion();
      }
    });

    quitBtn.addEventListener('click', ()=>{
      if (confirm('Quit and return to start?')){
        stopQuiz();
      }
    });

    function stopQuiz(){
      clearInterval(timer);
      quizScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
    }

    function endQuiz(){
      clearInterval(timer);
      quizScreen.classList.add('hidden');
      resultScreen.classList.remove('hidden');
      finalScoreEl.textContent = score;
      finalTotalEl.textContent = totalQuestions;
      gradeText.textContent = gradeFor(score, totalQuestions);
    }

    function gradeFor(score, total){
      const pct = Math.round((score/total)*100);
      if (pct >= 90) return `Excellent — ${pct}%`;
      if (pct >= 75) return `Great — ${pct}%`;
      if (pct >= 50) return `Good — ${pct}%`;
      return `Needs improvement — ${pct}%`;
    }

    restartBtn.addEventListener('click', ()=>{
      resultScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
      playerNameInput.value = '';
      submitMsg.textContent = '';
    });

    // Leaderboard POST (save_score.php)
    async function submitScore(){
      const name = (playerNameInput.value || 'Anonymous').trim().slice(0,24);
      const payload = { name, score, total: totalQuestions, timestamp: Date.now() };
      submitMsg.textContent = 'Submitting...';
      try {
        const res = await fetch('save_score.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success){
          submitMsg.textContent = 'Score submitted — view leaderboard!';
        } else {
          submitMsg.textContent = 'Could not submit score (server). Saved locally.';
          saveLocalScore(payload);
        }
      } catch (err){
        console.error(err);
        submitMsg.textContent = 'Server error — saved locally.';
        saveLocalScore(payload);
      }
    }

    function saveLocalScore(payload){
      const key = 'quiz_local_scores';
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr));
    }

    // Fetch leaderboard from server (get_leaderboard.php)
    async function loadLeaderboard(){
      leaderboardList.innerHTML = 'Loading...';
      try {
        const res = await fetch('get_leaderboard.php');
        const json = await res.json();
        if (json.success && Array.isArray(json.scores)){
          const rows = json.scores;
          if (rows.length === 0){
            leaderboardList.innerHTML = '<div class="muted">No scores yet.</div>';
            return;
          }
          leaderboardList.innerHTML = '';
          rows.slice(0,20).forEach(r => {
            const el = document.createElement('div');
            el.className = 'lb-item';
            el.innerHTML = `<div><strong>${escapeHtml(r.name)}</strong> <span class="muted">(${new Date(r.timestamp).toLocaleString()})</span></div><div>${r.score}/${r.total}</div>`;
            leaderboardList.appendChild(el);
          });
        } else {
          leaderboardList.innerHTML = '<div class="muted">Unable to load leaderboard.</div>';
        }
      } catch (err){
        console.error(err);
        leaderboardList.innerHTML = '<div class="muted">Server error while loading leaderboard.</div>';
      }
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    // Wire up start & leaderboards
    startBtn.addEventListener('click', startQuiz);
    submitScoreBtn.addEventListener('click', submitScore);
    viewLeaderboardBtn.addEventListener('click', ()=>{
      startScreen.classList.add('hidden');
      leaderboardScreen.classList.remove('hidden');
      loadLeaderboard();
    });
    viewLeaderboardBtn2.addEventListener('click', ()=>{
      resultScreen.classList.add('hidden');
      leaderboardScreen.classList.remove('hidden');
      loadLeaderboard();
    });
    backToStart.addEventListener('click', ()=>{
      leaderboardScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
    });

    // allow pressing Enter to submit name
    playerNameInput.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter'){ submitScore(); }
    });

    // Init
    (function init(){
      qTotalEl.textContent = Math.min(parseInt(numQuestionsSelect.value,10), QUESTIONS.length);
    })();

  }); // end DOMContentLoaded
})();
