const LOCAL_STORAGE_KEY = 'itpass_questions_v1';
const SAMPLE_QUESTIONS = [
  {
    body: 'コンピュータのCPUの主な役割として正しいものはどれか。',
    choice_a: '演算と制御',
    choice_b: 'データの永続保存',
    choice_c: 'ネットワーク接続のみ',
    choice_d: '表示出力のみ',
    correct: 'A',
  },
  {
    body: 'OS（オペレーティングシステム）の説明として適切なものはどれか。',
    choice_a: 'ハードウェアを直接制御する基本ソフト',
    choice_b: '表計算を行うアプリ',
    choice_c: 'Webページを表示するブラウザ',
    choice_d: 'ウイルスを検出するソフト',
    correct: 'A',
  },
  {
    body: 'クラウドコンピューティングの特徴として正しいものはどれか。',
    choice_a: 'インターネット経由でITリソースを利用できる',
    choice_b: '必ずオンプレミスのみで運用する',
    choice_c: '利用料金は常に無料である',
    choice_d: 'オフライン専用である',
    correct: 'A',
  },
  {
    body: '個人情報保護法における個人情報の定義として正しいものはどれか。',
    choice_a: '企業の売上高に関する情報',
    choice_b: '公開されている統計データ',
    choice_c: '生存する個人に関する情報で特定の個人を識別できるもの',
    choice_d: '匿名化された集計データのみ',
    correct: 'C',
  },
  {
    body: 'プロジェクトマネジメントにおけるWBSの説明として適切なものはどれか。',
    choice_a: 'リスクを一覧化したもの',
    choice_b: '作業を階層的に分解したもの',
    choice_c: '品質基準を定めたもの',
    choice_d: 'コミュニケーション計画書',
    correct: 'B',
  },
];

let useLocalStore = false;
let supabase = null;

const hasConfig =
  typeof SUPABASE_URL !== 'undefined' &&
  typeof SUPABASE_ANON_KEY !== 'undefined' &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !String(SUPABASE_URL).includes('your-project-id');

if (hasConfig) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  useLocalStore = true;
}

function createLocalId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalQuestions() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeLocalQuestions(list) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

function seedLocalQuestions() {
  const seeded = SAMPLE_QUESTIONS.map((item) => ({
    ...item,
    id: createLocalId(),
    created_at: new Date().toISOString(),
  }));
  writeLocalQuestions(seeded);
  return seeded;
}

function enableLocalMode(reason) {
  useLocalStore = true;
  showConnectionHelp(false);
  if (reason) {
    showStatus(`${reason} ローカル保存モードで続行します。`, 'info');
  }
}

const elements = {
  statusMessage: document.getElementById('status-message'),
  setupHelp: document.getElementById('setup-help'),
  tabRegister: document.getElementById('tab-register'),
  tabAi: document.getElementById('tab-ai'),
  tabQuiz: document.getElementById('tab-quiz'),
  registerSection: document.getElementById('register-section'),
  aiSection: document.getElementById('ai-section'),
  quizSection: document.getElementById('quiz-section'),
  formTitle: document.getElementById('form-title'),
  registerForm: document.getElementById('register-form'),
  editId: document.getElementById('edit-id'),
  registerBtn: document.getElementById('register-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  questionCount: document.getElementById('question-count'),
  questionList: document.getElementById('question-list'),
  emptyList: document.getElementById('empty-list'),
  aiKeywords: document.getElementById('ai-keywords'),
  aiReference: document.getElementById('ai-reference'),
  aiCount: document.getElementById('ai-count'),
  aiGenerateBtn: document.getElementById('ai-generate-btn'),
  aiCopyPromptBtn: document.getElementById('ai-copy-prompt-btn'),
  aiJson: document.getElementById('ai-json'),
  aiImportBtn: document.getElementById('ai-import-btn'),
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
  elements.aiGenerateBtn.disabled = loading;
  elements.aiImportBtn.disabled = loading;
  elements.aiGenerateBtn.textContent = loading ? '処理中...' : '自動生成する';
  elements.aiImportBtn.textContent = loading ? '処理中...' : '一括登録する';
}

function switchTab(tabName) {
  const isRegister = tabName === 'register';
  const isAi = tabName === 'ai';
  const isQuiz = tabName === 'quiz';
  isQuizTabActive = isQuiz;

  elements.tabRegister.classList.toggle('active', isRegister);
  elements.tabAi.classList.toggle('active', isAi);
  elements.tabQuiz.classList.toggle('active', isQuiz);
  elements.registerSection.classList.toggle('active', isRegister);
  elements.aiSection.classList.toggle('active', isAi);
  elements.quizSection.classList.toggle('active', isQuiz);

  if (isQuiz) {
    startQuiz();
  }
}

function warnIfPublishableKey() {
  if (
    !useLocalStore &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.startsWith('sb_publishable_')
  ) {
    showConnectionHelp(true);
    showStatus(
      'Publishable キーが設定されています。接続できない場合はローカル保存に切り替わります。',
      'info'
    );
  }
}

function buildAiPrompt() {
  const keywords = elements.aiKeywords.value.trim() || 'ITパスポート全般';
  const reference = elements.aiReference.value.trim();
  const count = Number(elements.aiCount.value) || 5;

  return [
    'あなたはITパスポート試験の問題作成者です。',
    `次のキーワードに沿った、オリジナルの四択問題を ${count} 問作成してください。`,
    `キーワード: ${keywords}`,
    reference ? `参考文:\n${reference}` : '',
    '条件:',
    '- 著作権のある過去問の丸写しはしない',
    '- 各問題は body / choice_a / choice_b / choice_c / choice_d / correct を持つ',
    '- correct は "A" "B" "C" "D" のいずれか',
    '- 出力は JSON 配列のみ（説明文やコードフェンスは付けない）',
    '例: [{"body":"...","choice_a":"...","choice_b":"...","choice_c":"...","choice_d":"...","correct":"A"}]',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseAiQuestions(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error('JSON が空です。');
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (firstError) {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error('JSON 配列として読めません。');
    }
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('1件以上の問題配列が必要です。');
  }

  const normalized = parsed.map((item, index) => {
    const payload = {
      body: String(item.body || '').trim(),
      choice_a: String(item.choice_a || '').trim(),
      choice_b: String(item.choice_b || '').trim(),
      choice_c: String(item.choice_c || '').trim(),
      choice_d: String(item.choice_d || '').trim(),
      correct: String(item.correct || '').trim().toUpperCase(),
    };

    if (!payload.body || !payload.choice_a || !payload.choice_b || !payload.choice_c || !payload.choice_d) {
      throw new Error(`${index + 1} 問目の項目が不足しています。`);
    }

    if (!['A', 'B', 'C', 'D'].includes(payload.correct)) {
      throw new Error(`${index + 1} 問目の correct は A/B/C/D にしてください。`);
    }

    return payload;
  });

  return normalized;
}

async function copyAiPrompt() {
  const prompt = buildAiPrompt();
  try {
    await navigator.clipboard.writeText(prompt);
    showStatus('プロンプトをコピーしました。ChatGPT などに貼って JSON を受け取ってください。', 'success');
  } catch (error) {
    elements.aiJson.value = prompt;
    showStatus('クリップボードにコピーできませんでした。下の欄にプロンプトを表示しました。', 'info');
  }
}

async function generateQuestionsWithAi() {
  if (isLoading) {
    return;
  }

  setLoading(true);
  showStatus('AIで問題を生成中...', 'info');

  try {
    const response = await fetch('/.netlify/functions/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: elements.aiKeywords.value.trim(),
        reference: elements.aiReference.value.trim(),
        count: Number(elements.aiCount.value) || 5,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `自動生成に失敗しました（${response.status}）`);
    }

    const questionsJson = Array.isArray(result.questions)
      ? JSON.stringify(result.questions, null, 2)
      : String(result.raw || '');

    elements.aiJson.value = questionsJson;
    showStatus('問題を生成しました。内容を確認して「一括登録する」を押してください。', 'success');
  } catch (error) {
    console.error(error);
    showStatus(
      `${error.message} — 「プロンプトをコピー」で手動生成もできます。`,
      'error'
    );
  } finally {
    setLoading(false);
  }
}

async function importAiQuestions() {
  if (isLoading) {
    return;
  }

  let payloads;
  try {
    payloads = parseAiQuestions(elements.aiJson.value);
  } catch (error) {
    showStatus(`JSONの読み取りに失敗: ${error.message}`, 'error');
    return;
  }

  setLoading(true);
  showStatus(`${payloads.length} 問を登録中...`, 'info');

  if (useLocalStore || !supabase) {
    const list = readLocalQuestions() || [];
    const now = new Date().toISOString();
    const inserted = payloads.map((payload) => ({
      ...payload,
      id: createLocalId(),
      created_at: now,
    }));
    writeLocalQuestions([...inserted, ...list]);
    setLoading(false);
    elements.aiJson.value = '';
    showStatus(`${inserted.length} 問を一括登録しました（ローカル）。`, 'success');
    await loadQuestions();
    return;
  }

  const { data, error } = await supabase.from('questions').insert(payloads).select();
  setLoading(false);

  if (error) {
    showStatus(getSupabaseErrorHint(error, '一括登録'), 'error');
    return;
  }

  elements.aiJson.value = '';
  showStatus(`${(data || payloads).length} 問を一括登録しました。`, 'success');
  await loadQuestions();
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

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    showConnectionHelp(true);
    return `${action}に失敗: ネットワークまたはAPIキーを確認してください。Legacy anon キー（eyJ...）を config.js に設定してください。`;
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

  if (!useLocalStore && supabase) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setLoading(false);
        showConnectionHelp(false);
        questions = data || [];
        renderQuestionList();
        updateQuizAvailability();
        showStatus(questions.length > 0 ? `${questions.length} 問を読み込みました。` : '', 'info');
        return;
      }

      enableLocalMode(getSupabaseErrorHint(error, '問題の取得'));
    } catch (error) {
      enableLocalMode(getSupabaseErrorHint(error, '問題の取得'));
    }
  }

  let local = readLocalQuestions();
  if (!local) {
    local = seedLocalQuestions();
  }

  setLoading(false);
  questions = local;
  renderQuestionList();
  updateQuizAvailability();
  showStatus(
    useLocalStore
      ? `${questions.length} 問を読み込みました（ローカル保存）。`
      : questions.length > 0
        ? `${questions.length} 問を読み込みました。`
        : '',
    'info'
  );
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

  if (useLocalStore || !supabase) {
    const list = readLocalQuestions() || [];
    if (editId) {
      const index = list.findIndex((item) => item.id === editId);
      if (index >= 0) {
        list[index] = { ...list[index], ...payload };
      }
    } else {
      list.unshift({
        ...payload,
        id: createLocalId(),
        created_at: new Date().toISOString(),
      });
    }
    writeLocalQuestions(list);
    setLoading(false);
    resetFormMode();
    showStatus(editId ? '問題を更新しました（ローカル）。' : '問題を登録しました（ローカル）。', 'success');
    await loadQuestions();
    return;
  }

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

  if (useLocalStore || !supabase) {
    const list = (readLocalQuestions() || []).filter((item) => item.id !== id);
    writeLocalQuestions(list);
    if (elements.editId.value === id) {
      resetFormMode();
    }
    showStatus('問題を削除しました（ローカル）。', 'success');
    await loadQuestions();
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
elements.tabAi.addEventListener('click', () => switchTab('ai'));
elements.tabQuiz.addEventListener('click', () => switchTab('quiz'));
elements.registerForm.addEventListener('submit', saveQuestion);
elements.cancelEditBtn.addEventListener('click', () => {
  resetFormMode();
  showStatus('編集をキャンセルしました。', 'info');
});
elements.aiGenerateBtn.addEventListener('click', generateQuestionsWithAi);
elements.aiCopyPromptBtn.addEventListener('click', copyAiPrompt);
elements.aiImportBtn.addEventListener('click', importAiQuestions);
elements.nextBtn.addEventListener('click', startQuiz);
elements.resetScoreBtn.addEventListener('click', resetScore);

Object.entries(elements.choiceButtons).forEach(([choice, button]) => {
  button.addEventListener('click', () => handleChoiceClick(choice));
});

document.addEventListener('keydown', handleQuizKeydown);
elements.quizCard.addEventListener('touchstart', handleTouchStart, { passive: true });
elements.quizCard.addEventListener('touchend', handleTouchEnd, { passive: false });

warnIfPublishableKey();
loadQuestions();
