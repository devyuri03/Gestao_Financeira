let todosOsDados = [];

// ── Inicialização ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  carregarFluxo();
});

// ── Usuário ───────────────────────────────────────
async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuarios/me');
    if (!res.ok) return;
    const { email } = await res.json();
    document.getElementById('sidebarEmail').textContent = email;
    document.getElementById('sidebarName').textContent  = email.split('@')[0];
    document.getElementById('userAvatar').textContent   = email.substring(0, 2).toUpperCase();
  } catch (e) {
    console.error('Erro ao carregar usuário:', e);
  }
}

// ── API ───────────────────────────────────────────
async function carregarFluxo() {
  try {
    const res = await fetch('/api/fluxo-caixa');
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login.html';
      return;
    }
    todosOsDados = await res.json();
    popularFiltroAnos();
    aplicarFiltro();
  } catch (e) {
    console.error('Erro ao carregar fluxo de caixa:', e);
  }
}

// ── Filtro por ano ────────────────────────────────
function popularFiltroAnos() {
  const anos = [...new Set(todosOsDados.map(d => d.mes.split(' ')[1]))].sort();
  const select = document.getElementById('filtroAno');
  select.innerHTML = '<option value="">Todos os anos</option>';
  anos.forEach(ano => {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    select.appendChild(opt);
  });

  // Pré-seleciona o ano atual se existir
  const anoAtual = String(new Date().getFullYear());
  if (anos.includes(anoAtual)) select.value = anoAtual;
}

function aplicarFiltro() {
  const ano = document.getElementById('filtroAno').value;
  const dados = ano
    ? todosOsDados.filter(d => d.mes.endsWith(ano))
    : todosOsDados;
  renderizarTabela(dados);
  atualizarResumo(dados);
}

// ── Renderização ──────────────────────────────────
function renderizarTabela(dados) {
  const tbody = document.getElementById('tbody-fluxo');

  if (dados.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">
          <i class="ti ti-inbox"></i>
          <p>Nenhum lançamento encontrado para este período</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = dados.map(row => {
    const resultado       = Number(row.resultadoPrevisto);
    const saldoFinal      = Number(row.saldoFinalProjetado);
    const classeResultado = resultado >= 0 ? 'positivo' : 'negativo';
    const sinalResultado  = resultado >= 0 ? '+' : '';
    const classeSaldo     = saldoFinal  >= 0 ? 'pos' : 'neg';

    return `
      <tr>
        <td class="col-mes">${row.mes}</td>
        <td>${fmt(row.saldoInicial)}</td>
        <td class="positivo">+${fmt(row.receitasPrevistas)}</td>
        <td class="negativo">-${fmt(row.despesasPrevistas)}</td>
        <td class="${classeResultado}">${sinalResultado}${fmt(resultado)}</td>
        <td><span class="saldo-badge ${classeSaldo}">${fmt(saldoFinal)}</span></td>
      </tr>
    `;
  }).join('');
}

function atualizarResumo(dados) {
  const totalReceitas  = dados.reduce((s, d) => s + Number(d.receitasPrevistas),  0);
  const totalDespesas  = dados.reduce((s, d) => s + Number(d.despesasPrevistas),  0);
  const resultado      = totalReceitas - totalDespesas;

  document.getElementById('resumoReceitas').textContent  = fmt(totalReceitas);
  document.getElementById('resumoDespesas').textContent  = fmt(totalDespesas);
  document.getElementById('resumoResultado').textContent = (resultado >= 0 ? '+' : '') + fmt(resultado);

  const elResultado = document.getElementById('resumoResultado');
  elResultado.className = 'summary-value ' + (resultado >= 0 ? 'positive' : 'negative');
}

// ── Logout ────────────────────────────────────────
async function logout() {
  await fetch('/logout', { method: 'POST' });
  window.location.href = '/login.html';
}

// ── Helper ────────────────────────────────────────
function fmt(n) {
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
