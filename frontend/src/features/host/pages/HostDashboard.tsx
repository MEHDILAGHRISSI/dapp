import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Home, FileText, CheckCircle, EyeOff } from 'lucide-react';
import { useHostStore } from '../hooks/useHostStore';
import { PropertyStatus } from '@/features/properties/types/properties.types';

const HostDashboard: React.FC = () => {
    const navigate = useNavigate();
    const {
        myProperties,
        loading: isLoading,
        fetchMyProperties,
    } = useHostStore();

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    // Derive stats from properties
    const stats = useMemo(() => {
        const counts: Record<PropertyStatus, number> = {
            ACTIVE: 0,
            PENDING: 0,
            DRAFT: 0,
            HIDDEN: 0,
            DELETED: 0
        };

        myProperties.forEach(p => {
            if (counts[p.status] !== undefined) {
                counts[p.status]++;
            }
        });

        return counts;
    }, [myProperties]);

    const recentProperties = useMemo(() => {
        return [...myProperties]
            .sort((a, b) => new Date(b.lastUpdateAt).getTime() - new Date(a.lastUpdateAt).getTime())
            .slice(0, 3);
    }, [myProperties]);

    const statCards = [
        {
            title: "Total Properties",
            value: myProperties.length,
            icon: Home,
            description: "All listed properties",
            color: "text-blue-500"
        },
        {
            title: "Active Listings",
            value: stats.ACTIVE,
            icon: CheckCircle,
            description: "Currently visible directly",
            color: "text-green-500"
        },
        {
            title: "Pending Review",
            value: stats.PENDING,
            icon: FileText,
            description: "Awaiting approval",
            color: "text-yellow-500"
        },
        {
            title: "Drafts",
            value: stats.DRAFT,
            icon: EyeOff,
            description: "In progress",
            color: "text-gray-500"
        }
    ];

    return (
        <div className="container mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white">Host Dashboard</h1>
                    <p className="text-text-muted dark:text-gray-400">Manage your listings and view performance.</p>
                </div>
                <Button
                    onClick={() => navigate('/host/properties/create')}
                    className="bg-primary-cyan hover:bg-primary-cyan-light text-navy-deep font-semibold"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add New Property
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading && myProperties.length === 0 ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-[100px]" /></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px]" />
                                <Skeleton className="h-4 w-[140px] mt-1" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    statCards.map((stat, index) => (
                        <Card key={index} className="border-slate-200 dark:border-slate-800 dark:bg-card-dark">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-text-muted dark:text-gray-400">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-text-main dark:text-white">{stat.value}</div>
                                <CardDescription className="text-xs text-slate-600 dark:text-gray-500">{stat.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Recent Properties Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-text-main dark:text-white">Recent Properties</h2>
                    <Button variant="outline" onClick={() => navigate('/host/properties')}>View All</Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading && myProperties.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <CardContent className="p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))
                    ) : recentProperties.length > 0 ? (
                        recentProperties.map((property) => (
                            <Card key={property.propertyId} className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-card-dark hover:shadow-lg transition-shadow">
                                <div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800">
                                    {property.images?.length > 0 ? (
                                        <img
                                            src={property.images?.[0]}
                                            alt={property.title}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Home className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-semibold text-white uppercase">
                                        {property.status}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg text-text-main dark:text-white truncate">{property.title}</h3>
                                    <CardDescription className="text-slate-600 dark:text-gray-400 text-sm mb-3">
                                        {property.city}, {property.country}
                                    </CardDescription>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary-cyan">${property.pricePerNight}<span className="text-xs text-gray-500 font-normal">/night</span></span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/host/properties/${property.propertyId}`)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 mb-4">You don't have any properties listed yet.</p>
                            <Button onClick={() => navigate('/host/properties/create')}>Create your first listing</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
