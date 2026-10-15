# Mohammad Asad — Portfolio

Personal portfolio built with Vite, React, TypeScript, and Tailwind CSS.
Currently contains the Step 1.1 scaffold and a dark placeholder page.

## Prerequisites

Node.js LTS (22.12+; verified with Node 22.22.2) and npm.

## Getting started

```sh
npm ci
npm run dev
```

## Scripts

- `npm run dev` — start the development server.
- `npm run build` — type-check with `tsc -b`, then build into `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint; warnings fail the check.
- `npm run format` — format project files with Prettier.

## TypeScript tooling

The build uses TypeScript 7 via the `@typescript/native` npm alias. ESLint uses
Microsoft's TypeScript 6 compatibility package under the `typescript` alias because
`typescript-eslint` does not yet support the TypeScript 7 API. This follows
[Microsoft's side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).
