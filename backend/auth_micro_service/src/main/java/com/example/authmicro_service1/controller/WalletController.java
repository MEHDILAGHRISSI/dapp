package com.example.authmicro_service1.controller;

import com.example.authmicro_service1.requests.WalletUpdateRequest;
import com.example.authmicro_service1.services.impl.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ✅ Contrôleur dédié à la gestion des wallets
 * Séparation des responsabilités : UserController gère les users, WalletController les wallets
 */
@RestController
@RequestMapping("/users")
public class WalletController {

    @Autowired
    private WalletService walletService;

    /**
     * 🔌 Connecter un wallet à un utilisateur
     * POST /users/{userId}/wallet/connect
     *
     * @param userId ID de l'utilisateur
     * @param request { "walletAddress": "0xABC..." }
     * @return Message de succès
     */
    @PostMapping("/{userId}/wallet/connect")
    public ResponseEntity<?> connectWallet(
            @PathVariable String userId,
            @RequestBody WalletUpdateRequest request) {
        try {
            // ✅ Vérifier que l'utilisateur connecté = userId (sécurité)
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            walletService.connectWallet(userId, request.getWalletAddress(), currentUserEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Wallet connecté avec succès");
            response.put("userId", userId);
            response.put("walletAddress", request.getWalletAddress());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Erreur interne: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 🔓 Déconnecter le wallet d'un utilisateur
     * DELETE /users/{userId}/wallet/disconnect
     *
     * IMPORTANT: Vérifie les contraintes métier avant déconnexion:
     * - Pas de properties actives (statut ACTIVE)
     * - Pas de réservations futures en tant que host
     * - Pas de réservations actives en tant que client
     *
     * @param userId ID de l'utilisateur
     * @return Message de succès ou erreur avec détails des blocages
     */
    @DeleteMapping("/{userId}/wallet/disconnect")
    public ResponseEntity<?> disconnectWallet(@PathVariable String userId) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            walletService.disconnectWallet(userId, currentUserEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Wallet déconnecté avec succès");
            response.put("userId", userId);
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            // ❌ Erreur métier : contraintes non respectées
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "blocked");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Erreur interne: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 📊 Récupérer le statut du wallet d'un utilisateur
     * GET /users/{userId}/wallet/status
     *
     * Utilisé par d'autres services (Listing, Booking, Payment)
     *
     * @param userId ID de l'utilisateur
     * @return { userId, walletAddress, exists }
     */
    @GetMapping("/{userId}/wallet/status")
    public ResponseEntity<?> getWalletStatus(@PathVariable String userId) {
        try {
            Map<String, Object> walletStatus = walletService.getWalletStatus(userId);
            return ResponseEntity.ok(walletStatus);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Erreur interne: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}