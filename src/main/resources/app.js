function realizarLogin() {
    // Captura os valores dos inputs pelo nome
    const form = document.getElementById('loginForm');
    const loginData = {
        username: form.elements['username'].value,
        password: form.elements['password'].value
    };

    // Validação básica no front-end
    if (!loginData.username || !loginData.password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Envia os dados para o servidor
    fetch('/api/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (response.ok) {
            // Se o login for bem sucedido, redireciona para o dashboard
            alert('Login realizado com sucesso!');
            window.location.href = '/dashboard'; 
        } else {
            // Se o servidor retornar erro (401, 403, etc.)
            alert('Erro: Usuário ou senha inválidos.');
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    });
}