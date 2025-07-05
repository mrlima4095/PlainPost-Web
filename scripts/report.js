function mostrarAjuda() {
    const tipo = document.getElementById("tipo").value;
    const ajuda = document.getElementById("ajuda");
    ajuda.style.display = "block";

    const mensagens = {
        mensagem: "Ao denunciar uma mensagem é importante que você não apague ela, pois durante a investigação verificaremos ela em nosso banco de dados. Apagá-la atrapalhará a investigação e o caso pode ser desconsiderado.",
        mural: "Recomendamos que envie fotos com a página carregada e, se conseguir, salve o HTML e envie o link da cópia. Isso ajudará nas investigações caso o denunciado altere a página.",
        arquivo_bdrop: "Cole o link do arquivo como prova. Se não souber a quem o arquivo pertence, preencha o campo de denunciado como 'desconhecido'.",
        link_curto: "Cole o link como prova. Se não souber a quem ele pertence, preencha o campo de denunciado como 'desconhecido'.",
        outros: ""
    };

    ajuda.textContent = mensagens[tipo] || "";
    if (!mensagens[tipo]) ajuda.style.display = "none";
}


window.onload = () => {
    const fetchRequest = async (action, extraData = {}) => {
        try {
            const resposta = await fetch("https://archsource.xyz/api/report", {
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
        report: async () => {
            const { value: target, isConfirmed: isTargetConfirmed } = await Swal.fire({ title: '👤 Destinatário:', input: 'text', inputPlaceholder: 'Nome do usuário', showCancelButton: true, confirmButtonText: 'Próximo', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'O destinatário não pode estar vazio!'; } });
            if (!isTargetConfirmed) return;

            let subject = "";
            if (target.includes("@")) {
                const { value: subj, isConfirmed: isSubjectConfirmed } = await Swal.fire({ title: '✉️ Assunto (opcional):', input: 'text', inputPlaceholder: 'Assunto da mensagem', showCancelButton: true, confirmButtonText: 'Próximo', cancelButtonText: 'Pular', });
                if (!isSubjectConfirmed) return; 

                subject = subj || "";
            }

            const { value: content, isConfirmed: isContentConfirmed } = await Swal.fire({ title: '📝 Mensagem:', input: 'text', inputPlaceholder: 'Escreva sua mensagem', showCancelButton: true, confirmButtonText: 'Avançar', cancelButtonText: 'Cancelar', inputValidator: (value) => { if (!value) return 'A mensagem não pode estar vazia!'; } });
            if (!isContentConfirmed) return;

            const confirm = await Swal.fire({ title: 'Enviar mensagem', html: `Destinatário: <strong>${target}</strong><br>` + (subject ? `Assunto: <strong>${subject}</strong><br>` : "") + `<br>Conteúdo: <em>${content}</em>`, icon: 'question', showCancelButton: true, confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar' });
            if (!confirm.isConfirmed) return Swal.fire({ title: 'Cancelado', text: 'Envio cancelado.', icon: 'info' });

            const { status } = await fetchRequest("send", { to: target, subject, content });

            if (status == 200) Swal.fire({ title: 'Sucesso', text: 'Sua mensagem foi enviada!', icon: 'success' });
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'O destinatário não foi encontrado!', icon: 'error' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao enviar mensagem.', icon: 'error' });

            refreshInbox(fetchRequest);
        },
        back: () => window.location.href = "/account",
    };

    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", buttons[id]);
    });
};
