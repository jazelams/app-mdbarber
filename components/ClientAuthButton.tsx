import { cookies } from "next/headers";
import Link from "next/link";
import { User, LogIn } from "lucide-react";

export default async function ClientAuthButton() {
    const cookieStore = await cookies();
    const session = cookieStore.get("client_session");

    if (session) {
        return (
            <Link
                href="/perfil"
                className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white font-bold rounded-full hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm uppercase tracking-wide"
            >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">Mi Perfil</span>
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className="px-6 py-2.5 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-bold rounded-full hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2 text-sm uppercase tracking-wide"
        >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
        </Link>
    );
}
