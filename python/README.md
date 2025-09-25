# Sistema de Controle de Comissões de Vendas

Uma aplicação Python com interface gráfica (Tkinter) para controlar comissões de vendas.

## Funcionalidades

### 📝 Cadastro de Comissões
- **N° NF** (opcional)
- **N° Pedido Nectar** (opcional) 
- **N° Pedido Embrascol** (opcional)
- **Valor da NF** (obrigatório)
- **Fator multiplicador** (padrão: 0,025, editável)
- Cálculo automático da comissão: `valor_comissao = valor_nf * fator`

### 📊 Lista de Comissões
- Visualização em tabela com todas as informações
- Status: Recebida/Pendente
- Edição direta dos registros
- Exclusão de registros
- Marcação de status (recebida/pendente)

### 📈 Relatórios e Auditoria
- **Relatório de Pendentes**: Mostra apenas comissões não recebidas
- **Relatório de Recebidas**: Mostra apenas comissões já pagas
- **Relatório Completo**: Todas as comissões
- **Exportação CSV**: Para análise externa
- **Totais em tempo real**: Valores pendentes, recebidos e total geral

### 💾 Armazenamento
- Dados salvos em arquivo JSON local (`commissions_data.json`)
- Carregamento automático ao iniciar a aplicação
- Backup automático a cada alteração

## Como Usar

### Executar a Aplicação
```bash
python commission_app.py
```

### Cadastrar Nova Comissão
1. Preencha os campos no formulário superior
2. O campo "Valor NF" é obrigatório
3. Ajuste o fator multiplicador se necessário (padrão: 0,025 = 2,5%)
4. Clique em "Salvar"
5. A comissão será calculada automaticamente

### Gerenciar Comissões
- **Duplo clique** em uma linha para alternar status (Pendente ↔ Recebida)
- **Marcar como Recebida/Pendente**: Selecione linha(s) e use os botões
- **Editar**: Selecione uma linha e clique "Editar Selecionada"
- **Excluir**: Selecione linha(s) e clique "Excluir Selecionada"

### Gerar Relatórios
- Use os botões na seção "Relatórios"
- **Exportar CSV**: Salva todos os dados em planilha
- **Totais**: Visualize resumos na parte inferior

## Interface

```
┌─────────────────────────────────────────────────────────────┐
│                Sistema de Controle de Comissões            │
├─────────────────────────────────────────────────────────────┤
│ Cadastro de Comissão                                        │
│ N° NF: [____] Pedido Nectar: [____] Pedido Embrascol: [___]│
│ Valor NF*: [____] Fator: [0.025] [Salvar]                  │
├─────────────────────────────────────────────────────────────┤
│ Lista de Comissões                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ID│NF │Nectar│Embrascol│Valor NF│Fator│Comissão│Status │ │
│ │1 │123│N456  │E789     │1000.00 │0.025│25.00   │Pendente│ │
│ │2 │124│N457  │E790     │2000.00 │0.025│50.00   │Recebida│ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Marcar Recebida] [Marcar Pendente] [Editar] [Excluir]     │
├─────────────────────────────────────────────────────────────┤
│ Relatórios                                                  │
│ [Pendentes] [Recebidas] [Completo] [Exportar CSV]          │
│                    Pendente: R$ 25,00 | Recebida: R$ 50,00 │
└─────────────────────────────────────────────────────────────┘
```

## Recursos Especiais

### 🎨 Interface Intuitiva
- Formulário organizado na parte superior
- Tabela com todas as informações visíveis
- Cores diferenciadas para status pendente
- Totais sempre atualizados

### 🔧 Funcionalidades Avançadas
- **Validação de dados**: Impede salvamento com campos obrigatórios vazios
- **Cálculo automático**: Comissão calculada em tempo real
- **Edição in-place**: Edite registros facilmente
- **Múltipla seleção**: Opere em várias comissões simultaneamente

### 📁 Gestão de Dados
- **Persistência**: Dados mantidos entre sessões
- **Backup automático**: Salvamento a cada alteração
- **Exportação**: CSV compatível com Excel/Calc
- **Encoding UTF-8**: Suporte completo a acentos

## Exemplo de Uso

1. **Nova venda**: NF 1001, Valor R$ 5.000,00, Fator 0.03
   - Comissão calculada: R$ 150,00
   - Status inicial: Pendente

2. **Recebimento**: Duplo clique na linha ou botão "Marcar Recebida"
   - Status muda para: Recebida
   - Totais atualizados automaticamente

3. **Relatório mensal**: 
   - Clique "Relatório Completo"
   - Visualize resumo detalhado
   - Exporte CSV para análise

## Requisitos Técnicos

- **Python 3.6+**
- **Tkinter** (incluído no Python padrão)
- **Bibliotecas padrão**: json, csv, datetime, os

Não requer instalação de pacotes externos!