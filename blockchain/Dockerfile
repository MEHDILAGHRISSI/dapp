FROM node:18-alpine

WORKDIR /app

# Copier seulement package.json et package-lock.json pour installer deps
COPY package*.json ./

# Config npm pour fetch plus tolérant
RUN npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 5 \
    && npm install

# Copier le reste du code seulement après
COPY . .

EXPOSE 8545

# Démarrer le nœud Hardhat
CMD ["npx", "hardhat", "node"]