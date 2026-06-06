// ── Login ────────────────────────────────────────
async function realizarLogin() {
    const email = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todos os campos.', confirmButtonColor: '#6482d8' });
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: senha })
        });

        if (res.ok) {
            window.location.href = '/lancamento.html';
        } else {
            Swal.fire({ icon: 'error', title: 'Acesso negado', text: 'Email ou senha incorretos.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

// ── Registro ─────────────────────────────────────
async function realizarRegistro() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha todos os campos.', confirmButtonColor: '#6482d8' });
        return;
    }

    try {
        const res = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (res.ok) {
            await Swal.fire({ icon: 'success', title: 'Conta criada!', text: 'Faça login para continuar.', confirmButtonColor: '#6482d8' });
            window.location.href = '/login.html';
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível criar a conta. Tente outro e-mail.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}
