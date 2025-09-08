"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"

const Form = FormProvider

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />
}

const FormItemContext = React.createContext<{ id: string } | undefined>(undefined)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const useFormItemContext = () => {
  const context = React.useContext(FormItemContext)
  if (!context) throw new Error("useFormItemContext must be used within <FormItem>")
  return context
}

const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(error && "text-destructive", className)}
        htmlFor={formItemId}
        {...props}
      />
    )
  },
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()
  return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message) : children
  return (
    <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

function useFormField() {
  const formContext = useFormContext()
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = useFormItemContext()

  if (!fieldContext) throw new Error("useFormField should be used within <FormField>")

  const { getFieldState, formState } = formContext
  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item` as const,
    formDescriptionId: `${id}-form-item-description` as const,
    formMessageId: `${id}-form-item-message` as const,
    error: fieldState.error,
  }
}

const FormFieldContext = React.createContext<{ name: string } | undefined>(undefined)

const FormFieldContextProvider = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <FormFieldContext.Provider value={{ name }}>{children}</FormFieldContext.Provider>
)

function FormFieldWrapper<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  render,
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContextProvider name={name as string}>
      <FormField control={control as any} name={name as any} render={render as any} />
    </FormFieldContextProvider>
  )
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormFieldWrapper as FormField }

