async function autenticar(api) {
    const usernameInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const captchaCheckbox = document.getElementById("not-robot");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) { Swal.fire({ title: "Campos obrigatórios", text: "Preencha todos os campos.", icon: "warning" }); return; }
    if (!captchaCheckbox.checked) { Swal.fire({ title: "Verificação necessária", text: "Marque a caixa 'Não sou um robô' para continuar.", icon: "warning" }); return; }

    try {
        const resposta = await fetch("https://archsource.xyz/api/" + api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });

        if (resposta.status === 200 || resposta.status === 201) { window.location.href = "/"; } 
        else if (resposta.status === 401) { Swal.fire({ title: "Erro", text: "Usuário ou senha incorretos!", icon: "error" }); usernameInput.value = ""; passwordInput.value = ""; } 
        else if (resposta.status === 409) { Swal.fire({ title: "Erro", text: "Este nome de usuário já está em uso!", icon: "error"}); }
        
        captchaCheckbox.checked = false;
    } 
    catch (erro) { Swal.fire({ title: "Erro", text: "Erro na conexão com o servidor.", icon: "error" }); }
}

window.onload = () => {
    const form = document.querySelector("form");
    const botoes = form.querySelectorAll("button");

    botoes[0].addEventListener("click", function (event) { event.preventDefault(); autenticar("login"); });
    botoes[1].addEventListener("click", function (event) { event.preventDefault(); autenticar("signup"); });
};
 