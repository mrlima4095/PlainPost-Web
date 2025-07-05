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
    const buttons = {
        report: async () => {
            const tipo = document.getElementById("tipo").value;
            const target = document.getElementById("id_denunciado").value.trim();
            const description = document.getElementById("descricao").value.trim();
            const links = document.getElementById("provas").value.trim();
            const date = document.getElementById("data").value;
            const time = document.getElementById("hora").value;
            const notRobot = document.getElementById("not-robot").checked;

            if (!notRobot) {
                Swal.fire("⚠️", "Por favor, confirme que você não é um robô.", "warning");
                return;
            }

            if (!tipo || !target || !description || !date) { Swal.fire({ title: "Campos obrigatórios", text: "Preencha todos os campos.", icon: "warning" }); return; }
            if (!notRobot.checked) { Swal.fire({ title: "Verificação necessária", text: "Marque a caixa 'Não sou um robô' para continuar.", icon: "warning" }); return; }
            
            const response = await fetch("https://archsource.xyz/api/report", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: tipo, target: target, sender: "", description: description, links: links, date: date, time: time}) });

            const result = await response.json();
            
            if (status == 200) Swal.fire({ title: 'Sua denuncia foi enviada', text: 'Agradecemos sua denuncia!', icon: 'success' });
            else if (status == 401) { await Swal.fire({ title: 'Erro', text: 'Você precisa estar logado para realizar uma denuncia!', icon: 'error' }); window.location.href = "/login"; }
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'A conta a ser denunciada não existe!', icon: 'error' });
            else if (status == 405) Swal.fire({ title: 'Erro', text: 'Só é possivel denunciar usuários do PlainPost!', icon: 'error' });
            else if (status == 404) Swal.fire({ title: 'Erro', text: 'O destinatário não foi encontrado!', icon: 'error' });
            else Swal.fire({ title: 'Erro', text: 'Erro ao denunciar.', icon: 'error' });
        },
        back: () => window.location.href = "/account",
    };

    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", buttons[id]);
    });
};
