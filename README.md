# BookMaster

BookMaster é uma aplicação local para organizar e conduzir campanhas de RPG de mesa. Os dados ficam no navegador, em IndexedDB, sem exigir conta ou servidor.

## Recursos

- Campanhas com grimório em Markdown e wiki-links (`[[Nome da Nota]]`).
- Fichas para personagens, NPCs, monstros e vilões.
- Timeline de sessões e registros destacados.
- Tabelas de rolagem com fórmulas como `1d20` e `2d6`.
- Soundboard com efeitos e ambientes gerados pelo Web Audio API.

## Tecnologias

- React, TypeScript e Vite
- Tailwind CSS
- Dexie / IndexedDB

## Desenvolvimento

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Use `npm.cmd` em ambientes Windows nos quais a política do PowerShell bloqueie `npm.ps1`.

## Verificação

```bash
npm run lint
npm run test
npm run build
```

Os testes cobrem a resolução de wiki-links e a lógica de rolagem. A build de produção é gravada em `dist/`.

## Dados locais e migrações

O banco chama-se `RPGMasterDatabase` e é mantido pelo Dexie. A versão atual é 3; ao atualizar, wiki-links antes armazenados como títulos são convertidos para IDs de notas quando o destino existe. Excluir campanhas e sessões usa transações para evitar dados parcialmente removidos.

Como os dados estão no navegador, limpar os dados do site remove campanhas, fichas e sessões. Faça exportações do perfil/navegador quando precisar preservar dados antes de limpar o armazenamento.
