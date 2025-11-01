import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    description: 'Perfect for personal collections',
    features: [
      'Up to 100 items',
      'Basic reports',
      'Email support',
      'Mobile access',
      'Data export',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$29.99',
    description: 'For serious collectors',
    features: [
      'Unlimited items',
      'Advanced reports',
      'Priority support',
      'API access',
      'Custom fields',
      'Multi-location support',
      'Barcode scanning',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99.99',
    description: 'For businesses and dealers',
    features: [
      'Everything in Professional',
      'Custom reports',
      'Dedicated support',
      'White label options',
      'Team accounts',
      'Compliance reporting',
      'Advanced analytics',
      'SLA guarantee',
    ],
  },
];

export const PricingPlans: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planType: planId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === 'professional' ? 'border-primary shadow-lg' : ''}>
            <CardHeader>
              {plan.id === 'professional' && (
                <div className="text-center mb-2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.id === 'professional' ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include automatic backups, SSL encryption, and GDPR compliance.
        </p>
      </div>
    </div>
  );
};