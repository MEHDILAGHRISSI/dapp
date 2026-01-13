import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Filter, Home, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useHostStore } from '../hooks/useHostStore';
import { PropertyStatus } from '@/features/properties/types/properties.types';
import { useToast } from "@/components/ui/use-toast";

const MyProperties: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        myProperties,
        loading: isLoading,
        fetchMyProperties,
        deleteProperty,
        submitProperty,
        hideProperty,
        showProperty
    } = useHostStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<PropertyStatus | "ALL">("ALL");

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteProperty(id);
                toast({
                    title: "Success",
                    description: "Property deleted successfully",
                });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete property",
                    variant: "destructive"
                });
            }
        }
    };

    const handleStatusAction = async (id: string, action: 'activate' | 'hide' | 'submit') => {
        try {
            if (action === 'activate') await showProperty(id);
            else if (action === 'hide') await hideProperty(id);
            else if (action === 'submit') await submitProperty(id);

            toast({
                title: "Success",
                description: `Property status updated successfully`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update property status",
                variant: "destructive"
            });
        }
    };

    const filteredProperties = myProperties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.city.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || property.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: PropertyStatus) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
            case 'HIDDEN': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100';
            case 'DELETED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            default: return '';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white">My Properties</h1>
                    <p className="text-text-muted dark:text-gray-400">Manage and edit your property listings.</p>
                </div>
                <Button
                    onClick={() => navigate('/host/properties/create')}
                    className="bg-primary-cyan hover:bg-primary-cyan-light text-navy-deep font-semibold"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add New Property
                </Button>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <Tabs defaultValue="ALL" className="w-[400px]" onValueChange={(val) => setStatusFilter(val as PropertyStatus | "ALL")}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="ALL">All</TabsTrigger>
                            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                            <TabsTrigger value="PENDING">Pending</TabsTrigger>
                            <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search properties..."
                            className="pl-9 bg-slate-50 dark:bg-gray-800/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && filteredProperties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading properties...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProperties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                        No properties found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProperties.map((property) => (
                                    <TableRow key={property.propertyId}>
                                        <TableCell>
                                            <div className="h-12 w-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                {property.images?.[0] ? (
                                                    <img
                                                        src={property.images?.[0]}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        <Home className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {property.title}
                                            <div className="text-xs text-slate-600 md:hidden">{property.city}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{property.city}, {property.country}</TableCell>
                                        <TableCell>${property.pricePerNight}<span className="text-xs text-slate-500">/night</span></TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                                {property.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                                            {new Date(property.lastUpdateAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigate(`/host/properties/${property.propertyId}`)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/properties/${property.propertyId}`)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Preview
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />

                                                    {property.status === 'DRAFT' && (
                                                        <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'submit')}>
                                                            Submit for Review
                                                        </DropdownMenuItem>
                                                    )}

                                                    {property.status === 'ACTIVE' && (
                                                        <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'hide')}>
                                                            Hide Listing
                                                        </DropdownMenuItem>
                                                    )}

                                                    {property.status === 'HIDDEN' && (
                                                        <DropdownMenuItem onClick={() => handleStatusAction(property.propertyId, 'activate')}>
                                                            Activate Listing
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(property.propertyId)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default MyProperties;
