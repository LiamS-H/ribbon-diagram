"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, disabled, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        disabled={disabled}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track
            className={`${
                disabled ? "cursor-not-allowed bg-primary/10" : ""
            } relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20`}
        >
            <SliderPrimitive.Range
                className={` ${
                    disabled ? "bg-primary/20" : ""
                } absolute h-full bg-primary transition-colors`}
            />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={`${
                disabled ? "cursor-not-allowed outline-none rounded-sm" : ""
            }  block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none`}
        />
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
