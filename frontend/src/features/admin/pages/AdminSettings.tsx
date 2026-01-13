import React from "react";
import AdminProfileSection from "../components/AdminProfileSection";
import { Settings, Shield, Bell, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings: React.FC = () => {
    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                    <Settings className="h-10 w-10 text-primary" />
                    Paramètres Administrateur
                </h1>
                <p className="text-muted-foreground text-lg">
                    Gérez votre profil et vos préférences de sécurité.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 h-12 rounded-lg grid grid-cols-4 w-full md:w-[600px]">
                    <TabsTrigger value="profile" className="rounded-md flex items-center gap-2 py-2">
                        <Shield className="h-4 w-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-md flex items-center gap-2 py-2">
                        <Lock className="h-4 w-4" />
                        Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-md flex items-center gap-2 py-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-md flex items-center gap-2 py-2">
                        <Settings className="h-4 w-4" />
                        Général
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-0">
                    <AdminProfileSection />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800 text-muted-foreground space-y-4">
                        <Lock className="h-12 w-12 mx-auto opacity-20" />
                        <h3 className="text-xl font-medium">Sécurité Administrateur</h3>
                        <p>La gestion du mot de passe et de la double authentification sera bientôt disponible ici.</p>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800 text-muted-foreground space-y-4">
                        <Bell className="h-12 w-12 mx-auto opacity-20" />
                        <h3 className="text-xl font-medium">Centre de Notifications</h3>
                        <p>Configurez vos alertes critiques et rapports quotidiens.</p>
                    </div>
                </TabsContent>

                <TabsContent value="preferences" className="mt-0">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800 text-muted-foreground space-y-4">
                        <Settings className="h-12 w-12 mx-auto opacity-20" />
                        <h3 className="text-xl font-medium">Paramètres Généraux</h3>
                        <p>Langue, fuseau horaire et préférences d'affichage du tableau de bord.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettings;
