package ma.fstt.listingservice.controller;

import ma.fstt.listingservice.dto.PropertyDto;
import ma.fstt.listingservice.requests.PropertyRequest;
import ma.fstt.listingservice.requests.PropertyStatusRequest;
import ma.fstt.listingservice.responses.PropertyResponse;
import ma.fstt.listingservice.services.PropertyService;
import ma.fstt.listingservice.services.impl.PropertyServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import ma.fstt.listingservice.entities.PropertyStatus;
import ma.fstt.listingservice.requests.*;

@RestController
@RequestMapping("/properties")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProperty(
            @RequestBody PropertyRequest propertyRequest,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto propertyDto = new PropertyDto();
            BeanUtils.copyProperties(propertyRequest, propertyDto);

            PropertyDto createdProperty = propertyService.createProperty(propertyDto, ownerId);

            // ✅ FIX: Mapper manuellement avec conversion personnalisée
            PropertyResponse response = convertDtoToResponse(createdProperty);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Propriété créée avec succès");
            result.put("property", response);

            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<?> getProperty(@PathVariable String propertyId) {
        try {
            PropertyDto propertyDto = propertyService.getPropertyByPropertyId(propertyId);
            PropertyResponse response = convertDtoToResponse(propertyDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByOwner(@PathVariable String ownerId) {
        List<PropertyDto> properties = propertyService.getPropertiesByUserId(ownerId);
        List<PropertyResponse> responses = properties.stream()
                .map(this::convertDtoToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-properties")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(
            @RequestHeader("X-User-Id") String ownerId) {
        return getPropertiesByOwner(ownerId);
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PropertyDto> properties = propertyService.getAllValidatedProperties(pageable);

        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer nbOfGuests,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyDto> properties = propertyService.searchProperties(
                city, type, minPrice, maxPrice, nbOfGuests, pageable);

        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Page<PropertyResponse>> findPropertiesNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PropertyDto> properties = propertyService.findPropertiesNearby(
                latitude, longitude, radius, pageable);

        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{propertyId}")
    public ResponseEntity<?> updateProperty(
            @PathVariable String propertyId,
            @RequestBody PropertyRequest propertyRequest,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto propertyDto = new PropertyDto();
            BeanUtils.copyProperties(propertyRequest, propertyDto);

            PropertyDto updatedProperty = propertyService.updateProperty(propertyId, propertyDto, ownerId);

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PatchMapping("/{propertyId}/status")
    public ResponseEntity<?> updatePropertyStatus(
            @PathVariable String propertyId,
            @RequestBody PropertyStatusRequest statusRequest,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            PropertyDto updatedProperty = propertyService.updatePropertyStatus(
                    propertyId,
                    statusRequest.getIsHidden(),
                    statusRequest.getIsDraft(),
                    statusRequest.getIsValidated(),
                    ownerId
            );

            PropertyResponse response = convertDtoToResponse(updatedProperty);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Map<String, String>> deleteProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            propertyService.deleteProperty(propertyId, ownerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Propriété supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{propertyId}/images")
    public ResponseEntity<?> uploadImages(
            @PathVariable String propertyId,
            @RequestParam("images") List<MultipartFile> images,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            List<String> uploadedPaths = propertyService.uploadPropertyImages(propertyId, images, ownerId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Images uploadées avec succès");
            response.put("imagePaths", uploadedPaths);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{propertyId}/images")
    public ResponseEntity<Map<String, String>> deleteImage(
            @PathVariable String propertyId,
            @RequestParam String imagePath,
            @RequestHeader("X-User-Id") String ownerId) {
        try {
            propertyService.deletePropertyImage(propertyId, imagePath, ownerId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<Map<String, Long>> countPropertiesByOwner(@PathVariable String ownerId) {
        Long count = propertyService.countPropertiesByOwner(ownerId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    // ✅ MÉTHODE HELPER: Conversion DTO -> Response avec mapping manuel
    private PropertyResponse convertDtoToResponse(PropertyDto dto) {
        PropertyResponse response = new PropertyResponse();
        BeanUtils.copyProperties(dto, response);

        // ✅ FIX: Mapper manuellement userId -> ownerId
        response.setOwnerId(dto.getUserId());

        return response;
    }

    /**
     * ✅ NOUVEAU: Compter les propriétés actives d'un propriétaire
     * Utilisé par auth-service pour vérifier si on peut déconnecter le wallet
     *
     * GET /properties/owner/{ownerId}/active-count
     *
     * Retourne le nombre de propriétés actives (isHidden=false, isDraft=false, isValidated=true)
     */
    @GetMapping("/owner/{ownerId}/active-count")
    public ResponseEntity<Map<String, Long>> countActivePropertiesByOwner(@PathVariable String ownerId) {
        try {
            Long count = propertyService.countActivePropertiesByOwner(ownerId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du comptage des propriétés actives: " + e.getMessage());
            // En cas d'erreur, retourner 0 pour ne pas bloquer la déconnexion
            Map<String, Long> response = new HashMap<>();
            response.put("count", 0L);
            return ResponseEntity.ok(response);
        }
    }

    // Dans PropertyController.java

    /**
     * Soumettre pour validation (Owner seulement)
     */
    @PostMapping("/{propertyId}/submit")
    public ResponseEntity<?> submitProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String userId) {

        PropertyDto property = propertyService.getPropertyByPropertyId(propertyId);

        // Vérifier ownership
        if (!property.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Not your property"));
        }

        // ✅ FIX: Vérifier état - Seules les propriétés DRAFT peuvent être soumises
        if (property.getStatus() != PropertyStatus.DRAFT) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only DRAFT properties can be submitted. Current status: " + property.getStatus()));
        }

        // Changer statut: DRAFT → PENDING
        PropertyDto updated = propertyService.submitPropertyForValidation(propertyId);
        return ResponseEntity.ok(updated);
    }

    /**
     * Valider property (ADMIN seulement)
     */
    @PatchMapping("/{propertyId}/validate")
    public ResponseEntity<?> validateProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-Roles") String roles) {

        // ✅ Vérification ADMIN
        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin only"));
        }

        PropertyDto updated = propertyService.validateProperty(propertyId);
        return ResponseEntity.ok(updated);
    }

    /**
     * ✅ NOUVEAU: Mettre à jour status avec ENUM
     * PATCH /properties/{propertyId}/status-v2
     */
    @PatchMapping("/{propertyId}/status-v2")
    public ResponseEntity<?> updatePropertyStatusV2(
            @PathVariable String propertyId,
            @RequestBody PropertyStatusUpdateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            // Appeler la nouvelle méthode avec ENUM
            PropertyDto updatedProperty = ((PropertyServiceImpl) propertyService)
                    .updatePropertyStatusEnum(propertyId, request.getStatus(), userId);

            PropertyResponse response = convertDtoToResponse(updatedProperty);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid status transition: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * ✅ NOUVEAU: Cacher temporairement une property (ACTIVE → HIDDEN)
     * POST /properties/{propertyId}/hide
     */
    @PostMapping("/{propertyId}/hide")
    public ResponseEntity<?> hideProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            PropertyStatusUpdateRequest request = new PropertyStatusUpdateRequest();
            request.setStatus(PropertyStatus.HIDDEN);

            return updatePropertyStatusV2(propertyId, request, userId);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * ✅ NOUVEAU: Rendre visible une property cachée (HIDDEN → ACTIVE)
     * POST /properties/{propertyId}/show
     */
    @PostMapping("/{propertyId}/show")
    public ResponseEntity<?> showProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            PropertyStatusUpdateRequest request = new PropertyStatusUpdateRequest();
            request.setStatus(PropertyStatus.ACTIVE);

            return updatePropertyStatusV2(propertyId, request, userId);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * ✅ ADMIN ONLY: Lister toutes les properties en attente de validation
     * GET /properties/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-Roles") String roles) {

        // Vérifier que c'est un ADMIN
        if (!roles.contains("ADMIN")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PropertyDto> properties = ((PropertyServiceImpl) propertyService)
                .getAllByStatus(PropertyStatus.PENDING, pageable);

        Page<PropertyResponse> responses = properties.map(this::convertDtoToResponse);
        return ResponseEntity.ok(responses);
    }

    /**
     * ✅ ADMIN ONLY: Rejeter une property (PENDING → DRAFT)
     * POST /properties/{propertyId}/reject
     */
    @PostMapping("/{propertyId}/reject")
    public ResponseEntity<?> rejectProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-Roles") String roles,
            @RequestBody(required = false) Map<String, String> body) {

        if (!roles.contains("ADMIN")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            PropertyStatusUpdateRequest request = new PropertyStatusUpdateRequest();
            request.setStatus(PropertyStatus.DRAFT);

            // Note: Utiliser userId de l'owner (à récupérer depuis property)
            PropertyDto property = propertyService.getPropertyByPropertyId(propertyId);
            PropertyDto updated = ((PropertyServiceImpl) propertyService)
                    .updatePropertyStatusEnum(propertyId, PropertyStatus.DRAFT, property.getUserId());

            PropertyResponse response = convertDtoToResponse(updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}