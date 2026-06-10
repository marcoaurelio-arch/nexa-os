# Estrutura Google Drive - NEXA OS Fase 1

## Pasta raiz

`Nexa Malls - Sistema Operacional`

## Arvore oficial

```text
Nexa Malls - Sistema Operacional/
  00_Admin/
    Credenciais_e_Acessos/
    Templates/
    Governanca/
  01_CRM_Lojistas/
    Leads/
    Redes_em_Expansao/
    Historico_de_Contato/
    Materiais_Enviados/
  02_Projetos/
    Villa_Viseu/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Piazza_Nicomedes/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    BlueMall/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Boulevard_Naves/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Uberlandia_Shopping_HUB_de_Servicos/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Novos_Terrenos_Comerciais/
      01_Mapas_e_Fotos/
      02_Documentos/
      03_Estudos_de_Vocacao/
      04_Viabilidade/
  03_Banco_de_Terrenos/
    Mapas/
    Fotos/
    Matriculas_e_Documentos/
    Estudos/
  04_Propostas_Comerciais/
    01_Rascunhos/
    02_Em_Revisao/
    03_Aprovadas/
    04_Enviadas/
    05_Modelos/
  05_Reunioes/
    PMO_Semanal/
    Comercial/
    Ativos/
    Diretoria/
  06_Relatorios/
    Diario_Executivo/
    Mensal_de_Ativos/
    Comercial/
    PMO/
  07_Automacoes_n8n/
    Documentacao/
    Logs/
    Backups/
  08_NEXA_OS/
    01_Prompts/
    02_Playbooks/
    03_Rotinas/
    04_Logs/
    05_Dashboards/
```

## Permissoes sugeridas

| Grupo | Permissao |
|---|---|
| Marco / Diretoria | Editor |
| Comercial | Editor em CRM e Propostas |
| PMO | Editor em Projetos, Reunioes e Relatorios |
| Tecnico automacoes | Editor em Automacoes n8n |
| NEXA OS | Editor apenas nas pastas operacionais aprovadas |
| Externos | Apenas link especifico aprovado |

## Padrao de nomes

`AAAA-MM-DD_Tipo_Projeto_Descricao_v01`

## Templates obrigatorios

| Arquivo | Pasta destino | Responsavel | Indicador |
|---|---|---|---|
| `TEMPLATE_Proposta_Comercial_Nexa_Malls` | `00_Admin/Templates` | Lara / Andre | Template aprovado |
| `TEMPLATE_Ata_Reuniao_Nexa_Malls` | `00_Admin/Templates` | Lara | Template aprovado |
| `TEMPLATE_Relatorio_Executivo_Diario` | `00_Admin/Templates` | Marco / Lara | Template aprovado |
| `TEMPLATE_Relatorio_Mensal_Ativos` | `00_Admin/Templates` | Wesley / Ana Luisa | Template aprovado |
| `Politica_Aprovacao_Mensagens` | `00_Admin/Governanca` | Marco / Lucas | Politica publicada |

## Criterios de aceite

- Pasta raiz criada uma unica vez.
- Subpastas principais criadas conforme arvore oficial.
- Pasta `08_NEXA_OS` criada para prompts, playbooks, rotinas, logs e dashboards.
- Nenhuma credencial, token, senha ou chave salva em texto aberto.
- Permissoes revisadas por Marco antes de compartilhar com externos.
- Links de propostas, atas e relatorios registrados nas bases operacionais.
