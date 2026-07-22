if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif;">config.js が読み込めていません。</p>';
  throw new Error('Missing Supabase config');
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const elements = {
  statusMessage: document.getElementById('status-message'),
  setupHelp: document.getElementById('setup-help'),
  tabRegister: document.getElementById('tab-register'),
  tabQuiz: document.getElementById('tab-quiz'),
  registerSection: document.getElementById('register-section'),
  quizSection: document.getElementById('quiz-section'),
  formTitle: document.getElementById('form-title'),
  registerForm: document.getElementById('register-form'),
  editId: document.getElementById('edit-id'),
  registerBtn: document.getElementById('register-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  questionCount: document.getElementById('question-count'),
  questionList: document.getElementById('question-list'),
  emptyList: document.getElementById('empty-list'),
  quizCard: document.getElementById('quiz-card'),
  quizEmpty: document.getElementById('quiz-empty'),
  quizProgress: document.getElementById('quiz-progress'),
  quizBody: document.getElementById('quiz-body'),
  quizResult: document.getElementById('quiz-result'),
  nextBtn: document.getElementById('next-btn'),
  resetScoreBtn: document.getElementById('reset-score-btn'),
  score: document.getElementById('score'),
  accuracy: document.getElementById('accuracy'),
  choiceButtons: {
    A: document.getElementById('choice-btn-a'),
    B: document.getElementById('choice-btn-b'),
    C: document.getElementById('choice-btn-c'),
    D: document.getElementById('choice-btn-d'),
  },
  swipeFeedback: document.getElementById('swipe-feedback'),
};

const KEY_TO_CHOICE = {
  w: 'A',
  a: 'B',
  s: 'C',
  d: 'D',
};

const SWIPE_TO_CHOICE = {
  up: 'A',
  left: 'B',
  down: 'C',
  right: 'D',
};

const SWIPE_THRESHOLD = 48;

let questions = [];
let currentQuestion = null;
let previousQuestionId = null;
let answered = false;
let correctCount = 0;
let answeredCount = 0;
let isLoading = false;
let touchStartX = 0;
let touchStartY = 0;
let isQuizTabActive = false;

function showStatus(message, type = 'info') {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
}

function setLoading(loading) {
  isLoading = loading;
  elements.registerBtn.disabled = loading;
  elements.registerBtn.textContent = loading
    ? '処理中...'
    : elements.editId.value
      ? '更新する'
      : '登録する';
}

function switchTab(tabName) {
  const isRegister = tabName === 'register';
  isQuizTabActive = !isRegister;

  elements.tabRegister.classList.toggle('active', isRegister);
  elements.tabQuiz.classList.toggle('active', !isRegister);
  elements.registerSection.classList.toggle('active', isRegister);
  elements.quizSection.classList.toggle('active', !isRegister);

  if (!isRegister) {
    startQuiz();
  }
}

function isTypingInForm() {
  const active = document.activeElement;
  if (!active) {
    return false;
  }

  const tag = active.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active.isContentEditable;
}

function canAnswerQuiz() {
  return isQuizTabActive && currentQuestion && !answered && !elements.quizCard.classList.contains('hidden');
}

function flashChoiceButton(choice, className) {
  const button = elements.choiceButtons[choice];
  if (!button) {
    return;
  }

  button.classList.add(className);
  window.setTimeout(() => button.classList.remove(className), 180);
}

function submitChoice(choice, source = '') {
  if (!canAnswerQuiz()) {
    return;
  }

  if (source) {
    elements.swipeFeedback.textContent = `${source} → ${choice}`;
    flashChoiceButton(choice, source === 'キー' ? 'key-pressed' : 'swipe-pressed');
  }

  handleChoiceClick(choice);
}

function handleQuizKeydown(event) {
  if (!canAnswerQuiz() || isTypingInForm()) {
    if (answered && isQuizTabActive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (!elements.nextBtn.classList.contains('hidden')) {
        startQuiz();
      }
    }
    return;
  }

  const choice = KEY_TO_CHOICE[event.key.toLowerCase()];
  if (choice) {
    event.preventDefault();
    submitChoice(choice, 'キー');
    return;
  }

  const arrowMap = {
    ArrowUp: 'A',
    ArrowLeft: 'B',
    ArrowDown: 'C',
    ArrowRight: 'D',
  };

  if (arrowMap[event.key]) {
    event.preventDefault();
    submitChoice(arrowMap[event.key], 'キー');
  }
}

function handleTouchStart(event) {
  if (!canAnswerQuiz() || event.touches.length !== 1) {
    return;
  }

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  if (!canAnswerQuiz() || event.changedTouches.length !== 1) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
    return;
  }

  let direction = '';
  if (absX > absY) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'down' : 'up';
  }

  const choice = SWIPE_TO_CHOICE[direction];
  if (choice) {
    event.preventDefault();
    submitChoice(choice, 'スワイプ');
  }
}

function showConnectionHelp(show) {
  elements.setupHelp.classList.toggle('hidden', !show);
}

function getSupabaseErrorHint(error, action) {
  const message = error.message || '';
  const code = error.code || '';

  if (message.includes('row-level security') || code === '42501') {
    showConnectionHelp(true);
    return `${action}に失敗: データベースの権限設定です。Supabase → SQL Editor で data/supabase_fix.sql を実行してください。`;
  }

  if (message.includes('JWT') || message.includes('Invalid API key') || code === '401' || code === 'PGRST301') {
    showConnectionHelp(true);
    return `${action}に失敗: APIキーが正しくありません。Legacy anon キー（eyJ...）を config.js に設定してください。`;
  }

  return `${action}に失敗しました: ${message}`;
}

function validatePayload(payload) {
  const fields = [
    ['body', '問題文'],
    ['choice_a', '選択肢A'],
    ['choice_b', '選択肢B'],
    ['choice_c', '選択肢C'],
    ['choice_d', '選択肢D'],
  ];

  for (const [key, label] of fields) {
    if (!payload[key]) {
      showStatus(`${label}を入力してください。`, 'error');
      return false;
    }
  }

  if (!payload.correct) {
    showStatus('正解を選んでください。', 'error');
    return false;
  }

  return true;
}

function truncate(text, length = 60) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function getFormPayload() {
  const formData = new FormData(elements.registerForm);
  return {
    body: formData.get('body').trim(),
    choice_a: formData.get('choice_a').trim(),
    choice_b: formData.get('choice_b').trim(),
    choice_c: formData.get('choice_c').trim(),
    choice_d: formData.get('choice_d').trim(),
    correct: formData.get('correct'),
  };
}

function resetFormMode() {
  elements.editId.value = '';
  elements.formTitle.textContent = '問題を登録';
  elements.registerBtn.textContent = '登録する';
  elements.cancelEditBtn.classList.add('hidden');
  elements.registerForm.reset();
}

function startEdit(question) {
  elements.editId.value = question.id;
  elements.formTitle.textContent = '問題を編集';
  elements.registerBtn.textContent = '更新する';
  elements.cancelEditBtn.classList.remove('hidden');

  elements.registerForm.body.value = question.body;
  elements.registerForm.choice_a.value = question.choice_a;
  elements.registerForm.choice_b.value = question.choice_b;
  elements.registerForm.choice_c.value = question.choice_c;
  elements.registerForm.choice_d.value = question.choice_d;

  const correctInput = elements.registerForm.querySelector(`input[name="correct"][value="${question.correct}"]`);
  if (correctInput) {
    correctInput.checked = true;
  }

  switchTab('register');
  elements.registerForm.body.focus();
  showStatus('編集モードです。内容を直して「更新する」を押してください。', 'info');
}

async function loadQuestions() {
  setLoading(true);
  showStatus('問題を読み込み中...', 'info');

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  setLoading(false);

  if (error) {
    showConnectionHelp(true);
    showStatus(getSupabaseErrorHint(error, '問題の取得'), 'error');
    return;
  }

  showConnectionHelp(false);
  questions = data || [];
  renderQuestionList();
  updateQuizAvailability();
  showStatus(questions.length > 0 ? `${questions.length} 問を読み込みました。` : '', 'info');
}

function renderQuestionList() {
  elements.questionList.innerHTML = '';
  elements.emptyList.classList.toggle('hidden', questions.length > 0);
  elements.questionCount.textContent = `${questions.length} 問`;

  questions.forEach((question) => {
    const item = document.createElement('li');
    item.className = 'question-item';

    const content = document.createElement('div');
    content.className = 'question-content';

    const text = document.createElement('p');
    text.className = 'question-text';
    text.textContent = truncate(question.body);

    const meta = document.createElement('p');
    meta.className = 'question-meta';
    meta.textContent = `正解: ${question.correct}`;

    content.appendChild(text);
    content.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'question-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-secondary';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => startEdit(question));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteQuestion(question.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(content);
    item.appendChild(actions);
    elements.questionList.appendChild(item);
  });
}

async function saveQuestion(event) {
  event.preventDefault();
  if (isLoading) {
    return;
  }

  const payload = getFormPayload();
  if (!validatePayload(payload)) {
    return;
  }

  const editId = elements.editId.value;
  setLoading(true);

  const request = editId
    ? supabase.from('questions').update(payload).eq('id', editId).select()
    : supabase.from('questions').insert(payload).select();

  const { data, error } = await request;
  setLoading(false);

  if (error) {
    console.error('Supabase error:', error);
    showStatus(getSupabaseErrorHint(error, editId ? '更新' : '登録'), 'error');
    return;
  }

  if (!data || data.length === 0) {
    showStatus('登録は成功したかもしれませんが、データを確認できませんでした。Supabase の権限設定を見直してください。', 'error');
    return;
  }

  resetFormMode();
  showStatus(editId ? '問題を更新しました。' : '問題を登録しました。', 'success');
  await loadQuestions();
}

async function deleteQuestion(id) {
  if (!window.confirm('この問題を削除しますか？')) {
    return;
  }

  const { error } = await supabase.from('questions').delete().eq('id', id);

  if (error) {
    showStatus(getSupabaseErrorHint(error, '削除'), 'error');
    return;
  }

  if (elements.editId.value === id) {
    resetFormMode();
  }

  showStatus('問題を削除しました。', 'success');
  await loadQuestions();
}

function updateQuizAvailability() {
  const hasQuestions = questions.length > 0;
  elements.quizEmpty.classList.toggle('hidden', hasQuestions);
  elements.quizCard.classList.toggle('hidden', !hasQuestions);
  elements.quizProgress.textContent = `全 ${questions.length} 問からランダム出題`;
}

function pickRandomQuestion() {
  if (questions.length === 0) {
    return null;
  }

  if (questions.length === 1) {
    return questions[0];
  }

  let nextQuestion = questions[0];
  let attempts = 0;

  do {
    const index = Math.floor(Math.random() * questions.length);
    nextQuestion = questions[index];
    attempts += 1;
  } while (nextQuestion.id === previousQuestionId && attempts < 10);

  return nextQuestion;
}

function setChoiceButtonLabels(question) {
  const labels = {
    A: question.choice_a,
    B: question.choice_b,
    C: question.choice_c,
    D: question.choice_d,
  };

  Object.entries(elements.choiceButtons).forEach(([key, button]) => {
    button.textContent = `${key}. ${labels[key]}`;
    button.disabled = false;
    button.classList.remove('correct', 'incorrect');
  });
}

function startQuiz() {
  if (questions.length === 0) {
    updateQuizAvailability();
    return;
  }

  currentQuestion = pickRandomQuestion();
  previousQuestionId = currentQuestion.id;
  answered = false;

  elements.quizBody.textContent = currentQuestion.body;
  elements.quizResult.textContent = '';
  elements.quizResult.className = 'quiz-result';
  elements.swipeFeedback.textContent = '';
  elements.nextBtn.classList.add('hidden');
  setChoiceButtonLabels(currentQuestion);
  updateScore();
}

function updateScore() {
  elements.score.textContent = `スコア: ${correctCount} / ${answeredCount}`;

  if (answeredCount === 0) {
    elements.accuracy.textContent = '正答率: -';
    return;
  }

  const rate = Math.round((correctCount / answeredCount) * 100);
  elements.accuracy.textContent = `正答率: ${rate}%`;
}

function resetScore() {
  correctCount = 0;
  answeredCount = 0;
  updateScore();
  showStatus('スコアをリセットしました。', 'info');
  startQuiz();
}

function handleChoiceClick(choice) {
  if (!currentQuestion || answered) {
    return;
  }

  answered = true;
  answeredCount += 1;

  const isCorrect = choice === currentQuestion.correct;
  if (isCorrect) {
    correctCount += 1;
  }

  Object.entries(elements.choiceButtons).forEach(([key, button]) => {
    button.disabled = true;
    if (key === currentQuestion.correct) {
      button.classList.add('correct');
    } else if (key === choice) {
      button.classList.add('incorrect');
    }
  });

  elements.quizResult.textContent = isCorrect
    ? '正解！'
    : `不正解。正解は ${currentQuestion.correct}. ${currentQuestion[`choice_${currentQuestion.correct.toLowerCase()}`]} です。`;
  elements.quizResult.className = `quiz-result ${isCorrect ? 'correct' : 'incorrect'}`;
  elements.nextBtn.classList.remove('hidden');
  updateScore();
}

elements.tabRegister.addEventListener('click', () => switchTab('register'));
elements.tabQuiz.addEventListener('click', () => switchTab('quiz'));
elements.registerForm.addEventListener('submit', saveQuestion);
elements.cancelEditBtn.addEventListener('click', () => {
  resetFormMode();
  showStatus('編集をキャンセルしました。', 'info');
});
elements.nextBtn.addEventListener('click', startQuiz);
elements.resetScoreBtn.addEventListener('click', resetScore);

Object.entries(elements.choiceButtons).forEach(([choice, button]) => {
  button.addEventListener('click', () => handleChoiceClick(choice));
});

document.addEventListener('keydown', handleQuizKeydown);
elements.quizCard.addEventListener('touchstart', handleTouchStart, { passive: true });
elements.quizCard.addEventListener('touchend', handleTouchEnd, { passive: false });

loadQuestions();
