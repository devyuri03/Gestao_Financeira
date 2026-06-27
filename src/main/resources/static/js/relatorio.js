const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const TIPO_LABEL = {
    RECEITA: 'Receita', DESPESA: 'Despesa', TRANSFERENCIA: 'Transferência'
};

const CAT_LABEL = {
    MORADIA: 'Moradia', ALIMENTACAO: 'Alimentação', TRANSPORTE: 'Transporte',
    SAUDE: 'Saúde', EDUCACAO: 'Educação', LAZER: 'Lazer',
    VESTUARIO: 'Vestuário', OUTROS: 'Outros'
};

const PAG_LABEL = {
    PIX: 'Pix', CARTAO_CREDITO: 'Cartão de Crédito', CARTAO_DEBITO: 'Cartão de Débito',
    DINHEIRO: 'Dinheiro', BOLETO: 'Boleto'
};

const STATUS_LABEL = {
    PAGO: 'Pago', PENDENTE: 'Pendente', CANCELADO: 'Cancelado'
};

let dadosRelatorio = null;

// ── Inicialização ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuario();
    popularAnos();
    selecionarMesAtual();
});

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarios/me');
        if (!res.ok) { window.location.href = '/login'; return; }
        const { email } = await res.json();
        document.getElementById('sidebarEmail').textContent = email;
        document.getElementById('sidebarName').textContent = email.split('@')[0];
        document.getElementById('userAvatar').textContent = email.substring(0, 2).toUpperCase();
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }
}

function popularAnos() {
    const select = document.getElementById('selectAno');
    const anoAtual = new Date().getFullYear();
    for (let a = anoAtual; a >= anoAtual - 4; a--) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        select.appendChild(opt);
    }
}

function selecionarMesAtual() {
    const now = new Date();
    document.getElementById('selectMes').value = now.getMonth() + 1;
    document.getElementById('selectAno').value = now.getFullYear();
}

// ── Gerar relatório ───────────────────────────────
async function gerarRelatorio() {
    const mes = document.getElementById('selectMes').value;
    const ano = document.getElementById('selectAno').value;

    mostrar('estadoLoading');
    esconder('estadoInicial');
    esconder('secaoResultado');

    try {
        const res = await fetch(`/api/relatorio?mes=${mes}&ano=${ano}`);
        if (res.status === 401 || res.status === 403) { window.location.href = '/login'; return; }
        if (!res.ok) throw new Error('Erro ao buscar relatório');

        dadosRelatorio = await res.json();
        renderizarRelatorio(dadosRelatorio);
    } catch (e) {
        console.error(e);
        mostrar('estadoInicial');
    } finally {
        esconder('estadoLoading');
    }
}

function renderizarRelatorio(d) {
    document.getElementById('sumReceitas').textContent  = formatVal(d.totalReceitas);
    document.getElementById('sumDespesas').textContent  = formatVal(d.totalDespesas);
    document.getElementById('exportLabel').textContent  = `Relatório — ${d.nomeMes}`;

    const resultEl = document.getElementById('sumResultado');
    resultEl.textContent = formatVal(d.resultado);
    resultEl.className = 'summary-value ' + (parseFloat(d.resultado) >= 0 ? 'positive' : 'negative');

    document.getElementById('sumQtd').textContent = d.quantidadeLancamentos;

    const tbody = document.getElementById('tbodyRelatorio');

    if (!d.itens || d.itens.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">
                    <i class="ti ti-inbox"></i>
                    <p>Nenhum lançamento encontrado para este período</p>
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = d.itens.map(item => {
            const [y, m, dia] = item.data.split('-');
            const tipoBadge = {
                RECEITA: 'badge-receita', DESPESA: 'badge-despesa', TRANSFERENCIA: 'badge-transferencia'
            }[item.tipo] || '';
            const statusBadge = {
                PAGO: 'badge-pago', PENDENTE: 'badge-pendente', CANCELADO: 'badge-cancelado'
            }[item.status] || '';
            const cor = item.tipo === 'RECEITA' ? '#16a34a' : item.tipo === 'DESPESA' ? '#dc2626' : '#64748b';
            const sinal = item.tipo === 'RECEITA' ? '+' : item.tipo === 'DESPESA' ? '-' : '⇄';

            return `
            <tr>
                <td>${dia}/${m}/${y}</td>
                <td><span class="badge ${tipoBadge}">${TIPO_LABEL[item.tipo] || item.tipo}</span></td>
                <td>${item.descricao || '—'}</td>
                <td>${CAT_LABEL[item.categoria] || item.categoria || '—'}</td>
                <td>${PAG_LABEL[item.formaPagamento] || item.formaPagamento || '—'}</td>
                <td>${item.conta || '—'}</td>
                <td style="font-weight:600;color:${cor}">${sinal} ${formatVal(item.valor)}</td>
                <td><span class="badge ${statusBadge}">${STATUS_LABEL[item.status] || item.status}</span></td>
            </tr>`;
        }).join('');
    }

    mostrar('secaoResultado');
}

// ── Exportar Excel ────────────────────────────────
function exportarExcel() {
    if (!dadosRelatorio) return;

    const cabecalho = [['Relatório Mensal — ' + dadosRelatorio.nomeMes]];
    const resumo = [
        [],
        ['Resumo'],
        ['Total Receitas', formatVal(dadosRelatorio.totalReceitas)],
        ['Total Despesas', formatVal(dadosRelatorio.totalDespesas)],
        ['Resultado',      formatVal(dadosRelatorio.resultado)],
        ['Lançamentos',    dadosRelatorio.quantidadeLancamentos],
        []
    ];

    const colunas = [['Data', 'Tipo', 'Descrição', 'Categoria', 'Pagamento', 'Conta', 'Valor', 'Status']];

    const linhas = dadosRelatorio.itens.map(item => {
        const [y, m, dia] = item.data.split('-');
        return [
            `${dia}/${m}/${y}`,
            TIPO_LABEL[item.tipo] || item.tipo,
            item.descricao || '',
            CAT_LABEL[item.categoria] || item.categoria || '',
            PAG_LABEL[item.formaPagamento] || item.formaPagamento || '',
            item.conta || '',
            parseFloat(item.valor),
            STATUS_LABEL[item.status] || item.status
        ];
    });

    const dados = [...cabecalho, ...resumo, ...colunas, ...linhas];
    const ws = XLSX.utils.aoa_to_sheet(dados);

    ws['!cols'] = [
        { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 16 },
        { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio-${dadosRelatorio.nomeMes.replace(' ', '-')}.xlsx`);
}

// ── Exportar PDF ──────────────────────────────────
function exportarPDF() {
    if (!dadosRelatorio) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.setTextColor(26, 26, 46);
    doc.text(`Relatório Mensal — ${dadosRelatorio.nomeMes}`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 28, 283, 28);

    doc.setFontSize(10);
    doc.setTextColor(26, 26, 46);
    doc.text('Receitas:', 14, 36);
    doc.setTextColor(22, 163, 74);
    doc.text(formatVal(dadosRelatorio.totalReceitas), 50, 36);

    doc.setTextColor(26, 26, 46);
    doc.text('Despesas:', 100, 36);
    doc.setTextColor(220, 38, 38);
    doc.text(formatVal(dadosRelatorio.totalDespesas), 136, 36);

    doc.setTextColor(26, 26, 46);
    doc.text('Resultado:', 186, 36);
    const cor = parseFloat(dadosRelatorio.resultado) >= 0 ? [22, 163, 74] : [220, 38, 38];
    doc.setTextColor(...cor);
    doc.text(formatVal(dadosRelatorio.resultado), 222, 36);

    const linhas = dadosRelatorio.itens.map(item => {
        const [y, m, dia] = item.data.split('-');
        const sinal = item.tipo === 'RECEITA' ? '+' : item.tipo === 'DESPESA' ? '-' : '⇄';
        return [
            `${dia}/${m}/${y}`,
            TIPO_LABEL[item.tipo] || item.tipo,
            item.descricao || '—',
            CAT_LABEL[item.categoria] || '—',
            PAG_LABEL[item.formaPagamento] || '—',
            item.conta || '—',
            `${sinal} ${formatVal(item.valor)}`,
            STATUS_LABEL[item.status] || item.status
        ];
    });

    doc.autoTable({
        startY: 44,
        head: [['Data', 'Tipo', 'Descrição', 'Categoria', 'Pagamento', 'Conta', 'Valor', 'Status']],
        body: linhas,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [100, 130, 216], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 6: { halign: 'right' } },
        margin: { left: 14, right: 14 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' });
    }

    doc.save(`relatorio-${dadosRelatorio.nomeMes.replace(' ', '-')}.pdf`);
}

// ── Logout ────────────────────────────────────────
async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
}

// ── Helpers ───────────────────────────────────────
function formatVal(v) {
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mostrar(id) { document.getElementById(id).classList.remove('hidden'); }
function esconder(id) { document.getElementById(id).classList.add('hidden'); }
