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
            window.location.href = '/lancamento';
        } else {
            Swal.fire({ icon: 'error', title: 'Acesso negado', text: 'Email ou senha incorretos.', confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

// ── Registro ─────────────────────────────────────
async function realizarRegistro() {
    const email = document.getElementById('email').value.trim();
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
            window.location.href = '/login';
        } else {
            const texto = await lerErro(res);
            Swal.fire({ icon: 'error', title: 'Erro ao criar conta', text: texto, confirmButtonColor: '#6482d8' });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível conectar ao servidor.', confirmButtonColor: '#6482d8' });
    }
}

async function lerErro(res) {
    try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const body = await res.json();
            if (typeof body === 'object' && body !== null) {
                const msgs = Object.values(body);
                return msgs.length > 0 ? msgs.join('\n') : 'Erro desconhecido.';
            }
            return String(body);
        }
        const txt = await res.text();
        return txt || 'Erro desconhecido.';
    } catch {
        return 'Erro desconhecido.';
    }
}
