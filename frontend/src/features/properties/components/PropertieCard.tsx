import React, { useState } from "react";
import {
    BedDouble,
    Bath,
    Maximize,
    MapPin,
    Link as LinkIcon,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { PropertySummary } from "../types/properties.types";

interface PropertyCardProps {
    property: PropertySummary;
    onClick?: () => void;
    onLocationClick?: (e: React.MouseEvent, property: PropertySummary) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onLocationClick }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const images = property.images && property.images.length > 0 ? property.images : [];

    const ImagePlaceholder = () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
            <ImageIcon size={48} strokeWidth={1.5} />
            <span className="text-sm mt-2 font-medium">No image available</span>
        </div>
    );

    const getLocation = () => `${property.city}, ${property.country}`;

    const handlePrev = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div
            className="max-w-[300px] w-full bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 font-sans relative cursor-pointer hover:shadow-xl transition-shadow"
            onClick={onClick}
        >
            {/* --- Image Carousel Section --- */}
            <div className="relative h-64 w-full bg-slate-100">
                {images.length > 0 ? (
                    <img
                        src={images[selectedImageIndex]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                                "https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image";
                        }}
                    />
                ) : (
                    <ImagePlaceholder />
                )}

                {/* Carousel controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}

                {/* Floating buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                    <button className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors">
                        <LinkIcon size={18} />
                    </button>
                    <button
                        className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLocationClick?.(e, property);
                        }}
                    >
                        <MapPin size={18} />
                    </button>
                </div>
            </div>

            {/* --- Content Section --- */}
            <div className="p-5 relative bg-white">
                {/* Title & Price */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-slate-900 truncate pr-4">
                        {property.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 mt-1 whitespace-nowrap">
                        per night
                    </span>
                </div>

                {/* Location & Price */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-500 text-sm truncate pr-4">{getLocation()}</p>
                    <p className="text-xl font-bold text-cyan-600">
                        ${property.pricePerNight}
                    </p>
                </div>

                <hr className="border-slate-100 mb-4" />

                {/* Features */}
                <div className="flex justify-between items-center text-slate-700 mb-2">
                    <div className="flex items-center gap-2">
                        <BedDouble size={20} className="text-slate-400 stroke-[1.5]" />
                        <span className="font-bold text-sm">{property.nbOfBeds}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath size={20} className="text-slate-400 stroke-[1.5]" />
                        <span className="font-bold text-sm">{property.nbOfBathrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Maximize size={20} className="text-slate-400 stroke-[1.5]" />
                        <span className="font-bold text-sm">{property.nbOfBedrooms}</span>
                    </div>
                </div>

                {/* Extra Details */}
                <div className="flex justify-start items-center text-slate-500 text-sm gap-4">
                    <span>Guests: {property.nbOfGuests}</span>
                    {property.characteristics[0] && (
                        <span>{property.characteristics[0].name}</span>
                    )}
                </div>

                {/* Carousel indicators */}
                {images.length > 1 && (
                    <div className="flex justify-center mt-3 gap-2">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`w-2 h-2 rounded-full ${idx === selectedImageIndex ? "bg-cyan-600" : "bg-gray-300"
                                    }`}
                            ></span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
