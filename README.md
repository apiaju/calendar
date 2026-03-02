# ApiAju Calendar

Calendário de feriados de Aracaju-SE. Inclui feriados nacionais, estaduais (Sergipe) e municipais (Aracaju), com suporte a feriados móveis calculados a partir da Páscoa.

- Zero dependências em runtime
- TypeScript nativo com tipos exportados
- Dual package: ESM + CJS
- Timezone-safe: aceita `Date` e converte internamente para `America/Maceio` (UTC-3)
- Respeita vigência histórica dos feriados

> [!IMPORTANT]
> Este pacote é fornecido apenas para fins informativos e de conveniência. Os dados de feriados podem estar desatualizados ou conter imprecisões decorrentes de alterações legislativas posteriores à última atualização do pacote. **É responsabilidade do usuário verificar se os feriados estão devidamente atualizados e corretos para o seu caso de uso.** Os mantenedores não se responsabilizam por quaisquer danos, perdas ou consequências legais decorrentes do uso das informações fornecidas por este pacote.

## Table of Contents

- [ApiAju Calendar](#apiaju-calendar)
  - [Table of Contents](#table-of-contents)
  - [Instalação](#instalação)
  - [Uso rápido](#uso-rápido)
  - [Timezone](#timezone)
  - [API](#api)
    - [`isHoliday(date?: Date): boolean`](#isholidaydate-date-boolean)
    - [`isOptionalHoliday(date?: Date): boolean`](#isoptionalholidaydate-date-boolean)
    - [`isHolidayOrOptional(date?: Date): boolean`](#isholidayoroptionaldate-date-boolean)
    - [`getHoliday(date?: Date): Holiday | null`](#getholidaydate-date-holiday--null)
    - [`getHolidays(year?: number): Holiday[]`](#getholidaysyear-number-holiday)
    - [`isBusinessDay(date?, options?): boolean`](#isbusinessdaydate-options-boolean)
    - [`countBusinessDays(start, end, options?): number`](#countbusinessdaysstart-end-options-number)
    - [`addBusinessDays(date, days, options?): Date`](#addbusinessdaysdate-days-options-date)
  - [Tipos](#tipos)
  - [Feriados incluídos](#feriados-incluídos)
    - [Fixos](#fixos)
    - [Móveis (calculados a partir da Páscoa)](#móveis-calculados-a-partir-da-páscoa)
  - [Limitações](#limitações)
  - [Referências](#referências)
  - [Licença](#licença)

## Instalação

```bash
npm install @apiaju/calendar
pnpm install @apiaju/calendar
yarn add @apiaju/calendar
bun add @apiaju/calendar
```

## Uso rápido

```ts
import { isHoliday, getHoliday, isBusinessDay } from '@apiaju/calendar'

isHoliday(new Date('2025-12-25T12:00:00Z'))
// true

getHoliday(new Date('2025-12-25T12:00:00Z'))
// { date: Date, name: 'Natal', type: 'holiday', level: 'national' }

isBusinessDay() // verifica a data atual
```

## Timezone

Todas as funções recebem um objeto `Date` nativo do JavaScript. Internamente, a data é convertida para o fuso horário `America/Maceio` (UTC-3) usando `Intl.DateTimeFormat`. Isso garante que o cálculo funciona corretamente independente do fuso do servidor ou do navegador.

```ts
// 2025-01-01 00:00 UTC = 2024-12-31 21:00 em Aracaju
isHoliday(new Date('2025-01-01T00:00:00Z'))
// false (ainda é 31/12 em Aracaju)

// 2025-01-01 03:00 UTC = 2025-01-01 00:00 em Aracaju
isHoliday(new Date('2025-01-01T03:00:00Z'))
// true (Confraternização Universal)
```

## API

Todas as funções que recebem `date` usam `new Date()` como valor padrão.

### `isHoliday(date?: Date): boolean`

Retorna `true` se a data é um feriado oficial (`type: 'holiday'`).

```ts
isHoliday(new Date('2025-04-21T12:00:00Z')) // true (Tiradentes)
isHoliday(new Date('2025-03-04T12:00:00Z')) // false (Carnaval é ponto facultativo)
```

### `isOptionalHoliday(date?: Date): boolean`

Retorna `true` se a data é um ponto facultativo (`type: 'optional'`).

```ts
isOptionalHoliday(new Date('2025-03-04T12:00:00Z')) // true (Terça de Carnaval)
isOptionalHoliday(new Date('2025-12-25T12:00:00Z')) // false (Natal é feriado oficial)
```

### `isHolidayOrOptional(date?: Date): boolean`

Retorna `true` se a data é um feriado oficial ou ponto facultativo.

```ts
isHolidayOrOptional(new Date('2025-03-04T12:00:00Z')) // true (Terça de Carnaval)
isHolidayOrOptional(new Date('2025-12-25T12:00:00Z')) // true (Natal)
isHolidayOrOptional(new Date('2025-03-10T12:00:00Z')) // false
```

### `getHoliday(date?: Date): Holiday | null`

Retorna o objeto `Holiday` da data, ou `null` se não for feriado nem ponto facultativo.

```ts
getHoliday(new Date('2025-09-07T12:00:00Z'))
// {
//   date: Date,
//   name: 'Independência do Brasil',
//   type: 'holiday',
//   level: 'national'
// }

getHoliday(new Date('2025-03-10T12:00:00Z'))
// null
```

### `getHolidays(year?: number): Holiday[]`

Retorna todos os feriados do ano, ordenados por data. Se o ano não for informado, usa o ano atual no fuso de Aracaju.

```ts
const feriados2025 = getHolidays(2025)
// [{ date, name: 'Confraternização Universal', ... }, ...]

getHolidays(2023).length // 16 (sem Consciência Negra)
getHolidays(2025).length // 17
```

### `isBusinessDay(date?, options?): boolean`

Retorna `true` se a data é um dia útil (não é fim de semana, feriado, nem ponto facultativo).

```ts
isBusinessDay(new Date('2025-03-10T12:00:00Z')) // true (segunda-feira normal)
isBusinessDay(new Date('2025-03-01T12:00:00Z')) // false (sábado)
isBusinessDay(new Date('2025-04-21T12:00:00Z')) // false (Tiradentes)
isBusinessDay(new Date('2025-03-04T12:00:00Z')) // false (Carnaval - ponto facultativo)

// Considerando sábado como dia útil:
isBusinessDay(new Date('2025-03-01T12:00:00Z'), { saturdayIsBusinessDay: true }) // true
```

### `countBusinessDays(start, end, options?): number`

Conta os dias úteis entre duas datas. Inclui a data inicial, exclui a data final. Retorna `0` se `end <= start`.

```ts
// Segunda 10/03 a Sexta 14/03 = 4 dias úteis (seg, ter, qua, qui)
countBusinessDays(
  new Date('2025-03-10T12:00:00Z'),
  new Date('2025-03-14T12:00:00Z'),
) // 4

// Com sábado como dia útil: Seg a Dom 16/03 = 6 dias úteis
countBusinessDays(
  new Date('2025-03-10T12:00:00Z'),
  new Date('2025-03-16T12:00:00Z'),
  { saturdayIsBusinessDay: true },
) // 6
```

### `addBusinessDays(date, days, options?): Date`

Adiciona `days` dias úteis a uma data, pulando fins de semana, feriados e pontos facultativos. Retorna um `Date` correspondente ao dia final.

```ts
// 2025-03-10 (segunda) + 3 dias úteis = 2025-03-13 (quinta)
addBusinessDays(new Date('2025-03-10T12:00:00Z'), 3)

// Pula fins de semana e feriados:
// 2025-04-17 (quinta) + 1 dia útil → pula Sexta-feira Santa (18) + fim de semana + Tiradentes (21) = 2025-04-22 (terça)
addBusinessDays(new Date('2025-04-17T12:00:00Z'), 1)

// Com sábado como dia útil:
// 2025-03-14 (sexta) + 1 dia útil = 2025-03-15 (sábado)
addBusinessDays(new Date('2025-03-14T12:00:00Z'), 1, { saturdayIsBusinessDay: true })
```

## Tipos

```ts
type HolidayType = 'holiday' | 'optional'

type HolidayLevel = 'national' | 'state' | 'municipal'

interface Holiday {
  date: Date
  name: string
  type: HolidayType
  level: HolidayLevel
}

interface BusinessDayOptions {
  saturdayIsBusinessDay?: boolean // default: false
}
```

- `holiday`: feriado oficial
- `optional`: ponto facultativo
- `BusinessDayOptions`: configuração opcional para `isBusinessDay`, `countBusinessDays` e `addBusinessDays`. Quando `saturdayIsBusinessDay` é `true`, apenas domingo é considerado fim de semana.

## Feriados incluídos

### Fixos

| Data  | Nome                       | Tipo    | Nível     | Desde |
| ----- | -------------------------- | ------- | --------- | ----- |
| 01/01 | Confraternização Universal | holiday | national  |       |
| 17/03 | Aniversário de Aracaju     | holiday | municipal | 1988  |
| 21/04 | Tiradentes                 | holiday | national  |       |
| 01/05 | Dia do Trabalho            | holiday | national  |       |
| 24/06 | São João                   | holiday | municipal | 2010  |
| 08/07 | Emancipação de Sergipe     | holiday | state     |       |
| 07/09 | Independência do Brasil    | holiday | national  |       |
| 12/10 | Nossa Sra. Aparecida       | holiday | national  |       |
| 02/11 | Finados                    | holiday | national  |       |
| 15/11 | Proclamação da República   | holiday | national  |       |
| 20/11 | Consciência Negra          | holiday | national  | 2024  |
| 08/12 | Nossa Sra. da Conceição    | holiday | municipal |       |
| 25/12 | Natal                      | holiday | national  |       |

### Móveis (calculados a partir da Páscoa)

| Offset | Nome                | Tipo     | Nível    |
| ------ | ------------------- | -------- | -------- |
| -48    | Segunda de Carnaval | optional | national |
| -47    | Terça de Carnaval   | optional | national |
| -2     | Sexta-feira Santa   | holiday  | national |
| +60    | Corpus Christi      | holiday  | municipal |

## Limitações

- **Algoritmo de Páscoa**: o algoritmo de Meeus/Jones/Butcher é válido apenas para o calendário Gregoriano (a partir de 1583). Anos anteriores retornarão resultados incorretos para feriados móveis.
- **Precisão dos feriados**: o pacote reflete a legislação vigente. Alguns feriados possuem o campo `since` que indica o ano de início da vigência (ex: Consciência Negra a partir de 2024), mas feriados sem esse campo são tratados como existentes em qualquer ano. Para anos muito antigos, isso pode gerar imprecisões.
- **Faixa recomendada**: o pacote é confiável a partir de **2024**, ano em que todos os feriados cadastrados estão em vigor. Para anos anteriores, os resultados são parcialmente corretos (feriados com `since` são filtrados, mas a lista pode não corresponder exatamente à legislação da época).
- **Anos futuros**: funcionam tecnicamente, mas podem se tornar imprecisos caso a legislação seja alterada após a última atualização do pacote.

## Referências

- [Algoritmo de Meeus/Jones/Butcher](https://pt.wikipedia.org/wiki/C%C3%A1lculo_da_P%C3%A1scoa#Algoritmo_de_Meeus/Jones/Butcher) — cálculo da data da Páscoa
- [IANA Time Zone Database](https://www.iana.org/time-zones) — fuso `America/Maceio` (UTC-3)
- [Lei 662/1949](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) — Declara feriados nacionais os dias 1º de janeiro, 1º de maio, 7 de setembro, 15 de novembro e 25 de dezembro.
- [Lei 14.759/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/L14759.htm) — Declara feriado nacional o Dia Nacional de Zumbi e da Consciência Negra
- [Lei 3.805/2009 (Aracaju)](https://leismunicipais.com.br/a/se/a/aracaju/lei-ordinaria/2009/381/3805/lei-ordinaria-n-3805-2009-altera-a-redacao-do-artigo-1-da-lei-municipal-n-2899-de-06-de-marco-de-2001-instituindo-o-feriado-municipal-do-dia-24-de-junho-dia-de-sao-joao) — Feriados em Aracaju/SE

## Licença

This project is licensed under the MIT license.  
Author: [Wolney Oliveira](https://github.com/wolney-fo)
