# langchain-ts-demo

Demo app to showcase ingesting documentation and using LLM model to query the information.
In this particular app, two pdfs that are information and guides to the game RISK is ingested and user can 
ask questions about the game.
# What's included

- Typescript
- .env file configuration
- ESLint and Prettier for formatting
- Turborepo to quickly run build scripts
- `tsup` to bundle Typescript code
- `tsx` to quickly run compiled code

# How to use

- `npm install`
- `npm run create-vector-store` To run first time or every time you have new data to ingest. Files from ./resources folder are ingested.
- `npm start` to run the app.
- Typing `quit` will exit the app.

# Known issues

```
[Error: ENOENT: no such file or directory, open 'vector-store-db/args.json'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'vector-store-db/args.json'
}
```
  - `npm run create-vector-store` - This command must be executed first time to create the initial vector store.