# 📅 BOOKING SERVICE - Documentation Frontend (CORRIGÉE v2.0)

**Base URL** : `http://localhost:8082/api/bookings`

> ⚠️ **Version corrigée** - Cette documentation reflète exactement le code source du backend.

---

## 📊 Schéma Base de Données

### Table: `bookings`

| Champ | Type | Description | Obligatoire | Unique |
|-------|------|-------------|-------------|--------|
| `id` | Long | ID auto-incrémenté | ✅ | ✅ |
| `propertyId` | **Long** | **ID de la propriété (pas UUID)** | ✅ | ❌ |
| `tenantId` | String(255) | UUID du locataire | ✅ | ❌ |
| `startDate` | Date | Date début (check-in) | ✅ | ❌ |
| `endDate` | Date | Date fin (check-out) | ✅ | ❌ |
| `status` | Enum | Statut de la réservation | ✅ | ❌ |
| `tenantWalletAddress` | String(42) | Wallet du locataire (snapshot) | ✅ | ❌ |
| `pricePerNight` | Decimal(19,2) | Prix par nuit (snapshot) | ✅ | ❌ |
| `totalPrice` | Decimal(19,2) | Prix total (calculé) | ✅ | ❌ |
| `currency` | String(10) | Devise (USD, MAD, etc.) | ✅ | ❌ |
| `createdAt` | DateTime | Date de création | ✅ | ❌ |
| `updatedAt` | DateTime | Dernière modification | ✅ | ❌ |

---

## 📋 Enum BookingStatus

> ⚠️ **IMPORTANT** : Le statut `PENDING` existe dans l'enum mais **n'est jamais utilisé** dans le code actuel.

```
PENDING          → ⚠️ Non utilisé (état transitoire théorique)
AWAITING_PAYMENT → En attente de paiement (15 min timeout)
CONFIRMED        → Paiement validé
CANCELLED        → Annulation manuelle
EXPIRED          → Timeout de paiement
```

### Machine à États RÉELLE

```
         ┌─────────────────────────────────────┐
         │     CRÉER BOOKING (POST)            │
         └──────────────┬──────────────────────┘
                        │ (Validation OK)
                        ▼
           ┌────────────────────────┐
           │   AWAITING_PAYMENT     │  (15 min timeout)
           └────┬──────────┬────────┘
                │          │
      (Paiement)│          │(Timeout/Annulation)
                ▼          ▼
          ┌──────────┐  ┌──────────┐
          │CONFIRMED │  │ EXPIRED  │
          └──────────┘  │CANCELLED │
                        └──────────┘
```

### Statuts

| Statut | Description | Durée | Actions Possibles |
|--------|-------------|-------|-------------------|
| `PENDING` | ⚠️ **Non utilisé** | - | - |
| `AWAITING_PAYMENT` | Snapshot pris, en attente paiement | 15 min | Payer, Annuler |
| `CONFIRMED` | Paiement validé | Permanent | Annuler (si futur) |
| `CANCELLED` | Annulée manuellement | Permanent | Aucune |
| `EXPIRED` | Timeout de paiement (auto) | Permanent | Aucune |

---

## 🔒 Endpoints Protégés

**Tous les endpoints nécessitent un JWT**

```http
Authorization: Bearer <token>
```

---

### 1. Créer une Réservation

**Créer une nouvelle réservation**

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "propertyId": 1,
  "startDate": "2026-02-01",
  "endDate": "2026-02-05"
}
```

**⚠️ ATTENTION - Changements par rapport à la doc initiale** :
- `propertyId` : **Long** (ex: 1, 2, 3), **PAS UUID** ❗
- `checkInDate` n'existe pas → Utiliser `startDate`
- `checkOutDate` n'existe pas → Utiliser `endDate`
- `numberOfGuests` n'existe pas → Supprimé

**Validation**
- `propertyId` : Long requis, doit exister et être `ACTIVE`
- `startDate` : Date requise, doit être dans le futur
- `endDate` : Date requise, doit être après `startDate`
- Utilisateur doit avoir un wallet connecté

**Response 201 Created**
```json
{
  "id": 1,
  "propertyId": 1,
  "tenantId": "660e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "status": "AWAITING_PAYMENT",
  "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "pricePerNight": 1500.00,
  "totalPrice": 6000.00,
  "currency": "MAD",
  "createdAt": "2026-01-11T10:30:00",
  "updatedAt": "2026-01-11T10:30:00"
}
```

**⚠️ Champs NON retournés** (calculs frontend) :
- `numberOfNights` : Calculer `(endDate - startDate)` côté frontend
- `expiresAt` : Calculer `createdAt + 15 minutes` côté frontend

**Response 400 Bad Request**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Start date must be in the future"
}
```

**Response 409 Conflict**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Property already booked for these dates"
}
```

**Response 403 Forbidden**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 400,
  "error": "Wallet Not Connected",
  "message": "You must connect your wallet before creating a booking. Please go to your profile settings and connect your Web3 wallet (MetaMask, etc.)"
}
```

**Logique Métier**

1. **Récupération Informations Utilisateur**
   - Extraction `tenantId` depuis JWT (X-User-Id)
   - Appel synchrone Auth Service pour récupérer wallet :
     ```http
     GET http://auth-service:8080/users/{tenantId}/wallet/status
     ```
   - Si pas de wallet → Erreur 400

2. **Validation Propriété**
   - Appel synchrone Listing Service :
     ```http
     GET http://listing-service:8081/properties/{propertyId}
     ```
   - Vérification status = `ACTIVE`
   - Récupération `pricePerNight`

3. **Vérification Disponibilité**
   ```sql
   SELECT COUNT(*) FROM bookings 
   WHERE propertyId = ? 
   AND status IN ('AWAITING_PAYMENT', 'CONFIRMED')
   AND (
     (startDate <= ? AND endDate > ?) OR
     (startDate < ? AND endDate >= ?) OR
     (startDate >= ? AND endDate <= ?)
   )
   ```
   Si count > 0 → Refusé (409 Conflict)

4. **Création Booking** (Status: AWAITING_PAYMENT directement)
   - Calcul `totalPrice = pricePerNight * (endDate - startDate)`
   - Sauvegarde snapshot immutable :
     - `pricePerNight`
     - `tenantWalletAddress`
   - Status : **`AWAITING_PAYMENT`** (pas PENDING !)
   - Génération timestamp expiration interne (now + 15 min)

5. **Retour Frontend**
   - Frontend reçoit booking avec `createdAt`
   - Frontend calcule `expiresAt = createdAt + 15 min`
   - Frontend doit initier paiement avant expiration

---

### 2. Mes Réservations

**Récupérer toutes les réservations du locataire connecté**

```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "propertyId": 1,
    "tenantId": "660e8400-e29b-41d4-a716-446655440000",
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "status": "CONFIRMED",
    "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "pricePerNight": 1500.00,
    "totalPrice": 6000.00,
    "currency": "MAD",
    "createdAt": "2026-01-11T10:30:00",
    "updatedAt": "2026-01-11T10:32:00"
  },
  {
    "id": 2,
    "propertyId": 3,
    "tenantId": "660e8400-e29b-41d4-a716-446655440000",
    "startDate": "2026-03-15",
    "endDate": "2026-03-20",
    "status": "AWAITING_PAYMENT",
    "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "pricePerNight": 500.00,
    "totalPrice": 2500.00,
    "currency": "MAD",
    "createdAt": "2026-01-11T11:00:00",
    "updatedAt": "2026-01-11T11:00:00"
  }
]
```

**⚠️ IMPORTANT** : Le service ne retourne **PAS** les détails de propriété !

Les champs suivants **n'existent pas** dans la réponse :
- ❌ `propertyTitle`
- ❌ `propertyAddress`
- ❌ `propertyImage`
- ❌ `expiresAt`
- ❌ `numberOfNights`

**Enrichissement Frontend REQUIS** :

```javascript
const bookings = await fetch('/api/bookings/my-bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const enrichedBookings = await Promise.all(
  bookings.map(async (booking) => {
    // 1. Récupérer détails propriété
    const property = await fetch(
      `/api/listings/properties/${booking.propertyId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // 2. Calculer champs dérivés
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const created = new Date(booking.createdAt);
    const expiresAt = new Date(created.getTime() + 15 * 60 * 1000);
    
    return {
      ...booking,
      propertyTitle: property.title,
      propertyAddress: property.addressName,
      propertyImage: property.images[0],
      numberOfNights,
      expiresAt: expiresAt.toISOString()
    };
  })
);
```

**Logique Métier**
- Retourne TOUTES les réservations (tous statuts)
- Tri par date de création décroissante
- Utilisateur connecté extrait du JWT (X-User-Id)

---

### 3. Détails d'une Réservation

**Récupérer une réservation spécifique**

```http
GET /api/bookings/{bookingId}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "id": 1,
  "propertyId": 1,
  "tenantId": "660e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "status": "CONFIRMED",
  "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "pricePerNight": 1500.00,
  "totalPrice": 6000.00,
  "currency": "MAD",
  "createdAt": "2026-01-11T10:30:00",
  "updatedAt": "2026-01-11T10:32:00"
}
```

**Response 403 Forbidden**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You are not authorized to view this booking"
}
```

**Logique Métier**
- Seul le locataire peut voir sa réservation
- Vérification que `tenantId` == userId du JWT
- Même limitation : pas de détails propriété

---

### 4. Annuler une Réservation

**Annuler une réservation existante**

```http
PATCH /api/bookings/{bookingId}/cancel
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "id": 1,
  "status": "CANCELLED",
  "message": "Booking cancelled successfully"
}
```

**Response 400 Bad Request**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot cancel booking: Check-in date has passed"
}
```

**Response 403 Forbidden**
```json
{
  "timestamp": "2026-01-11T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You are not authorized to cancel this booking"
}
```

**Logique Métier**

**Conditions d'annulation** :
1. L'utilisateur doit être le locataire
2. Status doit être `AWAITING_PAYMENT` ou `CONFIRMED`
3. Pour `CONFIRMED` : `startDate` doit être dans le futur

**Workflow** :
- Status → `CANCELLED`
- Les dates redeviennent disponibles pour d'autres réservations
- Pas de remboursement automatique (géré manuellement si nécessaire)

---

### 5. Compter Réservations Actives (Client)

**Compter les réservations actives de l'utilisateur en tant que client**

```http
GET /api/bookings/client/{userId}/active-count
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "count": 2,
  "userId": "660e8400-e29b-41d4-a716-446655440000",
  "message": "User has active bookings as client"
}
```

**Logique Métier**
- Compte les réservations avec status : `CONFIRMED`, `AWAITING_PAYMENT`
- **Exclut** : `CANCELLED`, `EXPIRED`, `PENDING`
- Utilisé par Auth Service pour validation déconnexion wallet
- Si count > 0 → Impossible de déconnecter le wallet

---

### 6. Compter Réservations Futures (Hôte)

**⚠️ LIMITATION ACTUELLE - Endpoint Partiellement Implémenté**

```http
GET /api/bookings/host/{userId}/future-count
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "count": 0,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "No future host bookings found"
}
```

**⚠️ AVERTISSEMENT IMPORTANT**

Cette fonctionnalité n'est **pas complètement implémentée**. Le endpoint retourne **toujours `count: 0`**.

**Raison Technique** :
- La table `bookings` stocke uniquement `propertyId` (Long)
- Pas de relation directe avec `Property` ou `Owner`
- Impossible de filtrer par `ownerId` sans jointure complexe

**Impact** :
- Les hôtes peuvent toujours déconnecter leur wallet même avec réservations futures
- Contrainte métier non respectée

**Contournement Temporaire** :
```javascript
// ⚠️ Frontend peut implémenter la vérification
const hostProperties = await fetch('/api/listings/properties/my-properties');
const propertyIds = hostProperties.map(p => p.id);

const allBookings = await fetch('/api/bookings/all'); // Endpoint admin
const futureHostBookings = allBookings.filter(booking => 
  propertyIds.includes(booking.propertyId) &&
  booking.status === 'CONFIRMED' &&
  new Date(booking.startDate) > new Date()
);

if (futureHostBookings.length > 0) {
  alert("Cannot disconnect wallet: You have future bookings as host");
}
```

**Status** : 🚧 En cours de développement

---

## ⏱️ Système d'Expiration Automatique

### Scheduler (Backend)

Un job automatique s'exécute toutes les **2 minutes** :

```java
@Scheduled(fixedDelay = 120000) // 120000ms = 2 minutes
public void expireBookings() {
    LocalDateTime expirationThreshold = LocalDateTime.now().minus(15, ChronoUnit.MINUTES);
    
    List<Booking> expiredBookings = bookingRepository
        .findByStatusAndCreatedAtBefore(
            BookingStatus.AWAITING_PAYMENT, 
            expirationThreshold
        );
    
    expiredBookings.forEach(booking -> {
        booking.setStatus(BookingStatus.EXPIRED);
        bookingRepository.save(booking);
    });
    
    log.info("Expired {} bookings", expiredBookings.size());
}
```

**Logique** :
- Toutes les 2 minutes, cherche bookings avec :
  - `status = AWAITING_PAYMENT`
  - `createdAt < (now - 15 minutes)`
- Change leur status vers `EXPIRED`

### Frontend : Afficher le Compte à Rebours

```javascript
const calculateTimeLeft = (createdAt) => {
  const created = new Date(createdAt);
  const expires = new Date(created.getTime() + 15 * 60 * 1000);
  const now = new Date();
  const timeLeft = expires - now;
  
  if (timeLeft <= 0) {
    return { expired: true, minutes: 0, seconds: 0 };
  }
  
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  return { expired: false, minutes, seconds };
};

// Utilisation
const { expired, minutes, seconds } = calculateTimeLeft(booking.createdAt);

if (expired) {
  console.log("⚠️ Réservation expirée");
} else {
  console.log(`⏰ Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`);
}
```

---

## 🎯 Cas d'Usage Frontend CORRIGÉS

### Workflow Complet de Réservation

```javascript
// ===== ÉTAPE 1: Vérifier Wallet =====
const walletCheck = await fetch(
  `http://localhost:8082/api/auth/users/${userId}/wallet/status`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { exists } = await walletCheck.json();

if (!exists) {
  alert("Veuillez connecter votre wallet MetaMask");
  window.location.href = '/profile/wallet';
  return;
}

// ===== ÉTAPE 2: Créer la Réservation =====
const bookingData = {
  propertyId: 1,  // ⚠️ Long, pas UUID !
  startDate: "2026-02-01",  // ⚠️ startDate, pas checkInDate !
  endDate: "2026-02-05"     // ⚠️ endDate, pas checkOutDate !
  // ⚠️ PAS de numberOfGuests !
};

const bookingResponse = await fetch(
  'http://localhost:8082/api/bookings',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  }
);

if (!bookingResponse.ok) {
  const error = await bookingResponse.json();
  alert(error.message);
  return;
}

const booking = await bookingResponse.json();
console.log("Booking créé:", booking);
// booking.status = "AWAITING_PAYMENT"
// booking.id = 1
// booking.propertyId = 1 (Long)
// booking.totalPrice = 6000.00

// ===== ÉTAPE 3: Calculer Champs Dérivés =====
const start = new Date(booking.startDate);
const end = new Date(booking.endDate);
const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

const created = new Date(booking.createdAt);
const expiresAt = new Date(created.getTime() + 15 * 60 * 1000);

console.log(`Nuits: ${numberOfNights}`);
console.log(`Prix: ${booking.totalPrice} ${booking.currency}`);
console.log(`Expire à: ${expiresAt.toISOString()}`);

// ===== ÉTAPE 4: Afficher Page Paiement =====
// Afficher:
// - Récapitulatif booking
// - Prix total: 6000 MAD
// - Timer: 15:00 (compte à rebours)
// - Bouton "Payer avec MetaMask"

// Démarrer timer
const timerInterval = setInterval(() => {
  const { expired, minutes, seconds } = calculateTimeLeft(booking.createdAt);
  
  if (expired) {
    clearInterval(timerInterval);
    alert("⚠️ Temps expiré ! Votre réservation a été annulée.");
    window.location.href = '/properties';
  } else {
    document.getElementById('timer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}, 1000);

// ===== ÉTAPE 5: Paiement Blockchain (voir PAYMENT_SERVICE.md) =====
// ... Suite dans la doc Payment Service
```

---

### Afficher Liste de Réservations avec Détails

```javascript
// ===== ÉTAPE 1: Récupérer Bookings =====
const response = await fetch(
  'http://localhost:8082/api/bookings/my-bookings',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const bookings = await response.json();

// ===== ÉTAPE 2: Enrichir avec Détails Propriétés =====
const enrichedBookings = await Promise.all(
  bookings.map(async (booking) => {
    try {
      // Récupérer détails propriété
      const propertyResponse = await fetch(
        `http://localhost:8082/api/listings/properties/${booking.propertyId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!propertyResponse.ok) {
        throw new Error('Property not found');
      }
      
      const property = await propertyResponse.json();
      
      // Calculer champs dérivés
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      const created = new Date(booking.createdAt);
      const expiresAt = new Date(created.getTime() + 15 * 60 * 1000);
      const { expired, minutes, seconds } = calculateTimeLeft(booking.createdAt);
      
      return {
        ...booking,
        // Détails propriété
        propertyTitle: property.title,
        propertyAddress: property.addressName,
        propertyImage: property.images[0] || '/default-property.jpg',
        propertyCity: property.city,
        // Champs calculés
        numberOfNights,
        expiresAt: expiresAt.toISOString(),
        timeLeft: expired ? null : { minutes, seconds }
      };
    } catch (error) {
      console.error(`Error enriching booking ${booking.id}:`, error);
      return {
        ...booking,
        propertyTitle: 'Propriété indisponible',
        propertyImage: '/default-property.jpg'
      };
    }
  })
);

console.log("Bookings enrichis:", enrichedBookings);

// ===== ÉTAPE 3: Afficher dans l'UI =====
enrichedBookings.forEach(booking => {
  const card = document.createElement('div');
  card.className = 'booking-card';
  
  let statusBadge = '';
  switch (booking.status) {
    case 'CONFIRMED':
      statusBadge = '<span class="badge badge-success">Confirmée</span>';
      break;
    case 'AWAITING_PAYMENT':
      statusBadge = `<span class="badge badge-warning">
        En attente - ${booking.timeLeft ? 
          `${booking.timeLeft.minutes}:${booking.timeLeft.seconds.toString().padStart(2, '0')}` : 
          'Expiré'}
      </span>`;
      break;
    case 'CANCELLED':
      statusBadge = '<span class="badge badge-danger">Annulée</span>';
      break;
    case 'EXPIRED':
      statusBadge = '<span class="badge badge-secondary">Expirée</span>';
      break;
  }
  
  card.innerHTML = `
    <img src="${booking.propertyImage}" alt="${booking.propertyTitle}">
    <div class="booking-info">
      <h3>${booking.propertyTitle}</h3>
      <p>${booking.propertyAddress}, ${booking.propertyCity}</p>
      <p>Du ${booking.startDate} au ${booking.endDate} (${booking.numberOfNights} nuits)</p>
      <p class="price">${booking.totalPrice} ${booking.currency}</p>
      ${statusBadge}
    </div>
  `;
  
  document.getElementById('bookings-container').appendChild(card);
});
```

---

## ⚠️ Points d'Attention Critiques

### 1. Types de Données

```javascript
// ❌ FAUX
{
  propertyId: "550e8400-e29b-41d4-a716-446655440000",  // UUID String
  checkInDate: "2026-02-01",
  checkOutDate: "2026-02-05"
}

// ✅ CORRECT
{
  propertyId: 1,  // Long (Integer)
  startDate: "2026-02-01",
  endDate: "2026-02-05"
}
```

### 2. Champs Manquants

Les champs suivants **NE SONT PAS** retournés par l'API :
- ❌ `numberOfNights` → Calculer frontend
- ❌ `expiresAt` → Calculer `createdAt + 15 min`
- ❌ `propertyTitle` → Appel Listing Service
- ❌ `propertyAddress` → Appel Listing Service
- ❌ `propertyImage` → Appel Listing Service

### 3. Timeout de Paiement

```javascript
// ⚠️ Toujours vérifier l'expiration avant de payer
const checkNotExpired = (createdAt) => {
  const created = new Date(createdAt);
  const expires = new Date(created.getTime() + 15 * 60 * 1000);
  const now = new Date();
  
  if (now > expires) {
    throw new Error("Booking expired. Please create a new booking.");
  }
};

// Avant d'appeler le paiement
try {
  checkNotExpired(booking.createdAt);
  await processPayment(booking);
} catch (error) {
  alert(error.message);
  window.location.href = '/properties';
}
```

### 4. Scheduler Fréquence

- **Backend** : Vérifie toutes les 2 minutes
- **Frontend** : Mettre à jour le timer toutes les secondes
- Possible que booking reste `AWAITING_PAYMENT` jusqu'à 2 min après expiration

### 5. Status PENDING

```javascript
// ⚠️ Ne jamais vérifier status === 'PENDING'
// Ce status n'est jamais utilisé dans le code actuel

// ❌ FAUX
if (booking.status === 'PENDING') {
  // Ce code ne sera JAMAIS exécuté
}

// ✅ CORRECT
if (booking.status === 'AWAITING_PAYMENT') {
  // Status réel après création
}
```

---

## 📊 États de Réservation - Résumé

| Status | Visible User | Actions User | Auto-Expiration | Backend Utilise |
|--------|--------------|--------------|-----------------|-----------------|
| `PENDING` | ❌ | Aucune | ❌ | ⚠️ **NON** |
| `AWAITING_PAYMENT` | ✅ | Payer, Annuler | ✅ 15 min | ✅ **OUI** |
| `CONFIRMED` | ✅ | Annuler (si futur) | ❌ | ✅ **OUI** |
| `CANCELLED` | ✅ | Aucune | ❌ | ✅ **OUI** |
| `EXPIRED` | ✅ | Aucune | ❌ | ✅ **OUI** |

---

## 🛡️ Circuit Breaker & Resilience

Le service utilise **Resilience4j** pour gérer les appels aux services externes :

### Configuration

```yaml
resilience4j:
  circuitbreaker:
    instances:
      authService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10000
      listingService:
        slidingWindowSize: 10
        failureRateThreshold: 50
```

### Comportement en Cas d'Échec

Si Auth Service ou Listing Service est down :
- **Circuit OPEN** après 50% d'échecs
- Attente 10 secondes avant réessai
- Fallback : Retourne erreur 503 Service Unavailable

---

**Version** : 2.0 (Corrigée)  
**Date** : 11 janvier 2026  
**Prochaine étape** : [PAYMENT_SERVICE.md](PAYMENT_SERVICE.md)
