import React from "react";
import SettingsLayout from "../components/SettingsLayout";
import {
    History,
    Search,
    Calendar,
    MapPin,
    ChevronRight,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const RentalHistory = () => {
    const navigate = useNavigate();

    // Mock data for the redesign
    const rentals: any[] = [];

    return (
        <SettingsLayout
            title="Historique de location"
            subtitle="Consultez et gérez vos réservations passées et en cours."
        >
            <div className="p-8 sm:p-10">
                {rentals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                            <div className="relative bg-white dark:bg-slate-900 rounded-full p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
                                <History className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight">Aucune location trouvée</h3>
                        <p className="text-muted-foreground max-w-sm mt-3 leading-relaxed">
                            Vous n'avez pas encore effectué de réservation. C'est le moment idéal pour planifier votre prochain séjour !
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Button
                                onClick={() => navigate("/")}
                                size="lg"
                                className="rounded-xl px-10 font-bold shadow-lg shadow-primary/20"
                            >
                                Explorer les annonces
                            </Button>
                            <Button variant="ghost" className="rounded-xl px-8 gap-2">
                                <Filter className="h-4 w-4" />
                                Filtres avancés
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Table or list would go here */}
                    </div>
                )}

                {/* Additional context for empty state or footer */}
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Réservations</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Toutes vos dates de séjour centralisées au même endroit.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Destinations</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Retrouvez les adresses et instructions pour chaque logement.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Search className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Recherche</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Filtrez vos séjours par date, ville ou statut de paiement.</p>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default RentalHistory;
