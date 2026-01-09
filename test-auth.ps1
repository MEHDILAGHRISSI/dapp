# ==========================================
# Script de Test - Authentification
# ==========================================

Write-Host "`n🔐 Test d'Authentification - Microservices" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Configuration
$BASE_URL = "http://localhost:8080"
$LOGIN_ENDPOINT = "$BASE_URL/users/login"

# Credentials Admin
$loginData = @{
    email = "daar.chain@gmail.com"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "📧 Email: daar.chain@gmail.com" -ForegroundColor Yellow
Write-Host "🔑 Tentative de connexion...`n" -ForegroundColor Yellow

try {
    # Effectuer la requête avec récupération des headers
    $response = Invoke-WebRequest -Uri $LOGIN_ENDPOINT `
                                   -Method POST `
                                   -Body $loginData `
                                   -ContentType "application/json" `
                                   -UseBasicParsing
    
    # Extraire le token du header Authorization
    $authHeader = $response.Headers["Authorization"]
    $userId = $response.Headers["user_id"]
    
    if ($authHeader) {
        # Retirer le préfixe "Bearer " si présent
        $token = $authHeader -replace "^Bearer ", ""
        
        Write-Host "✅ Authentification réussie!" -ForegroundColor Green
        Write-Host "`n📋 Informations récupérées:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "User ID: $userId" -ForegroundColor White
        Write-Host "`nToken JWT:" -ForegroundColor White
        Write-Host $token -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
        
        # Exporter les variables pour utilisation ultérieure
        $env:ADMIN_TOKEN = $token
        $env:ADMIN_USER_ID = $userId
        
        Write-Host "💾 Variables d'environnement définies:" -ForegroundColor Cyan
        Write-Host "   - `$env:ADMIN_TOKEN" -ForegroundColor Yellow
        Write-Host "   - `$env:ADMIN_USER_ID`n" -ForegroundColor Yellow
        
        # Afficher des exemples d'utilisation
        Write-Host "📌 Exemples d'utilisation:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "`n# Utiliser le token dans une requête:" -ForegroundColor White
        Write-Host '$headers = @{' -ForegroundColor Yellow
        Write-Host '    "Authorization" = "Bearer $env:ADMIN_TOKEN"' -ForegroundColor Yellow
        Write-Host '    "X-User-Id" = $env:ADMIN_USER_ID' -ForegroundColor Yellow
        Write-Host '}' -ForegroundColor Yellow
        Write-Host 'Invoke-RestMethod -Uri "http://localhost:8083/bookings" -Headers $headers' -ForegroundColor Yellow
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ Token non trouvé dans les headers de réponse" -ForegroundColor Red
        Write-Host "`n📋 Headers reçus:" -ForegroundColor Yellow
        $response.Headers | Format-Table -AutoSize
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'authentification!" -ForegroundColor Red
    Write-Host "`n📋 Détails de l'erreur:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "`nCode HTTP: $statusCode" -ForegroundColor Red
        
        # Lire le corps de la réponse d'erreur
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        
        if ($errorBody) {
            Write-Host "`nCorps de la réponse:" -ForegroundColor Yellow
            Write-Host $errorBody -ForegroundColor Red
        }
    }
}

Write-Host "`n✨ Test terminé`n" -ForegroundColor Cyan
