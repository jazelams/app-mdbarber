import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Clave secreta para firmar/verificar el JWT (token de sesión)
// En producción, esto debe venir de una variable de entorno segura.
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');

export async function verifySession() {
    // Obtener las cookies de la petición actual
    const cookieStore = await cookies();
    const token = cookieStore.get('barber_session')?.value;

    if (!token) return null; // Si no hay token, no hay sesión

    try {
        // Verificar la validez y firma del token
        const { payload } = await jwtVerify(token, SECRET_KEY, {
            algorithms: ['HS256'],
        });
        return payload; // Retornar datos del usuario (id, email, etc.)
    } catch (error) {
        return null; // Token inválido o expirado
    }
}
