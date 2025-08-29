import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputWithKeyboard } from "@/components/ui/input-with-keyboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, resetPasswordForEmail, loading } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoginLoading(true);
    setLoginError("");

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError("Invalid email or password. Please try again.");
        } else if (error.message.includes('Email not confirmed')) {
          setLoginError("Please check your email and click the confirmation link before logging in.");
        } else {
          setLoginError(error.message);
        }
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (err) {
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;

    setForgotPasswordLoading(true);

    try {
      const { error } = await resetPasswordForEmail(forgotPasswordEmail);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
        setForgotPasswordOpen(false);
        setForgotPasswordEmail("");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Production Manager</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
          <p className="text-xs text-muted-foreground mt-2">
            Session duration is automatically configured based on your user settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <InputWithKeyboard
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <InputWithKeyboard
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <div className="text-center">
                <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-sm text-muted-foreground">
                      Forgot Password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleForgotPassword}>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="forgot-email" className="text-sm font-medium">
                            Email
                          </label>
                          <InputWithKeyboard
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email address"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={forgotPasswordLoading}>
                          {forgotPasswordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}