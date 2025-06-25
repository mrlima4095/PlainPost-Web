const responseBox = document.getElementById("response");

async function sendPrompt() {
    const token = localStorage.getItem("Mail-Token");

    const promptValue = document.getElementById("prompt").value;

    if (!token) {
        window.document.location = "/login";
        return;
    }

    if (!promptValue) {
        alert("Digite um prompt.");
        return;
    }

    responseBox.textContent = "⌛ Aguardando resposta...";

    try {
        const response = await fetch("https://archsource.xyz/api/agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ prompt: promptValue })
        });

        const data = await response.json();
        responseBox.textContent = data.response || "❌ Erro na resposta";
    } catch (err) {
        Swal.fire('Erro', 'Erro ao enviar mensagem.', 'error');
        responseBox.textContent = "❌ Erro na resposta";
    }
}
