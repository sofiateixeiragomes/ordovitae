// =====================================================
//   Ordo Vitae — carrega o conteúdo publicado pela coordenação
// =====================================================
// Busca o que foi publicado no painel de administração e substitui
// os blocos de exemplo. Se o backend não estiver configurado, ou se
// a busca falhar, o conteúdo de exemplo permanece — a página nunca
// quebra nem fica vazia por causa disso.

(function () {
  const API = window.OV_API_URL || '';

  const FASES = {
    '1': 'Fase 1 — Cura da história de vida',
    '2': 'Fase 2 — Fio de Ouro (partes I e II)',
    '3': 'Fase 3 — Tecendo o Fio de Ouro (partes III e IV)',
    '4': 'Fase 4 — Liberdade interior e maturidade humana'
  };

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Preserva as quebras de linha que a coordenação digitou
  function paragrafos(texto) {
    return String(texto || '').split(/\n{2,}/)
      .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  }

  function formatarData(iso) {
    if (!iso) return '';
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(iso);
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${m[3]} de ${meses[Number(m[2]) - 1]} de ${m[1]}`;
  }

  // -----------------------------------------------------
  // Renderizadores — cada um só age se a página tiver o alvo
  // -----------------------------------------------------

  function renderPainel(d) {
    const p = d.painel || {};

    const frase = document.getElementById('ovFraseDia');
    if (frase && p.fraseDia) frase.textContent = '"' + p.fraseDia + '"';

    const fase = document.getElementById('ovFaseAtual');
    if (fase && p.faseAtual) fase.textContent = p.faseAtual;

    const faseDesc = document.getElementById('ovFaseDescricao');
    if (faseDesc && p.faseDescricao) faseDesc.textContent = p.faseDescricao;

    const enc = document.getElementById('ovProximoEncontro');
    if (enc && p.proximoEncontro) enc.textContent = p.proximoEncontro;

    const local = document.getElementById('ovProximoLocal');
    if (local && p.proximoLocal) local.textContent = p.proximoLocal;

    // Botão do Plantão: usa o link do painel, ou o de config.js
    const btn = document.getElementById('ovBotaoPlantao');
    const link = p.linkPlantao || window.OV_LINK_PLANTAO || '';
    if (btn && link) {
      btn.href = link;
      btn.removeAttribute('aria-disabled');
      const aviso = document.getElementById('ovAvisoPlantao');
      if (aviso) aviso.hidden = true;
    }

    // Três comunicados mais recentes no painel
    const ultimos = document.getElementById('ovUltimosComunicados');
    if (ultimos) {
      const itens = (d.comunicados || []).slice(0, 3);
      if (itens.length) ultimos.innerHTML = itens.map(cartaoComunicado).join('');
    }
  }

  function cartaoComunicado(c) {
    return `
      <div class="post">
        <p class="post-date">${esc(formatarData(c.data))}</p>
        <h3>${esc(c.titulo)}</h3>
        ${paragrafos(c.corpo)}
        ${c.autor ? `<p class="post-author">— ${esc(c.autor)}</p>` : ''}
      </div>`;
  }

  function renderComunicados(d) {
    const alvo = document.getElementById('ovComunicados');
    if (!alvo) return;
    const itens = d.comunicados || [];
    alvo.innerHTML = itens.length
      ? itens.map(cartaoComunicado).join('')
      : '<p class="placeholder-note">Ainda não há comunicados publicados.</p>';
  }

  function renderCronograma(d) {
    const alvo = document.getElementById('ovCronograma');
    if (!alvo) return;
    const modulos = d.cronograma || [];
    if (!modulos.length) return; // mantém o exemplo

    alvo.innerHTML = modulos.map(m => {
      const atual = String(m.atual).toLowerCase() === 'sim';
      const atividades = String(m.atividades || '')
        .split('\n').map(l => l.trim()).filter(Boolean);
      // Módulo sem título ainda não foi divulgado: mostra só o número,
      // sem o travessão solto que sobraria de um nome vazio.
      const titulo = String(m.titulo || '').trim();
      return `
        <div class="modulo-row${atual ? ' atual' : ''}">
          ${atual ? '<span class="tag-atual">Módulo atual</span>' : ''}
          <h3>Módulo ${esc(m.numero)}${titulo ? ' — ' + esc(titulo) : ''}</h3>
          <p class="datas">${esc(m.datas || 'Datas a confirmar')}${m.local ? ' · ' + esc(m.local) : ''}</p>
          ${m.descricao ? `<p>${esc(m.descricao)}</p>` : ''}
          ${atividades.length ? `
            <div class="intervalo">
              <strong>Até o próximo módulo</strong>
              <ul>${atividades.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
            </div>` : ''}
        </div>`;
    }).join('');

    // O aviso de "a coordenação preenche as datas" perde o sentido quando há conteúdo
    const nota = document.getElementById('ovNotaCronograma');
    if (nota) nota.hidden = true;
  }

  function renderMateriais(d) {
    const alvo = document.getElementById('ovMateriais');
    if (!alvo) return;
    const itens = d.materiais || [];
    if (!itens.length) return; // mantém o exemplo

    const porFase = {};
    itens.forEach(m => { (porFase[m.fase] = porFase[m.fase] || []).push(m); });

    alvo.innerHTML = Object.keys(porFase).sort().map(fase => {
      const porTipo = {};
      porFase[fase].forEach(m => { (porTipo[m.tipo] = porTipo[m.tipo] || []).push(m); });
      const blocos = Object.keys(porTipo).map(tipo => `
        <h4>${esc(tipo)}</h4>
        <ul class="material-list">
          ${porTipo[tipo].map(m => `
            <li>
              <span class="material-kind">${esc(m.tipo)}</span>
              ${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.titulo)}</a>` : esc(m.titulo)}
            </li>`).join('')}
        </ul>`).join('');
      return `
        <section class="fase-block" id="fase${esc(fase)}">
          <h2>${esc(FASES[fase] || 'Fase ' + fase)}</h2>
          ${blocos}
        </section>`;
    }).join('');
  }

  // Publicações avulsas: artigos, vídeos, áudios sem vínculo com módulo ou fase.
  // Entram em dois lugares — as mais recentes no painel, todas na página própria.
  function cartaoPublicacao(p) {
    const destaque = String(p.destaque).toLowerCase() === 'sim';
    const titulo = p.url
      ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.titulo)}</a>`
      : esc(p.titulo);
    return `
      <article class="pub-card${destaque ? ' destaque' : ''}">
        <p class="pub-meta">
          <span class="pub-tipo">${esc(p.tipo || 'Publicação')}</span>
          ${p.data ? `<span class="pub-data">${esc(formatarData(p.data))}</span>` : ''}
        </p>
        <h3>${titulo}</h3>
        ${p.descricao ? paragrafos(p.descricao) : ''}
        ${p.url ? `<p class="pub-acao"><a href="${esc(p.url)}" target="_blank" rel="noopener">Abrir →</a></p>` : ''}
      </article>`;
  }

  function renderPublicacoes(d) {
    const itens = d.publicacoes || [];

    // Painel inicial — só as mais recentes, para não competir com o resto
    const noPainel = document.getElementById('ovPublicacoesPainel');
    if (noPainel && itens.length) {
      noPainel.innerHTML = itens.slice(0, 4).map(cartaoPublicacao).join('');
    }

    // Página de publicações — todas
    const alvo = document.getElementById('ovPublicacoes');
    if (alvo) {
      alvo.innerHTML = itens.length
        ? itens.map(cartaoPublicacao).join('')
        : '<p class="placeholder-note">Ainda não há publicações. Assim que a coordenação publicar um artigo, vídeo ou áudio, ele aparece aqui.</p>';
    }
  }

  function renderBiblioteca(d) {
    const alvo = document.getElementById('ovBiblioteca');
    if (!alvo) return;
    const itens = d.biblioteca || [];
    if (!itens.length) return; // mantém o exemplo

    const porTema = {};
    itens.forEach(r => { (porTema[r.tema] = porTema[r.tema] || []).push(r); });

    alvo.innerHTML = Object.keys(porTema).sort().map(tema => `
      <div class="tema-block">
        <h3>${esc(tema)}</h3>
        <ul class="ref-list">
          ${porTema[tema].map(r => `
            <li>
              <span class="ref-tipo">${esc(r.tipo)}</span>
              ${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.titulo)}</a>` : esc(r.titulo)}
              ${r.autor ? `<span class="ref-autor">— ${esc(r.autor)}</span>` : ''}
            </li>`).join('')}
        </ul>
      </div>`).join('');
  }

  // -----------------------------------------------------
  // Busca
  // -----------------------------------------------------
  async function carregar() {
    if (!API) return;
    try {
      const resp = await fetch(API + '?acao=conteudo');
      const d = await resp.json();
      if (!d || d.ok === false) return;
      renderPainel(d);
      renderComunicados(d);
      renderCronograma(d);
      renderMateriais(d);
      renderPublicacoes(d);
      renderBiblioteca(d);
    } catch (err) {
      // Silencioso de propósito: o conteúdo de exemplo continua na tela
      console.warn('Conteúdo publicado não pôde ser carregado:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregar);
  } else {
    carregar();
  }
})();
