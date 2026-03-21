import React from 'react';
import { Check, Zap, Shield, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProStatus } from '@/hooks/useProStatus';

export const ProPaywall: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useProStatus();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (planType: 'MONTHLY' | 'YEARLY') => {
    setLoading(planType);
    try {
      const res = await apiFetch<any>('/api/v1/payments/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planType }),
      });

      if (!res.success) throw new Error(res.message);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: res.data.subscription.id,
        name: 'Camply Pro',
        description: `${planType} Subscription`,
        image: '/og-image.svg',
        handler: function (response: any) {
          toast({
            title: "Payment successful! 🎉",
            description: "Your Pro status is being activated. It might take a moment.",
          });
          // Optimistically refetch or wait for webhook
          setTimeout(refetch, 3000);
        },
        prefill: {
          name: user?.username,
          email: user?.email,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Camply Pro</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Level up your campus life</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Get exclusive access to hosted events, team building tools, and advanced social features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Monthly Plan */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Perfect for short-term projects</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">₹59</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem text="Host Unlimited Events" />
              <FeatureItem text="Advanced Team Matching" />
              <FeatureItem text="Pro Badge on Profile" />
              <FeatureItem text="Priority Notifications" />
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={!!loading}
                onClick={() => handleSubscribe('MONTHLY')}
              >
                {loading === 'MONTHLY' ? "Processing..." : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Yearly Plan */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="relative overflow-hidden border-2 border-primary shadow-xl shadow-primary/10">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle>Yearly</CardTitle>
              <CardDescription>For serious student leaders</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">₹589</span>
                <span className="text-muted-foreground ml-1">/year</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureItem text="Everything in Monthly" />
              <FeatureItem text="2 Months Free" />
              <FeatureItem text="Beta Access to New Features" />
              <FeatureItem text="Dedicated Support" />
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!!loading}
                onClick={() => handleSubscribe('YEARLY')}
              >
                {loading === 'YEARLY' ? "Processing..." : "Go Pro Now"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
        <BenefitCard icon={<Shield className="w-6 h-6" />} title="Secure Payments" text="Powered by Razorpay" />
        <BenefitCard icon={<Rocket className="w-6 h-6" />} title="Instant Access" text="Unlock features in seconds" />
        <BenefitCard icon={<Zap className="w-6 h-6" />} title="No Hidden Fees" text="Cancel anytime you want" />
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-3">
    <Check className="w-5 h-5 text-green-500" />
    <span className="text-sm">{text}</span>
  </div>
);

const BenefitCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className="flex flex-col items-center text-center space-y-2 p-4 bg-muted/30 rounded-lg">
    <div className="p-2 bg-background rounded-full shadow-sm text-primary">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);
