// Função de Login
async function realizarLogin() {
    const email = document.getElementById('username').value; // Ajuste o ID conforme seu HTML
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: senha })
        });

        if (response.ok) {
            alert('Login realizado com sucesso!');
            window.location.href = '/dashboard';
        } else {
            alert('Erro: Usuário ou senha inválidos.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Função de Registro
async function realizarRegistro() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, senha: senha })
        });

        if (response.ok) {
            alert('Conta criada com sucesso!');
            window.location.href = '/login.html';
        } else {
            alert('Erro ao criar conta. Tente outro e-mail.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
}