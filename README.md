# Email Classifier - AutoU

## 🚀 Sobre o Projeto

Solução de classificação inteligente de emails desenvolvida para o processo seletivo da AutoU. Esta aplicação utiliza inteligência artificial para classificar emails automaticamente em duas categorias: **Produtivo** e **Improdutivo**, além de sugerir respostas automáticas contextualizadas.

## ✨ Funcionalidades

- **Upload de arquivos**: Suporte para arquivos TXT e PDF
- **Entrada de texto direto**: Cole o conteúdo do email diretamente na interface
- **Classificação automática**: IA classifica emails como produtivo ou improdutivo
- **Geração de respostas**: Sugestões de respostas automáticas baseadas na classificação
- **Interface responsiva**: Design moderno e intuitivo para todos os dispositivos
- **Processamento em tempo real**: Análise rápida com feedback visual

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **IA**: Google Gemini 1.5 Flash
- **Processamento de PDF**: PyPDF2
- **Deploy**: Preparado para Render, Heroku, Vercel e outras plataformas

## 📋 Pré-requisitos

- Python 3.8 ou superior
- Chave de API do Google Gemini
- pip (gerenciador de pacotes Python)

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/email-classifier-autou.git
cd email-classifier-autou
```

### 2. Crie um ambiente virtual
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Instale as dependências
```bash
pip install -r requirements.txt
```

### 4. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com sua chave do Google Gemini
GOOGLE_API_KEY=sua_chave_api_aqui
```

### 5. Execute a aplicação
```bash
python app.py
```

A aplicação estará disponível em: http://localhost:5000

## 🌐 Deploy na Nuvem

### Render (Recomendado - Gratuito)

1. Faça fork deste repositório
2. Acesse [render.com](https://render.com) e crie uma conta
3. Clique em "New +" e selecione "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: email-classifier-autou
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Adicione as variáveis de ambiente:
   - `GOOGLE_API_KEY`: sua chave do Google Gemini
7. Clique em "Create Web Service"

### Heroku

1. Instale o Heroku CLI
2. Execute os comandos:
```bash
heroku create seu-app-name
heroku config:set GOOGLE_API_KEY=sua_chave_api
git push heroku main
```

### Vercel

1. Instale o Vercel CLI
2. Execute:
```bash
vercel --prod
```

## 📱 Como Usar

1. **Acesse a aplicação** no navegador
2. **Escolha o método de entrada**:
   - **Upload de arquivo**: Arraste e solte ou clique para selecionar arquivo TXT/PDF
   - **Texto direto**: Cole o conteúdo do email na caixa de texto
3. **Clique em "Analisar Email"**
4. **Visualize os resultados**:
   - Classificação (Produtivo/Improdutivo)
   - Nível de confiança
   - Resposta sugerida
5. **Copie a resposta** ou faça uma nova análise

## 🔧 Estrutura do Projeto

```
email-classifier-autou/
├── app.py                 # Aplicação principal Flask
├── requirements.txt       # Dependências Python
├── env.example           # Exemplo de variáveis de ambiente
├── README.md             # Este arquivo
├── static/               # Arquivos estáticos (CSS, JS)
├── templates/            # Templates HTML
│   └── index.html       # Interface principal
└── .gitignore           # Arquivos ignorados pelo Git
```

## 🤖 Como Funciona a IA

### Classificação
- Utiliza Google Gemini 1.5 Flash para análise semântica
- Processa o texto removendo headers de email e URLs
- Classifica baseado no contexto e intenção da mensagem

### Geração de Respostas
- Respostas personalizadas para cada categoria
- Tom profissional adequado ao setor financeiro
- Contextualização baseada no conteúdo do email

## 📊 Exemplos de Classificação

### Emails Produtivos
- Solicitações de suporte técnico
- Dúvidas sobre produtos/serviços
- Atualizações sobre casos em aberto
- Reclamações ou sugestões

### Emails Improdutivos
- Mensagens de felicitações
- Agradecimentos genéricos
- Spam ou marketing não solicitado
- Mensagens pessoais não relacionadas ao negócio

## 🚨 Solução de Problemas

### Erro de API Key
- Verifique se a variável `GOOGLE_API_KEY` está configurada
- Confirme se a chave é válida e tem créditos disponíveis

### Erro de Upload
- Verifique se o arquivo é TXT ou PDF
- Confirme se o arquivo não está corrompido

### Erro de Classificação
- Verifique a conexão com a internet
- Confirme se o texto não está vazio

## 🤝 Contribuição

Este projeto foi desenvolvido para o processo seletivo da AutoU. Para contribuições ou dúvidas, entre em contato através do repositório.

## 📄 Licença

Este projeto é de uso educacional e para processo seletivo.

## 👨‍💻 Desenvolvedor

Desenvolvido para o processo seletivo da AutoU, demonstrando habilidades em:
- Desenvolvimento Full-Stack
- Integração com APIs de IA
- Deploy em nuvem
- Experiência do usuário

---

**AutoU** - Transformando a experiência do usuário através da tecnologia 🚀
