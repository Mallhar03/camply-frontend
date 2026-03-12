import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, refreshUser } = useAuth();
  const { toast } = useToast();
  // Use a ref to prevent double execution in React Strict Mode
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");

    if (!token) {
      toast({
        title: "Authentication Failed",
        description: "No authentication token found.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    const processAuth = async () => {
      try {
        setAccessToken(token);
        await refreshUser();
        navigate("/profile", { replace: true });
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Could not load user profile.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [searchParams, navigate, setAccessToken, refreshUser, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
