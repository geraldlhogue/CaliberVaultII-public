import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';

export function useFormValidation<T extends ZodSchema>(
  options: {
    schema: T;
    defaultValues?: z.infer<T>;
  } & Omit<UseFormProps<z.infer<T>>, 'resolver'>
): UseFormReturn<z.infer<T>> {
  const { schema, ...formOptions } = options;
  
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...formOptions,
  });
}

export function useFormValidationWithDefaults<T extends ZodSchema>(
  schema: T,
  defaultValues: z.infer<T>
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  });
}
