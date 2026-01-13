
import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../hooks/useAdminStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle,
    AlertCircle,
    Eye,
    MoreVertical,
    Clock,
    MapPin,
    DollarSign,
    Search
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { AdminPropertyData } from '../types/admin.types';

const AdminProperties: React.FC = () => {
    const {
        pendingProperties,
        loading,
        fetchPendingProperties,
        validateProperty,
        rejectProperty,
        pendingPropertiesPagination
    } = useAdminStore();

    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingProperties(0, 50); // Fetch mostly all for now to support client side search if needed, better would be backend search
    }, [fetchPendingProperties]);

    const handleApprove = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir approuver cette propriété ?')) {
            await validateProperty(id);
        }
    };

    const handleReject = async () => {
        if (selectedPropertyId && rejectionReason) {
            await rejectProperty(selectedPropertyId, { reason: rejectionReason });
            setIsRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedPropertyId(null);
        }
    };

    const filteredProperties = pendingProperties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Propriétés</h1>
                <p className="text-muted-foreground">
                    Validez les annonces soumises par les hôtes.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>File d'attente de validation</CardTitle>
                            <CardDescription>
                                {pendingProperties.length} propriétés en attente.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-muted-foreground">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <p>Aucune propriété en attente.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Propriété</TableHead>
                                    <TableHead>Hôte</TableHead>
                                    <TableHead>Prix/Nuit</TableHead>
                                    <TableHead>Soumis le</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProperties.map((property: AdminPropertyData) => (
                                    <TableRow key={property.propertyId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 rounded-md border">
                                                    <AvatarImage src={property.images?.[0]} className="object-cover" />
                                                    <AvatarFallback className="rounded-md">Img</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{property.title}</span>
                                                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {property.city}</span>
                                                        <Badge variant="outline" className="text-[10px] py-0">{property.type}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {/* If owner info is available in property data */}
                                                <span className="text-muted-foreground">ID: {property.ownerId.substring(0, 8)}...</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center">
                                                <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                                                {property.pricePerNight}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-2" />
                                                {property.createdAt ? format(new Date(property.createdAt), 'dd MMM yyyy') : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                                                    title="Approuver"
                                                    onClick={() => handleApprove(property.propertyId)}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                                    title="Rejeter"
                                                    onClick={() => {
                                                        setSelectedPropertyId(property.propertyId);
                                                        setIsRejectDialogOpen(true);
                                                    }}
                                                >
                                                    <AlertCircle className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> Voir détails
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refuser la propriété</DialogTitle>
                        <DialogDescription>
                            Veuillez indiquer la raison du refus pour notifier l'hôte.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motif de refus</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ex: Photos floues, description incomplète..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                            Refuser la propriété
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminProperties;
