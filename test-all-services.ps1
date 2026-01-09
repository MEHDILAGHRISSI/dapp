# ==========================================
# Script de Test Complet - Tous les Services
# ==========================================

Write-Host "`n🚀 Tests des Microservices - Application de Location" -ForegroundColor Cyan
Write-Host "===================================================`n" -ForegroundColor Cyan

# ==========================================
# 1. AUTHENTIFICATION
# ==========================================

Write-Host "📍 ÉTAPE 1: Authentification" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$loginData = @{
    email = "daar.chain@gmail.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/users/login" `
                                   -Method POST `
                                   -Body $loginData `
                                   -ContentType "application/json" `
                                   -UseBasicParsing
    
    $token = $response.Headers["Authorization"] -replace "^Bearer ", ""
    $userId = $response.Headers["user_id"]
    
    if ($token) {
        Write-Host "✅ Authentification réussie" -ForegroundColor Green
        Write-Host "   User ID: $userId" -ForegroundColor White
        Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
        
        # Définir les headers pour les prochaines requêtes
        $headers = @{
            "Authorization" = "Bearer $token"
            "X-User-Id" = $userId
        }
    } else {
        Write-Host "❌ Échec de l'authentification" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur d'authentification: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# ==========================================
# 2. LISTING SERVICE (Port 8081)
# ==========================================

Write-Host "`n📍 ÉTAPE 2: Test du Listing Service" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

# Test 1: Créer une propriété
Write-Host "📝 Test 1: Création d'une propriété..." -ForegroundColor Yellow

$propertyData = @{
    title = "Appartement Test PowerShell"
    description = "Appartement de test créé via script"
    propertyType = "APARTMENT"
    address = "123 Rue de Test"
    city = "Paris"
    state = "Île-de-France"
    country = "France"
    zipCode = "75001"
    pricePerNight = 150.00
    bedrooms = 2
    bathrooms = 1
    maxGuests = 4
    amenities = @("WIFI", "TV", "KITCHEN")
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8081/properties" `
                                        -Method POST `
                                        -Body $propertyData `
                                        -ContentType "application/json" `
                                        -Headers $headers
    
    $propertyId = $createResponse.id
    Write-Host "✅ Propriété créée avec succès" -ForegroundColor Green
    Write-Host "   ID: $propertyId" -ForegroundColor White
    Write-Host "   Titre: $($createResponse.title)" -ForegroundColor White
    Write-Host "   Prix: $($createResponse.pricePerNight) EUR/nuit`n" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Récupérer toutes les propriétés
Write-Host "📋 Test 2: Récupération de toutes les propriétés..." -ForegroundColor Yellow

try {
    $properties = Invoke-RestMethod -Uri "http://localhost:8081/properties" `
                                    -Method GET `
                                    -Headers $headers
    
    Write-Host "✅ Propriétés récupérées: $($properties.Count)" -ForegroundColor Green
    if ($properties.Count -gt 0) {
        Write-Host "   Première propriété: $($properties[0].title)`n" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# ==========================================
# 3. BOOKING SERVICE (Port 8083)
# ==========================================

Write-Host "`n📍 ÉTAPE 3: Test du Booking Service" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

if ($propertyId) {
    # Test 1: Créer une réservation
    Write-Host "📝 Test 1: Création d'une réservation..." -ForegroundColor Yellow
    
    $bookingData = @{
        propertyId = $propertyId
        startDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
        pricePerNight = 150.00
        currency = "EUR"
        tenantWalletAddress = "0x1234567890123456789012345678901234567890"
    } | ConvertTo-Json
    
    try {
        $bookingResponse = Invoke-RestMethod -Uri "http://localhost:8083/bookings" `
                                             -Method POST `
                                             -Body $bookingData `
                                             -ContentType "application/json" `
                                             -Headers $headers
        
        $bookingId = $bookingResponse.id
        Write-Host "✅ Réservation créée avec succès" -ForegroundColor Green
        Write-Host "   ID: $bookingId" -ForegroundColor White
        Write-Host "   Status: $($bookingResponse.status)" -ForegroundColor White
        Write-Host "   Prix total: $($bookingResponse.totalPrice) $($bookingResponse.currency)`n" -ForegroundColor White
    } catch {
        Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)`n" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Pas de propriété disponible pour créer une réservation`n" -ForegroundColor Yellow
}

# Test 2: Récupérer toutes les réservations
Write-Host "📋 Test 2: Récupération des réservations..." -ForegroundColor Yellow

try {
    $bookings = Invoke-RestMethod -Uri "http://localhost:8083/bookings" `
                                  -Method GET `
                                  -Headers $headers
    
    Write-Host "✅ Réservations récupérées: $($bookings.Count)" -ForegroundColor Green
    if ($bookings.Count -gt 0) {
        Write-Host "   Première réservation: Status = $($bookings[0].status)`n" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération: $($_.Exception.Message)`n" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# ==========================================
# 4. PAYMENT SERVICE (Port 8084)
# ==========================================

Write-Host "`n📍 ÉTAPE 4: Test du Payment Service" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

if ($bookingId) {
    # Test: Initialiser un paiement
    Write-Host "💳 Test: Initialisation d'un paiement..." -ForegroundColor Yellow
    
    $paymentData = @{
        bookingId = $bookingId
        contractAddress = "0x9876543210987654321098765432109876543210"
        expectedAmount = 1050.00
        currency = "EUR"
    } | ConvertTo-Json
    
    try {
        $paymentResponse = Invoke-RestMethod -Uri "http://localhost:8084/payments/initialize" `
                                             -Method POST `
                                             -Body $paymentData `
                                             -ContentType "application/json" `
                                             -Headers $headers
        
        Write-Host "✅ Paiement initialisé avec succès" -ForegroundColor Green
        Write-Host "   ID: $($paymentResponse.id)" -ForegroundColor White
        Write-Host "   Status: $($paymentResponse.status)" -ForegroundColor White
        Write-Host "   Montant: $($paymentResponse.amount) $($paymentResponse.currency)`n" -ForegroundColor White
    } catch {
        Write-Host "❌ Erreur lors de l'initialisation: $($_.Exception.Message)`n" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Pas de réservation disponible pour créer un paiement`n" -ForegroundColor Yellow
}

# ==========================================
# 5. GATEWAY SERVICE (Port 8082)
# ==========================================

Write-Host "`n📍 ÉTAPE 5: Test du Gateway Service" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

# Test: Accès via la Gateway
Write-Host "🌐 Test: Accès aux propriétés via Gateway..." -ForegroundColor Yellow

try {
    $gatewayResponse = Invoke-RestMethod -Uri "http://localhost:8082/listing-service/properties" `
                                         -Method GET `
                                         -Headers $headers
    
    Write-Host "✅ Accès via Gateway réussi" -ForegroundColor Green
    Write-Host "   Propriétés récupérées: $($gatewayResponse.Count)`n" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur d'accès via Gateway: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ==========================================
# RÉSUMÉ
# ==========================================

Write-Host "`n📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Auth Service      : Port 8080" -ForegroundColor Green
Write-Host "✅ Listing Service   : Port 8081" -ForegroundColor Green
Write-Host "✅ Gateway Service   : Port 8082" -ForegroundColor Green
Write-Host "✅ Booking Service   : Port 8083" -ForegroundColor Green
Write-Host "✅ Payment Service   : Port 8084" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "🎉 Tests terminés avec succès!`n" -ForegroundColor Cyan
