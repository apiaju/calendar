# Contribuindo

Obrigado pelo interesse em contribuir com o **@apiaju/calendar**! Este guia explica como participar do projeto.

## Pré-requisitos

- Node.js >= 18
- npm

## Configuração do ambiente

```bash
git clone https://github.com/apiaju/calendar.git
cd calendar
npm install
```

## Desenvolvimento

```bash
npm run build        # compila ESM + CJS + .d.ts em dist/
npm test             # roda todos os testes
npm run test:watch   # roda testes em modo watch
```

Para rodar um único arquivo de testes:

```bash
npx vitest run tests/easter.test.ts
```

## Como contribuir

### Reportando bugs

Abra uma [issue](https://github.com/apiaju/calendar/issues) com:

- Descrição do problema
- Versão do pacote
- Código para reproduzir o bug
- Resultado esperado vs. resultado obtido

### Sugerindo melhorias

Abra uma [issue](https://github.com/apiaju/calendar/issues) descrevendo a melhoria e o caso de uso.

### Enviando Pull Requests

1. Faça um fork do repositório
2. Crie uma branch para sua alteração (`git checkout -b minha-alteracao`)
3. Faça suas mudanças
4. Garanta que os testes passam (`npm test`)
5. Garanta que o build funciona (`npm run build`)
6. Faça o commit das mudanças
7. Abra um Pull Request

## Adicionando ou atualizando feriados

Os feriados ficam em `src/holidays.ts`. Algumas regras:

- **Feriados fixos**: adicione na tabela `FIXED_HOLIDAYS` com `month`, `day`, `name`, `type` e `level`
- **Feriados com vigência**: use o campo `since` para indicar o ano a partir do qual o feriado é válido
- **Feriados móveis**: adicione na tabela `MOVABLE_HOLIDAYS` com o `offset` em dias a partir da Páscoa
- Sempre inclua a referência legislativa (lei que instituiu o feriado) no PR

## Convenções

- **Timezone**: toda comparação de data deve usar `toAracajuDate()`. Nunca use `.getDate()`, `.getMonth()` ou `.getFullYear()` diretamente.
- **Testes**: toda alteração deve incluir testes correspondentes.
- **Zero dependências**: o pacote não tem dependências em runtime. Não adicione dependências externas.

## Código de Conduta

Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, espera-se que você siga essas diretrizes.
