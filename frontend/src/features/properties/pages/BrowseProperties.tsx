// src/pages/BrowseProperties.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Bed, Bath, Maximize, Loader, MapPin } from "lucide-react";
import Footer from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import { usePublicProperties } from "./usePublicProperties";
import { PropertySearchFilters, PropertyType } from "@/types/property";

interface PillSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function PillSelect({ label, options, value, onChange }: PillSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-none overflow-visible">
        <SelectItem
          value="all"
          className="focus:bg-gray-100 focus:text-[#182a3a] focus:ring-0"
        >
          {label}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="focus:bg-gray-100 focus:text-[#182a3a] focus:ring-0"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function BrowseProperties() {
  const navigate = useNavigate();
  const {
    properties,
    loading,
    error,
    fetchProperties,
    searchProperties,
    totalElements,
  } = usePublicProperties();

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mapView, setMapView] = useState(false);

  const priceOptions = [
    { value: "low", label: "< $150/night" },
    { value: "medium", label: "$150-300/night" },
    { value: "high", label: "$300+/night" },
  ];

  const typeOptions = [
    { value: "VILLA", label: "Villa" },
    { value: "APARTMENT", label: "Apartment" },
    { value: "HOUSE", label: "House" },
    { value: "STUDIO", label: "Studio" },
  ];

  useEffect(() => {
    console.log("🏠 Loading properties from API...");
    fetchProperties(0, 20, "createdAt", "DESC");
  }, [fetchProperties]);

  const handleSearch = async () => {
    const filters: PropertySearchFilters = { page: 0, size: 20 };
    if (searchTerm) filters.city = searchTerm;
    if (typeFilter !== "all") filters.propertyType = typeFilter as PropertyType;
    if (priceFilter === "low") filters.maxPrice = 150;
    else if (priceFilter === "medium") {
      filters.minPrice = 150;
      filters.maxPrice = 300;
    } else if (priceFilter === "high") filters.minPrice = 300;

    await searchProperties(filters);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-10 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#182a3a]">
            {totalElements} Results{" "}
            <span className="font-normal text-gray-500 text-2xl">
              available
            </span>
          </h1>
        </div>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center bg-[#f3f4f6] rounded-full px-4 py-3 w-full max-w-5xl shadow-sm">
            <div className="flex items-center flex-grow px-4">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <Input
                type="text"
                placeholder="Search by city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-[#182a3a] placeholder:text-gray-400 w-full text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Separator
              orientation="vertical"
              className="h-8 bg-gray-300 mx-2"
            />

            <PillSelect
              label="Any Price"
              options={priceOptions}
              value={priceFilter}
              onChange={setPriceFilter}
            />

            <Separator
              orientation="vertical"
              className="h-8 bg-gray-300 mx-2"
            />

            <PillSelect
              label="All Types"
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
            />

            <Button
              onClick={handleSearch}
              disabled={loading}
              className="ml-4 bg-[#182a3a] hover:bg-gray-700 text-white p-3 rounded-full shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-6 ml-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={mapView}
                onCheckedChange={setMapView}
                className="data-[state=checked]:bg-[#182a3a]"
              />
              <span className="font-semibold text-[#182a3a]">Map View</span>
            </div>

            <Select defaultValue="newest">
              <SelectTrigger className="w-[140px] border-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="max-h-none overflow-visible">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && properties.length === 0 && (
          <div className="w-full py-20 text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto text-[#182a3a] mb-4" />
            <p className="text-gray-500">Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="w-full py-20 text-center">
            <p className="text-red-500 text-lg mb-4">❌ {error}</p>
            <Button
              onClick={() => fetchProperties(0, 20, "createdAt", "DESC")}
              className="bg-[#182a3a] text-white hover:bg-gray-700"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="group cursor-pointer border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      property.images?.[0] ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full hover:bg-gray-100 w-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </Button>

                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/95 backdrop-blur text-[#182a3a] font-semibold"
                    >
                      {property.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-semibold text-[#182a3a] truncate pr-2">
                        {property.title}
                      </h3>
                      <span className="text-[#182a3a] font-bold whitespace-nowrap">
                        €{property.pricePerNight}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mt-1 truncate">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city}, {property.country || "France"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 text-xs border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize className="h-3 w-3" />
                      <span>{property.maxGuests} guests</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="w-full py-20 text-center">
            <h3 className="text-xl text-gray-400">No properties found.</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
