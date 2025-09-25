# Sistema de Controle de Comissões

Sistema web para controle e gestão de comissões com PWA (Progressive Web App).

## 🚀 Funcionalidades

- ✅ Autenticação simples com usuário/senha
- ✅ CRUD completo de comissões
- ✅ Cálculo automático de comissões
- ✅ Dashboard com estatísticas em tempo real
- ✅ Filtros (todas, pendentes, pagas)
- ✅ Edição inline de registros
- ✅ Exportação CSV
- ✅ PWA - Funciona como app nativo
- ✅ Design responsivo

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco**: PostgreSQL
- **PWA**: Service Worker + Web App Manifest

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o banco PostgreSQL:
```bash
# Crie um banco PostgreSQL local
createdb commissions_db
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

5. Execute o projeto:
```bash
npm run dev
```

## 🌐 Deploy na Vercel

1. Conecte seu repositório na Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão PostgreSQL
   - `ADMIN_USERNAME`: Usuário admin
   - `ADMIN_PASSWORD`: Senha admin
   - `SESSION_SECRET`: Chave secreta para sessões

3. Deploy automático!

## 📱 PWA

O sistema funciona como um app nativo:
- Instalável no celular/desktop
- Funciona offline (cache básico)
- Ícones e splash screen personalizados

## 🔐 Credenciais Padrão

- **Usuário**: admin
- **Senha**: admin123

## 📊 Estrutura do Banco

```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  nf_number VARCHAR(255),
  order_number_nectar VARCHAR(255),
  order_number_embrascol VARCHAR(255),
  value_nf DECIMAL(10,2) NOT NULL,
  factor DECIMAL(5,4) DEFAULT 0.025,
  commission_value DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Como Usar

1. Faça login com as credenciais
2. Adicione comissões usando o formulário
3. Visualize e edite na tabela
4. Use os filtros para organizar
5. Exporte relatórios em CSV
6. Instale como app no dispositivo