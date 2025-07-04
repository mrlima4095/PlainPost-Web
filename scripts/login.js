async function autenticar(api) {
    const usernameInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const captchaCheckbox = document.getElementById("naoSouRobo");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Verifica se os campos estão preenchidos
    if (!username || !password) {
        Swal.fire("Campos obrigatórios", "Preencha todos os campos.", "warning");
        return;
    }

    // Verifica se o usuário marcou o checkbox
    if (!captchaCheckbox.checked) {
        Swal.fire("Verificação necessária", "Marque a caixa 'Não sou um robô' para continuar.", "warning");
        return;
    }

    try {
        const resposta = await fetch("https://archsource.xyz/api/" + api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (resposta.status === 200 || resposta.status === 201) {
            window.location.href = "/";
        } else if (resposta.status === 401) {
            Swal.fire("Erro", "Usuário ou senha incorretos!", "error");
            usernameInput.value = "";
            passwordInput.value = "";
            captchaCheckbox.checked = false;
        } else if (resposta.status === 409) {
            Swal.fire("Erro", "Este nome de usuário já está em uso!", "error");
        }
    } catch (erro) {
        Swal.fire("Erro", "Erro na conexão com o servidor.", "error");
    }
}


window.onload = () => {
    const form = document.querySelector("form");
    const botoes = form.querySelectorAll("button");

    botoes[0].addEventListener("click", function (event) { event.preventDefault(); autenticar("login"); });
    botoes[1].addEventListener("click", function (event) { event.preventDefault(); autenticar("signup"); });
};
 