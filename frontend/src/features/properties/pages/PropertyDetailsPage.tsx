// src/pages/PropertyDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    MapPin,
    Users,
    Bed,
    BedDouble,
    Bath,
    Star,
    Share2,
    Heart,
    Calendar,
    Check,
    Wifi,
    Wind,
    Car,
    Waves,
    Tv,
    Dumbbell,
    PawPrint,
    Shield,
    Plus,
    Minus,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";
import { usePropertiesStore } from '../hooks/usePropertiesStore';
import { Property, Characteristic } from '../types/properties.types';

const PropertyDetailsPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const {
        currentProperty: property,
        loading,
        error,
        fetchPropertyById,
        resetCurrentProperty,
        fetchNearbyProperties
    } = usePropertiesStore();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [relatedProperties, setRelatedProperties] = useState<any[]>([]); // Temporarily any until mapped properly
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Fetch property details
    useEffect(() => {
        if (propertyId) {
            fetchPropertyById(propertyId);

            // Temporary strategy for related properties: 
            // In a real scenario, we might want to fetch nearby properties based on lat/long of the current property
            // We will do this after the property is loaded
        }

        return () => {
            resetCurrentProperty();
        };
    }, [propertyId, fetchPropertyById, resetCurrentProperty]);

    // Fetch related/nearby properties when property is loaded
    useEffect(() => {
        const loadRelated = async () => {
            if (property && property.latitude && property.longitude) {
                setRelatedLoading(true);
                try {
                    const response = await fetchNearbyProperties({
                        latitude: property.latitude,
                        longitude: property.longitude,
                        radius: 10, // 10km radius
                        page: 0,
                        size: 3
                    });
                    // Filter out current property
                    setRelatedProperties(response.content.filter(p => p.propertyId !== property.propertyId).slice(0, 3));
                } catch (e) {
                    console.error("Failed to load related properties", e);
                } finally {
                    setRelatedLoading(false);
                }
            }
        };

        loadRelated();
    }, [property, fetchNearbyProperties]);

    // Group characteristics by type
    const groupedCharacteristics = property?.characteristics?.reduce((acc, char) => {
        const type = char.typeCaracteristique?.name || 'Other';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(char);
        return acc;
    }, {} as Record<string, Characteristic[]>) || {};

    // Get icon component for characteristic
    const getCharacteristicIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case 'wifi':
                return Wifi;
            case 'air conditioning':
                return Wind;
            case 'parking':
                return Car;
            case 'pool':
                return Waves;
            case 'tv':
                return Tv;
            case 'gym':
                return Dumbbell;
            case 'pet friendly':
                return PawPrint;
            case 'smoke detector':
            case 'first aid kit':
                return Shield;
            default:
                return Check;
        }
    };

    const calculateTotalPrice = () => {
        if (!checkInDate || !checkOutDate || !property) return 0;
        const nights = Math.ceil(
            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return nights * property.pricePerNight;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error ? 'Error' : 'Property Not Found'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error || "The property you're looking for doesn't exist."}
                    </p>
                    <Link
                        to="/properties"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to="/properties"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Properties
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <span className="text-gray-600">
                                        {property.addressName}, {property.city}, {property.country}
                                        {property.state && `, ${property.state}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                    <span className="font-semibold">4.89</span>
                                    <span className="text-gray-600">(128 reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <Heart
                                    className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                                />
                            </button>
                            <button className="p-2 rounded-full hover:bg-gray-100">
                                <Share2 className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Property Details */}
                    <div className="lg:w-2/3">
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <div className="relative h-96 rounded-2xl overflow-hidden mb-4">
                                <img
                                    src={property.images?.[selectedImageIndex] || 'https://images.unsplash.com/photo-1600596542815-2a4d04774c13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={`${property.title} - Main view`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {property.images?.slice(0, 4).map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`relative h-24 rounded-lg overflow-hidden ${selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${property.title} - View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this property</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div className="text-center">
                                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600">Guests</div>
                                    <div className="text-lg font-semibold">{property.nbOfGuests}</div>
                                </div>
                                <div className="text-center">
                                    <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600">Bedrooms</div>
                                    <div className="text-lg font-semibold">{property.nbOfBedrooms}</div>
                                </div>
                                <div className="text-center">
                                    <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600">Beds</div>
                                    <div className="text-lg font-semibold">{property.nbOfBeds}</div>
                                </div>
                                <div className="text-center">
                                    <Bath className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600">Bathrooms</div>
                                    <div className="text-lg font-semibold">{property.nbOfBathrooms}</div>
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-8">
                                {property.description}
                            </p>

                            {/* Characteristics */}
                            <div className="space-y-8">
                                {Object.entries(groupedCharacteristics).map(([type, chars]) => (
                                    <div key={type}>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{type}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {chars.map((char) => {
                                                const Icon = getCharacteristicIcon(char.name);
                                                return (
                                                    <div key={char.id} className="flex items-center gap-3">
                                                        <Icon className="h-5 w-5 text-green-600" />
                                                        <span className="text-gray-700">{char.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-700">
                                    {property.addressName}, {property.city}, {property.country}
                                    {property.state && `, ${property.state}`}
                                </span>
                            </div>
                            <div className="h-80 w-full rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                <Map
                                    center={[property.longitude, property.latitude]}
                                    zoom={15}
                                >
                                    <MapMarker
                                        longitude={property.longitude}
                                        latitude={property.latitude}
                                    >
                                        <MarkerContent>
                                            <div className="size-5 rounded-full bg-primary-cyan border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                                        </MarkerContent>
                                        <MarkerTooltip>{property.title}</MarkerTooltip>
                                        <MarkerPopup className="p-0 w-64 overflow-hidden">
                                            <div className="p-3">
                                                <h4 className="font-semibold text-gray-900 mb-1">{property.title}</h4>
                                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {property.city}, {property.country}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-navy-deep">${property.pricePerNight} <span className="text-xs font-normal text-gray-500">/ night</span></span>
                                                </div>
                                            </div>
                                        </MarkerPopup>
                                    </MapMarker>
                                </Map>
                            </div>
                        </div>

                        {/* Related Properties */}
                        {!relatedLoading && relatedProperties.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Similar properties nearby
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {relatedProperties.map((relatedProp) => (
                                        <Link
                                            key={relatedProp.propertyId}
                                            to={`/properties/${relatedProp.propertyId}`}
                                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <img
                                                src={relatedProp.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-2a4d04774c13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                                alt={relatedProp.title}
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2">
                                                    {relatedProp.title}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600 text-sm">
                                                        {relatedProp.city}, {relatedProp.country}
                                                    </span>
                                                    <span className="font-bold text-gray-900">
                                                        ${relatedProp.pricePerNight}/night
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${property.pricePerNight}
                                        </span>
                                        <span className="text-gray-600"> / night</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span>4.89</span>
                                            <span>·</span>
                                            <span>128 reviews</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Form */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Check-in
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={checkInDate}
                                                    onChange={(e) => setCheckInDate(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Check-out
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={checkOutDate}
                                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Guests
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-lg px-3">
                                            <button
                                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                                className="p-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="flex-1 text-center font-medium">{guests} guest{guests !== 1 ? 's' : ''}</span>
                                            <button
                                                onClick={() => setGuests(Math.min(property.nbOfGuests, guests + 1))}
                                                className="p-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum: {property.nbOfGuests} guests
                                        </p>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                {checkInDate && checkOutDate && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Price breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    ${property.pricePerNight} × {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                                                </span>
                                                <span>${calculateTotalPrice()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Cleaning fee</span>
                                                <span>$75</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Service fee</span>
                                                <span>${(calculateTotalPrice() * 0.12).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
                                                <span>Total</span>
                                                <span>${(calculateTotalPrice() + 75 + calculateTotalPrice() * 0.12).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                                    Reserve Now
                                </button>

                                <p className="text-center text-gray-500 text-sm mt-4">
                                    You won't be charged yet
                                </p>
                            </div>

                            {/* Host Info */}
                            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">About the host</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                                    <div>
                                        <div className="font-medium text-gray-900">Hosted by Owner #{property.ownerId.split('-')[1] || property.ownerId}</div>
                                        <div className="text-sm text-gray-600">Superhost · 2 years hosting</div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Contact Host
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;