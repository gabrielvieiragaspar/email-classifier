# 🚀 Guia Rápido de Deploy

## Render (Recomendado - Gratuito)

### Passo a Passo:
1. **Fork do repositório** no GitHub
2. **Acesse** [render.com](https://render.com) e crie conta
3. **Clique em "New +"** → "Web Service"
4. **Conecte** seu repositório GitHub
5. **Configure:**
   - **Name**: `email-classifier-autou`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. **Adicione variáveis de ambiente:**
   - `GOOGLE_API_KEY`: sua chave do Google Gemini
7. **Clique em "Create Web Service"**

⏱️ **Tempo estimado**: 5-10 minutos

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

### Erro de Build
- Verifique se `requirements.txt` está correto
- Confirme versão do Python (3.8+)

### Erro de Runtime
- Verifique variáveis de ambiente
- Confirme se a API key do Google Gemini é válida

### Erro de CORS
- A aplicação já está configurada com CORS
- Se persistir, verifique configurações da plataforma

---

**🎉 Sua aplicação estará online em poucos minutos!**
