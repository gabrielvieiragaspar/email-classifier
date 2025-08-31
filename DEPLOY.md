# 🚀 Guia Rápido de Deploy

## Render (Recomendado - Gratuito)

### 🎯 Deploy Automático via GitHub

#### Pré-requisitos:
- ✅ Repositório no GitHub: [gabrielvieiragaspar/email-classifier](https://github.com/gabrielvieiragaspar/email-classifier)
- ✅ Chave de API do Google Gemini

#### Passo a Passo:
1. **Acesse** [render.com](https://render.com) e crie conta gratuita
2. **Clique em "New +"** → "Web Service"
3. **Conecte seu repositório GitHub**:
   - Selecione "Connect a repository"
   - Escolha `gabrielvieiragaspar/email-classifier`
4. **Configure o serviço**:
   - **Name**: `email-classifier-autou`
   - **Environment**: `Python 3`
   - **Region**: Escolha a mais próxima (ex: US East)
   - **Branch**: `master`
   - **Root Directory**: Deixe em branco (raiz do projeto)
5. **Configure os comandos**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
6. **Adicione variáveis de ambiente**:
   - `GOOGLE_API_KEY`: sua chave do Google Gemini
   - `PORT`: Deixe Render definir automaticamente
7. **Configurações avançadas**:
   - **Auto-Deploy**: ✅ Habilitado (deploy automático a cada push)
   - **Health Check Path**: `/` (rota principal)
8. **Clique em "Create Web Service"**

⏱️ **Tempo estimado**: 5-10 minutos

### 🔧 Deploy via render.yaml (Automático)

Se preferir usar o arquivo `render.yaml` já configurado:

1. **Render detectará automaticamente** as configurações
2. **Clique em "Create Web Service"** e Render usará as configurações do arquivo

**Conteúdo do `render.yaml`:**
```yaml
services:
  - type: web
    name: email-classifier-autou
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT
    envVars:
      - key: GOOGLE_API_KEY
        sync: false
```

### 📊 Após o Deploy

- ✅ **URL da aplicação**: `https://seu-app.onrender.com`
- ✅ **Deploy automático** a cada push para `master`
- ✅ **Logs em tempo real** disponíveis no dashboard
- ✅ **Health checks** automáticos
- ✅ **SSL gratuito** incluído

### 📈 Monitoramento e Manutenção

- **Logs**: Acesse via dashboard do Render
- **Métricas**: CPU, memória e tempo de resposta
- **Uptime**: Monitoramento automático de disponibilidade
- **Escalabilidade**: Upgrade para planos pagos quando necessário

## Vercel (Alternativa - Gratuito)

### Passo a Passo:
1. **Instale Vercel CLI:**
   ```bash
   npm i -g vercel
   ```
2. **Deploy:**
   ```bash
   vercel --prod
   ```
3. **Configure variáveis de ambiente** no dashboard

⏱️ **Tempo estimado**: 3-5 minutos

## Heroku (Alternativa - Pago)

### Passo a Passo:
1. **Instale Heroku CLI**
2. **Execute:**
   ```bash
   heroku create seu-app-name
   heroku config:set GOOGLE_API_KEY=sua_chave_api
   git push heroku main
   ```

⏱️ **Tempo estimado**: 5-8 minutos

## 🎯 Dicas Importantes

- ✅ **Render é gratuito** e muito confiável
- ✅ **Configure sempre** a variável `OPENAI_API_KEY`
- ✅ **Teste localmente** antes do deploy
- ✅ **Use HTTPS** para produção
- ✅ **Monitore logs** para debug

## 🔧 Troubleshooting

### Erro de Build no Render
- Verifique se `requirements.txt` está correto
- Confirme versão do Python (3.8+)
- Verifique se o `render.yaml` está configurado corretamente

### Erro de Runtime no Render
- Verifique se a variável `GOOGLE_API_KEY` está configurada
- Confirme se a API key do Google Gemini é válida
- Verifique logs no dashboard do Render

### Erro de CORS
- A aplicação já está configurada com CORS
- Se persistir, verifique configurações da plataforma

### Problemas Comuns no Render
- **Timeout de build**: Aumente o timeout nas configurações
- **Erro de memória**: Verifique se não há vazamentos de memória
- **Health check falhando**: Verifique se a rota `/` está funcionando

---

**🎉 Sua aplicação estará online em poucos minutos!**
