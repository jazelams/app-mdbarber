import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifySession } from '@/lib/session';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convertir archivo a base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'mdbarber/servicios',
            resource_type: 'auto',
        });

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error.message
        }, { status: 500 });
    }
}
