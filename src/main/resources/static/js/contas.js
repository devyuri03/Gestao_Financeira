let todasContas = [];
let editandoId = null;
let selectedType = 'CONTA_CORRENTE';

const TIPO_INFO = {
  CONTA_CORRENTE: { label: 'Conta Corrente',    icon: 'ti-building-bank', bg: '#dbeafe', color: '#2563eb' },
  CONTA_POUPANCA: { label: 'Poupança',           icon: 'ti-piggy-bank',   bg: '#dcfce7', color: '#16a34a' },
  CARTAO_CREDITO: { label: 'Cartão de Crédito',  icon: 'ti-credit-card',  bg: '#ede9fe', color: '#7c3aed' },
  INVESTIMENTO:   { label: 'Investimento',        icon: 'ti-chart-line',   bg: '#d1fae5', color: '#059669' },
  DINHEIRO:       { label: 'Dinheiro',            icon: 'ti-cash',         bg: '#fef9c3', color: '#ca8a04' },
  OUTRO:          { label: 'Outro',               icon: 'ti-folder',       bg: '#f1f5f9', color: '#64748b' },
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
      window.location.href = '/login';
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
          <i class="ti ti-pencil" style="font-size:16px;color:#3b82f6"></i>
        </button>
        <button class="icon-btn" onclick="deletarConta(${conta.id})" title="Excluir">
          <i class="ti ti-trash" style="font-size:16px;color:#ef4444"></i>
        </button>
      </div>
      <div class="account-header">
        <div class="account-icon" style="background:${info.bg};color:${info.color}">
          <i class="ti ${info.icon}"></i>
        </div>
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
  addCard.innerHTML = `<i class="ti ti-plus"></i> Adicionar nova conta`;
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
  window.location.href = '/login';
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
