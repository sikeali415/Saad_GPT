import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NeumorphicCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[#dde2e8] rounded-[22px] shadow-[12px_12px_24px_#a4afc2,-12px_-12px_24px_#ffffff] p-8", className)}>
    {children}
  </div>
);

export const NeumorphicInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "w-full px-5 py-[15px] mb-5 border-none outline-none rounded-[22px] bg-[#dde2e8] shadow-[inset_9px_9px_18px_#a4afc2,inset_-9px_-9px_18px_#ffffff] text-sm text-[#4c5563] placeholder:text-[#8c98a9]",
      props.className
    )}
  />
);

export const NeumorphicButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn(
      "px-8 py-3 border-none cursor-pointer text-[15px] font-semibold color-[#4c5563] rounded-[22px] bg-[#dde2e8] shadow-[9px_9px_18px_#a4afc2,-9px_-9px_18px_#ffffff] transition-all duration-200 active:shadow-[inset_7px_7px_14px_#a4afc2,inset_-7px_-7px_14px_#ffffff]",
      props.className
    )}
  >
    {children}
  </button>
);
