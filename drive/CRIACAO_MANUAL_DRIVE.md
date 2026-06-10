# Criacao Manual Google Drive - NEXA OS

## 1. Resumo Executivo

Este documento serve como roteiro manual para criar a estrutura do Google Drive enquanto o conector de Drive nao estiver aceitando escrita nesta sessao.

## 2. Diagnostico

A pasta raiz `Nexa Malls - Sistema Operacional` nao foi localizada na busca anterior. A criacao automatica de documentos falhou por permissao OAuth e, apos reautenticacao, o conector retornou `Unknown tool`.

## 3. Oportunidades

- Criar a estrutura documental sem esperar automacao.
- Permitir que Notion e n8n recebam links oficiais depois.
- Reduzir dispersao de documentos, propostas e atas.

## 4. Riscos

| Risco | Mitigacao |
|---|---|
| Criar pastas duplicadas | Buscar antes por `Nexa Malls - Sistema Operacional` |
| Permissoes erradas | Comecar privado e compartilhar por grupo depois |
| Credenciais expostas | Nunca salvar token, senha ou chave em documento |
| Documentos fora do padrao | Usar nomes padronizados |

## 5. Recomendacao

Criar primeiro somente a estrutura minima abaixo e publicar os templates depois.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Buscar se a pasta raiz ja existe | Lara | Hoje | Duplicidade evitada |
| Criar pasta raiz | Lara | Hoje | Pasta criada |
| Criar subpastas principais | Lara | Hoje | 8 pastas criadas |
| Criar templates iniciais | Lara / Marco | D+2 | 5 templates publicados |
| Revisar permissoes | Marco / Lara | D+2 | Acessos aprovados |

## Estrutura minima para criar agora

```text
Nexa Malls - Sistema Operacional/
  00_Admin/
    Templates/
    Governanca/
  01_CRM_Lojistas/
  02_Projetos/
    Villa_Viseu/
    Piazza_Nicomedes/
    BlueMall/
    Boulevard_Naves/
    Uberlandia_Shopping_HUB_de_Servicos/
    Novos_Terrenos_Comerciais/
  03_Banco_de_Terrenos/
  04_Propostas_Comerciais/
  05_Reunioes/
  06_Relatorios/
  07_Automacoes_n8n/
  08_NEXA_OS/
    01_Prompts/
    02_Playbooks/
    03_Rotinas/
    04_Logs/
    05_Dashboards/
```

## Templates a criar no Drive

| Nome | Pasta |
|---|---|
| `TEMPLATE_Proposta_Comercial_Nexa_Malls` | `00_Admin/Templates` |
| `TEMPLATE_Ata_Reuniao_Nexa_Malls` | `00_Admin/Templates` |
| `TEMPLATE_Relatorio_Executivo_Diario` | `00_Admin/Templates` |
| `TEMPLATE_Relatorio_Mensal_Ativos` | `00_Admin/Templates` |
| `Politica_Aprovacao_Mensagens` | `00_Admin/Governanca` |

## Padrao de nomes

```text
AAAA-MM-DD_Tipo_Projeto_Descricao_v01
```

Exemplos:

```text
2026-06-10_Ata_PMO_Semanal_v01
2026-06-10_Proposta_Villa_Viseu_Rede_Farmacia_v01
2026-06_Relatorio_Mensal_BlueMall_v01
```
