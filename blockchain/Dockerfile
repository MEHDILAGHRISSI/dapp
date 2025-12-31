# ---------------------------------------------------------
#  Stage 1 — Build and compile smart contracts
# ---------------------------------------------------------
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project files
COPY . .

# Set dummy environment variables for build (avoid validation errors)
ENV RPC_URL=https://sepolia.infura.io/v3/dummy
ENV PRIVATE_KEY=1111111111111111111111111111111111111111111111111111111111111111
ENV PRIVATE_KEY_TENANT=2222222222222222222222222222222222222222222222222222222222222222

# Compile smart contracts with Hardhat
RUN npx hardhat compile


# ---------------------------------------------------------
# Stage 2 — Run Hardhat local blockchain node
# ---------------------------------------------------------
FROM node:22.20.0-alpine

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app .

# Expose Hardhat network port (default)
EXPOSE 8545

# Default command — run local Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]