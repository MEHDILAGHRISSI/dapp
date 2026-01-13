import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { CreatePropertyInput, PropertyFormData } from '../types/host.types';
import { useHostStore } from '../hooks/useHostStore';
import { useToast } from "@/components/ui/use-toast";

const CreateProperty: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { createProperty, uploadPropertyImages } = useHostStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (data: PropertyFormData) => {
        setIsSubmitting(true);
        try {
            // 1. Create Property
            // We strip rawImages from data to match API input if necessary, 
            // but our store handles CreatePropertyInput which doesn't have rawImages.
            // TypeScript might complain about excess properties if we pass PropertyFormData to createProperty directly
            // BUT createProperty in store expects CreatePropertyInput. PropertyFormData extends it.
            // So we can pass it, extra props are usually ignored by spread or we should destruct.
            const { rawImages, ...propertyData } = data;
            const newProperty = await createProperty(propertyData);

            if (!newProperty || !newProperty.propertyId) {
                throw new Error("Failed to get new property ID");
            }

            // 2. Upload Images if any
            if (rawImages && rawImages.length > 0) {
                try {
                    await uploadPropertyImages(newProperty.propertyId, rawImages);
                    toast({
                        title: "Images Uploaded",
                        description: `${rawImages.length} images uploaded successfully.`,
                    });
                } catch (imgError) {
                    console.error("Failed to upload images:", imgError);
                    toast({
                        title: "Warning",
                        description: "Property created but failed to upload images.",
                        variant: "destructive"
                    });
                }
            }

            toast({
                title: "Success",
                description: "Property created successfully!",
            });
            navigate('/host/properties');
        } catch (error: any) {
            console.error("Failed to create property:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create property",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen w-full">
            <div className="container mx-auto p-6 max-w-4xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-main dark:text-white">Create New Listing</h1>
                    <p className="text-text-muted dark:text-gray-400">Add a new property to your portfolio.</p>
                </div>

                <PropertyForm
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default CreateProperty;
