import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, PropertyType, Characteristic } from '@/features/properties/types/properties.types';
import { CreatePropertyInput, UpdatePropertyInput, PropertyFormData } from '../types/host.types';
import { usePropertiesStore } from '@/features/properties/hooks/usePropertiesStore';
import { Loader2, Plus, X, MapPin, Upload } from 'lucide-react';
import { Map, MapMarker, MapControls, useMap } from "@/components/ui/map";
import type { LngLat } from 'maplibre-gl';

// Helper component to handle map events
function MapEvents({ onClick }: { onClick: (e: any) => void }) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = (e: any) => {
            onClick(e);
        };

        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, onClick]);

    return null;
}

interface PropertyFormProps {
    initialData?: Property;
    onSubmit: (data: PropertyFormData | UpdatePropertyInput) => Promise<void>;
    isSubmitting?: boolean;
    isEdit?: boolean;
}

// Helper to define property types
const PROPERTY_TYPES: PropertyType[] = [
    "APARTMENT", "HOUSE", "VILLA", "CONDO", "CABIN", "COTTAGE", "LOFT", "STUDIO"
];

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isSubmitting = false, isEdit = false }) => {
    // Use properties store to fetch characteristics
    const { characteristics, fetchCharacteristics } = usePropertiesStore();

    // Local state for images
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Map state
    const defaultLocation = { latitude: 40.7128, longitude: -74.0060 }; // NYC default
    const [viewState, setViewState] = useState({
        latitude: initialData?.latitude || defaultLocation.latitude,
        longitude: initialData?.longitude || defaultLocation.longitude,
        zoom: 13
    });

    const form = useForm<PropertyFormData>({
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            type: initialData.type,
            pricePerNight: initialData.pricePerNight,
            addressName: initialData.addressName,
            city: initialData.city,
            country: initialData.country,
            state: initialData.state || "",
            codePostale: initialData.codePostale || "",
            latitude: initialData.latitude,
            longitude: initialData.longitude,
            nbOfGuests: initialData.nbOfGuests,
            nbOfBedrooms: initialData.nbOfBedrooms,
            nbOfBeds: initialData.nbOfBeds,
            nbOfBathrooms: initialData.nbOfBathrooms,
            characteristics: initialData.characteristics.map(c => ({ id: c.id })),
            rawImages: []
        } : {
            title: "",
            description: "",
            type: "APARTMENT",
            pricePerNight: 0,
            addressName: "",
            city: "",
            country: "",
            state: "",
            codePostale: "",
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
            nbOfGuests: 1,
            nbOfBedrooms: 1,
            nbOfBeds: 1,
            nbOfBathrooms: 1,
            characteristics: [],
            rawImages: []
        }
    });

    // Cleanup previews
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    useEffect(() => {
        // Fetch characteristics if empty
        if (characteristics.length === 0) {
            fetchCharacteristics();
        }
    }, [characteristics.length, fetchCharacteristics]);

    const handleSubmit = async (data: PropertyFormData) => {
        // Append raw files to data so parent can handle upload
        const submitData = {
            ...data,
            rawImages: selectedFiles
        };
        await onSubmit(submitData);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Validate logic here if needed (size, type)
            // For now simple append

            setSelectedFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveSelectedFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const urlToRemove = previewUrls[index];
        URL.revokeObjectURL(urlToRemove);

        const newPreviews = [...previewUrls];
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleRemoveExistingImage = (index: number) => {
        // In a real app, this might trigger a delete API call or mark for deletion
        // For now just update local view
        const newImages = [...existingImages];
        newImages.splice(index, 1);
        setExistingImages(newImages);
        // Note: we aren't propagating "deleted images" to backend in this mock setup yet unless UpdatePropertyInput supports it
    };

    const handleLocationSelect = (event: { lng: number; lat: number }) => {
        const { lng, lat } = event;
        form.setValue('longitude', lng);
        form.setValue('latitude', lat);
        setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }));
    };

    const handleLocate = (coords: { longitude: number; latitude: number }) => {
        form.setValue('longitude', coords.longitude);
        form.setValue('latitude', coords.latitude);
        setViewState(prev => ({ ...prev, ...coords, zoom: 15 }));
    };

    // Watch coordinates to update marker
    const currentLat = form.watch('latitude');
    const currentLng = form.watch('longitude');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info */}
                    <Card className="md:col-span-2 border-slate-200">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                rules={{ required: "Title is required", minLength: 5 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Modern Downtown Apartment" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PROPERTY_TYPES.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pricePerNight"
                                    rules={{ required: "Price is required", min: 1 }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price per Night ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                rules={{ required: "Description is required", minLength: 50 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe your property..." className="h-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Location with Map */}
                    <Card className="md:col-span-2 border-slate-200">
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                            <FormDescription>Click on the map to set the property location.</FormDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="addressName"
                                    rules={{ required: "Address is required" }}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    rules={{ required: "City is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    rules={{ required: "Country is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="USA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State / Province</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NY" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="codePostale"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Map Component */}
                            <div className="h-[400px] w-full rounded-md border overflow-hidden relative">
                                <Map
                                    center={[viewState.longitude, viewState.latitude]}
                                    zoom={viewState.zoom}
                                // Use standard style for now, user can customize if needed
                                >
                                    <MapEvents onClick={e => handleLocationSelect(e.lngLat)} />
                                    <MapMarker
                                        longitude={currentLng}
                                        latitude={currentLat}
                                        draggable
                                        onDragEnd={handleLocationSelect}
                                    >
                                        <div className="text-primary-cyan drop-shadow-lg">
                                            <MapPin className="h-8 w-8 fill-current" />
                                        </div>
                                    </MapMarker>
                                    <MapControls
                                        showLocate
                                        onLocate={handleLocate}
                                        position="top-left"
                                    />
                                </Map>
                                <div className="absolute bottom-2 left-2 bg-background/80 p-2 rounded text-xs backdrop-blur-sm z-10">
                                    Lat: {currentLat.toFixed(6)}, Lng: {currentLng.toFixed(6)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Property Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 grid-cols-2">
                            <FormField
                                control={form.control}
                                name="nbOfGuests"
                                rules={{ min: 1 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Guests</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nbOfBedrooms"
                                rules={{ min: 0 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bedrooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nbOfBeds"
                                rules={{ min: 0 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Beds</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nbOfBathrooms"
                                rules={{ min: 0 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bathrooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Characteristics */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Amenities & Characteristics</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto">
                            <FormField
                                control={form.control}
                                name="characteristics"
                                render={() => (
                                    <FormItem>
                                        <div className="space-y-2">
                                            {characteristics.map((char) => (
                                                <FormField
                                                    key={char.id}
                                                    control={form.control}
                                                    name="characteristics"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={char.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.some(c => c.id === char.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, { id: char.id }])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value.id !== char.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {char.name} <span className="text-xs text-slate-500">({char.typeCaracteristique.name})</span>
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card className="md:col-span-2 border-slate-200">
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                            <FormDescription>Upload images of your property. Max 10 images.</FormDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {/* Existing Images */}
                                {existingImages.map((img, i) => (
                                    <div key={`existing-${i}`} className="relative aspect-video rounded overflow-hidden group border border-slate-200">
                                        <img src={img} alt={`Property ${i}`} className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveExistingImage(i)}
                                                type="button"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* New File Previews */}
                                {previewUrls.map((url, i) => (
                                    <div key={`new-${i}`} className="relative aspect-video rounded overflow-hidden group border border-primary-cyan/50 ring-2 ring-primary-cyan/20">
                                        <img src={url} alt={`New upload ${i}`} className="object-cover w-full h-full" />
                                        <div className="absolute top-1 right-1 bg-primary-cyan text-xs text-navy-deep px-1.5 py-0.5 rounded font-bold">New</div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveSelectedFile(i)}
                                                type="button"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                <label className="flex flex-col items-center justify-center aspect-video rounded border-2 border-dashed border-slate-300 hover:border-primary-cyan hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-primary-cyan mb-2" />
                                    <span className="text-sm text-slate-500 group-hover:text-primary-cyan font-medium">Add Images</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary-cyan hover:bg-primary-cyan-light text-navy-deep">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update Property" : "Create Property"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PropertyForm;
