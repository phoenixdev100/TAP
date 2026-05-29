import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 48, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 
        className="animate-spin text-primary" 
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
