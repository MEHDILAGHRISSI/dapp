# 📚 Documentation API Complète - Application de Location Décentralisée

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des Services](#architecture-des-services)
3. [Authentification](#authentification)
4. [Auth Service (Port 8080)](#auth-service-port-8080)
5. [Listing Service (Port 8081)](#listing-service-port-8081)
6. [Booking Service (Port 8083)](#booking-service-port-8083)
7. [Payment Service (Port 8084)](#payment-service-port-8084)
8. [Gateway Service (Port 8082)](#gateway-service-port-8082)
9. [Codes d'Erreur](#codes-derreur)
10. [Exemples de Requêtes](#exemples-de-requêtes)

---

## 📖 Vue d'ensemble

### Base URLs

| Service | URL Directe | URL via Gateway |
|---------|-------------|-----------------|
| **Auth Service** | `http://localhost:8080` | `http://localhost:8082/auth-service` |
| **Listing Service** | `http://localhost:8081` | `http://localhost:8082/listing-service` |
| **Booking Service** | `http://localhost:8083` | `http://localhost:8082/booking-service` |
| **Payment Service** | `http://localhost:8084` | `http://localhost:8082/payment-service` |
| **Gateway** | `http://localhost:8082` | - |

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
  "timestamp": "2026-01-09T12:00:00.000+00:00",
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
│                     Client / Frontend                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Gateway Service (Port 8082)                 │
│                  - Routing                               │
│                  - Load Balancing                        │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │               │
          ▼              ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │   Listing    │  │   Booking    │
│  Port 8080   │  │   Service    │  │   Service    │
│              │  │  Port 8081   │  │  Port 8083   │
└──────────────┘  └──────────────┘  └──────┬───────┘
                                            │
                                            ▼
                                   ┌──────────────┐
                                   │   Payment    │
                                   │   Service    │
                                   │  Port 8084   │
                                   └──────────────┘
                                            
┌─────────────────────────────────────────────────────────┐
│                    RabbitMQ (5672)                       │
│              Message Queue & Event Bus                   │
└─────────────────────────────────────────────────────────┘
```

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

---

## 🔑 Auth Service (Port 8080)

Base URL: `http://localhost:8080`

### 👤 User Management

#### 1. Register User

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /users`

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

---

#### 2. Login

Authentifier un utilisateur et obtenir un token JWT.

**Endpoint:** `POST /users/login`

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
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
user_id: abc123-def456
```

**Body:**
```json
{
  "userId": "abc123-def456",
  "email": "daar.chain@gmail.com",
  "firstname": "Admin",
  "lastname": "System"
}
```

**⚠️ Important:** Le token JWT est dans le **header** `Authorization`, pas dans le body!

---

#### 3. Get User By ID

Récupérer les informations d'un utilisateur.

**Endpoint:** `GET /users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
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
  "emailVerficationStatus": true,
  "walletAddress": "0x1234...",
  "types": ["CLIENT", "OWNER"],
  "roles": ["USER"]
}
```

---

#### 4. Update User

Mettre à jour les informations d'un utilisateur.

**Endpoint:** `PUT /users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "firstname": "Alice",
  "lastname": "Martin",
  "phone": "+33698765432",
  "address": "456 Avenue Montaigne",
  "city": "Paris"
}
```

**Response:** `200 OK`
```json
{
  "userId": "abc123-def456",
  "firstname": "Alice",
  "lastname": "Martin",
  "email": "alice.dupont@example.com",
  "phone": "+33698765432"
}
```

---

#### 5. Delete User

Supprimer un compte utilisateur.

**Endpoint:** `DELETE /users/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

### 📧 Email Verification

#### 6. Verify OTP

Vérifier le code OTP envoyé par email.

**Endpoint:** `POST /users/verify-otp`

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

---

#### 7. Resend OTP

Renvoyer un code OTP.

**Endpoint:** `POST /users/resend-otp?email={email}`

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

---

### 🔑 Password Management

#### 8. Forgot Password

Demander un code de réinitialisation de mot de passe.

**Endpoint:** `POST /users/forgot-password`

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

---

#### 9. Reset Password

Réinitialiser le mot de passe avec le code reçu.

**Endpoint:** `POST /users/reset-password`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice.dupont@example.com",
  "resetCode": "ABC123",
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

---

### 💰 Wallet Management

#### 10. Update Wallet Address

Mettre à jour l'adresse wallet Ethereum d'un utilisateur.

**Endpoint:** `PUT /users/{id}/wallet`

**Headers:**
```http
Authorization: Bearer {token}
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
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

---

#### 11. Get Wallet Status

Vérifier si un utilisateur a connecté son wallet.

**Endpoint:** `GET /users/{userId}/wallet/status`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "connected": true,
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

---

## 🏠 Listing Service (Port 8081)

Base URL: `http://localhost:8081`

### 🏢 Properties

#### 1. Create Property

Créer une nouvelle propriété.

**Endpoint:** `POST /properties`

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
- `APARTMENT`
- `HOUSE`
- `VILLA`
- `STUDIO`
- `ROOM`

**Amenities:**
- `WIFI`
- `TV`
- `KITCHEN`
- `WASHER`
- `DRYER`
- `AIR_CONDITIONING`
- `HEATING`
- `PARKING`
- `POOL`
- `GYM`
- `ELEVATOR`
- `BALCONY`
- `GARDEN`

**Response:** `201 Created`
```json
{
  "id": "prop123",
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
  "amenities": ["WIFI", "TV", "KITCHEN"],
  "images": [],
  "ownerId": "abc123",
  "status": "ACTIVE",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

#### 2. Get All Properties

Récupérer toutes les propriétés.

**Endpoint:** `GET /properties`

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
    "country": "France",
    "pricePerNight": 250.00,
    "bedrooms": 3,
    "images": ["https://..."],
    "status": "ACTIVE"
  },
  {
    "id": "prop456",
    "title": "Villa Côte d'Azur",
    "city": "Nice",
    "country": "France",
    "pricePerNight": 450.00,
    "bedrooms": 5,
    "images": ["https://..."],
    "status": "ACTIVE"
  }
]
```

---

#### 3. Get Property By ID

Récupérer une propriété par son ID.

**Endpoint:** `GET /properties/{id}`

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
  "description": "Magnifique appartement au cœur de Paris...",
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
  "images": ["https://s3.amazonaws.com/..."],
  "ownerId": "abc123",
  "status": "ACTIVE",
  "createdAt": "2026-01-09T12:00:00Z",
  "updatedAt": "2026-01-09T12:00:00Z"
}
```

---

#### 4. Get My Properties

Récupérer les propriétés de l'utilisateur connecté.

**Endpoint:** `GET /properties/my-properties`

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
    "bookingsCount": 5
  }
]
```

---

#### 5. Search Properties

Rechercher des propriétés avec des filtres.

**Endpoint:** `GET /properties/search`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters:**
- `city` (optional): Ville
- `country` (optional): Pays
- `propertyType` (optional): Type de propriété
- `minPrice` (optional): Prix minimum par nuit
- `maxPrice` (optional): Prix maximum par nuit
- `bedrooms` (optional): Nombre de chambres minimum
- `bathrooms` (optional): Nombre de salles de bain minimum
- `maxGuests` (optional): Nombre de personnes minimum

**Example:**
```
GET /properties/search?city=Paris&minPrice=100&maxPrice=300&bedrooms=2&propertyType=APARTMENT
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "city": "Paris",
    "pricePerNight": 250.00,
    "bedrooms": 3,
    "propertyType": "APARTMENT"
  }
]
```

---

#### 6. Find Nearby Properties

Trouver des propriétés à proximité (géolocalisation).

**Endpoint:** `GET /properties/nearby`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `radius` (optional): Rayon en km (défaut: 10)

**Example:**
```
GET /properties/nearby?latitude=48.8566&longitude=2.3522&radius=5
```

**Response:** `200 OK`
```json
[
  {
    "id": "prop123",
    "title": "Appartement Moderne Paris",
    "distance": 2.3,
    "city": "Paris",
    "pricePerNight": 250.00
  }
]
```

---

#### 7. Update Property

Mettre à jour une propriété.

**Endpoint:** `PUT /properties/{id}`

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
  "pricePerNight": 275.00,
  "description": "Appartement entièrement rénové avec équipements neufs"
}
```

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "title": "Appartement Moderne Paris - Rénové",
  "pricePerNight": 275.00,
  "updatedAt": "2026-01-09T14:00:00Z"
}
```

---

#### 8. Update Property Status

Changer le statut d'une propriété (actif/inactif).

**Endpoint:** `PATCH /properties/{id}/status`

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
- `ACTIVE`
- `INACTIVE`
- `PENDING`

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "status": "INACTIVE",
  "updatedAt": "2026-01-09T14:00:00Z"
}
```

---

#### 9. Delete Property

Supprimer une propriété.

**Endpoint:** `DELETE /properties/{id}`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully"
}
```

---

### 🖼️ Property Images

#### 10. Upload Property Images

Uploader des images pour une propriété.

**Endpoint:** `POST /properties/{propertyId}/images`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: multipart/form-data
```

**Body:** (form-data)
- `files`: Images (max 10 fichiers, 5MB chacun)

**Response:** `200 OK`
```json
{
  "propertyId": "prop123",
  "images": [
    "https://s3.amazonaws.com/bucket/image1.jpg",
    "https://s3.amazonaws.com/bucket/image2.jpg"
  ]
}
```

---

#### 11. Delete Property Image

Supprimer une image d'une propriété.

**Endpoint:** `DELETE /properties/{propertyId}/images`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://s3.amazonaws.com/bucket/image1.jpg"
}
```

**Response:** `200 OK`
```json
{
  "message": "Image deleted successfully"
}
```

---

### 👤 Owners

#### 12. Create Owner

Créer un profil propriétaire.

**Endpoint:** `POST /owners`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "abc123",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:** `201 Created`
```json
{
  "id": "owner123",
  "userId": "abc123",
  "walletAddress": "0x1234...",
  "propertiesCount": 0,
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

#### 13. Get Owner By User ID

Récupérer un propriétaire par son userId.

**Endpoint:** `GET /owners/{userId}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "owner123",
  "userId": "abc123",
  "walletAddress": "0x1234...",
  "propertiesCount": 3,
  "totalEarnings": 15000.00
}
```

---

#### 14. Check Owner Exists

Vérifier si un owner existe pour un userId.

**Endpoint:** `GET /owners/check/{userId}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "exists": true,
  "ownerId": "owner123"
}
```

---

#### 15. Get All Owners

Récupérer tous les propriétaires.

**Endpoint:** `GET /owners`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "owner123",
    "userId": "abc123",
    "propertiesCount": 3,
    "totalEarnings": 15000.00
  }
]
```

---

#### 16. Get Owner Property Count

Compter les propriétés d'un owner.

**Endpoint:** `GET /properties/owner/{ownerId}/count`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "ownerId": "owner123",
  "propertiesCount": 3
}
```

---

### 📝 Reviews

#### 17. Create Review

Créer un avis sur une propriété.

**Endpoint:** `POST /reviews`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "propertyId": "prop123",
  "tenantId": "abc123",
  "rating": 5,
  "comment": "Excellent séjour ! L'appartement était exactement comme décrit."
}
```

**Response:** `201 Created`
```json
{
  "id": "review123",
  "propertyId": "prop123",
  "tenantId": "abc123",
  "rating": 5,
  "comment": "Excellent séjour !...",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

#### 18. Get All Reviews

Récupérer tous les avis.

**Endpoint:** `GET /reviews`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "review123",
    "propertyId": "prop123",
    "rating": 5,
    "comment": "Excellent séjour !",
    "tenantName": "Alice Dupont",
    "createdAt": "2026-01-09T12:00:00Z"
  }
]
```

---

#### 19. Get Review By ID

Récupérer un avis par son ID.

**Endpoint:** `GET /reviews/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "review123",
  "propertyId": "prop123",
  "tenantId": "abc123",
  "rating": 5,
  "comment": "Excellent séjour ! L'appartement était exactement comme décrit. Très propre et bien situé.",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

---

## 📅 Booking Service (Port 8083)

Base URL: `http://localhost:8083`

### 📆 Bookings

#### 1. Create Booking

Créer une réservation.

**Endpoint:** `POST /bookings`

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
  "startDate": "2026-03-01",
  "endDate": "2026-03-08",
  "pricePerNight": 250.00,
  "currency": "EUR",
  "tenantWalletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:** `201 Created`
```json
{
  "id": "booking123",
  "propertyId": "prop123",
  "tenantId": "abc123",
  "startDate": "2026-03-01",
  "endDate": "2026-03-08",
  "pricePerNight": 250.00,
  "totalPrice": 1750.00,
  "currency": "EUR",
  "status": "PENDING",
  "tenantWalletAddress": "0x1234...",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

**Booking Status:**
- `PENDING` - En attente de paiement
- `CONFIRMED` - Confirmée et payée
- `COMPLETED` - Terminée
- `CANCELLED` - Annulée

---

#### 2. Get My Bookings

Récupérer les réservations de l'utilisateur connecté.

**Endpoint:** `GET /bookings/my-bookings`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
[
  {
    "id": "booking123",
    "propertyId": "prop123",
    "propertyTitle": "Appartement Moderne Paris",
    "startDate": "2026-03-01",
    "endDate": "2026-03-08",
    "totalPrice": 1750.00,
    "status": "PENDING",
    "createdAt": "2026-01-09T12:00:00Z"
  }
]
```

---

#### 3. Get Booking By ID

Récupérer une réservation par son ID.

**Endpoint:** `GET /bookings/{id}`

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
  "tenantId": "abc123",
  "startDate": "2026-03-01",
  "endDate": "2026-03-08",
  "pricePerNight": 250.00,
  "totalPrice": 1750.00,
  "currency": "EUR",
  "status": "CONFIRMED",
  "tenantWalletAddress": "0x1234...",
  "createdAt": "2026-01-09T12:00:00Z",
  "updatedAt": "2026-01-09T13:00:00Z"
}
```

---

#### 4. Cancel Booking

Annuler une réservation.

**Endpoint:** `PATCH /bookings/{bookingId}/cancel`

**Headers:**
```http
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response:** `200 OK`
```json
{
  "id": "booking123",
  "status": "CANCELLED",
  "updatedAt": "2026-01-09T14:00:00Z"
}
```

---

### 🔗 Internal Endpoints (For Inter-Service Communication)

#### 5. Get Property Details

(Utilisé en interne par Booking Service pour vérifier les propriétés)

**Endpoint:** `GET /bookings/properties/{id}`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "prop123",
  "title": "Appartement Moderne Paris",
  "pricePerNight": 250.00,
  "available": true
}
```

---

#### 6. Get User Wallet Status

(Utilisé en interne pour vérifier le wallet)

**Endpoint:** `GET /bookings/users/{userId}/wallet/status`

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "connected": true,
  "walletAddress": "0x1234..."
}
```

---

## 💳 Payment Service (Port 8084)

Base URL: `http://localhost:8084`

### 💰 Payments

#### 1. Validate Payment

Valider un paiement blockchain.

**Endpoint:** `POST /payments/validate`

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
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "amount": 1750.00,
  "currency": "EUR",
  "payerAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:** `201 Created`
```json
{
  "id": "payment123",
  "bookingId": "booking123",
  "transactionHash": "0xabcdef...",
  "amount": 1750.00,
  "currency": "EUR",
  "status": "CONFIRMED",
  "payerAddress": "0x1234...",
  "createdAt": "2026-01-09T12:00:00Z"
}
```

**Payment Status:**
- `PENDING` - En attente de confirmation blockchain
- `CONFIRMED` - Confirmé sur la blockchain
- `FAILED` - Échoué
- `REFUNDED` - Remboursé

---

#### 2. Get Payments By Booking ID

Récupérer les paiements d'une réservation.

**Endpoint:** `GET /payments/booking/{bookingId}`

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
    "transactionHash": "0xabcdef...",
    "amount": 1750.00,
    "currency": "EUR",
    "status": "CONFIRMED",
    "createdAt": "2026-01-09T12:00:00Z"
  }
]
```

---

#### 3. Health Check

Vérifier l'état du service de paiement.

**Endpoint:** `GET /payments/health`

**Response:** `200 OK`
```json
{
  "status": "UP",
  "service": "payment-service",
  "timestamp": "2026-01-09T12:00:00Z"
}
```

---

## 🌐 Gateway Service (Port 8082)

Base URL: `http://localhost:8082`

### 🚪 Gateway Endpoints

#### 1. Gateway Health Check

Vérifier l'état de la gateway.

**Endpoint:** `GET /`

**Response:** `200 OK`
```json
{
  "status": "UP",
  "service": "gateway-service",
  "version": "1.0.0"
}
```

---

#### 2. Gateway Info

Obtenir des informations sur la gateway.

**Endpoint:** `GET /info`

**Response:** `200 OK`
```json
{
  "service": "API Gateway",
  "version": "1.0.0",
  "routes": [
    {
      "path": "/auth-service/**",
      "target": "http://auth-service:8080"
    },
    {
      "path": "/listing-service/**",
      "target": "http://listing-service:8081"
    },
    {
      "path": "/booking-service/**",
      "target": "http://booking-service:8083"
    },
    {
      "path": "/payment-service/**",
      "target": "http://payment-service:8084"
    }
  ]
}
```

---

### 🔀 Routing via Gateway

Tous les endpoints des microservices sont accessibles via la gateway:

**Format:** `http://localhost:8082/{service-name}/{endpoint}`

**Examples:**

```http
# Auth Service via Gateway
POST http://localhost:8082/auth-service/users/login

# Listing Service via Gateway
GET http://localhost:8082/listing-service/properties

# Booking Service via Gateway
POST http://localhost:8082/booking-service/bookings

# Payment Service via Gateway
GET http://localhost:8082/payment-service/payments/booking/{bookingId}
```

---

## ❌ Codes d'Erreur

### HTTP Status Codes

| Code | Signification | Description |
|------|---------------|-------------|
| **200** | OK | Requête réussie |
| **201** | Created | Ressource créée avec succès |
| **400** | Bad Request | Requête invalide (données manquantes/incorrectes) |
| **401** | Unauthorized | Token manquant ou invalide |
| **403** | Forbidden | Accès refusé (permissions insuffisantes) |
| **404** | Not Found | Ressource non trouvée |
| **409** | Conflict | Conflit (ex: email déjà existant) |
| **500** | Internal Server Error | Erreur serveur |

### Erreurs Communes

#### 1. Token Manquant

```json
{
  "timestamp": "2026-01-09T12:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

#### 2. X-User-Id Manquant

```json
{
  "timestamp": "2026-01-09T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Required request header 'X-User-Id' is not present"
}
```

#### 3. Email Déjà Existant

```json
{
  "timestamp": "2026-01-09T12:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

#### 4. Propriété Non Trouvée

```json
{
  "timestamp": "2026-01-09T12:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Property not found with id: prop123"
}
```

#### 5. Validation Échouée

```json
{
  "timestamp": "2026-01-09T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## 📋 Exemples de Requêtes

### Exemple 1: Workflow Complet

```bash
# 1. Créer un compte
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Alice",
    "lastname": "Dupont",
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "types": ["CLIENT"]
  }'

# 2. Se connecter
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }' \
  -i  # Affiche les headers (token)

# 3. Récupérer les propriétés
curl -X GET http://localhost:8081/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID"

# 4. Créer une réservation
curl -X POST http://localhost:8083/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop123",
    "startDate": "2026-03-01",
    "endDate": "2026-03-08",
    "pricePerNight": 250.00,
    "currency": "EUR",
    "tenantWalletAddress": "0x1234..."
  }'

# 5. Valider le paiement
curl -X POST http://localhost:8084/payments/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking123",
    "transactionHash": "0xabc...",
    "amount": 1750.00,
    "currency": "EUR",
    "payerAddress": "0x1234..."
  }'
```

### Exemple 2: Utiliser la Gateway

```bash
# Toutes les requêtes via la gateway (port 8082)
curl -X POST http://localhost:8082/auth-service/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "SecurePass123!"}'

curl -X GET http://localhost:8082/listing-service/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID"
```

---

## 🔗 Liens Utiles

- **Collection Postman:** Voir `COMPLETE-Rental-App-FIXED.postman_collection.json`
- **Guide d'utilisation Postman:** Voir `GUIDE-COMPLET-POSTMAN.md`
- **Documentation Frontend:** Voir `FRONTEND-DOCUMENTATION-COMPLETE.md`

---

**📚 Documentation mise à jour le 09 janvier 2026**

**Version:** 1.0.0
