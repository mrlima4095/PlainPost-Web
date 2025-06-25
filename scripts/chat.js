const prompt = document.getElementById("prompt").value;
const responseBox = document.getElementById("response");

async function sendPrompt() {
    const token = localStorage.getItem("Mail-Token");

    if (!token) { window.document.location = "/login" return; }

    if (!prompt) { 
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
        body: JSON.stringify({
        model: "gemma3:1b",
        prompt: prompt
        })
        });

        const data = await response.json();
        responseBox.textContent = data.response || "❌ Erro na resposta";
    } catch (err) { Swal.fire('Erro', 'Erro ao enviar mensagem.', 'error'); responseBox.textContent = "❌ Erro na resposta"; }
}