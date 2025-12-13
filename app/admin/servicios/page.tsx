"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash, Save, X, Image as ImageIcon } from "lucide-react";

interface Service {
    id: string;
    nombre: string;
    precio: number;
    duracion: number;
    imagenUrl?: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services');
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setFormData(service);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setFormData({ nombre: '', precio: 0, duracion: 30, imagenUrl: '' });
        setIsCreating(true);
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({});
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.precio || !formData.duracion) {
            alert('Completa los campos obligatorios');
            return;
        }

        try {
            const url = isCreating ? '/api/admin/services' : `/api/admin/services/${editingId}`;
            const method = isCreating ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchServices();
                handleCancel();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar 5MB');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten imágenes');
            return;
        }

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (res.ok) {
                const { url } = await res.json();
                setFormData({ ...formData, imagenUrl: url });
            } else {
                alert('Error al subir imagen');
            }
        } catch (error) {
            console.error(error);
            alert('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Estás seguro que deseas eliminar el servicio "${nombre}"?`)) return;

        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });

            if (res.ok) {
                fetchServices();
                if (editingId === id) handleCancel(); // Close modal if open
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar el servicio');
            }
        } catch (e) {
            console.error(e);
            alert('Error al conectar con el servidor');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Servicios</h1>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#B8860B] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Servicio
                    </button>
                </header>

                {(isCreating || editingId) && (
                    <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in slide-in-from-top-4">
                        <h3 className="text-lg font-bold text-white mb-4">{isCreating ? 'Crear Servicio' : 'Editar Servicio'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none"
                                    value={formData.nombre || ''}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Precio ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none"
                                    value={formData.precio || 0}
                                    onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Duración (min)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none"
                                    value={formData.duracion || 30}
                                    onChange={e => setFormData({ ...formData, duracion: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-zinc-400 mb-2">Imagen del Servicio</label>
                                <div className="flex gap-4 items-start">
                                    {formData.imagenUrl && (
                                        <div className="relative">
                                            <img
                                                src={formData.imagenUrl}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-lg object-cover border border-zinc-800"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imagenUrl: '' })}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="block w-full cursor-pointer">
                                            <div className="border-2 border-dashed border-zinc-800 rounded-lg p-6 text-center hover:border-[#D4AF37] transition-colors">
                                                {uploading ? (
                                                    <div className="text-zinc-400">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-2"></div>
                                                        Subiendo...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                                        <p className="text-sm text-zinc-400">
                                                            Haz clic para subir imagen
                                                        </p>
                                                        <p className="text-xs text-zinc-600 mt-1">
                                                            PNG, JPG hasta 5MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <div>
                                {!isCreating && editingId && (
                                    <button
                                        onClick={() => handleDelete(editingId, formData.nombre || '')}
                                        className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash className="w-4 h-4" />
                                        Eliminar
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#B8860B] transition-colors">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4">
                    {services.map(service => (
                        <div key={service.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-all">
                            <div className="flex items-center gap-4">
                                {service.imagenUrl ? (
                                    <img src={service.imagenUrl} alt={service.nombre} className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white text-lg">{service.nombre}</h3>
                                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                                        <span className="text-[#D4AF37] font-medium">${service.precio} MXN</span>
                                        <span>•</span>
                                        <span>{service.duracion} min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(service)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(service.id, service.nombre)} className="p-2 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg transition-colors">
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && !loading && (
                        <div className="text-center py-10 text-zinc-500">No hay servicios registrados.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
