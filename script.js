// Configuração do Google Sheets
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxM8L6uVm4CUtvd1E6N88w_5f2NKLURzPPQ35XFjGCppzvZlkUpe5lLVRUBOTJkIELRIA/exec';

// Elementos do DOM
const turmaSelect = document.getElementById('turma');
const fluxoKids = document.getElementById('fluxoKids');
const fluxoAdulto = document.getElementById('fluxoAdulto');
const infoPagamento = document.getElementById('infoPagamento');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('confirmacaoForm');

// Event listeners
turmaSelect.addEventListener('change', () => {
    // Esconder pagamento imediatamente ao mudar turma
    infoPagamento.style.display = 'none';
    submitBtn.style.display = 'none';
    mostrarFluxo();
    calcularValorTotal();
});
document.querySelectorAll('input[name="convidadoKids"]').forEach(radio => {
    radio.addEventListener('change', () => {
        toggleConvidadoSection('kids');
        calcularValorTotal();
        validarFormularioCompleto();
    });
});
document.querySelectorAll('input[name="convidadoAdulto"]').forEach(radio => {
    radio.addEventListener('change', () => {
        toggleConvidadoSection('adulto');
        calcularValorTotal();
        validarFormularioCompleto();
    });
});

document.getElementById('quantidadeConvidadosKids')?.addEventListener('input', (e) => {
    criarInputsConvidados('kids', parseInt(e.target.value) || 0);
    calcularValorTotal();
    validarFormularioCompleto();
});

document.getElementById('quantidadeConvidadosAdulto')?.addEventListener('input', (e) => {
    criarInputsConvidados('adulto', parseInt(e.target.value) || 0);
    calcularValorTotal();
    validarFormularioCompleto();
});

// Adicionar listeners para validar quando campos mudarem
document.getElementById('nomeAlunoKids')?.addEventListener('input', validarFormularioCompleto);
document.getElementById('nomeResponsavel')?.addEventListener('input', validarFormularioCompleto);
document.getElementById('nomeAlunoAdulto')?.addEventListener('input', validarFormularioCompleto);

form.addEventListener('submit', handleSubmit);

// Botão do WhatsApp
document.getElementById('whatsappBtn')?.addEventListener('click', handleWhatsAppClick);

// Botão de copiar PIX
document.getElementById('copyPixBtn')?.addEventListener('click', copiarChavePix);

// Funções
function calcularValorTotal() {
    const turma = turmaSelect.value;
    const valorTotalElement = document.getElementById('valorTotal');
    
    if (!turma || !valorTotalElement) {
        return;
    }
    
    let valorBase = 80; // R$ 80,00 base
    let quantidadeConvidados = 0;
    
    if (turma === 'kids') {
        const convidadoRadio = document.querySelector('input[name="convidadoKids"]:checked');
        if (convidadoRadio && convidadoRadio.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosKids')?.value || 0);
            quantidadeConvidados = quantidade;
        }
    } else if (turma === 'adulto') {
        const convidadoRadio = document.querySelector('input[name="convidadoAdulto"]:checked');
        if (convidadoRadio && convidadoRadio.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosAdulto')?.value || 0);
            quantidadeConvidados = quantidade;
        }
    }
    
    // Calcular valor total: R$ 80 + (quantidade de convidados * R$ 40)
    const valorTotal = valorBase + (quantidadeConvidados * 40);
    
    // Formatar como moeda brasileira
    valorTotalElement.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
}

function mostrarFluxo() {
    const turma = turmaSelect.value;
    
    // Esconder todos os fluxos e seção de pagamento
    fluxoKids.style.display = 'none';
    fluxoAdulto.style.display = 'none';
    infoPagamento.style.display = 'none';
    submitBtn.style.display = 'none';
    
    // Limpar apenas os campos do fluxo que não está sendo usado
    if (turma !== 'kids') {
        // Limpar campos do fluxo kids
        document.getElementById('nomeAlunoKids').value = '';
        document.getElementById('nomeResponsavel').value = '';
        document.querySelectorAll('input[name="convidadoKids"]').forEach(radio => radio.checked = false);
        document.getElementById('quantidadeConvidadosKids').value = '';
        document.getElementById('nomesConvidadosKids').innerHTML = '';
    }
    
    if (turma !== 'adulto') {
        // Limpar campos do fluxo adulto
        document.getElementById('nomeAlunoAdulto').value = '';
        document.querySelectorAll('input[name="convidadoAdulto"]').forEach(radio => radio.checked = false);
        document.getElementById('quantidadeConvidadosAdulto').value = '';
        document.getElementById('nomesConvidadosAdulto').innerHTML = '';
    }
    
    // Remover required de todos os campos primeiro
    document.getElementById('nomeAlunoKids').required = false;
    document.getElementById('nomeResponsavel').required = false;
    document.getElementById('nomeAlunoAdulto').required = false;
    document.querySelectorAll('input[name="convidadoKids"]').forEach(radio => radio.required = false);
    document.querySelectorAll('input[name="convidadoAdulto"]').forEach(radio => radio.required = false);
    
    // Mostrar fluxo correspondente e adicionar required apenas nos campos visíveis
    if (turma === 'kids') {
        fluxoKids.style.display = 'block';
        // Tornar campos obrigatórios apenas se estiverem visíveis
        document.getElementById('nomeAlunoKids').required = true;
        document.getElementById('nomeResponsavel').required = true;
        document.querySelectorAll('input[name="convidadoKids"]').forEach(radio => radio.required = true);
    } else if (turma === 'adulto') {
        fluxoAdulto.style.display = 'block';
        // Tornar campos obrigatórios apenas se estiverem visíveis
        document.getElementById('nomeAlunoAdulto').required = true;
        document.querySelectorAll('input[name="convidadoAdulto"]').forEach(radio => radio.required = true);
    }
    
    // Não mostrar pagamento/botões automaticamente - só quando formulário estiver completo
    if (turma) {
        calcularValorTotal();
        // Garantir que está escondido inicialmente
        infoPagamento.style.display = 'none';
        submitBtn.style.display = 'none';
        // Validar após um pequeno delay para garantir que os campos foram limpos
        setTimeout(() => validarFormularioCompleto(), 50);
    }
}

function toggleConvidadoSection(tipo) {
    const isKids = tipo === 'kids';
    const section = isKids ? 
        document.getElementById('convidadoKidsSection') : 
        document.getElementById('convidadoAdultoSection');
    const radioSim = isKids ? 
        document.querySelector('input[name="convidadoKids"][value="sim"]') : 
        document.querySelector('input[name="convidadoAdulto"][value="sim"]');
    const quantidadeInput = isKids ? 
        document.getElementById('quantidadeConvidadosKids') : 
        document.getElementById('quantidadeConvidadosAdulto');
    const nomesContainer = isKids ? 
        document.getElementById('nomesConvidadosKids') : 
        document.getElementById('nomesConvidadosAdulto');
    
    if (radioSim.checked) {
        section.style.display = 'block';
        quantidadeInput.required = true;
    } else {
        section.style.display = 'none';
        quantidadeInput.required = false;
        quantidadeInput.value = '';
        nomesContainer.innerHTML = '';
    }
    
    // Validar após mudança
    setTimeout(() => validarFormularioCompleto(), 100);
}

function criarInputsConvidados(tipo, quantidade) {
    const container = tipo === 'kids' ? 
        document.getElementById('nomesConvidadosKids') : 
        document.getElementById('nomesConvidadosAdulto');
    
    container.innerHTML = '';
    
    if (quantidade > 0 && quantidade <= 10) {
        for (let i = 1; i <= quantidade; i++) {
            const div = document.createElement('div');
            div.className = 'convidado-input-group';
            // Capitalizar primeira letra do tipo para o name
            const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            div.innerHTML = `
                <label for="convidado${tipo}${i}">Nome do Convidado ${i} *</label>
                <input type="text" id="convidado${tipo}${i}" name="convidado${tipoCapitalizado}${i}" required>
            `;
            container.appendChild(div);
            
            // Adicionar listener para validar quando nome do convidado for preenchido
            const input = div.querySelector('input');
            if (input) {
                input.addEventListener('input', validarFormularioCompleto);
            }
        }
    }
    
    // Validar após criar os inputs
    setTimeout(() => validarFormularioCompleto(), 100);
}

function handleSubmit(e) {
    e.preventDefault();
    console.log('Formulário enviado!');
    
    const turma = turmaSelect.value;
    
    if (!turma) {
        alert('Por favor, selecione uma turma.');
        turmaSelect.focus();
        return;
    }
    
    // Remover required de campos escondidos antes de validar
    if (turma === 'kids') {
        document.getElementById('nomeAlunoAdulto').required = false;
        document.querySelectorAll('input[name="convidadoAdulto"]').forEach(radio => radio.required = false);
    } else if (turma === 'adulto') {
        document.getElementById('nomeAlunoKids').required = false;
        document.getElementById('nomeResponsavel').required = false;
        document.querySelectorAll('input[name="convidadoKids"]').forEach(radio => radio.required = false);
    }
    
    // Validar se o formulário está válido
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        turma: turma,
        data: new Date().toLocaleString('pt-BR'),
    };
    
    if (turma === 'kids') {
        data.nomeAluno = formData.get('nomeAlunoKids');
        data.nomeResponsavel = formData.get('nomeResponsavel');
        data.temConvidado = formData.get('convidadoKids') === 'sim';
        
        if (data.temConvidado) {
            const quantidade = parseInt(formData.get('quantidadeConvidadosKids'));
            data.quantidadeConvidados = quantidade;
            data.nomesConvidados = [];
            for (let i = 1; i <= quantidade; i++) {
                const nome = buscarNomeConvidado('kids', i);
                if (nome) {
                    data.nomesConvidados.push(nome);
                }
            }
        }
    } else if (turma === 'adulto') {
        data.nomeAluno = formData.get('nomeAlunoAdulto');
        data.temConvidado = formData.get('convidadoAdulto') === 'sim';
        
        if (data.temConvidado) {
            const quantidade = parseInt(formData.get('quantidadeConvidadosAdulto'));
            data.quantidadeConvidados = quantidade;
            data.nomesConvidados = [];
            for (let i = 1; i <= quantidade; i++) {
                const nome = buscarNomeConvidado('adulto', i);
                if (nome) {
                    data.nomesConvidados.push(nome);
                }
            }
        }
    }
    
    // Enviar dados para Google Sheets
    enviarParaGoogleSheets(data);
    
    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso();
    
    // Resetar formulário após 5 segundos
    setTimeout(() => {
        form.reset();
        turmaSelect.value = '';
        mostrarFluxo();
        document.getElementById('successModal').style.display = 'none';
        form.style.display = 'block';
    }, 5000);
}

function mostrarMensagemSucesso() {
    form.style.display = 'none';
    document.getElementById('successModal').style.display = 'flex';
}

// Botão do WhatsApp no modal (apenas abre WhatsApp, não envia dados)
document.getElementById('whatsappModalBtn')?.addEventListener('click', () => {
    window.open('https://api.whatsapp.com/send?phone=5521969950977&text=Gostaria%20de%20confirmar%20minha%20participa%C3%A7%C3%A3o%20na%20gradua%C3%A7%C3%A3o%20da%20GCBJJ', '_blank');
});

// Função para validar se o formulário está completo
function validarFormularioCompleto() {
    const turma = turmaSelect.value;
    
    if (!turma) {
        infoPagamento.style.display = 'none';
        submitBtn.style.display = 'none';
        return;
    }
    
    let isComplete = false;
    
    if (turma === 'kids') {
        const nomeAluno = document.getElementById('nomeAlunoKids')?.value.trim();
        const nomeResponsavel = document.getElementById('nomeResponsavel')?.value.trim();
        const convidado = document.querySelector('input[name="convidadoKids"]:checked');
        
        if (!nomeAluno || !nomeResponsavel || !convidado) {
            isComplete = false;
        } else if (convidado.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosKids')?.value || 0);
            if (!quantidade || quantidade < 1) {
                isComplete = false;
            } else {
                // Verificar se todos os nomes dos convidados estão preenchidos
                isComplete = true;
                for (let i = 1; i <= quantidade; i++) {
                    const nomeConvidado = buscarNomeConvidado('kids', i);
                    if (!nomeConvidado) {
                        isComplete = false;
                        break;
                    }
                }
            }
        } else {
            isComplete = true; // Sem convidado e campos básicos preenchidos
        }
    } else if (turma === 'adulto') {
        const nomeAluno = document.getElementById('nomeAlunoAdulto')?.value.trim();
        const convidado = document.querySelector('input[name="convidadoAdulto"]:checked');
        
        if (!nomeAluno || !convidado) {
            isComplete = false;
        } else if (convidado.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosAdulto')?.value || 0);
            if (!quantidade || quantidade < 1) {
                isComplete = false;
            } else {
                // Verificar se todos os nomes dos convidados estão preenchidos
                isComplete = true;
                for (let i = 1; i <= quantidade; i++) {
                    const nomeConvidado = buscarNomeConvidado('adulto', i);
                    if (!nomeConvidado) {
                        isComplete = false;
                        break;
                    }
                }
            }
        } else {
            isComplete = true; // Sem convidado e campos básicos preenchidos
        }
    }
    
    // Mostrar/esconder seção de pagamento e botões
    if (isComplete) {
        infoPagamento.style.display = 'block';
        submitBtn.style.display = 'block';
    } else {
        infoPagamento.style.display = 'none';
        submitBtn.style.display = 'none';
    }
}

// Função auxiliar para buscar nome do convidado (tenta múltiplas formas)
function buscarNomeConvidado(tipo, index) {
    const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    // Tentar pelo ID em diferentes formatos
    const ids = [
        `convidado${tipo}${index}`,           // convidadokids1
        `convidado${tipoCapitalizado}${index}`, // convidadoKids1
        `convidadokids${index}`,             // fallback minúsculo
        `convidadoadulto${index}`,           // fallback minúsculo
    ];
    
    for (const id of ids) {
        const input = document.getElementById(id);
        if (input && input.value && input.value.trim()) {
            return input.value.trim();
        }
    }
    
    // Se não encontrou pelo ID, tentar pelo name usando querySelector
    const name = `convidado${tipoCapitalizado}${index}`;
    const inputByName = document.querySelector(`input[name="${name}"]`);
    if (inputByName && inputByName.value && inputByName.value.trim()) {
        return inputByName.value.trim();
    }
    
    return null;
}

// Função para enviar dados para Google Sheets
async function enviarParaGoogleSheets(data) {
    // Se a URL não estiver configurada, apenas loga no console
    if (!GOOGLE_SCRIPT_URL) {
        console.log('Dados do formulário (Google Sheets não configurado):', data);
        console.log('⚠️ Configure a URL do Google Apps Script no arquivo script.js');
        return;
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Necessário para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Com no-cors, não podemos ler a resposta, mas assumimos sucesso
        console.log('✅ Dados enviados para Google Sheets:', data);
    } catch (error) {
        console.error('❌ Erro ao enviar dados:', error);
        // Mesmo com erro, não bloqueia o fluxo do usuário
    }
}

function handleWhatsAppClick(e) {
    e.preventDefault();
    
    const turma = turmaSelect.value;
    
    // Validar se pelo menos a turma está selecionada
    if (!turma) {
        alert('Por favor, selecione uma turma primeiro.');
        turmaSelect.focus();
        return;
    }
    
    // Validar campos obrigatórios básicos
    let isValid = false;
    if (turma === 'kids') {
        const nomeAluno = document.getElementById('nomeAlunoKids').value.trim();
        const nomeResponsavel = document.getElementById('nomeResponsavel').value.trim();
        const convidado = document.querySelector('input[name="convidadoKids"]:checked');
        
        if (!nomeAluno || !nomeResponsavel || !convidado) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Se tem convidado, validar quantidade e nomes
        if (convidado.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosKids').value);
            if (!quantidade || quantidade < 1) {
                alert('Por favor, informe a quantidade de convidados.');
                return;
            }
            // Validar se todos os nomes foram preenchidos
            for (let i = 1; i <= quantidade; i++) {
                const nomeConvidado = buscarNomeConvidado('kids', i);
                if (!nomeConvidado) {
                    alert(`Por favor, preencha o nome do convidado ${i}.`);
                    return;
                }
            }
        }
        isValid = true;
    } else if (turma === 'adulto') {
        const nomeAluno = document.getElementById('nomeAlunoAdulto').value.trim();
        const convidado = document.querySelector('input[name="convidadoAdulto"]:checked');
        
        if (!nomeAluno || !convidado) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Se tem convidado, validar quantidade e nomes
        if (convidado.value === 'sim') {
            const quantidade = parseInt(document.getElementById('quantidadeConvidadosAdulto').value);
            if (!quantidade || quantidade < 1) {
                alert('Por favor, informe a quantidade de convidados.');
                return;
            }
            // Validar se todos os nomes foram preenchidos
            for (let i = 1; i <= quantidade; i++) {
                const nomeConvidado = buscarNomeConvidado('adulto', i);
                if (!nomeConvidado) {
                    alert(`Por favor, preencha o nome do convidado ${i}.`);
                    return;
                }
            }
        }
        isValid = true;
    }
    
    if (!isValid) {
        return;
    }
    
    // Coletar dados do formulário (reutilizar lógica do handleSubmit)
    const formData = new FormData(form);
    const data = {
        turma: turma,
        data: new Date().toLocaleString('pt-BR'),
        confirmadoViaWhatsApp: true, // Marcar que foi confirmado via WhatsApp
    };
    
    if (turma === 'kids') {
        data.nomeAluno = formData.get('nomeAlunoKids');
        data.nomeResponsavel = formData.get('nomeResponsavel');
        data.temConvidado = formData.get('convidadoKids') === 'sim';
        
        if (data.temConvidado) {
            const quantidade = parseInt(formData.get('quantidadeConvidadosKids'));
            data.quantidadeConvidados = quantidade;
            data.nomesConvidados = [];
            for (let i = 1; i <= quantidade; i++) {
                const nome = buscarNomeConvidado('kids', i);
                if (nome) {
                    data.nomesConvidados.push(nome);
                }
            }
        }
    } else if (turma === 'adulto') {
        data.nomeAluno = formData.get('nomeAlunoAdulto');
        data.temConvidado = formData.get('convidadoAdulto') === 'sim';
        
        if (data.temConvidado) {
            const quantidade = parseInt(formData.get('quantidadeConvidadosAdulto'));
            data.quantidadeConvidados = quantidade;
            data.nomesConvidados = [];
            for (let i = 1; i <= quantidade; i++) {
                const nome = buscarNomeConvidado('adulto', i);
                if (nome) {
                    data.nomesConvidados.push(nome);
                }
            }
        }
    }
    
    // Enviar dados para Google Sheets
    enviarParaGoogleSheets(data);
    
    // Abrir WhatsApp
    window.open('https://api.whatsapp.com/send?phone=5521969950977&text=Gostaria%20de%20confirmar%20minha%20participa%C3%A7%C3%A3o%20na%20gradua%C3%A7%C3%A3o%20da%20GCBJJ', '_blank');
    
    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso();
    
    // Resetar formulário após 5 segundos
    setTimeout(() => {
        form.reset();
        turmaSelect.value = '';
        mostrarFluxo();
        document.getElementById('successModal').style.display = 'none';
        form.style.display = 'block';
    }, 5000);
}



// Função para copiar chave PIX
function copiarChavePix() {
    const pixKey = document.getElementById('pixKey').textContent.trim();
    const feedback = document.getElementById('copyFeedback');
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(pixKey).then(() => {
        // Mostrar feedback
        feedback.style.display = 'block';
        feedback.textContent = '✓ Copiado!';
        feedback.style.color = '#4caf50';
        
        // Esconder feedback após 2 segundos
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
    }).catch(err => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = pixKey;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            feedback.style.display = 'block';
            feedback.textContent = '✓ Copiado!';
            feedback.style.color = '#4caf50';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 2000);
        } catch (err) {
            feedback.style.display = 'block';
            feedback.textContent = '❌ Erro ao copiar';
            feedback.style.color = '#f44336';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 2000);
        }
        
        document.body.removeChild(textArea);
    });
}
