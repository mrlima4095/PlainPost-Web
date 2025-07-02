var menu_open = false;

function hideAllMenus() {
    document.getElementById("profile").style.display = "none";
    document.getElementById("options").style.display = "none";
    document.getElementById("security").style.display = "none";
}

function toggle_profile_menu() { hideAllMenus(); if (!menu_open) { document.getElementById("profile").style.display = "block"; menu_open = true; } else { menu_open = false; } }
function abrirServicos() {
    Swal.fire({
        title: 'Serviços',
        text: 'Escolha um dos serviços abaixo:',
        icon: 'info',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Fechar',
        footer: `
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="agentBtn" class="swal2-styled">🕵️ Agente S.</button>
                <button id="giteaBtn" class="swal2-styled">💻 ArchSource</button>
                <button id="driveBtn" class="swal2-styled">☁️ BinDrop</button>
            </div>
        `,
        didOpen: () => {
            document.getElementById('agentBtn').onclick = () => window.location.href = "/agent";
            document.getElementById('giteaBtn').onclick = () => window.location.href = "https://gitea.archsource.xyz";
            document.getElementById('driveBtn').onclick = () => window.location.href = "/drive";
        }
    });
}


async function refreshInbox(fetchRequest) {
    const { status, response } = await fetchRequest("read");
    const inbox = document.getElementById("inbox");
    inbox.innerHTML = "";

    if (status !== 200 || !response) {
        inbox.innerHTML = "<p>Erro ao carregar mensagens. </p>";
    } else if (response === "No messages") {
        inbox.innerHTML = "<p>Sem mensagens.</p>";
    } else {
        for (const msg of response) {
            const msgDiv = document.createElement("div");
            msgDiv.className = "mensagem";
            msgDiv.innerText = msg.content;
            msgDiv.dataset.messageId = msg.id;
            inbox.appendChild(msgDiv);
        }
    }

    if (fromButton && refreshButton) {
        refreshButton.disabled = false;
        refreshButton.innerText = "Atualizar";
    }
}

window.onload = () => {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const fetchRequest = async (action, extraData = {}) => {
        try {
            const resposta = await fetch("https://archsource.xyz/api/mail", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify({ action, ...extraData })
            });
            const dados = await resposta.json();
            return { status: resposta.status, response: dados.response };
        } catch {
            return { status: 0 };
        }
    };

    const buttons = {
        refresh: () => refreshInbox(fetchRequest, true),
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

            refreshInbox(fetchRequest);
        },
        clear: async () => {
            const confirm = await Swal.fire({ title: 'Tem certeza?', text: 'Tem certeza que deseja limpar suas mensagens?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return;

            const { status } = await fetchRequest("clear");
            if (status == 200) Swal.fire('Sucesso', 'Suas mensagens foram apagadas!', 'success');
            else Swal.fire('Erro', 'Erro ao limpar mensagens.', 'error');

            refreshInbox(fetchRequest);
        },
        transfer: async () => {
            const { value: target } = await Swal.fire({ title: 'Destinatário:', input: 'text', inputPlaceholder: 'Nome do destinatário', showCancelButton: true });
            if (!target) return Swal.fire('Erro', 'Destinatário não pode estar vazio!', 'error');

            const { value: amount } = await Swal.fire({ title: 'Quantidade:', input: 'number', inputPlaceholder: 'Quantas moedas?', inputAttributes: { min: 1 }, showCancelButton: true });
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
        gitea: () => window.location.href = "https://gitea.archsource.xyz",
        block: async () => {
            const { value: user } = await Swal.fire({
                title: 'Bloquear usuário',
                input: 'text',
                inputPlaceholder: 'Nome de usuário',
                showCancelButton: true
            });
            if (!user) return;

            const { status, response } = await fetchRequest("block", { user_to_block: user });
            if (status === 200) Swal.fire("Sucesso", "Usuário '" + user + "' bloqueado!", "success");
            else if (status === 404) Swal.fire("Erro", "Usuário não encontrado.", "error");
            else if (status === 405) Swal.fire("Erro", "Você não pode bloquear você mesmo.", "error");
            else if (status === 409) Swal.fire("Atenção", "Usuário já está bloqueado.", "info");
            else Swal.fire("Erro", "Erro ao bloquear usuário.", "error");
        },
        unblock: async () => {
            const { value: user } = await Swal.fire({
                title: 'Desbloquear usuário',
                input: 'text',
                inputPlaceholder: 'Nome de usuário',
                showCancelButton: true
            });
            if (!user) return;

            const { status, response } = await fetchRequest("unblock", { user_to_unblock: user });
            if (status === 200) Swal.fire("Sucesso", "Usuário '" + user + "' desbloqueado!", "success");
            else if (status === 404) Swal.fire("Erro", "Usuário não está bloqueado.", "error");
            else Swal.fire("Erro", "Erro ao desbloquear usuário.", "error");
        },
        read_blocked: async () => {
            const { status, response } = await fetchRequest("read_blocked");
            const inbox = document.getElementById("inbox");
            inbox.innerHTML = "";

            if (status !== 200 || !response) {
                inbox.innerHTML = "<p>Erro ao carregar mensagens de bloqueados.</p>";
            } else if (Array.isArray(response)){
                for (const msg of response) {
                    const msgDiv = document.createElement("div");
                    msgDiv.className = "mensagem";
                    msgDiv.innerText = msg.content;
                    msgDiv.dataset.messageId = msg.id;
                    inbox.appendChild(msgDiv);
                }
            } else {
                inbox.innerHTML = "<p>Sem mensagens de usuários bloqueados.</p>";
            }
        },
        view_blocks: async () => {
            const { status, response } = await fetchRequest("blocked_users");
            if (status === 200 && Array.isArray(response)) {
                const lista = response.length > 0 ? response.join("<br>") : "Nenhum usuário bloqueado.";
                Swal.fire("Usuários bloqueados", lista, "info");
            } else {
                Swal.fire("Erro", "Erro ao buscar usuários bloqueados.", "error");
            }
        },
        mural: async () => {
            const { status, response } = await fetchRequest("status");
            if (status == 200) window.location.href = "/mural/" + response;
            else if (status == 401) window.location.href = "/login";
            else Swal.fire('Erro', 'Ocorreu um erro interno.', 'error');
        },
        changepage: async () => {
            const { value: file_id } = await Swal.fire({ title: 'ID do arquivo:', input: 'text', inputPlaceholder: 'Link do arquivo do BinDrop', showCancelButton: true });
            if (!file_id) return Swal.fire('Erro', 'O ID não pode estar vazio!', 'error');

            const { status } = await fetchRequest("changepage", { file_id });
            if (status == 200) Swal.fire('Sucesso', 'A pagina do seu mural foi alterada!', 'success');
            else if (status == 404) Swal.fire('Erro', 'O arquivo não foi encontrado, ou você não é o dono dele!', 'error');
            else if (status == 406) Swal.fire('Erro', 'O arquivo foi negado! Isto pode ocorrer caso o arquivo seja binario ou esta pagina possua JavaScript.', 'error');
            else if (status == 410) Swal.fire('Erro', 'O arquivo não está disponível!', 'error');
            else Swal.fire('Erro', 'Erro ao alterar a pagina.', 'error');
        },
        changebio: async () => {
            const { value: content } = await Swal.fire({ title: 'Biografia:', input: 'text', inputPlaceholder: 'O que está pensando?', showCancelButton: true });
            if (!content) return Swal.fire('Erro', 'Sua biografia não pode estar vazia!', 'error');

            const { status } = await fetchRequest("changebio", { bio: content });
            if (status == 200) Swal.fire('Sucesso', 'Sua biografia foi alterada!', 'success');
            else Swal.fire('Erro', 'Erro ao alterar sua biografia.', 'error');
        },
        buycoins: async () => {
            const { value: quantidade } = await Swal.fire({
                title: 'Obter Moedas',
                input: 'number',
                inputPlaceholder: 'Quantas moedas?', inputAttributes: { min: 1 },
                confirmButtonText: 'Enviar Solicitação',
                showCancelButton: true,
                cancelButtonText: 'Cancelar'
            });

            if (quantidade && quantidade > 0) {

                try {
                    const res = await fetchRequest("send", {
                        to: "admin",
                        content: `Deseja comprar ${quantidade} moedas`
                    });
                    if (res.status === 200) {
                        Swal.fire("Solicitado!", "Aguarde o contato da administração.", "success");
                    } else {
                        Swal.fire("Erro", "Não foi possível enviar sua solicitação.", "error");
                    }
                } catch (error) {
                    Swal.fire("Erro", "Erro de rede ao enviar solicitação.", "error");
                }
            }
        },
        changepass: async () => {
            const { value: newpass } = await Swal.fire({ title: "Trocar Senha", input: "password", inputPlaceholder: "Nova senha", showCancelButton: true });
            if (!newpass) return;

            const { status } = await fetchRequest("changepass", { newpass });
            if (status === 200) Swal.fire("Sucesso", "Senha alterada com sucesso!", "success");
            else Swal.fire("Erro", "Erro ao trocar senha.", "error");
        },
        signout: () => {
            localStorage.removeItem("Mail-Token");
            window.location.href = "/login";
        },
        signoff: async () => {
            const result = await Swal.fire({ title: "Tem certeza?", text: "Tem certeza que deseja apagar sua conta?", icon: "warning", showCancelButton: true, confirmButtonText: "Sim, apagar", cancelButtonText: "Cancelar" });
            if (!result.isConfirmed) return;

            const { status } = await fetchRequest("signoff");
            if (status === 200) {
                localStorage.removeItem("Mail-Token");
                await Swal.fire("Conta apagada!", "Sua conta foi removida com sucesso.", "success");
                window.location.href = "login";
            } else Swal.fire("Erro", "Erro ao apagar conta.", "error");
        },
        optionsbutton: () => { hideAllMenus(); document.getElementById("options").style.display = "block"; },
        securitybutton: () => { hideAllMenus(); document.getElementById("security").style.display = "block"; }
    };

    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", buttons[id]);
    });

    document.getElementById("inbox").addEventListener("click", async function (e) {
        const el = e.target;
        if (!el || !el.classList.contains("mensagem")) return;

        const texto = el.textContent.trim();
        const messageId = el.dataset.messageId;

        const match = texto.match(/^\[(\d{2}:\d{2}) (\d{2}\/\d{2}\/\d{4}) - ([^\]]+)\] (.+)$/);
        if (!match) return;

        const [, hora, data, autor, conteudo] = match;

        Swal.fire({
            title: "Mensagem",
            html: `<div style="text-align:center; white-space:pre-wrap;"><strong>Hora:</strong> ${hora}<br><strong>Data</strong>: ${data}<br><strong>Remetente</strong>: ${autor}<br><br>${conteudo}</div>`,
            showConfirmButton: true,
            confirmButtonText: "Responder",
            showDenyButton: true,
            denyButtonText: "Apagar",
            showCancelButton: true,
            cancelButtonText: "Fechar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resposta = await Swal.fire({ title: `Responder para ${autor}`, input: "text", inputLabel: "Digite sua resposta", inputPlaceholder: "Escreva aqui...", showCancelButton: true, confirmButtonText: "Enviar", cancelButtonText: "Cancelar", });

                if (resposta.isConfirmed && resposta.value.trim() !== "") {
                    try {
                        const res = await fetchRequest("send", { to: autor, content: resposta.value.trim() });

                        if (res.status === 200) { Swal.fire("Sucesso", "Sua mensagem foi enviada!", "success"); } 
                        else if (res.status === 404) { Swal.fire("Erro", "O destinatário não foi encontrado!", "error"); } 
                        else { Swal.fire("Erro", "Erro ao enviar mensagem.", "error"); }
                    } catch (err) { Swal.fire("Erro", "Erro na requisição.", "error"); }
                    refreshInbox(fetchRequest);
                }
            } else if (result.isDenied) {
                const confirm = await Swal.fire({ title: "Tem certeza?", text: "Essa ação apagará a mensagem.", icon: "warning", showCancelButton: true, confirmButtonText: "Sim, apagar", cancelButtonText: "Cancelar" });
                if (confirm.isConfirmed) {
                    await fetchRequest("delete", { id: messageId });
                    el.remove();
                    Swal.fire("Apagado!", "Mensagem apagada com sucesso.", "success");
                }
            }
        });
    });

    refreshInbox(fetchRequest);
    setInterval(() => refreshInbox(fetchRequest), 60000);
};
