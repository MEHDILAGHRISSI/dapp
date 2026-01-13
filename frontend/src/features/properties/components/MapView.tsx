import { forwardRef } from "react";
import { Map, MapMarker, MarkerPopup, MarkerContent, MarkerLabel, MapControls } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import { PropertySummary } from "../types/properties.types";
import MapLibreGL from "maplibre-gl";

interface MapViewProps {
    properties: PropertySummary[];
    featuredProperty?: PropertySummary;
    onPropertyClick?: (propertyId: string) => void;
}

export const MapView = forwardRef<MapLibreGL.Map, MapViewProps>(
    ({ properties, featuredProperty, onPropertyClick }, ref) => {
        return (
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg">
                <Map
                    ref={ref}
                    center={[properties[0]?.longitude || 0, properties[0]?.latitude || 0]}
                    zoom={12}
                >
                    {/* --- Property Markers --- */}
                    {properties.map((property) => (
                        <MapMarker
                            key={property.propertyId}
                            longitude={property.longitude}
                            latitude={property.latitude}
                        >
                            <MarkerContent>
                                <div className="w-4 h-4 bg-primary-cyan rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                                <MarkerLabel position="bottom" className="text-xs font-medium">
                                    ${property.pricePerNight}
                                </MarkerLabel>
                            </MarkerContent>

                            <MarkerPopup className="p-0 w-64">
                                <div className="relative h-32 w-full overflow-hidden rounded-t-md">
                                    {property.images?.[0] ? (
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                            <MapPin size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 space-y-2">
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                            {property.type}
                                        </span>
                                        <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{property.nbOfBeds} bed</span>
                                        <span>{property.nbOfBathrooms} bath</span>
                                        <span>{property.nbOfGuests} guests</span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => onPropertyClick?.(property.propertyId)}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1.5" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}

                    {/* --- Featured Property Popup --- */}
                    {featuredProperty && (
                        <MapMarker
                            longitude={featuredProperty.longitude}
                            latitude={featuredProperty.latitude}
                        >
                            <MarkerContent>
                                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                            </MarkerContent>
                            <MarkerPopup className="p-0 w-72">
                                <div className="flex">
                                    <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-l-md">
                                        {featuredProperty.images?.[0] ? (
                                            <img
                                                src={featuredProperty.images[0]}
                                                alt={featuredProperty.title}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                <MapPin size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-3 space-y-1">
                                        <p className="text-lg font-bold text-foreground">
                                            ${featuredProperty.pricePerNight}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{featuredProperty.nbOfBeds} bed</span>
                                            <span>{featuredProperty.nbOfBathrooms} bath</span>
                                            <span>{featuredProperty.nbOfGuests} guests</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {featuredProperty.city}, {featuredProperty.country}
                                        </p>
                                    </div>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    )}

                    {/* --- Built-in Map Controls --- */}
                    <MapControls
                        position="bottom-right"
                        showZoom={true}
                        showFullscreen={true}
                        showCompass={true}
                        showLocate={true}
                    />
                </Map>
            </div>
        );
    }
);

MapView.displayName = "MapView";
