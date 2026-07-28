# Ordo Vitae

Site do retiro **Ordo Vitae** — Comissão de Saúde Mental da Comunidade Católica Shalom.

Site estático, sem framework nem build. Para editar, basta abrir o arquivo e salvar.

## Páginas

| Arquivo | Página |
|---|---|
| `index.html` | Início |
| `o-projeto.html` | Fundamentação, módulos, ritmo, equipe, calendário |
| `inscricoes.html` | Processo de discernimento, critérios, FAQ |
| `inscricao.html` | Formulário de inscrição (link enviado pela coordenação) |
| `contato.html` | Contato |
| `participantes.html` | Porta de entrada da área de participantes |
| `membros/` | Área da turma — painel, cronograma, comunicados, materiais, biblioteca |
| `admin/` | Painel da coordenação para publicar conteúdo |

## Configuração

Tudo em [`config.js`](config.js):

- `OV_API_URL` — endereço do backend. **Vazio = modo offline**: o formulário não envia e a área de membros mostra conteúdo de exemplo.
- `OV_SENHA_TURMA` — senha da área de participantes.
- `OV_LINK_PLANTAO` — link de agendamento do Plantão Psicológico.

## Backend

O backend é um Google Apps Script ligado a uma planilha do Sheets. Ele recebe as inscrições e guarda o conteúdo publicado pelo painel de administração.

**O código do backend não fica neste repositório** — ele contém os identificadores da planilha e da pasta do Drive. Está guardado com a coordenação, fora do site.

A senha do painel de administração é conferida no servidor, não no navegador.

## Publicação

Hospedado no GitHub Pages, a partir da branch `main`.

Para usar um domínio próprio (`ordovitae.com.br`):

1. Registrar o domínio.
2. Apontar o DNS para o GitHub Pages.
3. Criar um arquivo `CNAME` na raiz contendo apenas o domínio.
4. Em *Settings → Pages*, informar o domínio.

Sem o domínio registrado, **não** crie o arquivo `CNAME` — ele torna o site inacessível pelo endereço do GitHub.

## Segurança

O acesso à área de participantes é um portão simples, feito para evitar acesso casual ao conteúdo comum da turma — não é autenticação de verdade.

**Dados sensíveis não são hospedados aqui.** Registros pessoais, anotações do acompanhamento e documentos clínicos ficam em sistema próprio, com acesso individual, sob responsabilidade da coordenação.
