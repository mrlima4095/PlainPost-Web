<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PlainPost - Login</title>

    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="favicon.ico" type="image/x-icon" />

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="scripts/login.js" defer></script>
</head>
<body>
    <div id="container">
        <header>
            <h2>PlainPost - Login</h2>
            <p>Seja bem-vindo(a)!</p>
        </header>
        <form>
            <label for="email">ID:</label><br />
            <input type="user" id="email" name="email" required /><br /><br />

            <label for="senha">Senha:</label><br />
            <input type="password" id="senha" name="senha" required /><br /><br />

            <div id="captcha">
                <input type="checkbox" id="not-robot" />
                <label for="not-robot">Não sou um robô</label>
            </div><br />

            <div id="acoes">
                <button type="button">Entrar</button>
                <button type="button">Registrar-se</button>
            </div>
            <br><a href="docs/policy">Política de Privacidade</a>
        </form>
    </div>
</body>
</html>
