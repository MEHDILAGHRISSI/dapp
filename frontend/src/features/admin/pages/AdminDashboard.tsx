import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Home,
    CheckCircle,
    Clock,
    AlertCircle,
    DollarSign,
    MoreVertical,
    Eye,
    TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAdminStore } from '../hooks/useAdminStore';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const {
        fetchPendingProperties,
        fetchAgents,
        pendingProperties,
        agents,
        loading,
        validateProperty,
        rejectProperty
    } = useAdminStore();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalProperties: 150,
        pendingProperties: 0,
        activeProperties: 120,
        totalAgents: 0,
        totalRevenue: 45000,
        growth: 12.5,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                if (user?.roles?.[0] === 'ADMIN') {
                    await Promise.all([
                        fetchPendingProperties(0, 5),
                        fetchAgents(),
                    ]);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };

        if (user) loadData();
    }, [user, fetchPendingProperties, fetchAgents]);

    useEffect(() => {
        if (user?.roles?.[0] === 'ADMIN') {
            setStats(prev => ({
                ...prev,
                pendingProperties: pendingProperties.length,
                totalAgents: agents.length,
            }));
        }
    }, [pendingProperties, agents, user]);

    const handleApprove = async (id: string) => {
        if (window.confirm('Approuver cette propriété ?')) {
            await validateProperty(id);
        }
    };

    const handleReject = async (id: string) => {
        if (window.confirm('Rejeter cette propriété ? (Pour ajouter un motif, passez par la page Propriétés)')) {
            await rejectProperty(id, { reason: 'Refusé depuis le tableau de bord' });
        }
    };

    if (!user) return null;

    const isAdmin = user.roles[0] === 'ADMIN';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Header Section */}
            <div className="relative -mx-6 -mt-6 lg:-mx-10 lg:-mt-8 px-6 lg:px-10 pt-8 pb-12 bg-gradient-to-br from-navy-deep via-slate-900 to-navy-darker rounded-b-3xl overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                Bonjour, {user.firstname}!
                            </h1>
                            <p className="mt-3 text-lg text-slate-400 max-w-2xl font-light">
                                Voici ce qui se passe sur votre plateforme aujourd'hui.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Dernières 24h
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-xl bg-primary-cyan hover:bg-cyan-600 text-navy-deep font-bold shadow-lg shadow-cyan-500/20"
                            >
                                Télécharger Rapport
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid Inside Hero */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title={isAdmin ? "Agents Totaux" : "Mes Propriétés"}
                            value={isAdmin ? stats.totalAgents : 25}
                            icon={<Users className="h-5 w-5" />}
                            color="blue"
                            trend="+12%"
                            description="vs mois dernier"
                        />
                        <StatCard
                            title="En attente"
                            value={stats.pendingProperties}
                            icon={<Clock className="h-5 w-5" />}
                            color="yellow"
                            trend={stats.pendingProperties > 0 ? `${stats.pendingProperties} nouveaux` : "À jour"}
                            description="Propriétés à vérifier"
                        />
                        <StatCard
                            title="Propriétés Actives"
                            value={stats.activeProperties}
                            icon={<Home className="h-5 w-5" />}
                            color="green"
                            trend="+8%"
                        />
                        <StatCard
                            title="Revenu Total"
                            value={`€${stats.totalRevenue.toLocaleString()}`}
                            icon={<DollarSign className="h-5 w-5" />}
                            color="purple"
                            trend="+15%"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Pending Properties Table */}
                <Card className="lg:col-span-2 rounded-3xl bg-white shadow-xl shadow-navy-darker/5 border border-gray-100 dark:bg-card-dark dark:border-slate-700/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-slate-700/50">
                        <div>
                            <CardTitle className="text-xl font-extrabold text-navy-deep dark:text-white">
                                Propriétés en attente
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-text-muted dark:text-slate-400">
                                Vous avez {pendingProperties.length} propriétés qui attendent votre approbation.
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-cyan hover:text-cyan-700 font-bold underline underline-offset-4"
                            onClick={() => navigate('/admin/properties')}
                        >
                            Voir tout
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex h-[200px] items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-cyan"></div>
                            </div>
                        ) : pendingProperties.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-gray-50 dark:border-slate-700/50">
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400 px-8">Propriété</TableHead>
                                        <TableHead className="hidden md:table-cell text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400">Localisation</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400">Prix</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-text-muted dark:text-slate-400 px-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingProperties.slice(0, 5).map((property) => (
                                        <TableRow key={property.propertyId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-0">
                                            <TableCell className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-11 w-11 rounded-xl border border-gray-100 dark:border-slate-700">
                                                        <AvatarImage src={property.images?.[0]} alt={property.title} className="object-cover" />
                                                        <AvatarFallback className="rounded-xl bg-slate-100 dark:bg-slate-800"><Home className="h-5 w-5 text-text-muted" /></AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-navy-deep dark:text-white truncate max-w-[150px]">{property.title}</span>
                                                        <Badge variant="outline" className="w-fit text-[10px] py-0 mt-1 font-medium">{property.type}</Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-text-muted dark:text-slate-400 text-sm">
                                                {property.city}, {property.country}
                                            </TableCell>
                                            <TableCell className="font-black text-navy-deep dark:text-white">
                                                ${property.pricePerNight}
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl">
                                                        <DropdownMenuItem className="text-emerald-600 rounded-lg" onClick={() => handleApprove(property.propertyId)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive rounded-lg" onClick={() => handleReject(property.propertyId)}>
                                                            <AlertCircle className="mr-2 h-4 w-4" /> Rejeter
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate('/admin/properties')} className="rounded-lg">
                                                            <Eye className="mr-2 h-4 w-4" /> Détails
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-text-muted dark:text-slate-400">
                                <div className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 p-4">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                </div>
                                <p className="font-medium">Toutes les propriétés ont été traitées.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Agents Card */}
                <Card className="lg:col-span-1 rounded-3xl bg-white shadow-xl shadow-navy-darker/5 border border-gray-100 dark:bg-card-dark dark:border-slate-700/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-slate-700/50">
                        <CardTitle className="text-xl font-extrabold text-navy-deep dark:text-white">
                            Agents Récents
                        </CardTitle>
                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/agents')}
                                className="text-primary-cyan hover:text-cyan-700 font-bold underline underline-offset-4"
                            >
                                Gérer
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex flex-col">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse p-4">
                                        <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                                            <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : agents.length > 0 ? (
                                agents.slice(0, 5).map((agent) => (
                                    <div key={agent.userId} className="flex items-center justify-between rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 border-2 border-gray-100 dark:border-slate-700">
                                                <AvatarImage src="" alt={`${agent.firstname} ${agent.lastname}`} />
                                                <AvatarFallback className="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold">
                                                    {agent.firstname[0]}{agent.lastname[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-navy-deep dark:text-white">{agent.firstname} {agent.lastname}</span>
                                                <span className="text-[11px] font-medium text-text-muted dark:text-slate-400 uppercase tracking-tight">{agent.email}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold text-xs">
                                            Actif
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-text-muted dark:text-slate-400 py-8">
                                    Aucun agent trouvé.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;