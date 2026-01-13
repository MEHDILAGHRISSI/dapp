// src/pages/PropertiesListPage.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Filter,
    Search,
    Loader2,
    Map as MapIconLucide,
    X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePropertiesStore } from '../hooks/usePropertiesStore';
import { MapView } from '../components/MapView';
import PropertyCard from '../components/PropertieCard';
import type { PropertyType, SearchFilters, SortByField, SortDirection, PropertySummary } from '../types/properties.types';
import MapLibreGL from "maplibre-gl";

const PropertiesListPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        properties,
        loading,
        error,
        searchProperties,
        pagination,
        fetchCharacteristics,
        fetchCharacteristicTypes
    } = usePropertiesStore();

    // Local state for filter inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<PropertyType | 'ALL'>('ALL');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [guestCount, setGuestCount] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
    const [showMap, setShowMap] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const mapRef = useRef<MapLibreGL.Map>(null);

    const handleLocationClick = useCallback((e: React.MouseEvent, property: PropertySummary) => {
        e.stopPropagation();
        if (!showMap) {
            setShowMap(true);
        }
        // Small delay to ensure map is visible if we just toggled it
        setTimeout(() => {
            mapRef.current?.flyTo({
                center: [property.longitude, property.latitude],
                zoom: 14,
                duration: 2000,
                essential: true
            });
        }, 100);
    }, [showMap]);

    // Initial fetch
    useEffect(() => {
        fetchCharacteristics();
        fetchCharacteristicTypes();
    }, [fetchCharacteristics, fetchCharacteristicTypes]);

    // Construct search filters
    const currentFilters: SearchFilters = useMemo(() => {
        let sortField: SortByField = 'createdAt';
        let sortDirection: SortDirection = 'DESC';

        switch (sortBy) {
            case 'price-asc':
                sortField = 'pricePerNight';
                sortDirection = 'ASC';
                break;
            case 'price-desc':
                sortField = 'pricePerNight';
                sortDirection = 'DESC';
                break;
            case 'newest':
                sortField = 'createdAt';
                sortDirection = 'DESC';
                break;
        }

        return {
            city: searchTerm || undefined,
            type: selectedType !== 'ALL' ? selectedType : undefined,
            minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
            maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
            nbOfGuests: guestCount || undefined,
            page: 0,
            size: 12,
            sortBy: sortField,
            sortDir: sortDirection
        };
    }, [searchTerm, selectedType, priceRange, guestCount, sortBy]);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchProperties(currentFilters);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [currentFilters, searchProperties]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedType('ALL');
        setPriceRange([0, 1000]);
        setGuestCount(null);
        setSortBy('newest');
        setShowAdvancedFilters(false);
    }, []);

    const PROPERTY_TYPES: PropertyType[] = [
        'VILLA', 'APARTMENT', 'HOUSE', 'CONDO', 'CABIN',
        'TINY_HOUSE', 'CASTLE', 'TREEHOUSE', 'BOAT', 'CAMPER'
    ];

    return (
        <div className={`bg-gray-50 ${showMap ? 'h-[calc(100vh-76px)] overflow-hidden' : 'min-h-screen'}`}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col`}>
                {/* Horizontal Search & Filters Section */}
                <div className="bg-white rounded-2xl shadow-sm px-4 py-3 mb-4 shrink-0">
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">

                        {/* 🔍 Rounded Search */}
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search city, area, landmark..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="
          pl-11 h-11
          rounded-full
          bg-gray-50
          border border-gray-200
          focus:bg-white
          focus:ring-2 focus:ring-primary-cyan/30
        "
                            />
                        </div>

                        {/* Property Type */}
                        <Select
                            value={selectedType}
                            onValueChange={(v: PropertyType | 'ALL') => setSelectedType(v)}
                        >
                            <SelectTrigger className="h-11 w-[160px] rounded-lg">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                {PROPERTY_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Guests */}
                        <Select
                            value={guestCount?.toString() || 'any'}
                            onValueChange={(v) => setGuestCount(v === 'any' ? null : Number(v))}
                        >
                            <SelectTrigger className="h-11 w-[140px] rounded-lg">
                                <SelectValue placeholder="Guests" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any guests</SelectItem>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <SelectItem key={n} value={n.toString()}>
                                        {n}+ guests
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select
                            value={sortBy}
                            onValueChange={(v: 'price-asc' | 'price-desc' | 'newest') => setSortBy(v)}
                        >
                            <SelectTrigger className="h-11 w-[160px] rounded-lg">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-asc">Price ↑</SelectItem>
                                <SelectItem value="price-desc">Price ↓</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Map Toggle */}
                        <div className="flex items-center gap-3 px-4 h-11 rounded-lg border bg-gray-50">
                            <MapIconLucide className="h-4 w-4 text-gray-500" />
                            <Switch
                                checked={showMap}
                                onCheckedChange={setShowMap}
                                className="data-[state=checked]:bg-primary-cyan"
                            />
                        </div>

                        {/* Filters */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="h-11 rounded-full"
                        >
                            <Filter className="h-4 w-4 mr-1" />
                            Filters
                        </Button>

                        {/* Clear */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-11 w-11 p-0 rounded-full text-gray-500 flex items-center justify-center"
                            aria-label="Clear Filters"
                        >
                            <X className="h-5 w-5" />
                        </Button>


                    </div>
                </div>



                {/* Results Header */}
                <div className="mb-4 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading properties...
                                    </span>
                                ) : (
                                    `Found ${pagination.totalElements} properties`
                                )}
                            </h2>
                            {!loading && properties.length > 0 && (
                                <p className="text-gray-600 text-sm mt-1">
                                    {selectedType !== 'ALL' && `Filtered by: ${selectedType.replace('_', ' ')}`}
                                    {guestCount && ` • ${guestCount}+ guests`}
                                    {priceRange[0] > 0 && ` • From $${priceRange[0]}`}
                                    {priceRange[1] < 1000 && ` • Up to $${priceRange[1]}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                            Error loading properties: {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && properties.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary-cyan mx-auto mb-4" />
                                <p className="text-gray-600">Loading properties...</p>
                            </div>
                        </div>
                    ) : properties.length > 0 ? (
                        <div className={`h-full ${showMap ? 'flex gap-8' : ''}`}>
                            {/* Properties Grid - Always shows, but width changes based on map visibility */}
                            <div className={`h-full ${showMap ? 'w-1/2 overflow-y-auto pr-4 custom-scrollbar' : 'w-full overflow-y-auto pb-8'}`}>
                                <div className={`grid grid-cols-1 ${showMap ? 'xl:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                                    {properties.map((property) => (
                                        <PropertyCard
                                            key={property.propertyId}
                                            property={property}
                                            onClick={() => navigate(`/properties/${property.propertyId}`)}
                                            onLocationClick={handleLocationClick}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Map View - Only shows when map is ON and splits the screen */}
                            {showMap && (
                                <div className="flex-1 h-full">
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-100">
                                        <div className="h-full">
                                            <MapView
                                                ref={mapRef}
                                                properties={properties}
                                                onPropertyClick={(propertyId) => navigate(`/properties/${propertyId}`)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* No Results State */
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No properties found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Try adjusting your filters or search term
                            </p>
                            <Button
                                onClick={handleClearFilters}
                                className="bg-primary-cyan hover:bg-primary-cyan-light text-navy-deep"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertiesListPage;