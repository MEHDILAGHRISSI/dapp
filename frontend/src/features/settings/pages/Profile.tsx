import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useWalletStore } from "@/shared/stores/wallet.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { toast } from "sonner";
import SettingsLayout from "../components/SettingsLayout";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar as CalendarIcon,
  Camera,
  Wallet,
  Copy,
  CheckCircle2,
  Loader2,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user: authUser } = useAuthStore();
  const { walletAddress } = useWalletStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    user: fetchedUser,
    loading: fetchLoading,
    error: fetchError,
    fetchUserProfile,
    setUser,
    clearError: clearFetchError
  } = useProfileStore();

  const {
    loading: updateLoading,
    error: updateError,
    success,
    updateUserProfile,
    clearError: clearUpdateError,
    clearSuccess
  } = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    address: "",
    date_of_birth: "",
    profile_image: "",
    bio: "",
  });

  useEffect(() => {
    if (authUser?.userId && !fetchedUser) {
      fetchUserProfile(authUser.userId);
    }
  }, [authUser?.userId, fetchedUser, fetchUserProfile]);

  useEffect(() => {
    if (fetchedUser) {
      setFormData({
        firstname: fetchedUser.firstname || "",
        lastname: fetchedUser.lastname || "",
        phone: fetchedUser.phone || "",
        country: fetchedUser.country || "",
        city: fetchedUser.city || "",
        state: fetchedUser.state || "",
        address: fetchedUser.address || "",
        date_of_birth: fetchedUser.date_of_birth || "",
        profile_image: fetchedUser.profile_image || "",
        bio: (fetchedUser as any).bio || "", // Using any because bio might not be in UserData yet
      });
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (success && fetchedUser) {
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      clearSuccess();
      // Update global store manually to avoid extra fetch if needed, 
      // but the service returns the updated user, so let's use it.
    }
    if (updateError) {
      toast.error(updateError);
      clearUpdateError();
    }
    if (fetchError) {
      toast.error(fetchError);
      clearFetchError();
    }
  }, [success, updateError, fetchError, clearSuccess, clearUpdateError, clearFetchError, fetchedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.userId) return;
    try {
      const updatedUser = await updateUserProfile(authUser.userId, formData);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Adresse du portefeuille copiée");
    }
  };

  if (fetchLoading && !fetchedUser) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SettingsLayout
      title="Profil Public"
      subtitle="Gérez vos informations personnelles et votre identité sur la plateforme."
    >
      <div className="space-y-10 p-8 sm:p-10">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-2xl">
              <AvatarImage src={formData.profile_image} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {formData.firstname?.[0]}{formData.lastname?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-white dark:border-slate-800"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{formData.firstname} {formData.lastname}</h3>
              <p className="text-muted-foreground">{fetchedUser?.email}</p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Identité vérifiée
              </Badge>
              <Badge variant="outline" className="gap-1 px-3 py-1 uppercase tracking-wider">
                {fetchedUser?.role || 'CLIENT'}
              </Badge>
            </div>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-xl px-6">
              Modifier le profil
            </Button>
          )}
        </div>

        {/* Wallet Info Card */}
        <Card className="border-none bg-primary/5 dark:bg-primary/10 rounded-3xl overflow-hidden overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-xs text-primary">Portefeuille Connecté</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full">
                <Input
                  readOnly
                  className="h-12 bg-white dark:bg-slate-900 border-none font-mono text-xs pr-12 rounded-xl"
                  value={walletAddress || "Non connecté"}
                />
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${walletAddress ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
              </div>
              <Button variant="secondary" onClick={copyToClipboard} className="h-12 px-6 gap-2 rounded-xl shrink-0">
                <Copy className="h-4 w-4" />
                Copier
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <User className="h-3 w-3" />
              Cette adresse est liée à votre historique et ne peut pas être modifiée ici.
            </p>
          </CardContent>
        </Card>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-sm font-bold ml-1">Prénom</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstname"
                  placeholder="John"
                  className="h-12 pl-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 shadow-inner"
                  value={formData.firstname}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-sm font-bold ml-1">Nom</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastname"
                  placeholder="Doe"
                  className="h-12 pl-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 shadow-inner"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  disabled
                  className="h-12 pl-12 rounded-xl bg-slate-100 dark:bg-slate-800 opacity-70"
                  value={fetchedUser?.email || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-bold ml-1">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+33 6 00 00 00 00"
                  className="h-12 pl-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 shadow-inner"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-bold ml-1">Pays</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="country"
                  placeholder="France"
                  className="h-12 pl-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 shadow-inner"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-bold ml-1">Ville</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  placeholder="Paris"
                  className="h-12 pl-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 shadow-inner"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio" className="text-sm font-bold ml-1">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Dites-nous en plus sur vous..."
                className="min-h-[120px] rounded-2xl bg-slate-50/50 dark:bg-slate-900 shadow-inner resize-none p-4"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="rounded-xl px-8"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updateLoading}
                className="rounded-xl px-8 gap-2 shadow-lg shadow-primary/20"
              >
                {updateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer
              </Button>
            </div>
          )}
        </form>
      </div>
    </SettingsLayout>
  );
};

export default Profile;
