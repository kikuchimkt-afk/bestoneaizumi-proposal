// 全て標準JavaScriptで記述（SDK非依存）
// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const setupPanel = document.getElementById('setup-panel');
const questionsPanel = document.getElementById('questions-panel');
const previewPanel = document.getElementById('preview-panel');
const dynamicForm = document.getElementById('dynamic-form');
// const loading = document.getElementById('loading'); // エラー回避のため動的に取得

const startQuestionsBtn = document.getElementById('startQuestionsBtn');
const backToSetupBtn = document.getElementById('backToSetupBtn');
const generateBtn = document.getElementById('generateBtn');
const generateDetailedBtn = document.getElementById('generateDetailedBtn');
const backToQuestionsBtn = document.getElementById('backToQuestionsBtn');
const printBtn = document.getElementById('printBtn');
const logoUpload = document.getElementById('logoUpload');
const pdfList = document.getElementById('pdf-list');
let logoDataUrl = '';

// --- 徳島県高校入試特化型情報 (フライヤー等のナレッジ完全版) ---
const TOKUSHIMA_CONTEXT = `
【最重要: 徳島県高校入試・基礎学力テストの「3つの壁」】
1. **「300点の分水嶺」 (The Watershed)**:
   - 基礎学300点未満は「基礎知識の欠落（穴の開いたバケツ）」状態。演習量を単に増やすだけでは伸びない。
   - まず「基礎学300点」を超えない限り、普通科上位校の合格確率は極めて低い。
   - 戦略: 「戦略グループ講座」による頻出パターンの機械的反復と完全暗記で、基礎固めゾーンを脱出する。

2. **「320点の安全圏」 (Safety Zone)**:
   - **徳島北(普通)・城南・市立・城北** の実質的な合格最低ライン。
   - 一発勝負の入試で心を安定させるのは「過去の成功体験（基礎学320点）」のみ。

3. **「380点の未来」 (Target Line for Future)**:
   - 高校入学後に学年中央以上をキープし、**国公立大学**を目指すための必須ライン。
   - **城東高校**ボーダーは430点（通知表All5に近い130必要）。英数の爆発力と理社の満点力が必須。

【英語ショックと「中1の壁」の正体】
- **質と量の激変**: 習得単語数が親世代の1,200語から**2,500語**へ倍増。
- **Unit 1の断絶**: 旧教科書の "Start slowly" ではなく、最初から "Full throttle" でbe動詞・一般動詞・助動詞が混在する。
- **フタコブラクダ化**: 90点層と30点層に二極化し、中間層が消滅している。「中1のUnit 1」で躓くと修復困難。
- **対策**: 小学校英語（600語）の貯金が前提。中2終わりまでに**英検準2級**（高校中級レベル）を取得し、英語を得点源にする「逃げ切り戦略」が唯一の解。

【具体的合格戦略ロードマップ】
- **中1**: 算数気分からの脱却。定期テスト450点必達。英検4級取得。
- **中2**: **最重要期 (Turning Point)**。英検準2級取得。部活が忙しくても学習時間をゼロにしない。
- **中3**: 基礎学力テスト（10月・11月・1月）対策に全振り。理社は「暗記マラソン」で直前+20点を狙う。

【当校独自の解決策 (Hybrid Strategy & Tools)】
1. **プレミアム個別指導 (1:2)**:
   - 対象: 380点以上・城東/徳島北上位狙い。
   - 役割: 数英理の「ボトルネック特定」と「応用力強化」。講師固定制で伴走。

2. **戦略グループ講座 (週1回)**:
   - 対象: 300点突破～320点狙い。
   - 役割: 「5教科指導」の非効率性を排除し、暗記・頻出パターンを「集団の力」で強制ペースメイク。

3. **独自開発アプリ (The 4 Apps)**:
   - **APP01 基礎学最前線**: 過去問・他県傾向分析AI。
   - **APP02 中学理社攻略**: 隙間時間の知識総点検。
   - **APP03 英検大問1徹底攻略**: 過去10年分完全収録。準2級最短合格への切り札。
   - **APP04 中学英単語マスター**: 重要度別Tier分類で「読めない単語」をゼロにする。

【高校別・必須スコア目安 (基礎学)】
- **城東**: 430点 (通知表130/All5) - 英数爆発力
- **城南**: 400点 (通知表120) - 応用と内申バランス
- **徳島北**: 380点 (通知表115) - 基礎取りこぼし厳禁
- **市立**: 350点
- **城北**: 320点

この情報を踏まえ、AIは単なる学習塾ではなく「徳島の入試戦略家」として振る舞ってください。
`;

// State
let state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    school: 'aizumi',
    studentType: 'new',
    answers: {}
};

// Config
const SUBJECTS = ['英語', '数学', '国語', '理科', '社会'];
const COURSE_TYPES = ['個別指導(1:2)', 'グループ指導'];
const FREQUENCIES = ['週1回', '週2回', '週3回', '週4回', '週5回', '週6回'];

// Checkbox Options (20+ items each)
const STUDENT_TRAITS = [
    '家で全く勉強しない', '勉強のやり方がわからない', 'やる気はあるが行動が伴わない',
    '集中力が続かない', 'スマホ・ゲーム時間が長い', '部活が忙しい', '習い事と両立したい',
    'ケアレスミスが多い', '基礎基本が抜けている', '応用問題が苦手', 'テスト本番に弱い',
    '文章題・記述問題が苦手', '英語の単語が覚えられない', '計算が遅い・間違える',
    '国語の読解力が課題', '理社の暗記が苦手', '学校の授業についていけない',
    '平均点は取れているがもっと伸ばしたい', '上位校を目指したい', '自分のペースで進めたい',
    '質問するのが苦手・内気', '真面目でコツコツ取り組める', '負けず嫌い'
];

const CURRICULUM_NOTES = [
    '学校の予習中心で進めたい', '学校の復習・補習メインで', '定期テスト対策を最優先',
    '前学年の内容から戻って復習', '苦手単元を集中的に潰す', '得意教科をさらに伸ばす（武器にする）',
    '応用・発展問題にチャレンジ', '英検・漢検対策も組み込む', '宿題は多めに出してほしい',
    '宿題は少なめで（無理なく）', '部活引退まではペースを落とす', '早めに受験カリキュラムに入りたい',
    '内申点アップ（提出物管理など）もケア', '自習室の利用を促す', '勉強習慣の定着からスタート',
    '基礎学力テスト（実力テスト）対策重視', '志望校の過去問対策', 'まずは1教科から様子見',
    '5教科バランスよく対策', '理社はグループ指導で効率よく', '英語・数学は個別でじっくり'
];

const IMPRESSION_OPTIONS = [
    '', '得意・好き', '苦手・嫌い', '普通', 'やればできる（伸びしろ有）', '基礎から不安', '応用力が課題', '得点源にしたい'
];

// Strategy Options (Default)
const DEFAULT_STRATEGIES = [
    '基礎徹底（平均点狙い・苦手克服）',
    '標準強化（入試レベル・内申点確保）',
    '応用・発展（得点源にする・難関校対策）',
    '現状維持（学校進度フォロー・自習メイン）'
];

// Storage Keys
// Storage Keys
const KEY_CUSTOM_TRAITS = 'custom_traits';
const KEY_CUSTOM_NOTES = 'custom_notes';
const KEY_CUSTOM_STRATEGIES = 'custom_strategies';
const KEY_CUSTOM_IMPRESSIONS = 'custom_impressions';
const KEY_APP_STATE = 'proposal_app_state_v2'; // Answers

const QUESTION_SETS = {
    new: [
        { id: 'student_name', label: '生徒名（様なし）', type: 'text', placeholder: '例：徳島 太郎' },
        { id: 'grade', label: '学年', type: 'select', options: ['中学1年生', '中学2年生', '中学3年生'] },

        // --- ギャップ分析用データ (横並び) ---
        {
            type: 'row',
            id: 'gap_analysis_row',
            fields: [
                { id: 'target_school', label: '志望校', type: 'text', placeholder: '例：城東高校' },
                { id: 'target_score_basic', label: '【目標】志望校ボーダー（5科合計）', type: 'number', placeholder: '例: 350' }
            ]
        },
        //ADDED: Exam Date Info
        {
            type: 'row',
            id: 'exam_info',
            fields: [
                { id: 'exam_year', label: '受験予定年(西暦)', type: 'number', placeholder: new Date().getFullYear() + 1 },
                { id: 'exam_month', label: '受験月', type: 'select', options: ['3月(一般)', '2月(推薦/私立)', '1月(中学受験/高専)'] }
            ]
        },
        { id: 'current_score_test', label: '【現在】実力テストor基礎学力テスト（5科）', type: 'test_score_5' },


        { id: 'subject_strategies', label: '教科別指導方針 & 本人の印象', type: 'strategy_selector' },

        // --- 生徒の特徴・悩み (選択式) ---
        { id: 'current_issues_checks', label: '生徒の特徴・性格・悩み', type: 'checkbox_group', options: STUDENT_TRAITS, storageKey: KEY_CUSTOM_TRAITS },
        { id: 'current_issues', label: 'その他 気になる点（自由記述）', type: 'textarea', placeholder: '上記にない悩みや補足事項があれば...' },

        // --- 提案コース ---
        { id: 'proposal_courses', label: '提案コース作成', type: 'proposal_builder' },

        // --- 特記事項・カリキュラム (選択式) ---
        { id: 'plan_curriculum_checks', label: '特記事項・カリキュラム要望', type: 'checkbox_group', options: CURRICULUM_NOTES, storageKey: KEY_CUSTOM_NOTES },
        { id: 'plan_curriculum', label: 'その他 要望詳細（自由記述）', type: 'textarea' }
    ],
    current: [
        { id: 'student_name', label: '生徒名（様なし）', type: 'text', placeholder: '例：徳島 太郎' },
        { id: 'grade', label: '学年', type: 'select', options: ['中学1年生', '中学2年生', '中学3年生'] },

        // --- ギャップ分析用データ (横並び) ---
        {
            type: 'row',
            id: 'gap_analysis_row',
            fields: [
                { id: 'target_school', label: '志望校', type: 'text', placeholder: '例：城東高校' },
                { id: 'target_score_basic', label: '【目標】志望校ボーダー（5科合計）', type: 'number', placeholder: '例: 350' }
            ]
        },
        {
            type: 'row',
            id: 'exam_info',
            fields: [
                { id: 'exam_year', label: '受験予定年(西暦)', type: 'number', placeholder: new Date().getFullYear() + 1 },
                { id: 'exam_month', label: '受験月', type: 'select', options: ['3月(一般)', '2月(推薦/私立)', '1月(中学受験/高専)'] }
            ]
        },
        { id: 'current_score_test', label: '【現在】実力テストor基礎学力テスト（5科）', type: 'test_score_5' },

        { id: 'subject_strategies', label: '教科別指導方針 & 本人の印象', type: 'strategy_selector' },

        { id: 'current_issues_checks', label: '生徒の特徴・性格・悩み', type: 'checkbox_group', options: STUDENT_TRAITS, storageKey: KEY_CUSTOM_TRAITS },
        { id: 'current_issues', label: 'その他（記述）', type: 'textarea' },

        { id: 'proposal_courses', label: '追加・変更提案コース作成', type: 'proposal_builder' },

        { id: 'plan_curriculum_checks', label: '特記事項・要望', type: 'checkbox_group', options: CURRICULUM_NOTES, storageKey: KEY_CUSTOM_NOTES },
        { id: 'plan_curriculum', label: 'その他（記述）', type: 'textarea' }
    ],
    english: [
        { id: 'student_name', label: '受講生名', type: 'text' },
        { id: 'purpose', label: '受講目的', type: 'textarea' },
        { id: 'level', label: '現在のレベル', type: 'text' },
        { id: 'proposal_courses', label: '提案コース', type: 'proposal_builder' }
    ]
};

// Initialize
if (state.apiKey) {
    apiKeyInput.value = state.apiKey;
}

// Load PDF List (Static)
if (typeof PDF_FILES !== 'undefined' && pdfList) {
    pdfList.innerHTML = '';
    if (PDF_FILES.length === 0) {
        pdfList.innerHTML = '<span style="font-size:0.8rem; color:#888;">PDFファイルが登録されていません。<br>pdfフォルダにファイルを追加し、update_pdf_list.batを実行してください。</span>';
    } else {
        PDF_FILES.forEach(fileName => {
            const btn = document.createElement('button');
            btn.className = 'pdf-link-btn';
            btn.type = 'button';
            btn.textContent = '📄 ' + fileName;
            btn.onclick = () => {
                // Open file relative to index.html (in pdf folder)
                window.open('pdf/' + fileName, '_blank');
            };
            pdfList.appendChild(btn);
        });
    }
}

// Load Saved Answers
const savedState = localStorage.getItem(KEY_APP_STATE);
if (savedState) {
    try {
        state.answers = JSON.parse(savedState);
    } catch (e) {
        console.error('Failed to load saved state', e);
    }
}

// Event Listeners
const flyerInput = document.getElementById('flyerDirInput');
// const pdfList = document.getElementById('pdf-list'); // Moved to top

if (flyerInput) {
    flyerInput.addEventListener('change', (e) => {
        pdfList.innerHTML = '';
        const files = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.pdf'));

        if (files.length === 0) {
            pdfList.innerHTML = '<span style="font-size:0.85rem; color:#888;">PDFファイルが見つかりませんでした</span>';
            return;
        }

        // Sort alphabetically
        files.sort((a, b) => a.name.localeCompare(b.name));

        files.forEach(file => {
            const btn = document.createElement('button');
            btn.className = 'pdf-link-btn';
            btn.type = 'button';
            btn.textContent = '📄 ' + file.name;
            btn.onclick = () => {
                const url = URL.createObjectURL(file);
                window.open(url, '_blank');
            };
            pdfList.appendChild(btn);
        });
    });
}

const clearAllBtn = document.getElementById('clearAllBtn');
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        if (confirm('入力内容を全て消去しますか？\n（この操作は取り消せません）')) {
            state.answers = {};
            localStorage.removeItem(KEY_APP_STATE);
            renderQuestions(); // Re-render empty form
        }
    });
}

// Auto-Save Trigger
dynamicForm.addEventListener('change', () => {
    collectFormData();
    localStorage.setItem(KEY_APP_STATE, JSON.stringify(state.answers));
});
dynamicForm.addEventListener('input', () => {
    // Debounce minimal implementation
    if (window.saveTimeout) clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
        collectFormData();
        localStorage.setItem(KEY_APP_STATE, JSON.stringify(state.answers));
    }, 1000);
});

// Logo Selection Logic
const logoSelect = document.getElementById('logoSelect');
if (typeof LOGO_FILES !== 'undefined' && logoSelect) {
    LOGO_FILES.forEach(file => {
        const opt = document.createElement('option');
        opt.value = 'logo/' + file;
        opt.textContent = file;
        logoSelect.appendChild(opt);
    });

    logoSelect.addEventListener('change', async (e) => {
        if (e.target.value) {
            try {
                // Fetch and convert to Data URL to ensure it works in new window/about:blank
                const response = await fetch(e.target.value);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    logoDataUrl = reader.result;
                    if (logoUpload) logoUpload.value = ''; // Clear file input
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error("Failed to load logo:", err);
                alert("ロゴ画像の読み込みに失敗しました。");
                logoDataUrl = '';
            }
        } else {
            logoDataUrl = '';
        }
    });
}

if (logoUpload) {
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                logoDataUrl = evt.target.result;
                if (logoSelect) logoSelect.value = ''; // Reset select
            };
            reader.readAsDataURL(file);
        }
    });
}

saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        state.apiKey = key;
        alert('API Keyを保存しました');
    }
});

startQuestionsBtn.addEventListener('click', () => {
    const inputKey = apiKeyInput.value.trim();
    const errorMsg = document.getElementById('api-error-msg');

    // If not saved in state but present in input, use it
    if (!state.apiKey && inputKey) {
        state.apiKey = inputKey;
        localStorage.setItem('gemini_api_key', inputKey);
    }

    if (!state.apiKey) {
        if (errorMsg) errorMsg.style.display = 'block';
        else alert('APIキーを入力してください');
        apiKeyInput.focus();
        return;
    }

    if (errorMsg) errorMsg.style.display = 'none';

    // Update State (Keep existing answers if re-entering?) 
    // Yes, we loaded them. But if User switches school/type?
    // We should allow type switching.
    const schoolRadio = document.querySelector('input[name="school"]:checked');
    const studentRadio = document.querySelector('input[name="studentType"]:checked');

    if (schoolRadio) state.school = schoolRadio.value;
    if (studentRadio) state.studentType = studentRadio.value;

    renderQuestions();

    setupPanel.classList.add('hidden');
    questionsPanel.classList.remove('hidden');
});

backToSetupBtn.addEventListener('click', () => {
    questionsPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
});

generateBtn.addEventListener('click', async () => {
    // Validate and Collect
    if (!validateForm()) return;

    // AI Generation Logic starts here...

    // UI Loading
    document.querySelector('.actions').classList.add('hidden');
    const loading = document.getElementById('loading');
    const loadingText = loading.querySelector('p');
    if (loadingText) loadingText.textContent = "最適なAIモデルを探しています...";
    loading.classList.remove('hidden');

    try {
        await generateProposal(loadingText);
        questionsPanel.classList.add('hidden');
        previewPanel.classList.remove('hidden');
    } catch (e) {
        alert('生成エラー: ' + e.message);
    } finally {
        document.querySelector('.actions').classList.remove('hidden');
        loading.classList.add('hidden');
    }
});

if (generateDetailedBtn) {
    generateDetailedBtn.addEventListener('click', async () => {
        // Validate and Collect
        if (!validateForm()) return;

        // UI Loading
        document.querySelector('.actions').classList.add('hidden');
        const loading = document.getElementById('loading');
        const loadingText = loading.querySelector('p');
        if (loadingText) loadingText.textContent = "詳細レポートを生成中... (文章量を大幅に増やしています)";
        loading.classList.remove('hidden');

        try {
            await generateProposal(loadingText, 'detailed');
            questionsPanel.classList.add('hidden');
            previewPanel.classList.remove('hidden');
        } catch (e) {
            alert('生成エラー: ' + e.message);
            console.error(e);
        } finally {
            document.querySelector('.actions').classList.remove('hidden');
            loading.classList.add('hidden');
        }
    });
}

backToQuestionsBtn.addEventListener('click', () => {
    previewPanel.classList.add('hidden');
    questionsPanel.classList.remove('hidden');
});

printBtn.addEventListener('click', () => {
    window.print();
});

// Helper to validate form data
function validateForm() {
    collectFormData();
    let allFilled = true;
    const currentQuestions = QUESTION_SETS[state.studentType];

    // Safety check
    if (!currentQuestions) return true;

    for (const q of currentQuestions) {
        // For custom types, we assume they are "filled" if the builder was used or scores entered.
        // For text/textarea/select, check if value is present.
        if (q.type === 'text' || q.type === 'textarea' || q.type === 'select') {
            if (!state.answers[q.id] || state.answers[q.id].trim() === '') {
                allFilled = false;
                break;
            }
        }
        // For test_score_5, if the string is empty or just "5科計:0点", consider it not filled.
        if (q.type === 'test_score_5') {
            if (!state.answers[q.id] || state.answers[q.id].trim() === '' || state.answers[q.id].includes('5科計:0点')) {
                allFilled = false;
                break;
            }
        }
        // For proposal_builder, if the string is empty, consider it not filled.
        if (q.type === 'proposal_builder') {
            if (!state.answers[q.id] || state.answers[q.id].trim() === '') {
                allFilled = false;
                break;
            }
        }
    }

    if (!allFilled) {
        return confirm('未入力の項目がありますが進めますか？（AIが補完します）');
    }
    return true;
}

// Helper to collect data from DOM
function collectFormData() {
    state.answers = {}; // Reset

    // Process all inputs/selects/textareas inside form-groups
    const groups = dynamicForm.querySelectorAll('.form-group');

    groups.forEach(group => {
        const id = group.dataset.id;
        const type = group.dataset.type;

        if (type === 'test_score_5') {
            // (Same as before)
            let scoreStr = "";
            let total = 0;
            const inputs = group.querySelectorAll('input[type="number"]');
            inputs.forEach(inp => {
                const sub = inp.dataset.subject;
                const val = inp.value;
                if (val && !isNaN(parseInt(val))) {
                    scoreStr += `${sub}:${val} 点`;
                    total += parseInt(val);
                }
            });
            if (scoreStr) scoreStr += `(5科計: ${total}点)`;
            state.answers[id] = scoreStr.trim();

        } else if (type === 'strategy_selector') {
            // Collect strategies + impressions
            let policies = [];
            const rows = group.querySelectorAll('.strategy-row');
            rows.forEach(row => {
                const sub = row.querySelector('.strategy-subject').textContent;
                const strSel = row.querySelector('.strategy-select');
                const impSel = row.querySelector('.impression-select');

                const strVal = strSel ? strSel.value : '';
                const impVal = impSel ? impSel.value : '';

                if (strVal || impVal) {
                    let text = `・${sub}: `;
                    if (strVal) text += `方針[${strVal}]`;
                    if (impVal) text += `印象[${impVal}]`;
                    policies.push(text);
                }
            });
            state.answers[id] = policies.join('\n');

        } else if (type === 'checkbox_group') {
            // Collect checked boxes
            const checked = [];
            const boxes = group.querySelectorAll('input[type="checkbox"]:checked');
            boxes.forEach(box => checked.push(box.value));
            state.answers[id] = checked.join('\n');

        } else if (type === 'proposal_builder') {
            // (Same)
            let proposals = [];
            const rows = group.querySelectorAll('.proposal-row');
            rows.forEach(row => {
                const sel = row.querySelectorAll('select');
                if (sel.length === 3) {
                    const sub = sel[0].value;
                    const typ = sel[1].value;
                    const freq = sel[2].value;
                    if (sub && typ && freq) {
                        proposals.push(`・${sub} [${typ}] ${freq} `);
                    }
                }
            });
            state.answers[id] = proposals.join('\n');

        } else {
            // Standard inputs
            const el = group.querySelector('input, textarea, select');
            if (el) state.answers[id] = el.value;
        }
    });
}


// Functions
function renderQuestions() {
    dynamicForm.innerHTML = '';
    const questions = QUESTION_SETS[state.studentType];

    questions.forEach(q => {
        if (q.type === 'row') {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row-group';
            q.fields.forEach(field => {
                renderField(field, rowDiv);
            });
            dynamicForm.appendChild(rowDiv);
        } else {
            renderField(q, dynamicForm);
        }
    });
}

function renderField(q, parentContainer) {
    const div = document.createElement('div');
    div.className = 'form-group';
    if (q.type === 'test_score_5' && parentContainer.classList.contains('row-group')) {
        div.style.flex = '2';
    }
    div.dataset.id = q.id;
    div.dataset.type = q.type;

    const label = document.createElement('label');
    label.textContent = q.label;
    div.appendChild(label);

    if (q.type === 'textarea') {
        const input = document.createElement('textarea');
        input.rows = 4;
        input.id = q.id;
        input.placeholder = q.placeholder || '';
        if (state.answers[q.id]) input.value = state.answers[q.id];
        div.appendChild(input);

    } else if (q.type === 'select') {
        const select = document.createElement('select');
        select.id = q.id;
        q.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });
        if (state.answers[q.id]) select.value = state.answers[q.id];
        div.appendChild(select);

    } else if (q.type === 'text' || q.type === 'number') {
        const input = document.createElement('input');
        input.type = q.type;
        input.id = q.id;
        input.placeholder = q.placeholder || '';
        if (state.answers[q.id]) input.value = state.answers[q.id];
        div.appendChild(input);

    } else if (q.type === 'test_score_5') {
        renderTestScore5(div, q);
    } else if (q.type === 'strategy_selector') {
        renderStrategySelector(div, q);
    } else if (q.type === 'checkbox_group') {
        renderCheckboxGroup(div, q);
    } else if (q.type === 'proposal_builder') {
        renderProposalBuilder(div, q);
    }

    parentContainer.appendChild(div);
}
// Sub-renderers
function renderTestScore5(container, q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'score-input-container';
    const existingScores = state.answers[q.id] || '';
    const scoreMap = {};
    existingScores.split(' ').forEach(part => {
        const match = part.match(/(\S+):(\d+)点/);
        if (match) scoreMap[match[1]] = match[2];
    });

    SUBJECTS.forEach(sub => {
        const item = document.createElement('div');
        item.className = 'score-item';
        const subl = document.createElement('label');
        subl.textContent = sub;
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.placeholder = '点';
        inp.dataset.subject = sub;
        inp.style.minWidth = '50px';
        if (scoreMap[sub]) inp.value = scoreMap[sub];
        item.appendChild(subl);
        item.appendChild(inp);
        wrapper.appendChild(item);
    });
    container.appendChild(wrapper);
}

function renderStrategySelector(container, q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'strategy-container';

    let savedStrategies = JSON.parse(localStorage.getItem(KEY_CUSTOM_STRATEGIES) || '[]');
    const allStrategies = [...DEFAULT_STRATEGIES, ...savedStrategies];

    let savedImpressions = JSON.parse(localStorage.getItem(KEY_CUSTOM_IMPRESSIONS) || '[]');
    const allImpressions = [...IMPRESSION_OPTIONS, ...savedImpressions].filter(i => i);

    SUBJECTS.forEach(sub => {
        const row = document.createElement('div');
        row.className = 'strategy-row';
        row.style.display = 'flex';
        row.style.marginBottom = '8px';
        row.style.alignItems = 'center';
        row.style.gap = '5px';

        const subLabel = document.createElement('span');
        subLabel.className = 'strategy-subject';
        subLabel.style.width = '40px';
        subLabel.style.fontWeight = 'bold';
        subLabel.textContent = sub;

        const stratSelect = document.createElement('select');
        stratSelect.className = 'strategy-select';
        stratSelect.style.flex = '1';
        stratSelect.appendChild(createOption('', '方針を選択...'));
        allStrategies.forEach(st => stratSelect.appendChild(createOption(st, st)));

        const impSelect = document.createElement('select');
        impSelect.className = 'impression-select';
        impSelect.style.flex = '1';
        impSelect.appendChild(createOption('', '印象を選択...'));
        allImpressions.forEach(imp => impSelect.appendChild(createOption(imp, imp)));

        row.appendChild(subLabel);
        row.appendChild(stratSelect);
        row.appendChild(impSelect);
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
    container.appendChild(createOptionManagerUI('方針を追加', KEY_CUSTOM_STRATEGIES));
    container.appendChild(createOptionManagerUI('印象を追加', KEY_CUSTOM_IMPRESSIONS));
}

function renderCheckboxGroup(container, q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-group-container';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    wrapper.style.gap = '8px';

    let customOptions = [];
    if (q.storageKey) customOptions = JSON.parse(localStorage.getItem(q.storageKey) || '[]');
    const allOptions = [...q.options, ...customOptions];
    const checkedValues = state.answers[q.id] ? state.answers[q.id].split('\n') : [];

    allOptions.forEach(opt => {
        const labelWrapper = document.createElement('label');
        labelWrapper.style.display = 'flex';
        labelWrapper.style.alignItems = 'center';
        labelWrapper.style.cursor = 'pointer';
        labelWrapper.style.fontSize = '0.9rem';
        labelWrapper.style.justifyContent = 'space-between';
        labelWrapper.style.paddingRight = '5px';

        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt;
        cb.style.marginRight = '6px';
        if (checkedValues.includes(opt)) cb.checked = true;

        leftSide.appendChild(cb);
        leftSide.appendChild(document.createTextNode(opt));
        labelWrapper.appendChild(leftSide);

        if (customOptions.includes(opt) && q.storageKey) {
            const delBtn = document.createElement('span');
            delBtn.textContent = '×';
            delBtn.className = 'delete-item-btn';
            delBtn.title = '削除';
            delBtn.onclick = (e) => {
                e.preventDefault();
                deleteCustomOption(q.storageKey, opt, () => renderQuestions());
            };
            labelWrapper.appendChild(delBtn);
        }

        wrapper.appendChild(labelWrapper);
    });

    container.appendChild(wrapper);

    if (q.storageKey) {
        container.appendChild(createOptionManagerUI('選択肢を追加', q.storageKey));
    }
}

function renderProposalBuilder(container, q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'proposal-builder';
    const list = document.createElement('div');
    list.className = 'proposal-list';
    list.id = q.id + '_list';
    const addBtn = document.createElement('button');
    addBtn.textContent = '＋ 授業を追加';
    addBtn.className = 'add-row-btn';
    addBtn.type = 'button';
    addBtn.onclick = () => addProposalRow(list);

    const existingProposals = state.answers[q.id] ? state.answers[q.id].split('\n') : [];
    if (existingProposals.length > 0) {
        existingProposals.forEach(propStr => {
            const match = propStr.match(/・(\S+) \[(\S+)\] (\S+)/);
            if (match) addProposalRow(list, match[1], match[2], match[3]);
        });
    } else {
        addProposalRow(list);
    }
    wrapper.appendChild(list);
    wrapper.appendChild(addBtn);
    container.appendChild(wrapper);
}

// Helpers
function createOption(val, text) {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    return opt;
}

function createOptionManagerUI(placeholder, storageKey) {
    const div = document.createElement('div');
    div.className = 'custom-add-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.style.flex = '1';

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAdd.click();
        }
    });

    const btnAdd = document.createElement('button');
    btnAdd.textContent = '追加';
    btnAdd.className = 'secondary-btn';
    btnAdd.type = 'button';
    btnAdd.style.padding = '5px 10px';

    btnAdd.onclick = () => {
        const val = input.value.trim();
        if (val) {
            addCustomOption(storageKey, val, () => renderQuestions());
            input.value = '';
        }
    };

    div.appendChild(input);
    div.appendChild(btnAdd);

    if (storageKey === KEY_CUSTOM_STRATEGIES || storageKey === KEY_CUSTOM_IMPRESSIONS) {
        const listDiv = document.createElement('div');
        listDiv.className = 'custom-list-preview';
        const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (current.length > 0) {
            current.forEach(item => {
                const tag = document.createElement('span');
                tag.className = 'custom-tag';
                tag.innerHTML = `${item} <span class="delete-item-btn" style="margin-left:4px; width:16px; height:16px; font-size:10px;">×</span>`;
                tag.querySelector('.delete-item-btn').onclick = () => deleteCustomOption(storageKey, item, () => renderQuestions());
                listDiv.appendChild(tag);
            });
        }
        const container = document.createElement('div');
        container.appendChild(div);
        container.appendChild(listDiv);
        return container;
    }

    return div;
}

function addCustomOption(key, value, callback) {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    if (!list.includes(value)) {
        list.push(value);
        localStorage.setItem(key, JSON.stringify(list));
        if (callback) callback();
    }
}

function deleteCustomOption(key, value, callback) {
    if (!confirm(`「${value}」を削除しますか？`)) return;
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list = list.filter(item => item !== value);
    localStorage.setItem(key, JSON.stringify(list));
    if (callback) callback();
}

function addProposalRow(container, initialSubject = '', initialType = '', initialFreq = '') {
    const row = document.createElement('div');
    row.className = 'proposal-row';

    // Subject Select
    const subSel = createSelect(SUBJECTS, initialSubject);
    // Type Select
    const typeSel = createSelect(COURSE_TYPES, initialType);
    // Freq Select
    const freqSel = createSelect(FREQUENCIES, initialFreq);

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delete-row-btn';
    delBtn.type = 'button'; // Prevent form submit
    delBtn.onclick = () => row.remove();

    row.appendChild(subSel);
    row.appendChild(typeSel);
    row.appendChild(freqSel);
    row.appendChild(delBtn);

    container.appendChild(row);
}

function createSelect(options, selectedValue = '') {
    const sel = document.createElement('select');
    options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        if (o === selectedValue) {
            opt.selected = true;
        }
        sel.appendChild(opt);
    });
    return sel;
}

async function generateProposal(statusElement, mode = 'simple') {
    const loading = document.getElementById('loading');
    // SDKを使わず、直接REST APIを叩く方式に変更 (確実性向上)
    const schoolName = state.school === 'aizumi' ? 'ECCベストワン藍住校' : 'ECCベストワン北島中央校';

    // Generate Prompt
    // User Policy Summary
    const userPolicies = state.answers['subject_strategies'] || "特になし（ギャップ分析から自動判断してください）";

    // Checkboxes (Traits & Notes)
    const traits = state.answers['current_issues_checks'] ? state.answers['current_issues_checks'].replace(/\n/g, '、') : '';
    const notes = state.answers['plan_curriculum_checks'] ? state.answers['plan_curriculum_checks'].replace(/\n/g, '、') : '';
    const otherIssues = state.answers['current_issues'] || '';
    const otherNotes = state.answers['plan_curriculum'] || '';

    // Construct Prompt
    let prompt = `
あなたは、徳島県の高校入試事情（特に「基礎学力テスト」の重要性）を知り尽くした、個別指導塾「${schoolName}」の地域密着型教育コンサルタントです。
大手塾（Axis, IE, 明光など）のマニュアル化された対応ではなく、地方の生徒一人ひとりの「生々しい現実（部活、スマホ、基礎学力不足）」に即した、具体的かつ愛のある受講提案書を作成してください。
    
    【徳島県高校入試特化型情報(分析の前提)】
    ${TOKUSHIMA_CONTEXT}

    ## 最重要: ギャップ分析と合格戦略（徳島モデル）
1. ** 現在地とゴールの乖離 **: 「現在の実力テスト得点」と「志望校ボーダー（基礎学力テスト目標点）」を比較し、合計で ** あと何点足りないか ** を明確にしてください。
2. **「基礎学」突破戦略 **: 足りない点数を補うために、ユーザーが指定した【各教科の指導方針】や【生徒の教科への印象】を考慮し、「どの教科で何点アップさせるのが現実的か」を具体的に戦略立ててください。

    ## 提案プラン作成の指示(松・竹・梅の3プラン提案)
保護者が予算と成果のバランスを選べるよう、以下の3つのプランを必ず提案してください。
    ** 当校の推奨はあくまで「プランA」であり、プランAこそが志望校合格への王道（最短ルート）であることを強調してください。**

    - **【プランA：プレミアム合格プラン】 (推奨) **
    - コンセプト: 「絶対に合格させる」。妥協なしのフルサポート。
- 内容: 個別指導(週3回以上推奨) ＋ 戦略グループ ＋ 全アプリ活用。
- ターゲット単価: ** 35,000円〜50,000円以上 ** (※単価を高く設定し、圧倒的な手厚さをアピール)
- 訴求点: 先取り学習、国公立大を見据えた380点超え、全教科完全対応。質・量ともに圧倒的。

    - **【プランB：スタンダード攻略プラン】**
    - コンセプト: 「バランス重視」。必要な科目を絞って効率よく合格ラインへ。
- 内容: 個別指導(週2回程度) ＋ 戦略グループ。
- ターゲット単価: 25,000円〜35,000円前後。
- 訴求点: コスパ良く320点(安全圏)をクリアする。

    - **【プランC：基礎救済プラン】 (要注意枠) **
    - コンセプト: 「まずは300点の壁突破」。予算重視だがリスクも伝える。
- 内容: 個別指導(週1回) ＋ 戦略グループ。(※グループ指導のみの受講は不可。必ず個別指導とセット)
- ターゲット単価: 20,000円〜25,000円程度。
- 訴求点: 最小限の投資で最大の効果。** ただし「自学習ができないと合格ライン到達は厳しい」というリスクを明記すること。**

    ## 生徒の人物像・ニーズ
    - 特徴・悩み: ${traits} ${otherIssues}
- 要望・特記事項: ${notes} ${otherNotes}
    
    ## 指定された指導方針
    ${userPolicies}
    
    ## 出力形式(JSONのみ)
Markdown記法やコードブロックは含めず、純粋なJSON文字列のみを返してください。
    - 重要なキーワードや強調したい部分は、<span class="highlight">強調したいテキスト</span> のようにHTMLタグで囲んでください。
    ※JSON内の文字列に改行を含める場合は、必ず \\n にエスケープしてください（重要）。
    `;

    if (mode === 'detailed') {
        prompt += `
        
        ## 重要:【詳細レポート作成モード】
        あなたは現在、保護者に手渡す「保存版・詳細レポート」を作成しています。
        簡易版とは異なり、以下の点を厳守して出力内容を大幅に強化してください:
        1. **圧倒的な文章量**: 各セクションの文章量を「簡易版」の2倍以上に増やしてください。HTMLフレームの余白を一切残さないつもりで、具体的なアドバイスや根拠を詰め込んでください。
        2. **深い分析**: 単なる数値の羅列ではなく、「なぜその点数なのか」「どこで躓いているか」をプロの視点で分析してください。
        3. **熱量のある説得**: 保護者が読んだ瞬間に「ここまで我が子のことを考えてくれているのか」と感動し、即決したくなるような、熱意と専門性に満ちた文章にしてください。
        4. **具体的なToDo**: 「頑張りましょう」ではなく、「帰宅後まずはスマホをリビングに置く」「英単語アプリを1日15分やる」など、今日からできる具体的な行動指針を盛り込んでください。
        `;
    }

    prompt += `
    ## JSONキー構造:
- title: 提案書のタイトル（例: 「〇〇様 学習プランご提案書」「志望校合格への戦略プラン」など、ふさわしいものを生成）。
- intro: 導入の挨拶（生徒の性格や悩みに寄り添い、「大手の塾とは違う」という親身さを感じさせる言葉。100文字程度）
- analysis:
現状分析とギャップ解消戦略（HTML形式 < ul > <li>...</li></ul >）。
        ** 必ず具体的な数値（現在点、目標点、差分）を使い **、「基礎学力テスト」という言葉を使って説明してください。
- goals: 具体的な数値目標と定性目標（「基礎学第1回で〇〇点」「城東・城北ボーダー突破」など。HTML: <ul><li>...</li></ul>）
- plan: 
        ** 3つのプラン（A, B, C）の具体的カリキュラム内容 **（HTML形式）。
        各プランごとに '<h3>プランA：...</h3>' のように見出しをつけ、それぞれの授業回数・科目・特徴を記述してください。
プランAを最も魅力的に書いてください。
- schedule: 
        ** 3つのプラン（A, B, C）それぞれの概算費用 **（HTML形式）。
        プランごとに '<strong>【プランA】 月額目安: 〇〇円</strong>' と明記し、内訳（授業料＋諸費）を記載してください。
最後に「※ご家庭の方針に合わせてお選びください。迷われた場合はプランAが最も確実です」という一文を添えてください。
- message: 本人と保護者に向けた、熱意と希望に満ちたメッセージ（150文字程度。「一緒に徳島の入試を勝ち抜きましょう」といったトーン）

- roadmap:
    **合格へのロードマップ** (HTML形式)。
    提案日(${new Date().toLocaleDateString()})から受験月(${state.answers.exam_year || (new Date().getFullYear() + 1)}年${state.answers.exam_month || '3月'})までの学習計画を、4〜5つの主要なフェーズ（ステップ）に分けて記述してください。
    要素の構成:
    - \`<div class="roadmap-container">\` (親)
      - \`<div class="roadmap-step">\` (各ステップ)
        - \`<div class="step-date">\` (時期。例: [中3 夏])
        - \`<div class="step-title">\` (フェーズ名。例: 基礎固め期)
        - \`<div class="step-detail">\` (詳細タスク。基礎学対策など)
      - ... (繰り返し)
    - \`</div>\`
    徳島県のスケジュール（10月・11月・1月基礎学、3月入試）を意識すること。
    
    ## 【料金表（すべて税込・月額・目安）】
    ※提案内容に合わせて計算してください。

1. 基本費用
    - 諸費: 3, 600円（毎月必須）
- 入学金: 小11,000円 / 中高22,000円

2. 個別指導(1: 2) 授業料(月間44回プラン)
[中1・2] 週1: 17, 550 週2: 33, 400 週3: 47, 550
[中3・高1・2] 週1: 18, 510 週2: 35,090 週3: 50,090
[高3] 週1: 19, 360 週2: 36, 910 週3: 52, 510

3. グループ指導(週1回・月4回)
[中1・2] 1教科: 9, 196円
[中3] 1教科: 9, 680円
       ※グループは（単価 × 教科数）で計算。
    
    ## 生徒データ入力値:
`;

    for (const [key, value] of Object.entries(state.answers)) {
        prompt += `- ${key}: ${value} \n`;
    }

    // REST APIダイナミックモデル探索
    // APIキーで利用可能なモデル一覧を全て取得し、それらを順番に試します。
    // これにより "Not Found" エラーを完全に防ぎます。
    let candidatesFromApi = [];

    try {
        if (statusElement) statusElement.textContent = "AIモデル一覧を取得中...";
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${state.apiKey}`;
        const listRes = await fetch(listUrl);
        if (!listRes.ok) throw new Error("モデル一覧の取得に失敗しました");

        const listData = await listRes.json();
        const models = listData.models || [];

        // generateContentをサポートしているGeminiモデルを抽出
        const availableModels = models.filter(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini")
        );

        if (availableModels.length > 0) {
            // モデル名を抽出 (models/gemini-pro -> gemini-pro)
            let allNames = availableModels.map(m => m.name.replace("models/", ""));

            // 優先順位付け: 2.0 -> Pro -> Flash (non-lite) -> その他
            allNames.sort((a, b) => {
                const getScore = (name) => {
                    let score = 0;
                    if (name.includes("2.0")) score += 10;
                    if (name.includes("exp")) score += 5;
                    if (name.includes("pro")) score += 4;
                    if (name.includes("flash") && !name.includes("lite")) score += 3;
                    if (name.includes("1.5")) score += 1;
                    if (name.includes("lite")) score -= 50; // Liteは避ける
                    return score;
                };
                return getScore(b) - getScore(a);
            });

            candidatesFromApi = allNames;
            console.log("Auto-discovered models:", candidatesFromApi);
        }

    } catch (e) {
        console.warn("Model discovery failed, using fallback list:", e);
    }

    // モデル候補リスト構築
    // APIから取得できた場合はそれを使い、ダメなら念の為のバックアップリストを使う
    let modelCandidates = [];

    if (candidatesFromApi.length > 0) {
        // Re-prioritize: Pro is best for quality. Avoid experimental flash if quality is low.
        // Sort: 1.5-pro -> 1.5-flash -> pro -> others
        candidatesFromApi.sort((a, b) => {
            const score = (name) => {
                if (name.includes('gemini-1.5-pro')) return 100;
                if (name.includes('gemini-1.5-flash')) return 80;
                if (name.includes('gemini-pro')) return 60;
                if (name.includes('2.0')) return 10; // Deprioritize 2.0 based on user feedback
                return 0;
            };
            return score(b) - score(a);
        });
        modelCandidates = candidatesFromApi;
    } else {
        modelCandidates = [
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-pro"
        ];
    }

    let finalResponseData = null;
    let usedModel = "";
    let lastError = null;

    for (const modelName of modelCandidates) {
        if (statusElement) statusElement.textContent = `生成中... (${modelName})`;
        console.log(`Trying REST API: ${modelName}...`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${state.apiKey}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                console.warn(`Failed with ${modelName}:`, errorData);
                // 429 (Quota Exceeded) or 404
                lastError = new Error(`[${modelName}] ${errorData.error.message}`);
                continue;
            }

            finalResponseData = await response.json();
            usedModel = modelName;
            console.log(`Success with model: ${modelName}`);
            break;

        } catch (e) {
            console.warn(`Network error with ${modelName}:`, e);
            lastError = e;
        }
    }

    if (!finalResponseData) {
        const detailMsg = lastError ? lastError.message : "Unknown Error";
        alert(`エラーが発生しました。\n利用可能なモデルが見つかりませんでした。\n詳細: ${detailMsg}`);
        throw lastError;
    }

    // Extract JSON string more robustly
    let rawText = finalResponseData.candidates[0].content.parts[0].text;
    let text = rawText.replace(/```json/g, '').replace(/```/g, '');
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        text = text.substring(firstOpen, lastClose + 1);
    }

    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.warn("Strict JSON parse failed. Retrying with cleanup...");
        try {
            json = JSON.parse(text.trim());
        } catch (e2) {
            console.error("JSON Parse Error. Raw Text:", rawText);
            throw new Error(`AI作成データの読み取りに失敗しました。\n(JSON Syntax Error)\nコンソールで詳細を確認できます。`);
        }
    }



    // Clear old buttons except back
    const actionsDiv = document.querySelector('#preview-panel .actions');
    actionsDiv.innerHTML = '';

    const btnBack = document.createElement('button');
    btnBack.id = 'backToQuestionsBtn';
    btnBack.className = 'secondary-btn';
    btnBack.textContent = '修正する';
    btnBack.onclick = () => {
        previewPanel.classList.add('hidden');
        questionsPanel.classList.remove('hidden');
    };
    const btnOpen = document.createElement('button');
    btnOpen.id = 'openB4Btn';
    btnOpen.className = 'primary-btn';
    btnOpen.style.fontSize = '1.2rem';
    btnOpen.style.padding = '15px 30px';
    const label = (mode === 'detailed') ? '📄 詳細レポートを表示 (B4)' : '📄 簡易提案書を表示 (B4)';
    btnOpen.textContent = label;
    btnOpen.onclick = () => {
        const htmlContent = generateB4HTML(state, json);
        const win = window.open('', '_blank');
        if (win) {
            win.document.open();
            win.document.write(htmlContent);
            win.document.close();
        } else {
            alert('ポップアップがブロックされました。');
        }
    };

    actionsDiv.appendChild(btnBack);
    actionsDiv.appendChild(btnOpen);

    // Add Detailed Report Button if only simple
    if (mode === 'simple') {
        const btnDetailed = document.createElement('button');
        btnDetailed.className = 'primary-btn';
        btnDetailed.style.marginLeft = '10px';
        btnDetailed.style.backgroundColor = '#e65100'; // Orange
        btnDetailed.textContent = '📝 詳細レポートを作成';
        btnDetailed.onclick = async () => {
            // UI Transition for loading
            const loadingEl = document.getElementById('loading');
            const loadingText = loadingEl.querySelector('p');
            loadingText.textContent = "詳細レポートを生成中... (文章量を大幅に増やしています)";

            loadingEl.classList.remove('hidden');
            questionsPanel.classList.remove('hidden'); // Show generic panel to hold loading
            previewPanel.classList.add('hidden');

            try {
                await generateProposal(loadingText, 'detailed');
            } catch (e) {
                alert(e);
                loadingEl.classList.add('hidden');
                previewPanel.classList.remove('hidden'); // Restore if error
            }
        };
        actionsDiv.appendChild(btnDetailed);
    }

    if (loading) loading.classList.add('hidden');
    questionsPanel.classList.add('hidden');
    previewPanel.classList.remove('hidden');
}

// Function to safely render content that might be object/array
// Function to safely render content that might be object/array
function safeRender(content) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map(c => safeRender(c)).join('');
    }
    if (typeof content === 'object') {
        if (content.text) return safeRender(content.text);
        if (content.content) return safeRender(content.content);
        return Object.values(content).map(v => safeRender(v)).join('<br>');
    }
    return String(content);
}

function generateB4HTML(state, data) {
    const schoolName = state.school === 'kitajima' ? 'ECCベストワン 北島中央校' : 'ECCベストワン 藍住校';
    const logoSrc = logoDataUrl || '';

    // 日付フォーマット
    const today = new Date();
    const dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';

    // Apply safeRender to data fields
    const safeData = {
        title: safeRender(data.title) || '学習プランご提案書',
        intro: safeRender(data.intro),
        analysis: safeRender(data.analysis),
        goals: safeRender(data.goals),
        message: safeRender(data.message),
        plan: safeRender(data.plan),
        schedule: safeRender(data.schedule),
        roadmap: safeRender(data.roadmap)
    };

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${safeData.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&display=swap');
        
        @page {
            size: B4 landscape;
            margin: 0;
        }

        body {
            font-family: 'Noto Serif JP', serif;
            margin: 0;
            padding: 10mm;
            background: #fff;
            color: #333;
            box-sizing: border-box;
            width: 364mm; 
            height: 257mm; 
            overflow: hidden;
            display: grid;
            /* Header (50px), Intro (40px), Main Content (Auto), Roadmap (15%) */
            grid-template-rows: 50px auto 1fr 45mm;
            gap: 8px;
        }

        h2, h3, p, ul, li { margin: 0; padding: 0; }
        ul { padding-left: 1.2em; }
        strong { font-weight: bold; }
        .highlight { color: #e65100; font-weight: bold; } /* Orange highlight */

        /* --- Header --- */
        .header-area {
            display: flex;
            align-items: bottom;
            justify-content: space-between;
            border-bottom: 2px solid #003366;
            padding-bottom: 5px;
        }
        .header-left {
            font-size: 24pt;
            font-weight: bold;
            color: #0095d9; /* ECC Blue */
            font-family: 'Noto Sans JP', sans-serif;
        }
        .header-sub {
            font-size: 10pt;
            color: #666;
            margin-left: 10px;
        }
        .header-right {
            text-align: right;
        }
        .header-title-text {
            font-size: 16pt;
            font-weight: bold;
            font-family: 'Noto Serif JP', serif;
        }
        .header-meta {
            font-size: 9pt;
            color: #444;
        }

        /* --- Intro --- */
        .intro-area {
            font-size: 9.5pt;
            line-height: 1.3;
            color: #444;
        }

        /* --- Main Grid --- */
        .main-grid {
            display: grid;
            grid-template-columns: 28% 48% 22%; /* 3 Columns */
            gap: 8px;
            overflow: hidden;
        }

        .col {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* --- Boxes --- */
        .box {
            border: 1px solid #0095d9;
            border-radius: 6px;
            padding: 0;
            background: #fff;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .box-blue { border-color: #0095d9; }
        .box-orange { border-color: #f08c00; }
        .box-green { border-color: #008a00; }
        .box-gray { border-color: #666; }

        .box-header {
            color: #fff;
            font-family: 'Noto Sans JP', sans-serif;
            font-weight: bold;
            font-size: 10.5pt;
            padding: 3px 10px;
        }
        .bg-blue { background: #0095d9; }
        .bg-orange { background: #f08c00; }
        .bg-green { background: #008a00; }
        .bg-gray { background: #555; }

        .box-content {
            padding: 8px;
            font-size: 9pt;
            line-height: 1.4;
            flex: 1;
            overflow: hidden;
        }

        /* --- Specific Items --- */
        .analysis-box { flex: 2; }
        .goal-box { flex: 1; }
        .message-box { flex: 2; } /* Ratio 3:2 */
        
        .plan-box { height: 100%; }
        .schedule-box { flex: 3; font-size: 8.5pt; } 

        /* --- Roadmap --- */
        .roadmap-box {
            border: 2px solid #008a00;
            border-radius: 6px;
            padding: 5px;
            display: flex;
            flex-direction: column;
        }
        .roadmap-header {
            background: #008a00;
            color: #fff;
            font-size: 10pt;
            font-weight: bold;
            padding: 2px 10px;
            width: fit-content;
            border-radius: 4px;
            margin-bottom: 5px;
        }

        /* Content Styling */
        h3 { 
            color: #0056b3; 
            font-size: 10pt; 
            margin-top: 5px; 
            margin-bottom: 2px; 
            border-bottom: 1px solid #ddd;
        }
        .plan-item { margin-bottom: 8px; }

        /* Roadmap Flex */
        .roadmap-container {
            display: flex;
            justify-content: space-between;
            height: 100%;
            gap: 5px;
        }
        .roadmap-step {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px;
            background: #f9fdf9;
        }
        .step-date { 
            background: #0056b3; color: white; display: inline-block;
            font-size: 8pt; padding: 1px 4px; border-radius: 3px; margin-bottom: 2px;
        }
        .step-title { font-weight: bold; font-size: 9pt; color: #333; display: block; }
        .step-detail { font-size: 8pt; color: #555; margin-top: 2px; line-height: 1.2; }

    </style>
</head>
<body>
    <div class="header-area">
        <div>
            <span class="header-left">${schoolName}</span>
            <span class="header-sub">個別指導塾 / 英会話</span>
        </div>
        <div class="header-right">
            <div class="header-title-text">${safeData.title}</div>
            <div class="header-meta">${state.answers.student_name || '生徒'} 様 &nbsp;&nbsp; ${dateStr}</div>
        </div>
    </div>

    <div class="intro-area">
        ${safeData.intro}
    </div>

    <div class="main-grid">
        <!-- Left Column -->
        <div class="col">
            <div class="box box-blue analysis-box">
                <div class="box-header bg-blue">現状の分析・課題</div>
                <div class="box-content">${safeData.analysis}</div>
            </div>
            <div class="box box-blue goal-box">
                <div class="box-header bg-blue">目標設定</div>
                <div class="box-content">${safeData.goals}</div>
            </div>
        </div>

        <!-- Center Column -->
        <div class="col">
            <div class="box box-blue plan-box">
                <div class="box-header bg-blue">ご提案プラン (Plan Options)</div>
                <div class="box-content">${safeData.plan}</div>
            </div>
        </div>

        <!-- Right Column -->
        <div class="col">
            <div class="box box-gray schedule-box">
                <div class="box-header bg-gray">スケジュール・費用</div>
                <div class="box-content">${safeData.schedule}</div>
            </div>
             <div class="box box-orange message-box">
                <div class="box-header bg-orange">先生からのメッセージ</div>
                <div class="box-content">${safeData.message}</div>
            </div>
        </div>
    </div>

    <div class="roadmap-box">
        <div class="roadmap-header">合格へのロードマップ</div>
        <div style="flex:1; overflow:hidden;">
            ${safeData.roadmap || '生成中...'}
        </div>
    </div>
</body>
</html>
    `;
}

