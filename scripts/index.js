var account_menu_is_shown = false;

function toggleaccountmenu() { if (account_menu_is_shown == false) { document.getElementById("account").style.display = "block"; } else { document.getElementById("account").style.display = "none"; } account_menu_is_shown = !account_menu_is_shown; }
const fetchRequest = async (action, extraData = {}) => {
    try {
        const resposta = await fetch("https://archsource.xyz/api/mail", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ action, ...extraData })
        });
        const dados = await resposta.json();
        return { status: resposta.status, response: dados.response };
    } catch { return { status: 0 }; }
};
const updateInbox = async () => {
    const { status, response } = await fetchRequest("read");
    const inbox = document.getElementById("inbox");

    inbox.innerHTML = "";

    if (status !== 200 || !response) {
        inbox.innerHTML = "<p>Erro ao carregar mensagens.</p>";
        return;
    }

    const mensagens = response.split("\n").filter(l => l.trim() !== "");

    for (const linha of mensagens) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "mensagem";
        msgDiv.innerText = linha;
        inbox.appendChild(msgDiv);
    }
};

window.onload = () => {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const buttons = {
        fetch: async () => { updateInbox(); },
        send: async () => {
            const { value: target } = await Swal.fire({ title: 'Destinatário:', input: 'text', inputPlaceholder: 'Nome do usuário', showCancelButton: true });
            if (!target) return Swal.fire('Erro', 'Destinatário não pode estar vazio!', 'error');

            const { value: content } = await Swal.fire({ title: 'Mensagem:', input: 'text', inputPlaceholder: 'Escreva sua mensagem', showCancelButton: true });
            if (!content) return Swal.fire('Erro', 'Você não pode mandar uma mensagem vazia!', 'error');

            const confirm = await Swal.fire({ title: 'Enviar mensagem', html: `Destinatário: <strong>${target}</strong><br><br>Conteúdo: <em>${content}</em>`, icon: 'question', showCancelButton: true, confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return Swal.fire('Cancelado', 'Envio cancelado.', 'info');

            const { status } = await fetchRequest("send", { to: target, content });
            if (status == 200) Swal.fire('Sucesso', 'Sua mensagem foi enviada!', 'success');
            else if (status == 404) Swal.fire('Erro', 'O destinatário não foi encontrado!', 'error');
            else Swal.fire('Erro', 'Erro ao enviar mensagem.', 'error');
        },
        clear: async () => {
            const confirm = await Swal.fire({ title: 'Tem certeza?', text: 'Tem certeza que deseja limpar suas mensagens?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return;

            const { status } = await fetchRequest("clear");
            if (status == 200) Swal.fire('Sucesso', 'Suas mensagens foram apagadas!', 'success');
            else Swal.fire('Erro', 'Erro ao limpar mensagens.', 'error');
        },
        transfer: async () => {
            const { value: target } = await Swal.fire({ title: 'Destinatário:', input: 'text', inputPlaceholder: 'Nome do destinatário', showCancelButton: true });
            if (!target) return Swal.fire('Erro', 'Destinatário não pode estar vazio!', 'error');

            const { value: amount } = await Swal.fire({ title: 'Quantidade:', input: 'number', inputPlaceholder: 'Quantas moedas?', showCancelButton: true });
            if (!amount) return Swal.fire('Erro', 'Você precisa informar a quantidade!', 'error');

            const confirm = await Swal.fire({ title: 'Confirmar transferência', text: `Tem certeza que deseja enviar ${amount} moedas para ${target}?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return Swal.fire('Cancelado', 'Transferência cancelada.', 'info');

            const { status } = await fetchRequest("transfer", { to: target, amount });
            if (status == 200) Swal.fire('Sucesso', 'Moedas enviadas!', 'success');
            else if (status == 404) Swal.fire('Erro', 'O destinatário não foi encontrado!', 'error');
            else if (status == 406) Swal.fire('Erro', 'A quantia de moedas a ser enviada é inválida!', 'error');
            else if (status == 401) Swal.fire('Erro', 'Saldo insuficiente!', 'error');
            else Swal.fire('Erro', 'Erro ao transferir.', 'error');
        },
        search: async () => {
            const { value: user } = await Swal.fire({ title: 'Quem deseja procurar?', input: 'text', inputPlaceholder: 'Nome de usuário', showCancelButton: true });
            if (!user) return Swal.fire('Erro', 'Insira um nome de usuario!', 'error');

            const { status, response } = await fetchRequest("search", { user });
            if (status == 200) Swal.fire('Resultado', response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>"), 'info');
            else if (status == 404) Swal.fire('Erro', 'O usuário não foi encontrado!', 'error');
            else Swal.fire('Erro', 'Erro ao procurar.', 'error');
        },
        me: async () => {
            const { status, response } = await fetchRequest("me");
            if (status == 200) Swal.fire('Seus dados', response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>"), 'info');
            else if (status == 404) window.location.href = "login";
            else Swal.fire('Erro', 'Erro ao consultar.', 'error');
        },
        coins: async () => {
            const { status, response } = await fetchRequest("coins");
            if (status == 200) Swal.fire('Suas moedas', response, 'info');
            else if (status == 404) window.location.href = "login";
            else Swal.fire('Erro', 'Erro ao consultar.', 'error');
        },
        agent: () => window.location.href = "/agent",
        drive: () => window.location.href = "/drive",
        options: () => window.location.href = "options",
        security: () => window.location.href = "security"
    };

    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", buttons[id]);
    });
};
