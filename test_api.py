#!/usr/bin/env python3
"""
Script de teste para verificar se a API da OpenAI está funcionando
"""

import os
import openai
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

def test_openai_api():
    """Testa a conexão com a API da OpenAI"""
    
    # Verifica se a API key está configurada
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ ERRO: OPENAI_API_KEY não encontrada!")
        print("Configure sua chave da OpenAI no arquivo .env")
        return False
    
    if api_key == "sua_chave_api_aqui":
        print("❌ ERRO: Você ainda não configurou sua chave real da OpenAI!")
        print("Edite o arquivo .env e substitua 'sua_chave_api_aqui' pela sua chave real")
        return False
    
    try:
        # Inicializa o cliente OpenAI
        client = openai.OpenAI(api_key=api_key)
        
        # Testa com uma pergunta simples
        print("🧪 Testando conexão com OpenAI...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um assistente útil."},
                {"role": "user", "content": "Responda apenas com 'OK' se estiver funcionando."}
            ],
            max_tokens=10,
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip()
        
        if result == "OK":
            print("✅ API da OpenAI funcionando perfeitamente!")
            print(f"Resposta: {result}")
            return True
        else:
            print(f"⚠️ API respondeu, mas com resposta inesperada: {result}")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao conectar com OpenAI: {e}")
        return False

def test_email_classification():
    """Testa a classificação de um email simples"""
    
    try:
        from app import classify_email, generate_response
        
        print("\n🧪 Testando classificação de email...")
        
        # Email de teste
        test_email = "Preciso de suporte técnico urgente para acessar minha conta."
        
        # Testa classificação
        classification, confidence = classify_email(test_email)
        print(f"✅ Classificação: {classification}")
        print(f"✅ Confiança: {confidence:.1%}")
        
        # Testa geração de resposta
        response = generate_response(test_email, classification)
        print(f"✅ Resposta gerada: {response[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar classificação: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testando Email Classifier - AutoU")
    print("=" * 50)
    
    # Testa API da OpenAI
    api_ok = test_openai_api()
    
    if api_ok:
        # Testa classificação de email
        test_email_classification()
        
        print("\n🎉 Todos os testes passaram! Sua aplicação está pronta.")
        print("\nPara executar a aplicação:")
        print("python app.py")
        print("\nDepois acesse: http://localhost:5000")
    else:
        print("\n❌ Configure sua API Key da OpenAI primeiro!")
        print("1. Crie um arquivo .env na raiz do projeto")
        print("2. Adicione: OPENAI_API_KEY=sua_chave_real_aqui")
        print("3. Execute este teste novamente")
