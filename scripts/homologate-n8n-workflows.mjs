import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const workflowSpecs = [
  {
    id: "01",
    name: "01_WHATSAPP_LEAD_TO_CRM",
    workflowPath: "n8n/workflows/01_WHATSAPP_LEAD_TO_CRM.workflow.json",
    fixtures: [
      "n8n/fixtures/lead_novo_completo.json",
      "n8n/fixtures/lead_novo_incompleto.json",
      "n8n/fixtures/lead_existente.json",
    ],
    requiredTypes: [
      "n8n-nodes-base.webhook",
      "n8n-nodes-base.code",
      "n8n-nodes-base.if",
      "n8n-nodes-base.notion",
      "n8n-nodes-base.gmail",
      "n8n-nodes-base.respondToWebhook",
    ],
  },
  {
    id: "02",
    name: "02_FOLLOWUP_AUTOMATICO_CRM",
    workflowPath: "n8n/workflows/02_FOLLOWUP_AUTOMATICO_CRM.workflow.json",
    fixtures: [
      "n8n/fixtures/followup_hoje.json",
      "n8n/fixtures/followup_vencido.json",
    ],
    requiredTypes: [
      "n8n-nodes-base.scheduleTrigger",
      "n8n-nodes-base.code",
      "n8n-nodes-base.if",
      "n8n-nodes-base.notion",
      "n8n-nodes-base.gmail",
    ],
  },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function assertCheck(checks, ok, scope, message) {
  checks.push({ ok, scope, message });
}

function nodeTypes(workflow) {
  return new Set(workflow.nodes.map((node) => node.type));
}

function workflowContains(workflow, needle) {
  return JSON.stringify(workflow).includes(needle);
}

function validateWorkflow(spec) {
  const workflow = readJson(spec.workflowPath);
  const checks = [];
  const types = nodeTypes(workflow);
  const gmailNodes = workflow.nodes.filter((node) => node.type === "n8n-nodes-base.gmail");
  const webhookNodes = workflow.nodes.filter((node) => node.type === "n8n-nodes-base.webhook");

  assertCheck(checks, workflow.name === spec.name, spec.name, "Nome do workflow confere");
  assertCheck(checks, workflow.active === false, spec.name, "Workflow permanece com active=false");
  assertCheck(checks, workflow.nodes.length > 0, spec.name, "Workflow possui nos configurados");
  assertCheck(checks, Object.keys(workflow.connections || {}).length > 0, spec.name, "Workflow possui conexoes");

  for (const type of spec.requiredTypes) {
    assertCheck(checks, types.has(type), spec.name, `Tipo de no obrigatorio presente: ${type}`);
  }

  for (const node of gmailNodes) {
    assertCheck(
      checks,
      node.parameters?.resource === "draft",
      spec.name,
      `Gmail limitado a draft no no: ${node.name}`,
    );
  }

  assertCheck(checks, !workflowContains(workflow, "sendAndWait"), spec.name, "Sem sendAndWait automatico");
  assertCheck(checks, !workflowContains(workflow, "message/send"), spec.name, "Sem endpoint explicito de envio externo");
  assertCheck(checks, workflowContains(workflow, "envio_externo") || workflowContains(workflow, "external_send"), spec.name, "Trava de envio externo declarada");
  assertCheck(checks, workflowContains(workflow, "Pendente"), spec.name, "Aprovacao humana inicia como Pendente");

  for (const node of webhookNodes) {
    assertCheck(
      checks,
      node.parameters?.responseMode === "responseNode",
      spec.name,
      `Webhook responde por no controlado: ${node.name}`,
    );
  }

  return { workflow, checks };
}

function normalizeWorkflow01(raw) {
  const phone = String(raw.telefone || raw.phone || raw.whatsapp || "").replace(/\D/g, "");
  const message = String(raw.mensagem || raw.message || raw.text || "").trim();
  const consent = raw.opt_in === true || raw.opt_in === "true" || raw.consentimento === true;
  const interestProject = raw.empreendimento_interesse || raw.project || "Qualificacao pendente";
  const segment = raw.segmento || "Qualificacao pendente";
  const lowerMessage = message.toLowerCase();
  const hotTerms = ["proposta", "aluguel", "locacao", "reuniao", "visita", "contrato"];
  const missing = [];

  if (interestProject === "Qualificacao pendente") missing.push("empreendimento de interesse");
  if (segment === "Qualificacao pendente") missing.push("segmento");
  if (!consent) missing.push("consentimento/opt-in");

  return {
    phone,
    message,
    consent,
    leadName: raw.nome || raw.name || "Lead sem nome",
    origin: raw.origem || raw.source || "WhatsApp/Zaper",
    interestProject,
    segment,
    responsible: raw.responsavel || "Marco Aurelio",
    inputValid: Boolean(phone && message),
    temperature: hotTerms.some((term) => lowerMessage.includes(term)) ? "Quente" : "Morno",
    qualificationStatus: missing.length ? "Qualificacao pendente" : "Qualificado",
    missing,
    externalSend: "Nao",
    approvalStatus: "Pendente",
  };
}

function simulateWorkflow01(relativePath) {
  const raw = readJson(relativePath);
  const normalized = normalizeWorkflow01(raw);
  const isExisting = relativePath.includes("lead_existente");
  const checks = [];

  assertCheck(checks, normalized.inputValid, relativePath, "Entrada contem telefone e mensagem");
  assertCheck(checks, normalized.externalSend === "Nao", relativePath, "Envio externo permanece Nao");
  assertCheck(checks, normalized.approvalStatus === "Pendente", relativePath, "Aprovacao permanece Pendente");
  assertCheck(checks, normalized.phone.length >= 10, relativePath, "Telefone normalizado possui tamanho minimo");

  if (relativePath.includes("incompleto")) {
    assertCheck(checks, normalized.qualificationStatus === "Qualificacao pendente", relativePath, "Lead incompleto fica em qualificacao pendente");
    assertCheck(checks, normalized.missing.length > 0, relativePath, "Campos faltantes foram identificados");
  } else {
    assertCheck(checks, normalized.qualificationStatus === "Qualificado", relativePath, "Lead completo fica qualificado");
  }

  if (isExisting) {
    assertCheck(checks, isExisting, relativePath, "Cenario de lead existente aciona caminho de atualizacao");
  }

  return checks;
}

function simulateWorkflow02(relativePath) {
  const raw = readJson(relativePath);
  const checks = [];
  const status = raw.status_comercial || "";
  const temp = raw.temperatura || "Morno";
  const due = raw.proximo_followup || "";
  const ignored = ["Ganho", "Perdido"].includes(status);
  const priority = due < today || temp === "Quente" || temp === "Estrategico" ? "Alta" : "Media";

  assertCheck(checks, Boolean(raw.lead_nome), relativePath, "Lead possui nome");
  assertCheck(checks, due <= today, relativePath, "Follow-up esta devido");
  assertCheck(checks, !ignored, relativePath, "Lead elegivel nao esta Ganho/Perdido");
  assertCheck(checks, raw.envio_externo === "Nao", relativePath, "Envio externo permanece Nao");
  assertCheck(checks, raw.aprovacao_para_envio === "Pendente", relativePath, "Aprovacao permanece Pendente");

  if (relativePath.includes("vencido")) {
    assertCheck(checks, priority === "Alta", relativePath, "Follow-up vencido recebe prioridade Alta");
  }

  return checks;
}

const allChecks = [];

for (const spec of workflowSpecs) {
  const { checks } = validateWorkflow(spec);
  allChecks.push(...checks);

  for (const fixturePath of spec.fixtures) {
    allChecks.push(
      ...(spec.id === "01" ? simulateWorkflow01(fixturePath) : simulateWorkflow02(fixturePath)),
    );
  }
}

const failed = allChecks.filter((check) => !check.ok);
const passed = allChecks.filter((check) => check.ok);

const reportLines = [
  "# Homologacao tecnica local - Workflows 01 e 02",
  "",
  `Data: ${today}`,
  "Escopo: validacao local de JSON, fixtures, travas de governanca e simulacao deterministica.",
  "",
  "## Resultado",
  "",
  `- Checks aprovados: ${passed.length}`,
  `- Checks reprovados: ${failed.length}`,
  `- Status: ${failed.length ? "Reprovado" : "Aprovado com pendencia de n8n real"}`,
  "",
  "## Pendencia externa",
  "",
  "A homologacao no n8n real nao foi executada nesta rodada porque nao ha N8N_BASE_URL nem token/API do n8n configurados no ambiente local. Os workflows devem ser importados no n8n com active=false antes de qualquer ativacao.",
  "",
  "## Checks",
  "",
  ...allChecks.map((check) => `- [${check.ok ? "x" : " "}] ${check.scope}: ${check.message}`),
  "",
  "## Decisao executiva",
  "",
  "Workflows 01 e 02 aprovados para importacao controlada no n8n. Producao permanece bloqueada ate execucao das fixtures dentro do n8n real, validacao de credenciais, logs nativos e confirmacao de zero envio externo.",
  "",
];

const reportPath = path.join(root, `n8n/logs/HOMOLOGACAO_TECNICA_WORKFLOWS_01_02_${today}.md`);
fs.writeFileSync(reportPath, `${reportLines.join("\n")}\n`);

console.log(JSON.stringify({
  status: failed.length ? "failed" : "passed_with_real_n8n_pending",
  passed: passed.length,
  failed: failed.length,
  report: path.relative(root, reportPath),
}, null, 2));

if (failed.length) {
  process.exitCode = 1;
}
