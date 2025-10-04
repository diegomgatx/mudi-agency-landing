MuDi Agency - Landing Page
==========================

Projeto estático — landing page para a agência "MuDi Agency".

Como subir para o GitHub e publicar na Vercel

1) Criar repositório no GitHub
   - Pela web: https://github.com/new criar repositório (ex: `mudi-agency-landing`).
   - Ou pela CLI do GitHub (gh): `gh repo create mudi-agency-landing --public --source=. --remote=origin --push`

2) Push a partir deste diretório (PowerShell)
   git remote add origin https://github.com/<SEU_USUARIO>/mudi-agency-landing.git
   git branch -M main
   git push -u origin main

Observação sobre assets de vídeo
 - Se os arquivos `.mp4` forem maiores que 100MB, o GitHub bloqueará o push. Use Git LFS ou hospede os vídeos externamente (CDN, S3, etc.).

3) Deploy na Vercel
   - Pela web: faça import do repositório GitHub em https://vercel.com/import
   - Pela CLI: instale (requer Node/NPM) `npm i -g vercel` e rode `vercel` no diretório do projeto.

4) Dicas
   - Se preferir instalar o GitHub CLI no Windows: `winget install --id GitHub.cli` ou baixe do site oficial.
   - Se usar a CLI do Vercel, autentique com `vercel login` antes do deploy.

Se quiser, eu posso tentar criar o repo remoto para você (preciso que você execute os comandos de instalação/ login do `gh` ou me forneça o URL remoto).
