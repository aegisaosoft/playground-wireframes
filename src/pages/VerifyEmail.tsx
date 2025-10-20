import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      console.log("🔍 Verifying email with token:", token.substring(0, 20) + "...");
      console.log("📤 Making request to: /Auth/verify-email");
      
      const response = await apiClient.get<{
        success: boolean;
        message: string;
      }>(`/Auth/verify-email?token=${encodeURIComponent(token)}`);

      console.log("📥 Verification response:", response);

      if (response.success) {
        setStatus("success");
        setMessage(response.message);
        toast({
          title: "✨ Email Verified!",
          description: "Your email has been successfully verified.",
          variant: "success",
        });
        
        // Redirect to login or home after 3 seconds
        setTimeout(() => {
          const isLoggedIn = localStorage.getItem("auth_token");
          navigate(isLoggedIn ? "/experiences" : "/");
        }, 3000);
      } else {
        console.error("❌ Verification failed:", response.message);
        setStatus("error");
        setMessage(response.message);
      }
    } catch (error: any) {
      console.error("❌ Email verification error:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      setStatus("error");
      setMessage(error?.message || "Failed to verify email. Please try again.");
      toast({
        title: "❌ Verification Failed",
        description: error?.message || "Failed to verify email",
        variant: "destructive",
      });
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[var(--shadow-neon)] p-8 space-y-6 border border-[#ff66c4]/30">
          {/* Icon */}
          <div className="flex justify-center">
            {status === "verifying" && (
              <div className="relative">
                <div className="absolute inset-0 bg-[#ff66c4] rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[var(--shadow-neon)] border border-[#ff66c4]/50">
                  <Loader2 className="h-16 w-16 text-[#ff66c4] animate-spin" />
                </div>
              </div>
            )}
            
            {status === "success" && (
              <div className="relative">
                <div className="absolute inset-0 bg-[#00FF00] rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[0_0_30px_rgba(0,255,0,0.6)] border border-[#00FF00]/50">
                  <CheckCircle2 className="h-16 w-16 text-[#00FF00]" />
                </div>
              </div>
            )}
            
            {status === "error" && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-60"></div>
                <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[0_0_30px_rgba(255,0,0,0.6)] border border-red-500/50">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            {status === "verifying" && (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] bg-clip-text text-transparent">
                  Verifying Email...
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  Please wait while we verify your email address
                </p>
              </>
            )}
            
            {status === "success" && (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FF00] to-[#00FFFF] bg-clip-text text-transparent">
                  Email Verified!
                </h2>
                <p className="text-[hsl(var(--foreground))] text-sm">
                  {message || "Your email has been successfully verified"}
                </p>
              </>
            )}
            
            {status === "error" && (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Verification Failed
                </h2>
                <p className="text-[hsl(var(--foreground))] text-sm">
                  {message || "Invalid verification token"}
                </p>
              </>
            )}
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-[#00FF00]/10 border border-[#00FF00]/30 rounded-lg p-4 text-center">
              <p className="text-sm text-[hsl(var(--foreground))]">
                Redirecting you to the home page in 3 seconds...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-red-400">
                The verification link may have expired or is invalid.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Please try registering again or contact support if the problem persists.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {status !== "verifying" && (
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] hover:shadow-[var(--shadow-cyan)] text-white font-bold shadow-[var(--shadow-neon)] transition-all uppercase tracking-wider"
            >
              {status === "success" ? "Go to Home" : "Back to Home"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
