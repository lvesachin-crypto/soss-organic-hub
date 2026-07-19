import { Wrench } from "lucide-react";
import logo from "@/assets/logo.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF6EC] via-white to-[#FFE5F1] px-6">
      <div className="max-w-lg w-full text-center bg-white/80 backdrop-blur-xl border border-[#E8308A]/20 rounded-3xl shadow-2xl p-10">
        <img src={logo} alt="Boostly Pro" className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-lg" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8308A]/10 text-[#E8308A] text-sm font-semibold mb-6">
          <Wrench className="w-4 h-4 animate-pulse" />
          Under Maintenance
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B1E3F] mb-4">
          We'll be right back!
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Boostly Pro is currently undergoing scheduled maintenance to bring you a faster, smoother experience.
          All your data, providers, and orders are safe.
        </p>
        <p className="text-sm text-slate-500">
          Need help? Contact us on Telegram:{" "}
          <a
            href="https://t.me/boostlypro_support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E8308A] font-semibold hover:underline"
          >
            @boostlypro_support
          </a>
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
