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

            if (resposta.status === 401) {
                window.location.href = "login";
                return { status: 401 };
            }

            const dados = await resposta.json();
            return { status: resposta.status, response: dados.response };
        } catch { return { status: 0 }; }
    };

    const buttons = {
        refresh: () => refreshInbox(fetchRequest),
        send: async () => {
            const savedDraft = JSON.parse(localStorage.getItem("draft") || "null");

            let destinatario = savedDraft?.to || "";
            let mensagem = savedDraft?.content || "";

            const openSendDialog = async () => {
                return await Swal.fire({
                    title: "Nova Mensagem GAY",
                    html: `<input id="swal-dest" class="swal2-input" placeholder="Destinatário" value="${destinatario}"><textarea id="swal-msg" class="swal2-textarea" placeholder="Escreva sua mensagem...">${mensagem}</textarea>`,
                    confirmButtonText: "📤 Enviar",
                    showCancelButton: true,
                    cancelButtonText: "❌ Cancelar",
                    showDenyButton: true,
                    denyButtonText: "🧹 Limpar",
                    allowOutsideClick: true,
                    allowEscapeKey: true,
                    preConfirm: () => {
                        const to = document.getElementById("swal-dest").value.trim();
                        const content = document.getElementById("swal-msg").value.trim();
                        if (!to) return Swal.showValidationMessage("O destinatário não pode estar vazio.");
                        if (!content) return Swal.showValidationMessage("A mensagem não pode estar vazia.");
                        return { to, content };
                    },
                    didOpen: () => {
                        document.getElementById("swal-dest").focus();
                    }
                });
            };

            while (true) {
                const { value, isConfirmed, dismiss } = await openSendDialog();

                if (isConfirmed && value) {
                    const { to, content } = value;
                    const { status } = await fetchRequest("send", { to, content });

                    if (status === 200) {
                        Swal.fire("Enviado", "Sua mensagem foi enviada com sucesso!", "success");
                        localStorage.removeItem("draft");
                    } else if (status === 404) {
                        Swal.fire("Erro", "O destinatário não foi encontrado.", "error");
                    } else {
                        Swal.fire("Erro", "Erro ao enviar mensagem.", "error");
                    }

                    refreshInbox(fetchRequest);
                    break;
                }

                // LIMPAR
                if (dismiss === Swal.DismissReason.deny) {
                    const confirmar = await Swal.fire({
                        title: "Limpar mensagem?",
                        text: "Tem certeza que deseja apagar o destinatário e o conteúdo?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "🧹 Sim, limpar",
                        cancelButtonText: "❌ Cancelar"
                    });

                    if (confirmar.isConfirmed) {
                        destinatario = "";
                        mensagem = "";
                        localStorage.removeItem("draft");
                        continue;
                    } else {
                        continue;
                    }
                }

                if (dismiss === Swal.DismissReason.cancel || dismiss === Swal.DismissReason.backdrop || dismiss === Swal.DismissReason.esc) {
                    destinatario = document.getElementById("swal-dest")?.value.trim() || "";
                    mensagem = document.getElementById("swal-msg")?.value.trim() || "";

                    if (destinatario || mensagem) {
                        localStorage.setItem("draft", JSON.stringify({ to: destinatario, content: mensagem }));
                    } else {
                        localStorage.removeItem("draft");
                    }

                    break;
                }
            }
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
            if (status == 200) {
                const { isConfirmed } = await Swal.fire({
                    title: 'Seus dados',
                    html: response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>"),
                    icon: 'info',
                    showCancelButton: true,
                    cancelButtonText: 'Fechar',
                    confirmButtonText: 'Mudar Biografia'
                });

                if (isConfirmed) buttons.changebio();
            } 
            else if (status == 404) { window.location.href = "login"; } 
            else { Swal.fire('Erro', 'Erro ao consultar.', 'error'); }
        },
        coins: async () => {
            const { status, response } = await fetchRequest("coins");
            if (status == 200) {
                const result = await Swal.fire({
                    title: 'Suas moedas',
                    html: `Você possui <strong>${response}</strong> moedas.`,
                    icon: 'info',
                    showDenyButton: true,
                    denyButtonText: 'Enviar Moedas',
                    showCancelButton: true,
                    cancelButtonText: 'Obter Moedas',
                    confirmButtonText: 'Fechar',
                    reverseButtons: true
                });

                if (result.isDenied) return buttons.transfer();
                else if (result.dismiss === Swal.DismissReason.cancel) return buttons.buycoins();
            } else if (status == 404) {
                window.location.href = "login";
            } else {
                Swal.fire('Erro', 'Erro ao consultar.', 'error');
            }
        },
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
        signout: async () => { fetchRequest("logout"); },
        signoff: async () => {
            const result = await Swal.fire({ title: "Tem certeza?", text: "Tem certeza que deseja apagar sua conta?", icon: "warning", showCancelButton: true, confirmButtonText: "Sim, apagar", cancelButtonText: "Cancelar" });
            if (!result.isConfirmed) return;

            const { status } = await fetchRequest("signoff");
            if (status === 200) {
                await Swal.fire("Conta apagada!", "Sua conta foi removida com sucesso.", "success");
                window.location.href = "login";
            } else Swal.fire("Erro", "Erro ao apagar conta.", "error");
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
