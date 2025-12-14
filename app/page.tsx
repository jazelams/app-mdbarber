import Link from "next/link";
import { Scissors, Calendar, User, Facebook, MessageCircle, MapPin, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Real */}
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/logo-final.png" alt="Logo La Mano de Dios" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
              La Mano de <span className="text-[#D4AF37]">Dios</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-bold rounded-full hover:bg-[#B8860B] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-2 text-sm uppercase tracking-wide"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Soy Barbero</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-8 overflow-hidden min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="w-full h-full bg-[url('/fondo-barberia-texture.png')] bg-cover bg-center opacity-40" />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center">
          <a
            href="https://www.google.com/maps/place/%F0%9F%92%88La+Mano+De+Dios+Barber%C3%ADa%F0%9F%92%88/@20.9659762,-89.5716248,17z/data=!3m1!4b1!4m6!3m5!1s0x8f56719b53cfb923:0x7fd2598bdb61f11a!8m2!3d20.9659762!4d-89.5690445!16s%2Fg%2F11mvb_4h59?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2 mb-6 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold tracking-wide uppercase hover:bg-[#D4AF37] hover:text-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
          >
            <MapPin className="w-4 h-4" />
            VER EN GOOGLE MAPS
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 uppercase italic leading-tight">
            💈 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F7E7CE]">La Mano De Dios Barbería</span> 💈
          </h1>

          <h2 className="text-xl md:text-3xl font-black text-white mb-6 uppercase tracking-wide max-w-4xl mx-auto leading-relaxed border-y-2 border-[#D4AF37]/20 py-4 my-6">
            SOMOS LA ÚNICA BARBERÍA QUE CORTAMOS CABELLO DE <span className="text-[#D4AF37]">HOMBRES FIELES</span>
          </h2>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8 font-medium">
            Más que un corte, una declaración. Barbería profesional con la mística de los grandes.
          </p>

          <div className="flex flex-col items-center gap-8">
            {/* Main CTA with Scale Effect */}
            <Link
              href="/reservas"
              className="group relative px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-xl font-black rounded-full transition-all duration-300 transform hover:scale-110 shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center gap-3 w-full sm:w-auto uppercase tracking-wider"
            >
              <Calendar className="w-6 h-6" />
              Agendar Ahora
            </Link>

            <div className="flex items-center gap-6 mt-4">
              <a
                href="https://www.facebook.com/share/1AEaSwNezU/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-black border-2 border-[#1877F2] rounded-full text-[#1877F2] transition-all duration-300 transform hover:scale-125 hover:bg-[#1877F2] hover:text-white shadow-[0_0_15px_rgba(24,119,242,0.3)] hover:shadow-[0_0_25px_rgba(24,119,242,0.6)]"
                title="Facebook"
              >
                <Facebook className="w-8 h-8 fill-current" />
              </a>
              <a
                href="https://wa.me/529993931893"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-black border-2 border-[#25D366] rounded-full text-[#25D366] transition-all duration-300 transform hover:scale-125 hover:bg-[#25D366] hover:text-white shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)]"
                title="WhatsApp"
              >
                <MessageCircle className="w-8 h-8 fill-current" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} La Mano de Dios.</p>
        </div>
      </footer>
    </div>
  );
}
