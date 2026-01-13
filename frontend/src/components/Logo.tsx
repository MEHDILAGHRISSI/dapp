// src/components/Logo.tsx
import LogoIcon from "@/assets/images/Logo.svg";
import BlackLogo from "@/assets/images/Logo_black.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  textcolor?: string;
  logocolor?: "white" | "black";
}

const Logo = ({
  size = "md",
  className = "",
  showText = true,
  textcolor = "#182a3a",
  logocolor = "black",
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Decide which SVG to show
  const chosenLogo = logocolor === "white" ? LogoIcon : BlackLogo;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <img
        src={chosenLogo}
        alt="RealChain Logo"
        className={sizeClasses[size]}
      />

      {showText && (
        <span
          className="font-bold"
          style={{
            color: textcolor,
            fontSize:
              size === "lg" ? "1.5rem" : size === "md" ? "1.25rem" : "1rem",
          }}
        >
          RealChain
        </span>
      )}
    </div>
  );
};

export default Logo;
