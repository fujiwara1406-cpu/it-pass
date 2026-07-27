const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function buildPrompt({ keywords, reference, count }) {
  const topic = (keywords || '').trim() || 'ITパスポート全般';
  const note = (reference || '').trim();
  const n = Math.min(Math.max(Number(count) || 5, 1), 10);

  return [
    'あなたはITパスポート試験の問題作成者です。',
    `次のキーワードに沿った、オリジナルの四択問題を ${n} 問作成してください。`,
    `キーワード: ${topic}`,
    note ? `参考文:\n${note}` : '',
    '条件:',
    '- 著作権のある過去問の丸写しはしない',
    '- 各問題は body / choice_a / choice_b / choice_c / choice_d / correct を持つ',
    '- correct は "A" "B" "C" "D" のいずれか',
    '- 出力は JSON 配列のみ（説明文やコードフェンスは付けない）',
  ]
    .filter(Boolean)
    .join('\n');
}

function extractJsonArray(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error('AIの応答から JSON 配列を取り出せませんでした。');
    }
    return JSON.parse(match[0]);
  }
}

function normalizeQuestions(parsed) {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('問題が1件も生成されませんでした。');
  }

  return parsed.map((item, index) => {
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
      throw new Error(`${index + 1} 問目の correct が不正です。`);
    }

    return payload;
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'POST のみ対応しています。' }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'OPENAI_API_KEY が未設定です。Netlify の環境変数を設定するか、プロンプトコピーで手動生成してください。',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_error) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'リクエスト本文が不正です。' }),
    };
  }

  try {
    const prompt = buildPrompt(body);
    const openaiResponse = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You create IT Passport style multiple-choice questions. Reply with JSON array only.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const openaiJson = await openaiResponse.json();
    if (!openaiResponse.ok) {
      const message = openaiJson.error?.message || `OpenAI API error (${openaiResponse.status})`;
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({ error: message }),
      };
    }

    const raw = openaiJson.choices?.[0]?.message?.content || '';
    const questions = normalizeQuestions(extractJsonArray(raw));

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ questions, raw }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message || '生成に失敗しました。' }),
    };
  }
};
