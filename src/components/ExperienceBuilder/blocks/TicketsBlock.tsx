import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, Plus, Trash2, Users, FileText } from 'lucide-react';
import { ApplicationFormBuilder } from '../ApplicationFormBuilder';
import { TicketsBlockData, TicketTierWithApplication, defaultRequiredFields } from '@/types/applicationForm';

interface TicketsBlockProps {
  data: TicketsBlockData;
  onChange: (data: TicketsBlockData) => void;
}

export const TicketsBlock: React.FC<TicketsBlockProps> = ({ data, onChange }) => {
  // Initialize with default required fields if empty
  const initializeData = () => {
    if (!data.applicationForm?.fields || data.applicationForm.fields.length === 0) {
      onChange({
        ...data,
        applicationForm: {
          fields: [...defaultRequiredFields]
        }
      });
    }
  };

  React.useEffect(() => {
    initializeData();
  }, []);

  const addTier = () => {
    const newTier: TicketTierWithApplication = {
      id: `tier_${Date.now()}`,
      name: 'New Tier',
      price: 0,
      quantity: 10
    };
    const newTiers = [...(data.tiers || []), newTier];
    onChange({ ...data, tiers: newTiers });
  };

  const removeTier = (index: number) => {
    const newTiers = data.tiers.filter((_, i) => i !== index);
    onChange({ ...data, tiers: newTiers });
  };

  const updateTier = (index: number, field: keyof TicketTierWithApplication, value: string | number) => {
    const newTiers = [...data.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange({ ...data, tiers: newTiers });
  };

  const handleApplicationFormChange = (fields: any[]) => {
    onChange({
      ...data,
      applicationForm: { fields }
    });
  };

  const totalCapacity = (data.tiers || []).reduce((sum, tier) => sum + tier.quantity, 0);
  const totalRevenue = (data.tiers || []).reduce((sum, tier) => sum + (tier.price * tier.quantity), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ticket className="w-5 h-5 text-neon-yellow" />
        <h3 className="text-xl font-semibold text-foreground">Ticket Tiers & Applications</h3>
      </div>

      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tiers" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Ticket Tiers
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Application Form
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">

          <div className="space-y-4">
            {(data.tiers || []).map((tier, index) => (
              <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tier Name</label>
                    <Input
                      value={tier.name}
                      onChange={(e) => updateTier(index, 'name', e.target.value)}
                      className="bg-white/5 border-white/10 text-foreground"
                      placeholder="e.g. Early Bird"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price ($)</label>
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateTier(index, 'price', parseInt(e.target.value) || 0)}
                      className="bg-white/5 border-white/10 text-foreground"
                      placeholder="500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Quantity</label>
                    <Input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => updateTier(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="bg-white/5 border-white/10 text-foreground"
                      placeholder="20"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/20 h-10"
                    disabled={(data.tiers || []).length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  Revenue potential: ${(tier.price * tier.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addTier}
              className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-neon-yellow/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>

            {/* Payments Hint */}
            <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
              <p className="text-xs text-neon-cyan">
                💡 Paid tiers require Stripe payouts to be enabled in Settings.
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-dark border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-medium text-foreground">Total Capacity</span>
                </div>
                <span className="text-neon-cyan font-semibold">{totalCapacity} people</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Max Revenue</span>
                <span className="text-neon-green font-semibold">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="application">
          <ApplicationFormBuilder
            fields={data.applicationForm?.fields || defaultRequiredFields}
            tiers={data.tiers || []}
            onFieldsChange={handleApplicationFormChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};