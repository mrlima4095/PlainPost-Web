async function autenticar(api) {
    const usernameInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const captchaCheckbox = document.getElementById("not-robot");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) { Swal.fire({ title: "Campos obrigatórios", text: "Preencha todos os campos.", icon: "warning" }); return; }
    if (!captchaCheckbox.checked) { Swal.fire({ title: "Verificação necessária", text: "Marque a caixa 'Não sou um robô' para continuar.", icon: "warning" }); return; }

    if (api === "signup") {
        const { value: accepted } = await Swal.fire({ title: "Aceite os Termos", html: `Você concorda com nossa <a href="docs/policy" target="_blank">Política de Privacidade</a> e <a href="docs/service" target="_blank">Termos de Serviço</a>?<br><br><input type="checkbox" id="termos" /><label for="termos"> Eu concordo</label>`, icon: "question", confirmButtonText: "Continuar", preConfirm: () => { const checkbox = document.getElementById("termos"); if (!checkbox.checked) { Swal.showValidationMessage("Você precisa aceitar os termos para continuar."); return false; } return true; } });
        if (!accepted) return;
    }

    try {
        const resposta = await fetch("https://archsource.xyz/api/" + api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });

        if (resposta.status === 200 || resposta.status === 201) { window.location.href = "/"; } 
        else if (resposta.status === 401) { Swal.fire({ title: "Erro", text: "Usuário ou senha incorretos!", icon: "error" }); usernameInput.value = ""; passwordInput.value = ""; } 
        else if (resposta.status === 409) { Swal.fire({ title: "Erro", text: "Este nome de usuário esta indisponível!", icon: "error"}); }
        
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
 