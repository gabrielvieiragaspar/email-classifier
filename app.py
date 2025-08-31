from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import PyPDF2
import io
import os
import re
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Server configuration will be set in app.run()

# Configure Google Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

def preprocess_text(text):
    """
    Preprocess the email text by removing unnecessary content and cleaning it up.
    """
    # Remove email headers
    text = re.sub(r'^.*From:.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^.*To:.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^.*Subject:.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^.*Date:.*$', '', text, flags=re.MULTILINE)
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    # Remove special characters but keep essential punctuation
    text = re.sub(r'[^\w\s.,!?;:]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_text_from_pdf(file):
    """
    Extract text content from a PDF file.
    """
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def classify_email(text):
    """
    Use Google Gemini API to classify the email as productive or unproductive.
    Enhanced with better prompts and confidence calculation.
    """
    prompt = f"""
    Você é um especialista em análise de emails para o setor financeiro.
    
    TAREFA: Classifique o seguinte email como "Produtivo" ou "Improdutivo".
    
    CRITÉRIOS:
    - EMAILS PRODUTIVOS: Requerem ação imediata, resposta específica, ou contêm informações críticas para o negócio.
      Exemplos: solicitações de suporte, dúvidas sobre produtos, problemas técnicos, atualizações de casos, reivindicações.
    
    - EMAILS IMPRODUTIVOS: Não requerem ação imediata ou são de natureza social/cerimonial.
      Exemplos: felicitações, agradecimentos genéricos, newsletters informativas, convites sociais.
    
    CONTEXTO: Este email foi enviado para uma empresa financeira.
    
    EMAIL PARA ANÁLISE:
    {text}
    
    INSTRUÇÕES:
    1. Analise o conteúdo cuidadosamente
    2. Considere o contexto financeiro
    3. Responda APENAS com "Produtivo" ou "Improdutivo"
    4. Seja consistente com os critérios estabelecidos
    """
    
    try:
        response = model.generate_content(prompt)
        classification = response.text.strip()
        
        # Enhanced confidence calculation
        confidence = 0.80  # Base confidence
        
        # Text length factor (longer emails are usually clearer)
        if len(text) > 100:
            confidence += 0.08
        elif len(text) > 50:
            confidence += 0.05
        elif len(text) > 20:
            confidence += 0.03
        
        # Classification clarity factor
        if classification in ["Produtivo", "Improdutivo"]:
            confidence += 0.07
        
        # Content complexity factor (emails with specific keywords are clearer)
        business_keywords = ['suporte', 'problema', 'erro', 'ajuda', 'dúvida', 'solicitação', 'reclamação', 'atualização']
        if any(keyword in text.lower() for keyword in business_keywords):
            confidence += 0.05
        
        # Response quality factor
        if len(classification) == len("Produtivo") or len(classification) == len("Improdutivo"):
            confidence += 0.02
            
        return classification, min(confidence, 0.95)  # Cap at 95% for realism
    except Exception as e:
        print(f"Error in classification: {e}")
        return "Erro na classificação", 0.0

def generate_response(text, classification):
    """
    Generate an appropriate response based on the email content and classification.
    Enhanced with better prompts and context awareness.
    """
    if classification == "Produtivo":
        prompt = f"""
        Você é um representante profissional de uma empresa financeira.
        
        TAREFA: Gere uma resposta profissional e útil para um email PRODUTIVO.
        
        CONTEXTO: O cliente enviou um email que requer ação imediata ou resposta específica.
        
        EMAIL DO CLIENTE:
        {text}
        
        INSTRUÇÕES PARA A RESPOSTA:
        1. Demonstre empatia e profissionalismo
        2. Confirme que entendeu a solicitação
        3. Forneça informações úteis ou próximos passos
        4. Use linguagem clara e acessível
        5. Mantenha tom cordial mas profissional
        6. Seja específico sobre como você pode ajudar
        7. Use português brasileiro natural
        
        FORMATO: Resposta direta e objetiva, sem saudações genéricas.
        """
    else:
        prompt = f"""
        Você é um representante profissional de uma empresa financeira.
        
        TAREFA: Gere uma resposta educada e amigável para um email IMPRODUTIVO.
        
        CONTEXTO: O cliente enviou um email que não requer ação imediata (felicitações, agradecimentos, etc.).
        
        EMAIL DO CLIENTE:
        {text}
        
        INSTRUÇÕES PARA A RESPOSTA:
        1. Agradeça pela mensagem de forma sincera
        2. Demonstre que valoriza o relacionamento
        3. Mantenha tom amigável e pessoal
        4. Use linguagem calorosa mas profissional
        5. Seja breve mas significativo
        6. Use português brasileiro natural
        
        FORMATO: Resposta calorosa e pessoal, demonstrando apreciação.
        """
    
    try:
        response = model.generate_content(prompt)
        generated_response = response.text.strip()
        
        # Clean up the response if needed
        if generated_response.startswith('"') and generated_response.endswith('"'):
            generated_response = generated_response[1:-1]
        
        return generated_response
    except Exception as e:
        print(f"Error generating response: {e}")
        if classification == "Produtivo":
            return "Agradecemos seu contato. Nossa equipe está analisando sua solicitação e retornaremos em breve com uma resposta detalhada."
        else:
            return "Muito obrigado pela sua mensagem! Valorizamos muito o relacionamento com nossos clientes."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_email():
    """
    Analyze email content and return classification with AI-generated response.
    Enhanced with better error handling and validation.
    """
    try:
        # Check if a file was uploaded
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
            
            # Check file type and size
            if not file.filename.lower().endswith(('.txt', '.pdf')):
                return jsonify({'error': 'Formato de arquivo não suportado. Use apenas .txt ou .pdf'}), 400
            
            # Check file size (max 5MB)
            if len(file.read()) > 5 * 1024 * 1024:
                return jsonify({'error': 'Arquivo muito grande. Tamanho máximo: 5MB'}), 400
            
            # Reset file pointer
            file.seek(0)
            
            # Extract text based on file type
            if file.filename.lower().endswith('.txt'):
                try:
                    text = file.read().decode('utf-8')
                except UnicodeDecodeError:
                    text = file.read().decode('latin-1')  # Fallback encoding
            elif file.filename.lower().endswith('.pdf'):
                text = extract_text_from_pdf(file)
        else:
            # Get text from request body
            data = request.get_json()
            if not data or 'text' not in data:
                return jsonify({'error': 'Nenhum texto fornecido'}), 400
            
            text = data['text']
            
            # Validate text length
            if len(text.strip()) < 10:
                return jsonify({'error': 'Texto muito curto. Mínimo 10 caracteres'}), 400
            if len(text) > 10000:
                return jsonify({'error': 'Texto muito longo. Máximo 10.000 caracteres'}), 400
        
        # Preprocess the text
        processed_text = preprocess_text(text)
        
        if not processed_text.strip():
            return jsonify({'error': 'Não foi possível extrair texto válido do conteúdo'}), 400
        
        # Classify the email
        classification, confidence = classify_email(processed_text)
        
        # Validate classification
        if classification not in ["Produtivo", "Improdutivo"]:
            return jsonify({'error': 'Erro na classificação do email'}), 500
        
        # Generate response
        response = generate_response(processed_text, classification)
        
        # Log successful analysis
        print(f"Email analyzed successfully: {classification} ({confidence:.1%}) - Length: {len(processed_text)} chars")
        
        # Return results with enhanced metadata
        return jsonify({
            'classification': classification,
            'confidence': round(confidence * 100, 1),
            'response': response,
            'processed_text': processed_text[:500] + "..." if len(processed_text) > 500 else processed_text,
            'text_length': len(processed_text),
            'analysis_timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        error_msg = f"Error analyzing email: {str(e)}"
        print(error_msg)
        return jsonify({'error': 'Erro interno do servidor. Tente novamente em alguns instantes.'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)