import { PERSONAS, preparePersona, answerQuestion, setSemanticClient } from './voices-grounded.js';
import { createSemanticClient } from './semantic-client.js';

const list = document.getElementById('persona-list');
const title = document.getElementById('conversation-title');
const period = document.getElementById('conversation-period');
const messages = document.getElementById('messages');
const form = document.getElementById('voice-form');
const input = document.getElementById('voice-input');
const send = document.getElementById('send-question');
const reset = document.getElementById('new-conversation');
const semanticToggle = document.getElementById('semantic-toggle');
const semanticStatus = document.getElementById('semantic-status');

let selected = null;
let history = [];
let semantic = null;

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
    notice.textContent = `Modo: ${result.answerMode}. Confiança: ${Math.round(result.confidence * 100)}%. Texto em primeira pessoa: dramatização pedagógica.`;
    meta.appendChild(notice);
    const evidenceList = document.createElement('ol');
    evidenceList.className = 'evidence-list';
    result.evidence.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.title} — ${item.datasetId}`;
      evidenceList.appendChild(li);
    });
    meta.appendChild(evidenceList);
    article.appendChild(meta);
  }
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}

async function selectPersona(persona) {
  selected = persona;
  history = [];
  title.textContent = persona.name;
  period.textContent = `${persona.period} — horizonte: ${persona.horizon}`;
  input.disabled = true;
  send.disabled = true;
  messages.innerHTML = '<div class="empty-conversation"><strong>Preparando os registros...</strong></div>';
  const result = await preparePersona(persona.id);
  messages.innerHTML = '';
  if (!result.ok) {
    addMessage('persona', 'Não foi possível carregar os registros desta persona. Tente novamente.');
    return;
  }
  addMessage('persona', `Estou pronto para conversar a partir de ${result.evidenceCount} registros históricos. Pergunte-me sobre acontecimentos e decisões do meu tempo.`);
  input.disabled = false;
  send.disabled = false;
  reset.disabled = false;
  input.focus();
  document.querySelectorAll('.persona-card').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === persona.id)));
}

PERSONAS.forEach(persona => {
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
  list.appendChild(button);
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const question = input.value.trim();
  if (!selected || !question) return;
  input.value = '';
  input.disabled = true;
  send.disabled = true;
  addMessage('user', question);
  const result = await answerQuestion({ personaId: selected.id, question, conversationHistory: history });
  history.push({ role: 'user', content: question }, { role: 'assistant', content: result.text });
  addMessage('persona', result.text, result);
  input.disabled = false;
  send.disabled = false;
  input.focus();
});

reset.addEventListener('click', () => selected && selectPersona(selected));

semanticToggle.addEventListener('click', () => {
  if (semantic) {
    semantic.destroy();
    semantic = null;
    setSemanticClient(null);
    semanticToggle.setAttribute('aria-pressed', 'false');
    semanticToggle.textContent = 'Ativar busca semântica (aprox. 118 MB)';
    semanticStatus.textContent = 'Modo lexical local ativo. Nenhuma pergunta sai deste dispositivo.';
    return;
  }
  semanticStatus.textContent = 'O modelo multilíngue de aproximadamente 118 MB será baixado e armazenado pelo navegador. A primeira consulta pode demorar.';
  semantic = createSemanticClient(progress => {
    const percent = progress?.progress == null ? '' : ` ${Math.round(progress.progress * 100)}%`;
    semanticStatus.textContent = `Preparando busca semântica.${percent}`;
  });
  setSemanticClient(semantic);
  semanticToggle.setAttribute('aria-pressed', 'true');
  semanticToggle.textContent = 'Desativar busca semântica';
});

const params = new URLSearchParams(location.search);
if (params.get('legacy') === '1') location.replace('vozes-historia.html?legacy=1');
