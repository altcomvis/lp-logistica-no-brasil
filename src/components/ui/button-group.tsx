'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '@/lib/utils'
import { CircleCheck } from 'lucide-react'

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex gap-4', className)}
      {...props}
      ref={ref}
    />
  )
})
ButtonGroup.displayName = RadioGroupPrimitive.Root.displayName

const ButtonGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  {
    icon: React.ReactNode
    label: string
  } & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, icon, label, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'relative text-center h-[120px] px-6 rounded-md  bg-black text-white text-base focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-200 data-[state=checked]:bg-zinc-100  data-[state=checked]:text-black data-[state=checked]:shadow-inner',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.RadioGroupIndicator>
        <div className="relative ">
          <div className="absolute -ml-4 pt-2 ">
            <CircleCheck size={20} strokeWidth={1} />
          </div>
        </div>
      </RadioGroupPrimitive.RadioGroupIndicator>
      <div className="flex flex-col justify-center h-full">
        <div className="self-center">{icon}</div>
        <div className="text-sm ">{label}</div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})
ButtonGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { ButtonGroup, ButtonGroupItem }
