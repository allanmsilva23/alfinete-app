# 📍 Projeto Alfinete — Aplicativo Mobile

O **Alfinete** é um aplicativo móvel voltado ao consumo consciente e à moda sustentável. Funciona como um guia de descoberta de brechós físicos, permitindo localizar estabelecimentos próximos, explorar produtos e interagir com as lojas.

## 🛠️ Tecnologias Utilizadas

- **React Native + Expo SDK 58:** Desenvolvimento mobile para Android e iOS, utilizando Expo Router para navegação.
- **MapLibre + OpenFreeMap:** Exibição de mapas interativos, localização dos brechós e marcadores personalizados.
- **Expo Location:** Acesso à localização do usuário para encontrar brechós próximos.
- **Firebase Authentication:** Autenticação de usuários e login com Google.
- **Node.js + Express:** API REST responsável pela comunicação com o banco de dados MariaDB, hospedada na Alwaysdata.
- **Expo SecureStore e AsyncStorage:** Armazenamento local de informações e sessões.
- **EAS Build:** Compilação de versões Android para instalação e distribuição.

## 📱 Funcionalidades

- Cadastro e login de usuários, incluindo autenticação Google.
- Descoberta de brechós por localização, estilos e faixas de preço.
- Mapa interativo com estabelecimentos próximos.
- Visualização de brechós, produtos e informações das lojas.
- Lista de favoritos.
- Solicitações de peças e gerenciamento de pedidos.
- Perfil do usuário com foto e edição de informações.
- Painel para gerenciamento de brechós e área administrativa.

## 🚀 Como Executar Localmente

### 1. Pré-requisitos

- Node.js e npm.
- Android Studio e Android SDK configurados.
- Dispositivo Android ou emulador.
- Acesso aos arquivos de configuração do projeto.

### 2. Arquivos de Configuração

Por segurança, os arquivos de configuração não são disponibilizados diretamente no repositório. Solicite à equipe:

- `.env` — Variáveis de ambiente da API, Firebase e serviços Google.
- `google-services.json` — Configuração Firebase para Android.
- `GoogleService-Info.plist` — Configuração Firebase para iOS, quando necessário.

Os arquivos devem ser colocados na raiz do projeto.

### 3. Instalação e Execução

Instale as dependências:

```bash
npm install
```

Compile e execute no Android:

```bash
npx expo run:android
```

Para iniciar apenas o servidor de desenvolvimento após instalar o aplicativo nativo:

```bash
npx expo start --dev-client
```

**Observação:** devido às dependências nativas, como MapLibre e Google Sign-In, o projeto deve ser executado por uma development build, e não pelo Expo Go.

## 📦 Geração de APK

O aplicativo utiliza o **EAS Build** para gerar APKs instaláveis sem depender de cabo USB ou servidor de desenvolvimento.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

A compilação utiliza o perfil `preview` do `eas.json`. As variáveis necessárias devem estar configuradas no ambiente correspondente do EAS.

Após a compilação, o APK pode ser baixado pelo painel do Expo.

## 🛡️ Segurança

- Variáveis de ambiente e arquivos sensíveis não devem ser publicados no GitHub.
- A autenticação utiliza Firebase e mecanismos de armazenamento seguro no dispositivo.
- As requisições à API utilizam HTTPS.
- As dependências podem ser verificadas com `npm audit`.
- Vulnerabilidades devem ser reportadas de forma privada aos responsáveis pelo projeto, sem divulgar credenciais ou dados sensíveis.

## 👨‍💻 Desenvolvimento

Projeto acadêmico desenvolvido com foco em sustentabilidade, consumo consciente e aplicação de tecnologias mobile, APIs REST, autenticação e serviços em nuvem.
