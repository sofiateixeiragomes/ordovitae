// Gate de acesso simples da área de membros.
// NÃO é segurança real — apenas evita acesso casual. O conteúdo sensível
// de verdade (página "Sua caminhada", documentos pessoais) deve viver em
// um sistema com autenticação real. Aqui serve como porta de entrada.
//
// A senha da turma NÃO fica aqui — fica em /config.js, carregado por
// membros/index.html antes deste arquivo.

(function () {
  var paginaDeEntrada = /(^|\/)index\.html?$/.test(location.pathname) ||
    location.pathname.endsWith('/membros/') ||
    location.pathname.endsWith('/membros');
  if (paginaDeEntrada) return;
  if (sessionStorage.getItem('ov_acesso') !== 'ok') {
    location.replace('index.html');
  }
})();

function ovSair() {
  sessionStorage.removeItem('ov_acesso');
  location.replace('index.html');
}
