document.addEventListener("DOMContentLoaded", () => {
  carregarHistorico();

  const promptInput = document.getElementById("prompt");
  const enviarBtn = document.getElementById("enviar-btn");
  const limparBtn = document.getElementById("limpar-btn");

  enviarBtn.addEventListener("click", enviarPrompt);
  limparBtn.addEventListener("click", limparHistorico);
});

async function carregarHistorico() {
  const token = localStorage.getItem("Mail-Token");
  if (!token) {
    window.location.href = "login";
    return;
  }

  const container = document.getElementById("mensagens");
  container.innerHTML = "";

  try {
    const res = await fetch("/api/agent/history", {
      method: "GET",
      headers: { "Authorization": token }
    });

    if (!res.ok) {
      Swal.fire("Erro", "Erro ao carregar histórico.", "error");
      return;
    }

    const data = await res.json();

    if (Array.isArray(data.response)) {
      data.response.forEach((m) => {
        const msg = document.createElement("div");
        msg.className = m.role === "user" ? "msg-user" : "msg-bot";
        if (m.role === "user") {
          msg.textContent = m.content;
        } else {
          msg.innerHTML = DOMPurify.sanitize(marked.parse(m.content));
        }
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
    console.error("Erro ao carregar histórico:", e);
    const fallback = document.createElement("div");
    fallback.className = "msg-bot";
    fallback.innerHTML = DOMPurify.sanitize(marked.parse("Erro ao carregar histórico."));
    container.appendChild(fallback);
  }
}

async function enviarPrompt() {
  const token = localStorage.getItem("Mail-Token");
  if (!token) {
    window.location.href = "login";
    return;
  }

  const promptInput = document.getElementById("prompt");
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  promptInput.value = "";

  const container = document.getElementById("mensagens");

  const userMsg = document.createElement("div");
  userMsg.className = "msg-user";
  userMsg.textContent = prompt;
  container.appendChild(userMsg);

  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      Swal.fire("Erro", "Erro ao enviar mensagem.", "error");
      return;
    }

    const data = await res.json();
    const botMsg = document.createElement("div");
    botMsg.className = "msg-bot";

    const rawMarkdown = data?.response ?? "Nenhuma resposta recebida.";
    botMsg.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));

    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;

  } catch (e) {
    console.error("Erro ao enviar prompt:", e);
    const errorMsg = document.createElement("div");
    errorMsg.className = "msg-bot";
    errorMsg.innerHTML = DOMPurify.sanitize(marked.parse("Falha na comunicação."));
    container.appendChild(errorMsg);
  }
}

async function limparHistorico() {
  const token = localStorage.getItem("Mail-Token");
  if (!token) {
    window.location.href = "login";
    return;
  }

  try {
    const res = await fetch("/api/agent/forget", {
      method: "POST",
      headers: { "Authorization": token }
    });

    if (!res.ok) {
      Swal.fire("Erro", "Erro ao limpar histórico.", "error");
      return;
    }

    await carregarHistorico();

  } catch (e) {
    console.error("Erro ao limpar histórico:", e);
    Swal.fire("Erro", "Erro ao limpar histórico.", "error");
  }
}
