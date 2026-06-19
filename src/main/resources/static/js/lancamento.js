let todosLancamentos = [];
let editandoId = null;

// ── Inicialização ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    carregarLancamentos();
    carregarUsuario();
    carregarContas();
    document.getElementById('dataLancamento').value = new Date().toISOString().split('T')[0];
});

async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarios/me');
        if (!res.ok) return;
        const { email } = await res.json();
        document.getElementById('sidebarEmail').textContent = email;
        const iniciais = email.substring(0, 2).toUpperCase();
        document.querySelector('.user-avatar').textContent = iniciais;
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }
}

// ── API ──────────────────────────────────────────
let todasContas = [];

async function carregarContas() {
    try {
        const res = await fetch('/api/contas');
        if (!res.ok) return;
        todasContas = await res.json();
        popularSelectContas();
    } catch (e) {
        console.error('Erro ao carregar contas:', e);
    }
}

function popularSelectContas(contaIdSelecionada = null) {
    const select = document.getElementById('contaLancamento');
    select.innerHTML = '<option value="">Sem conta vinculada</option>';
    todasContas.forEach(conta => {
        const opt = document.createElement('option');
        opt.value = conta.id;
        opt.textContent = conta.nome || conta.tipoConta;
        if (conta.id === contaIdSelecionada) opt.selected = true;
        select.appendChild(opt);
    });
}

async function carregarLancamentos() {
    try {
        const res = await fetch('/api/gastos');
        if (res.status === 401 || res.status === 403) {
            window.location.href = '/login.html';
            return;
        }
        todosLancamentos = await res.json();
        renderizarTabela(todosLancamentos);
        atualizarCards(todosLancamentos);
    } catch (e) {
        console.error('Erro ao carregar lançamentos:', e);
    }
}

async function salvarLancamento(e) {
    e.preventDefault();

    const isEdicao     = editandoId !== null;
    const isParcelado  = !isEdicao && document.getElementById('chkParcelado').checked;
    const numParcelas  = isParcelado ? parseInt(document.getElementById('numeroParcelas').value) : 1;

    if (isParcelado && (!numParcelas || numParcelas < 2)) {
        Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Informe o número de parcelas (mínimo 2).', confirmButtonColor: '#6482d8' });
        return;
    }

    const contaIdRaw  = document.getElementById('contaLancamento').value;
    const valorTotal  = parseFloat(document.getElementById('valorLancamento').value);
    const descricao   = document.getElementById('descricaoLancamento').value;
    const dataBase    = document.getElementById('dataLancamento').value;
    const tipo        = document.getElementById('tipoLancamento').value;
    const status      = document.getElementById('statusLancamento').value;
    const categoria   = document.getElementById('categoriaLancamento').value;
    const pagamento   = document.getElementById('pagamentoLancamento').value;
    const contaId     = contaIdRaw ? parseInt(contaIdRaw) : null;

    if (isParcelado) {
        const valorParcela = parseFloat((valorTotal / numParcelas).toFixed(2));
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const erros = [];

        for (let i = 0; i < numParcelas; i++) {
            const [y, m, d] = dataBase.split('-').map(Number);
            const dataParcela = new Date(y, m - 1 + i, d);
            const statusParcela = dataParcela <= hoje ? 'PAGO' : 'PENDENTE';

            const body = {
                valor: valorParcela,
                descricao: `${descricao} (${i + 1}/${numParcelas})`,
                data: dataParcela.toISOString().split('T')[0],
                tipoLancamento: tipo,
                statusLancamento: statusParcela,
                categoriaLancamento: categoria,
                pagamentoLancamento: pagamento,
                contaId,
            };

            try {
                const res = await fetch('/api/gastos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) erros.push(i + 1);
            } catch {
                erros.push(i + 1);
            }
        }

        fecharModal();
        carregarLancamentos();

        if (erros.length === 0) {
            Swal.fire({
                icon: 'success',
                title: 'Parcelado!',
                text: `${numParcelas} parcelas criadas com sucesso.`,
                confirmButtonColor: '#6482d8',
                timer: 2500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({ icon: 'warning', title: 'Parcial', text: `Erro ao criar parcelas: ${erros.join(', ')}.`, confirmButtonColor: '#6482d8' });
        }
        return;
    }

    const body = {
        valor: valorTotal,
        descricao,
        data: dataBase,
        tipoLancamento: tipo,
        statusLancamento: status,
        categoriaLancamento: categoria,
        pagamentoLancamento: pagamento,
        contaId,
    };

    const url    = isEdicao ? `/api/gastos/${editandoId}` : '/api/gastos';
    const method = isEdicao ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            fecharModal();
            carregarLancamentos();
            Swal.fire({
                icon: 'success',
                title: isEdicao ? 'Atualizado!' : 'Salvo!',
                text: isEdicao ? 'Lançamento atualizado com sucesso.' : 'Lançamento criado com sucesso.',
                confirmButtonColor: '#6482d8',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar o lançamento.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

async function deletarLancamento(id) {
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'Excluir lançamento?',
        text: 'Essa ação não pode ser desfeita.',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`/api/gastos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            carregarLancamentos();
            Swal.fire({ icon: 'success', title: 'Excluído!', text: 'Lançamento removido com sucesso.', confirmButtonColor: '#6482d8', timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível excluir.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

// ── Renderização ─────────────────────────────────
function renderizarTabela(lista) {
    const tbody = document.getElementById('tbodyLancamentos');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <i class="ti ti-inbox"></i>
                    <p>Nenhum lançamento encontrado</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = lista.map(l => `
        <tr>
            <td>${formatarData(l.data)}</td>
            <td>${badgeTipo(l.tipoLancamento)}</td>
            <td>${l.descricao || '—'}</td>
            <td>${l.contaNome || '—'}</td>
            <td>${formatarCategoria(l.categoriaLancamento)}</td>
            <td>${formatarPagamento(l.pagamentoLancamento)}</td>
            <td style="font-weight:600; color:${l.tipoLancamento === 'RECEITA' ? '#16a34a' : l.tipoLancamento === 'DESPESA' ? '#dc2626' : '#6b7280'}">
                ${l.tipoLancamento === 'RECEITA' ? '+' : l.tipoLancamento === 'DESPESA' ? '-' : '⇄'} ${formatarValor(l.valor)}
            </td>
            <td>${badgeStatus(l.statusLancamento)}</td>
            <td>
                <button class="btn-action" onclick="abrirModalEdicao(${l.id})" title="Editar">
                    <i class="ti ti-pencil"></i>
                </button>
                <button class="btn-action delete" onclick="deletarLancamento(${l.id})" title="Excluir">
                    <i class="ti ti-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function atualizarCards(lista) {
    const receitas = lista.filter(l => l.tipoLancamento === 'RECEITA').reduce((s, l) => s + parseFloat(l.valor), 0);
    const despesas = lista.filter(l => l.tipoLancamento === 'DESPESA').reduce((s, l) => s + parseFloat(l.valor), 0);

    document.getElementById('totalReceitas').textContent    = formatarValor(receitas);
    document.getElementById('totalDespesas').textContent    = formatarValor(despesas);
    document.getElementById('totalLancamentos').textContent = lista.length;
}

// ── Filtros ──────────────────────────────────────
function filtrarTabela() {
    const busca  = document.getElementById('searchInput').value.toLowerCase();
    const tipo   = document.getElementById('filtroTipo').value;
    const status = document.getElementById('filtroStatus').value;

    const filtrado = todosLancamentos.filter(l => {
        const matchBusca  = !busca  || (l.descricao || '').toLowerCase().includes(busca) || (l.categoriaLancamento || '').toLowerCase().includes(busca);
        const matchTipo   = !tipo   || l.tipoLancamento === tipo;
        const matchStatus = !status || l.statusLancamento === status;
        return matchBusca && matchTipo && matchStatus;
    });

    renderizarTabela(filtrado);
}

// ── Parcelado ────────────────────────────────────
function onPagamentoChange() {
    const pagamento = document.getElementById('pagamentoLancamento').value;
    const isCredito = pagamento === 'CARTAO_CREDITO';
    document.getElementById('parceladoGroup').style.display = isCredito ? '' : 'none';
    if (!isCredito) {
        document.getElementById('chkParcelado').checked = false;
        document.getElementById('parcelasGroup').style.display = 'none';
    }
}

function toggleParcelas() {
    const checked = document.getElementById('chkParcelado').checked;
    document.getElementById('parcelasGroup').style.display = checked ? '' : 'none';
    if (checked) document.getElementById('numeroParcelas').focus();
}

function resetarParcelado() {
    document.getElementById('parceladoGroup').style.display = 'none';
    document.getElementById('parcelasGroup').style.display  = 'none';
    document.getElementById('chkParcelado').checked         = false;
    document.getElementById('numeroParcelas').value         = '';
}

// ── Modal ────────────────────────────────────────
function abrirModal() {
    editandoId = null;
    document.getElementById('modalTitulo').textContent = 'Novo Lançamento';
    document.getElementById('formLancamento').reset();
    document.getElementById('dataLancamento').value = new Date().toISOString().split('T')[0];
    resetarParcelado();
    popularSelectContas();
    document.getElementById('modalOverlay').classList.add('open');
}

function abrirModalEdicao(id) {
    const l = todosLancamentos.find(x => x.id === id);
    if (!l) return;

    editandoId = id;
    document.getElementById('modalTitulo').textContent = 'Editar Lançamento';

    document.getElementById('tipoLancamento').value       = l.tipoLancamento;
    document.getElementById('dataLancamento').value       = l.data;
    document.getElementById('descricaoLancamento').value  = l.descricao || '';
    document.getElementById('valorLancamento').value      = l.valor;
    document.getElementById('categoriaLancamento').value  = l.categoriaLancamento;
    document.getElementById('statusLancamento').value     = l.statusLancamento;
    document.getElementById('pagamentoLancamento').value  = l.pagamentoLancamento;
    resetarParcelado();
    popularSelectContas(l.contaId);

    document.getElementById('modalOverlay').classList.add('open');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    editandoId = null;
    resetarParcelado();
}

function fecharModalFora(e) {
    if (e.target === document.getElementById('modalOverlay')) fecharModal();
}

// ── Logout ───────────────────────────────────────
async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login.html';
}

// ── Helpers ──────────────────────────────────────
function formatarValor(v) {
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarData(d) {
    if (!d) return '—';
    const [y, m, dia] = d.split('-');
    return `${dia}/${m}/${y}`;
}

function formatarCategoria(c) {
    const map = {
        MORADIA: 'Moradia', ALIMENTACAO: 'Alimentação', TRANSPORTE: 'Transporte',
        SAUDE: 'Saúde', EDUCACAO: 'Educação', LAZER: 'Lazer',
        VESTUARIO: 'Vestuário', OUTROS: 'Outros'
    };
    return map[c] || c || '—';
}

function badgeTipo(t) {
    const map = {
        RECEITA:       ['badge-receita',       'ti-trending-up',    'Receita'],
        DESPESA:       ['badge-despesa',        'ti-trending-down',  'Despesa'],
        TRANSFERENCIA: ['badge-transferencia',  'ti-arrows-right-left', 'Transferência'],
    };
    const [cls, icon, label] = map[t] || ['', '', t];
    return `<span class="badge ${cls}"><i class="ti ${icon}"></i>${label}</span>`;
}

function formatarPagamento(p) {
    const map = {
        PIX:            'Pix',
        CARTAO_CREDITO: 'Cartão de Crédito',
        CARTAO_DEBITO:  'Cartão de Débito',
        DINHEIRO:       'Dinheiro',
        BOLETO:         'Boleto',
    };
    return map[p] || p || '—';
}

function badgeStatus(s) {
    const map = {
        PAGO:      ['badge-pago',      'Pago'],
        PENDENTE:  ['badge-pendente',  'Pendente'],
        CANCELADO: ['badge-cancelado', 'Cancelado'],
    };
    const [cls, label] = map[s] || ['', s];
    return `<span class="badge ${cls}">${label}</span>`;
}
