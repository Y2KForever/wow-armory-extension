# WoW Armory — Twitch extension frontend

## Local development

Two ways to run the extension without pushing a Hosted Test build. Both use the
same dev server on `https://localhost:8080`; the TLS cert comes from
[mkcert](https://github.com/FiloSottile/mkcert) and is already checked out as
`localhost.pem` / `localhost-key.pem` (regenerate with
`mkcert localhost 127.0.0.1 ::1` if it expires).

### Standalone browser — fastest loop, use this for UI work

Open `https://localhost:8080/index.html` (panel) or `/config.html` (config) as a
plain page. Outside of Twitch, the helper script's `onAuthorized` never fires and
both screens hang on their spinner, so `src/dev/twitchMock.ts` installs a stand-in
helper that authorizes immediately. It only runs in dev builds and only when the
page is not in an iframe, so it never affects Twitch.

The API verifies `X-Token` as an HS256 JWT signed with the extension secret, so
mint one to get real data:

```sh
cp .env.local.example .env.local
yarn dev:token --secret <base64-secret> >> .env.local   # secret from the Twitch
                                                        # console → Extensions →
                                                        # Settings → Secret Keys
yarn dev
```

Tokens default to an 8h lifetime (`--hours` to change) and to channel `72606078`
(`--channel`). Without a token the UI still renders, but every request is
rejected — fine for pure layout work.

### Twitch Local Test — real token, real Twitch chrome

Use this to check anything that depends on Twitch itself (sizing, the config
flow, viewer vs. broadcaster roles). In the developer console, set the version's
status to **Local Test** and its Testing Base URI to `https://localhost:8080/`,
keeping the asset paths (`index.html`, `config.html`) as they are in Hosted Test.
Then run `yarn dev` and load your channel. Visit `https://localhost:8080` once
first so the browser accepts the cert, otherwise the iframe silently fails to
load.

The mock stays out of the way here: the extension runs in an iframe, so the real
helper and a real Twitch token are used.

## Build tooling

This project uses Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
