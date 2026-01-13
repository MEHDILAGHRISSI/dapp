import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, ArrowRight, ArrowLeftIcon } from "lucide-react";
import { PROPERTY_CATEGORIES, AMENITIES } from "@/lib/constants";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import { useCreateProperty } from "./Hooks";
import { toast } from "@/components/ui/use-toast";
import { PropertyAmenity, PropertyType, CreatePropertyRequest } from "@/types/property";

export default function AddProperty() {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    createProperty,
    loading: isLoading,
    error,
    success,
    clearMessages,
  } = useCreateProperty();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    imageUrl: "",
    propertyType: "" as PropertyType | "",
    address: "",
    city: "",
    state: "",
    country: "France",
    zipCode: "",
    latitude: 48.8566,
    longitude: 2.3522,
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: [] as PropertyAmenity[],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity as PropertyAmenity]
        : prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.propertyType || !formData.description || !formData.city) {
          alert("Please fill in all required fields (Title, Type, Description, City)");
          return false;
        }
        return true;
      case 2:
        if (!formData.pricePerNight) {
          alert("Please set the price per night");
          return false;
        }
        if (parseFloat(formData.pricePerNight) <= 0) {
          alert("Price must be greater than 0");
          return false;
        }
        return true;
      case 3:
        if (!formData.imageUrl) {
          alert("Please add at least one property image URL");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    try {
      clearMessages();

      const requestData: CreatePropertyRequest = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType as PropertyType,
        address: formData.address || formData.city, // Fallback if address empty
        city: formData.city,
        state: formData.state || "Île-de-France",
        country: formData.country,
        zipCode: formData.zipCode || "75000",
        latitude: formData.latitude,
        longitude: formData.longitude,
        pricePerNight: parseFloat(formData.pricePerNight),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        maxGuests: parseInt(formData.maxGuests) || 1,
        amenities: formData.amenities,
      };

      await createProperty(requestData);

      toast({
        title: "Success!",
        description: "Property created successfully!",
      });
      window.location.href = "/my-properties";
    } catch (err: any) {
      toast({
        title: "Error",
        description: error || "Failed to create property",
        variant: "destructive",
      });
    }
  };

  // Sample image URLs for demo
  const sampleImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  // Progress Steps
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Pricing" },
    { number: 3, title: "Images" },
    { number: 4, title: "Details" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="space-y-8 p-4 md:p-6 lg:p-8 xl:p-20">
        {/* Header with Return Button */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#182a3a]">
              List Your Property
            </h1>
            <p className="text-muted-foreground">Create a new rental listing</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 md:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                      ? "bg-[#182a3a] border-[#182a3a] text-white"
                      : "border-gray-300 text-gray-300"
                    } font-semibold transition-all duration-300`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 font-medium ${currentStep >= step.number
                      ? "text-[#182a3a]"
                      : "text-gray-300"
                    }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-4 ${currentStep > step.number ? "bg-[#182a3a]" : "bg-gray-300"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#182a3a]">
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Modern Downtown Apartment"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        handleInputChange("propertyType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category.toUpperCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property, its features, and what makes it special..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Avenue..."
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Paris, New York..."
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Region</Label>
                    <Input
                      id="state"
                      placeholder="Île-de-France..."
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="75008..."
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#182a3a]">Pricing</CardTitle>
                <CardDescription>Set your price per night</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price Per Night *</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.pricePerNight}
                    onChange={(e) =>
                      handleInputChange("pricePerNight", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Pricing Summary */}
                {formData.pricePerNight && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 text-[#182a3a]">
                        Pricing Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Price Per Night:</span>
                          <span className="font-medium text-[#182a3a]">
                            €{formData.pricePerNight}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#182a3a]">
                  Property Images
                </CardTitle>
                <CardDescription>
                  Add photos to showcase your property (Currently supports 1 main image URL)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Sample Images */}
                <div className="space-y-2">
                  <Label>Or choose from sample images:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sampleImages.map((url, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${formData.imageUrl === url
                            ? "border-[#182a3a]"
                            : "border-muted hover:border-[#182a3a]/50"
                          }`}
                        onClick={() => handleInputChange("imageUrl", url)}
                      >
                        <img
                          src={url}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-20 md:h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Preview:</Label>
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={formData.imageUrl}
                        alt="Property preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Property Details & Amenities */}
          {currentStep === 4 && (
            <div className="space-y-6 md:space-y-8">
              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#182a3a]">
                    Property Details
                  </CardTitle>
                  <CardDescription>
                    Specify the size and layout of your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          handleInputChange("bedrooms", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          handleInputChange("bathrooms", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.maxGuests}
                        onChange={(e) =>
                          handleInputChange("maxGuests", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#182a3a]">Amenities</CardTitle>
                  <CardDescription>
                    Select the amenities available in your property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {AMENITIES.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity as PropertyAmenity)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 border-[#182a3a] text-[#182a3a] hover:bg-[#182a3a] hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Précédent</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#182a3a] text-white hover:bg-[#182a3a]/90 flex items-center space-x-2"
              >
                <span>Suivant</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#182a3a] text-white hover:bg-[#182a3a]/90 flex items-center space-x-2"
              >
                {isLoading ? (
                  "Creating Property..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>List Property</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
