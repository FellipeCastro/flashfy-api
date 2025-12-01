FROM node:latest

WORKDIR /api

# Copia apenas os arquivos necessários primeiro (melhor cache)
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Remove arquivos desnecessários para produção
RUN rm -rf tests .git

EXPOSE 5000

CMD ["npm", "start"]