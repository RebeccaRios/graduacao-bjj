/**
 * Google Apps Script para receber dados do formulário e salvar no Google Sheets
 * 
 * INSTRUÇÕES:
 * 1. Copie este código inteiro
 * 2. Cole no Google Apps Script (Extensões > Apps Script na sua planilha)
 * 3. Salve o projeto
 * 4. Configure como Aplicativo da Web (Implantar > Nova implantação)
 * 5. Copie a URL e cole no script.js
 */

function doPost(e) {
  try {
    // Obter a planilha ativa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse dos dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Preparar os dados para inserir na planilha
    const row = [
      data.data || new Date().toLocaleString('pt-BR'), // Data/Hora
      data.turma || '', // Turma
      data.nomeAluno || '', // Nome do Aluno
      data.nomeResponsavel || '', // Nome do Responsável (vazio se adulto)
      data.temConvidado ? 'Sim' : 'Não', // Tem Convidado
      data.quantidadeConvidados || 0, // Quantidade de Convidados
      data.nomesConvidados ? data.nomesConvidados.join(', ') : '', // Nomes dos Convidados
      data.confirmadoViaWhatsApp ? 'Sim' : 'Não' // Confirmado via WhatsApp
    ];
    
    // Adicionar a linha na planilha
    sheet.appendRow(row);
    
    // Retornar sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Dados salvos com sucesso!' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar erro
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função de teste (opcional - pode deletar depois)
function doGet(e) {
  return ContentService
    .createTextOutput('GCBJJ Form Handler está funcionando!')
    .setMimeType(ContentService.MimeType.TEXT);
}

