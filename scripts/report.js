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
            
        },
        back: () => window.location.href = "/account",
    };

    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", buttons[id]);
    });
};
