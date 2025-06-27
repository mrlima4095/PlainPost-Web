document.addEventListener("DOMContentLoaded", () => {
    loadHistory();

    const promptInput = document.getElementById("prompt");
    const send = document.getElementById("enviar-btn");
    const clear = document.getElementById("limpar-btn");

    send.addEventListener("click", request);
    clear.addEventListener("click", clearHistory);

    promptInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); enviarPrompt(); } });

});

async function loadHistory() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const container = document.getElementById("mensagens");
    container.innerHTML = "";

    try {
        const res = await fetch("/api/agent/history", { method: "GET", headers: { "Authorization": token } });
        if (!res.ok) { Swal.fire("Erro", "Erro ao carregar histórico.", "error"); return; }

        const data = await res.json();

        if (Array.isArray(data.response)) {
                data.response.forEach((m) => {
                const msg = document.createElement("div");
                msg.className = m.role === "user" ? "msg-user" : "msg-bot";
                
                if (m.role === "user") { msg.textContent = m.content; }
                else { msg.innerHTML = DOMPurify.sanitize(marked.parse(m.content)); }
                container.appendChild(msg);
            });
        } else {
            const msg = document.createElement("div");
            msg.className = "msg-bot";
            msg.innerHTML = DOMPurify.sanitize(marked.parse(data.response || "Erro ao carregar histórico."));
            container.appendChild(msg);
        }

        container.scrollTop = container.scrollHeight;

    } catch (e) {
    const fallback = document.createElement("div");
    fallback.className = "msg-bot";
    fallback.innerHTML = DOMPurify.sanitize(marked.parse("Erro ao carregar histórico."));
    container.appendChild(fallback);
    }
}

async function request() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const promptInput = document.getElementById("prompt");
    const query = promptInput.value.trim();
    if (!query) return;

    promptInput.value = "";

    const container = document.getElementById("mensagens");

    const userMsg = document.createElement("div");
    userMsg.className = "msg-user";
    userMsg.textContent = query;
    container.appendChild(userMsg);

    try {
        const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": token }, body: JSON.stringify({ query }) });
        if (!res.ok) { Swal.fire("Erro", "Erro ao enviar mensagem.", "error"); return; }

        const data = await res.json();
        const botMsg = document.createElement("div");
        botMsg.className = "msg-bot";

        const rawMarkdown = data?.response ?? "Nenhuma resposta recebida.";
        botMsg.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));

        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;

    } catch (e) { 
        const errorMsg = document.createElement("div");
        errorMsg.className = "msg-bot";
        errorMsg.innerHTML = DOMPurify.sanitize(marked.parse("Falha na comunicação."));
        container.appendChild(errorMsg);
    }
}

async function clearHistory() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    try {
        const res = await fetch("/api/agent/forget", { method: "POST", headers: { "Authorization": token } });
        if (!res.ok) { Swal.fire("Erro", "Erro ao limpar histórico.", "error"); return; }

        await loadHistory();
    } catch (e) { Swal.fire("Erro", "Erro ao limpar histórico.", "error"); }
}
