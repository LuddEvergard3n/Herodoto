import {
  getPersonas, preparePersona, answerQuestion, prepareVoiceRuntime,
  getVoiceRuntimeStatus, cancelVoiceRuntimePreparation, clearVoiceModelCache,
} from './voices-grounded.js';
import { onVoiceRuntimeStatus } from './voices-runtime.js';

const elements = {
  list: document.getElementById('persona-list'), title: document.getElementById('conversation-title'),
  period: document.getElementById('conversation-period'), messages: document.getElementById('messages'),
  form: document.getElementById('voice-form'), input: document.getElementById('voice-input'),
  send: document.getElementById('send-question'), reset: document.getElementById('new-conversation'),
  lite: document.getElementById('lite-runtime'), enhanced: document.getElementById('enhanced-runtime'),
  cancel: document.getElementById('cancel-runtime'), clear: document.getElementById('clear-runtime'),
  progress: document.getElementById('runtime-progress'), runtimeStatus: document.getElementById('runtime-status'),
};

let selected = null;
let history = [];

function addMessage(kind, text, result = null) {
  const article = document.createElement('article');
  article.className = `message message-${kind}`;
  const body = document.createElement('div');
  body.textContent = text;
  article.appendChild(body);
  if (result) {
    const meta = document.createElement('details');
    meta.className = 'message-meta';
    const summary = document.createElement('summary');
    summary.textContent = `Evidências utilizadas (${result.evidence.length})`;
    meta.appendChild(summary);
    const notice = document.createElement('p');
    notice.textContent = `Modo: ${result.answerMode}. Runtime: ${result.runtimeTier}. Grounding: ${result.groundingStatus}. Confiança: ${Math.round(result.confidence * 100)}%. A primeira pessoa é dramatização pedagógica.`;
    meta.appendChild(notice);
    const evidenceList = document.createElement('ol');
    evidenceList.className = 'evidence-list';
    result.evidence.forEach(item => {
      const li = document.createElement('li');
      const source = item.sources?.[0];
      li.textContent = `${item.title} — ${source ? `${source.author}, ${source.title}` : item.datasetId}${item.locator ? `; ${item.locator}` : ''}`;
      evidenceList.appendChild(li);
    });
    meta.appendChild(evidenceList);
    article.appendChild(meta);
  }
  elements.messages.appendChild(article);
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

async function selectPersona(persona) {
  selected = persona;
  history = [];
  elements.title.textContent = persona.name;
  elements.period.textContent = `${persona.period} — ${persona.knowledgeCutoff}`;
  elements.input.disabled = true;
  elements.send.disabled = true;
  elements.messages.innerHTML = '<div class="empty-conversation"><strong>Preparando os registros...</strong></div>';
  const result = await preparePersona(persona.id);
  elements.messages.innerHTML = '';
  if (!result.ok) {
    addMessage('persona', 'Não foi possível carregar os registros desta persona. Tente novamente.');
    return;
  }
  addMessage('persona', `Estou pronto para conversar a partir de ${result.evidenceCount} registros fundamentados. Pergunte sobre acontecimentos, decisões e contradições do meu tempo.`);
  elements.input.disabled = false;
  elements.send.disabled = false;
  elements.reset.disabled = false;
  elements.input.focus();
  document.querySelectorAll('.persona-card').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === persona.id)));
}

function runtimeLabel(status) {
  if (status.state === 'loading') return `Baixando e preparando ${status.tier}: ${Math.round(status.progress * 100)}%. Você pode continuar navegando.`;
  if (status.state === 'ready' && status.tier !== 'deterministic') return `Modelo ${status.tier} pronto e armazenado no cache deste navegador.`;
  if (status.state === 'manual') return `Download automático não iniciado: ${status.error}. Use a preparação manual em uma conexão adequada.`;
  if (status.state === 'error') return `Modelo local indisponível: ${status.error}. O compositor determinístico continua ativo.`;
  if (status.state === 'cancelled') return 'Preparação cancelada. O compositor determinístico continua ativo.';
  return 'Compositor determinístico ativo. Nenhuma pergunta sai deste dispositivo.';
}

onVoiceRuntimeStatus(status => {
  elements.runtimeStatus.textContent = runtimeLabel(status);
  elements.progress.hidden = status.state !== 'loading';
  elements.progress.value = status.progress;
  elements.cancel.hidden = status.state !== 'loading';
  elements.lite.disabled = status.state === 'loading';
  elements.enhanced.disabled = status.state === 'loading';
});

async function prepareTier(tier) {
  try {
    await prepareVoiceRuntime({ preferredTier: tier, automatic: false });
  } catch (error) {
    elements.runtimeStatus.textContent = `Não foi possível preparar o modelo: ${error.message}. O modo determinístico permanece ativo.`;
  }
}

elements.lite.addEventListener('click', () => prepareTier('lite'));
elements.enhanced.addEventListener('click', () => prepareTier('enhanced'));
elements.cancel.addEventListener('click', cancelVoiceRuntimePreparation);
elements.clear.addEventListener('click', async () => {
  const count = await clearVoiceModelCache();
  elements.runtimeStatus.textContent = count ? 'Cache local dos modelos removido.' : 'Nenhum cache de modelo reconhecido foi encontrado.';
});

elements.form.addEventListener('submit', async event => {
  event.preventDefault();
  const question = elements.input.value.trim();
  if (!selected || !question) return;
  elements.input.value = '';
  elements.input.disabled = true;
  elements.send.disabled = true;
  addMessage('user', question);
  const result = await answerQuestion({ personaId: selected.id, question, conversationHistory: history });
  history.push({ role: 'user', content: question }, { role: 'assistant', content: result.text });
  addMessage('persona', result.text, result);
  elements.input.disabled = false;
  elements.send.disabled = false;
  elements.input.focus();
});

elements.reset.addEventListener('click', () => selected && selectPersona(selected));

async function renderPersonas() {
  const personas = await getPersonas();
  personas.forEach(persona => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'persona-card';
    button.dataset.id = persona.id;
    button.setAttribute('aria-pressed', 'false');
    const name = document.createElement('strong');
    name.textContent = persona.name;
    const date = document.createElement('span');
    date.textContent = persona.period;
    button.append(name, date);
    button.addEventListener('click', () => selectPersona(persona));
    elements.list.appendChild(button);
  });
}

if (new URLSearchParams(location.search).get('legacy') === '1') location.replace('vozes-historia.html?legacy=1');
else renderPersonas().catch(error => addMessage('persona', `Falha ao carregar o catálogo: ${error.message}`));

if (getVoiceRuntimeStatus().state === 'idle') elements.runtimeStatus.textContent = runtimeLabel(getVoiceRuntimeStatus());
