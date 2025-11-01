import React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { universalFieldsSchema } from '@/lib/validation/schemas';
import { useAddInventoryItem } from '@/hooks/useInventoryQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

/**
 * Example component demonstrating:
 * 1. Form validation with Zod
 * 2. React Hook Form integration
 * 3. React Query mutations
 */
export function ValidatedFormExample() {
  const { register, handleSubmit, formState: { errors }, reset } = 
    useFormValidation(universalFieldsSchema);
  
  const addItem = useAddInventoryItem();

  const onSubmit = async (data: any) => {
    try {
      await addItem.mutateAsync(data);
      reset();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  return (
    <Card className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Item name"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            {...register('category')}
            placeholder="Category"
          />
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            {...register('manufacturer')}
            placeholder="Manufacturer"
          />
        </div>

        <Button 
          type="submit" 
          disabled={addItem.isPending}
          className="w-full"
        >
          {addItem.isPending ? 'Adding...' : 'Add Item'}
        </Button>
      </form>
    </Card>
  );
}
