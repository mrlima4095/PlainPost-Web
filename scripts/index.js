let profileMenuOpen = false;
let servicesMenuOpen = false;
let inbox_type = "inbox"; 

function hideAllMenus() { document.getElementById("profile").style.display = "none"; document.getElementById("services").style.display = "none"; profileMenuOpen = false; servicesMenuOpen = false; }

function toggle_profile_menu() { if (profileMenuOpen) { document.getElementById("profile").style.display = "none"; profileMenuOpen = false; } else { hideAllMenus(); document.getElementById("profile").style.display = "flex"; profileMenuOpen = true; } }
function toggle_services_menu() { if (servicesMenuOpen) { document.getElementById("services").style.display = "none"; servicesMenuOpen = false; } else { hideAllMenus(); document.getElementById("services").style.display = "flex"; servicesMenuOpen = true; } }


async function refreshInbox(fetchRequest) {
    inbox_type = "inbox";

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
}

window.onload = () => {
    const fetchRequest = async (action, extraData = {}) => {
        try {
            const resposta = await fetch("https://archsource.xyz/api/mail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...extraData }),
                credentials: "include"
            });

            if (resposta.status === 401) { window.location.href = "login"; return { status: 401 }; }

            const dados = await resposta.json();
            return { status: resposta.status, response: dados.response };
        } catch { return { status: 0 }; }
    };

    const buttons = {
        refresh: () => refreshInbox(fetchRequest),
        send: async () => {
            const { value: target, isConfirmed: isTargetConfirmed } = await Swal.fire({ title: '👤 Destinatário:', input: 'text', inputPlaceholder: 'Nome do usuário', showCancelButton: true, confirmButtonText: 'Próximo', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'O destinatário não pode estar vazio!'; } });
            if (!isTargetConfirmed) return;

            const { value: content, isConfirmed: isContentConfirmed } = await Swal.fire({ title: '📝 Mensagem:', input: 'text', inputPlaceholder: 'Escreva sua mensagem', showCancelButton: true, confirmButtonText: 'Avançar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'A mensagem não pode estar vazia!'; } });
            if (!isContentConfirmed) return;

            const confirm = await Swal.fire({ title: 'Enviar mensagem', html: `Destinatário: <strong>${target}</strong><br><br>Conteúdo: <em>${content}</em>`, icon: 'question', showCancelButton: true, confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar' }); 
            if (!confirm.isConfirmed) return Swal.fire({ title: 'Cancelado', text: 'Envio cancelado.', icon: 'info' });

            const { status } = await fetchRequest("send", { to: target, content });

            if (status == 200) Swal.fire({ title: 'Sucesso', text: 'Sua mensagem foi enviada!', icon: 'success' });
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'O destinatário não foi encontrado!', icon: 'error' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao enviar mensagem.', icon: 'error' });

            refreshInbox(fetchRequest);
        },
        clear: async () => {
            const confirm = await Swal.fire({ title: 'Tem certeza?', icon: 'warning', text: 'Tem certeza que deseja limpar suas mensagens?', showCancelButton: true, confirmButtonText: 'Apagar', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return;

            const { status } = await fetchRequest("clear");
            if (status == 200) Swal.fire({ title: 'Sucesso', text: 'Suas mensagens foram apagadas!', icon: 'success' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao limpar mensagens.', icon: 'error' });

            refreshInbox(fetchRequest);
        },
        transfer: async () => {
            const { value: target, isConfirmed: isTargetConfirmed } = await Swal.fire({ title: '👤 Destinatário:', input: 'text', inputPlaceholder: 'Nome do usuário', showCancelButton: true, confirmButtonText: 'Próximo', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'O destinatário não pode estar vazio!'; } });
            if (!isTargetConfirmed) return;

            const { value: amount, isConfirmed: isAmountConfirmed } = await Swal.fire({ title: '💰 Quantidade:', input: 'number', inputPlaceholder: 'Quantas moedas?', inputAttributes: { min: 1 }, showCancelButton: true, confirmButtonText: 'Avançar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value || value <= 0) return 'Insira uma quantia válida!'; } });
            if (!isAmountConfirmed) return;

            const confirm = await Swal.fire({ title: 'Confirmar transferência', icon: 'question', text: `Tem certeza que deseja enviar ${amount} moedas para ${target}?`, showCancelButton: true, confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar' });

            if (!confirm.isConfirmed) return Swal.fire({ title: 'Cancelado', text: 'Transferência cancelada.', icon: 'info' });

            const { status } = await fetchRequest("transfer", { to: target, amount });

            if (status == 200) Swal.fire({ title: 'Sucesso', text: 'Moedas enviadas!', icon: 'success' }); 
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'O destinatário não foi encontrado!', icon: 'error' });
            else if (status == 406) Swal.fire({ title: 'Erro', text: 'A quantia de moedas a ser enviada é inválida!', icon: 'error' });
            else if (status == 402) Swal.fire({ title: 'Erro', text: 'Saldo insuficiente!', icon: 'error' }); 
            else Swal.fire({ title: 'Erro', text: 'Erro ao transferir.', icon: 'error' });
        },
        search: async () => {
            const { value: user, isConfirmed } = await Swal.fire({ title: '🔍 Quem deseja procurar?', input: 'text', inputPlaceholder: 'Nome de usuário', showCancelButton: true, confirmButtonText: 'Buscar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'Insira um nome de usuário!'; } });
            if (!isConfirmed) return;

            const { status, response } = await fetchRequest("search", { user });

            if (status == 200) Swal.fire({ title: '📄 Resultado', html: response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>"), icon: 'info' });
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'O usuário não foi encontrado!', icon: 'error' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao procurar.', icon: 'error' }); 
        },
        me: async () => {
            const { status, response } = await fetchRequest("me");

            if (status === 200) {
                const { isConfirmed } = await Swal.fire({ title: '👤 Seus dados', html: response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>"), icon: 'info', showCancelButton: true, cancelButtonText: 'Fechar', confirmButtonText: 'Mudar Biografia' });
                if (isConfirmed) buttons.changebio();
            }
            else if (status === 404) window.location.href = "login"; 
            else Swal.fire({ title: 'Erro', text: 'Erro ao consultar.', icon: 'error' });
        },
        coins: async () => {
            const { status, response } = await fetchRequest("coins");

            if (status === 200) {
                const result = await Swal.fire({ title: '💰 Suas moedas', html: `Você possui <strong>${response}</strong> moedas.`, icon: 'info', showDenyButton: true, denyButtonText: 'Enviar Moedas', showCancelButton: true, cancelButtonText: 'Obter Moedas', confirmButtonText: 'Fechar', reverseButtons: true });

                if (result.isDenied) return buttons.transfer();
                else if (result.dismiss === Swal.DismissReason.cancel) return buttons.buycoins();
            }
            else if (status === 404) window.location.href = "login";
            else Swal.fire({ title: 'Erro', text: 'Erro ao consultar.', icon: 'error' }); 
        },
        block: async () => {
            const { value: user, isConfirmed } = await Swal.fire({ title: '🚫 Bloquear usuário', input: 'text', inputPlaceholder: 'Nome de usuário', showCancelButton: true, confirmButtonText: 'Bloquear', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'Informe um nome de usuário!'; } });
            if (!isConfirmed) return;

            const { status } = await fetchRequest("block", { user_to_block: user });

            if (status === 200) Swal.fire({ title: 'Sucesso', html: `Usuário <strong>${user}</strong> bloqueado!`, icon: 'success' });
            else if (status === 404) Swal.fire({ title: 'Erro', text: 'Usuário não encontrado.', icon: 'error' });
            else if (status === 405) Swal.fire({ title: 'Erro', text: 'Você não pode bloquear você mesmo.', icon: 'error' });
            else if (status === 409) Swal.fire({ title: 'Atenção', text: 'Usuário já está bloqueado.', icon: 'info' });
            else  Swal.fire({ title: 'Erro', text: 'Erro ao bloquear usuário.', icon: 'error' });
        },
        unblock: async () => {
            const { value: user, isConfirmed } = await Swal.fire({ title: '🔓 Desbloquear usuário', input: 'text', inputPlaceholder: 'Nome de usuário', showCancelButton: true, confirmButtonText: 'Desbloquear', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'Informe um nome de usuário!'; } });
            if (!isConfirmed) return;

            const { status } = await fetchRequest("unblock", { user_to_unblock: user });

            if (status === 200) Swal.fire({ title: 'Sucesso', html: `Usuário <strong>${user}</strong> desbloqueado!`, icon: 'success' }); 
            else if (status === 404) Swal.fire({ title: 'Erro', text: 'Usuário não está bloqueado.', icon: 'error' }); 
            else Swal.fire({ title: 'Erro', text: 'Erro ao desbloquear usuário.', icon: 'error' });
        },
        read_blocked: async () => {
            if (inbox_type == "spam") { inbox_type = "inbox"; refreshInbox(fetchRequest) }
            else {
                inbox_type = "spam";
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
            }
        },
        view_blocks: async () => {
            const { status, response } = await fetchRequest("blocked_users");

            if (status === 200 && Array.isArray(response)) {
                const lista = response.length > 0 ? response.join("<br>") : "Nenhum usuário bloqueado.";

                Swal.fire({ title: '🚫 Usuários bloqueados', html: lista, icon: 'info', confirmButtonText: 'Fechar' });

            } 
            else Swal.fire({ title: 'Erro', text: 'Erro ao buscar usuários bloqueados.', icon: 'error' }); 
        },
        mural: async () => {
            const { status, response } = await fetchRequest("status");

            if (status == 200) window.location.href = "/mural/" + response; 
            else if (status == 401) window.location.href = "/login";
            else Swal.fire({ title: 'Erro', text: 'Ocorreu um erro interno.', icon: 'error' });
        },
        changepage: async () => {
            const { value: file_id, isConfirmed } = await Swal.fire({ title: '📄 ID do arquivo', input: 'text', inputPlaceholder: 'Link do arquivo do BinDrop', showCancelButton: true, confirmButtonText: 'Alterar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'O ID não pode estar vazio!'; } }); 
            if (!isConfirmed) return;

            const { status } = await fetchRequest("changepage", { file_id });

            if (status === 200) Swal.fire({ title: 'Sucesso', text: 'A página do seu mural foi alterada!', icon: 'success' });
            else if (status === 404) Swal.fire({ title: 'Erro', text: 'O arquivo não foi encontrado ou você não é o dono dele!', icon: 'error' });
            else if (status === 406) Swal.fire({ title: 'Erro', text: 'O arquivo foi negado! Pode ser binário ou conter JavaScript.', icon: 'error' });
            else if (status === 410) Swal.fire({ title: 'Arquivo indisponível', text: 'O arquivo não está mais disponível.', icon: 'warning' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao alterar a página.', icon: 'error' });
        },
        changebio: async () => {
            const { value: content, isConfirmed } = await Swal.fire({ title: '✏️ Alterar Biografia', input: 'text', inputPlaceholder: 'O que está pensando?', showCancelButton: true, confirmButtonText: 'Salvar', cancelButtonText: 'Cancelar', nputValidator: (value) => { if (!value) return 'Sua biografia não pode estar vazia!'; } });
            if (!isConfirmed) return;

            const { status } = await fetchRequest("changebio", { bio: content });

            if (status === 200) Swal.fire({ title: 'Sucesso', text: 'Sua biografia foi alterada!', icon: 'success' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao alterar sua biografia.', icon: 'error' }); 
        },
        buycoins: async () => {
            const { value: quantidade, isConfirmed } = await Swal.fire({ title: '💰 Obter Moedas', input: 'number', inputPlaceholder: 'Quantas moedas?', inputAttributes: { min: 1 }, showCancelButton: true, confirmButtonText: 'Enviar Solicitação', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value || parseInt(value) <= 0) { return 'Informe uma quantidade válida!'; } } }); 
            if (!isConfirmed) return;

            try {
                const res = await fetchRequest("send", { to: "admin", content: `Deseja comprar ${quantidade} moedas` });

                if (res.status === 200) Swal.fire({ title: 'Solicitado!', text: 'Aguarde o contato da administração.', icon: 'success' });
                else Swal.fire({ title: 'Erro', text: 'Não foi possível enviar sua solicitação.', icon: 'error' });
            } catch (error) { Swal.fire({ title: 'Erro de rede', text: 'Não foi possível se conectar ao servidor.', icon: 'error' }); }
        },
        signout: async () => { fetchRequest("logout"); },
        signoff: async () => {
            const result = await Swal.fire({ title: 'Tem certeza?', text: 'Deseja apagar sua conta definitivamente?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, apagar', cancelButtonText: 'Cancelar' });
            if (!result.isConfirmed) return;

            const { value: password, isConfirmed } = await Swal.fire({ title: 'Confirme sua senha', input: 'password', inputPlaceholder: 'Digite sua senha', showCancelButton: true, confirmButtonText: 'Confirmar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'Senha é obrigatória!'; } }); 
            if (!isConfirmed) return;

            const finalConfirm = await Swal.fire({ title: 'Confirmação final', text: 'Tem certeza absoluta que deseja apagar sua conta? Esta ação não pode ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Apagar conta', cancelButtonText: 'Cancelar' }); 
            if (!finalConfirm.isConfirmed) return;

            const { status } = await fetchRequest("signoff");
            if (status === 200) {
                await Swal.fire({ title: 'Conta apagada!', text: 'Sua conta foi removida com sucesso.', icon: 'success' });
                window.location.href = "login";
            } 

            else Swal.fire({ title: 'Erro', text: 'Erro ao apagar conta.', icon: 'error' });
        },
        back: () => window.location.href = "/",
        agent: () => window.location.href = "/agent",
        drive: () => window.location.href = "/drive",
        short: () => window.location.href = "/links",
        account: () => window.location.href = "/account",
        security: () => window.location.href = "/security",
        gitea: () => window.location.href = "https://gitea.archsource.xyz",
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
            title: "✉️ Mensagem",
            html: `<div style="text-align:center; white-space:pre-wrap;"><strong>Hora:</strong> ${hora}<br><strong>Data</strong>: ${data}<br><strong>Remetente</strong>: ${autor}<br><br>${conteudo}</div>`,
            icon: "info",
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

    document.getElementById("search_msgs").addEventListener("input", function () {
        const termo = this.value.toLowerCase();
        const mensagens = document.querySelectorAll("#inbox .mensagem");

        mensagens.forEach(msg => {
            const texto = msg.innerText.toLowerCase();
            msg.style.display = texto.includes(termo) ? "" : "none";
        });
    });


    refreshInbox(fetchRequest);
    setInterval(() => refreshInbox(fetchRequest), 60000);
};
 