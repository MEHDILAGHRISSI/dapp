# 💳 PAYMENT SERVICE - Documentation Frontend (CORRIGÉE v2.0)

**Base URL** : `http://localhost:8082/api/payments`

> ⚠️ **Version corrigée** - Cette documentation reflète le code source réel et corrige les erreurs critiques détectées.

---

## 🔴 CORRECTIONS CRITIQUES APPLIQUÉES

### 1. Type userId Corrigé
```diff
- @RequestHeader("X-User-Id") Long userId  ❌
+ @RequestHeader("X-User-Id") String userId  ✅
```

### 2. Architecture Contrat Clarifiée
Documentation complète du workflow de déploiement du contrat RentalEscrow.

### 3. Web3.js Patterns Corrigés
Remplacement de tous les patterns Ethers.js par Web3.js corrects.

### 4. Error Handling Complet
Gestion exhaustive des erreurs MetaMask et blockchain.

---

## 📊 Schéma Base de Données

### Table: `payments`

| Champ | Type | Description | Obligatoire | Unique |
|-------|------|-------------|-------------|--------|
| `id` | Long | ID auto-incrémenté | ✅ | ✅ |
| `bookingId` | Long | ID de la réservation | ✅ | ❌ |
| `transactionHash` | String(66) | Hash transaction (0x + 64 hex) | ✅ | ✅ |
| `contractAddress` | String(42) | Adresse contrat Escrow | ✅ | ❌ |
| `amount` | Decimal(19,8) | Montant en Ether/MATIC | ✅ | ❌ |
| `currency` | String(10) | MATIC, ETH, USDC, etc. | ✅ | ❌ |
| `fromAddress` | String(42) | Wallet payeur (snapshot) | ✅ | ❌ |
| `status` | Enum | Statut validation | ✅ | ❌ |
| `blockNumber` | Long | Numéro du bloc | ❌ | ❌ |
| `validatedAt` | DateTime | Date validation | ❌ | ❌ |
| `errorMessage` | Text | Message d'erreur si échec | ❌ | ❌ |
| `createdAt` | DateTime | Date création | ✅ | ❌ |
| `updatedAt` | DateTime | Dernière modification | ✅ | ❌ |

---

## 📋 Enum PaymentStatus

```
PENDING      → Paiement créé, en attente validation
VALIDATING   → Validation blockchain en cours
CONFIRMED    → Transaction validée et booking confirmé
FAILED       → Validation échouée
```

### Machine à États

```
           POST /validate
                 │
                 ▼
         ┌──────────────┐
         │   PENDING    │
         └──────┬───────┘
                │ (Vérification blockchain)
                ▼
         ┌──────────────┐
         │  VALIDATING  │
         └──┬────────┬──┘
            │        │
   (Success)│        │(Échec)
            ▼        ▼
      ┌────────┐  ┌────────┐
      │CONFIRMED│  │ FAILED │
      └────────┘  └────────┘
```

---

## 🏗️ Architecture Smart Contract RentalEscrow

### Vue d'Ensemble

Chaque réservation a son **propre contrat** RentalEscrow déployé.

### Déploiement du Contrat

> ⚠️ **IMPORTANT** : Cette section clarifie QUI déploie le contrat et QUAND.

#### **Approche Recommandée : Backend Déploie Automatiquement**

**Avantages** :
- ✅ Utilisateur ne paie pas le gas de déploiement
- ✅ Backend contrôle les paramètres du contrat
- ✅ `contractAddress` automatiquement dans la réservation
- ✅ Expérience utilisateur simplifiée

**Workflow** :
```
1. User → POST /api/bookings
2. Backend → Valide et déploie RentalEscrow
3. Backend → Sauvegarde contractAddress dans Booking
4. Backend → Retourne booking avec contractAddress
5. User → Appelle fund() sur le contrat
6. User → POST /api/payments/validate
```

#### Modifications Backend Nécessaires

**1. Ajouter champ dans Booking.java** :
```java
@Entity
@Table(name = "bookings")
public class Booking {
    // ... champs existants
    
    @Column(length = 42)
    private String contractAddress;
    
    // Getters/Setters
    public String getContractAddress() {
        return contractAddress;
    }
    
    public void setContractAddress(String contractAddress) {
        this.contractAddress = contractAddress;
    }
}
```

**2. BookingService déploie le contrat** :
```java
@Service
public class BookingServiceImpl {
    
    @Autowired
    private ContractDeploymentService contractDeployer;
    
    public BookingResponseDTO createBooking(String tenantId, BookingRequestDTO request) {
        // ... validations existantes
        
        // Récupérer walletAddress du propriétaire
        PropertyDTO property = listingServiceClient.getProperty(request.getPropertyId());
        String ownerWallet = property.getOwnerWalletAddress();
        
        // Déployer le contrat RentalEscrow
        String contractAddress = contractDeployer.deployRentalEscrow(
            ownerWallet,                    // owner
            tenantWalletAddress,           // tenant
            totalPrice,                    // rentAmount
            startDate.toEpochDay(),        // checkInDate (timestamp)
            endDate.toEpochDay()           // checkOutDate (timestamp)
        );
        
        booking.setContractAddress(contractAddress);
        booking = bookingRepository.save(booking);
        
        // ... reste du code
    }
}
```

**3. BookingResponseDTO expose le champ** :
```java
@Data
public class BookingResponseDTO {
    // ... champs existants
    
    private String contractAddress;  // ✅ Ajouté
}
```

### Structure du Contrat

```solidity
contract RentalEscrow {
    address public owner;              // Propriétaire (reçoit le paiement)
    address public tenant;             // Locataire (paie)
    uint256 public rentAmount;         // Montant attendu (en Wei)
    uint256 public checkInDate;        // Date début (timestamp)
    uint256 public checkOutDate;       // Date fin (timestamp)
    
    enum State { Created, Funded, Active, Completed, Cancelled }
    State public currentState;
    
    event Funded(address indexed tenant, uint256 amount);
    event Released(address indexed owner, uint256 amount);
    event Cancelled(address indexed initiator);
    
    constructor(
        address _owner,
        address _tenant,
        uint256 _rentAmount,
        uint256 _checkInDate,
        uint256 _checkOutDate
    ) {
        require(_owner != address(0), "Invalid owner");
        require(_tenant != address(0), "Invalid tenant");
        require(_rentAmount > 0, "Invalid amount");
        
        owner = _owner;
        tenant = _tenant;
        rentAmount = _rentAmount;
        checkInDate = _checkInDate;
        checkOutDate = _checkOutDate;
        currentState = State.Created;
    }
    
    function fund() external payable {
        require(currentState == State.Created, "Already funded");
        require(msg.sender == tenant, "Only tenant can fund");
        require(msg.value == rentAmount, "Incorrect amount");
        
        currentState = State.Funded;
        emit Funded(msg.sender, msg.value);
    }
    
    function release() external {
        require(currentState == State.Funded, "Not funded yet");
        require(msg.sender == owner, "Only owner");
        require(block.timestamp >= checkInDate, "Too early");
        
        currentState = State.Released;
        payable(owner).transfer(rentAmount);
        emit Released(owner, rentAmount);
    }
    
    function cancel() external {
        require(currentState == State.Created, "Cannot cancel");
        require(msg.sender == owner || msg.sender == tenant);
        
        currentState = State.Cancelled;
        emit Cancelled(msg.sender);
    }
}
```

---

## 🔒 Endpoints

### 1. Valider un Paiement Blockchain

**Valider qu'une transaction blockchain a bien payé la réservation**

```http
POST /api/payments/validate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "bookingId": 1,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "expectedAmount": 1000.50
}
```

**Validation**
- `bookingId` : Long requis, doit exister avec status `AWAITING_PAYMENT`
- `transactionHash` : String 66 chars (0x + 64 hex), unique
- `contractAddress` : String 42 chars (0x + 40 hex)
- `expectedAmount` : Decimal, montant en MATIC/ETH

**Response 200 OK**
```json
{
  "id": 1,
  "bookingId": 1,
  "transactionHash": "0x1a2b3c4d...",
  "contractAddress": "0x742d35Cc...",
  "amount": 1000.50,
  "currency": "MATIC",
  "fromAddress": "0x8e7f4b2a...",
  "status": "CONFIRMED",
  "blockNumber": 12345678,
  "validatedAt": "2026-01-11T10:35:00",
  "createdAt": "2026-01-11T10:32:00",
  "updatedAt": "2026-01-11T10:35:00"
}
```

**Response 400 Bad Request**
```json
{
  "timestamp": "2026-01-11T10:35:00",
  "status": 400,
  "error": "Invalid Transaction",
  "message": "Transaction amount mismatch. Expected: 1000.50 MATIC, Got: 950.00 MATIC"
}
```

**Response 404 Not Found**
```json
{
  "timestamp": "2026-01-11T10:35:00",
  "status": 404,
  "error": "Transaction Not Found",
  "message": "Transaction hash not found on blockchain. Please wait and retry."
}
```

**Response 409 Conflict**
```json
{
  "timestamp": "2026-01-11T10:35:00",
  "status": 409,
  "error": "Payment Already Validated",
  "message": "This booking already has a confirmed payment"
}
```

**Logique Métier - Validation Complète**

**Étape 1 : Vérifications Préliminaires**
1. Récupération booking par `bookingId`
2. Vérification status = `AWAITING_PAYMENT`
3. Vérification pas de paiement existant avec status `CONFIRMED`
4. Extraction `userId` depuis header X-User-Id (⚠️ **String, pas Long !**)
5. Vérification `userId == booking.tenantId`

**Étape 2 : Création Enregistrement Payment**
```java
Payment payment = new Payment();
payment.setBookingId(bookingId);
payment.setTransactionHash(transactionHash);
payment.setContractAddress(contractAddress);
payment.setStatus(PaymentStatus.PENDING);
payment.setCreatedAt(LocalDateTime.now());
paymentRepository.save(payment);
```

**Étape 3 : Validation Blockchain** (Status → `VALIDATING`)
```java
payment.setStatus(PaymentStatus.VALIDATING);

// 1. Récupérer la transaction
Transaction tx = web3j.ethGetTransactionByHash(transactionHash).send();
if (tx == null || tx.getTransaction() == null) {
    throw new TransactionNotFoundException("Transaction not found");
}

// 2. Vérifier que transaction est minée
TransactionReceipt receipt = web3j.ethGetTransactionReceipt(transactionHash).send();
if (receipt == null || receipt.getTransactionReceipt() == null) {
    throw new TransactionNotMinedException("Transaction not mined yet");
}

// 3. Vérifier destination = contractAddress
if (!receipt.getTo().equalsIgnoreCase(contractAddress)) {
    throw new InvalidDestinationException(
        "Transaction not sent to contract. Expected: " + contractAddress
    );
}

// 4. Vérifier montant (Wei → Ether)
BigInteger valueWei = tx.getValue();
BigDecimal valueEther = Convert.fromWei(valueWei.toString(), Convert.Unit.ETHER);

if (valueEther.compareTo(expectedAmount) != 0) {
    throw new AmountMismatchException(
        "Amount mismatch. Expected: " + expectedAmount + ", Got: " + valueEther
    );
}

// 5. Vérifier événement Funded dans les logs
List<Log> logs = receipt.getLogs();
boolean fundedEventFound = logs.stream()
    .anyMatch(log -> 
        !log.getTopics().isEmpty() &&
        log.getTopics().get(0).equals(FUNDED_EVENT_TOPIC) &&
        log.getAddress().equalsIgnoreCase(contractAddress)
    );

if (!fundedEventFound) {
    throw new EventNotFoundException("Funded event not found in transaction logs");
}
```

**Étape 4 : Mise à Jour Statuts** (Status → `CONFIRMED`)
```java
// Mettre à jour Payment
payment.setStatus(PaymentStatus.CONFIRMED);
payment.setAmount(valueEther);
payment.setFromAddress(tx.getFrom());
payment.setBlockNumber(receipt.getBlockNumber().longValue());
payment.setValidatedAt(LocalDateTime.now());
paymentRepository.save(payment);

// Notifier Booking Service
bookingServiceClient.confirmBooking(bookingId);
// Booking status: AWAITING_PAYMENT → CONFIRMED
```

**Étape 5 : Gestion Erreurs**
```java
catch (TransactionNotFoundException e) {
    payment.setStatus(PaymentStatus.FAILED);
    payment.setErrorMessage(e.getMessage());
    throw new PaymentValidationException(e.getMessage(), 404);
}
catch (AmountMismatchException e) {
    payment.setStatus(PaymentStatus.FAILED);
    payment.setErrorMessage(e.getMessage());
    throw new PaymentValidationException(e.getMessage(), 400);
}
catch (Exception e) {
    payment.setStatus(PaymentStatus.FAILED);
    payment.setErrorMessage(e.getMessage());
    throw new PaymentValidationException("Validation failed: " + e.getMessage(), 500);
}
finally {
    paymentRepository.save(payment);
}
```

---

### 2. Historique Paiements d'une Réservation

**Récupérer tous les paiements (tentatives) d'une réservation**

```http
GET /api/payments/booking/{bookingId}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "bookingId": 1,
    "transactionHash": "0x1a2b3c...",
    "status": "FAILED",
    "errorMessage": "Amount mismatch. Expected: 1000.50, Got: 900.00",
    "createdAt": "2026-01-11T10:30:00"
  },
  {
    "id": 2,
    "bookingId": 1,
    "transactionHash": "0x9f8e7d...",
    "status": "CONFIRMED",
    "amount": 1000.50,
    "currency": "MATIC",
    "blockNumber": 12345678,
    "validatedAt": "2026-01-11T10:35:00",
    "createdAt": "2026-01-11T10:32:00"
  }
]
```

**Logique Métier**
- Retourne TOUTES les tentatives de paiement
- Tri par date de création décroissante
- Utilisé pour debugging et support client

---

### 3. Health Check

**Vérifier la santé du service**

```http
GET /api/payments/health
```

**Response 200 OK**
```json
{
  "status": "UP",
  "blockchain": {
    "connected": true,
    "network": "Polygon Mumbai",
    "chainId": 80001,
    "blockNumber": 12345678
  },
  "services": {
    "bookingService": "UP",
    "web3Provider": "UP"
  }
}
```

---

## 🎯 Workflow Frontend Complet (CORRIGÉ)

### Prérequis Installation

```bash
npm install web3
```

### Configuration Web3

```javascript
// web3Config.js
import Web3 from 'web3';

// ABI du contrat RentalEscrow
export const RENTAL_ESCROW_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_owner", "type": "address"},
      {"internalType": "address", "name": "_tenant", "type": "address"},
      {"internalType": "uint256", "name": "_rentAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_checkInDate", "type": "uint256"},
      {"internalType": "uint256", "name": "_checkOutDate", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "tenant", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "fund",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rentAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentState",
    "outputs": [{"internalType": "enum RentalEscrow.State", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Configuration réseau
export const NETWORKS = {
  POLYGON_MUMBAI: {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
  POLYGON_MAINNET: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  }
};

// Initialiser Web3
export const initWeb3 = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }
  
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  return web3;
};

// Vérifier/Changer réseau
export const ensureCorrectNetwork = async (targetNetwork = 'POLYGON_MUMBAI') => {
  const network = NETWORKS[targetNetwork];
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }]
    });
  } catch (error) {
    // Réseau pas ajouté, l'ajouter
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [network]
      });
    } else {
      throw error;
    }
  }
};
```

### Processus Paiement Complet

```javascript
// paymentService.js
import Web3 from 'web3';
import { initWeb3, ensureCorrectNetwork, RENTAL_ESCROW_ABI } from './web3Config';

/**
 * Gérer le paiement complet d'une réservation
 */
export const processBookingPayment = async (booking, authToken) => {
  try {
    // ===== ÉTAPE 1: Initialiser Web3 =====
    console.log("🔌 Initialisation Web3...");
    const web3 = await initWeb3();
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];
    
    console.log("✅ Wallet connecté:", fromAddress);
    
    // ===== ÉTAPE 2: Vérifier Réseau =====
    console.log("🌐 Vérification réseau...");
    await ensureCorrectNetwork('POLYGON_MUMBAI');
    
    const chainId = await web3.eth.getChainId();
    console.log("✅ Réseau correct:", chainId);
    
    // ===== ÉTAPE 3: Vérifier Wallet =====
    if (fromAddress.toLowerCase() !== booking.tenantWalletAddress.toLowerCase()) {
      const confirm = window.confirm(
        `⚠️ Vous utilisez un wallet différent de celui enregistré.\n\n` +
        `Enregistré: ${booking.tenantWalletAddress}\n` +
        `Actuel: ${fromAddress}\n\n` +
        `Voulez-vous continuer avec le wallet actuel?`
      );
      
      if (!confirm) {
        throw new Error('Veuillez utiliser le wallet: ' + booking.tenantWalletAddress);
      }
    }
    
    // ===== ÉTAPE 4: Vérifier Expiration =====
    const created = new Date(booking.createdAt);
    const expires = new Date(created.getTime() + 15 * 60 * 1000);
    const now = new Date();
    
    if (now > expires) {
      throw new Error('⏰ Temps expiré ! Votre réservation a été annulée. Veuillez créer une nouvelle réservation.');
    }
    
    const timeLeft = Math.floor((expires - now) / 1000);
    console.log(`⏱️ Temps restant: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`);
    
    // ===== ÉTAPE 5: Obtenir Contract Address =====
    if (!booking.contractAddress) {
      throw new Error('❌ Contrat non déployé. Contactez le support.');
    }
    
    console.log("📄 Contrat RentalEscrow:", booking.contractAddress);
    
    // ===== ÉTAPE 6: Instancier Contrat =====
    const contract = new web3.eth.Contract(
      RENTAL_ESCROW_ABI,
      booking.contractAddress
    );
    
    // ===== ÉTAPE 7: Vérifier État Contrat =====
    try {
      const contractState = await contract.methods.currentState().call();
      console.log("État contrat:", contractState); // 0 = Created, 1 = Funded
      
      if (contractState !== '0') {
        throw new Error('❌ Ce contrat a déjà été payé ou annulé.');
      }
      
      const rentAmount = await contract.methods.rentAmount().call();
      const rentAmountEther = web3.utils.fromWei(rentAmount, 'ether');
      console.log("Montant requis:", rentAmountEther, "MATIC");
      
      // Vérifier cohérence avec booking
      const expectedAmount = booking.totalPriceInMatic || booking.totalPrice;
      if (Math.abs(parseFloat(rentAmountEther) - expectedAmount) > 0.01) {
        console.warn('⚠️ Montant contrat différent du booking');
      }
    } catch (error) {
      console.error("Erreur lecture contrat:", error);
      throw new Error('❌ Impossible de lire le contrat. Vérifiez l\'adresse.');
    }
    
    // ===== ÉTAPE 8: Convertir Montant en Wei =====
    // ⚠️ IMPORTANT: Utiliser le montant du contrat, pas du booking
    const rentAmount = await contract.methods.rentAmount().call();
    console.log("💰 Montant à payer:", web3.utils.fromWei(rentAmount, 'ether'), "MATIC");
    
    // ===== ÉTAPE 9: Vérifier Solde =====
    const balance = await web3.eth.getBalance(fromAddress);
    const balanceEther = web3.utils.fromWei(balance, 'ether');
    console.log("💰 Solde wallet:", balanceEther, "MATIC");
    
    // ===== ÉTAPE 10: Estimer Gas =====
    let gasEstimate;
    try {
      gasEstimate = await contract.methods.fund().estimateGas({
        from: fromAddress,
        value: rentAmount
      });
      
      console.log("⛽ Gas estimé:", gasEstimate);
    } catch (error) {
      console.error("Erreur estimation gas:", error);
      
      if (error.message.includes('insufficient funds')) {
        throw new Error(`❌ Solde insuffisant.\nNécessaire: ${web3.utils.fromWei(rentAmount, 'ether')} MATIC + frais gas\nActuel: ${balanceEther} MATIC`);
      } else if (error.message.includes('Already funded')) {
        throw new Error('❌ Ce contrat a déjà été payé.');
      } else if (error.message.includes('Incorrect amount')) {
        throw new Error('❌ Montant incorrect.');
      }
      
      throw new Error('❌ Erreur lors de l\'estimation des frais: ' + error.message);
    }
    
    // Ajouter marge de sécurité
    const gasLimit = Math.floor(gasEstimate * 1.2);
    
    // ===== ÉTAPE 11: Appeler fund() =====
    console.log("🚀 Envoi transaction...");
    
    // ⚠️ CORRECTION: Web3.js send() retourne directement le receipt
    const receipt = await contract.methods.fund().send({
      from: fromAddress,
      value: rentAmount,
      gas: gasLimit
    });
    
    console.log("✅ Transaction minée!");
    console.log("📝 Transaction hash:", receipt.transactionHash);
    console.log("🔢 Block number:", receipt.blockNumber);
    console.log("⛽ Gas utilisé:", receipt.gasUsed);
    
    // Vérifier événement Funded
    if (receipt.events && receipt.events.Funded) {
      const fundedEvent = receipt.events.Funded;
      console.log("✅ Event Funded émis:", {
        tenant: fundedEvent.returnValues.tenant,
        amount: web3.utils.fromWei(fundedEvent.returnValues.amount, 'ether')
      });
    }
    
    // ===== ÉTAPE 12: Valider Backend =====
    console.log("🔄 Validation backend...");
    
    const payment = await validatePaymentBackend(
      booking.id,
      receipt.transactionHash,
      booking.contractAddress,
      web3.utils.fromWei(rentAmount, 'ether'),
      authToken
    );
    
    console.log("✅ Paiement validé:", payment);
    
    return {
      success: true,
      payment,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
    
  } catch (error) {
    console.error("❌ Erreur paiement:", error);
    throw handlePaymentError(error);
  }
};

/**
 * Valider le paiement côté backend avec retry
 */
const validatePaymentBackend = async (bookingId, txHash, contractAddress, amount, authToken, attempt = 1) => {
  const maxAttempts = 3;
  
  try {
    const response = await fetch('http://localhost:8082/api/payments/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId,
        transactionHash: txHash,
        contractAddress,
        expectedAmount: parseFloat(amount)
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    const error = await response.json();
    
    // Erreurs non retry-ables
    if (response.status === 409) {
      throw new Error('❌ Paiement déjà validé');
    }
    
    // Transaction pas encore visible (404) - retry
    if (response.status === 404 && attempt < maxAttempts) {
      console.log(`⏳ Transaction pas encore visible. Tentative ${attempt}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return validatePaymentBackend(bookingId, txHash, contractAddress, amount, authToken, attempt + 1);
    }
    
    throw new Error(error.message || 'Validation backend échouée');
    
  } catch (err) {
    if (attempt < maxAttempts && err.message.includes('fetch')) {
      console.log(`⏳ Erreur réseau. Retry ${attempt}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return validatePaymentBackend(bookingId, txHash, contractAddress, amount, authToken, attempt + 1);
    }
    
    throw err;
  }
};

/**
 * Gérer les erreurs de paiement
 */
const handlePaymentError = (error) => {
  console.error("Error details:", error);
  
  // Erreurs MetaMask
  if (error.code === 4001) {
    return new Error('❌ Transaction rejetée par l\'utilisateur');
  }
  
  if (error.code === 4100) {
    return new Error('❌ Méthode non supportée par MetaMask');
  }
  
  if (error.code === 4200) {
    return new Error('❌ MetaMask déconnecté. Veuillez reconnecter.');
  }
  
  if (error.code === 4900) {
    return new Error('❌ Réseau non connecté dans MetaMask');
  }
  
  if (error.code === 4901) {
    return new Error('❌ Réseau Polygon non configuré dans MetaMask');
  }
  
  // Erreurs Smart Contract
  if (error.message.includes('Already funded')) {
    return new Error('❌ Ce contrat a déjà été payé');
  }
  
  if (error.message.includes('Incorrect amount')) {
    return new Error('❌ Montant incorrect');
  }
  
  if (error.message.includes('Only tenant')) {
    return new Error('❌ Seul le locataire peut payer');
  }
  
  if (error.message.includes('insufficient funds')) {
    return new Error('❌ Solde insuffisant (montant + frais gas)');
  }
  
  // Erreur générique
  return error;
};
```

### Composant React Exemple

```javascript
// PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { processBookingPayment } from './paymentService';

const PaymentPage = ({ booking, authToken }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  
  // Timer compte à rebours
  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(booking.createdAt);
      const expires = new Date(created.getTime() + 15 * 60 * 1000);
      const now = new Date();
      const diff = expires - now;
      
      if (diff <= 0) {
        setTimeLeft({ expired: true });
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ minutes, seconds, expired: false });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [booking]);
  
  const handlePayment = async () => {
    if (timeLeft?.expired) {
      alert('⏰ Temps expiré ! Votre réservation a été annulée.');
      window.location.href = '/bookings';
      return;
    }
    
    setPaying(true);
    setError(null);
    
    try {
      const result = await processBookingPayment(booking, authToken);
      
      alert('✅ Paiement confirmé !');
      console.log('Payment result:', result);
      
      // Rediriger vers page de confirmation
      window.location.href = `/bookings/${booking.id}?payment=success`;
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };
  
  if (!booking.contractAddress) {
    return (
      <div className="alert alert-danger">
        ❌ Erreur: Contrat non déployé. Contactez le support.
      </div>
    );
  }
  
  return (
    <div className="payment-page">
      <div className="card">
        <div className="card-header">
          <h2>💳 Paiement Sécurisé</h2>
        </div>
        
        <div className="card-body">
          {/* Timer */}
          <div className={`timer ${timeLeft?.expired ? 'expired' : ''}`}>
            {timeLeft?.expired ? (
              <span className="text-danger">⏰ Expiré</span>
            ) : timeLeft ? (
              <span>
                ⏱️ Temps restant: {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
              </span>
            ) : (
              <span>Chargement...</span>
            )}
          </div>
          
          {/* Résumé réservation */}
          <div className="booking-summary">
            <h4>Résumé</h4>
            <p><strong>Propriété:</strong> #{booking.propertyId}</p>
            <p><strong>Dates:</strong> {booking.startDate} → {booking.endDate}</p>
            <p><strong>Prix total:</strong> {booking.totalPrice} {booking.currency}</p>
            {booking.totalPriceInMatic && (
              <p><strong>Montant MATIC:</strong> {booking.totalPriceInMatic} MATIC</p>
            )}
          </div>
          
          {/* Contrat */}
          <div className="contract-info">
            <h4>📄 Smart Contract</h4>
            <p className="contract-address">
              <code>{booking.contractAddress}</code>
              <a 
                href={`https://mumbai.polygonscan.com/address/${booking.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur PolygonScan ↗
              </a>
            </p>
          </div>
          
          {/* Erreur */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          {/* Bouton paiement */}
          <button
            onClick={handlePayment}
            disabled={paying || timeLeft?.expired}
            className="btn btn-primary btn-lg w-100"
          >
            {paying ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Paiement en cours...
              </>
            ) : (
              <>🔐 Payer avec MetaMask</>
            )}
          </button>
          
          {/* Infos sécurité */}
          <div className="security-info mt-3">
            <small>
              🔒 Paiement sécurisé par blockchain Polygon<br/>
              ⚡ Frais de transaction (gas) à votre charge<br/>
              ✅ Transaction vérifiée automatiquement
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
```

---

## ⚠️ Points Critiques

### 1. Type userId CORRIGÉ

```java
// ❌ ERREUR ORIGINALE (cause 500 Error)
@RequestHeader(value = "X-User-Id", required = true) Long userId

// ✅ CORRECTION APPLIQUÉE
@RequestHeader(value = "X-User-Id", required = true) String userId
```

Le Gateway envoie un UUID String, pas un Long.

### 2. Web3.js vs Ethers.js

```javascript
// ❌ FAUX (Ethers.js)
const tx = await contract.fund({...});
const receipt = await tx.wait();

// ✅ CORRECT (Web3.js)
const receipt = await contract.methods.fund().send({...});
// send() retourne directement le receipt en Web3.js
```

### 3. Contract Address Source

```javascript
// ⚠️ Le backend DOIT retourner contractAddress dans la booking
const booking = await createBooking({...});

if (!booking.contractAddress) {
  throw new Error('Contract not deployed');
}

// Utiliser cette adresse pour le paiement
const contract = new web3.eth.Contract(ABI, booking.contractAddress);
```

### 4. Montant Exact

```javascript
// ⚠️ NE PAS calculer le montant côté frontend
// Lire le montant DEPUIS le contrat

const rentAmount = await contract.methods.rentAmount().call();
// Utiliser cette valeur pour fund()

await contract.methods.fund().send({
  value: rentAmount  // ✅ Montant exact du contrat
});
```

### 5. Gestion Wallet Différent

```javascript
// ⚠️ Permettre à l'utilisateur de changer de wallet
if (fromAddress !== booking.tenantWalletAddress) {
  const confirm = window.confirm('Wallet différent. Continuer?');
  if (confirm) {
    // Optionnel: Mettre à jour le wallet dans la booking
    // OU: Accepter le paiement avec n'importe quel wallet
  }
}
```

---

## 🐛 Codes Erreur Complets

### Erreurs MetaMask

| Code | Signification | Action |
|------|---------------|--------|
| 4001 | Transaction rejetée | Réafficher formulaire |
| 4100 | Méthode non supportée | Mettre à jour MetaMask |
| 4200 | Provider déconnecté | Reconnecter wallet |
| 4900 | Réseau non connecté | Changer réseau |
| 4901 | Réseau non ajouté | Ajouter Polygon |
| -32000 | Erreur serveur RPC | Réessayer plus tard |
| -32603 | Erreur exécution | Vérifier paramètres |

### Erreurs Smart Contract

| Message | Cause | Solution |
|---------|-------|----------|
| `Already funded` | Contrat déjà payé | Vérifier status booking |
| `Incorrect amount` | Montant != rentAmount | Utiliser montant du contrat |
| `Only tenant` | Mauvais wallet | Utiliser wallet enregistré |
| `insufficient funds` | Solde < montant + gas | Recharger wallet |

### Erreurs Backend

| Status | Message | Cause | Solution |
|--------|---------|-------|----------|
| 404 | Transaction not found | Pas encore minée | Attendre et réessayer |
| 400 | Amount mismatch | Montant incorrect | Vérifier transaction |
| 409 | Already validated | Déjà payé | Actualiser page |
| 500 | Validation failed | Erreur serveur | Contacter support |

---

## 📊 Diagramme de Séquence Complet

```
Frontend         MetaMask         Blockchain        Backend        BookingService
   |                |                 |                |                |
   |-- créer booking ------------------------------------------------->|
   |<-- booking (contractAddress) -----------------------------------|
   |                |                 |                |                |
   |-- initWeb3() ->|                 |                |                |
   |<- accounts ----|                 |                |                |
   |                |                 |                |                |
   |-- contract.fund() ------------->|                |                |
   |                |                 |                |                |
   |                |                 |-- mine tx -----|                |
   |                |                 |                |                |
   |<-- receipt ----|<-- confirmed ---|                |                |
   |                |                 |                |                |
   |-- POST /validate -------------->|                |                |
   |                |                 |                |                |
   |                |                 |<-- verify tx --|                |
   |                |                 |                |                |
   |                |                 |                |-- confirm ---->|
   |                |                 |                |<-- updated ----|
   |                |                 |                |                |
   |<-- payment confirmed -----------|                |                |
```

---

**Version** : 2.0 (Corrigée)  
**Date** : 11 janvier 2026  
**Corrections Critiques** : userId type, Web3.js patterns, contract deployment workflow
