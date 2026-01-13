// src/features/properties/types/mock.properties.ts

import type {
    Property,
    PropertySummary,
    Characteristic,
    CharacteristicType,
    PropertyType,
    PropertyStatus,
} from './properties.types';

// ==================== MOCK CHARACTERISTIC TYPES ====================

export const mockCharacteristicTypes: CharacteristicType[] = [
    {
        id: 1,
        name: 'Amenities',
        description: 'Basic amenities and facilities',
        iconPath: '/icons/amenities.svg',
    },
    {
        id: 2,
        name: 'Safety',
        description: 'Safety and security features',
        iconPath: '/icons/safety.svg',
    },
    {
        id: 3,
        name: 'Entertainment',
        description: 'Entertainment options',
        iconPath: '/icons/entertainment.svg',
    },
];

// ==================== MOCK CHARACTERISTICS ====================

export const mockCharacteristics: Characteristic[] = [
    {
        id: 1,
        name: 'WiFi',
        iconPath: '/icons/wifi.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 2,
        name: 'Air Conditioning',
        iconPath: '/icons/ac.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 3,
        name: 'Kitchen',
        iconPath: '/icons/kitchen.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 4,
        name: 'Parking',
        iconPath: '/icons/parking.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 5,
        name: 'Pool',
        iconPath: '/icons/pool.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 6,
        name: 'Smoke Detector',
        iconPath: '/icons/smoke-detector.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[1],
    },
    {
        id: 7,
        name: 'First Aid Kit',
        iconPath: '/icons/first-aid.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[1],
    },
    {
        id: 8,
        name: 'TV',
        iconPath: '/icons/tv.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[2],
    },
    {
        id: 9,
        name: 'Gym',
        iconPath: '/icons/gym.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
    {
        id: 10,
        name: 'Pet Friendly',
        iconPath: '/icons/pet.svg',
        isActive: true,
        typeCaracteristique: mockCharacteristicTypes[0],
    },
];

// ==================== MOCK PROPERTIES ====================

export const mockProperties: Property[] = [
    {
        propertyId: 'prop-001',
        title: 'Luxury Beachfront Villa with Ocean View',
        type: 'VILLA' as PropertyType,
        description:
            'Experience paradise in this stunning beachfront villa featuring panoramic ocean views, private pool, and direct beach access. Perfect for families or groups seeking an unforgettable vacation.',
        addressName: '123 Ocean Drive',
        city: 'Miami Beach',
        country: 'USA',
        state: 'Florida',
        codePostale: '33139',
        latitude: 25.7907,
        longitude: -80.13,
        pricePerNight: 450,
        nbOfGuests: 8,
        nbOfBedrooms: 4,
        nbOfBeds: 5,
        nbOfBathrooms: 3,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-001',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440001',
        images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[1], // AC
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[3], // Parking
            mockCharacteristics[4], // Pool
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[7], // TV
        ],
        createdAt: '2024-01-15T10:30:00Z',
        lastUpdateAt: '2024-01-20T14:45:00Z',
    },
    {
        propertyId: 'prop-002',
        title: 'Modern Downtown Apartment',
        type: 'APARTMENT' as PropertyType,
        description:
            'Stylish and modern apartment in the heart of downtown. Walking distance to restaurants, shops, and entertainment. Perfect for business travelers or couples.',
        addressName: '456 Main Street, Apt 12B',
        city: 'New York',
        country: 'USA',
        state: 'New York',
        codePostale: '10001',
        latitude: 40.7128,
        longitude: -74.006,
        pricePerNight: 180,
        nbOfGuests: 2,
        nbOfBedrooms: 1,
        nbOfBeds: 1,
        nbOfBathrooms: 1,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-002',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440002',
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[1], // AC
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[7], // TV
            mockCharacteristics[8], // Gym
        ],
        createdAt: '2024-02-01T08:15:00Z',
        lastUpdateAt: '2024-02-05T16:20:00Z',
    },
    {
        propertyId: 'prop-003',
        title: 'Cozy Mountain Cabin Retreat',
        type: 'CABIN' as PropertyType,
        description:
            'Escape to nature in this charming mountain cabin. Surrounded by pine trees with stunning mountain views. Features a fireplace, hot tub, and hiking trails nearby.',
        addressName: '789 Mountain Trail',
        city: 'Aspen',
        country: 'USA',
        state: 'Colorado',
        codePostale: '81611',
        latitude: 39.1911,
        longitude: -106.8175,
        pricePerNight: 320,
        nbOfGuests: 6,
        nbOfBedrooms: 3,
        nbOfBeds: 4,
        nbOfBathrooms: 2,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-003',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440003',
        images: [
            'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
            'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[3], // Parking
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[6], // First Aid Kit
            mockCharacteristics[7], // TV
        ],
        createdAt: '2024-01-10T12:00:00Z',
        lastUpdateAt: '2024-01-25T09:30:00Z',
    },
    {
        propertyId: 'prop-004',
        title: 'Charming Parisian House',
        type: 'HOUSE' as PropertyType,
        description:
            'Beautiful traditional house in the heart of Paris. Close to the Eiffel Tower and Louvre Museum. Experience authentic Parisian living with modern amenities.',
        addressName: '15 Rue de la Paix',
        city: 'Paris',
        country: 'France',
        codePostale: '75002',
        latitude: 48.8566,
        longitude: 2.3522,
        pricePerNight: 280,
        nbOfGuests: 5,
        nbOfBedrooms: 3,
        nbOfBeds: 3,
        nbOfBathrooms: 2,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-004',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440004',
        images: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[1], // AC
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[7], // TV
        ],
        createdAt: '2024-01-20T15:45:00Z',
        lastUpdateAt: '2024-02-10T11:00:00Z',
    },
    {
        propertyId: 'prop-005',
        title: 'Luxury Penthouse Condo',
        type: 'CONDO' as PropertyType,
        description:
            'Spectacular penthouse with 360-degree city views. Features floor-to-ceiling windows, rooftop terrace, and access to building amenities including pool and fitness center.',
        addressName: '888 Skyline Boulevard, PH1',
        city: 'Los Angeles',
        country: 'USA',
        state: 'California',
        codePostale: '90012',
        latitude: 34.0522,
        longitude: -118.2437,
        pricePerNight: 550,
        nbOfGuests: 4,
        nbOfBedrooms: 2,
        nbOfBeds: 2,
        nbOfBathrooms: 2,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-005',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440005',
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
            'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[1], // AC
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[3], // Parking
            mockCharacteristics[4], // Pool
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[7], // TV
            mockCharacteristics[8], // Gym
        ],
        createdAt: '2024-02-05T09:00:00Z',
        lastUpdateAt: '2024-02-15T13:30:00Z',
    },
    {
        propertyId: 'prop-006',
        title: 'Unique Treehouse Experience',
        type: 'TREEHOUSE' as PropertyType,
        description:
            'One-of-a-kind treehouse nestled in ancient oak trees. Eco-friendly design with modern comforts. Perfect for nature lovers and adventure seekers.',
        addressName: '321 Forest Lane',
        city: 'Portland',
        country: 'USA',
        state: 'Oregon',
        codePostale: '97201',
        latitude: 45.5152,
        longitude: -122.6784,
        pricePerNight: 220,
        nbOfGuests: 2,
        nbOfBedrooms: 1,
        nbOfBeds: 1,
        nbOfBathrooms: 1,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-006',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440006',
        images: [
            'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[6], // First Aid Kit
        ],
        createdAt: '2024-01-05T14:20:00Z',
        lastUpdateAt: '2024-01-18T10:15:00Z',
    },
    {
        propertyId: 'prop-007',
        title: 'Pet-Friendly Suburban Home',
        type: 'HOUSE' as PropertyType,
        description:
            'Spacious family home with large backyard, perfect for pets. Quiet neighborhood with parks nearby. Fully equipped for a comfortable extended stay.',
        addressName: '555 Oak Avenue',
        city: 'Austin',
        country: 'USA',
        state: 'Texas',
        codePostale: '78701',
        latitude: 30.2672,
        longitude: -97.7431,
        pricePerNight: 195,
        nbOfGuests: 6,
        nbOfBedrooms: 3,
        nbOfBeds: 4,
        nbOfBathrooms: 2,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-007',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440007',
        images: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
            'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[1], // AC
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[3], // Parking
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[7], // TV
            mockCharacteristics[9], // Pet Friendly
        ],
        createdAt: '2024-01-28T11:30:00Z',
        lastUpdateAt: '2024-02-08T15:45:00Z',
    },
    {
        propertyId: 'prop-008',
        title: 'Historic Castle Estate',
        type: 'CASTLE' as PropertyType,
        description:
            'Live like royalty in this restored 18th-century castle. Features grand halls, tower rooms, and sprawling gardens. Ideal for special occasions and memorable gatherings.',
        addressName: 'Castle Road',
        city: 'Edinburgh',
        country: 'Scotland',
        codePostale: 'EH1 2NG',
        latitude: 55.9533,
        longitude: -3.1883,
        pricePerNight: 890,
        nbOfGuests: 12,
        nbOfBedrooms: 6,
        nbOfBeds: 8,
        nbOfBathrooms: 5,
        status: 'ACTIVE' as PropertyStatus,
        ownerId: 'owner-008',
        owner_user_id: '550e8400-e29b-41d4-a716-446655440008',
        images: [
            'https://images.unsplash.com/photo-1585009545958-c0d5e6f4e2e5?w=800',
            'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800',
        ],
        characteristics: [
            mockCharacteristics[0], // WiFi
            mockCharacteristics[2], // Kitchen
            mockCharacteristics[3], // Parking
            mockCharacteristics[5], // Smoke Detector
            mockCharacteristics[6], // First Aid Kit
            mockCharacteristics[7], // TV
        ],
        createdAt: '2024-01-12T16:00:00Z',
        lastUpdateAt: '2024-01-30T12:20:00Z',
    },
];

// ==================== MOCK PROPERTY SUMMARIES ====================

export const mockPropertySummaries: PropertySummary[] = mockProperties.map(
    (property) => ({
        propertyId: property.propertyId,
        title: property.title,
        type: property.type,
        pricePerNight: property.pricePerNight,
        city: property.city,
        country: property.country,
        latitude: property.latitude,
        longitude: property.longitude,
        nbOfGuests: property.nbOfGuests,
        nbOfBedrooms: property.nbOfBedrooms,
        nbOfBeds: property.nbOfBeds,
        nbOfBathrooms: property.nbOfBathrooms,
        status: property.status,
        images: property.images,
        characteristics: property.characteristics,
        ownerId: property.ownerId,
        createdAt: property.createdAt,
        lastUpdateAt: property.lastUpdateAt,
    })
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a mock property by ID
 */
export const getMockPropertyById = (propertyId: string): Property | undefined => {
    return mockProperties.find((p) => p.propertyId === propertyId);
};

/**
 * Get mock properties by city
 */
export const getMockPropertiesByCity = (city: string): Property[] => {
    return mockProperties.filter(
        (p) => p.city.toLowerCase() === city.toLowerCase()
    );
};

/**
 * Get mock properties by type
 */
export const getMockPropertiesByType = (type: PropertyType): Property[] => {
    return mockProperties.filter((p) => p.type === type);
};

/**
 * Get mock properties by price range
 */
export const getMockPropertiesByPriceRange = (
    minPrice: number,
    maxPrice: number
): Property[] => {
    return mockProperties.filter(
        (p) => p.pricePerNight >= minPrice && p.pricePerNight <= maxPrice
    );
};

/**
 * Get mock properties by guest capacity
 */
export const getMockPropertiesByGuests = (nbOfGuests: number): Property[] => {
    return mockProperties.filter((p) => p.nbOfGuests >= nbOfGuests);
};

/**
 * Get random mock properties
 */
export const getRandomMockProperties = (count: number): Property[] => {
    const shuffled = [...mockProperties].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, mockProperties.length));
};
