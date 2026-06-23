// ── Inicialização ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuario();
    aplicarTemaInicial();
});

// ── Usuário ───────────────────────────────────────
async function carregarUsuario() {
    try {
        const res = await fetch('/api/usuarios/me');
        if (!res.ok) { window.location.href = '/login'; return; }
        const { email } = await res.json();
        document.getElementById('sidebarEmail').textContent = email;
        document.getElementById('userAvatar').textContent = email.substring(0, 2).toUpperCase();
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }
}

// ── Alterar Senha ─────────────────────────────────
async function alterarSenha() {
    const senhaAtual = document.getElementById('senhaAtual').value;
    const senhaNova  = document.getElementById('senhaNova').value;
    const confirmar  = document.getElementById('confirmarSenha').value;

    if (!senhaAtual || !senhaNova || !confirmar) {
        mostrarErroSenha('Preencha todos os campos.');
        return;
    }
    if (senhaNova !== confirmar) {
        mostrarErroSenha('A nova senha e a confirmação não coincidem.');
        return;
    }
    if (senhaNova.length < 6) {
        mostrarErroSenha('A nova senha deve ter no mínimo 6 caracteres.');
        return;
    }

    esconderErroSenha();
    const btn = document.getElementById('btnSalvarSenha');
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Salvando...';

    try {
        const res = await fetch('/api/usuarios/senha', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaAtual, senhaNova }),
        });

        if (res.ok) {
            document.getElementById('senhaAtual').value    = '';
            document.getElementById('senhaNova').value     = '';
            document.getElementById('confirmarSenha').value = '';
            mostrarSucessoSenha('Senha alterada com sucesso!');
        } else {
            const msg = await res.text();
            mostrarErroSenha(msg || 'Não foi possível alterar a senha.');
        }
    } catch (e) {
        mostrarErroSenha('Erro ao conectar ao servidor.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ti ti-check"></i> Salvar senha';
    }
}

function mostrarErroSenha(msg) {
    const el = document.getElementById('senhaFeedback');
    el.textContent = msg;
    el.className = 'feedback-msg error';
    el.style.display = 'block';
}

function mostrarSucessoSenha(msg) {
    const el = document.getElementById('senhaFeedback');
    el.textContent = msg;
    el.className = 'feedback-msg success';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function esconderErroSenha() {
    document.getElementById('senhaFeedback').style.display = 'none';
}

// ── Tema ──────────────────────────────────────────
function aplicarTemaInicial() {
    const tema = localStorage.getItem('theme') || 'light';
    aplicarTema(tema, false);
}

function aplicarTema(tema, salvar = true) {
    if (tema === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tema === tema);
    });
    if (salvar) localStorage.setItem('theme', tema);
}

// ── Excluir Conta ─────────────────────────────────
async function excluirConta() {
    const { isConfirmed } = await Swal.fire({
        icon: 'warning',
        title: 'Excluir conta?',
        html: 'Todos os seus dados (<b>contas, lançamentos e histórico</b>) serão permanentemente apagados.<br><br>Essa ação <b>não pode ser desfeita</b>.',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir tudo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6482d8',
        reverseButtons: true,
    });

    if (!isConfirmed) return;

    const { isConfirmed: confirmado2 } = await Swal.fire({
        icon: 'warning',
        title: 'Tem certeza absoluta?',
        text: 'Esta é a sua última chance. A exclusão é irreversível.',
        showCancelButton: true,
        confirmButtonText: 'Excluir permanentemente',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6482d8',
        reverseButtons: true,
    });

    if (!confirmado2) return;

    try {
        const res = await fetch('/api/usuarios/me', { method: 'DELETE' });
        if (res.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Conta excluída',
                text: 'Seus dados foram apagados. Até logo!',
                confirmButtonColor: '#6482d8',
                timer: 2500,
                showConfirmButton: false,
            });
            window.location.href = '/login';
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível excluir a conta.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

// ── Logout ────────────────────────────────────────
async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
}
