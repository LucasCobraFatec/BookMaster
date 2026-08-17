# BookMaster

BookMaster é uma aplicação local para organizar e conduzir campanhas de RPG de mesa. Os dados ficam no navegador, em IndexedDB, sem exigir conta ou servidor.

## Recursos

- Campanhas com grimório em Markdown e wiki-links (`[[Nome da Nota]]`).
- Fichas para personagens, NPCs, monstros e vilões.
- Timeline de sessões e registros destacados.
- Tabelas de rolagem com fórmulas como `1d20` e `2d6`.

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

## Versão portátil para Windows

```bash
npm run build:portable
```

O ZIP é criado em `release/BookMaster-Portable-1.0.0-Windows.zip`. Ele não exige instalação: basta extrair todo o conteúdo e abrir `BookMaster.exe`. Ao ser aberto, cria a pasta `BookMaster-data` ao lado do executável; mantenha essa pasta junto do programa para preservar as campanhas ao mover ou atualizar o BookMaster.

## Dados locais e migrações

O banco chama-se `RPGMasterDatabase` e é mantido pelo Dexie. A versão atual é 3; ao atualizar, wiki-links antes armazenados como títulos são convertidos para IDs de notas quando o destino existe. Excluir campanhas e sessões usa transações para evitar dados parcialmente removidos.

Como os dados estão no navegador, limpar os dados do site remove campanhas, fichas e sessões. Faça exportações do perfil/navegador quando precisar preservar dados antes de limpar o armazenamento.
