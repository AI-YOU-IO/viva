'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_PROYECTOS = 'https://json-server-two-pink.vercel.app/proyecto';
const API_UNIDADES = 'https://json-server-two-pink.vercel.app/unidad';
const API_TIPOLOGIAS = 'https://json-server-two-pink.vercel.app/tipologia';

const STATUS_STYLES = {
  ACTIVO: 'bg-green-100 text-green-800',
  INACTIVO: 'bg-gray-100 text-gray-800',
  EN_CONSTRUCCION: 'bg-yellow-100 text-yellow-800',
};

const COMMERCIAL_STATUS_STYLES = {
  disponible: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  separado: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  vendido: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

const EMPTY_PROYECTO_FORM = {
  nombre: '',
  status: 'ACTIVO',
  direccion: '',
  pais: 'Perú',
  ciudad: '',
  distrito: '',
  precio_min: '',
  precio_max: '',
  descuento: 0,
};

const EMPTY_FORM = {
  code: '',
  name: '',
  type: '',
  property_type: 'departamento',
  commercial_status: 'disponible',
  price: '',
  sale_price: '',
  currency: 'PEN',
  floor: '',
  construction_status: 'En construcción',
  construction_progress: 0,
  built_area: '',
  free_area: '0',
  total_area: '',
  dormitorios: '',
  banos: '',
};

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUnidad, setSearchUnidad] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [tipologias, setTipologias] = useState([]);
  const [showProyectoModal, setShowProyectoModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [proyectoForm, setProyectoForm] = useState(EMPTY_PROYECTO_FORM);
  const [savingProyecto, setSavingProyecto] = useState(false);

  useEffect(() => {
    loadProyectos();
    loadTipologias();
  }, []);

  const loadTipologias = async () => {
    try {
      const response = await fetch(API_TIPOLOGIAS);
      const data = await response.json();
      setTipologias(data);
    } catch (error) {
      console.error('Error al cargar tipologias:', error);
    }
  };

  const loadProyectos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_PROYECTOS);
      const data = await response.json();
      setProyectos(data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnidades = async (proyectoId) => {
    try {
      setLoadingUnidades(true);
      const response = await fetch(API_UNIDADES);
      const data = await response.json();
      const filtered = data.filter((u) => u.attributes.subdivision_id === proyectoId);
      setUnidades(filtered);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const selectProyecto = (proyecto) => {
    setSelectedProyecto(proyecto);
    setSearchUnidad('');
    setFilterStatus('');
    loadUnidades(proyecto.id);
  };

  const goBack = () => {
    setSelectedProyecto(null);
    setUnidades([]);
    setSearchUnidad('');
    setFilterStatus('');
  };

  const openCreateModal = () => {
    setEditingUnidad(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (unidad) => {
    const attr = unidad.attributes;
    setEditingUnidad(unidad);
    setFormData({
      code: attr.code || '',
      name: attr.name || '',
      type: attr.type || '',
      property_type: attr.property_type || 'departamento',
      commercial_status: attr.commercial_status || 'disponible',
      price: attr.price || '',
      sale_price: attr.sale_price || '',
      currency: attr.currency || 'PEN',
      floor: attr.floor || '',
      construction_status: attr.construction?.status || 'En construcción',
      construction_progress: attr.construction?.progress || 0,
      built_area: attr.construction?.built_area || '',
      free_area: attr.construction?.free_area || '0',
      total_area: attr.construction?.total_area || '',
      dormitorios: attr.extra_fields?.dormitorios || '',
      banos: attr.extra_fields?.banos || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.price) {
      toast.error('Completa los campos obligatorios: Codigo, Nombre y Precio');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: 'units',
        attributes: {
          code: formData.code,
          name: formData.name,
          type: formData.type,
          property_type: formData.property_type,
          commercial_status: formData.commercial_status,
          commercial_status_id: formData.commercial_status === 'disponible' ? 1 : formData.commercial_status === 'separado' ? 2 : 9,
          price: Number(formData.price),
          sale_price: Number(formData.sale_price) || Number(formData.price),
          currency: formData.currency,
          currency_sale: formData.currency,
          floor: Number(formData.floor) || 1,
          subdivision_id: selectedProyecto.id,
          property_type_id: formData.property_type === 'departamento' ? 1 : formData.property_type === 'duplex' ? 2 : 4,
          construction: {
            status: formData.construction_status,
            progress: Number(formData.construction_progress),
            built_area: Number(formData.built_area) || 0,
            free_area: Number(formData.free_area) || 0,
            total_area: Number(formData.total_area) || Number(formData.built_area) || 0,
          },
          extra_fields: {
            dormitorios: formData.dormitorios,
            banos: formData.banos,
          },
        },
      };

      if (editingUnidad) {
        await fetch(`${API_UNIDADES}/${editingUnidad.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingUnidad.id }),
        });
        toast.success('Unidad actualizada correctamente');
      } else {
        await fetch(API_UNIDADES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Unidad creada correctamente');
      }

      setShowModal(false);
      loadUnidades(selectedProyecto.id);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la unidad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unidad) => {
    try {
      await fetch(`${API_UNIDADES}/${unidad.id}`, { method: 'DELETE' });
      toast.success('Unidad eliminada correctamente');
      setShowDeleteConfirm(null);
      loadUnidades(selectedProyecto.id);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la unidad');
    }
  };

  const openCreateProyecto = () => {
    setEditingProyecto(null);
    setProyectoForm(EMPTY_PROYECTO_FORM);
    setShowProyectoModal(true);
  };

  const openEditProyecto = (proyecto) => {
    setEditingProyecto(proyecto);
    setProyectoForm({
      nombre: proyecto.nombre || '',
      status: proyecto.status || 'ACTIVO',
      direccion: proyecto.direccion || '',
      pais: proyecto.pais || 'Perú',
      ciudad: proyecto.ciudad || '',
      distrito: proyecto.distrito || '',
      precio_min: proyecto.precio_min || '',
      precio_max: proyecto.precio_max || '',
      descuento: proyecto.descuento || 0,
    });
    setShowProyectoModal(true);
  };

  const handleSaveProyecto = async () => {
    if (!proyectoForm.nombre || !proyectoForm.ciudad || !proyectoForm.distrito) {
      toast.error('Completa los campos obligatorios: Nombre, Ciudad y Distrito');
      return;
    }

    setSavingProyecto(true);
    try {
      const payload = {
        empresa_id: 1,
        nombre: proyectoForm.nombre,
        status: proyectoForm.status,
        direccion: proyectoForm.direccion,
        pais: proyectoForm.pais,
        ciudad: proyectoForm.ciudad,
        distrito: proyectoForm.distrito,
        imagen: '',
        precio_min: Number(proyectoForm.precio_min) || 0,
        precio_max: Number(proyectoForm.precio_max) || 0,
        descuento: Number(proyectoForm.descuento) || 0,
      };

      if (editingProyecto) {
        await fetch(`${API_PROYECTOS}/${editingProyecto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingProyecto.id }),
        });
        toast.success('Proyecto actualizado correctamente');
      } else {
        await fetch(API_PROYECTOS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Proyecto creado correctamente');
      }

      setShowProyectoModal(false);
      loadProyectos();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      toast.error('Error al guardar el proyecto');
    } finally {
      setSavingProyecto(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProyectos = proyectos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnidades = unidades.filter((u) => {
    const attr = u.attributes;
    const matchesSearch =
      attr.code.toLowerCase().includes(searchUnidad.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchUnidad.toLowerCase()) ||
      attr.type.toLowerCase().includes(searchUnidad.toLowerCase());
    const matchesStatus = !filterStatus || attr.commercial_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-600 mt-1">Portafolio de proyectos inmobiliarios</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =============================================
  // VISTA DE UNIDADES (cuando hay proyecto seleccionado)
  // =============================================
  if (selectedProyecto) {
    const statusCounts = {
      disponible: unidades.filter((u) => u.attributes.commercial_status === 'disponible').length,
      separado: unidades.filter((u) => u.attributes.commercial_status === 'separado').length,
      vendido: unidades.filter((u) => u.attributes.commercial_status === 'vendido').length,
    };

    return (
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-0.5">
                <button onClick={goBack} className="hover:text-primary-600 transition-colors">Proyectos</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">{selectedProyecto.nombre}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Unidades de {selectedProyecto.nombre}</h1>
              <p className="text-gray-600 text-sm mt-0.5">{selectedProyecto.direccion}, {selectedProyecto.distrito}</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Unidad</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Unidades</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{unidades.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.disponible}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <p className="text-sm text-gray-500">Separados</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.separado}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <p className="text-sm text-gray-500">Vendidos</p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts.vendido}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por codigo, nombre o tipo..."
                value={searchUnidad}
                onChange={(e) => setSearchUnidad(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              {['', 'disponible', 'separado', 'vendido'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === '' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unidades Table */}
        {loadingUnidades ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : filteredUnidades.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron unidades</h3>
            <p className="text-gray-500 mb-4">
              {unidades.length === 0 ? 'Este proyecto aun no tiene unidades registradas' : 'Intenta con otros filtros'}
            </p>
            {unidades.length === 0 && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Crear primera unidad
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Lista</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Venta</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Piso</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avance</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUnidades.map((unidad) => {
                    const attr = unidad.attributes;
                    const statusStyle = COMMERCIAL_STATUS_STYLES[attr.commercial_status] || COMMERCIAL_STATUS_STYLES.disponible;
                    return (
                      <tr key={unidad.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{attr.name}</p>
                            <p className="text-xs text-gray-500">{attr.code}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{attr.type}</p>
                          <p className="text-xs text-gray-400 capitalize">{attr.property_type}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            <span className="capitalize">{attr.commercial_status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatPrice(attr.price)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-primary-600">{formatPrice(attr.sale_price)}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{attr.construction?.total_area} m²</p>
                          <p className="text-xs text-gray-400">{attr.extra_fields?.dormitorios} dorm. / {attr.extra_fields?.banos} baños</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{attr.floor}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  attr.construction?.progress === 100 ? 'bg-green-500' :
                                  attr.construction?.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${attr.construction?.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{attr.construction?.progress || 0}%</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{attr.construction?.status}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(unidad)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(unidad)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Row 1: Codigo y Nombre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codigo *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="VS-01-A-101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="101"
                    />
                  </div>
                </div>

                {/* Row 2: Tipologia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccionar tipologia...</option>
                    {tipologias.map((tip) => (
                      <option key={tip.id} value={tip.attributes.name}>
                        {tip.attributes.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Estado Comercial y Piso */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Comercial</label>
                    <select
                      value={formData.commercial_status}
                      onChange={(e) => setFormData({ ...formData, commercial_status: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="separado">Separado</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                    <input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Precios</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Lista *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="340000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="323000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="PEN">PEN (Soles)</option>
                        <option value="USD">USD (Dolares)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Areas */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Areas y Construccion</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area Construida (m²)</label>
                      <input
                        type="number"
                        value={formData.built_area}
                        onChange={(e) => setFormData({ ...formData, built_area: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="45.5"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area Libre (m²)</label>
                      <input
                        type="number"
                        value={formData.free_area}
                        onChange={(e) => setFormData({ ...formData, free_area: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area Total (m²)</label>
                      <input
                        type="number"
                        value={formData.total_area}
                        onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="45.5"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado Construccion</label>
                      <select
                        value={formData.construction_status}
                        onChange={(e) => setFormData({ ...formData, construction_status: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="En planos">En planos</option>
                        <option value="En construcción">En construccion</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Avance (%): {formData.construction_progress}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.construction_progress}
                        onChange={(e) => setFormData({ ...formData, construction_progress: e.target.value })}
                        className="w-full mt-2 accent-primary-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dormitorios</label>
                      <input
                        type="number"
                        value={formData.dormitorios}
                        onChange={(e) => setFormData({ ...formData, dormitorios: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                      <input
                        type="number"
                        value={formData.banos}
                        onChange={(e) => setFormData({ ...formData, banos: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  )}
                  <span>{saving ? 'Guardando...' : editingUnidad ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar Unidad</h3>
                  <p className="text-sm text-gray-500">
                    Estas seguro de eliminar la unidad <strong>{showDeleteConfirm.attributes.name}</strong> ({showDeleteConfirm.attributes.code})?
                  </p>
                </div>
              </div>
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">
                Esta accion no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================
  // VISTA DE PROYECTOS (cards e-commerce)
  // =============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-600 mt-1">Portafolio de proyectos inmobiliarios</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadProyectos}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
          <span className="text-sm text-gray-500">
            {filteredProyectos.length} proyecto{filteredProyectos.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={openCreateProyecto}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, distrito o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredProyectos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron proyectos</h3>
          <p className="text-gray-500">Intenta con otro termino de busqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => selectProyecto(proyecto)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {proyecto.descuento > 0 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    -{proyecto.descuento}%
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[proyecto.status] || 'bg-gray-100 text-gray-800'}`}>
                    {proyecto.status}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    Ver unidades
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {proyecto.nombre}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{proyecto.distrito}, {proyecto.ciudad}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4 truncate">{proyecto.direccion}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-1">Rango de precios</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-bold text-primary-600">{formatPrice(proyecto.precio_min)}</span>
                    <span className="text-gray-400 text-sm">-</span>
                    <span className="text-sm font-medium text-gray-700">{formatPrice(proyecto.precio_max)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Proyecto */}
      {showProyectoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <button
                onClick={() => setShowProyectoModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  value={proyectoForm.nombre}
                  onChange={(e) => setProyectoForm({ ...proyectoForm, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Viva Sur"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={proyectoForm.status}
                    onChange={(e) => setProyectoForm({ ...proyectoForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="EN_CONSTRUCCION">En Construccion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
                  <input
                    type="text"
                    value={proyectoForm.pais}
                    onChange={(e) => setProyectoForm({ ...proyectoForm, pais: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Perú"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={proyectoForm.ciudad}
                    onChange={(e) => setProyectoForm({ ...proyectoForm, ciudad: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Lima"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                  <input
                    type="text"
                    value={proyectoForm.distrito}
                    onChange={(e) => setProyectoForm({ ...proyectoForm, distrito: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Surco"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                <input
                  type="text"
                  value={proyectoForm.direccion}
                  onChange={(e) => setProyectoForm({ ...proyectoForm, direccion: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Av. Primavera 123"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Precios y Descuento</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Min</label>
                    <input
                      type="number"
                      value={proyectoForm.precio_min}
                      onChange={(e) => setProyectoForm({ ...proyectoForm, precio_min: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="340000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Max</label>
                    <input
                      type="number"
                      value={proyectoForm.precio_max}
                      onChange={(e) => setProyectoForm({ ...proyectoForm, precio_max: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="490000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      value={proyectoForm.descuento}
                      onChange={(e) => setProyectoForm({ ...proyectoForm, descuento: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="5"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowProyectoModal(false)}
                className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProyecto}
                disabled={savingProyecto}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {savingProyecto && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                <span>{savingProyecto ? 'Guardando...' : editingProyecto ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
