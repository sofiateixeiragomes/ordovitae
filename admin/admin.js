// =====================================================
//   Ordo Vitae — painel de administração
// =====================================================
// A senha é verificada NO SERVIDOR (google-apps-script.js), não aqui.
// Este arquivo só a guarda na sessão para reenviar a cada operação.

const API = window.OV_API_URL || '';
const CHAVE_SESSAO = 'ov_admin_senha';

let conteudo = { comunicados: [], materiais: [], biblioteca: [], cronograma: [], painel: {} };

const FASES = {
  '1': 'Fase 1 — Cura da história de vida',
  '2': 'Fase 2 — Fio de Ouro I e II',
  '3': 'Fase 3 — Fio de Ouro III e IV',
  '4': 'Fase 4 — Liberdade e maturidade'
};

// -----------------------------------------------------
// Utilidades
// -----------------------------------------------------
const $ = id => document.getElementById(id);

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let timerToast;
function toast(msg, erro) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.toggle('erro', !!erro);
  el.classList.add('visivel');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.classList.remove('visivel'), 3000);
}

function senhaAtual() {
  return sessionStorage.getItem(CHAVE_SESSAO) || '';
}

// Chamada ao backend. Content-Type text/plain evita o preflight do CORS.
async function chamar(payload) {
  if (!API) return { ok: false, erro: 'offline' };
  const resp = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ senha: senhaAtual() }, payload))
  });
  return resp.json();
}

function arquivoParaBase64(file) {
  return new Promise((ok, falha) => {
    const leitor = new FileReader();
    leitor.onload = () => ok({
      name: file.name, type: file.type, size: file.size,
      data: leitor.result.split(',')[1]
    });
    leitor.onerror = falha;
    leitor.readAsDataURL(file);
  });
}

// -----------------------------------------------------
// Login
// -----------------------------------------------------
$('formLogin').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('btnEntrar');
  const erro = $('erroLogin');
  const senha = $('senhaAdmin').value.trim();
  erro.classList.remove('visivel');
  btn.disabled = true;
  btn.textContent = 'Entrando…';

  try {
    if (!API) {
      // Sem backend, entra em modo demonstração para dar para navegar
      sessionStorage.setItem(CHAVE_SESSAO, senha);
      abrirPainel();
      return;
    }
    sessionStorage.setItem(CHAVE_SESSAO, senha);
    const r = await chamar({ acao: 'login' });
    if (r.ok) {
      abrirPainel();
    } else {
      sessionStorage.removeItem(CHAVE_SESSAO);
      erro.textContent = r.erro === 'senha-invalida'
        ? 'Senha incorreta.'
        : 'Não foi possível entrar: ' + (r.erro || 'erro desconhecido');
      erro.classList.add('visivel');
    }
  } catch (err) {
    sessionStorage.removeItem(CHAVE_SESSAO);
    erro.textContent = 'Não foi possível falar com o servidor. Confira o endereço em config.js.';
    erro.classList.add('visivel');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
});

function abrirPainel() {
  $('telaLogin').hidden = true;
  $('telaPainel').hidden = false;
  if (!API) $('avisoOffline').classList.add('visivel');
  carregarConteudo();
}

$('btnSair').addEventListener('click', () => {
  sessionStorage.removeItem(CHAVE_SESSAO);
  location.reload();
});

$('btnRecarregar').addEventListener('click', () => carregarConteudo(true));

// Se já entrou nesta sessão, vai direto
if (senhaAtual()) abrirPainel();

// -----------------------------------------------------
// Abas
// -----------------------------------------------------
document.querySelectorAll('.abas button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.abas button').forEach(b => b.classList.remove('ativa'));
    document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
    btn.classList.add('ativa');
    $('secao-' + btn.dataset.secao).classList.add('ativa');
  });
});

// -----------------------------------------------------
// Carregar e desenhar
// -----------------------------------------------------
async function carregarConteudo(avisar) {
  if (!API) { desenharTudo(); return; }
  try {
    const r = await chamar({ acao: 'listar' });
    if (r.ok) {
      conteudo = r.conteudo;
      desenharTudo();
      if (avisar) toast('Conteúdo recarregado');
    } else if (r.erro === 'senha-invalida') {
      sessionStorage.removeItem(CHAVE_SESSAO);
      location.reload();
    } else {
      toast('Erro ao carregar: ' + r.erro, true);
    }
  } catch (err) {
    toast('Sem conexão com o servidor', true);
  }
}

function desenharTudo() {
  desenharComunicados();
  desenharCronograma();
  desenharMateriais();
  desenharBiblioteca();
  preencherPainel();
}

function marcaRascunho(item) {
  return String(item.publicado).toLowerCase() === 'nao' ? ' rascunho' : '';
}

function desenharComunicados() {
  const lista = $('listaComunicados');
  const itens = (conteudo.comunicados || [])
    .slice().sort((a, b) => String(b.data).localeCompare(String(a.data)));
  if (!itens.length) {
    lista.innerHTML = '<div class="vazio">Nenhum comunicado ainda.</div>';
    return;
  }
  lista.innerHTML = itens.map(c => `
    <div class="item${marcaRascunho(c)}">
      <div class="info">
        <p class="meta">${esc(c.data)}${String(c.publicado).toLowerCase() === 'nao' ? ' · rascunho' : ''}</p>
        <h4>${esc(c.titulo)}</h4>
        <p>${esc(c.corpo)}</p>
      </div>
      <div class="botoes">
        <button type="button" onclick="editarComunicado('${esc(c.id)}')">Editar</button>
        <button type="button" class="excluir" onclick="excluir('comunicado','${esc(c.id)}')">Excluir</button>
      </div>
    </div>`).join('');
}

function desenharCronograma() {
  const lista = $('listaCronograma');
  const itens = (conteudo.cronograma || []).slice()
    .sort((a, b) => Number(a.numero || 0) - Number(b.numero || 0));
  if (!itens.length) {
    lista.innerHTML = '<div class="vazio">Nenhum módulo cadastrado ainda.</div>';
    return;
  }
  lista.innerHTML = itens.map(m => {
    const ehAtual = String(m.atual).toLowerCase() === 'sim';
    const nAtiv = String(m.atividades || '').split('\n').filter(l => l.trim()).length;
    return `
    <div class="item${marcaRascunho(m)}">
      <div class="info">
        <p class="meta">Módulo ${esc(m.numero)}${ehAtual ? ' · ATUAL' : ''}${String(m.publicado).toLowerCase() === 'nao' ? ' · rascunho' : ''}</p>
        <h4>${esc(m.titulo)}</h4>
        <p>${esc(m.datas || 'Datas a confirmar')}${nAtiv ? ` · ${nAtiv} atividade${nAtiv > 1 ? 's' : ''} no intervalo` : ''}</p>
      </div>
      <div class="botoes">
        <button type="button" onclick="editarModulo('${esc(m.id)}')">Editar</button>
        <button type="button" class="excluir" onclick="excluir('modulo','${esc(m.id)}')">Excluir</button>
      </div>
    </div>`;
  }).join('');
}

function desenharMateriais() {
  const lista = $('listaMateriais');
  const itens = (conteudo.materiais || []).slice()
    .sort((a, b) => String(a.fase).localeCompare(String(b.fase)));
  if (!itens.length) {
    lista.innerHTML = '<div class="vazio">Nenhum material ainda.</div>';
    return;
  }
  lista.innerHTML = itens.map(m => `
    <div class="item${marcaRascunho(m)}">
      <div class="info">
        <p class="meta">${esc(FASES[m.fase] || 'Fase ' + m.fase)} · ${esc(m.tipo)}${String(m.publicado).toLowerCase() === 'nao' ? ' · rascunho' : ''}</p>
        <h4>${esc(m.titulo)}</h4>
        ${m.url ? `<p><a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.url)}</a></p>` : '<p>Sem link.</p>'}
      </div>
      <div class="botoes">
        <button type="button" onclick="editarMaterial('${esc(m.id)}')">Editar</button>
        <button type="button" class="excluir" onclick="excluir('material','${esc(m.id)}')">Excluir</button>
      </div>
    </div>`).join('');
}

function desenharBiblioteca() {
  const lista = $('listaBiblioteca');
  const itens = (conteudo.biblioteca || []).slice()
    .sort((a, b) => String(a.tema).localeCompare(String(b.tema)));
  if (!itens.length) {
    lista.innerHTML = '<div class="vazio">Nenhuma referência ainda.</div>';
    return;
  }
  lista.innerHTML = itens.map(r => `
    <div class="item${marcaRascunho(r)}">
      <div class="info">
        <p class="meta">${esc(r.tema)} · ${esc(r.tipo)}${String(r.publicado).toLowerCase() === 'nao' ? ' · rascunho' : ''}</p>
        <h4>${esc(r.titulo)}</h4>
        <p>${esc(r.autor || '')}</p>
      </div>
      <div class="botoes">
        <button type="button" onclick="editarReferencia('${esc(r.id)}')">Editar</button>
        <button type="button" class="excluir" onclick="excluir('referencia','${esc(r.id)}')">Excluir</button>
      </div>
    </div>`).join('');
}

function preencherPainel() {
  const p = conteudo.painel || {};
  const f = $('formPainel');
  ['fraseDia','faseAtual','faseDescricao','proximoEncontro','proximoLocal','linkPlantao']
    .forEach(k => { if (f[k]) f[k].value = p[k] || ''; });
}

// -----------------------------------------------------
// Salvar
// -----------------------------------------------------
function dadosDoForm(form) {
  const d = {};
  new FormData(form).forEach((v, k) => { if (!(v instanceof File)) d[k] = v; });
  return d;
}

async function salvar(tipo, form, campoArquivo) {
  if (!API) { toast('Modo offline — nada foi salvo', true); return; }
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  const rotulo = btn.textContent;
  btn.textContent = 'Salvando…';

  try {
    const dados = dadosDoForm(form);
    let arquivo = null;
    if (campoArquivo && campoArquivo.files && campoArquivo.files[0]) {
      arquivo = await arquivoParaBase64(campoArquivo.files[0]);
    }
    const r = await chamar({ acao: 'salvar', tipo, dados, arquivo });
    if (r.ok) {
      toast('Salvo');
      form.reset();
      form.querySelector('[name=id]').value = '';
      if (campoArquivo) campoArquivo.value = '';
      await carregarConteudo();
    } else {
      toast('Erro ao salvar: ' + (r.erro || ''), true);
    }
  } catch (err) {
    toast('Sem conexão com o servidor', true);
  } finally {
    btn.disabled = false;
    btn.textContent = rotulo;
  }
}

$('formComunicado').addEventListener('submit', e => {
  e.preventDefault();
  salvar('comunicado', e.target);
});
$('formMaterial').addEventListener('submit', e => {
  e.preventDefault();
  const dados = dadosDoForm(e.target);
  const temArquivo = $('mat-arquivo').files.length > 0;
  if (!dados.url && !temArquivo) {
    toast('Informe um link ou envie um arquivo', true);
    return;
  }
  salvar('material', e.target, $('mat-arquivo'));
});
$('formReferencia').addEventListener('submit', e => {
  e.preventDefault();
  salvar('referencia', e.target);
});
$('formModulo').addEventListener('submit', e => {
  e.preventDefault();
  salvar('modulo', e.target);
});

$('formPainel').addEventListener('submit', async e => {
  e.preventDefault();
  if (!API) { toast('Modo offline — nada foi salvo', true); return; }
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Salvando…';
  try {
    const r = await chamar({ acao: 'painel', dados: dadosDoForm(e.target) });
    toast(r.ok ? 'Painel atualizado' : 'Erro: ' + (r.erro || ''), !r.ok);
    if (r.ok) await carregarConteudo();
  } catch (err) {
    toast('Sem conexão com o servidor', true);
  } finally {
    btn.disabled = false; btn.textContent = 'Salvar painel';
  }
});

// -----------------------------------------------------
// Editar e excluir
// -----------------------------------------------------
function preencher(form, item, titulo, rotulo) {
  Object.keys(item).forEach(k => { if (form[k]) form[k].value = item[k]; });
  $(titulo).textContent = rotulo;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function editarComunicado(id) {
  const c = (conteudo.comunicados || []).find(x => String(x.id) === String(id));
  if (c) preencher($('formComunicado'), c, 'tituloFormComunicado', 'Editando comunicado');
}
function editarMaterial(id) {
  const m = (conteudo.materiais || []).find(x => String(x.id) === String(id));
  if (m) preencher($('formMaterial'), m, 'tituloFormMaterial', 'Editando material');
}
function editarReferencia(id) {
  const r = (conteudo.biblioteca || []).find(x => String(x.id) === String(id));
  if (r) preencher($('formReferencia'), r, 'tituloFormReferencia', 'Editando referência');
}
function editarModulo(id) {
  const m = (conteudo.cronograma || []).find(x => String(x.id) === String(id));
  if (m) preencher($('formModulo'), m, 'tituloFormModulo', 'Editando módulo ' + m.numero);
}

async function excluir(tipo, id) {
  if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return;
  if (!API) { toast('Modo offline — nada foi excluído', true); return; }
  try {
    const r = await chamar({ acao: 'excluir', tipo, id });
    toast(r.ok ? 'Excluído' : 'Erro: ' + (r.erro || ''), !r.ok);
    if (r.ok) await carregarConteudo();
  } catch (err) {
    toast('Sem conexão com o servidor', true);
  }
}

// Botões "Limpar" — saem do modo de edição
document.querySelectorAll('[data-limpar]').forEach(btn => {
  btn.addEventListener('click', () => {
    const form = $(btn.dataset.limpar);
    form.reset();
    form.querySelector('[name=id]').value = '';
    const titulos = {
      formComunicado: ['tituloFormComunicado', 'Novo comunicado'],
      formMaterial:   ['tituloFormMaterial', 'Novo material'],
      formReferencia: ['tituloFormReferencia', 'Nova referência'],
      formModulo:     ['tituloFormModulo', 'Novo módulo']
    };
    const t = titulos[btn.dataset.limpar];
    if (t) $(t[0]).textContent = t[1];
  });
});

// Data de hoje já preenchida em novos comunicados
$('com-data').value = new Date().toISOString().slice(0, 10);
