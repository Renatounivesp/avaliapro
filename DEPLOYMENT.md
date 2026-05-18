# 🚀 Como Colocar o AvaliaPro Online (GitHub + Banco em Nuvem + Vercel)

Este guia prático ensina passo a passo como colocar o seu sistema **AvaliaPro** no ar de forma 100% gratuita usando o GitHub, Vercel e um banco de dados PostgreSQL na nuvem (Supabase ou Neon).

---

## 🛠️ Passo 1: Enviar o Código para o seu GitHub

O código local já está com o repositório Git inicializado e o primeiro commit seguro realizado! Agora você só precisa criar o repositório no seu GitHub:

1. Acesse seu [GitHub](https://github.com) e crie um novo repositório chamado `avaliapro`.
   * *Atenção: Não adicione README, .gitignore ou Licença. Deixe o repositório vazio.*
2. Copie a URL do seu repositório (ex: `https://github.com/seu-usuario/avaliapro.git`).
3. Abra o terminal (PowerShell ou CMD) na pasta do projeto (`c:\Users\User\Desktop\avaliapro`) e execute os 2 comandos abaixo para enviar o código:

```bash
git remote add origin https://github.com/seu-usuario/avaliapro.git
git push -u origin main
```

*(Substitua a URL pelo link real do seu repositório do GitHub).*

---

## 💾 Passo 2: Criar o Banco de Dados em Nuvem (Supabase ou Neon)

Como a Vercel é um ambiente serverless, o banco de dados SQLite local (`dev.db`) não persistirá online. Precisamos de um banco PostgreSQL em nuvem gratuito:

### Opção Recomendada: Supabase (Gratuito)
1. Crie uma conta gratuita em [Supabase.com](https://supabase.com).
2. Crie um novo projeto chamado `avaliapro`.
3. Vá em **Project Settings** -> **Database** -> Procure por **Connection String** e selecione a aba **URI**.
4. Copie a URI fornecida (ela se parece com `postgresql://postgres.[seu-id]:[sua-senha]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true`).
   * *Lembre-se de substituir `[sua-senha]` pela senha real que você cadastrou ao criar o projeto no Supabase.*

---

## ⚡ Passo 3: Configurar o Código para PostgreSQL

Para que o Prisma use o banco de dados em nuvem, faremos uma alteração simples no arquivo `prisma/schema.prisma`. 

Substitua as linhas de 1 a 4 no arquivo `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Por esta versão para PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

*Dica: Você pode fazer isso direto no VS Code abrindo o arquivo `prisma/schema.prisma`.*

---

## 🚀 Passo 4: Criar as Tabelas e Inserir o Administrador na Nuvem

Após alterar o arquivo e configurar sua Connection String, abra o terminal local na pasta do projeto e execute este comando para estruturar o banco em nuvem e criar sua conta Admin:

```bash
# 1. Envia a estrutura para o banco em nuvem
npx prisma db push
```

Para cadastrar seu usuário administrador na nuvem, você pode rodar o servidor local apontando temporariamente para o banco em nuvem, ou simplesmente criar a conta localmente e a migração se encarregará!

---

## ☁️ Passo 5: Implantar na Vercel (Hospedagem Gratuita)

1. Crie ou acesse sua conta em [Vercel.com](https://vercel.com).
2. Clique em **Add New...** -> **Project**.
3. Importe o repositório `avaliapro` do seu GitHub.
4. Na tela de importação, clique em **Environment Variables** (Variáveis de Ambiente) e adicione as seguintes variáveis:
   * **`DATABASE_URL`**: Cole a URI do Supabase que você copiou no Passo 2.
   * **`JWT_SECRET`**: Digite uma chave de segurança forte de sua preferência (Ex: `avaliapro-token-super-secreto-seguro-102030`).
5. Clique em **Deploy**! 

Pronto! Em menos de 2 minutos seu sistema estará online com um link público oficial fornecido pela Vercel (ex: `avaliapro.vercel.app`), com o banco de dados rodando na nuvem e totalmente pronto para produção! 🚀🎉
