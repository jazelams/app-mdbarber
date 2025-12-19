import Link from "next/link";
import { Scissors, Calendar, User, Facebook, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import TypewriterText from "@/components/TypewriterText";
import WireframeWaves from "@/components/WireframeWaves";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Encabezado (Header) con Logo y Botón de Login para Barberos */}
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

      {/* Sección Hero (Principal) */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-8 overflow-hidden min-h-[calc(100vh-80px)]">
        {/* Fondo con textura e imagen superpuesta */}
        <div className="absolute inset-0 z-0">
          {/* Imagen de fondo */}
          <div className="w-full h-full bg-[url('/fondo-barberia-texture.png')] bg-cover bg-center opacity-40" />

          {/* Gradient Oscuro General (para legibilidad superior) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />

          {/* Efecto Wireframe Mountain (Ondas Digitales Doradas) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[12vh] z-20 opacity-60 blur-[2px] pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)'
            }}
          >
            <WireframeWaves />
          </div>

          {/* Sombra base para asegurar legibilidad */}
          {/* Sombra base para asegurar legibilidad */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center">
          {/* Botón flotante de Google Maps */}
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
            &quot; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] animate-shimmer">La Mano De Dios Barbería</span> &quot;
          </h1>

          <h2 className="text-xl md:text-3xl font-black text-white mb-6 uppercase tracking-wide max-w-4xl mx-auto leading-relaxed border-y-2 border-[#D4AF37]/20 py-4 my-6 min-h-[120px] flex items-center justify-center">
            <TypewriterText
              text="SOMOS LA ÚNICA BARBERÍA QUE CORTAMOS CABELLO DE HOMBRES FIELES"
              speed={40}
              delay={500}
              loop={true}
              className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] animate-shimmer"
            />
          </h2>

          <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] animate-shimmer max-w-xl mx-auto mb-8 font-medium">
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

            <div className="flex items-center gap-8 mt-8">
              {/* Facebook Icon (Matched to Google Maps Button style) */}
              <a
                href="https://www.facebook.com/share/1AEaSwNezU/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title="Facebook"
              >
                <div className="w-16 h-16 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                  <Facebook className="w-8 h-8 text-[#D4AF37] fill-current group-hover:text-black transition-colors duration-300" />
                </div>
              </a>

              {/* WhatsApp Icon (Matched to Google Maps Button style) */}
              <a
                href="https://wa.me/529993931893"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title="WhatsApp"
              >
                <div className="w-16 h-16 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                  {/* Official WhatsApp SVG Path for "Telefonito" */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-[#D4AF37] fill-current group-hover:text-black transition-colors duration-300"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
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
