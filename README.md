# The Game Awards DiEx Edition

Site de votação da comunidade com login pelo Discord. Cada pessoa entra com a conta dela, o nick e a foto vêm do Discord, e a bolinha dela vai para o indicado escolhido em cada categoria.

- **Site:** GitHub Pages (grátis)
- **Login e votos:** Supabase (plano gratuito)

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | A página do site |
| `config.js` | Chaves do Supabase, categorias e indicados. É o único arquivo que você edita no dia a dia |
| `setup.sql` | Cria as tabelas no Supabase (roda uma vez) |
| `img/` | Coloque aqui as imagens dos indicados |

## Passo a passo

O site só funciona depois dos passos 1 a 6. Faça na ordem.

### 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com e clique em **New project**.
2. Dê um nome (ex.: `diex-awards`), crie uma senha do banco e escolha a região **South America (São Paulo)**.
3. Quando terminar de criar, abra **Project Settings → API** (em alguns painéis aparece como **Data API** ou **API Keys**) e anote:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **anon / publishable key**

> A `anon`/`publishable` key é pública e pode ir no site. A `service_role`/`secret` key **nunca** vai no site nem no GitHub.

### 2. Criar as tabelas

1. No Supabase, abra **SQL Editor → New query**.
2. Cole todo o conteúdo de `setup.sql` e clique em **Run**.

### 3. Criar o app no Discord

1. Acesse https://discord.com/developers/applications e clique em **New Application** (o nome aparece na tela de autorização, ex.: `DiEx Awards`).
2. Vá em **OAuth2**.
3. Copie o **Client ID** e clique em **Reset Secret** para gerar o **Client Secret**. Copie também.
4. Em **Redirects**, adicione:
   ```
   https://SEU-PROJETO.supabase.co/auth/v1/callback
   ```
   (troque `SEU-PROJETO` pelo seu Project URL do passo 1) e salve.

### 4. Ligar o Discord no Supabase

1. No Supabase, abra **Authentication → Sign In / Providers** (ou **Providers**).
2. Ative **Discord**, cole o **Client ID** e o **Client Secret** do passo 3 e salve.

### 5. Publicar no GitHub Pages

1. Crie um repositório público no GitHub (ex.: `diex-awards`).
2. Envie todos estes arquivos para ele (pode ser pelo botão **Add file → Upload files**).
3. No repositório, abra **Settings → Pages**, em **Source** escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em um ou dois minutos o site aparece em:
   ```
   https://SEU-USUARIO.github.io/diex-awards/
   ```

### 6. Avisar o Supabase do endereço do site

1. No Supabase, abra **Authentication → URL Configuration**.
2. Em **Site URL**, coloque o endereço do GitHub Pages do passo 5.
3. Em **Redirect URLs**, adicione o mesmo endereço.

### 7. Preencher o `config.js`

No `config.js`, troque `supabaseUrl` e `supabaseAnonKey` pelos valores do passo 1 e envie o arquivo de novo para o GitHub. Pronto: abra o site e clique em **Entrar com Discord**.

## Dia a dia

- **Adicionar categorias ou indicados:** edite `categorias` no `config.js`. Cada indicado precisa de um `id` único; não troque o `id` depois que a votação começar, senão os votos dele somem da tela.
- **Imagens:** salve a imagem na pasta `img/` e coloque o caminho no campo `imagem` do indicado, por exemplo `imagem: "img/fable.jpg"`. Imagens em pé (3:4) ficam melhores. Sem imagem, o card usa as cores e as iniciais.
- **Encerrar a votação:** mude `votacaoAberta` para `false`. As bolinhas continuam aparecendo, mas ninguém consegue mais votar.
- **Ver ou apagar votos:** no Supabase, abra **Table Editor → votos**.

## Testar no computador (opcional)

Abrir o `index.html` direto do arquivo não funciona com o login. Rode um servidor local na pasta:

```
python -m http.server 8000
```

Abra http://localhost:8000 e adicione `http://localhost:8000` em **Redirect URLs** no passo 6.

## Problemas comuns

| O que aparece | O que fazer |
|---|---|
| "Preencha supabaseUrl e supabaseAnonKey" | Faltou o passo 7 |
| "Não deu para carregar os votos" | Faltou rodar o `setup.sql` (passo 2) |
| Discord mostra "Invalid OAuth2 redirect_uri" | O redirect do passo 3 está diferente do Project URL do Supabase |
| Depois do login volta para outro endereço ou dá erro | Confira o passo 6 |
