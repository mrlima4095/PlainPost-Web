function mostrarAjuda() {
    const tipo = document.getElementById("tipo").value;
    const ajuda = document.getElementById("ajuda");
    ajuda.style.display = "block";

    const mensagens = {
        mail: "Ao denunciar uma mensagem é importante que você não apague ela, pois durante a investigação verificaremos ela em nosso banco de dados. Apagá-la atrapalhará a investigação e o caso pode ser desconsiderado.",
        mural: "Recomendamos que envie fotos com a página carregada e, se conseguir, salve o HTML e envie o link da cópia. Isso ajudará nas investigações caso o denunciado altere a página.",
        file: "Cole o link do arquivo como prova. Se não souber a quem o arquivo pertence, preencha o campo de denunciado como 'desconhecido'.",
        short_link: "Cole o link como prova. Se não souber a quem ele pertence, preencha o campo de denunciado como 'desconhecido'.",
        others: ""
    };

    ajuda.textContent = mensagens[tipo] || "";
    if (!mensagens[tipo]) ajuda.style.display = "none";
}

window.onload = () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tipo = document.getElementById("tipo").value;
        const target = document.getElementById("id_denunciado").value.trim();
        const description = document.getElementById("descricao").value.trim();
        const links = document.getElementById("provas").value.trim();
        const date = document.getElementById("data").value;
        const time = document.getElementById("hora").value;
        const notRobot = document.getElementById("not-robot").checked;

        if (!tipo || !target || !description || !date) { Swal.fire({ title: "Campos obrigatórios", text: "Preencha todos os campos.", icon: "warning" }); return; }
        if (!notRobot) { Swal.fire({ title: "Verificação necessária", text: "Marque a caixa 'Não sou um robô' para continuar.", icon: "warning" }); return; }

        const response = await fetch("https://archsource.xyz/api/report", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: tipo, target: target, description: description, links: links, date, time }) });

        if (response.status === 200) { Swal.fire({ title: 'Sua denúncia foi enviada', text: 'Agradecemos sua denúncia!', icon: 'success' }); form.reset(); } 
        else if (response.status === 401) { await Swal.fire({ title: 'Erro', text: 'Você precisa estar logado para realizar uma denúncia!', icon: 'error' }); window.location.href = "/login"; }
        else if (response.status === 404) Swal.fire({ title: 'Erro', text: 'A conta a ser denunciada não existe!', icon: 'error' }); 
        else if (response.status === 405) Swal.fire({ title: 'Erro', text: 'Só é possível denunciar usuários do PlainPost!', icon: 'error' }); 
        else Swal.fire({ title: 'Erro', text: result.response || 'Erro ao denunciar.', icon: 'error' }); 
    });

    document.getElementById("back").addEventListener("click", () => {
        window.location.href = "/account";
    });
};
