import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { CreatePropertyInput, UpdatePropertyInput, PropertyFormData } from '../types/host.types';
import { useHostStore } from '../hooks/useHostStore';
import { usePropertiesStore } from '@/features/properties/hooks/usePropertiesStore';
import { Property } from '@/features/properties/types/properties.types';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditProperty: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use host store for updates and fetching my properties (to ensure ownership)
    const { updateProperty, uploadPropertyImages, myProperties, fetchMyProperties, loading: hostLoading } = useHostStore();

    // We could use propertiesStore to fetch property by ID if not in myProperties,
    // but typically for edit we want to ensure it's in myProperties to verify ownership.
    // If we just fetch via propertiesStore, we might edit a property we don't own (though backend would reject).
    // Let's stick to myProperties. 

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [property, setProperty] = useState<Property | undefined>(undefined);

    useEffect(() => {
        // Ensure my properties are loaded
        if (myProperties.length === 0) {
            fetchMyProperties();
        }
    }, [fetchMyProperties, myProperties.length]);

    useEffect(() => {
        if (id && myProperties.length > 0) {
            const found = myProperties.find(p => p.propertyId === id);
            if (found) {
                setProperty(found);
            } else if (!hostLoading) {
                // Only redirect if not loading (meaning we loaded list and didn't find it)
                // However, wait... fetchMyProperties is async. 
                // We should probably rely on a derived state or better handling.
                // For now, if we loaded and didn't find it, show error.
                // But careful with race conditions.
            }
        }
    }, [id, myProperties, hostLoading]);

    const handleUpdate = async (data: PropertyFormData | UpdatePropertyInput) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            // Check if data has rawImages (it's PropertyFormData)
            // @ts-ignore - PropertyFormData check
            const { rawImages, ...updateData } = data;

            await updateProperty(id, updateData);

            if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
                await uploadPropertyImages(id, rawImages);
                toast({
                    title: "Images Uploaded",
                    description: `${rawImages.length} new images uploaded.`,
                });
            }

            toast({
                title: "Success",
                description: "Property updated successfully!",
            });
            navigate('/host/properties');
        } catch (error: any) {
            console.error("Failed to update property:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update property",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hostLoading && !property) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
            </div>
        );
    }

    if (!property && !hostLoading && myProperties.length > 0) {
        // Properties loaded but not found
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-semibold">Property not found</h2>
                <p className="text-gray-500">You may not have permission to edit this property or it does not exist.</p>
                <Button onClick={() => navigate('/host/properties')}>Go Back</Button>
            </div>
        );
    }

    // Case where we are waiting for fetch to complete but myProperties is empty initially
    if (!property) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen w-full">
            <div className="container mx-auto p-6 max-w-4xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-main dark:text-white">Edit Property</h1>
                    <p className="text-text-muted dark:text-gray-400">Update details for {property.title}</p>
                </div>

                <PropertyForm
                    initialData={property}
                    onSubmit={handleUpdate}
                    isSubmitting={isSubmitting}
                    isEdit={true}
                />
            </div>
        </div>
    );
};

export default EditProperty;
