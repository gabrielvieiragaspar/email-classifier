class EmailClassifier {
    constructor() {
        this.currentFile = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectedFile = document.getElementById('selectedFile');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultCard = document.getElementById('resultCard');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.emailText = document.getElementById('emailText');
        this.copyResponseBtn = document.getElementById('copyResponseBtn');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.darkModeIcon = document.getElementById('darkModeIcon');
        this.mobileActionBtn = document.getElementById('mobileActionBtn');
        
        // Verifica se o dispositivo é móvel
        this.isMobile = window.innerWidth <= 768;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    bindEvents() {
        // Funcionalidade de arrastar e soltar
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // Mudança no input de arquivo
        this.fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
        
        // Botão de análise
        this.analyzeBtn.addEventListener('click', this.analyzeEmail.bind(this));
        
        // Botão de copiar resposta
        this.copyResponseBtn.addEventListener('click', this.copyResponse.bind(this));
        
        // Botão de nova análise
        this.newAnalysisBtn.addEventListener('click', this.resetForm.bind(this));
        
        // Alternar modo escuro
        this.darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
        
        // Inicializa modo escuro do localStorage
        this.initializeDarkMode();
        
        // Tratamento de eventos específicos para móvel
        if (this.mobileActionBtn) {
            this.mobileActionBtn.addEventListener('click', this.handleMobileAction.bind(this));
        }
        
        // Manipula redimensionamento da janela para comportamento responsivo
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Adiciona suporte a gestos de toque para móvel
        if (this.isTouchDevice) {
            this.addTouchGestures();
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dropZone.style.backgroundColor = '';
    }

    handleDrop(e) {
        e.preventDefault();
        this.dropZone.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length) {
            this.handleFile(e.dataTransfer.files[0]);
        }
    }

    handleFileInputChange(e) {
        if (e.target.files.length) {
            this.handleFile(e.target.files[0]);
        }
    }

    handleFile(file) {
        const validTypes = ['text/plain', 'application/pdf'];
        
        if (!validTypes.includes(file.type)) {
            this.showAlert('Por favor, selecione um arquivo TXT ou PDF.', 'warning');
            return;
        }
        
        this.currentFile = file;
        this.selectedFile.innerHTML = `
            <div class="alert alert-info d-flex align-items-center fade-in">
                <i class="fas fa-file me-2"></i>
                <div>Arquivo selecionado: <strong>${file.name}</strong></div>
            </div>
        `;
    }

    async analyzeEmail() {
        const activeTab = document.querySelector('.nav-link.active').id;
        let content = '';
        let formData = new FormData();
        
        if (activeTab === 'upload-tab') {
            if (!this.currentFile) {
                this.showAlert('Por favor, selecione um arquivo primeiro.', 'warning');
                return;
            }
            
            formData.append('file', this.currentFile);
        } else {
            content = this.emailText.value.trim();
            
            if (!content) {
                this.showAlert('Por favor, insira o texto do email.', 'warning');
                return;
            }
            
            if (content.length < 10) {
                this.showAlert('O texto deve ter pelo menos 10 caracteres para uma análise precisa.', 'warning');
                return;
            }
            
            formData.append('text', content);
        }
        
        // Mostra estado de carregamento
        this.showLoading(true);
        
        try {
            let response;
            
            if (activeTab === 'upload-tab') {
                // Envia arquivo para o backend
                response = await fetch('/analyze', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Envia texto para o backend
                response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: content })
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Valida resposta
            if (!result.classification || !result.confidence || !result.response) {
                throw new Error('Resposta inválida do servidor');
            }
            
            this.displayResults(result);
            this.showAlert('Email analisado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro:', error);
            const errorMessage = error.message.includes('Resposta inválida') 
                ? 'Erro interno do servidor. Tente novamente.' 
                : error.message;
            this.showAlert(errorMessage, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(result) {
        // Atualiza resultado da classificação com animação
        const classificationElement = document.getElementById('classificationResult');
        const confidenceElement = document.getElementById('confidenceResult');
        
        // Anima a mudança da classificação
        classificationElement.style.opacity = '0';
        setTimeout(() => {
            classificationElement.textContent = result.classification;
            classificationElement.style.opacity = '1';
        }, 200);
        
        // Anima a mudança da confiança
        confidenceElement.style.opacity = '0';
        setTimeout(() => {
            confidenceElement.textContent = result.confidence + '%';
            confidenceElement.style.opacity = '1';
        }, 400);
        
        // Adiciona classe apropriada para estilização
        const classificationCard = document.querySelector('#classificationResult').closest('.card');
        classificationCard.classList.remove('productive', 'unproductive');
        classificationCard.classList.add(result.classification === 'Produtivo' ? 'productive' : 'unproductive');
        
        // Atualiza resposta sugerida com efeito de digitação
        this.typeResponse(result.response);
        
        // Mostra resultados com animação aprimorada
        this.resultCard.style.display = 'block';
        this.resultCard.classList.add('slide-up');
        
        // Adiciona visualização do medidor de confiança
        this.addConfidenceMeter(result.confidence);
        
        // Atualiza metadados adicionais
        if (result.text_length) {
            document.getElementById('textLength').textContent = `${result.text_length} caracteres`;
        }
        if (result.analysis_timestamp) {
            const timestamp = new Date(result.analysis_timestamp);
            document.getElementById('analysisTime').textContent = timestamp.toLocaleString('pt-BR');
        }
        
        // Adiciona animação de sucesso
        this.resultCard.classList.add('fade-in');
        
        // Rola para os resultados
        this.resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    typeResponse(text) {
        const responseElement = document.getElementById('suggestedResponse');
        responseElement.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                responseElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                // Adiciona um efeito sutil de destaque
                responseElement.style.background = 'rgba(52, 152, 219, 0.1)';
                setTimeout(() => {
                    responseElement.style.background = '';
                }, 1000);
            }
        }, 30);
    }

    addConfidenceMeter(confidence) {
        const confidenceCard = document.querySelector('#confidenceResult').closest('.card');
        
        // Remove medidor existente se houver
        const existingMeter = confidenceCard.querySelector('.confidence-meter');
        if (existingMeter) {
            existingMeter.remove();
        }
        
        // Cria medidor de confiança
        const meterHTML = `
            <div class="confidence-meter mt-2">
                <div class="confidence-fill" style="width: ${confidence}%"></div>
            </div>
        `;
        
        confidenceCard.querySelector('p').insertAdjacentHTML('afterend', meterHTML);
    }

    copyResponse() {
        const responseText = document.getElementById('suggestedResponse').textContent;
        
        navigator.clipboard.writeText(responseText).then(() => {
            // Mostra feedback de que o texto foi copiado
            const originalText = this.copyResponseBtn.innerHTML;
            this.copyResponseBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';
            this.copyResponseBtn.classList.add('success-feedback');
            
            setTimeout(() => {
                this.copyResponseBtn.innerHTML = originalText;
                this.copyResponseBtn.classList.remove('success-feedback');
            }, 2000);
        }).catch(err => {
            console.error('Falha ao copiar texto: ', err);
            this.showAlert('Erro ao copiar texto. Tente selecionar e copiar manualmente.', 'warning');
        });
    }

    resetForm() {
        // Reseta o formulário
        this.currentFile = null;
        this.fileInput.value = '';
        this.selectedFile.innerHTML = '';
        this.emailText.value = '';
        
        // Esconde resultados
        this.resultCard.style.display = 'none';
        this.resultCard.classList.remove('slide-up');
        
        // Muda para a primeira aba
        document.getElementById('upload-tab').click();
        
        // Reseta estados dos botões
        this.analyzeBtn.disabled = false;
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.style.display = 'block';
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.classList.add('loading');
        } else {
            this.loadingSpinner.style.display = 'none';
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.classList.remove('loading');
        }
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        // Atualiza ícone
        if (isDark) {
            this.darkModeIcon.className = 'fas fa-sun';
            this.darkModeToggle.title = 'Alternar modo claro';
        } else {
            this.darkModeIcon.className = 'fas fa-moon';
            this.darkModeToggle.title = 'Alternar modo escuro';
        }
    }
    
    initializeDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            this.darkModeIcon.className = 'fas fa-sun';
            this.darkModeToggle.title = 'Alternar modo claro';
        }
    }
    
    handleMobileAction() {
        // Rola para o botão de análise no móvel
        this.analyzeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Adiciona feedback visual
        this.mobileActionBtn.classList.add('btn-success');
        setTimeout(() => {
            this.mobileActionBtn.classList.remove('btn-success');
        }, 1000);
    }
    
    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        // Ajusta visibilidade do botão de ação móvel
        if (this.mobileActionBtn) {
            this.mobileActionBtn.style.display = this.isMobile ? 'block' : 'none';
        }
    }
    
    addTouchGestures() {
        // Adiciona suporte a deslizar para abas no móvel
        let startX = 0;
        let startY = 0;
        
        this.dropZone.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.dropZone.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Deslizar horizontal para trocar abas
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Deslizar para esquerda - vai para aba de texto
                    document.getElementById('text-tab').click();
                } else {
                    // Deslizar para direita - vai para aba de upload
                    document.getElementById('upload-tab').click();
                }
            }
        });
    }
}

// Inicializa a aplicação quando o DOM é carregado
document.addEventListener('DOMContentLoaded', function() {
    new EmailClassifier();
});
