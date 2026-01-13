import React from "react";
import PropertyCard from "@/features/properties/components/PropertieCard";
import { PropertySummary } from "@/features/properties/types/properties.types";
import { MapView } from "@/features/properties/components/MapView";

const Homepage: React.FC = () => {
    // Example fake property
    const fakeProperty: PropertySummary = {
        propertyId: "1",
        title: "Cozy Apartment",
        type: "APARTMENT",
        city: "New York",
        country: "USA",
        latitude: 40.7128,
        longitude: -74.006,
        pricePerNight: 120,
        nbOfGuests: 4,
        nbOfBedrooms: 2,
        nbOfBeds: 2,
        nbOfBathrooms: 1,
        status: "ACTIVE",
        ownerId: "owner-123",
        images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
        ],
        characteristics: [],
        createdAt: new Date().toISOString(),
        lastUpdateAt: new Date().toISOString(),
    };

    return (
        <>
            <MapView properties={[fakeProperty]} featuredProperty={fakeProperty} />
        </>
    );
};

export default Homepage;
