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
      position="top-center"
      expand={false}
      richColors={false}
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0E1B4D] group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_10px_40px_-8px_rgba(14,27,77,0.45)] group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:min-w-[280px] group-[.toaster]:max-w-[440px] group-[.toaster]:gap-3 group-[.toaster]:items-start",
          title:
            "group-[.toast]:text-[13.5px] group-[.toast]:font-semibold group-[.toast]:leading-snug group-[.toast]:tracking-tight group-[.toast]:text-white group-[.toast]:break-words",
          description:
            "group-[.toast]:text-[12.5px] group-[.toast]:text-white/70 group-[.toast]:mt-1 group-[.toast]:leading-relaxed group-[.toast]:break-words",
          actionButton:
            "group-[.toast]:bg-[#1D5CFF] group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:px-4 group-[.toast]:py-1.5 group-[.toast]:transition-all hover:group-[.toast]:brightness-110",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white/80 group-[.toast]:rounded-full group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:transition-all hover:group-[.toast]:bg-white/15",
          closeButton:
            "!left-auto !right-2 !top-2 !bg-white/10 !border-0 !text-white/70 hover:!text-white hover:!bg-white/20 !rounded-full !w-6 !h-6 transition-all",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-emerald-400",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#1D5CFF]",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-400",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-sky-400",
          loading: "",
        },
      }}
      icons={{
        success: (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 ring-1 ring-emerald-400/40 flex items-center justify-center mt-0.5">
            <Check className="h-3.5 w-3.5 text-emerald-300 stroke-[3]" />
          </div>
        ),
        error: (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D5CFF]/25 ring-1 ring-[#1D5CFF]/50 flex items-center justify-center mt-0.5">
            <X className="h-3.5 w-3.5 text-[#F8A6CE] stroke-[3]" />
          </div>
        ),
        warning: (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400/20 ring-1 ring-amber-400/40 flex items-center justify-center mt-0.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-300 stroke-[3]" />
          </div>
        ),
        info: (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-400/20 ring-1 ring-sky-400/40 flex items-center justify-center mt-0.5">
            <Info className="h-3.5 w-3.5 text-sky-300 stroke-[3]" />
          </div>
        ),
        loading: (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center mt-0.5">
            <Loader2 className="h-3.5 w-3.5 text-white animate-spin stroke-[3]" />
          </div>
        ),
      }}
      {...props}
    />

  );
};

export { Toaster, toast };
