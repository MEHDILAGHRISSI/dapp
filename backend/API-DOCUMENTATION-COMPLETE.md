# 📚 Documentation API Complète - Application de Location Décentralisée

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des Services](#architecture-des-services)
3. [Authentification](#authentification)
4. [Auth Service](#auth-service-port-8080)
5. [Listing Service](#listing-service-port-8081)
6. [Booking Service](#booking-service-port-8083)
7. [Payment Service](#payment-service-port-8084)
8. [Gateway Service](#gateway-service-port-8082)
9. [Codes d'Erreur](#codes-derreur)
10. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 📖 Vue d'ensemble

### ✅ Résolution du Problème CORS

**Important:** Le problème de duplication des headers CORS a été résolu. La configuration CORS est maintenant centralisée uniquement au niveau du Gateway.

- ✅ Gateway: CORS activé (gère tous les headers)
- ✅ Auth Service: CORS désactivé (CorsConfig commenté)
- ✅ Listing Service: CORS désactivé (WebConfig commenté)
- ✅ Autres services: CORS désactivé

### Base URLs

**⚠️ IMPORTANT:** Toutes les requêtes doivent passer par le Gateway. Les ports individuels des services (8080, 8081, 8083, 8084) ne sont **PAS accessibles** depuis l'extérieur - ils sont internes au réseau Docker.

| Service | URL (OBLIGATOIRE via Gateway) |
|---------|-------------------------------|
| **Auth Service** | `http://localhost:8082/api/auth` |
| **Listing Service** | `http://localhost:8082/api/listings` |
| **Booking Service** | `http://localhost:8082/api/bookings` |
| **Payment Service** | `http://localhost:8082/api/payments` |
| **Gateway Health** | `http://localhost:8082/health` |

**Ports des Services (INTERNES UNIQUEMENT - Ne pas utiliser) :**
- Auth Service: Port 8080 (accessible uniquement entre conteneurs Docker)
- Listing Service: Port 8081 (accessible uniquement entre conteneurs Docker)
- Booking Service: Port 8083 (accessible uniquement entre conteneurs Docker)
- Payment Service: Port 8084 (accessible uniquement entre conteneurs Docker)

**✅ À utiliser :** `http://localhost:8082` (Gateway)
**❌ Ne PAS utiliser :** `http://localhost:8080`, `8081`, `8083`, `8084` (services internes)

### Format de Réponse

Toutes les réponses sont au format JSON:

**Succès:**
```json
{
  "id": "string",
  "data": {},
  "status": "success"
}
```

**Erreur:**
```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description de l'erreur",
  "path": "/api/endpoint"
}
```

---

## 🏗️ Architecture des Services

```
┌─────────────────────────────────────────────────────────┐
│                  Client / Frontend                       │
│                (http://localhost:3000)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ ✅ CORS géré ici uniquement
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Gateway Service (Port 8082)                 │
│              - Routing & Load Balancing                  │
│              - CORS Configuration Centralisée            │
│              - JWT Authentication                        │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┬──────────────┐
          │              │               │              │
          ▼              ▼               ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│ Auth Service │  │   Listing    │  │ Booking  │  │ Payment  │
│  Port 8080   │  │   Service    │  │ Service  │  │ Service  │
│              │  │  Port 8081   │  │Port 8083 │  │Port 8084 │
│ ❌ No CORS   │  │  ❌ No CORS  │  │❌ No CORS│  │❌ No CORS│
└──────────────┘  └──────────────┘  └──────────┘  └──────────┘
                         │                   │
                         └─────────┬─────────┘
                                   ▼
                         ┌─────────────────────┐
                         │  RabbitMQ (5672)    │
                         │  Message Queue      │
                         └─────────────────────┘
```

**Flux de Requête:**
1. Client → Gateway (CORS headers ajoutés ici)
2. Gateway → Service Backend (pas de CORS headers)
3. Service Backend → Gateway (réponse sans CORS)
4. Gateway → Client (avec CORS headers)

---

## 🔐 Authentification

### Méthode: JWT Bearer Token

Après connexion, le serveur retourne un token JWT dans le **header HTTP** `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoiYWJjMTIzIiwicm9sZXMiOlsiVVNFUiJdLCJ0eXBlcyI6WyJDTElFTlQiXSwiZXhwIjoxNjQwOTk1MjAwfQ.xxx
```

### Headers Requis

Pour toutes les requêtes authentifiées:

```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

### Compte Admin par Défaut

```
Email: daar.chain@gmail.com
Password: Admin@123
```

### Rôles et Types d'Utilisateur

**Rôles:**
- `USER` - Utilisateur standard
- `ADMIN` - Administrateur (accès à tous les endpoints)
- `AGENT` - Agent créé par l'admin

**Types:**
- `CLIENT` - Peut réserver des propriétés
- `OWNER` - Peut créer et gérer des propriétés

---

## 🔑 Auth Service (Port 8080)
**Base URL (via Gateway OBLIGATOIRE):** `http://localhost:8082/api/auth`

### 📊 Résumé des Endpoints

| Méthode | Endpoint | Description | Auth Requise |
|---------|----------|-------------|--------------|
| POST | `/users` | Créer un compte | ❌ |
| POST | `/users/login` | Se connecter | ❌ |
| GET | `/users/{id}` | Obtenir un utilisateur | ✅ |
| PUT | `/users/{id}` | Mettre à jour un utilisateur | ✅ |
| DELETE | `/users/{id}` | Supprimer un utilisateur | ✅ (ADMIN) |
| POST | `/users/verify-otp` | Vérifier le code OTP | ❌ |
| POST | `/users/resend-otp` | Renvoyer le code OTP | ❌ |
| POST | `/users/forgot-password` | Demander réinitialisation MDP | ❌ |
| POST | `/users/reset-password` | Réinitialiser le MDP | ❌ |
| PUT | `/users/{id}/wallet` | Mettre à jour l'adresse wallet | ✅ |
| GET | `/users/{userId}/wallet/status` | Statut du wallet | ✅ |
| POST | `/users/admin/agents` | Créer un agent (admin) | ✅ (ADMIN) |
| GET | `/users/admin/agents` | Liste des agents | ✅ (ADMIN) |
| DELETE | `/users/admin/agents/{agentId}` | Supprimer un agent | ✅ (ADMIN) |

---

### 👤 User Management

#### 1. Register User

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /users`

`POST http://localhost:8082/api/auth/users`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "firstname": "Alice",
  "lastname": "Dupont",
  "email": "alice.dupont@example.com",
  "password": "SecurePass123!",
  "phone": "+33612345678",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75001",
  "dateOfBirth": "1990-05-15",
  "types": ["CLIENT", "OWNER"]
}
```

**Response:** `201 Created`
```json
{
  "userId": "abc123-def456",
  "firstname": "Alice",
  "lastname": "Dupont",
  "email": "alice.dupont@example.com",
  "emailVerficationStatus": false,
  "types": ["CLIENT", "OWNER"],
  "roles": ["USER"]
}
```

**Notes:**
- Un code OTP est automatiquement envoyé par email
- L'utilisateur doit vérifier son email avant de se connecter
- Les types peuvent inclure: `CLIENT`, `OWNER`, ou les deux

---

#### 2. Login

Authentifier un utilisateur et obtenir un token JWT.

**Endpoint:** `POST /users/login`

`POST http://localhost:8082/api/auth/users/login`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "daar.chain@gmail.com",
  "password": "Admin@123"
}
```

**Response:** `200 OK`

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkYWFyLmNoYWluQGdtYWlsLmNvbSIsInVzZXJJZCI6ImFiYzEyMyIsInJvbGVzIjpbIkFETUlOIl0sInR5cGVzIjpbIkNMSUVOVCJdLCJleHAiOjE2NDA5OTUyMDB9.xxx
user_id: abc123-def456
```

**Body:**
```json
{
  "userId": "abc123-def456",
  "email": "daar.chain@gmail.com",
  "firstname": "Admin",
  "lastname": "System",
  "roles": ["ADMIN"],
  "types": ["CLIENT"]
}
```

**⚠️ Important:**
- Le token JWT est dans le **header** `Authorization`, pas dans le body!
- Récupérez aussi le `user_id` dans les headers
- Le token expire après 24 heures

**Erreurs Courantes:**
- `401 Unauthorized` - Email ou mot de passe incorrect
- `403 Forbidden` - Email non vérifié

---

#### 3. Get User By ID

Récupérer les informations d'un utilisateur.

**Endpoint:** `GET /users/{id}`

`GET http://localhost:8082/api/auth/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "userId": "abc123-def456",
  "firstname": "Alice",
  "lastname": "Dupont",
  "email": "alice.dupont@example.com",
  "phone": "+33612345678",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75001",
  "dateOfBirth": "1990-05-15",
  "emailVerficationStatus": true,
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "types": ["CLIENT", "OWNER"],
  "roles": ["USER"],
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

#### 4. Update User

Mettre à jour les informations d'un utilisateur.

**Endpoint:** `PUT /users/{id}`

`PUT http://localhost:8082/api/auth/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "firstname": "Alice",
  "lastname": "Martin",
  "phone": "+33698765432",
  "address": "456 Avenue Montaigne",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75008"
}
```

**Response:** `200 OK`
```json
{
  "userId": "abc123-def456",
  "firstname": "Alice",
  "lastname": "Martin",
  "email": "alice.dupont@example.com",
  "phone": "+33698765432",
  "address": "456 Avenue Montaigne",
  "updatedAt": "2026-01-10T14:00:00Z"
}
```

**Notes:**
- Seul le propriétaire du compte ou un ADMIN peut mettre à jour
- L'email ne peut pas être modifié
- Les champs non fournis restent inchangés

---

#### 5. Delete User

Supprimer un compte utilisateur (ADMIN uniquement).

**Endpoint:** `DELETE /users/{id}`

`DELETE http://localhost:8082/api/auth/users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully",
  "userId": "abc123-def456"
}
```

**⚠️ Restrictions:**
- Seuls les ADMINs peuvent supprimer des utilisateurs
- Cette action est irréversible
- Toutes les données associées (propriétés, réservations) sont également supprimées

---

### 📧 Email Verification

#### 6. Verify OTP

Vérifier le code OTP envoyé par email.

**Endpoint:** `POST /users/verify-otp`

`POST http://localhost:8082/api/auth/users/verify-otp`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice.dupont@example.com",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
  "status": "success"
}
```

**Erreurs:**
- `400 Bad Request` - Code incorrect ou expiré
- `404 Not Found` - Utilisateur non trouvé

**Notes:**
- Le code OTP expire après 15 minutes
- Après 3 tentatives échouées, demandez un nouveau code

---

#### 7. Resend OTP

Renvoyer un code OTP.

**Endpoint:** `POST /users/resend-otp?email={email}`

`POST http://localhost:8082/api/auth/users/resend-otp?email={email}`

**Query Parameters:**
- `email` (required): Email de l'utilisateur

**Example:**
```
POST /users/resend-otp?email=alice.dupont@example.com
```

**Response:** `200 OK`
```json
{
  "message": "Un nouveau code de vérification a été envoyé à votre email.",
  "status": "success"
}
```

**Notes:**
- Un nouveau code de 6 chiffres est généré
- L'ancien code devient invalide
- Limite: 5 demandes par heure

---

### 🔑 Password Management

#### 8. Forgot Password

Demander un code de réinitialisation de mot de passe.

**Endpoint:** `POST /users/forgot-password`

`POST http://localhost:8082/api/auth/users/forgot-password`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice.dupont@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Un code de réinitialisation a été envoyé à votre email.",
  "status": "success"
}
```

**Notes:**
- Un code de réinitialisation de 6 chiffres est envoyé par email
- Le code expire après 15 minutes
- Utilisez ce code avec l'endpoint `/users/reset-password`

---

#### 9. Reset Password

Réinitialiser le mot de passe avec le code reçu.

**Endpoint:** `POST /users/reset-password`

`POST http://localhost:8082/api/auth/users/reset-password`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice.dupont@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Mot de passe réinitialisé avec succès.",
  "status": "success"
}
```

**Validation du Mot de Passe:**
- Minimum 8 caractères
- Au moins une majuscule
- Au moins un chiffre
- Au moins un caractère spécial

---

### 💰 Wallet Management

#### 10. Update Wallet Address

Mettre à jour l'adresse wallet Ethereum d'un utilisateur.

**Endpoint:** `PUT /users/{id}/wallet`

`PUT http://localhost:8082/api/auth/users/{id}/wallet`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:** `200 OK`
```json
{
  "userId": "abc123-def456",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

**Notes:**
- L'adresse wallet doit être une adresse Ethereum valide (0x + 40 caractères hexadécimaux)
- Cette adresse est utilisée pour les paiements en crypto
- Un événement RabbitMQ est publié pour synchroniser avec les autres services

---

#### 11. Get Wallet Status

Vérifier si un utilisateur a connecté son wallet.

**Endpoint:** `GET /users/{userId}/wallet/status`

`GET http://localhost:8082/api/auth/users/{userId}/wallet/status`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "connected": true,
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "verified": true
}
```

**Si pas de wallet:**
```json
{
  "connected": false,
  "walletAddress": null,
  "verified": false
}
```

---

### 👥 Admin Operations

#### 12. Create Agent (Admin Only)

Créer un compte agent (par l'administrateur).

**Endpoint:** `POST /users/admin/agents`

`POST http://localhost:8082/api/auth/users/admin/agents`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "firstname": "Jean",
  "lastname": "Agent",
  "email": "jean.agent@example.com",
  "password": "AgentPass123!",
  "phone": "+33612345678"
}
```

**Response:** `201 Created`
```json
{
  "userId": "agent123",
  "firstname": "Jean",
  "lastname": "Agent",
  "email": "jean.agent@example.com",
  "roles": ["AGENT"],
  "types": ["CLIENT"],
  "createdAt": "2026-01-10T12:00:00Z"
}
```

**⚠️ Restrictions:**
- Seuls les ADMINs peuvent créer des agents
- Les agents ont des permissions limitées

---

#### 13. Get All Agents (Admin Only)

Récupérer la liste de tous les agents.

**Endpoint:** `GET /users/admin/agents`

`GET http://localhost:8082/api/auth/users/admin/agents`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "userId": "agent123",
    "firstname": "Jean",
    "lastname": "Agent",
    "email": "jean.agent@example.com",
    "roles": ["AGENT"],
    "createdAt": "2026-01-10T12:00:00Z"
  },
  {
    "userId": "agent456",
    "firstname": "Marie",
    "lastname": "Support",
    "email": "marie.support@example.com",
    "roles": ["AGENT"],
    "createdAt": "2026-01-09T10:00:00Z"
  }
]
```

---

#### 14. Delete Agent (Admin Only)

Supprimer un compte agent.

**Endpoint:** `DELETE /users/admin/agents/{agentId}`

`DELETE http://localhost:8082/api/auth/users/admin/agents/{agentId}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "message": "Agent deleted successfully",
  "agentId": "agent123"
}
```

---

## 🏠 Listing Service (Port 8081)
**Base URL (via Gateway OBLIGATOIRE):** `http://localhost:8082/api/listings`

### 📊 Résumé des Endpoints

#### Properties

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/properties` | Créer une propriété | ✅ |
| GET | `/properties` | Liste toutes les propriétés | ✅ |
| GET | `/properties/{id}` | Détails d'une propriété | ✅ |
| PUT | `/properties/{id}` | Mettre à jour une propriété | ✅ |
| DELETE | `/properties/{id}` | Supprimer une propriété | ✅ |
| GET | `/properties/my-properties` | Mes propriétés | ✅ |
| GET | `/properties/owner/{ownerId}` | Propriétés d'un owner | ✅ |
| GET | `/properties/owner/{ownerId}/count` | Nombre de propriétés | ✅ |
| GET | `/properties/search` | Rechercher des propriétés | ✅ |
| GET | `/properties/nearby` | Propriétés à proximité | ✅ |
| PATCH | `/properties/{id}/status` | Changer le statut | ✅ |
| POST | `/properties/{id}/images` | Upload images | ✅ |
| DELETE | `/properties/{id}/images` | Supprimer des images | ✅ |

#### Characteristics

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/characteristics` | Liste des caractéristiques | ✅ |
| POST | `/characteristics` | Créer une caractéristique | ✅ |
| GET | `/characteristics/{id}` | Détails d'une caractéristique | ✅ |
| PUT | `/characteristics/{id}` | Mettre à jour | ✅ |
| DELETE | `/characteristics/{id}` | Supprimer | ✅ |

#### Type Characteristics

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/type-caracteristiques` | Liste des types | ✅ |
| POST | `/type-caracteristiques` | Créer un type | ✅ |
| GET | `/type-caracteristiques/{id}` | Détails d'un type | ✅ |

#### Owners

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/owners` | Liste des owners | ✅ |
| GET | `/owners/{userId}` | Détails d'un owner | ✅ |
| GET | `/owners/check/{userId}` | Vérifier si owner | ✅ |

---

### 🏢 Properties Management

#### 1. Create Property

Créer une nouvelle propriété.

**Endpoint:** `POST /properties`

`POST http://localhost:8082/api/listings/properties`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Appartement Moderne Paris",
  "description": "Magnifique appartement au cœur de Paris avec vue panoramique sur la Tour Eiffel.",
  "propertyType": "APARTMENT",
  "address": "123 Avenue des Champs-Élysées",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75008",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "pricePerNight": 250.00,
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["WIFI", "TV", "KITCHEN", "AIR_CONDITIONING", "PARKING"]
}
```

**Property Types:**
- `APARTMENT` - Appartement
- `HOUSE` - Maison
- `VILLA` - Villa
- `STUDIO` - Studio
- `ROOM` - Chambre

**Amenities (Équipements):**
- `WIFI` - Wi-Fi
- `TV` - Télévision
- `KITCHEN` - Cuisine équipée
- `WASHER` - Lave-linge
- `DRYER` - Sèche-linge
- `AIR_CONDITIONING` - Climatisation
- `HEATING` - Chauffage
- `PARKING` - Parking
- `POOL` - Piscine
- `GYM` - Salle de sport
- `ELEVATOR` - Ascenseur
- `BALCONY` - Balcon
- `GARDEN` - Jardin

**Response:** `201 Created`
```json
{
  "id": "prop123",
  "title": "Appartement Moderne Paris",
  "description": "Magnifique appartement...",
  "propertyType": "APARTMENT",
  "address": "123 Avenue des Champs-Élysées",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75008",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "pricePerNight": 250.00,
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["WIFI", "TV", "KITCHEN", "AIR_CONDITIONING", "PARKING"],
  "images": [],
  "ownerId": "abc123",
  "status": "ACTIVE",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

**Notes:**
- L'utilisateur doit avoir le type `OWNER`
- Les images sont ajoutées séparément via `/properties/{id}/images`
- Un événement RabbitMQ est publié pour notifier les autres services

---

#### 2. Get All Properties

Récupérer toutes les propriétés actives.

**Endpoint:** `GET /properties`

`GET http://localhost:8082/api/listings/properties`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters (Optionnels):**
- `page` - Numéro de page (défaut: 0)
- `size` - Taille de la page (défaut: 20)
- `sort` - Tri (ex: `pricePerNight,asc` ou `createdAt,desc`)

**Example:**
```
GET /properties?page=0&size=10&sort=pricePerNight,asc
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "prop123",
      "title": "Appartement Moderne Paris",
      "city": "Paris",
      "country": "France",
      "pricePerNight": 250.00,
      "bedrooms": 3,
      "bathrooms": 2,
      "maxGuests": 6,
      "images": ["https://s3.amazonaws.com/..."],
      "status": "ACTIVE",
      "rating": 4.5,
      "reviewsCount": 12
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 45,
  "totalPages": 5
}
```

---

#### 3. Get Property By ID

Récupérer les détails complets d'une propriété.

**Endpoint:** `GET /properties/{id}`

`GET http://localhost:8082/api/listings/properties/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "title": "Appartement Moderne Paris",
  "description": "Magnifique appartement au cœur de Paris avec vue panoramique sur la Tour Eiffel. Entièrement rénové et équipé.",
  "propertyType": "APARTMENT",
  "address": "123 Avenue des Champs-Élysées",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75008",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "pricePerNight": 250.00,
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["WIFI", "TV", "KITCHEN", "AIR_CONDITIONING"],
  "images": [
    "https://s3.amazonaws.com/image1.jpg",
    "https://s3.amazonaws.com/image2.jpg"
  ],
  "ownerId": "abc123",
  "ownerName": "Alice Dupont",
  "status": "ACTIVE",
  "rating": 4.5,
  "reviewsCount": 12,
  "createdAt": "2026-01-09T12:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

---

#### 4. Update Property

Mettre à jour une propriété existante.

**Endpoint:** `PUT /properties/{id}`

`PUT http://localhost:8082/api/listings/properties/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Appartement Moderne Paris - Rénové",
  "description": "Appartement entièrement rénové avec équipements neufs",
  "pricePerNight": 275.00,
  "amenities": ["WIFI", "TV", "KITCHEN", "AIR_CONDITIONING", "PARKING", "ELEVATOR"]
}
```

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "title": "Appartement Moderne Paris - Rénové",
  "pricePerNight": 275.00,
  "amenities": ["WIFI", "TV", "KITCHEN", "AIR_CONDITIONING", "PARKING", "ELEVATOR"],
  "updatedAt": "2026-01-10T14:00:00Z"
}
```

**⚠️ Restrictions:**
- Seul le propriétaire de la propriété peut la mettre à jour
- Les champs non fournis restent inchangés

---

#### 5. Delete Property

Supprimer une propriété.

**Endpoint:** `DELETE /properties/{id}`

`DELETE http://localhost:8082/api/listings/properties/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully",
  "propertyId": "prop123"
}
```

**⚠️ Restrictions:**
- Seul le propriétaire peut supprimer sa propriété
- Impossible si des réservations actives existent

---

#### 6. Get My Properties

Récupérer toutes les propriétés de l'utilisateur connecté.

**Endpoint:** `GET /properties/my-properties`

`GET http://localhost:8082/api/listings/properties/my-properties`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "city": "Paris",
    "pricePerNight": 250.00,
    "status": "ACTIVE",
    "bookingsCount": 5,
    "totalRevenue": 1250.00,
    "rating": 4.5
  },
  {
    "id": "prop456",
    "title": "Villa Côte d'Azur",
    "city": "Nice",
    "pricePerNight": 450.00,
    "status": "INACTIVE",
    "bookingsCount": 3,
    "totalRevenue": 1350.00,
    "rating": 5.0
  }
]
```

---

#### 7. Get Properties By Owner

Récupérer toutes les propriétés d'un propriétaire spécifique.

**Endpoint:** `GET /properties/owner/{ownerId}`

`GET http://localhost:8082/api/listings/properties/owner/{ownerId}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "city": "Paris",
    "pricePerNight": 250.00,
    "status": "ACTIVE"
  }
]
```

---

#### 8. Get Property Count By Owner

Compter le nombre de propriétés d'un owner.

**Endpoint:** `GET /properties/owner/{ownerId}/count`

`GET http://localhost:8082/api/listings/properties/owner/{ownerId}/count`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "ownerId": "abc123",
  "totalProperties": 5,
  "activeProperties": 4,
  "inactiveProperties": 1
}
```

---

#### 9. Search Properties

Rechercher des propriétés avec des filtres avancés.

**Endpoint:** `GET /properties/search`

`GET http://localhost:8082/api/listings/properties/search`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters:**
- `city` (optional) - Ville
- `country` (optional) - Pays
- `propertyType` (optional) - Type de propriété
- `minPrice` (optional) - Prix minimum par nuit
- `maxPrice` (optional) - Prix maximum par nuit
- `bedrooms` (optional) - Nombre minimum de chambres
- `bathrooms` (optional) - Nombre minimum de salles de bain
- `maxGuests` (optional) - Nombre minimum de personnes
- `amenities` (optional) - Équipements requis (séparés par virgules)

**Example:**
```
GET /properties/search?city=Paris&minPrice=100&maxPrice=300&bedrooms=2&propertyType=APARTMENT&amenities=WIFI,PARKING
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "city": "Paris",
    "country": "France",
    "pricePerNight": 250.00,
    "bedrooms": 3,
    "bathrooms": 2,
    "propertyType": "APARTMENT",
    "amenities": ["WIFI", "TV", "KITCHEN", "PARKING"],
    "images": ["https://..."],
    "rating": 4.5
  }
]
```

---

#### 10. Find Nearby Properties

Trouver des propriétés à proximité d'une localisation (géolocalisation).

**Endpoint:** `GET /properties/nearby`

`GET http://localhost:8082/api/listings/properties/nearby`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters:**
- `latitude` (required) - Latitude
- `longitude` (required) - Longitude
- `radius` (optional) - Rayon en km (défaut: 10)
- `limit` (optional) - Nombre maximum de résultats (défaut: 20)

**Example:**
```
GET /properties/nearby?latitude=48.8566&longitude=2.3522&radius=5&limit=10
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "distance": 2.3,
    "distanceUnit": "km",
    "city": "Paris",
    "pricePerNight": 250.00,
    "latitude": 48.8600,
    "longitude": 2.3500,
    "images": ["https://..."]
  },
  {
    "id": "prop456",
    "title": "Studio Louvre",
    "distance": 3.8,
    "distanceUnit": "km",
    "city": "Paris",
    "pricePerNight": 180.00,
    "latitude": 48.8620,
    "longitude": 2.3380,
    "images": ["https://..."]
  }
]
```

**Notes:**
- Les résultats sont triés par distance (le plus proche en premier)
- La distance est calculée en ligne droite (à vol d'oiseau)

---

#### 11. Update Property Status

Changer le statut d'une propriété (ACTIVE/INACTIVE).

**Endpoint:** `PATCH /properties/{id}/status`

`PATCH http://localhost:8082/api/listings/properties/{id}/status`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "INACTIVE"
}
```

**Status Values:**
- `ACTIVE` - Propriété visible et réservable
- `INACTIVE` - Propriété invisible et non réservable
- `PENDING` - En attente de validation
- `BLOCKED` - Bloquée par l'admin

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "status": "INACTIVE",
  "updatedAt": "2026-01-10T15:00:00Z"
}
```

**Notes:**
- Les propriétés INACTIVE ne peuvent pas être réservées
- Les réservations existantes restent valides

---

#### 12. Upload Property Images

Ajouter des images à une propriété.

**Endpoint:** `POST /properties/{id}/images`

`POST http://localhost:8082/api/listings/properties/{id}/images`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
images: [file1.jpg, file2.jpg, file3.jpg]
```

**Response:** `200 OK`
```json
{
  "propertyId": "prop123",
  "uploadedImages": [
    "https://s3.amazonaws.com/listings/prop123/image1.jpg",
    "https://s3.amazonaws.com/listings/prop123/image2.jpg",
    "https://s3.amazonaws.com/listings/prop123/image3.jpg"
  ],
  "totalImages": 5
}
```

**Restrictions:**
- Maximum 10 images par propriété
- Formats acceptés: JPG, JPEG, PNG
- Taille maximale: 5 MB par image

---

#### 13. Delete Property Images

Supprimer des images d'une propriété.

**Endpoint:** `DELETE /properties/{id}/images`

`DELETE http://localhost:8082/api/listings/properties/{id}/images`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrls": [
    "https://s3.amazonaws.com/listings/prop123/image1.jpg",
    "https://s3.amazonaws.com/listings/prop123/image3.jpg"
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Images deleted successfully",
  "deletedCount": 2,
  "remainingImages": 3
}
```

---

### 📝 Characteristics Management

#### 14. Get All Characteristics

Récupérer toutes les caractéristiques disponibles.

**Endpoint:** `GET /characteristics`

`GET http://localhost:8082/api/listings/characteristics`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "char123",
    "name": "Surface habitable",
    "description": "Surface totale habitable en m²",
    "type": "NUMERIC",
    "unit": "m²",
    "category": "DIMENSIONS"
  },
  {
    "id": "char456",
    "name": "Vue mer",
    "description": "Vue sur la mer depuis la propriété",
    "type": "BOOLEAN",
    "category": "AMENITIES"
  }
]
```

---

#### 15. Create Characteristic

Créer une nouvelle caractéristique.

**Endpoint:** `POST /characteristics`

`POST http://localhost:8082/api/listings/characteristics`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Surface du jardin",
  "description": "Surface du jardin privatif en m²",
  "type": "NUMERIC",
  "unit": "m²",
  "category": "EXTERIOR"
}
```

**Types:**
- `NUMERIC` - Valeur numérique
- `BOOLEAN` - Oui/Non
- `TEXT` - Texte libre
- `LIST` - Liste de choix

**Response:** `201 Created`
```json
{
  "id": "char789",
  "name": "Surface du jardin",
  "description": "Surface du jardin privatif en m²",
  "type": "NUMERIC",
  "unit": "m²",
  "category": "EXTERIOR",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

---

#### 16. Get Characteristic By ID

Récupérer une caractéristique spécifique.

**Endpoint:** `GET /characteristics/{id}`

`GET http://localhost:8082/api/listings/characteristics/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "id": "char123",
  "name": "Surface habitable",
  "description": "Surface totale habitable en m²",
  "type": "NUMERIC",
  "unit": "m²",
  "category": "DIMENSIONS",
  "createdAt": "2026-01-09T10:00:00Z"
}
```

---

#### 17. Update Characteristic

Mettre à jour une caractéristique.

**Endpoint:** `PUT /characteristics/{id}`

`PUT http://localhost:8082/api/listings/characteristics/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Surface habitable (mise à jour)",
  "description": "Surface totale habitable en mètres carrés"
}
```

**Response:** `200 OK`
```json
{
  "id": "char123",
  "name": "Surface habitable (mise à jour)",
  "description": "Surface totale habitable en mètres carrés",
  "updatedAt": "2026-01-10T14:00:00Z"
}
```

---

#### 18. Delete Characteristic

Supprimer une caractéristique.

**Endpoint:** `DELETE /characteristics/{id}`

`DELETE http://localhost:8082/api/listings/characteristics/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "message": "Characteristic deleted successfully",
  "id": "char123"
}
```

---

### 🏷️ Type Characteristics Management

#### 19. Get All Type Characteristics

Récupérer tous les types de caractéristiques.

**Endpoint:** `GET /type-caracteristiques`

`GET http://localhost:8082/api/listings/type-caracteristiques`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "type123",
    "name": "Dimensions",
    "description": "Caractéristiques liées aux dimensions",
    "icon": "📏"
  },
  {
    "id": "type456",
    "name": "Équipements",
    "description": "Équipements et installations",
    "icon": "🛠️"
  }
]
```

---

#### 20. Create Type Characteristic

Créer un nouveau type de caractéristique.

**Endpoint:** `POST /type-caracteristiques`

`POST http://localhost:8082/api/listings/type-caracteristiques`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sécurité",
  "description": "Caractéristiques liées à la sécurité",
  "icon": "🔒"
}
```

**Response:** `201 Created`
```json
{
  "id": "type789",
  "name": "Sécurité",
  "description": "Caractéristiques liées à la sécurité",
  "icon": "🔒",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

---

#### 21. Get Type Characteristic By ID

Récupérer un type de caractéristique spécifique.

**Endpoint:** `GET /type-caracteristiques/{id}`

`GET http://localhost:8082/api/listings/type-caracteristiques/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "id": "type123",
  "name": "Dimensions",
  "description": "Caractéristiques liées aux dimensions",
  "icon": "📏",
  "characteristics": [
    {
      "id": "char123",
      "name": "Surface habitable"
    },
    {
      "id": "char456",
      "name": "Surface du terrain"
    }
  ]
}
```

---

### 👥 Owners Management

#### 22. Get All Owners

Récupérer la liste de tous les propriétaires.

**Endpoint:** `GET /owners`

`GET http://localhost:8082/api/listings/owners`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "userId": "owner123",
    "firstname": "Alice",
    "lastname": "Dupont",
    "email": "alice.dupont@example.com",
    "propertiesCount": 5,
    "totalRevenue": 12500.00,
    "averageRating": 4.5,
    "joinedDate": "2025-06-15T10:00:00Z"
  }
]
```

---

#### 23. Get Owner By ID

Récupérer les informations d'un propriétaire spécifique.

**Endpoint:** `GET /owners/{userId}`

`GET http://localhost:8082/api/listings/owners/{userId}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "userId": "owner123",
  "firstname": "Alice",
  "lastname": "Dupont",
  "email": "alice.dupont@example.com",
  "phone": "+33612345678",
  "city": "Paris",
  "country": "France",
  "propertiesCount": 5,
  "activePropertiesCount": 4,
  "totalBookings": 45,
  "totalRevenue": 12500.00,
  "averageRating": 4.5,
  "reviewsCount": 23,
  "joinedDate": "2025-06-15T10:00:00Z",
  "verified": true
}
```

---

#### 24. Check If User Is Owner

Vérifier si un utilisateur est propriétaire.

**Endpoint:** `GET /owners/check/{userId}`

`GET http://localhost:8082/api/listings/owners/check/{userId}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "userId": "owner123",
  "isOwner": true,
  "propertiesCount": 5
}
```

**Si pas owner:**
```json
{
  "userId": "user456",
  "isOwner": false,
  "propertiesCount": 0
}
```

---

## 📅 Booking Service (Port 8083)
**Base URL (via Gateway OBLIGATOIRE):** `http://localhost:8082/api/bookings`

### 📊 Résumé des Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/bookings` | Créer une réservation | ✅ |
| GET | `/bookings/{id}` | Détails d'une réservation | ✅ |
| GET | `/bookings/my-bookings` | Mes réservations | ✅ |
| PATCH | `/bookings/{id}/cancel` | Annuler une réservation | ✅ |

---

### 🎫 Bookings Management

#### 1. Create Booking

Créer une nouvelle réservation.

**Endpoint:** `POST /bookings`

`POST http://localhost:8082/api/bookings`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "propertyId": "prop123",
  "checkInDate": "2026-02-01",
  "checkOutDate": "2026-02-07",
  "numberOfGuests": 4,
  "guestDetails": {
    "firstName": "Jean",
    "lastName": "Martin",
    "email": "jean.martin@example.com",
    "phone": "+33612345678"
  },
  "specialRequests": "Arrivée tardive prévue vers 22h"
}
```

**Response:** `201 Created`
```json
{
  "id": "booking123",
  "propertyId": "prop123",
  "propertyTitle": "Appartement Moderne Paris",
  "userId": "user456",
  "checkInDate": "2026-02-01",
  "checkOutDate": "2026-02-07",
  "numberOfNights": 6,
  "numberOfGuests": 4,
  "pricePerNight": 250.00,
  "totalPrice": 1500.00,
  "status": "PENDING",
  "guestDetails": {
    "firstName": "Jean",
    "lastName": "Martin",
    "email": "jean.martin@example.com",
    "phone": "+33612345678"
  },
  "specialRequests": "Arrivée tardive prévue vers 22h",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

**Booking Status:**
- `PENDING` - En attente de paiement
- `CONFIRMED` - Confirmée (paiement reçu)
- `CANCELLED` - Annulée
- `COMPLETED` - Terminée

**Validations:**
- La propriété doit être ACTIVE
- Les dates ne doivent pas chevaucher d'autres réservations
- Le nombre de guests ne doit pas dépasser maxGuests de la propriété
- checkOutDate doit être après checkInDate

---

#### 2. Get Booking By ID

Récupérer les détails d'une réservation.

**Endpoint:** `GET /bookings/{id}`

`GET http://localhost:8082/api/bookings/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "id": "booking123",
  "propertyId": "prop123",
  "propertyTitle": "Appartement Moderne Paris",
  "propertyImage": "https://s3.amazonaws.com/...",
  "userId": "user456",
  "userName": "Jean Martin",
  "ownerId": "owner789",
  "ownerName": "Alice Dupont",
  "checkInDate": "2026-02-01",
  "checkOutDate": "2026-02-07",
  "numberOfNights": 6,
  "numberOfGuests": 4,
  "pricePerNight": 250.00,
  "totalPrice": 1500.00,
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "guestDetails": {
    "firstName": "Jean",
    "lastName": "Martin",
    "email": "jean.martin@example.com",
    "phone": "+33612345678"
  },
  "specialRequests": "Arrivée tardive prévue vers 22h",
  "createdAt": "2026-01-10T12:00:00Z",
  "confirmedAt": "2026-01-10T12:05:00Z"
}
```

---

#### 3. Get My Bookings

Récupérer toutes les réservations de l'utilisateur connecté.

**Endpoint:** `GET /bookings/my-bookings`

`GET http://localhost:8082/api/bookings/my-bookings`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters (Optionnels):**
- `status` - Filtrer par statut (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `upcoming` - Réservations à venir (true/false)
- `past` - Réservations passées (true/false)

**Example:**
```
GET /bookings/my-bookings?status=CONFIRMED&upcoming=true
```

**Response:** `200 OK`
```json
[
  {
    "id": "booking123",
    "propertyId": "prop123",
    "propertyTitle": "Appartement Moderne Paris",
    "propertyImage": "https://s3.amazonaws.com/...",
    "checkInDate": "2026-02-01",
    "checkOutDate": "2026-02-07",
    "numberOfNights": 6,
    "totalPrice": 1500.00,
    "status": "CONFIRMED",
    "canCancel": true
  },
  {
    "id": "booking456",
    "propertyId": "prop789",
    "propertyTitle": "Villa Côte d'Azur",
    "propertyImage": "https://s3.amazonaws.com/...",
    "checkInDate": "2026-03-15",
    "checkOutDate": "2026-03-22",
    "numberOfNights": 7,
    "totalPrice": 3150.00,
    "status": "PENDING",
    "canCancel": true
  }
]
```

---

#### 4. Cancel Booking

Annuler une réservation.

**Endpoint:** `PATCH /bookings/{id}/cancel`

`PATCH http://localhost:8082/api/bookings/{id}/cancel`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "cancellationReason": "Changement de plans de voyage"
}
```

**Response:** `200 OK`
```json
{
  "id": "booking123",
  "status": "CANCELLED",
  "cancellationReason": "Changement de plans de voyage",
  "cancelledAt": "2026-01-10T15:00:00Z",
  "refundAmount": 1500.00,
  "refundStatus": "PENDING"
}
```

**Politiques d'Annulation:**
- **Plus de 7 jours avant:** Remboursement complet (100%)
- **3-7 jours avant:** Remboursement partiel (50%)
- **Moins de 3 jours avant:** Pas de remboursement (0%)

**⚠️ Restrictions:**
- Seul le client ayant fait la réservation peut l'annuler
- Les réservations COMPLETED ne peuvent pas être annulées
- Les réservations déjà CANCELLED ne peuvent pas être re-annulées

---

## 💳 Payment Service (Port 8084)
**Base URL (via Gateway OBLIGATOIRE):** `http://localhost:8082/api/payments`

### 📊 Résumé des Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/payments/validate` | Valider un paiement | ✅ |
| GET | `/payments/booking/{bookingId}` | Paiements d'une réservation | ✅ |
| GET | `/payments/health` | Santé du service | ❌ |

---

### 💰 Payments Management

#### 1. Validate Payment

Valider un paiement pour une réservation.

**Endpoint:** `POST /payments/validate`

`POST http://localhost:8082/api/payments/payments/validate`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "bookingId": "booking123",
  "amount": 1500.00,
  "paymentMethod": "CRYPTO",
  "transactionHash": "0xabcdef123456789...",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Payment Methods:**
- `CRYPTO` - Paiement en cryptomonnaie (Ethereum)
- `CARD` - Carte bancaire
- `PAYPAL` - PayPal
- `BANK_TRANSFER` - Virement bancaire

**Response:** `200 OK`
```json
{
  "id": "payment123",
  "bookingId": "booking123",
  "amount": 1500.00,
  "currency": "EUR",
  "paymentMethod": "CRYPTO",
  "transactionHash": "0xabcdef123456789...",
  "status": "COMPLETED",
  "paidAt": "2026-01-10T12:05:00Z",
  "confirmation": {
    "bookingConfirmed": true,
    "receiptUrl": "https://s3.amazonaws.com/receipts/payment123.pdf"
  }
}
```

**Payment Status:**
- `PENDING` - En attente de confirmation blockchain
- `PROCESSING` - En cours de traitement
- `COMPLETED` - Paiement confirmé
- `FAILED` - Échec du paiement
- `REFUNDED` - Remboursé

**Notes:**
- Pour les paiements crypto, le transactionHash est vérifié sur la blockchain
- Un email de confirmation est envoyé au client
- La réservation passe automatiquement de PENDING à CONFIRMED

---

#### 2. Get Payments By Booking

Récupérer tous les paiements liés à une réservation.

**Endpoint:** `GET /payments/booking/{bookingId}`

`GET http://localhost:8082/api/payments/payments/booking/{bookingId}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "payment123",
    "bookingId": "booking123",
    "amount": 1500.00,
    "currency": "EUR",
    "paymentMethod": "CRYPTO",
    "transactionHash": "0xabcdef123456789...",
    "status": "COMPLETED",
    "paidAt": "2026-01-10T12:05:00Z"
  }
]
```

**Notes:**
- Une réservation peut avoir plusieurs paiements (paiement initial + paiements supplémentaires)
- Inclut aussi les remboursements s'ils existent

---

#### 3. Health Check

Vérifier la santé du service de paiement.

**Endpoint:** `GET /payments/health`

`GET http://localhost:8082/api/payments/payments/health`

**Headers:** Aucun requis

**Response:** `200 OK`
```json
{
  "status": "UP",
  "service": "payment-service",
  "timestamp": "2026-01-10T15:00:00Z",
  "dependencies": {
    "database": "UP",
    "blockchain": "UP",
    "rabbitmq": "UP"
  }
}
```

---

## 🌐 Gateway Service (Port 8082)

**Base URL:** `http://localhost:8082`

### 📊 Résumé des Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Santé du gateway | ❌ |
| GET | `/health/info` | Informations système | ❌ |

---

### 🏥 Health & Monitoring

#### 1. Gateway Health Check

Vérifier la santé globale du Gateway.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "UP",
  "components": {
    "authService": {
      "status": "UP",
      "url": "http://auth-service:8080"
    },
    "listingService": {
      "status": "UP",
      "url": "http://listing-service:8081"
    },
    "bookingService": {
      "status": "UP",
      "url": "http://booking-service:8083"
    },
    "paymentService": {
      "status": "UP",
      "url": "http://payment-service:8084"
    }
  }
}
```

---

#### 2. Gateway Information

Obtenir des informations sur le Gateway.

**Endpoint:** `GET /health/info`

**Response:** `200 OK`
```json
{
  "service": "API Gateway",
  "version": "1.0.0",
  "port": 8082,
  "uptime": "5 days 3 hours 21 minutes",
  "routes": {
    "auth": "/api/auth",
    "listing": "/api/listing",
    "booking": "/api/bookings",
    "payment": "/api/payments"
  },
  "corsEnabled": true,
  "corsOrigins": [
    "http://localhost:3000",
    "http://localhost:5173"
  ]
}
```

---

## ⚠️ Codes d'Erreur

### HTTP Status Codes

| Code | Signification | Description |
|------|---------------|-------------|
| **200** | OK | Succès |
| **201** | Created | Ressource créée |
| **204** | No Content | Succès sans contenu |
| **400** | Bad Request | Requête invalide |
| **401** | Unauthorized | Non authentifié |
| **403** | Forbidden | Accès refusé |
| **404** | Not Found | Ressource non trouvée |
| **409** | Conflict | Conflit (ex: email existant) |
| **500** | Internal Server Error | Erreur serveur |
| **503** | Service Unavailable | Service indisponible |

### Messages d'Erreur Courants

#### Auth Service

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Un utilisateur avec cet email existe déjà",
  "path": "/api/auth/users"
}
```

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Email ou mot de passe incorrect",
  "path": "/api/auth/users/login"
}
```

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Veuillez vérifier votre email avant de vous connecter",
  "path": "/api/auth/users/login"
}
```

#### Listing Service

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Propriété non trouvée",
  "path": "/api/listings/properties/prop999"
}
```

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Vous n'êtes pas autorisé à modifier cette propriété",
  "path": "/api/listings/properties/prop123"
}
```

#### Booking Service

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Ces dates ne sont pas disponibles pour cette propriété",
  "path": "/api/bookings"
}
```

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Le nombre de guests dépasse la capacité maximale de la propriété",
  "path": "/api/bookings"
}
```

#### Payment Service

```json
{
  "timestamp": "2026-01-10T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Transaction hash invalide ou non confirmée",
  "path": "/api/payments/payments/validate"
}
```

---

## 📘 Exemples d'Utilisation

### Flux Complet: Inscription → Connexion → Réservation → Paiement

#### Étape 1: S'inscrire

```bash
curl -X POST http://localhost:8082/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Jean",
    "lastname": "Martin",
    "email": "jean.martin@example.com",
    "password": "SecurePass123!",
    "phone": "+33612345678",
    "types": ["CLIENT"]
  }'
```

#### Étape 2: Vérifier l'email

```bash
curl -X POST http://localhost:8082/api/auth/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.martin@example.com",
    "code": "123456"
  }'
```

#### Étape 3: Se connecter

```bash
curl -v -X POST http://localhost:8082/api/auth/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.martin@example.com",
    "password": "SecurePass123!"
  }'
```

**Récupérer le token dans les headers de réponse:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
user_id: user123
```

#### Étape 4: Rechercher une propriété

```bash
curl -X GET "http://localhost:8082/api/listings/properties/search?city=Paris&minPrice=100&maxPrice=300" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: user123"
```

#### Étape 5: Créer une réservation

```bash
curl -X POST http://localhost:8082/api/bookings \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop123",
    "checkInDate": "2026-02-01",
    "checkOutDate": "2026-02-07",
    "numberOfGuests": 4,
    "guestDetails": {
      "firstName": "Jean",
      "lastName": "Martin",
      "email": "jean.martin@example.com",
      "phone": "+33612345678"
    }
  }'
```

**Réponse avec bookingId:**
```json
{
  "id": "booking123",
  "totalPrice": 1500.00,
  "status": "PENDING"
}
```

#### Étape 6: Effectuer le paiement

```bash
curl -X POST http://localhost:8082/api/payments/payments/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking123",
    "amount": 1500.00,
    "paymentMethod": "CRYPTO",
    "transactionHash": "0xabcdef123456789...",
    "walletAddress": "0x1234567890..."
  }'
```

#### Étape 7: Vérifier la réservation

```bash
curl -X GET http://localhost:8082/api/bookings/booking123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: user123"
```

---

### Flux Owner: Créer et Gérer une Propriété

#### Créer une propriété

```bash
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: owner123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement Moderne Paris",
    "description": "Magnifique appartement...",
    "propertyType": "APARTMENT",
    "address": "123 Avenue des Champs-Élysées",
    "city": "Paris",
    "country": "France",
    "pricePerNight": 250.00,
    "bedrooms": 3,
    "bathrooms": 2,
    "maxGuests": 6,
    "amenities": ["WIFI", "TV", "KITCHEN"]
  }'
```

#### Upload des images

```bash
curl -X POST http://localhost:8082/api/listings/properties/prop123/images \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: owner123" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg"
```

#### Voir mes propriétés

```bash
curl -X GET http://localhost:8082/api/listings/properties/my-properties \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "X-User-Id: owner123"
```

---

## 🔧 Configuration CORS (Résolu)

### ✅ Configuration Actuelle

CORS est maintenant configuré **uniquement au niveau du Gateway**:

**Origines autorisées:**
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)

**Headers autorisés:**
- `Authorization`
- `Content-Type`
- `X-Requested-With`
- `X-User-Id`

**Méthodes autorisées:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

**Credentials:** ✅ Activé

### 🚫 Services Backend

Les services Auth, Listing, Booking, et Payment ont leur configuration CORS **désactivée** pour éviter les duplications.

---

## 📝 Notes Importantes

### Sécurité

1. **Tokens JWT:** Expirent après 24 heures
2. **Refresh Tokens:** Non implémentés (à venir)
3. **Rate Limiting:** 100 requêtes par minute par IP
4. **CORS:** Strictement configuré pour localhost (dev) uniquement

### Best Practices

1. **Toujours utiliser HTTPS** en production
2. **Stocker les tokens de manière sécurisée** (httpOnly cookies recommandé)
3. **Valider les inputs** côté frontend avant d'envoyer
4. **Gérer les erreurs** de manière appropriée
5. **Utiliser la Gateway** pour toutes les requêtes (pas d'accès direct aux services)

### Environnement de Développement

- Frontend: `http://localhost:3000`
- Gateway: `http://localhost:8082`
- Services directs: À utiliser uniquement pour le debugging

---

## 📞 Support

Pour toute question ou problème:

1. Vérifiez que tous les services sont démarrés: `docker-compose ps`
2. Consultez les logs: `docker-compose logs -f [service-name]`
3. Testez le health check: `GET http://localhost:8082/health`

---

**Documentation mise à jour:** 10 Janvier 2026
**Version:** 2.0.0 (avec tous les endpoints manquants ajoutés)