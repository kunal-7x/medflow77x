import { useState } from 'react';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import auth from '@/integrations/auth/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Zap, AlertCircle, Eye, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPresetColor, themePresets } from '@/hooks/useThemeColor';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { signIn, signUp, continueAsVisitor } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole>('doctor');

  // Theme-aware logo color
  const accentIndex = parseInt(localStorage.getItem('medflow-theme-color') || '0', 10);
  const accentColor = getPresetColor(themePresets[accentIndex]?.label || 'Gold');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) setError(error);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupEmail || !signupPassword || !signupName) { setError('Please fill in all fields'); return; }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      toast({ title: 'Account created', description: 'Please check your email to verify your account before signing in.' });
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await auth.signInWithOAuth("google");
      if (result?.error) {
        setError(result.error.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/[0.04] blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo — theme-aware */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow rotate-3 hover:rotate-0 transition-transform duration-500"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
          >
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold tracking-tight">MedFlow</h1>
            <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase font-medium">Hospital Management</p>
          </div>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full group mb-3 relative"
        >
          <div className="rounded-2xl p-3.5 flex items-center justify-center gap-3 bg-[#fff] dark:bg-[#fff] text-[#3c4043] font-medium text-sm border border-[#dadce0] hover:bg-[#f8f9fa] hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50">
            {googleLoading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-[#3c4043]" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </div>
        </button>

        {/* Visitor Quick Access */}
        <button
          onClick={continueAsVisitor}
          className="w-full group mb-6 relative"
        >
          <div className="apple-glass p-3.5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 cursor-pointer group-hover:shadow-glow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Continue as Visitor</p>
              <p className="text-xs text-muted-foreground">Explore features — no sign-up needed</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        <Card className="border-border/30 glass-card">
          <Tabs defaultValue="login">
            <div className="px-6 pt-5 pb-0">
              <TabsList className="w-full bg-muted/50">
                <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-background/80">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 data-[state=active]:bg-background/80">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Create Account
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-5 px-6 pb-6">
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="doctor@medflow.com"
                      disabled={loading}
                      className="h-11 bg-muted/30 border-border/40 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="h-11 bg-muted/30 border-border/40 focus:border-primary/50"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold text-sm" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="Dr. John Smith"
                      disabled={loading}
                      className="h-11 bg-muted/30 border-border/40 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="doctor@medflow.com"
                      disabled={loading}
                      className="h-11 bg-muted/30 border-border/40 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      disabled={loading}
                      className="h-11 bg-muted/30 border-border/40 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-role" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</Label>
                    <Select value={signupRole} onValueChange={v => setSignupRole(v as AppRole)}>
                      <SelectTrigger className="h-11 bg-muted/30 border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold text-sm" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Secure access · HIPAA compliant · 256-bit encryption
        </p>
      </div>
    </div>
  );
}
