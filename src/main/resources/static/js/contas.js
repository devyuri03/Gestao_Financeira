let todasContas = [];
let editandoId = null;
let selectedType = 'CONTA_CORRENTE';

const TIPO_INFO = {
  CONTA_CORRENTE: { label: 'Conta Corrente',    emoji: '🏦', bg: '#dbeafe' },
  CONTA_POUPANCA: { label: 'Poupança',           emoji: '💰', bg: '#dbeafe' },
  CARTAO_CREDITO: { label: 'Cartão de Crédito',  emoji: '💳', bg: '#ede9fe' },
  INVESTIMENTO:   { label: 'Investimento',        emoji: '📈', bg: '#dcfce7' },
  DINHEIRO:       { label: 'Dinheiro',            emoji: '💵', bg: '#fef9c3' },
  OUTRO:          { label: 'Outro',               emoji: '📂', bg: '#f3f4f6' },
};

// ── Inicialização ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  carregarContas();
  setupTypeOptions();
});

// ── Usuário ───────────────────────────────────────
async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return;
    const { email } = await res.json();
    document.getElementById('sidebarEmail').textContent = email;
    document.getElementById('sidebarName').textContent = email.split('@')[0];
    document.getElementById('userAvatar').textContent = email.substring(0, 2).toUpperCase();
  } catch (e) {
    console.error('Erro ao carregar usuário:', e);
  }
}

// ── API ───────────────────────────────────────────
async function carregarContas() {
  try {
    const res = await fetch('/api/contas');
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login.html';
      return;
    }
    todasContas = await res.json();
    renderizarContas();
    atualizarCards();
  } catch (e) {
    console.error('Erro ao carregar contas:', e);
  }
}

async function salvarConta() {
  const nome = document.getElementById('input-name').value.trim();
  if (!nome) { document.getElementById('input-name').focus(); return; }

  const saldo  = parseFloat(document.getElementById('input-balance').value) || 0;
  const limite = selectedType === 'CARTAO_CREDITO'
    ? (parseFloat(document.getElementById('input-limit').value) || null)
    : null;

  const body = { nome, saldo, limite, tipoConta: selectedType };

  const isEdicao = editandoId !== null;
  const url    = isEdicao ? `/api/contas/${editandoId}` : '/api/contas';
  const method = isEdicao ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fecharModal();
      carregarContas();
      showToast(isEdicao ? '✏️ Conta atualizada!' : '✅ Conta criada com sucesso!');
    } else {
      showToast('❌ Não foi possível salvar a conta.');
    }
  } catch (e) {
    showToast('❌ Erro ao conectar ao servidor.');
  }
}

async function deletarConta(id) {
  if (!confirm('Excluir esta conta? Essa ação não pode ser desfeita.')) return;

  try {
    const res = await fetch(`/api/contas/${id}`, { method: 'DELETE' });
    if (res.ok) {
      carregarContas();
      showToast('🗑️ Conta removida.');
    } else if (res.status === 403) {
      showToast('❌ Sem permissão para excluir esta conta.');
    } else {
      showToast('❌ Não foi possível excluir.');
    }
  } catch (e) {
    showToast('❌ Erro ao conectar ao servidor.');
  }
}

// ── Renderização ──────────────────────────────────
function renderizarContas() {
  const grid = document.getElementById('accounts-grid');
  grid.innerHTML = '';

  todasContas.forEach(conta => {
    const info = TIPO_INFO[conta.tipoConta] || TIPO_INFO.OUTRO;
    const card = document.createElement('div');
    card.className = 'account-card';

    const conteudo = conta.tipoConta === 'CARTAO_CREDITO'
      ? cardCredito(conta)
      : cardRegular(conta);

    card.innerHTML = `
      <div class="account-card-actions">
        <button class="icon-btn" onclick="editarConta(${conta.id})" title="Editar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn" onclick="deletarConta(${conta.id})" title="Excluir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
      <div class="account-header">
        <div class="account-icon" style="background:${info.bg}">${info.emoji}</div>
        <div>
          <div class="account-name">${conta.nome || info.label}</div>
          <div class="account-type">${info.label}</div>
        </div>
      </div>
      ${conteudo}
    `;
    grid.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'add-account-card';
  addCard.onclick = abrirModal;
  addCard.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    Adicionar nova conta
  `;
  grid.appendChild(addCard);
}

function cardCredito(conta) {
  const limite   = conta.limite || 0;
  const fatura   = parseFloat(conta.totalSaidas) || 0;
  const disponivel = parseFloat(conta.saldoAtual) || 0;
  const usage    = limite > 0 ? Math.min((fatura / limite) * 100, 100) : 0;
  const corBarra = usage > 90 ? '#ef4444' : usage > 70 ? '#f59e0b' : '#22c55e';

  return `
    <hr class="account-divider"/>
    <div class="account-row">
      <span>Limite Total</span>
      <span>${fmt(limite)}</span>
    </div>
    <div class="account-row">
      <span>Fatura Atual</span>
      <span class="val red">${fmt(fatura)}</span>
    </div>
    <div class="account-row">
      <span>Limite Disponível</span>
      <span class="val ${disponivel >= 0 ? 'green' : 'red'}">${fmt(disponivel)}</span>
    </div>
    <div class="limit-section">
      <div class="limit-row">
        <span>Utilização</span>
        <span>${usage.toFixed(1)}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${usage}%; background:${corBarra}"></div>
      </div>
    </div>
  `;
}

function cardRegular(conta) {
  const entradas = parseFloat(conta.totalEntradas) || 0;
  const saidas   = parseFloat(conta.totalSaidas)   || 0;
  const atual    = parseFloat(conta.saldoAtual)     || 0;

  return `
    <div class="account-row">
      <span>Saldo Inicial</span>
      <span>${fmt(conta.saldo)}</span>
    </div>
    <div class="account-row">
      <span>Total Entradas</span>
      <span class="val green">+${fmt(entradas)}</span>
    </div>
    <div class="account-row">
      <span>Total Saídas</span>
      <span class="val red">-${fmt(saidas)}</span>
    </div>
    <hr class="account-divider"/>
    <div class="account-balance-row">
      <span>Saldo Atual</span>
      <span class="balance ${atual < 0 ? 'red' : ''}">${fmt(atual)}</span>
    </div>
  `;
}

function atualizarCards() {
  const total      = todasContas.length;
  const saldoTotal = todasContas.reduce((sum, c) => sum + (parseFloat(c.saldoAtual) || 0), 0);
  const comLimite  = todasContas.filter(c => c.tipoConta === 'CARTAO_CREDITO' && c.limite).length;

  document.getElementById('totalContas').textContent  = total;
  document.getElementById('saldoTotal').textContent   = fmt(saldoTotal);
  document.getElementById('contasCartao').textContent = comLimite;
}

// ── Modal ─────────────────────────────────────────
function abrirModal() {
  editandoId = null;
  document.getElementById('modal-title').textContent = 'Nova Conta';
  document.getElementById('input-name').value    = '';
  document.getElementById('input-balance').value = '';
  document.getElementById('input-limit').value   = '';
  setType('CONTA_CORRENTE');
  document.getElementById('modal-overlay').classList.add('open');
}

function editarConta(id) {
  const conta = todasContas.find(c => c.id === id);
  if (!conta) return;

  editandoId = id;
  document.getElementById('modal-title').textContent = 'Editar Conta';
  document.getElementById('input-name').value    = conta.nome || '';
  document.getElementById('input-balance').value = conta.saldo;
  document.getElementById('input-limit').value   = conta.limite || '';
  setType(conta.tipoConta);
  document.getElementById('modal-overlay').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editandoId = null;
}

function fecharModalFora(e) {
  if (e.target === document.getElementById('modal-overlay')) fecharModal();
}

// ── Tipo ──────────────────────────────────────────
function setupTypeOptions() {
  document.querySelectorAll('.type-option').forEach(el => {
    el.addEventListener('click', () => setType(el.dataset.type));
  });
}

function setType(type) {
  selectedType = type;
  document.querySelectorAll('.type-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.type === type);
  });
  document.getElementById('limit-group').style.opacity = type === 'CARTAO_CREDITO' ? '1' : '.4';
}

// ── Logout ────────────────────────────────────────
async function logout() {
  await fetch('/logout', { method: 'POST' });
  window.location.href = '/login.html';
}

// ── Helpers ───────────────────────────────────────
function fmt(n) {
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
