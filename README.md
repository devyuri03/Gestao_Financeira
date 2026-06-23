# Gestão Financeira

Aplicação web de controle financeiro pessoal desenvolvida com **Spring Boot 4** e **Java 21**. Permite gerenciar contas bancárias, lançamentos de receitas e despesas, visualizar o fluxo de caixa mensal e acompanhar um dashboard com indicadores financeiros.

---

## Funcionalidades

- **Autenticação** — Registro e login com sessão HTTP e senhas criptografadas (BCrypt)
- **Dashboard** — KPIs do mês (receitas, despesas, saldo, pendentes), gráfico de despesas por categoria e lista de contas
- **Lançamentos** — Cadastro de receitas, despesas e transferências com categoria, conta, forma de pagamento e status
- **Contas** — Gerenciamento de contas bancárias, poupança, cartão de crédito, investimento e dinheiro em espécie
- **Fluxo de Caixa** — Projeção mensal com saldo inicial, receitas previstas, despesas previstas e saldo final projetado
- **Configurações** — Alteração de senha, alternância de tema claro/escuro e exclusão de conta
- **Responsivo** — Layout adaptado para dispositivos móveis com sidebar em gaveta deslizante

---

## Tecnologias

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.6 |
| Spring Security | — |
| Spring Data JPA | — |
| Hibernate | — |
| H2 Database | (in-memory, dev) |
| PostgreSQL Driver | (produção) |
| Lombok | — |
| Bean Validation | — |
| Thymeleaf | — |

### Frontend
| Tecnologia | Uso |
|---|---|
| HTML5 / CSS3 / JavaScript | Estrutura e lógica |
| Tabler Icons | Ícones via webfont |
| Inter (Google Fonts) | Tipografia |
| Chart.js | Gráfico donut no dashboard |
| SweetAlert2 | Modais de alerta e confirmação |

---

## Estrutura do Projeto

```
src/main/
├── java/com/gestaofinanceira/gestao_financeira/
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security, rotas, autenticação
│   │   └── GlobalExceptionHandler.java  # Tratamento global de erros de validação
│   ├── controller/
│   │   ├── PageController.java          # Rotas das páginas Thymeleaf
│   │   ├── AuthController.java          # POST /api/login
│   │   ├── UserController.java          # /api/usuarios
│   │   ├── ContaController.java         # /api/contas
│   │   ├── GastoController.java         # /api/gastos
│   │   ├── DashboardController.java     # /api/dashboard
│   │   └── FluxoCaixaController.java    # /api/fluxo-caixa
│   ├── service/
│   │   ├── UserService.java
│   │   ├── ContaService.java
│   │   ├── GastoService.java
│   │   ├── DashboardService.java
│   │   └── FluxoCaixaService.java
│   ├── model/
│   │   ├── User.java                    # @Id = email
│   │   ├── Conta.java
│   │   └── Gasto.java
│   ├── dto/
│   ├── repository/
│   └── enums/
│       ├── TipoLancamento               # RECEITA, DESPESA, TRANSFERENCIA
│       ├── CategoriaLancamento          # MORADIA, ALIMENTACAO, TRANSPORTE...
│       ├── StatusLancamento             # PAGO, PENDENTE, CANCELADO
│       ├── PagamentoLancamento          # PIX, CARTAO_CREDITO, DINHEIRO...
│       └── TipoConta                    # CONTA_CORRENTE, POUPANCA, CARTAO_CREDITO...
└── resources/
    ├── templates/                       # Páginas Thymeleaf (URLs limpas)
    │   ├── login.html
    │   ├── registro.html
    │   ├── dashboard.html
    │   ├── lancamento.html
    │   ├── contas.html
    │   ├── fluxo.html
    │   └── configuracoes.html
    ├── static/
    │   ├── css/                         # auth, dashboard, lancamento, contas, fluxo, configuracoes, mobile
    │   └── js/                          # app, dashboard, lancamento, contas, fluxo, configuracoes, mobile
    └── application.properties
```

---

## Rotas da Aplicação

### Páginas
| Rota | Descrição |
|---|---|
| `GET /login` | Tela de login |
| `GET /registro` | Tela de cadastro |
| `GET /dashboard` | Dashboard principal |
| `GET /lancamento` | Gerenciamento de lançamentos |
| `GET /contas` | Gerenciamento de contas |
| `GET /fluxo` | Fluxo de caixa |
| `GET /configuracoes` | Configurações da conta |

### API REST
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/login` | Autenticação |
| `POST` | `/api/usuarios/registro` | Criar conta |
| `GET` | `/api/usuarios/me` | Dados do usuário logado |
| `PUT` | `/api/usuarios/senha` | Alterar senha |
| `DELETE` | `/api/usuarios/me` | Excluir conta |
| `GET` | `/api/contas` | Listar contas |
| `POST` | `/api/contas` | Criar conta bancária |
| `PUT` | `/api/contas/{id}` | Atualizar conta bancária |
| `DELETE` | `/api/contas/{id}` | Excluir conta bancária |
| `GET` | `/api/gastos` | Listar lançamentos |
| `POST` | `/api/gastos` | Criar lançamento |
| `PUT` | `/api/gastos/{id}` | Atualizar lançamento |
| `DELETE` | `/api/gastos/{id}` | Excluir lançamento |
| `GET` | `/api/dashboard` | Dados do dashboard |
| `GET` | `/api/fluxo-caixa` | Dados do fluxo de caixa |

---

## Como Executar

### Pré-requisitos
- Java 21
- Maven (ou use o `mvnw` incluído)

### Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/devyuri03/gestao_financeira.git
cd gestao_financeira

# Execute com Maven Wrapper
./mvnw spring-boot:run
```

Acesse em: **http://localhost:8080**

O banco H2 é criado em memória automaticamente — nenhuma configuração adicional é necessária.

> **H2 Console** (apenas em dev): http://localhost:8080/h2-console
> - JDBC URL: `jdbc:h2:mem:testdb`
> - Usuário: `sa`

---

## Banco de Dados

Em desenvolvimento, a aplicação usa **H2 em memória**. Os dados são perdidos ao reiniciar a aplicação.

Para produção, o driver do **PostgreSQL** já está incluído no `pom.xml`. Basta configurar as variáveis no `application-prod.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gestao_financeira
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.hibernate.ddl-auto=update
```

E ativar o perfil: `./mvnw spring-boot:run -Dspring-boot.run.profiles=prod`

---

## Modelo de Dados

```
User (email PK)
 ├── Conta[] (cascade ALL)
 └── Gasto[] (cascade ALL)

Gasto → Conta (opcional)
```

Excluir um usuário apaga em cascata todas as suas contas e lançamentos.

---

## Autor

Desenvolvido por **Yuri Ferreira** — projeto de aprendizado em Spring Boot e desenvolvimento web fullstack.
