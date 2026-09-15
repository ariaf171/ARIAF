import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useStore } from "../lib/store";

interface Logo3DProps {
  light?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo3D({
  light = false,
  size = "md",
  className = "",
  showSubtitle = true,
}: Logo3DProps) {
  const { settings } = useStore();
  const customLogoUrl = light
    ? settings.logo?.light_logo_url || settings.logo?.logo_url
    : settings.logo?.logo_url;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });

  const rotateX = useTransform(springY, [-1, 1], [8, -8]);
  const rotateY = useTransform(springX, [-1, 1], [-10, 10]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const sizeClasses = {
    sm: {
      ar: "text-2xl sm:text-3xl",
      en: "text-[9px] sm:text-[10px] tracking-[0.35em] mt-0.5",
    },
    md: {
      ar: "text-3xl sm:text-4xl",
      en: "text-[11px] sm:text-xs tracking-[0.4em] mt-1",
    },
    lg: {
      ar: "text-5xl sm:text-6xl",
      en: "text-xs sm:text-sm tracking-[0.45em] mt-1.5",
    },
    xl: {
      ar: "text-6xl sm:text-7xl",
      en: "text-sm sm:text-base tracking-[0.55em] mt-2",
    },
  }[size];

  // Gold tone matching the exact screenshot: warm antique gold #ffffffff
  const goldGradient = light
    ? "bg-gradient-to-b from-[#FFFDF8] via-[#E8D4A8] to-[#C9A45C]"
    : "bg-gradient-to-b from-[#C9A45C] via-[#B8934A] to-[#8C6721]";

  const imgHeights = {
    sm: "h-9 max-w-[120px]",
    md: "h-12 max-w-[150px]",
    lg: "h-16 max-w-[200px]",
    xl: "h-24 max-w-[280px]",
  }[size];

  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [customLogoUrl]);

  return (
    <motion.div
      className={`relative inline-block select-none cursor-pointer ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative flex flex-col items-center justify-center"
      >
        {customLogoUrl && !imageError ? (
          <div style={{ transform: "translateZ(25px)" }} className="flex items-center justify-center">
            <img
              src={customLogoUrl}
              alt="أرياف ARAYAF"
              className={`${imgHeights} object-contain filter drop-shadow-sm`}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <>
            {/* Arabic Brand Name: أرياف */}
            <div style={{ transform: "translateZ(30px)" }}>
              <span
                className={`${sizeClasses.ar} font-black font-alexandria tracking-normal leading-none block text-transparent bg-clip-text ${goldGradient} drop-shadow-sm`}
              >
                أريـاف
              </span>
            </div>

            {/* English Brand Subtitle: ARAYAF */}
            {showSubtitle && (
              <div style={{ transform: "translateZ(20px)" }}>
                <span
                  className={`${sizeClasses.en} font-serif font-medium uppercase block text-transparent bg-clip-text ${goldGradient} text-center`}
                >
                  ARAYAF
                </span>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
