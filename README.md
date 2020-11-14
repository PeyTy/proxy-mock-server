# proxy-mock-server

> An electron-based mock server & tunneling proxy

[![proxy-mock-server](https://github.com/PeyTy/proxy-mock-server/raw/main/mocker.png?raw=true)](https://github.com/PeyTy/proxy-mock-server)

#### Features

- Crossplatform desktop GUI
- Dark theme
- Fake data with Swagger schemas
- Proxy with on-demand mocking
- Full AJAX support
- Complex routing with regex expressions
- File-based mocking
- Save projects in independent repos, manage with single app
- Use faker like `{{firstName}}` in JSON responses

### YouTube

- [Демонстрация proxy-mock-server 1.0.0](https://youtu.be/Hb78LMeYqns)

### Languages

- English
- Русский
- [Add yours...](https://github.com/PeyTy/proxy-mock-server/blob/dev/src/renderer/lang/languages.tsx)

#### Run Locally

``` bash
# clone this repo
git clone --branch main --depth 1 https://github.com/PeyTy/proxy-mock-server.git

# install dependencies
yarn install

# start app with hot reload & developer tools
npm run dev
```

#### Create Installer

``` bash
# clone this repo
git clone --branch main --depth 1 https://github.com/PeyTy/proxy-mock-server.git

# install dependencies
yarn install

# build electron application for production
npm run build
# you will find installers at proxy-mock-server\build & portable at proxy-mock-server\build\win-unpacked
```

### Install Globally (experimental)

``` bash
# install
npm i -g proxy-mock-server

# run as
proxy-mock-server
```

### Install Locally (experimental)

``` bash
# install
npm i --save-dev --also=dev proxy-mock-server

# run as
.\node_modules\.bin\proxy-mock-server

# or
./node_modules/.bin/proxy-mock-server
```

## MIT License

Commercial & inhouse-forking friendly.

Свободно для коммерческого использования и модификации
