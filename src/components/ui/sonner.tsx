import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.18)] group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:min-w-[260px] group-[.toaster]:max-w-[380px] group-[.toaster]:gap-3 group-[.toaster]:items-start",
          title:
            "group-[.toast]:text-[13.5px] group-[.toast]:font-semibold group-[.toast]:leading-snug group-[.toast]:tracking-tight group-[.toast]:text-foreground group-[.toast]:break-words",
          description:
            "group-[.toast]:text-[12.5px] group-[.toast]:text-muted-foreground group-[.toast]:mt-0.5 group-[.toast]:leading-relaxed group-[.toast]:break-words",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:transition-all hover:group-[.toast]:brightness-105",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:transition-all hover:group-[.toast]:bg-muted",
          closeButton:
            "!left-auto !right-2 !top-2 !bg-secondary !border !border-border !text-muted-foreground hover:!text-foreground hover:!bg-muted !rounded-md !w-5 !h-5 transition-all",
          success: "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-emerald-500",
          error: "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-red-500",
          warning: "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-amber-500",
          info: "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-primary",
          loading: "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-border",
        },
      }}
      icons={{
        success: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center mt-0.5">
            <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
          </div>
        ),
        error: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-50 ring-1 ring-red-200 flex items-center justify-center mt-0.5">
            <X className="h-3 w-3 text-red-600 stroke-[3]" />
          </div>
        ),
        warning: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center mt-0.5">
            <AlertTriangle className="h-3 w-3 text-amber-600 stroke-[3]" />
          </div>
        ),
        info: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center mt-0.5">
            <Info className="h-3 w-3 text-primary stroke-[3]" />
          </div>
        ),
        loading: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center mt-0.5">
            <Loader2 className="h-3 w-3 text-muted-foreground animate-spin stroke-[3]" />
          </div>
        ),
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
