import React, { useState } from "react";
import SettingsLayout from "../components/SettingsLayout";
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    AlertTriangle,
    ShieldAlert,
    Fingerprint,
    Smartphone,
    Key
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const Security = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    return (
        <SettingsLayout
            title="Sécurité du compte"
            subtitle="Gérez votre mot de passe et renforcez la sécurité de votre accès."
        >
            <div className="p-8 sm:p-10 space-y-10">
                {/* 2FA Alert Section */}
                <Alert variant="warning" className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 rounded-3xl p-6">
                    <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-900 dark:text-amber-200 font-bold ml-2">Authentification à deux facteurs (2FA)</AlertTitle>
                    <AlertDescription className="text-amber-700/80 dark:text-amber-400/80 mt-2 ml-2">
                        Ajoutez une couche de sécurité supplémentaire à votre compte. Cette fonctionnalité sera bientôt disponible pour tous les utilisateurs.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Password Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Modifier le mot de passe
                            </h3>
                            <p className="text-sm text-muted-foreground">Nous vous recommandons d'utiliser un mot de passe unique que vous n'utilisez nulle part ailleurs.</p>
                        </div>

                        <form className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Mot de passe actuel</Label>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-900 rounded-xl pr-12"
                                        placeholder="••••••••"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        className="h-12 bg-slate-50/50 dark:bg-slate-900 rounded-xl pr-12"
                                        placeholder="••••••••"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    className="h-12 bg-slate-50/50 dark:bg-slate-900 rounded-xl"
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4">
                                Mettre à jour le mot de passe
                            </Button>
                        </form>
                    </div>

                    {/* Additional Security Info */}
                    <div className="space-y-8 bg-slate-50/50 dark:bg-slate-800/20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Conseils de sécurité</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                                        <Key className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Utilisez au moins 12 caractères, mélangeant lettres, chiffres et symboles.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                                        <Fingerprint className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Ne partagez jamais votre phrase de récupération de portefeuille ou vos clés privées.</p>
                                </li>
                                <Separator className="opacity-50" />
                                <li className="flex gap-3 opacity-50">
                                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0">
                                        <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Activez les notifications pour être informé de toute activité de connexion inhabituelle.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default Security;
