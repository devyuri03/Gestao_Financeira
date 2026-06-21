let categoryChart = null;

const CAT_CORES = {
    MORADIA:     '#6482d8',
    ALIMENTACAO: '#f59e0b',
    TRANSPORTE:  '#3b82f6',
    SAUDE:       '#10b981',
    EDUCACAO:    '#8b5cf6',
    LAZER:       '#f97316',
    VESTUARIO:   '#ec4899',
    OUTROS:      '#6b7280',
};

const CAT_LABELS = {
    MORADIA: 'Moradia', ALIMENTACAO: 'Alimentação', TRANSPORTE: 'Transporte',
    SAUDE: 'Saúde', EDUCACAO: 'Educação', LAZER: 'Lazer',
    VESTUARIO: 'Vestuário', OUTROS: 'Outros',
};

const TIPO_CONTA_ICONS = {
    CONTA_CORRENTE: 'ti-building-bank',
    CONTA_POUPANCA: 'ti-piggy-bank',
    CARTAO_CREDITO: 'ti-credit-card',
    INVESTIMENTO:   'ti-chart-line',
    DINHEIRO:       'ti-cash',
    OUTRO:          'ti-wallet',
};

const TIPO_CONTA_LABELS = {
    CONTA_CORRENTE: 'Conta Corrente',
    CONTA_POUPANCA: 'Poupança',
    CARTAO_CREDITO: 'Cartão de Crédito',
    INVESTIMENTO:   'Investimento',
    DINHEIRO:       'Dinheiro',
    OUTRO:          'Outro',
};

document.addEventListener('DOMContentLoaded', () => {
    const mesNome = capitalizar(new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }));
    document.getElementById('subtitulo').textContent = `Visão geral · ${mesNome}`;
    document.getElementById('mesChart').textContent = mesNome;

    carregarUsuario();
    carregarDashboard();
});

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarios/me');
        if (!res.ok) { window.location.href = '/login'; return; }
        const { email } = await res.json();
        document.getElementById('sidebarEmail').textContent = email;
        document.querySelector('.user-avatar').textContent = email.substring(0, 2).toUpperCase();
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }
}

async function carregarDashboard() {
    try {
        const res = await fetch('/api/dashboard');
        if (res.status === 401 || res.status === 403) {
            window.location.href = '/login';
            return;
        }
        const d = await res.json();
        renderKpis(d);
        renderChart(d.despesasPorCategoria);
        renderContas(d.contas);
        renderRecentes(d.lancamentosRecentes);
    } catch (e) {
        console.error('Erro ao carregar dashboard:', e);
    }
}

function renderKpis(d) {
    document.getElementById('receitasMes').textContent  = formatVal(d.receitasMes);
    document.getElementById('despesasMes').textContent  = formatVal(d.despesasMes);
    document.getElementById('pendentes').textContent    = d.lancamentosPendentes;

    const saldoEl = document.getElementById('saldoTotal');
    saldoEl.textContent = formatVal(d.saldoTotal);
    if (parseFloat(d.saldoTotal) < 0) saldoEl.classList.add('negative');

    const resultEl = document.getElementById('resultadoMes');
    resultEl.textContent = formatVal(d.resultadoMes);
    resultEl.className = 'kpi-value ' + (parseFloat(d.resultadoMes) >= 0 ? 'positive' : 'negative');
}

function renderChart(categorias) {
    const canvas = document.getElementById('categoriaChart');
    const empty  = document.getElementById('chartEmpty');
    const legend = document.getElementById('categoriaLegend');

    if (!categorias || categorias.length === 0) {
        canvas.style.display = 'none';
        empty.style.display  = 'flex';
        legend.innerHTML = '';
        return;
    }

    canvas.style.display = 'block';
    empty.style.display  = 'none';

    const labels = categorias.map(c => CAT_LABELS[c.categoria] || c.categoria);
    const values = categorias.map(c => parseFloat(c.total));
    const colors = categorias.map(c => CAT_CORES[c.categoria] || '#94a3b8');

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${formatVal(ctx.raw)} (${categorias[ctx.dataIndex].percentual}%)`
                    }
                }
            }
        }
    });

    legend.innerHTML = categorias.map((c, i) => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${colors[i]}"></span>
            <span class="legend-name">${labels[i]}</span>
            <span class="legend-pct">${c.percentual}%</span>
        </div>
    `).join('');
}

function renderContas(contas) {
    const el = document.getElementById('accountsList');

    if (!contas || contas.length === 0) {
        el.innerHTML = `<div class="empty-state"><i class="ti ti-wallet"></i><p>Nenhuma conta cadastrada</p></div>`;
        return;
    }

    el.innerHTML = contas.map(c => {
        const saldo = parseFloat(c.saldoAtual);
        const icon  = TIPO_CONTA_ICONS[c.tipoConta]  || 'ti-wallet';
        const label = TIPO_CONTA_LABELS[c.tipoConta] || c.tipoConta;
        return `
        <div class="account-item">
            <div class="account-icon"><i class="ti ${icon}"></i></div>
            <div class="account-info">
                <span class="account-name">${c.nome || label}</span>
                <span class="account-type">${label}</span>
            </div>
            <span class="account-balance ${saldo < 0 ? 'negative' : ''}">${formatVal(saldo)}</span>
        </div>`;
    }).join('');
}

function renderRecentes(lancamentos) {
    const tbody = document.getElementById('recentesBody');

    if (!lancamentos || lancamentos.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><i class="ti ti-inbox"></i><p>Nenhum lançamento encontrado</p></td></tr>`;
        return;
    }

    tbody.innerHTML = lancamentos.map(l => {
        const [y, m, d] = l.data.split('-');
        const cor   = l.tipoLancamento === 'RECEITA' ? '#16a34a' : l.tipoLancamento === 'DESPESA' ? '#dc2626' : '#6b7280';
        const sinal = l.tipoLancamento === 'RECEITA' ? '+' : l.tipoLancamento === 'DESPESA' ? '-' : '⇄';

        const tipoBadges = {
            RECEITA:       'badge-receita',
            DESPESA:       'badge-despesa',
            TRANSFERENCIA: 'badge-transferencia',
        };
        const statusBadges = {
            PAGO:      ['badge-pago',      'Pago'],
            PENDENTE:  ['badge-pendente',  'Pendente'],
            CANCELADO: ['badge-cancelado', 'Cancelado'],
        };
        const tipoLabel  = { RECEITA: 'Receita', DESPESA: 'Despesa', TRANSFERENCIA: 'Transferência' };
        const [stCls, stLabel] = statusBadges[l.statusLancamento] || ['', l.statusLancamento];

        return `
        <tr>
            <td>${d}/${m}/${y}</td>
            <td><span class="badge ${tipoBadges[l.tipoLancamento] || ''}">${tipoLabel[l.tipoLancamento] || l.tipoLancamento}</span></td>
            <td>${l.descricao || '—'}</td>
            <td>${CAT_LABELS[l.categoriaLancamento] || l.categoriaLancamento || '—'}</td>
            <td>${l.contaNome || '—'}</td>
            <td style="font-weight:600;color:${cor}">${sinal} ${formatVal(l.valor)}</td>
            <td><span class="badge ${stCls}">${stLabel}</span></td>
        </tr>`;
    }).join('');
}

async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
}

function formatVal(v) {
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function capitalizar(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
