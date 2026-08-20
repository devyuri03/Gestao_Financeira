// Anexa automaticamente o token CSRF (cookie XSRF-TOKEN) em toda requisição
// fetch de escrita (POST/PUT/DELETE/PATCH), já que o Spring Security agora
// exige o token nesses métodos.
(function () {
    const originalFetch = window.fetch.bind(window);

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    window.fetch = function (input, init = {}) {
        const method = (init.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const token = getCookie('XSRF-TOKEN');
            if (token) {
                const headers = new Headers(init.headers || {});
                headers.set('X-XSRF-TOKEN', token);
                init = { ...init, headers };
            }
        }
        return originalFetch(input, init);
    };
})();
