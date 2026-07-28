// =====================================================
//   Ordo Vitae — configuração do site
// =====================================================
//
// Este é o ÚNICO arquivo que a coordenação precisa editar para
// ligar o site ao backend e trocar a senha da turma.

// -----------------------------------------------------
// 1. Endereço do backend (Google Apps Script)
// -----------------------------------------------------
// Cole aqui a URL gerada ao implantar google-apps-script.js
// (algo como https://script.google.com/macros/s/AKfycb.../exec).
//
// Deixando vazio, o site roda em MODO OFFLINE: o formulário de
// inscrição mostra a confirmação mas não envia nada, e a área de
// membros mostra o conteúdo de exemplo em vez do conteúdo real.
window.OV_API_URL = 'https://script.google.com/macros/s/AKfycbz_K4XTprXXcSMw_e0LKPnRWh0oo8h1Jsev2l5xb1Ukx9ab1_odGAYHx_51_db-TYoXfw/exec';

// -----------------------------------------------------
// 2. Senha da turma
// -----------------------------------------------------
// Usada por inscricao.html (exibe na confirmação) e por
// membros/index.html (valida o login). Trocar a cada turma e
// comunicar individualmente aos participantes confirmados.
//
// Não é segurança real — apenas evita acesso casual ao conteúdo
// comum da turma.
//
// ATENÇÃO: ao trocar aqui, troque também a constante SENHA_TURMA
// em google-apps-script.js, senão o email de confirmação enviará
// a senha antiga.
window.OV_SENHA_TURMA = 'ordovitae';

// -----------------------------------------------------
// 3. Link do Plantão de Aconselhamento Psicológico
// -----------------------------------------------------
// Aparece no painel da área de participantes. Deixando vazio, o
// bloco explica que o link será informado pela coordenação.
window.OV_LINK_PLANTAO = '';
