import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Trash2,
    Edit,
    Mail,
    Phone,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Shield,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAdminStore } from '../hooks/useAdminStore';
import { AgentData, CreateAgentInput } from '../types/admin.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Agents: React.FC = () => {
    const { user } = useAuthStore();
    const {
        agents,
        loading,
        error,
        fetchAgents,
        createAgent,
        deleteAgent
    } = useAdminStore();
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [agentsPerPage] = useState(10);
    const [agentToDelete, setAgentToDelete] = useState<{ id: string, name: string } | null>(null);

    // Create agent form state
    const [newAgent, setNewAgent] = useState<CreateAgentInput>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) fetchAgents();
    }, [user, fetchAgents]);

    useEffect(() => {
        const filtered = agents.filter(agent =>
            agent.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agent.phone && agent.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredAgents(filtered);
        setCurrentPage(1);
    }, [searchTerm, agents]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!newAgent.firstname.trim()) errors.firstname = 'Le prénom est requis';
        if (!newAgent.lastname.trim()) errors.lastname = 'Le nom est requis';
        if (!newAgent.email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(newAgent.email)) {
            errors.email = 'L\'email est invalide';
        }
        if (!newAgent.password) {
            errors.password = 'Le mot de passe est requis';
        } else if (newAgent.password.length < 6) {
            errors.password = 'Minimum 6 caractères';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await createAgent(newAgent);
            setShowCreateModal(false);
            setNewAgent({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                phone: '',
            });
            setFormErrors({});
        } catch (error) {
            console.error('Failed to create agent:', error);
        }
    };

    const confirmDelete = async () => {
        if (agentToDelete) {
            try {
                await deleteAgent(agentToDelete.id);
                setAgentToDelete(null);
            } catch (error) {
                console.error('Failed to delete agent:', error);
            }
        }
    };

    // Pagination
    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);
    const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

    if (!user || user.roles[0] !== 'ADMIN') return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Agents</h1>
                    <p className="text-muted-foreground">
                        Gérez les comptes d'agents et leurs permissions.
                    </p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Nouvel Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateAgent}>
                            <DialogHeader>
                                <DialogTitle>Créer un nouvel agent</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour créer un nouveau compte agent.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname">Prénom</Label>
                                        <Input
                                            id="firstname"
                                            placeholder="Jean"
                                            value={newAgent.firstname}
                                            onChange={(e) => setNewAgent({ ...newAgent, firstname: e.target.value })}
                                            className={formErrors.firstname ? "border-destructive" : ""}
                                        />
                                        {formErrors.firstname && <p className="text-xs text-destructive">{formErrors.firstname}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname">Nom</Label>
                                        <Input
                                            id="lastname"
                                            placeholder="Dupont"
                                            value={newAgent.lastname}
                                            onChange={(e) => setNewAgent({ ...newAgent, lastname: e.target.value })}
                                            className={formErrors.lastname ? "border-destructive" : ""}
                                        />
                                        {formErrors.lastname && <p className="text-xs text-destructive">{formErrors.lastname}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jean.dupont@example.com"
                                        value={newAgent.email}
                                        onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                                        className={formErrors.email ? "border-destructive" : ""}
                                    />
                                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newAgent.password}
                                        onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                                        className={formErrors.password ? "border-destructive" : ""}
                                    />
                                    {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone (Optionnel)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="06 12 34 56 78"
                                        value={newAgent.phone}
                                        onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Créer le compte</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtres
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Agents Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredAgents.length === 0 ? (
                        <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                                <Users className="h-10 w-10 text-slate-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium">Aucun agent trouvé</p>
                                <p className="text-muted-foreground">Essaie de modifier tes critères de recherche.</p>
                            </div>
                            <Button variant="outline" onClick={() => setSearchTerm('')}>Effacer la recherche</Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agent</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Rôles</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentAgents.map((agent) => (
                                        <TableRow key={agent.userId}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border">
                                                        <AvatarImage src="" alt={`${agent.firstname} ${agent.lastname}`} />
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {agent.firstname[0]}{agent.lastname[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{agent.firstname} {agent.lastname}</span>
                                                        <span className="text-xs text-muted-foreground">ID: {agent.userId.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Mail className="mr-2 h-3 w-3" />
                                                        {agent.email}
                                                    </div>
                                                    {agent.phone && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Phone className="mr-2 h-3 w-3" />
                                                            {agent.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {agent.roles.map((role) => (
                                                        <Badge key={role} variant="secondary" className="text-[10px] py-0">
                                                            {role === 'AGENT' && <Shield className="mr-1 h-3 w-3" />}
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Actif
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => setAgentToDelete({ id: agent.userId, name: `${agent.firstname} ${agent.lastname}` })}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t">
                                    <p className="text-xs text-muted-foreground">
                                        Affichage de {indexOfFirstAgent + 1} à {Math.min(indexOfLastAgent, filteredAgents.length)} sur {filteredAgents.length} agents
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="text-xs font-medium">Page {currentPage} sur {totalPages}</div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action supprimera le compte de <strong>{agentToDelete?.name}</strong>.
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Agents;