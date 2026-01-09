# ========================================
# Script de Test Automatisé - API Complete
# Application de Location Décentralisée
# ========================================

Write-Host "🧪 Démarrage des tests automatisés..." -ForegroundColor Cyan
Write-Host ""

# Variables globales
$BASE_URL = "http://localhost"
$AUTH_PORT = "8080"
$LISTING_PORT = "8081"
$BOOKING_PORT = "8083"
$PAYMENT_PORT = "8084"

$TENANT_EMAIL = "alice.test@example.com"
$TENANT_PASSWORD = "Alice@123"
$OWNER_EMAIL = "bob.test@example.com"
$OWNER_PASSWORD = "Bob@123"

$TENANT_TOKEN = ""
$OWNER_TOKEN = ""
$TENANT_ID = ""
$OWNER_ID = ""
$PROPERTY_ID = ""
$BOOKING_ID = ""

# Fonction pour afficher les résultats
function Show-Result {
    param($TestName, $Success, $Response)
    if ($Success) {
        Write-Host "✅ $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        Write-Host "   Erreur: $Response" -ForegroundColor Red
    }
}

# ========================================
# TEST 1: INSCRIPTION LOCATAIRE
# ========================================
Write-Host "`n📝 TEST 1: Inscription Locataire" -ForegroundColor Yellow
try {
    $body = @{
        firstname = "Alice"
        lastname = "Tenant"
        email = $TENANT_EMAIL
        password = $TENANT_PASSWORD
        types = @("CLIENT")
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    $TENANT_ID = $response.userId
    Show-Result "Inscription réussie (User ID: $TENANT_ID)" $true $null
} catch {
    Show-Result "Inscription échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 2: CONNEXION LOCATAIRE
# ========================================
Write-Host "`n🔐 TEST 2: Connexion Locataire" -ForegroundColor Yellow
try {
    $body = @{
        email = $TENANT_EMAIL
        password = $TENANT_PASSWORD
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    $TENANT_TOKEN = $response.token
    $TENANT_ID = $response.userId
    Show-Result "Connexion réussie (Token obtenu)" $true $null
} catch {
    Show-Result "Connexion échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 3: CONFIGURATION WALLET LOCATAIRE
# ========================================
Write-Host "`n💰 TEST 3: Configuration Wallet Locataire" -ForegroundColor Yellow
try {
    $body = @{
        walletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $TENANT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users/$TENANT_ID/wallet" `
        -Method PUT `
        -Body $body `
        -Headers $headers `
        -ErrorAction Stop

    Show-Result "Wallet configuré" $true $null
} catch {
    Show-Result "Configuration wallet échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 4: INSCRIPTION PROPRIÉTAIRE
# ========================================
Write-Host "`n📝 TEST 4: Inscription Propriétaire" -ForegroundColor Yellow
try {
    $body = @{
        firstname = "Bob"
        lastname = "Owner"
        email = $OWNER_EMAIL
        password = $OWNER_PASSWORD
        types = @("PROPRIETAIRE")
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    $OWNER_ID = $response.userId
    Show-Result "Inscription propriétaire réussie" $true $null
} catch {
    Show-Result "Inscription propriétaire échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 5: CONNEXION PROPRIÉTAIRE
# ========================================
Write-Host "`n🔐 TEST 5: Connexion Propriétaire" -ForegroundColor Yellow
try {
    $body = @{
        email = $OWNER_EMAIL
        password = $OWNER_PASSWORD
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    $OWNER_TOKEN = $response.token
    $OWNER_ID = $response.userId
    Show-Result "Connexion propriétaire réussie" $true $null
} catch {
    Show-Result "Connexion propriétaire échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 6: CONFIGURATION WALLET PROPRIÉTAIRE
# ========================================
Write-Host "`n💰 TEST 6: Configuration Wallet Propriétaire" -ForegroundColor Yellow
try {
    $body = @{
        walletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $OWNER_TOKEN"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$AUTH_PORT/users/$OWNER_ID/wallet" `
        -Method PUT `
        -Body $body `
        -Headers $headers `
        -ErrorAction Stop

    Show-Result "Wallet propriétaire configuré" $true $null
} catch {
    Show-Result "Configuration wallet propriétaire échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 7: CRÉATION PROPRIÉTÉ
# ========================================
Write-Host "`n🏠 TEST 7: Création d'une Propriété" -ForegroundColor Yellow
try {
    $body = @{
        title = "Appartement Test Automatisé"
        description = "Propriété créée par script de test"
        location = "Tanger, Maroc"
        pricePerNight = 500.00
        availableFrom = "2026-01-15"
        availableTo = "2026-12-31"
        latitude = 35.7595
        longitude = -5.8340
        propertyType = "APARTMENT"
        ownerId = $OWNER_ID
        characteristics = @(
            @{
                typeCaracteristiqueId = 1
                valeur = "2"
            }
        )
    } | ConvertTo-Json -Depth 5

    $headers = @{
        "Authorization" = "Bearer $OWNER_TOKEN"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$LISTING_PORT/properties" `
        -Method POST `
        -Body $body `
        -Headers $headers `
        -ErrorAction Stop

    $PROPERTY_ID = $response.propertyId
    Show-Result "Propriété créée (ID: $PROPERTY_ID)" $true $null
} catch {
    Show-Result "Création propriété échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 8: CONSULTATION PROPRIÉTÉS
# ========================================
Write-Host "`n🔍 TEST 8: Consultation des Propriétés" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TENANT_TOKEN"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$LISTING_PORT/properties?page=0&size=10" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    $count = $response.content.Count
    Show-Result "Propriétés consultées ($count trouvée(s))" $true $null
} catch {
    Show-Result "Consultation propriétés échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 9: CRÉATION RÉSERVATION
# ========================================
Write-Host "`n📅 TEST 9: Création d'une Réservation" -ForegroundColor Yellow
try {
    $body = @{
        propertyId = $PROPERTY_ID
        startDate = "2026-02-01"
        endDate = "2026-02-05"
        tenantWalletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $TENANT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$BOOKING_PORT/bookings" `
        -Method POST `
        -Body $body `
        -Headers $headers `
        -ErrorAction Stop

    $BOOKING_ID = $response.bookingId
    Show-Result "Réservation créée (ID: $BOOKING_ID, Total: $($response.totalPrice) DH)" $true $null
} catch {
    Show-Result "Création réservation échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 10: VALIDATION PAIEMENT
# ========================================
Write-Host "`n💳 TEST 10: Validation du Paiement" -ForegroundColor Yellow
try {
    $body = @{
        bookingId = $BOOKING_ID
        transactionHash = "0x" + -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
        fromAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        amount = 2000.00
        currency = "ETH"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $TENANT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$PAYMENT_PORT/payments/validate" `
        -Method POST `
        -Body $body `
        -Headers $headers `
        -ErrorAction Stop

    Show-Result "Paiement validé (Status: $($response.status))" $true $null
} catch {
    Show-Result "Validation paiement échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 11: CONSULTATION RÉSERVATIONS
# ========================================
Write-Host "`n📋 TEST 11: Consultation Mes Réservations" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TENANT_TOKEN"
    }

    $response = Invoke-RestMethod -Uri "$BASE_URL:$BOOKING_PORT/bookings/my-bookings" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    $count = $response.Count
    Show-Result "Réservations consultées ($count trouvée(s))" $true $null
} catch {
    Show-Result "Consultation réservations échouée" $false $_.Exception.Message
}

Start-Sleep -Seconds 2

# ========================================
# TEST 12: HEALTH CHECK PAYMENT SERVICE
# ========================================
Write-Host "`n❤️ TEST 12: Health Check Payment Service" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL:$PAYMENT_PORT/payments/health" `
        -Method GET `
        -ErrorAction Stop

    Show-Result "Payment Service Health: OK" $true $null
} catch {
    Show-Result "Health Check échoué" $false $_.Exception.Message
}

# ========================================
# RÉSUMÉ
# ========================================
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Tenant ID:    $TENANT_ID" -ForegroundColor White
Write-Host "🔑 Owner ID:     $OWNER_ID" -ForegroundColor White
Write-Host "🏠 Property ID:  $PROPERTY_ID" -ForegroundColor White
Write-Host "📅 Booking ID:   $BOOKING_ID" -ForegroundColor White
Write-Host ""
Write-Host "✅ Tous les tests sont terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pour voir les données créées:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - RabbitMQ: http://localhost:15672 (guest/guest)" -ForegroundColor White
Write-Host "   - Jaeger: http://localhost:16686" -ForegroundColor White
Write-Host ""
