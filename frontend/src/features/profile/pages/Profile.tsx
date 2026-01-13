// src/pages/Settings/Profile/Profile.tsx
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useWalletStore } from "@/features/auth/store/WalletStore";
import { useProfileStore } from "@/features/profile/store/profileStore"; // Updated import
import useUpdateProfile from "@/features/profile/hooks/useUpdateProfile";
import {
  User,
  Mail,
  Wallet,
  MapPin,
  Phone,
  Building,
  Star,
  Copy,
  Check,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user: authUser } = useAuthStore();
  const { walletAddress } = useWalletStore();
  const [isEditing, setIsEditing] = useState(false);
  
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
  });

  // Use the global profile store
  const { 
    user: fetchedUser, 
    loading: fetchLoading, 
    error: fetchError, 
    fetchUserProfile,
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

  const defaultProfileImages = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  ];

  const getProfileImage = () => {
    return fetchedUser?.profile_image || defaultProfileImages[0];
  };

  // Get the wallet address to display (prefer real-time from store, fallback to fetched user data)
  const displayWalletAddress = walletAddress ;


  // Sync form data with fetched user
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
        profile_image: fetchedUser.profile_image || getProfileImage(),
      });
    }
  }, [fetchedUser]);

  // Handle toast notifications
  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      clearSuccess();
      
      // Refresh profile data after successful update
      if (authUser?.userId) {
        fetchUserProfile(authUser.userId);
      }
    }
    if (updateError) {
      toast.error(updateError);
      clearUpdateError();
    }
    if (fetchError) {
      toast.error(fetchError);
      clearFetchError();
    }
  }, [
    success, 
    updateError, 
    fetchError, 
    clearSuccess, 
    clearUpdateError, 
    clearFetchError, 
    authUser?.userId, 
    fetchUserProfile
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.userId) return;

    try {
      await updateUserProfile(authUser.userId, formData);
      // Profile will be refreshed via the success effect
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
        profile_image: fetchedUser.profile_image || getProfileImage(),
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const fullName = `${fetchedUser?.firstname || ""} ${fetchedUser?.lastname || ""}`.trim() || "User";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and view your activity
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-[#182a3a] border-[#182a3a] text-white hover:bg-[#182a3a]/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={updateLoading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={updateLoading}
                        className="bg-[#182a3a] border-[#182a3a] text-white hover:bg-[#182a3a]/90"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={formData.firstname}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                          placeholder="First Name"
                          disabled={updateLoading}
                        />
                        <Input
                          value={formData.lastname}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                          placeholder="Last Name"
                          disabled={updateLoading}
                        />
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold">{fullName}</h3>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <span>Member since 2024</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      id="email"
                      label="Email"
                      icon={Mail}
                      value={fetchedUser?.email || ""}
                      readOnly
                    />

                    <InputField
                      id="phone"
                      label="Phone"
                      icon={Phone}
                      value={isEditing ? formData.phone : (fetchedUser?.phone || "")}
                      onChange={(v) => setFormData(prev => ({ ...prev, phone: v }))}
                      readOnly={!isEditing}
                      disabled={updateLoading}
                    />

                    <InputField
                      id="date_of_birth"
                      label="Date of Birth"
                      icon={Calendar}
                      type="date"
                      value={isEditing ? formData.date_of_birth : (fetchedUser?.date_of_birth || "")}
                      onChange={(v) => setFormData(prev => ({ ...prev, date_of_birth: v }))}
                      readOnly={!isEditing}
                      disabled={updateLoading}
                    />

                    <InputField
                      id="country"
                      label="Country"
                      icon={MapPin}
                      value={isEditing ? formData.country : (fetchedUser?.country || "")}
                      onChange={(v) => setFormData(prev => ({ ...prev, country: v }))}
                      readOnly={!isEditing}
                      disabled={updateLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="city"
                      label="City"
                      value={isEditing ? formData.city : (fetchedUser?.city || "")}
                      onChange={(v) => setFormData(prev => ({ ...prev, city: v }))}
                      readOnly={!isEditing}
                      disabled={updateLoading}
                    />
                    <InputField
                      id="state"
                      label="State"
                      value={isEditing ? formData.state : (fetchedUser?.state || "")}
                      onChange={(v) => setFormData(prev => ({ ...prev, state: v }))}
                      readOnly={!isEditing}
                      disabled={updateLoading}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.address || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        disabled={updateLoading}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-md">
                        {fetchedUser?.address || "No address provided"}
                      </p>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span>Wallet Address</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 text-sm bg-muted rounded font-mono">
                        {displayWalletAddress
                          ? formatAddress(displayWalletAddress)
                          : "No wallet address"}
                      </code>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <StatsCard />
          </div>

          {/* Recent Activity */}
          <RecentActivityCard />
        </div>
      </main>
    </div>
  );
};

// Helper Components
function InputField({
  id,
  label,
  value = "",
  onChange,
  readOnly,
  icon: Icon,
  type = "text",
  disabled = false,
}: {
  id: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  icon?: any;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center space-x-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        className={readOnly ? "bg-muted" : ""}
      />
    </div>
  );
}

function StatsCard() {
  const stats = [
    { label: "Properties Owned", value: "0" },
    { label: "Properties Rented", value: "0" },
    { label: "Total Transactions", value: "0" },
    { label: "Success Rate", value: "0%" },
  ];

  const financials = [
    { label: "Portfolio Value", value: "0.00 ETH" },
    { label: "Monthly Income", value: "0.00 ETH" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5" />
          <span>Activity Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            {financials.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Reputation Score</span>
            <span className="font-medium ml-auto">4.8/5.0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>
          Your latest property and rental activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Building className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Profile;