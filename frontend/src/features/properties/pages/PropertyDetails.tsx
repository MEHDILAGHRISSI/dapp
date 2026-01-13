import { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  User,
  Calendar,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";

import Footer from "@/components/Layout/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import { usePropertyDetails } from "./usePropertyDetails";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { property, loading, error, fetchPropertyDetails } =
    usePropertyDetails(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      console.log(`📋 Loading property details for ID: ${id}`);
      fetchPropertyDetails(id);
    }
  }, [id, fetchPropertyDetails]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto text-[#182a3a] mb-4" />
            <p className="text-gray-500">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Property Not Found"}
            </h2>
            <Button
              onClick={() => navigate("/browse_properties")}
              className="bg-[#182a3a] text-white hover:bg-[#182a3a]/90"
            >
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : ["https://via.placeholder.com/800x600?text=Property+Image"];

  const getAmenityIcon = (amenity: string) => {
    const amenityIcons: Record<string, JSX.Element> = {
      wifi: <Wifi className="h-5 w-5" />,
      parking: <Car className="h-5 w-5" />,
      pool: <Waves className="h-5 w-5" />,
      gym: <Dumbbell className="h-5 w-5" />,
      garden: <Waves className="h-5 w-5" />,
      concierge: <User className="h-5 w-5" />,
    };
    return (
      amenityIcons[amenity.toLowerCase()] || <CheckCircle className="h-5 w-5" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 pb-12 mt-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/browse_properties")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2 lg:row-span-2">
            <img
              src={
                propertyImages[selectedImage] ||
                propertyImages[0]
              }
              alt={property.title}
              className="w-full h-96 lg:h-full object-cover rounded-l-lg shadow-lg"
            />
          </div>

          {/* Thumbnail Images */}
          {propertyImages.slice(1, 5).map((image, index) => {
            const roundedClass =
              index === 2
                ? "rounded-tr-lg"
                : index === 3
                  ? "rounded-br-lg"
                  : "";

            return (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className={`w-full h-full object-cover cursor-pointer transition-all ${roundedClass} ${selectedImage === index + 1
                      ? "ring-2 ring-[#182a3a]"
                      : "hover:opacity-90"
                    }`}
                  onClick={() => setSelectedImage(index + 1)}
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#182a3a] mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg">
                        {property.address || property.city}, {property.city},{" "}
                        {property.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`rounded-full ${isFavorite
                          ? "bg-red-100 text-red-500 hover:bg-red-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""
                          }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                  <div className="text-center">
                    <Bed className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-[#182a3a]">
                      {property.bedrooms}
                    </div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <Bath className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-[#182a3a]">
                      {property.bathrooms}
                    </div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <Square className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold text-[#182a3a]">
                      {property.maxGuests}
                    </div>
                    <div className="text-sm text-gray-500">Max Guests</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-[#182a3a] mb-4">
                    About this property
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities &&
              property.amenities.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-[#182a3a] mb-6">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3">
                          <div className="text-[#182a3a]">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="text-gray-700 capitalize">
                            {amenity.replace("_", " ").toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Owner Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#182a3a] mb-6">
                  Property Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Property Type</span>
                    <p className="font-semibold text-[#182a3a]">
                      {property.propertyType}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <p className="font-semibold text-[#182a3a]">
                      {property.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Location</span>
                    <p className="font-semibold text-[#182a3a]">
                      {property.city}, {property.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-[#182a3a] mb-2">
                    €{property.pricePerNight}
                  </div>
                  <div className="text-gray-600">per night</div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate" className="text-gray-700">
                      Check-in Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="moveInDate" type="date" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaseDuration" className="text-gray-700">
                      Duration
                    </Label>
                    <select
                      id="leaseDuration"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#182a3a] focus:border-[#182a3a] bg-white"
                    >
                      <option>1 night</option>
                      <option>3 nights</option>
                      <option>7 nights</option>
                      <option>30 nights</option>
                    </select>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per night</span>
                    <span className="text-[#182a3a] font-medium">
                      €{property.pricePerNight}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="text-[#182a3a] font-medium">€10.00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-[#182a3a]">
                      <span>Total</span>
                      <span>€{(property.pricePerNight + 10).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-[#182a3a] text-white hover:bg-[#182a3a]/90 h-12">
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-[#182a3a] text-[#182a3a] hover:bg-[#182a3a] hover:text-white h-12"
                  >
                    Contact Owner
                  </Button>
                </div>

                {/* Security Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Secure transaction</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
