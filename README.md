# 📍 Projeto Alfinete - Aplicativo Mobile

O **Alfinete** é um aplicativo móvel voltado para o consumo consciente, atuando como um Guia de Descoberta que facilita a localização de brechós físicos próximos ao usuário.

## 🛠️ Tecnologias e Bibliotecas Utilizadas

*   **React Native & Expo (SDK 54.0):** Framework e plataforma base para o desenvolvimento ágil e criação do aplicativo com suporte multiplataforma (Android e iOS). Utiliza o sistema de roteamento moderno *Expo Router*.
*   **Google Maps API:** Responsável pela renderização de mapas interativos e exibição dos *pins* de localização dos brechós.
*   **Firebase SDK:** Gerenciamento do fluxo de autenticação e comunicação direta com o serviço de OAuth para login seguro com contas Google.
*   **Expo Linking:** Facilita o redirecionamento externo imediato, permitindo que o usuário abra rotas no Waze/Google Maps ou inicie conversas no WhatsApp e Instagram dos brechós diretamente pelo app.
*   **Axios:** Cliente HTTP para consumir os endpoints REST da nossa API (Backend Node.js).

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
*   **Node.js** instalado na sua máquina.
*   Aplicativo **Expo Go** instalado no seu celular (disponível na Play Store e App Store) para testes físicos.

### 2. Arquivos de Configuração (Importante)
Por questões de segurança, as credenciais e arquivos de compilação nativa não estão versionados no GitHub. Solicite os seguintes arquivos à equipe de desenvolvimento e coloque-os na **raiz** da pasta do aplicativo:
*   `.env` (Contém as chaves públicas `EXPO_PUBLIC_` da API e Firebase)
*   `google-services.json` (Arquivo de configuração nativa para o sistema Android)
*   `GoogleService-Info.plist` (Arquivo de configuração nativa para o sistema iOS)

### 3. Instalação e Execução
Com os arquivos devidamente posicionados na raiz, abra o terminal e execute:

# Instalar todas as dependências

```bash
npm install
```

# Iniciar o servidor do Expo

```bash
npx expo start
```

Um QR Code será exibido no seu terminal. Escaneie este código utilizando o aplicativo **Expo Go** no seu celular para testar o aplicativo diretamente no dispositivo.

---

## 🛡️ Procedimentos de Segurança e Vulnerabilidades

### Como reportar problemas
Caso qualquer membro da equipe ou auditor externo identifique uma vulnerabilidade no aplicativo ou na API, o reporte deve ser feito abrindo uma **Issue** no repositório correspondente utilizando a etiqueta `[SECURITY-BUG]`. O reporte deve conter os passos para reprodução do problema, isolando logs que contenham dados sensíveis.

### Atualização e Monitoramento (Boas Práticas)
Para manter o Alfinete protegido contra novas vulnerabilidades em pacotes Node.js e React Native, a equipe segue as seguintes diretrizes:
1. **Auditoria Contínua:** Utilização do CodeQL integrado ao GitHub Actions para varredura de código estático a cada Pull Request.
2. **Checagem Local:** Execução obrigatória dos comandos `npm audit` e `npx snyk test` antes de envios para a branch principal.
3. **Acompanhamento:** Acompanhamento regular dos boletins de segurança oficiais através da [Node.js Security Advisories](https://nodejs.org/en/security/) e do [NVD (National Vulnerability Database)](https://nvd.nist.gov/).
