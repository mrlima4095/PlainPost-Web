document.addEventListener("DOMContentLoaded", () => {
    loadHistory();

    const promptInput = document.getElementById("prompt");
    const send = document.getElementById("send");
    const clear = document.getElementById("clear");
    const back = document.getElementById("back");

    send.addEventListener("click", request);
    clear.addEventListener("click", clearHistory);
    back.addEventListener("click", goback);

    promptInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            request();
        }
    });
});

async function request() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const promptInput = document.getElementById("prompt");
    const query = promptInput.value.trim();
    if (!query) return;

    promptInput.value = "";

    const container = document.getElementById("mensagens");
    container.style.display = "flex";

    const userMsg = document.createElement("div");
    userMsg.className = "msg-user";
    userMsg.textContent = query;
    container.appendChild(userMsg);

    const thinking = document.createElement("div");
    thinking.className = "msg-bot";
    thinking.textContent = "⏳ Pensando...";
    container.appendChild(thinking);
    container.scrollTop = container.scrollHeight;

    try {
        const res = await fetch("/api/agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ "prompt": query })
        });

        if (!res.ok) {
            Swal.fire("Erro", "Erro ao enviar mensagem.", "error");
            thinking.textContent = "❌ Erro ao obter resposta.";
            return;
        }

        const data = await res.json();
        const rawMarkdown = data?.response ?? "Nenhuma resposta recebida.";
        thinking.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));

    } catch (e) {
        thinking.innerHTML = DOMPurify.sanitize(marked.parse("❌ Falha na comunicação."));
    }

    container.scrollTop = container.scrollHeight;
}

async function loadHistory() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    const container = document.getElementById("mensagens");
    container.innerHTML = "";

    try {
        const res = await fetch("/api/agent/history", {
            method: "GET",
            headers: { "Authorization": token }
        });

        if (!res.ok) {
            Swal.fire("Erro", "Erro ao carregar histórico.", "error");
            container.style.display = "none";
            return;
        }

        const data = await res.json();

        if (Array.isArray(data.response) && data.response.length > 0) {
            data.response.forEach((m) => {
                const msg = document.createElement("div");
                msg.className = m.role === "user" ? "msg-user" : "msg-bot";
                msg.innerHTML = DOMPurify.sanitize(
                    m.role === "user" ? m.content : marked.parse(m.content)
                );
                container.appendChild(msg);
            });
            container.style.display = "flex";
        } else {
            container.style.display = "none"; // Oculta se sem mensagens
        }

        container.scrollTop = container.scrollHeight;

    } catch (e) {
        const fallback = document.createElement("div");
        fallback.className = "msg-bot";
        fallback.innerHTML = DOMPurify.sanitize(marked.parse("Erro ao carregar histórico."));
        container.appendChild(fallback);
        container.style.display = "flex";
    }
}

async function clearHistory() {
    const token = localStorage.getItem("Mail-Token");
    if (!token) { window.location.href = "login"; return; }

    try {
        const res = await fetch("/api/agent/forget", {
            method: "POST",
            headers: { "Authorization": token }
        });

        if (!res.ok) {
            Swal.fire("Erro", "Erro ao limpar histórico.", "error");
            return;
        }

        await loadHistory();

    } catch (e) {
        Swal.fire("Erro", "Erro ao limpar histórico.", "error");
    }
}

function goback() {
    window.location.href = "/";
}
