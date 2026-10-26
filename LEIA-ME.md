# Meu Treino: como colocar no ar (grátis)

São 3 partes: banco com login (Supabase), site (GitHub Pages) e iPhone. Leva uns 15 minutos.

## 1. Banco e login (Supabase)

1. Crie uma conta grátis em **supabase.com** e clique em **New project**. Escolha a região **South America (São Paulo)** e anote a senha do banco.
2. No menu lateral, abra **SQL Editor**, cole todo o conteúdo do arquivo `schema.sql` e clique em **Run**.
3. Vá em **Authentication → Sign In / Providers** e **desligue** "Allow new users to sign up". Assim ninguém mais consegue criar conta no seu site.
4. Em **Authentication → Users → Add user → Create new user**, coloque seu e-mail e uma senha forte e marque **Auto Confirm User**.
5. Abra **Project Settings → API Keys** (ou o botão **Connect** no topo) e copie:
   - a **Project URL** (algo como `https://abcd.supabase.co`)
   - a chave pública: **anon public** ou **Publishable key**. Nunca use a "service_role" ou "secret".
6. Abra o arquivo `config.js` e cole os dois valores no lugar de `COLE_AQUI…`.

## 2. Site (GitHub Pages)

1. Crie uma conta grátis em **github.com**.
2. Clique em **New repository**, dê o nome `meu-treino`, deixe **Public** e crie.
3. Clique em **uploading an existing file** e arraste todos os arquivos desta pasta (inclusive o `config.js` já preenchido). Clique em **Commit changes**.
4. Vá em **Settings → Pages**. Em "Source", escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e clique em **Save**.
5. Em 1 a 2 minutos o site fica em `https://SEU-USUARIO.github.io/meu-treino/`.

**Segurança:** a chave pública fica visível no código, e isso é normal. Quem protege seus dados é o login, junto com a regra do banco (cada usuário só vê os próprios dados) e o cadastro desligado.

## 3. iPhone

Abra o link no **Safari**, toque em **Compartilhar → Adicionar à Tela de Início**. Faça login uma vez e ele lembra.

## Bom saber

- No plano grátis, o Supabase **pausa o projeto depois de 7 dias sem uso**. Usando todo dia, não acontece. Se pausar, é só entrar no painel e clicar em **Restore**.
- Sem internet, o site continua funcionando com a última cópia e sincroniza quando a conexão volta.
- Para mudar algo no site depois, suba o arquivo novo no mesmo repositório. O GitHub atualiza sozinho.
