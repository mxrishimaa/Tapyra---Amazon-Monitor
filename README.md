# Tapyra — Monitoramento da Amazônia

Aplicação **front-end** de uma rede de alerta de fumaça e fogo. A Tapyra apresenta focos de calor detectados por satélite em um mapa, resume alguns indicadores e oferece telas para conta, preferências e relatos da comunidade.

> **Importante:** esta versão é um projeto acadêmico e uma interface complementar. Um foco de calor não confirma, sozinho, a existência de um incêndio. Os níveis exibidos são estimativas simples do front-end; não substituem informações do INPE, da Defesa Civil ou do Corpo de Bombeiros. Em uma emergência, ligue para **193 (Bombeiros)** ou **199 (Defesa Civil)**.

## Índice

- [O que a aplicação faz](#o-que-a-aplicação-faz)
- [Tecnologias](#tecnologias)
- [Como executar localmente](#como-executar-localmente)
- [Como o projeto está organizado](#como-o-projeto-está-organizado)
- [Como os dados circulam](#como-os-dados-circulam)
- [Integração com o backend](#integração-com-o-backend)
- [Pontos de cuidado antes de alterar](#pontos-de-cuidado-antes-de-alterar)
- [Limitações conhecidas desta versão](#limitações-conhecidas-desta-versão)
- [Testes e verificação](#testes-e-verificação)

## O que a aplicação faz

| Tela | Caminho | Funcionalidade atual |
|---|---|---|
| Início | `/` | Apresenta a aplicação, indicadores relacionados aos focos recebidos pelo mapa e um mapa compacto. |
| Mapa | `/mapa` | Permite navegar pelo mapa, alternar entre ruas e imagens de satélite, mover e aproximar o mapa e consultar detalhes dos focos. |
| Alertas | `/alertas` | Cria alertas estimados a partir dos focos próximos a Manaus e permite a uma pessoa autenticada enviar um relato da comunidade. |
| Sobre | `/sobre` | Explica o propósito do projeto, suas tecnologias e fontes planejadas. |
| Entrar/Criar conta | `/login` | Envia credenciais ao backend para autenticar ou cadastrar uma conta. |
| Perfil | `/perfil` | Exibe dados da conta, preferências, regiões monitoradas e alteração de senha. O acesso é protegido pela aplicação. |

Uma tela de abertura aparece ao iniciar o site. O menu, rodapé e botão flutuante de WhatsApp são compartilhados entre as páginas.

### O que está ativo e o que é apenas uma indicação visual

- **Ativo:** consulta de focos na NASA FIRMS, mapa Leaflet, autenticação/cadastro via backend, consulta e inscrição em regiões, alteração de senha, preferência de WhatsApp e envio de broadcast pelo endpoint de notificações.
- **Parcial ou local:** os relatos da comunidade são mantidos em memória no navegador durante a sessão. O envio ao endpoint de broadcast não persiste o relato completo por meio do código atual.
- **Ainda não conectado:** sensores de qualidade do ar, meteorologia, feeds de notícias e notificações por e-mail/navegador. Esses itens aparecem como intenção, legenda, texto ou componente auxiliar, mas não têm integração de dados implementada nesta versão.

## Tecnologias

- **React 19**: construção da interface em componentes.
- **Vite**: servidor de desenvolvimento e geração da versão de produção.
- **React Router**: navegação entre páginas sem recarregar todo o site.
- **Bootstrap 5 / React-Bootstrap**: componentes e layout responsivo.
- **Leaflet / React-Leaflet**: mapa interativo e marcadores.
- **NASA FIRMS**: fonte externa consultada para dados de focos de calor.
- **ESLint**: análise estática do código.
- **Cypress**: há cenários de teste de ponta a ponta na pasta `cypress/`.

O projeto usa JavaScript com JSX (não TypeScript). As dependências e comandos disponíveis estão em `package.json`.

## Como executar localmente

### Pré-requisitos

- Node.js e npm instalados.
- Acesso à internet para carregar os mapas, imagens e dados externos.
- Backend da Tapyra disponível, por padrão, em `http://localhost:3000`.
- Uma chave de acesso da NASA FIRMS para consultar os focos.

### Instalação e inicialização

Na pasta do projeto, instale as dependências:

```bash
npm install
```

Crie o arquivo local de variáveis de ambiente a partir do exemplo. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `.env` com os valores adequados ao seu ambiente:

```dotenv
VITE_API_URL=http://localhost:3000
VITE_FIRMS_MAP_KEY=sua_chave_da_nasa_firms
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O terminal mostrará o endereço local do Vite (normalmente `http://localhost:5173`). Para verificar a compilação e analisar o código:

```bash
npm run build
npm run lint
```

Também existem os comandos `npm run preview` para servir localmente o conteúdo já compilado e a configuração de Cypress descrita em [Testes e verificação](#testes-e-verificação).

### Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_API_URL` | Endereço-base do backend. Se omitida, o front-end usa `http://localhost:3000`. |
| `VITE_FIRMS_MAP_KEY` | Chave necessária para montar as consultas de área à NASA FIRMS. O valor de `.env.example` está vazio. |

Variáveis com prefixo `VITE_` são disponibilizadas ao código executado no navegador e podem ser incluídas nos arquivos gerados. **Não coloque senhas, tokens privados ou segredos que precisem permanecer confidenciais nessas variáveis.** O `.env` local está listado no `.gitignore`; mantenha-o fora do Git.

Durante o desenvolvimento, o Vite encaminha `/api/firms` à NASA FIRMS. A configuração de hospedagem também declara uma reescrita para esse caminho. Porém, o serviço atual usa diretamente o domínio da NASA quando a aplicação está em produção. Portanto, não presuma que a chave FIRMS esteja protegida por um proxy de servidor. Se ela precisar ser confidencial, o desenho deve ser revisto para que o servidor/backend faça a consulta.

## Como o projeto está organizado

```text
.
├── public/                 # Arquivos públicos: ícones, imagens e arte da página
├── src/
│   ├── components/         # Peças reutilizáveis da interface
│   ├── context/            # Estado compartilhado: focos e conta/preferências
│   ├── data/               # Frases e imagens da tela de abertura
│   ├── hooks/              # Lógica reutilizável de dados
│   ├── pages/              # Páginas associadas às rotas
│   ├── services/           # Comunicação e conversão de dados externos
│   ├── assets/             # Logos e outros arquivos importados pelo código
│   ├── App.jsx             # Rotas, layout e provedores globais
│   ├── App.css             # Estilos da aplicação
│   └── main.jsx            # Ponto de entrada do React
├── cypress/                # Cenários e suporte dos testes E2E
├── index.html              # HTML inicial servido pelo Vite
├── vite.config.js          # Configuração do Vite e proxy de desenvolvimento FIRMS
└── vercel.json             # Reescritas para publicação na Vercel
```

### Conceitos para quem está começando

- **Componente:** função React que desenha uma parte da tela. Por exemplo, `Navbar` monta a navegação e `MapView` monta o mapa.
- **Página:** componente maior que representa uma rota, como `Home` ou `Profile`.
- **Rota:** associação entre um endereço (`/mapa`) e uma página. As rotas são definidas em `App.jsx`.
- **Estado (`useState`):** dados que podem mudar enquanto a página está aberta, como os focos carregados ou o texto de um formulário.
- **Contexto/Provider:** maneira de compartilhar dados e funções entre páginas sem passar propriedades por muitos níveis. `FireDataProvider` compartilha os focos; `UserFeaturesProvider` compartilha conta, preferências e operações de usuário.
- **Hook:** função reutilizável que conecta componentes a estado ou efeitos. Os hooks do projeto estão em `src/hooks/`.
- **Serviço:** módulo que faz uma operação externa e prepara o resultado para a interface. `src/services/firms.js`, por exemplo, consulta e interpreta o CSV da NASA FIRMS.

## Como os dados circulam

### Focos e mapa

1. `MapView` observa o mapa Leaflet. Ao iniciar ou terminar uma movimentação/alteração de zoom, lê a área visível.
2. A consulta é atrasada brevemente e cancelada se outra movimentação começar; isso evita várias requisições simultâneas desnecessárias.
3. `fetchFocosFIRMS` consulta o endpoint de área da NASA FIRMS, verifica a resposta CSV e converte as linhas em objetos com latitude, longitude, confiança, satélite, data e FRP.
4. `MapView` desenha os focos com `CircleMarker`. Ao clicar em um marcador, a janela mostra detalhes do foco.
5. A lista recebida é publicada em `FireDataContext`, de onde a página inicial lê contagens, estados de carregamento e erros.

O mapa limita a quantidade de marcadores desenhados para manter a interface responsiva, mas os indicadores compartilhados recebem a lista completa retornada pela consulta. Os mapas-base de ruas e imagens são fornecidos por serviços externos (OpenStreetMap e Esri).

### Alertas estimados

A página `/alertas` faz sua própria consulta FIRMS e constrói avisos com regras locais envolvendo distâncias de 50 km e 150 km de Manaus e uma contagem regional. A página inicial também calcula contagens e níveis a partir da lista publicada pelo mapa. Portanto, os números dos cards e os alertas não são necessariamente a mesma métrica nem representam uma decisão de órgão oficial.

Os marcadores do mapa também mudam de cor de acordo com a confiança recebida. A classificação textual das categorias de confiança é realizada no parser de FIRMS. A interface de níveis de alerta não implementa, por si só, análise de vento, PM2.5 ou confirmação jornalística.

## Integração com o backend

O front-end pressupõe que um serviço separado esteja disponível em `VITE_API_URL`. O código usa os caminhos e formatos abaixo; mudanças devem ser coordenadas com a equipe responsável pelo backend.

| Método e caminho | Finalidade | Formato esperado/enviado |
|---|---|---|
| `POST /auth/login` | Entrar | Envia `{ email, senha }`; espera dados do usuário e `token`. |
| `POST /auth/cadastro` | Criar conta | Envia `{ nome, email, senha, telefone?, aceitaWhatsapp }`; espera usuário e token. |
| `GET /auth/me` | Restaurar/validar sessão | Envia `Authorization: Bearer <token>`; a resposta pode conter o usuário em `usuario`, `user`, `dados` ou diretamente no objeto. |
| `PATCH /usuarios/me/senha` | Alterar senha | Envia `{ senhaAtual, novaSenha }` com token Bearer. |
| `PATCH /usuarios/me/whatsapp` | Salvar preferência e telefone do WhatsApp | Envia `{ aceita, telefone? }` com token Bearer. |
| `GET /regioes` | Listar regiões disponíveis | A interface espera `regioes`, com identificador `id` e campos como `nome_regiao` e `codigo_estado`. |
| `GET /regioes/minhas` | Listar regiões da conta | Envia token Bearer; a interface espera `inscricoes`. |
| `POST /regioes/inscricao` | Acompanhar região | Envia `{ regiaoId, nivelMinimo }` com token Bearer. Níveis usados: `atencao`, `alerta`, `critico`. |
| `DELETE /regioes/inscricao/:regiaoId` | Deixar de acompanhar região | Envia token Bearer. |
| `POST /notificacoes/broadcast` | Solicitar envio de um alerta comunitário | Envia `{ nivel, regiao, mensagem }`; inclui token Bearer quando disponível. |

As respostas de erro são procuradas principalmente no campo `erro`. O contrato completo do backend não está neste repositório; antes de alterar nomes de campos, caminhos, códigos de estado ou formatos de resposta, confirme-os com a implementação do servidor.

### Sessão e dados de usuário

- O token de autenticação é armazenado no `localStorage` com a chave `tapyra_token`; um resumo do usuário pode ser guardado em `tapyra_user`.
- Ao recarregar a página, o provedor tenta validar o token em `GET /auth/me`. Respostas `401` ou `403` removem as informações locais.
- As rotas do front-end não substituem a autorização do servidor. O backend precisa validar o token e as permissões em toda operação protegida.
- O botão “Sair” limpa os dados locais; atualmente, o front-end não chama uma rota de encerramento de sessão no servidor.
- O histórico de frases da tela de abertura usa a chave `tapyra_splash_phrases_history` no `localStorage`; não é um dado de conta.

## Pontos de cuidado antes de alterar

### Contratos que podem quebrar a comunicação

1. **Rotas e payloads da API:** mantenha coordenados os caminhos, métodos, nomes de campos, níveis (`atencao`, `alerta`, `critico`) e formatos de resposta descritos acima.
2. **Autenticação:** `UserFeaturesProvider` concentra armazenamento do token, envio do cabeçalho Bearer, restauração da sessão e conversão do usuário para o formato da interface. Alterações aqui podem afetar login, cadastro, perfil e regiões ao mesmo tempo.
3. **Parser FIRMS:** `MapView` depende do formato produzido por `fetchFocosFIRMS`: cada item precisa conter `lat`, `lng`, `confianca`, `satelite`, `data` e, quando disponível, `frp`. Alterar o parser exige conferir mapa, popups e cálculos.
4. **Contexto dos focos:** a página inicial depende de `FireDataContext` e de seus métodos `publicarFocos`, `publicarLoading` e `publicarErro`. Não mude a forma de publicação sem verificar os consumidores.
5. **URLs e publicação:** o caminho `/api/firms`, o proxy de desenvolvimento e as reescritas da hospedagem têm papéis diferentes. Teste tanto o modo local quanto o ambiente publicado antes de alterar qualquer um.

### Dados pessoais e segurança

- Não inclua credenciais ou tokens em commits, mensagens de erro, logs ou exemplos reais. O `.env` é local; compartilhe apenas `.env.example` sem valores secretos.
- O token é guardado no `localStorage`. Isso permite restaurar a sessão, mas torna importante evitar scripts/conteúdo não confiável que possa executar na página. A autorização real deve sempre ser verificada pelo backend.
- A chave FIRMS é usada pelo código do navegador e aparece na URL da solicitação construída pelo serviço. Trate-a como acessível ao cliente e consulte as regras de uso da NASA. O código atual também registra a URL no console; não reutilize esse padrão para URLs que contenham segredos privados.
- Nome e e-mail aparecem em campos editáveis no perfil, mas o salvamento implementado não os envia ao backend: atualmente, a rota usada nessa ação salva a preferência de WhatsApp e o telefone. Não prometa persistência para campos sem uma rota correspondente.
- O formulário aceita preferência de notificações por e-mail e navegador, mas essas opções ainda não são enviadas a endpoints. A preferência de WhatsApp é a única que esta ação sincroniza com o backend.
- Dados enviados a serviços externos (NASA FIRMS, tiles de mapas, imagens e links) dependem da disponibilidade e das políticas desses fornecedores.

### Relatos da comunidade

O relato é adicionado primeiro ao estado em memória da página e, depois, o front-end envia um broadcast com nível, região e mensagem. O payload atual **não inclui** todos os campos preenchidos no formulário (por exemplo, o horário inicial), e a lista visual não é carregada de uma API de relatos. Assim, a mensagem de confirmação do broadcast não deve ser interpretada como prova de que o relato completo foi salvo ou ficará disponível após recarregar a página.

## Limitações conhecidas desta versão

- **Janelas de dados diferentes:** `MapView` e a página de alertas pedem dados `MODIS_NRT` com intervalo de cinco dias; o hook `useHomeStats` pede `VIIRS_SNPP_NRT` de um dia, mas não é usado pelas páginas atuais. Alguns textos dizem “últimas 24 h”, por isso a descrição visual pode não corresponder ao intervalo solicitado em todos os fluxos.
- **Indicadores estimados:** as regras que calculam alertas são contagens simples no front-end. A página inicial e `/alertas` usam conjuntos e critérios diferentes; os níveis não são avaliação oficial de risco.
- **Sensores e qualidade do ar:** ainda não há leitura desses sensores. O valor de qualidade do ar pode ser “—” e a legenda de sensor informa “em breve”; `useHomeStats` também contém valores demonstrativos como `0 / 3`.
- **Notícias:** existem referências a feeds e um componente `NewsCard`, mas não há carregamento de notícias implementado nas páginas atuais.
- **Perfil:** nome e e-mail são exibidos/editáveis localmente, porém não existe chamada de atualização desses campos no código atual. Verifique com o backend antes de ampliar o comportamento.
- **Relatos:** a lista da comunidade vive apenas na memória da sessão, mesmo quando o pedido de broadcast é enviado ao servidor.
- **Sessão:** as informações de usuário são limpas no navegador ao sair; não há chamada a endpoint de logout.
- **Fontes citadas no projeto:** NASA FIRMS é consultada pelo serviço do mapa. Outras fontes apresentadas na página Sobre (como BDQueimadas, Open-Meteo e feeds oficiais) representam fontes ou objetivos do projeto, não integrações implementadas nesta interface.
- **Imagens da abertura:** a lista ativa usa URLs externas do Pexels. As imagens locais existentes em `public/splash/` estão comentadas na lista do código.

## Testes e verificação

Os cenários Cypress em `cypress/e2e/` cobrem navegação/mapa, autenticação, perfil/WhatsApp e alertas/broadcast. A configuração usa `http://localhost:5173` para a aplicação; os comandos auxiliares usam por padrão `http://localhost:3000` para a API.

**Observação:** embora haja configuração e arquivos de teste Cypress no repositório, o `package.json` atual não declara Cypress como dependência nem possui um script `test`/`cypress`. Verifique a instalação e a forma de execução adotadas pelo projeto antes de pressupor que os cenários possam ser executados com um comando npm já configurado. Alguns cenários também dependem de um backend funcional.

Para as verificações disponíveis no `package.json`:

```bash
npm run lint
npm run build
```

Materiais complementares do projeto estão na pasta `src/assets/documentation/`.
