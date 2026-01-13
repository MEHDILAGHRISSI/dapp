// Updated BecomeHost component - Simplified
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, CheckCircle, ArrowLeft, User, Shield } from "lucide-react";

interface BecomeHostProps {
  onClose: () => void;
  onSignIn: () => void;
  isAuthenticated: boolean;
}

export function BecomeHost({
  onClose,
  onSignIn,
  isAuthenticated,
}: BecomeHostProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: "Info", icon: <Home className="h-4 w-4" /> },
    { number: 2, title: "Details", icon: <Shield className="h-4 w-4" /> },
    { number: 3, title: "Confirm", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Not authenticated - show simple sign in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[#182a3a] rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Become a Host</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sign in to start hosting on DecentRent
            </p>
            <div className="space-y-2">
              <Button
                onClick={onSignIn}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                Sign In
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step content
  const stepContent = {
    1: {
      title: "Welcome to Hosting",
      description: "Earn income by sharing your space with travelers",
      icon: <Home className="h-8 w-8 text-blue-600" />,
      points: [
        "Set your own prices",
        "Flexible availability",
        "Secure blockchain payments",
      ],
    },
    2: {
      title: "What You'll Need",
      description: "Basic requirements to get started",
      icon: <Shield className="h-8 w-8 text-orange-600" />,
      points: ["Property photos", "ID verification", "Wallet connection"],
    },
    3: {
      title: "Ready to Start?",
      description: "Confirm to begin your hosting journey",
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      points: ["3% platform fee", "Instant payout setup", "Host protection"],
    },
  };

  const currentContent = stepContent[currentStep as keyof typeof stepContent];

  const handleConfirm = () => {
    console.log("Host registration started");
    onClose();
    // Navigate to add property page
    window.location.href = "/add-property";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg">Become a Host</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-4 mb-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center gap-1"
              >
                <Badge
                  variant={currentStep >= step.number ? "default" : "outline"}
                  className={`${currentStep >= step.number ? "bg-primary" : ""
                    }`}
                >
                  {step.number}
                </Badge>
                <span className="text-xs text-gray-500">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">{currentContent.icon}</div>
            <h3 className="font-bold text-lg">{currentContent.title}</h3>
            <p className="text-gray-600 text-sm">
              {currentContent.description}
            </p>

            <div className="space-y-2">
              {currentContent.points.map((point, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {point}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : prevStep}
              className="flex-1"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            {currentStep < 3 ? (
              <Button onClick={nextStep} className="flex-1 bg-primary hover:bg-primary/90">
                Continue
              </Button>
            ) : (
              <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
                Start Hosting
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
