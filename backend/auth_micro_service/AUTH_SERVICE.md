# 🔐 AUTH SERVICE - Documentation Frontend 

**Base URL** : `http://localhost:8082/api/auth`

> ⚠️ **Version corrigée** - Cette documentation reflète exactement le code source du backend.

---

## 🎭 Système de Permissions - IMPORTANT

### ❗ Distinction Roles vs Types

Le système utilise **DEUX** concepts distincts qu'il ne faut PAS confondre :

#### **Roles (Rôles Globaux)**
Définissent les **permissions système** :

| Role | Description | Permissions |
|------|-------------|-------------|
| `USER` | Utilisateur standard | Accès de base à l'application |
| `AGENT` | Agent immobilier | Fonctionnalités agent (futures) |
| `ADMIN` | Administrateur | Validation propriétés, gestion agents |

#### **Types (Types Métier)**
Définissent le **comportement dans l'application de location** :

| Type | Description | Requis |
|------|-------------|--------|
| `CLIENT` | Peut réserver des propriétés | Non |
| `HOST` | Peut publier des propriétés | Wallet obligatoire |

#### Exemples Concrets

```json
// Utilisateur lambda qui réserve
{
  "roles": ["USER"],
  "types": ["CLIENT"]
}

// Propriétaire qui loue
{
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"]  // ⚠️ "HOST" pas "OWNER" !
}

// Admin qui peut tout faire
{
  "roles": ["ADMIN", "USER"],
  "types": ["CLIENT", "HOST"]
}
```

> 🚨 **ERREUR COURANTE** : Ne confondez pas `OWNER` (n'existe pas !) avec `HOST`

---

## 📊 Schéma Base de Données COMPLET

### Table: `users`

| Champ | Type | Description | Obligatoire | Unique | Default |
|-------|------|-------------|-------------|--------|---------|
| `id` | Long | ID auto-incrémenté | ✅ | ✅ | Auto |
| `userId` | String(50) | UUID utilisateur | ✅ | ✅ | Généré |
| `firstname` | String(50) | Prénom | ✅ | ❌ | - |
| `lastname` | String(50) | Nom | ✅ | ❌ | - |
| `email` | String(120) | Email | ✅ | ✅ | - |
| `phone` | String(20) | Téléphone | ❌ | ❌ | null |
| `country` | String(60) | Pays | ❌ | ❌ | null |
| `city` | String(60) | Ville | ❌ | ❌ | null |
| `state` | String(60) | État/Région | ❌ | ❌ | null |
| `date_of_birth` | Date | Date de naissance | ❌ | ❌ | null |
| `address` | String(255) | Adresse complète | ❌ | ❌ | null |
| `profile_image` | String(255) | URL image de profil | ❌ | ❌ | null |
| `walletAddress` | String(42) | Adresse Ethereum | ❌ | ✅ | null |
| `encrypted_password` | String(255) | Mot de passe hashé (BCrypt) | ✅ | ❌ | - |
| `emailVerificationStatus` | Boolean | Email vérifié | ✅ | ❌ | false |
| `verificationCode` | String(6) | Code OTP inscription | ❌ | ❌ | null |
| `verificationCodeExpiresAt` | DateTime | Expiration OTP inscription | ❌ | ❌ | null |
| `passwordResetCode` | String(6) | Code OTP reset password | ❌ | ❌ | null |
| `passwordResetCodeExpiresAt` | DateTime | Expiration reset password | ❌ | ❌ | null |

### Table: `user_roles`

| Champ | Type | Valeurs Possibles |
|-------|------|-------------------|
| `user_id` | Long | FK vers users.id |
| `role` | Enum | `USER`, `AGENT`, `ADMIN` |

### Table: `user_types`

| Champ | Type | Valeurs Possibles |
|-------|------|-------------------|
| `user_id` | Long | FK vers users.id |
| `type` | Enum | `CLIENT`, `HOST` |

### Table: `owners` (Synchronisation asynchrone)

Créée automatiquement lors de la connexion d'un wallet :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | ID auto-incrémenté |
| `userId` | String(50) | UUID de l'utilisateur |
| `walletAddress` | String(42) | Adresse Ethereum |

---

## 🌐 Endpoints Publics (Sans Auth)

### 1. Inscription

**Créer un nouveau compte utilisateur**

```http
POST /api/auth/users
Content-Type: application/json
```

**Request Body**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+212600000000"
}
```

**Validation**
- `firstname` : 2-50 caractères, requis
- `lastname` : 2-50 caractères, requis
- `email` : Format email valide, unique, requis
- `password` : Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial, requis
- `phone` : Optionnel, format international recommandé

**Response 201 Created**
```json
{
  "message": "Utilisateur créé avec succès. Un code de vérification a été envoyé à votre email.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Email déjà utilisé"
}
```

**Logique Métier**
1. Validation format email et unicité
2. Hash du mot de passe avec BCrypt (10 rounds)
3. Génération userId (UUID)
4. Génération code OTP 6 chiffres aléatoires
5. Expiration OTP : **15 minutes** (pas 10 !)
6. Envoi email avec code OTP
7. Création utilisateur :
   - `emailVerificationStatus = false`
   - `roles = ["USER"]` (par défaut)
   - `types = ["CLIENT"]` (par défaut)

---

### 2. Vérification OTP

**Vérifier l'email avec le code reçu**

```http
POST /api/auth/users/verify-otp
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Response 200 OK**
```json
{
  "message": "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Code de vérification incorrect.",
  "status": "error"
}
```

**Response 400 Bad Request (Code expiré)**
```json
{
  "message": "Le code de vérification a expiré. Veuillez en demander un nouveau.",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Vérification que `emailVerificationStatus = false`
3. Vérification code OTP
4. Vérification expiration (15 min depuis création)
5. Si valide :
   - `emailVerificationStatus = true`
   - `verificationCode = null`
   - `verificationCodeExpiresAt = null`

---

### 3. Renvoyer OTP

**Renvoyer un nouveau code de vérification**

```http
POST /api/auth/users/resend-otp?email=john.doe@example.com
```

**Query Parameters**
- `email` : Email de l'utilisateur (requis)

**Response 200 OK**
```json
{
  "message": "Un nouveau code de vérification a été envoyé à votre email.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Cet email a déjà été vérifié",
  "status": "error"
}
```

**Logique Métier**
1. Vérification que email existe
2. Vérification que `emailVerificationStatus = false`
3. Génération nouveau code OTP
4. Nouvelle expiration (15 min)
5. Envoi email

---

### 4. Login

**Connexion avec email et mot de passe**

```http
POST /api/auth/users/login
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response 200 OK**

> ⚠️ **IMPORTANT** : Les informations sont dans les **HEADERS** ET dans le **BODY** !

**Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user_id: 550e8400-e29b-41d4-a716-446655440000
```

**Body**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"],
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response 401 Unauthorized**
```json
{
  "message": "Email ou mot de passe incorrect"
}
```

**Response 403 Forbidden**
```json
{
  "message": "Veuillez vérifier votre email avant de vous connecter"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Vérification `emailVerificationStatus = true`
3. Vérification mot de passe avec BCrypt
4. Génération JWT token :
   - Algorithme: HS256
   - Secret: Variable d'environnement `JWT_SECRET`
   - Expiration: 24 heures
   - Claims: `userId`, `email`, `roles`, `types`
5. Token placé dans header `Authorization`
6. userId placé dans header `user_id`

**JWT Token Structure**
```json
{
  "sub": "john.doe@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"],
  "iat": 1704970800,
  "exp": 1705057200
}
```

---

### 5. Mot de Passe Oublié

**Demander la réinitialisation du mot de passe**

```http
POST /api/auth/users/forgot-password
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com"
}
```

**Response 200 OK**
```json
{
  "message": "Un code de réinitialisation a été envoyé à votre email.",
  "status": "success"
}
```

**Response 404 Not Found**
```json
{
  "message": "Aucun utilisateur trouvé avec cet email",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Génération code OTP 6 chiffres
3. Stockage dans `passwordResetCode`
4. Expiration : 15 minutes (`passwordResetCodeExpiresAt`)
5. Envoi email avec code

---

### 6. Réinitialiser Mot de Passe

**Réinitialiser avec le code OTP**

```http
POST /api/auth/users/reset-password
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response 200 OK**
```json
{
  "message": "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Code de réinitialisation incorrect ou expiré",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Vérification code dans `passwordResetCode`
3. Vérification expiration (15 min)
4. Hash nouveau mot de passe
5. Mise à jour `encrypted_password`
6. Suppression `passwordResetCode` et `passwordResetCodeExpiresAt`

---

## 🔒 Endpoints Protégés (Nécessitent JWT)

**Header requis**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 7. Récupérer Profil Utilisateur

**Obtenir les informations d'un utilisateur**

```http
GET /api/auth/users/{userId}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+212600000000",
  "country": "Morocco",
  "city": "Casablanca",
  "state": "Casablanca-Settat",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue Example",
  "profileImage": "https://example.com/profile.jpg",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "emailVerificationStatus": true,
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"]
}
```

**Response 404 Not Found**
```json
{
  "message": "Utilisateur non trouvé"
}
```

---

### 8. Mettre à Jour Profil

**Modifier les informations utilisateur**

```http
PUT /api/auth/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (tous les champs sont optionnels)
```json
{
  "firstname": "John Updated",
  "lastname": "Doe",
  "phone": "+212611111111",
  "country": "Morocco",
  "city": "Rabat",
  "state": "Rabat-Salé-Kénitra",
  "dateOfBirth": "1990-01-15",
  "address": "456 New Street",
  "profileImage": "https://example.com/new-profile.jpg"
}
```

**Response 200 OK**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstname": "John Updated",
  ...
}
```

**Restrictions**
- Email ne peut pas être modifié
- WalletAddress ne peut pas être modifié via cet endpoint
- Seul le propriétaire peut modifier son profil

---

## 💰 Gestion du Wallet

### 9. Connecter un Wallet

**Associer une adresse Ethereum au compte**

```http
POST /api/auth/users/{userId}/wallet/connect
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Validation**
- Format : `0x` suivi de 40 caractères hexadécimaux
- Longueur exacte : 42 caractères
- Unique dans la base de données
- Vérification checksum Ethereum (optionnel)

**Response 200 OK**
```json
{
  "message": "Wallet connecté avec succès",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Cette adresse wallet est déjà utilisée",
  "status": "error"
}
```

**Logique Métier**
1. Validation format adresse (regex: `^0x[a-fA-F0-9]{40}$`)
2. Vérification unicité dans table `users`
3. Mise à jour `walletAddress` dans UserEntity
4. Ajout automatique type `HOST` si pas déjà présent
5. **Publication événement RabbitMQ** :
   ```json
   {
     "userId": "550e8400...",
     "walletAddress": "0x742d35...",
     "eventType": "WALLET_CONNECTED",
     "timestamp": 1704970800000
   }
   ```
6. **Synchronisation asynchrone** :
   - Listing Service écoute l'événement
   - Création automatique d'un `Owner` dans table `owners`

---

### 10. Déconnecter Wallet

**Retirer l'adresse wallet du compte**

```http
DELETE /api/auth/users/{userId}/wallet/disconnect
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "message": "Wallet déconnecté avec succès",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 409 Conflict**
```json
{
  "message": "Cannot disconnect wallet: You have 3 active properties",
  "status": "blocked"
}
```

**Logique Métier - Contraintes de Déconnexion**

Avant de déconnecter, le système vérifie via **appels API synchrones** :

1. **Propriétés actives** (appel à Listing Service)
   ```http
   GET http://listing-service:8081/properties/owner/{userId}/active-count
   ```
   - Si count > 0 → Refus

2. **Réservations futures en tant qu'hôte** (appel à Booking Service)
   ```http
   GET http://booking-service:8083/bookings/host/{userId}/future-count
   ```
   - Si count > 0 → Refus

3. **Réservations actives en tant que client** (appel à Booking Service)
   ```http
   GET http://booking-service:8083/bookings/client/{userId}/active-count
   ```
   - Si count > 0 → Refus

**Si aucun blocage** :
- `walletAddress = null`
- Suppression type `HOST`
- **Publication événement RabbitMQ** :
  ```json
  {
    "userId": "550e8400...",
    "walletAddress": null,
    "eventType": "WALLET_DISCONNECTED",
    "timestamp": 1704970800000
  }
  ```

---

### 11. Statut du Wallet

**Vérifier si un utilisateur a un wallet**

```http
GET /api/auth/users/{userId}/wallet/status
Authorization: Bearer <token>
```

**Response 200 OK (avec wallet)**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "exists": true
}
```

**Response 200 OK (sans wallet)**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": null,
  "exists": false
}
```

---

## 👨‍💼 Gestion des Agents (ADMIN uniquement)

### 12. Créer un Agent

**Créer un compte agent**

```http
POST /api/auth/users/admin/agents
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "firstname": "Agent",
  "lastname": "Smith",
  "email": "agent@example.com",
  "password": "AgentPass123!",
  "phone": "+212622222222"
}
```

**Response 201 Created**
```json
{
  "message": "Agent créé avec succès.",
  "agentId": "660e8400-e29b-41d4-a716-446655440000",
  "email": "agent@example.com",
  "roles": ["AGENT", "USER"]
}
```

**Logique Métier**
- Rôle `AGENT` + `USER` assignés automatiquement
- Type `CLIENT` par défaut
- Même workflow OTP que les utilisateurs normaux

---

### 13. Lister les Agents

**Récupérer tous les agents**

```http
GET /api/auth/users/admin/agents
Authorization: Bearer <admin_token>
```

**Response 200 OK**
```json
[
  {
    "userId": "660e8400-e29b-41d4-a716-446655440000",
    "email": "agent@example.com",
    "firstname": "Agent",
    "lastname": "Smith",
    "phone": "+212622222222",
    "roles": ["AGENT", "USER"],
    "types": ["CLIENT"],
    "emailVerificationStatus": true
  }
]
```

---

### 14. Supprimer un Agent

**Supprimer un compte agent**

```http
DELETE /api/auth/users/admin/agents/{agentId}
Authorization: Bearer <admin_token>
```

**Response 200 OK**
```json
{
  "message": "Agent supprimé avec succès.",
  "agentId": "660e8400-e29b-41d4-a716-446655440000"
}
```

---

## 📡 Événements RabbitMQ (Communication Asynchrone)

Le Auth Service publie des événements vers les autres microservices :

### Exchange: `user-events`

#### Événement: `user.created`
Publié lors de la création d'un utilisateur

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "walletAddress": null,
  "eventType": "USER_CREATED",
  "timestamp": 1704970800000
}
```

**Consommateurs** : Aucun actuellement

---

#### Événement: `user.wallet.connected`
Publié lors de la connexion d'un wallet

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "eventType": "WALLET_CONNECTED",
  "timestamp": 1704970800000
}
```

**Consommateurs** :
- **Listing Service** : Crée automatiquement un `Owner` dans la table `owners`

---

#### Événement: `user.wallet.disconnected`
Publié lors de la déconnexion d'un wallet

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": null,
  "eventType": "WALLET_DISCONNECTED",
  "timestamp": 1704970800000
}
```

**Consommateurs** :
- **Listing Service** : Supprime l'`Owner` (si aucune propriété active)

---

## 🎯 Cas d'Usage Frontend

### Workflow d'Inscription Complète

```javascript
// ========== ÉTAPE 1: Inscription ==========
const signupResponse = await fetch('http://localhost:8082/api/auth/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    phone: '+212600000000'
  })
});

const { userId, email } = await signupResponse.json();
// Afficher : "Code envoyé à votre email"

// ========== ÉTAPE 2: Vérification OTP ==========
const otpResponse = await fetch('http://localhost:8082/api/auth/users/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    code: '123456' // Code saisi par l'utilisateur
  })
});

if (otpResponse.ok) {
  alert("Email vérifié ! Vous pouvez vous connecter.");
}

// ========== ÉTAPE 3: Login ==========
const loginResponse = await fetch('http://localhost:8082/api/auth/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    password: 'SecurePass123!'
  })
});

// ⚠️ IMPORTANT : Token dans les HEADERS !
const token = loginResponse.headers.get('Authorization'); // "Bearer eyJ..."
const userId = loginResponse.headers.get('user_id');

// Body contient les infos utilisateur
const userData = await loginResponse.json();
console.log(userData.roles);  // ["USER"]
console.log(userData.types);  // ["CLIENT"]

// ========== ÉTAPE 4: Stocker le token ==========
localStorage.setItem('authToken', token);
localStorage.setItem('userId', userId);
localStorage.setItem('userRoles', JSON.stringify(userData.roles));
localStorage.setItem('userTypes', JSON.stringify(userData.types));

// ========== ÉTAPE 5: Utiliser le token ==========
const profileResponse = await fetch(
  `http://localhost:8082/api/auth/users/${userId}`,
  {
    headers: {
      'Authorization': token  // Déjà avec "Bearer " préfixe
    }
  }
);
```

---

### Connecter MetaMask

```javascript
// ========== ÉTAPE 1: Demander connexion MetaMask ==========
if (typeof window.ethereum === 'undefined') {
  alert("Veuillez installer MetaMask");
  return;
}

const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});
const walletAddress = accounts[0];
console.log("Wallet connecté:", walletAddress);

// ========== ÉTAPE 2: Vérifier le réseau ==========
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (chainId !== '0x89') {  // Polygon Mainnet
  alert("Veuillez connecter MetaMask au réseau Polygon");
  return;
}

// ========== ÉTAPE 3: Envoyer au backend ==========
const response = await fetch(
  `http://localhost:8082/api/auth/users/${userId}/wallet/connect`,
  {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ walletAddress })
  }
);

if (response.ok) {
  const data = await response.json();
  alert("Wallet connecté avec succès !");
  
  // ⚠️ L'utilisateur devient maintenant HOST
  // Mettre à jour le localStorage
  const currentTypes = JSON.parse(localStorage.getItem('userTypes'));
  if (!currentTypes.includes('HOST')) {
    currentTypes.push('HOST');
    localStorage.setItem('userTypes', JSON.stringify(currentTypes));
  }
  
  // Peut maintenant créer des propriétés
  window.location.href = '/create-property';
} else {
  const error = await response.json();
  alert(`Erreur: ${error.message}`);
}
```

---

## ⚠️ Points d'Attention

### Sécurité

1. **Token JWT dans les Headers**
   ```javascript
   // ❌ FAUX
   const { token } = await response.json();
   
   // ✅ CORRECT
   const token = response.headers.get('Authorization');
   ```

2. **Vérifier l'expiration**
   ```javascript
   // Token expire après 24h
   const decodeToken = (token) => {
     const base64Url = token.split('.')[1];
     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
     const jsonPayload = decodeURIComponent(
       atob(base64).split('').map(c => 
         '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
       ).join('')
     );
     return JSON.parse(jsonPayload);
   };
   
   const payload = decodeToken(token.replace('Bearer ', ''));
   const isExpired = Date.now() >= payload.exp * 1000;
   
   if (isExpired) {
     // Rediriger vers login
     window.location.href = '/login';
   }
   ```

3. **Ne jamais exposer le token dans les URLs**
   ```javascript
   // ❌ DANGEREUX
   window.location.href = `/profile?token=${token}`;
   
   // ✅ CORRECT
   // Token uniquement dans headers ou localStorage
   ```

### Validation Côté Frontend

Avant d'envoyer les requêtes :

```javascript
// Validation email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation mot de passe
const isValidPassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && 
         hasNumber && hasSpecial;
};

// Validation wallet Ethereum
const isValidWallet = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
```

### Gestion des Erreurs

```javascript
const handleAuthError = (response, error) => {
  switch (response.status) {
    case 400:
      alert(`Erreur: ${error.message}`);
      break;
    case 401:
      localStorage.clear();
      window.location.href = '/login';
      break;
    case 403:
      alert("Veuillez vérifier votre email avant de continuer");
      window.location.href = '/verify-email';
      break;
    case 409:
      alert("Conflit: " + error.message);
      break;
    default:
      alert("Une erreur est survenue. Veuillez réessayer.");
  }
};
```

---

## 🐛 Problèmes Courants

### "Email déjà vérifié"
**Cause** : Tentative de re-vérifier un email déjà validé  
**Solution** : Rediriger vers login

### "Token expired"
**Cause** : Token JWT expiré (24h)  
**Solution** : Redemander login, refresh token non implémenté

### "Wallet déjà utilisé"
**Cause** : Adresse déjà associée à un autre compte  
**Solution** : Utiliser un autre wallet ou contacter support

### "Cannot disconnect wallet"
**Cause** : Propriétés actives ou réservations en cours  
**Solution** : Annuler/terminer les réservations avant

---

## 📊 Enums - Référence Rapide

### UserRole
```java
ADMIN   // Administrateur système
AGENT   // Agent immobilier
USER    // Utilisateur standard (défaut)
```

### UserType
```java
HOST    // Peut publier des propriétés (wallet requis)
CLIENT  // Peut réserver (défaut)
```

---

## 🔄 Diagramme de Séquence - Login Flow

```
Frontend          Gateway          Auth Service       Database
   |                 |                  |                |
   |-- POST /login --|                  |                |
   |                 |-- Forward ------>|                |
   |                 |                  |-- Query ------>|
   |                 |                  |<-- User -------|
   |                 |                  |                |
   |                 |                  |--(BCrypt)------|
   |                 |                  |                |
   |                 |                  |--(Generate JWT)|
   |                 |                  |                |
   |                 |<-- Headers ------|                |
   |                 |   + Body         |                |
   |<-- Headers +----|                  |                |
   |    Body         |                  |                |
   |                 |                  |                |
```

---

**Version** : 2.0 (Corrigée)  
**Date** : 11 janvier 2026  
**Prochaine étape** : [LISTING_SERVICE.md](LISTING_SERVICE.md)