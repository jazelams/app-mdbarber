import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { nombre, email, password, telefono } = await request.json();

        // 1. Validar datos básicos
        if (!nombre || !email || !password) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios (Nombre, Email, Password)" },
                { status: 400 }
            );
        }

        // 2. Verificar si el email ya existe
        const existingUser = await prisma.cliente.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Este correo electrónico ya está registrado." },
                { status: 400 }
            );
        }

        // 3. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Crear cliente en base de datos
        const newClient = await prisma.cliente.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                telefono: telefono || null,
            },
        });

        // 5. Retornar éxito (sin devolver la contraseña)
        return NextResponse.json({
            id: newClient.id,
            nombre: newClient.nombre,
            email: newClient.email,
            message: "Cuenta creada exitosamente",
        });

    } catch (error: any) {
        console.error("Error registrando cliente:", error);
        return NextResponse.json(
            { error: "Error interno del servidor al crear cuenta." },
            { status: 500 }
        );
    }
}
