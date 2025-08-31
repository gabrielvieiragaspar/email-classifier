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
        
        // Check if device is mobile
        this.isMobile = window.innerWidth <= 768;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    bindEvents() {
        // Drag and drop functionality
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // File input change
        this.fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
        
        // Analyze button
        this.analyzeBtn.addEventListener('click', this.analyzeEmail.bind(this));
        
        // Copy response button
        this.copyResponseBtn.addEventListener('click', this.copyResponse.bind(this));
        
        // New analysis button
        this.newAnalysisBtn.addEventListener('click', this.resetForm.bind(this));
        
        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
        
        // Initialize dark mode from localStorage
        this.initializeDarkMode();
        
        // Mobile-specific event handling
        if (this.mobileActionBtn) {
            this.mobileActionBtn.addEventListener('click', this.handleMobileAction.bind(this));
        }
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Add touch gesture support for mobile
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
        
        // Show loading state
        this.showLoading(true);
        
        try {
            let response;
            
            if (activeTab === 'upload-tab') {
                // Send file to backend
                response = await fetch('/analyze', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Send text to backend
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
            
            // Validate response
            if (!result.classification || !result.confidence || !result.response) {
                throw new Error('Resposta inválida do servidor');
            }
            
            this.displayResults(result);
            this.showAlert('Email analisado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.message.includes('Resposta inválida') 
                ? 'Erro interno do servidor. Tente novamente.' 
                : error.message;
            this.showAlert(errorMessage, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(result) {
        // Update classification result with animation
        const classificationElement = document.getElementById('classificationResult');
        const confidenceElement = document.getElementById('confidenceResult');
        
        // Animate the classification change
        classificationElement.style.opacity = '0';
        setTimeout(() => {
            classificationElement.textContent = result.classification;
            classificationElement.style.opacity = '1';
        }, 200);
        
        // Animate the confidence change
        confidenceElement.style.opacity = '0';
        setTimeout(() => {
            confidenceElement.textContent = result.confidence + '%';
            confidenceElement.style.opacity = '1';
        }, 400);
        
        // Add appropriate class for styling
        const classificationCard = document.querySelector('#classificationResult').closest('.card');
        classificationCard.classList.remove('productive', 'unproductive');
        classificationCard.classList.add(result.classification === 'Produtivo' ? 'productive' : 'unproductive');
        
        // Update suggested response with typing effect
        this.typeResponse(result.response);
        
        // Show results with enhanced animation
        this.resultCard.style.display = 'block';
        this.resultCard.classList.add('slide-up');
        
        // Add confidence meter visualization
        this.addConfidenceMeter(result.confidence);
        
        // Update additional metadata
        if (result.text_length) {
            document.getElementById('textLength').textContent = `${result.text_length} caracteres`;
        }
        if (result.analysis_timestamp) {
            const timestamp = new Date(result.analysis_timestamp);
            document.getElementById('analysisTime').textContent = timestamp.toLocaleString('pt-BR');
        }
        
        // Add success animation
        this.resultCard.classList.add('fade-in');
        
        // Scroll to results
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
                // Add a subtle highlight effect
                responseElement.style.background = 'rgba(52, 152, 219, 0.1)';
                setTimeout(() => {
                    responseElement.style.background = '';
                }, 1000);
            }
        }, 30);
    }

    addConfidenceMeter(confidence) {
        const confidenceCard = document.querySelector('#confidenceResult').closest('.card');
        
        // Remove existing meter if any
        const existingMeter = confidenceCard.querySelector('.confidence-meter');
        if (existingMeter) {
            existingMeter.remove();
        }
        
        // Create confidence meter
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
            // Show feedback that text was copied
            const originalText = this.copyResponseBtn.innerHTML;
            this.copyResponseBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';
            this.copyResponseBtn.classList.add('success-feedback');
            
            setTimeout(() => {
                this.copyResponseBtn.innerHTML = originalText;
                this.copyResponseBtn.classList.remove('success-feedback');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showAlert('Erro ao copiar texto. Tente selecionar e copiar manualmente.', 'warning');
        });
    }

    resetForm() {
        // Reset the form
        this.currentFile = null;
        this.fileInput.value = '';
        this.selectedFile.innerHTML = '';
        this.emailText.value = '';
        
        // Hide results
        this.resultCard.style.display = 'none';
        this.resultCard.classList.remove('slide-up');
        
        // Switch to the first tab
        document.getElementById('upload-tab').click();
        
        // Reset button states
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
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        // Update icon
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
        // Scroll to analyze button on mobile
        this.analyzeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add visual feedback
        this.mobileActionBtn.classList.add('btn-success');
        setTimeout(() => {
            this.mobileActionBtn.classList.remove('btn-success');
        }, 1000);
    }
    
    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        // Adjust mobile action button visibility
        if (this.mobileActionBtn) {
            this.mobileActionBtn.style.display = this.isMobile ? 'block' : 'none';
        }
    }
    
    addTouchGestures() {
        // Add swipe support for tabs on mobile
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
            
            // Horizontal swipe to switch tabs
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - go to text tab
                    document.getElementById('text-tab').click();
                } else {
                    // Swipe right - go to upload tab
                    document.getElementById('upload-tab').click();
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new EmailClassifier();
});
