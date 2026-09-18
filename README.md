# Stake — Gestão de Banca

App de gestão de banca para apostas desportivas, com estatísticas de resultados.

## Estado atual

- ✅ Backend completo: apostas (simples/múltipla), banca/movimentos, estatísticas (geral, por equipa, por tipo/mercado, calendário), cache de campeonatos/equipas com renovação automática mensal
- ✅ Frontend completo: Dashboard, Apostas (com modal e pesquisa em cascata Desporto→Campeonato→Equipa), Estatísticas, Banca — todos ligados à API real
- ✅ **Login obrigatório**: a app não fica pública — só entra quem souber a password. Toda a API exige um token válido, exceto o próprio login
- ✅ Compilação do Angular validada (`ng build`, sem erros)
- ⏳ Por fazer: migrations da BD, chaves das APIs externas, deploy

## Estrutura

```
stake-app/
├── api/StakeApi/     → Backend ASP.NET Core Web API (.NET 8)
├── web/              → Frontend Angular
└── render.yaml       → Blueprint de deploy no Render (frontend + backend)
```

## Stack

- **Frontend:** Angular 17 (standalone components, signals, novo control flow `@if`/`@for`)
- **Backend:** ASP.NET Core 8 Web API
- **Base de dados:** PostgreSQL (Neon)
- **Dados de desportos/campeonatos/equipas:** API-SPORTS (Futebol, Basquetebol, Andebol) + LiveTennisAPI (Ténis) — ambos gratuitos, sem cartão de crédito
- **Hosting:** Render (frontend + backend) — sem cartão de crédito

## Correr localmente

### Backend
```bash
cd api/StakeApi
dotnet restore
dotnet ef migrations add Inicial
dotnet ef database update   # aplica as migrations à BD
dotnet run
```
API fica disponível em `https://localhost:5001` (ver `launchSettings.json` depois de gerado pelo `dotnet run`).

### Frontend
```bash
cd web
npm install
npm start
```
App fica disponível em `http://localhost:4200`.

## Configuração necessária

**Backend** (`api/StakeApi/appsettings.Development.json`, não commitado):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require"
  },
  "ApiSports": {
    "ApiKey": "a-tua-chave-api-sports"
  },
  "LiveTennis": {
    "ApiKey": "a-tua-chave-livetennisapi"
  },
  "Auth": {
    "Password": "escolhe uma password tua",
    "JwtSecret": "texto aleatório com pelo menos 32 caracteres"
  }
}
```

Para gerar um `JwtSecret` seguro: `openssl rand -base64 48` (Git Bash/WSL) ou qualquer gerador de senhas longo. Não precisa de ser memorizável — é só usado internamente para assinar o token, nunca o vês nem o introduzes em lado nenhum.

Regista-te diretamente em **api-sports.io** (não via RapidAPI — lá pedem sempre cartão, mesmo no plano gratuito). Uma única chave dá acesso a Futebol, Basquetebol e Andebol (100 pedidos/dia por modalidade). Para Ténis, cria conta em **livetennisapi.com** (1.000 pedidos/dia, sem cartão).

**Frontend** (`web/src/environments/environment.ts`):
```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api'
};
```

## Publicar (checklist)

1. `dotnet ef migrations add Inicial` no backend, para gerar as migrations que faltam
2. Preencher as chaves da API-SPORTS e da LiveTennisAPI, e escolher a `Auth:Password` + gerar `Auth:JwtSecret`, no `appsettings.Development.json`
3. Correr tudo localmente (`dotnet run` + `npm start`) e confirmar que consegues fazer login, e que a Apostas → Nova Aposta consegue mesmo pesquisar desportos/campeonatos/equipas reais
4. Chamar `POST /api/sports/sincronizar-tudo` uma vez, para popular a cache de campeonatos (precisa do token — faz login primeiro e usa o token no header `Authorization: Bearer ...`, ou chama-o a partir da própria app se adicionares um botão para isso mais tarde)
5. `git init` → `git add .` → `git commit` → `git push` para o GitHub
6. No Render: **New → Blueprint**, aponta ao repositório (lê o `render.yaml` e cria `stake-web` + `stake-api`)
7. Preencher no Render as variáveis marcadas `sync: false`: `ConnectionStrings__DefaultConnection` (Neon), `ApiSports__ApiKey`, `LiveTennis__ApiKey`, `AllowedOrigins__0` (URL do `stake-web` depois de criado), `Auth__Password`, `Auth__JwtSecret`
8. Atualizar `web/src/environments/environment.prod.ts` com o URL real do `stake-api` no Render
9. Testar o URL público — deve pedir login antes de mostrar seja o que for do `stake-web`

