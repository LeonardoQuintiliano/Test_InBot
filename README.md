# InBot Backend Engineering Test

API desenvolvida em **Node.js (Express)** para gerenciamento de campanhas de mensagens assíncronas, integrada com **PostgreSQL via Docker Compose**, estruturada com foco em resiliência, idempotência e Clean Architecture.

---

## 1. Entendimento do Problema e Premissas Assumidas

* **O Desafio:** Construir um sistema capaz de criar campanhas com múltiplos contatos, dispará-los de forma assíncrona interagindo com um provedor externo simulado (`fakeProvider`), e processar webhooks de atualização de status de entrega.
* **Regras de Negócio Identificadas:**
  * Tratamento de falhas do provedor (erros `400` para falhas definitivas como números inválidos e `503` para indisponibilidades temporárias).
  * Garantia de idempotência no recebimento de webhooks para evitar duplicidade de processamento por eventos repetidos.
  * Proteção contra eventos de webhook fora de ordem cronológica.
* **Premissas Assumidas:**
  * Assumi que o identificador gerado pelo provedor (`provider_message_id`) seria o identficador para relacionar o envio do disparo com os webhooks que são recebidos posteriormente.

---

## 2. Decisões Arquiteturais e Técnicas

* **Arquitetura em Camadas (Separation of Concerns):** O projeto foi desacoplado estritamente em `Routes` $\rightarrow$ `Controllers` $\rightarrow$ `Services` $\rightarrow$ `Repositories`, garantindo que regras de negócio fiquem isoladas de frameworks HTTP e drivers de banco de dados.
* **Banco Relacional com PostgreSQL (via Docker):** Utilização de container Docker (`postgres:15-alpine`) para garantir portabilidade imediata do ambiente. A persistência utiliza o driver nativo (`pg`) com queries SQL parametrizadas.
* **Idempotência por `event_id`:** Implementada na service de webhook para barrar requisições duplicadas.
* **Hierarquia de Status baseada em Pesos:** Sistema numérico (`failed = 0`, `delivered = 2`, `read = 3`) que impede que um webhook recebido fora de ordem faça o ciclo de vida da mensagem retroceder no banco.

---

## 3. Como Rodar o Projeto e Testar

### Pré-requisitos
* Node.js instalado
* Docker e Docker Compose configurados no ambiente (WSL/Linux ou nativo)

### Passo a Passo

1. **Subir o Banco de Dados via Docker:**
   ```bash
   docker-compose up -d

2. **Criar as tabelas no PostgreSQL:**
   ```bash
   docker exec -i inbot_postgres psql -U postgres -d inbot_db < src/database/schema.sql

3. **Criar o arquivo .env:**
   PORT=3000
   DATABASE_URL=postgres://postgres:password@localhost:5432/inbot_db

4. **Instalar as dependencias:**
   ```bash
   npm install

5. **Iniciar a aplicação:**
   ```bash
   npm start

6. **Executar os testes unitarios:**
   ```bash
   npm test

7. **Criar campanha e contatos:**
   curl -X POST http://localhost:3000/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campanha Black Friday",
    "messageTemplate": "Olá {{nome}}, seu pedido {{pedido}} foi confirmado!",
    "contacts": [
      {
        "phone": "11999998888",
        "variables": { "nome": "Leonardo", "pedido": "#1234" }
      }
    ]
  }'

8. **Iniciar o disparo da campanha:**
   curl -X POST http://localhost:3000/campaigns/:id/start

9. **Webhook do provedor:**
   curl -X POST http://localhost:3000/webhooks/provider \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_test_001",
    "provider_message_id": "pm_002",
    "status": "delivered"
  }'

---

## 4. O que ficou de fora e seria implementado como evolução

Utilizaria uma ferramenta apropriada para cache como DynamoDB ou Redis para armazenar o event_id.

Expandiria a suíte de testes do Jest para incluir testes do repository e controller.

Adotaria uma ferramenta dedicada de migrations ou utilizar um ORM para versionamento automatizado do schema do banco de dados, feito de forma manual para o teste.