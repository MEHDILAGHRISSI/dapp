import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  Plus,
  Eye,
  CreditCard as Edit,
  Loader,
} from "lucide-react";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer";
import { useProperties } from "./Hooks/useProperties";
import { Property } from "@/types/property";

export default function MyPropertiesPage() {
  const { properties, loading, error, fetchMyProperties } = useProperties();

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  const handleEdit = (id: string) => {
    // Navigate to edit page (not implemented yet)
    // window.location.href = `/edit-property/${id}`;
    alert(`Edit property ${id} - Coming soon`);
  };

  const handleView = (id: string) => {
    window.location.href = `/property/${id}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="space-y-8 p-6 lg:p-20">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                My Properties
              </h1>
              <p className="text-gray-600">
                Manage your property portfolio
              </p>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = "/add-property")}
            className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            List New Property
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg max-w-[400px]">
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-white data-[state=active]:text-[#1b2e3f] data-[state=active]:shadow-sm transition-all"
              >
                My Listings ({properties.length})
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="data-[state=active]:bg-white data-[state=active]:text-[#1b2e3f] data-[state=active]:shadow-sm transition-all"
                disabled
              >
                Archived (0)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {properties.length === 0 ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Building className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No properties listed
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start building your real estate portfolio by listing your
                      first property.
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/add-property")}
                      className="bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d]/90 font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      List Your First Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property: Property) => (
                    <Card
                      key={property.id}
                      className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={property.images?.[0] || "https://via.placeholder.com/300"}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          className={`absolute top-2 right-2 ${property.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                            } border`}
                        >
                          {property.status}
                        </Badge>
                      </div>

                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-gray-900 truncate pr-2">
                              {property.title}
                            </CardTitle>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.city}, {property.country || "France"}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 border-gray-200"
                          >
                            {property.propertyType}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        <CardDescription className="text-gray-600 line-clamp-2">
                          {property.description}
                        </CardDescription>

                        {/* Property Details */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>{property.bedrooms} bed</span>
                            <span>{property.bathrooms} bath</span>
                            <span>{property.maxGuests} guests</span>
                          </div>
                        </div>

                        {/* Rental Info */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Price Per Night:
                            </span>
                            <span className="font-semibold text-[#1b2e3f]">
                              €{property.pricePerNight}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(property.id)}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(property.id)}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Footer />
    </div>
  );
}
