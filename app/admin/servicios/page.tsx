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

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este servicio?')) return;
        try {
            await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
            fetchServices();
        } catch (e) {
            alert('Error al eliminar');
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
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">URL Imagen (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none"
                                    value={formData.imagenUrl || ''}
                                    onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancel} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">Guardar</button>
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
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(service)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-lg transition-colors">
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
