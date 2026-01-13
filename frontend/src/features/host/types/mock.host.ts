// src/features/host/api/mock.host.ts
import {
    Property,
    PropertyType,
    PropertyStatus,
    Characteristic
} from "@/features/properties/types/properties.types";
import {
    CreatePropertyInput,
    UpdatePropertyInput,
    PropertyCreateResponse,
    PropertyActionResponse,
    ImageUploadResponse,
    PropertyCountResponse
} from "../types/host.types";

// ==================== MOCK DATA ====================

const mockCharacteristics: Characteristic[] = [
    { id: 1, name: "Wifi", iconPath: "/icons/wifi.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 2, name: "Pool", iconPath: "/icons/pool.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 3, name: "Kitchen", iconPath: "/icons/kitchen.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 4, name: "Parking", iconPath: "/icons/parking.svg", typeCaracteristique: { id: 2, name: "Facilities" } },
    { id: 5, name: "Air Conditioning", iconPath: "/icons/ac.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 6, name: "Fireplace", iconPath: "/icons/fireplace.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 7, name: "Hot Tub", iconPath: "/icons/hot-tub.svg", typeCaracteristique: { id: 1, name: "Amenities" } },
    { id: 8, name: "BBQ Grill", iconPath: "/icons/bbq.svg", typeCaracteristique: { id: 3, name: "Outdoor" } },
    { id: 9, name: "Gym", iconPath: "/icons/gym.svg", typeCaracteristique: { id: 2, name: "Facilities" } },
    { id: 10, name: "Pet Friendly", iconPath: "/icons/pet-friendly.svg", typeCaracteristique: { id: 4, name: "Rules" } }
];

const mockProperties: Property[] = [
    {
        propertyId: "prop_001",
        title: "Modern Downtown Apartment",
        type: "APARTMENT",
        description: "A sleek modern apartment in the heart of downtown with amazing city views.",
        addressName: "123 Main Street",
        city: "New York",
        country: "USA",
        state: "NY",
        codePostale: "10001",
        latitude: 40.7128,
        longitude: -74.0060,
        pricePerNight: 150,
        nbOfGuests: 4,
        nbOfBedrooms: 2,
        nbOfBeds: 2,
        nbOfBathrooms: 2,
        status: "ACTIVE",
        images: ["/images/property1-1.jpg", "/images/property1-2.jpg"],
        characteristics: [mockCharacteristics[0], mockCharacteristics[2], mockCharacteristics[4]],
        ownerId: "user_001",
        owner_user_id: "auth_001",
        createdAt: "2024-01-15T10:30:00Z",
        lastUpdateAt: "2024-01-20T14:45:00Z"
    },
    {
        propertyId: "prop_002",
        title: "Beachfront Villa with Private Pool",
        type: "VILLA",
        description: "Luxurious villa with direct beach access and private infinity pool.",
        addressName: "456 Ocean Drive",
        city: "Miami",
        country: "USA",
        state: "FL",
        codePostale: "33139",
        latitude: 25.7617,
        longitude: -80.1918,
        pricePerNight: 450,
        nbOfGuests: 8,
        nbOfBedrooms: 4,
        nbOfBeds: 6,
        nbOfBathrooms: 4,
        status: "DRAFT",
        images: ["/images/property2-1.jpg"],
        characteristics: [mockCharacteristics[1], mockCharacteristics[3], mockCharacteristics[4]],
        ownerId: "user_001",
        owner_user_id: "auth_001",
        createdAt: "2024-02-01T09:15:00Z",
        lastUpdateAt: "2024-02-10T11:20:00Z"
    },
    {
        propertyId: "prop_003",
        title: "Cozy Mountain Cabin",
        type: "CABIN",
        description: "Rustic cabin perfect for winter getaways with fireplace and mountain views.",
        addressName: "789 Mountain Road",
        city: "Aspen",
        country: "USA",
        state: "CO",
        codePostale: "81611",
        latitude: 39.1911,
        longitude: -106.8175,
        pricePerNight: 220,
        nbOfGuests: 6,
        nbOfBedrooms: 3,
        nbOfBeds: 4,
        nbOfBathrooms: 2,
        status: "PENDING",
        images: ["/images/property3-1.jpg", "/images/property3-2.jpg", "/images/property3-3.jpg"],
        characteristics: [mockCharacteristics[5], mockCharacteristics[6], mockCharacteristics[7]],
        ownerId: "user_002",
        owner_user_id: "auth_002",
        createdAt: "2024-01-10T14:00:00Z",
        lastUpdateAt: "2024-01-25T16:30:00Z"
    },
    {
        propertyId: "prop_004",
        title: "Luxury City Center Condo",
        type: "CONDO",
        description: "High-end condo with panoramic views and premium amenities.",
        addressName: "101 Skyline Avenue",
        city: "Chicago",
        country: "USA",
        state: "IL",
        codePostale: "60601",
        latitude: 41.8781,
        longitude: -87.6298,
        pricePerNight: 320,
        nbOfGuests: 4,
        nbOfBedrooms: 2,
        nbOfBeds: 3,
        nbOfBathrooms: 2,
        status: "ACTIVE",
        images: ["/images/property4-1.jpg"],
        characteristics: [mockCharacteristics[0], mockCharacteristics[4], mockCharacteristics[8]],
        ownerId: "user_001",
        owner_user_id: "auth_001",
        createdAt: "2024-03-01T08:00:00Z",
        lastUpdateAt: "2024-03-15T12:30:00Z"
    },
    {
        propertyId: "prop_005",
        title: "Family House with Garden",
        type: "HOUSE",
        description: "Spacious family home with large garden and playground.",
        addressName: "202 Family Lane",
        city: "Austin",
        country: "USA",
        state: "TX",
        codePostale: "73301",
        latitude: 30.2672,
        longitude: -97.7431,
        pricePerNight: 280,
        nbOfGuests: 6,
        nbOfBedrooms: 3,
        nbOfBeds: 5,
        nbOfBathrooms: 3,
        status: "HIDDEN",
        images: ["/images/property5-1.jpg", "/images/property5-2.jpg"],
        characteristics: [mockCharacteristics[3], mockCharacteristics[7], mockCharacteristics[9]],
        ownerId: "user_003",
        owner_user_id: "auth_003",
        createdAt: "2024-02-15T11:45:00Z",
        lastUpdateAt: "2024-02-28T09:15:00Z"
    }
];

// ==================== MOCK API FUNCTIONS ====================

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate API error (for testing error handling)
const simulateError = (errorRate: number = 0.1): boolean => {
    return Math.random() < errorRate;
};

// Get current user ID (mock implementation)
const getCurrentUserId = (): string => {
    // In a real app, this would come from auth context
    return "user_001";
};

const getCurrentAuthUserId = (): string => {
    return "auth_001";
};

// Helper to get characteristic by ID
const getCharacteristicById = (id: number): Characteristic => {
    const char = mockCharacteristics.find(c => c.id === id);
    if (!char) {
        throw new Error(`Characteristic with ID ${id} not found`);
    }
    return { ...char };
};

// ==================== PROPERTY CRUD OPERATIONS ====================

/**
 * Create a new property
 */
export const createProperty = async (
    input: CreatePropertyInput
): Promise<PropertyCreateResponse> => {
    await delay(800);

    if (simulateError(0.05)) {
        throw new Error("Failed to create property. Please try again.");
    }

    // Validation
    if (input.title.length < 5 || input.title.length > 100) {
        throw new Error("Title must be between 5 and 100 characters");
    }

    if (input.description.length < 50 || input.description.length > 2000) {
        throw new Error("Description must be between 50 and 2000 characters");
    }

    if (input.pricePerNight <= 0) {
        throw new Error("Price per night must be greater than 0");
    }

    const now = new Date().toISOString();
    const newProperty: Property = {
        propertyId: `prop_${Date.now()}`,
        title: input.title,
        type: input.type,
        description: input.description,
        addressName: input.addressName,
        city: input.city,
        country: input.country,
        state: input.state,
        codePostale: input.codePostale,
        latitude: input.latitude,
        longitude: input.longitude,
        pricePerNight: input.pricePerNight,
        nbOfGuests: input.nbOfGuests,
        nbOfBedrooms: input.nbOfBedrooms,
        nbOfBeds: input.nbOfBeds,
        nbOfBathrooms: input.nbOfBathrooms,
        status: "DRAFT", // New properties start as DRAFT
        images: [],
        characteristics: input.characteristics.map(char => getCharacteristicById(char.id)),
        ownerId: getCurrentUserId(),
        owner_user_id: getCurrentAuthUserId(),
        createdAt: now,
        lastUpdateAt: now
    };

    mockProperties.push(newProperty);

    return {
        message: "Property created successfully",
        property: newProperty
    };
};

/**
 * Update an existing property
 */
export const updateProperty = async (
    propertyId: string,
    input: UpdatePropertyInput
): Promise<Property> => {
    await delay(600);

    if (simulateError(0.05)) {
        throw new Error("Failed to update property. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to update this property");
    }

    // Update property
    const updatedProperty: Property = {
        ...mockProperties[index],
        ...input,
        characteristics: input.characteristics
            ? input.characteristics.map(char => getCharacteristicById(char.id))
            : mockProperties[index].characteristics,
        lastUpdateAt: new Date().toISOString()
    };

    mockProperties[index] = updatedProperty;

    return updatedProperty;
};

/**
 * Get properties by owner
 */
export const getPropertiesByOwner = async (
    ownerId?: string,
    status?: PropertyStatus
): Promise<Property[]> => {
    await delay(500);

    if (simulateError(0.02)) {
        throw new Error("Failed to fetch properties. Please try again.");
    }

    const userId = ownerId || getCurrentUserId();

    let filteredProperties = mockProperties.filter(p => p.ownerId === userId);

    if (status) {
        filteredProperties = filteredProperties.filter(p => p.status === status);
    }

    // Sort by last update date (newest first)
    filteredProperties.sort((a, b) =>
        new Date(b.lastUpdateAt).getTime() - new Date(a.lastUpdateAt).getTime()
    );

    // Return a copy to prevent mutation
    return filteredProperties.map(p => ({ ...p }));
};

/**
 * Get property by ID
 */
export const getPropertyById = async (
    propertyId: string
): Promise<Property> => {
    await delay(400);

    if (simulateError(0.03)) {
        throw new Error("Failed to fetch property. Please try again.");
    }

    const property = mockProperties.find(p => p.propertyId === propertyId);

    if (!property) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (property.ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to view this property");
    }

    // Return a copy to prevent mutation
    return { ...property };
};

/**
 * Delete a property (soft delete)
 */
export const deleteProperty = async (
    propertyId: string
): Promise<PropertyActionResponse> => {
    await delay(700);

    if (simulateError(0.05)) {
        throw new Error("Failed to delete property. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to delete this property");
    }

    // Soft delete by changing status
    mockProperties[index] = {
        ...mockProperties[index],
        status: "DELETED",
        lastUpdateAt: new Date().toISOString()
    };

    return {
        propertyId,
        status: "DELETED",
        message: "Property deleted successfully"
    };
};

// ==================== PROPERTY STATUS MANAGEMENT ====================

/**
 * Submit property for review (DRAFT -> PENDING)
 */
export const submitPropertyForReview = async (
    propertyId: string
): Promise<PropertyActionResponse> => {
    await delay(600);

    if (simulateError(0.05)) {
        throw new Error("Failed to submit property for review. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to submit this property");
    }

    // Validation - property must have at least one image to be submitted
    if (mockProperties[index].images.length === 0) {
        throw new Error("Property must have at least one image to be submitted for review");
    }

    // Can only submit from DRAFT status
    if (mockProperties[index].status !== "DRAFT") {
        throw new Error(`Cannot submit property from ${mockProperties[index].status} status`);
    }

    mockProperties[index] = {
        ...mockProperties[index],
        status: "PENDING",
        lastUpdateAt: new Date().toISOString()
    };

    return {
        propertyId,
        status: "PENDING",
        message: "Property submitted for review successfully"
    };
};

/**
 * Activate a property (PENDING -> ACTIVE)
 * Note: In real app, this would be admin-only. This is for demo purposes.
 */
export const activateProperty = async (
    propertyId: string
): Promise<PropertyActionResponse> => {
    await delay(600);

    if (simulateError(0.05)) {
        throw new Error("Failed to activate property. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to activate this property");
    }

    // Can only activate from PENDING status
    if (mockProperties[index].status !== "PENDING") {
        throw new Error(`Cannot activate property from ${mockProperties[index].status} status`);
    }

    mockProperties[index] = {
        ...mockProperties[index],
        status: "ACTIVE",
        lastUpdateAt: new Date().toISOString()
    };

    return {
        propertyId,
        status: "ACTIVE",
        message: "Property activated successfully"
    };
};

/**
 * Hide a property (ACTIVE -> HIDDEN)
 */
export const hideProperty = async (
    propertyId: string
): Promise<PropertyActionResponse> => {
    await delay(500);

    if (simulateError(0.05)) {
        throw new Error("Failed to hide property. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to hide this property");
    }

    // Can only hide from ACTIVE status
    if (mockProperties[index].status !== "ACTIVE") {
        throw new Error(`Cannot hide property from ${mockProperties[index].status} status`);
    }

    mockProperties[index] = {
        ...mockProperties[index],
        status: "HIDDEN",
        lastUpdateAt: new Date().toISOString()
    };

    return {
        propertyId,
        status: "HIDDEN",
        message: "Property hidden successfully"
    };
};

/**
 * Unhide a property (HIDDEN -> ACTIVE)
 */
export const unhideProperty = async (
    propertyId: string
): Promise<PropertyActionResponse> => {
    await delay(500);

    if (simulateError(0.05)) {
        throw new Error("Failed to unhide property. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to unhide this property");
    }

    // Can only unhide from HIDDEN status
    if (mockProperties[index].status !== "HIDDEN") {
        throw new Error(`Cannot unhide property from ${mockProperties[index].status} status`);
    }

    mockProperties[index] = {
        ...mockProperties[index],
        status: "ACTIVE",
        lastUpdateAt: new Date().toISOString()
    };

    return {
        propertyId,
        status: "ACTIVE",
        message: "Property unhidden successfully"
    };
};

// ==================== IMAGE MANAGEMENT ====================

/**
 * Upload images for a property
 */
export const uploadPropertyImages = async (
    propertyId: string,
    files: File[]
): Promise<ImageUploadResponse> => {
    await delay(1000); // Simulate upload time

    if (simulateError(0.1)) {
        throw new Error("Failed to upload images. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to upload images for this property");
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
        throw new Error(`Invalid file type. Only ${validTypes.join(', ')} are allowed.`);
    }

    // Validate file sizes (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
        throw new Error("File size must be less than 5MB");
    }

    // Simulate uploaded image paths
    const newImagePaths = files.map((file, i) =>
        `/uploads/properties/${propertyId}/${Date.now()}_${i}_${file.name}`
    );

    // Add new images to property
    mockProperties[index].images.push(...newImagePaths);
    mockProperties[index].lastUpdateAt = new Date().toISOString();

    return {
        message: `${files.length} image(s) uploaded successfully`,
        imagePaths: newImagePaths
    };
};

/**
 * Delete a property image
 */
export const deletePropertyImage = async (
    propertyId: string,
    imagePath: string
): Promise<void> => {
    await delay(400);

    if (simulateError(0.05)) {
        throw new Error("Failed to delete image. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to delete images for this property");
    }

    const imageIndex = mockProperties[index].images.indexOf(imagePath);

    if (imageIndex === -1) {
        throw new Error("Image not found");
    }

    // Remove image
    mockProperties[index].images.splice(imageIndex, 1);
    mockProperties[index].lastUpdateAt = new Date().toISOString();
};

/**
 * Reorder property images
 */
export const reorderPropertyImages = async (
    propertyId: string,
    imagePaths: string[]
): Promise<void> => {
    await delay(300);

    if (simulateError(0.03)) {
        throw new Error("Failed to reorder images. Please try again.");
    }

    const index = mockProperties.findIndex(p => p.propertyId === propertyId);

    if (index === -1) {
        throw new Error("Property not found");
    }

    // Check ownership
    if (mockProperties[index].ownerId !== getCurrentUserId()) {
        throw new Error("You don't have permission to reorder images for this property");
    }

    // Verify all images belong to the property
    const currentImages = mockProperties[index].images;
    const isValidReorder = imagePaths.every(path => currentImages.includes(path)) &&
        imagePaths.length === currentImages.length;

    if (!isValidReorder) {
        throw new Error("Invalid image reorder request");
    }

    mockProperties[index].images = imagePaths;
    mockProperties[index].lastUpdateAt = new Date().toISOString();
};

// ==================== STATISTICS ====================

/**
 * Get property count by owner
 */
export const getPropertyCount = async (
    ownerId?: string
): Promise<PropertyCountResponse> => {
    await delay(300);

    const userId = ownerId || getCurrentUserId();

    // Count only non-deleted properties
    const count = mockProperties.filter(p =>
        p.ownerId === userId && p.status !== "DELETED"
    ).length;

    return { count };
};

/**
 * Get properties by status count
 */
export const getPropertiesByStatusCount = async (
    ownerId?: string
): Promise<Record<PropertyStatus, number>> => {
    await delay(300);

    const userId = ownerId || getCurrentUserId();

    const userProperties = mockProperties.filter(p => p.ownerId === userId);

    return {
        "DRAFT": userProperties.filter(p => p.status === "DRAFT").length,
        "PENDING": userProperties.filter(p => p.status === "PENDING").length,
        "ACTIVE": userProperties.filter(p => p.status === "ACTIVE").length,
        "HIDDEN": userProperties.filter(p => p.status === "HIDDEN").length,
        "DELETED": userProperties.filter(p => p.status === "DELETED").length
    };
};

/**
 * Get available characteristics
 */
export const getAvailableCharacteristics = async (): Promise<Characteristic[]> => {
    await delay(300);

    if (simulateError(0.02)) {
        throw new Error("Failed to fetch characteristics. Please try again.");
    }

    return mockCharacteristics.map(char => ({ ...char }));
};

// ==================== EXPORT ALL FUNCTIONS ====================

export const mockHostApi = {
    // Property CRUD
    createProperty,
    updateProperty,
    getPropertiesByOwner,
    getPropertyById,
    deleteProperty,

    // Status Management
    submitPropertyForReview,
    activateProperty,
    hideProperty,
    unhideProperty,

    // Image Management
    uploadPropertyImages,
    deletePropertyImage,
    reorderPropertyImages,

    // Statistics & Data
    getPropertyCount,
    getPropertiesByStatusCount,
    getAvailableCharacteristics
};

// Default export for convenience
export default mockHostApi;