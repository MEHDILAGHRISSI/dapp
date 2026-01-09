# ========================================
# COMMANDES RAPIDES DE TEST - CURL
# ========================================

# 1. INSCRIPTION LOCATAIRE
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Alice",
    "lastname": "Tenant",
    "email": "alice@test.com",
    "password": "Alice@123",
    "types": ["CLIENT"]
  }'

# 2. CONNEXION LOCATAIRE
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "Alice@123"
  }'

# Sauvegardez le token reçu dans une variable
# export TOKEN="votre_token_ici"
# export USER_ID="votre_user_id_ici"

# 3. CONFIGURATION WALLET
curl -X PUT http://localhost:8080/users/$USER_ID/wallet \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  }'

# 4. CRÉER UNE PROPRIÉTÉ (connecté en tant que propriétaire)
curl -X POST http://localhost:8081/properties \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement Test",
    "description": "Test description",
    "location": "Tanger, Maroc",
    "pricePerNight": 500,
    "availableFrom": "2026-01-15",
    "availableTo": "2026-12-31",
    "latitude": 35.7595,
    "longitude": -5.8340,
    "propertyType": "APARTMENT",
    "ownerId": "'$OWNER_ID'"
  }'

# 5. CONSULTER LES PROPRIÉTÉS
curl -X GET "http://localhost:8081/properties?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"

# 6. CRÉER UNE RÉSERVATION
curl -X POST http://localhost:8083/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": 1,
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "tenantWalletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  }'

# 7. VALIDER UN PAIEMENT
curl -X POST http://localhost:8084/payments/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "fromAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 2000.00,
    "currency": "ETH"
  }'

# 8. CONSULTER MES RÉSERVATIONS
curl -X GET http://localhost:8083/bookings/my-bookings \
  -H "Authorization: Bearer $TOKEN"

# 9. HEALTH CHECK
curl -X GET http://localhost:8084/payments/health

# 10. CONNEXION ADMIN
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "daar.chain@gmail.com",
    "password": "Admin@123"
  }'

# ========================================
# TESTS VIA API GATEWAY (Port 8082)
# ========================================

# Tous les endpoints peuvent être testés via le gateway :
curl -X POST http://localhost:8082/auth/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "Alice@123"}'

curl -X GET http://localhost:8082/listings/properties?page=0&size=10 \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8082/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": 1, "startDate": "2026-02-01", "endDate": "2026-02-05"}'

# ========================================
# COMMANDES DE VÉRIFICATION
# ========================================

# Vérifier les logs
docker logs auth-service --tail 50
docker logs listing-service --tail 50
docker logs booking-service --tail 50
docker logs payment-service --tail 50

# Vérifier les bases de données
docker exec -it postgres-auth-db psql -U postgres -d auth_location_db -c "SELECT email, firstname FROM users;"
docker exec -it postgres-listing-db psql -U postgres -d listing_db -c "SELECT property_id, title, price_per_night FROM properties;"
docker exec -it postgres-booking-db psql -U postgres -d booking_db -c "SELECT id, status, total_price FROM bookings;"
docker exec -it mysql-payment-db mysql -uroot -proot -e "USE payment_db; SELECT id, status, amount FROM payments;"

# Vérifier RabbitMQ
# Interface web: http://localhost:15672 (guest/guest)

# Vérifier Jaeger (tracing)
# Interface web: http://localhost:16686

# Vérifier la blockchain Hardhat
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
