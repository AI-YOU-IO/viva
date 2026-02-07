'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  ACTIVA: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Activa', gradient: 'from-green-500 to-emerald-600' },
  PAUSADA: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pausada', gradient: 'from-yellow-500 to-amber-600' },
  PROGRAMADA: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Programada', gradient: 'from-blue-500 to-indigo-600' },
  FINALIZADA: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', label: 'Finalizada', gradient: 'from-gray-500 to-slate-600' },
  BORRADOR: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Borrador', gradient: 'from-purple-500 to-violet-600' },
};

const TIPO_ENVIO_ICONS = {
  MASIVO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  ESCALONADO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  PROGRAMADO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const MOCK_CAMPANAS = [
  {
    id: 1,
    nombre: 'Lanzamiento Viva Sur',
    descripcion: 'Campana de lanzamiento del nuevo proyecto Viva Sur con promociones especiales para los primeros compradores',
    estado: 'ACTIVA',
    tipo_envio: 'MASIVO',
    fecha_inicio: '2024-02-01',
    fecha_fin: '2024-02-28',
    plantillas: ['bienvenida_lead', 'promocion_febrero'],
    segmentacion: { tipo: 'TODOS', filtros: [] },
    stats: { enviados: 2345, entregados: 2310, leidos: 1850, respondidos: 456, conversion: 8.5 },
    createdAt: '2024-01-28',
  },
  {
    id: 2,
    nombre: 'Promo San Valentin',
    descripcion: 'Promocion especial por San Valentin - Descuentos exclusivos en departamentos seleccionados',
    estado: 'ACTIVA',
    tipo_envio: 'ESCALONADO',
    fecha_inicio: '2024-02-10',
    fecha_fin: '2024-02-14',
    plantillas: ['promocion_febrero'],
    segmentacion: { tipo: 'LEADS', filtros: ['interesado'] },
    stats: { enviados: 1890, entregados: 1865, leidos: 1456, respondidos: 312, conversion: 6.2 },
    createdAt: '2024-02-05',
  },
  {
    id: 3,
    nombre: 'Seguimiento Leads Enero',
    descripcion: 'Seguimiento a leads que no respondieron en enero para reactivar el interes',
    estado: 'FINALIZADA',
    tipo_envio: 'MASIVO',
    fecha_inicio: '2024-01-15',
    fecha_fin: '2024-01-31',
    plantillas: ['seguimiento_visita'],
    segmentacion: { tipo: 'LEADS', filtros: ['sin_respuesta'] },
    stats: { enviados: 3456, entregados: 3420, leidos: 2890, respondidos: 567, conversion: 12.3 },
    createdAt: '2024-01-10',
  },
  {
    id: 4,
    nombre: 'Reactivacion Inactivos',
    descripcion: 'Campana para reactivar leads inactivos por mas de 30 dias con ofertas especiales',
    estado: 'PROGRAMADA',
    tipo_envio: 'PROGRAMADO',
    fecha_inicio: '2024-02-20',
    fecha_fin: '2024-03-05',
    plantillas: ['bienvenida_lead', 'cotizacion_unidad'],
    segmentacion: { tipo: 'LEADS', filtros: ['inactivo_30d'] },
    stats: { enviados: 0, entregados: 0, leidos: 0, respondidos: 0, conversion: 0 },
    createdAt: '2024-02-10',
  },
  {
    id: 5,
    nombre: 'Test Nueva Plantilla',
    descripcion: 'Prueba de nueva plantilla de mensajes antes del lanzamiento oficial',
    estado: 'BORRADOR',
    tipo_envio: 'MASIVO',
    fecha_inicio: '',
    fecha_fin: '',
    plantillas: [],
    segmentacion: { tipo: 'TODOS', filtros: [] },
    stats: { enviados: 0, entregados: 0, leidos: 0, respondidos: 0, conversion: 0 },
    createdAt: '2024-02-12',
  },
];

const MOCK_PLANTILLAS = [
  { id: 1, name: 'bienvenida_lead', status: 'APPROVED', category: 'MARKETING' },
  { id: 2, name: 'seguimiento_visita', status: 'APPROVED', category: 'UTILITY' },
  { id: 3, name: 'promocion_febrero', status: 'APPROVED', category: 'MARKETING' },
  { id: 4, name: 'cotizacion_unidad', status: 'APPROVED', category: 'UTILITY' },
];

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  tipo_envio: 'MASIVO',
  fecha_inicio: '',
  fecha_fin: '',
  hora_envio: '09:00',
  plantillas: [],
  segmentacion_tipo: 'TODOS',
  segmentacion_filtros: [],
};

export default function WhatsAppCampanasPage() {
  const [campanas, setCampanas] = useState(MOCK_CAMPANAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showModal, setShowModal] = useState(false);
  const [editingCampana, setEditingCampana] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDetails, setShowDetails] = useState(null);

  const totalSteps = 4;

  const filteredCampanas = campanas.filter((c) => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || c.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => ({
    total: campanas.length,
    activas: campanas.filter((c) => c.estado === 'ACTIVA').length,
    programadas: campanas.filter((c) => c.estado === 'PROGRAMADA').length,
    finalizadas: campanas.filter((c) => c.estado === 'FINALIZADA').length,
    totalEnviados: campanas.reduce((acc, c) => acc + c.stats.enviados, 0),
    totalLeidos: campanas.reduce((acc, c) => acc + c.stats.leidos, 0),
    promedioConversion: (campanas.filter((c) => c.stats.conversion > 0).reduce((acc, c) => acc + c.stats.conversion, 0) / campanas.filter((c) => c.stats.conversion > 0).length || 0).toFixed(1),
  }), [campanas]);

  const openCreateModal = () => {
    setEditingCampana(null);
    setFormData(EMPTY_FORM);
    setCurrentStep(1);
    setShowModal(true);
  };

  const openEditModal = (campana) => {
    setEditingCampana(campana);
    setFormData({
      nombre: campana.nombre,
      descripcion: campana.descripcion,
      tipo_envio: campana.tipo_envio,
      fecha_inicio: campana.fecha_inicio,
      fecha_fin: campana.fecha_fin,
      hora_envio: '09:00',
      plantillas: campana.plantillas,
      segmentacion_tipo: campana.segmentacion.tipo,
      segmentacion_filtros: campana.segmentacion.filtros,
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        estado: 'BORRADOR',
        tipo_envio: formData.tipo_envio,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        plantillas: formData.plantillas,
        segmentacion: {
          tipo: formData.segmentacion_tipo,
          filtros: formData.segmentacion_filtros,
        },
        stats: { enviados: 0, entregados: 0, leidos: 0, respondidos: 0, conversion: 0 },
        createdAt: new Date().toISOString().split('T')[0],
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingCampana) {
        setCampanas(campanas.map((c) => c.id === editingCampana.id ? { ...payload, id: editingCampana.id, estado: editingCampana.estado, stats: editingCampana.stats } : c));
        toast.success('Campana actualizada correctamente');
      } else {
        setCampanas([...campanas, { ...payload, id: Date.now() }]);
        toast.success('Campana creada correctamente');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la campana');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (campana) => {
    if (confirm(`¿Estas seguro de eliminar la campana "${campana.nombre}"?`)) {
      setCampanas(campanas.filter((c) => c.id !== campana.id));
      toast.success('Campana eliminada correctamente');
    }
  };

  const handleStatusChange = (campana, newStatus) => {
    setCampanas(campanas.map((c) => c.id === campana.id ? { ...c, estado: newStatus } : c));
    toast.success(`Campana ${newStatus === 'ACTIVA' ? 'activada' : newStatus === 'PAUSADA' ? 'pausada' : 'actualizada'}`);
  };

  const togglePlantilla = (plantillaName) => {
    if (formData.plantillas.includes(plantillaName)) {
      setFormData({ ...formData, plantillas: formData.plantillas.filter((p) => p !== plantillaName) });
    } else {
      setFormData({ ...formData, plantillas: [...formData.plantillas, plantillaName] });
    }
  };

  const toggleFiltro = (filtro) => {
    if (formData.segmentacion_filtros.includes(filtro)) {
      setFormData({ ...formData, segmentacion_filtros: formData.segmentacion_filtros.filter((f) => f !== filtro) });
    } else {
      setFormData({ ...formData, segmentacion_filtros: [...formData.segmentacion_filtros, filtro] });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanas WhatsApp</h1>
          <p className="text-gray-600 mt-1">Gestiona tus campanas de mensajeria masiva</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Campana</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/20 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Total Campanas</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-gray-500">Activas</p>
              </div>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.activas}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <p className="text-sm text-gray-500">Programadas</p>
              </div>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.programadas}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enviados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEnviados.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Promedio</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{stats.promedioConversion}%</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar campanas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { value: '', label: 'Todas', icon: null },
                { value: 'ACTIVA', label: 'Activas', color: 'green' },
                { value: 'PROGRAMADA', label: 'Programadas', color: 'blue' },
                { value: 'PAUSADA', label: 'Pausadas', color: 'yellow' },
                { value: 'FINALIZADA', label: 'Finalizadas', color: 'gray' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-sm rounded-lg border whitespace-nowrap transition-all ${
                    filterStatus === filter.value
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {filter.color && (
                    <span className={`w-2 h-2 rounded-full bg-${filter.color}-500`} />
                  )}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista de tarjetas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista de tabla"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Campanas List */}
      {filteredCampanas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron campanas</h3>
          <p className="text-gray-500 mb-6">Crea tu primera campana de WhatsApp para comenzar a enviar mensajes masivos</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
          >
            Crear primera campana
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampanas.map((campana) => {
            const statusStyle = STATUS_STYLES[campana.estado];
            const deliveryRate = campana.stats.enviados > 0
              ? Math.round((campana.stats.entregados / campana.stats.enviados) * 100)
              : 0;
            const readRate = campana.stats.enviados > 0
              ? Math.round((campana.stats.leidos / campana.stats.enviados) * 100)
              : 0;

            return (
              <div
                key={campana.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300"
              >
                {/* Header con gradiente */}
                <div className={`h-2 bg-gradient-to-r ${statusStyle.gradient}`} />

                <div className="p-5">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{campana.nombre}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{campana.descripcion}</p>
                    </div>
                    <span className={`ml-3 inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${campana.estado === 'ACTIVA' ? 'animate-pulse' : ''}`} />
                      <span>{statusStyle.label}</span>
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      {TIPO_ENVIO_ICONS[campana.tipo_envio]}
                      <span className="capitalize">{campana.tipo_envio.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(campana.fecha_inicio)} - {formatDate(campana.fecha_fin)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  {campana.stats.enviados > 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{campana.stats.enviados.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Enviados</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{deliveryRate}%</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Entregados</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-600">{readRate}%</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Leidos</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${campana.stats.conversion >= 10 ? 'text-green-600' : campana.stats.conversion >= 5 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {campana.stats.conversion}%
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Conversion</p>
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${deliveryRate}%` }} />
                        <div className="bg-blue-500 h-full" style={{ width: `${readRate - deliveryRate > 0 ? readRate - deliveryRate : 0}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                      <p className="text-sm text-gray-500">Sin datos de envio aun</p>
                    </div>
                  )}

                  {/* Plantillas */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-gray-500">Plantillas:</span>
                    <div className="flex flex-wrap gap-1">
                      {campana.plantillas.length > 0 ? (
                        campana.plantillas.slice(0, 2).map((p) => (
                          <span key={p} className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-md">{p}</span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Sin plantillas</span>
                      )}
                      {campana.plantillas.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">+{campana.plantillas.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <button
                    onClick={() => setShowDetails(campana)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Estadisticas</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {campana.estado === 'ACTIVA' && (
                      <button
                        onClick={() => handleStatusChange(campana, 'PAUSADA')}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Pausar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    {(campana.estado === 'PAUSADA' || campana.estado === 'BORRADOR' || campana.estado === 'PROGRAMADA') && (
                      <button
                        onClick={() => handleStatusChange(campana, 'ACTIVA')}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Activar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(campana)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(campana)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campana</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Periodo</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enviados</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampanas.map((campana) => {
                  const statusStyle = STATUS_STYLES[campana.estado];
                  return (
                    <tr key={campana.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{campana.nombre}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{campana.descripcion}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${campana.estado === 'ACTIVA' ? 'animate-pulse' : ''}`} />
                          <span>{statusStyle.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-sm text-gray-600">
                          {TIPO_ENVIO_ICONS[campana.tipo_envio]}
                          <span className="capitalize">{campana.tipo_envio.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(campana.fecha_inicio)} - {formatDate(campana.fecha_fin)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">{campana.stats.enviados.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{campana.stats.entregados.toLocaleString()} entregados</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-bold ${
                          campana.stats.conversion >= 10 ? 'text-green-600' :
                          campana.stats.conversion >= 5 ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          {campana.stats.conversion > 0 ? `${campana.stats.conversion}%` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setShowDetails(campana)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Ver estadisticas"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(campana)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(campana)}
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

      {/* Create/Edit Modal with Stepper - Mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {editingCampana ? 'Editar Campana' : 'Nueva Campana'}
                    </h2>
                    <p className="text-sm text-primary-100">Paso {currentStep} de {totalSteps}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stepper mejorado */}
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/30" />
                {[
                  { step: 1, label: 'Informacion', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { step: 2, label: 'Plantillas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { step: 3, label: 'Audiencia', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                  { step: 4, label: 'Programacion', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map((item, idx) => (
                  <div key={item.step} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep >= item.step
                        ? 'bg-white text-primary-600 shadow-lg'
                        : 'bg-white/30 text-white'
                    }`}>
                      {currentStep > item.step ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        item.step
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 ${currentStep >= item.step ? 'text-white' : 'text-white/60'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Informacion Basica */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Nombre de la campana *</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Ej: Lanzamiento Proyecto Nuevo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors resize-none"
                      placeholder="Describe el objetivo de esta campana..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de envio</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'MASIVO', label: 'Masivo', desc: 'Envio inmediato a todos', icon: TIPO_ENVIO_ICONS.MASIVO },
                        { value: 'ESCALONADO', label: 'Escalonado', desc: 'Envio gradual por lotes', icon: TIPO_ENVIO_ICONS.ESCALONADO },
                        { value: 'PROGRAMADO', label: 'Programado', desc: 'Envio en fecha especifica', icon: TIPO_ENVIO_ICONS.PROGRAMADO },
                      ].map((tipo) => (
                        <button
                          key={tipo.value}
                          onClick={() => setFormData({ ...formData, tipo_envio: tipo.value })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.tipo_envio === tipo.value
                              ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-500/10'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg inline-block mb-2 ${formData.tipo_envio === tipo.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                            {tipo.icon}
                          </div>
                          <p className={`font-medium ${formData.tipo_envio === tipo.value ? 'text-primary-700' : 'text-gray-900'}`}>{tipo.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{tipo.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Plantillas */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Selecciona las plantillas</p>
                        <p className="text-xs text-blue-600 mt-0.5">Puedes seleccionar multiples plantillas para esta campana. Solo se muestran las plantillas aprobadas.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MOCK_PLANTILLAS.map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => togglePlantilla(plantilla.name)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.plantillas.includes(plantilla.name)
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${formData.plantillas.includes(plantilla.name) ? 'bg-primary-100' : 'bg-gray-100'}`}>
                              <svg className={`w-4 h-4 ${formData.plantillas.includes(plantilla.name) ? 'text-primary-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{plantilla.name}</p>
                              <p className="text-xs text-gray-500">{plantilla.category}</p>
                            </div>
                          </div>
                          {formData.plantillas.includes(plantilla.name) && (
                            <div className="bg-primary-600 rounded-full p-0.5">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    {formData.plantillas.length} plantilla(s) seleccionada(s)
                  </p>
                </div>
              )}

              {/* Step 3: Segmentacion */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Audiencia objetivo</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'TODOS', label: 'Todos', desc: 'Toda la base de datos', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                        { value: 'LEADS', label: 'Leads', desc: 'Solo prospectos', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { value: 'CLIENTES', label: 'Clientes', desc: 'Clientes actuales', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                      ].map((tipo) => (
                        <button
                          key={tipo.value}
                          onClick={() => setFormData({ ...formData, segmentacion_tipo: tipo.value })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.segmentacion_tipo === tipo.value
                              ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-500/10'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg inline-block mb-2 ${formData.segmentacion_tipo === tipo.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tipo.icon} />
                            </svg>
                          </div>
                          <p className={`font-medium ${formData.segmentacion_tipo === tipo.value ? 'text-primary-700' : 'text-gray-900'}`}>{tipo.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{tipo.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.segmentacion_tipo === 'LEADS' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Filtros adicionales</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'interesado', label: 'Interesados', desc: 'Mostraron interes' },
                          { value: 'sin_respuesta', label: 'Sin respuesta', desc: 'No han respondido' },
                          { value: 'inactivo_30d', label: 'Inactivos 30d', desc: 'Sin actividad 30 dias' },
                          { value: 'visita_programada', label: 'Con visita', desc: 'Visita programada' },
                        ].map((filtro) => (
                          <button
                            key={filtro.value}
                            onClick={() => toggleFiltro(filtro.value)}
                            className={`p-3 rounded-lg border text-left text-sm transition-all ${
                              formData.segmentacion_filtros.includes(filtro.value)
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{filtro.label}</p>
                                <p className="text-xs text-gray-500">{filtro.desc}</p>
                              </div>
                              {formData.segmentacion_filtros.includes(filtro.value) && (
                                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Programacion */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de inicio</label>
                      <input
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de fin</label>
                      <input
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora de envio preferida</label>
                    <input
                      type="time"
                      value={formData.hora_envio}
                      onChange={(e) => setFormData({ ...formData, hora_envio: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Resumen mejorado */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Resumen de la campana</span>
                    </h4>
                    <dl className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <dt className="text-xs text-gray-500">Nombre</dt>
                        <dd className="font-medium text-gray-900 mt-0.5">{formData.nombre || '-'}</dd>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <dt className="text-xs text-gray-500">Tipo de envio</dt>
                        <dd className="font-medium text-gray-900 mt-0.5 capitalize">{formData.tipo_envio.toLowerCase()}</dd>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <dt className="text-xs text-gray-500">Plantillas</dt>
                        <dd className="font-medium text-gray-900 mt-0.5">{formData.plantillas.length} seleccionadas</dd>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <dt className="text-xs text-gray-500">Audiencia</dt>
                        <dd className="font-medium text-gray-900 mt-0.5 capitalize">{formData.segmentacion_tipo.toLowerCase()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-1 px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Anterior</span>
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-1 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <span>Siguiente</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.nombre}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-primary-500/25"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{editingCampana ? 'Actualizar' : 'Crear Campana'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Mejorado */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header con gradiente segun estado */}
            <div className={`bg-gradient-to-r ${STATUS_STYLES[showDetails.estado].gradient} px-6 py-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20 text-white mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>{STATUS_STYLES[showDetails.estado].label}</span>
                  </span>
                  <h2 className="text-xl font-bold text-white">{showDetails.nombre}</h2>
                  <p className="text-sm text-white/80 mt-1">{showDetails.descripcion}</p>
                </div>
                <button
                  onClick={() => setShowDetails(null)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200">
                  <p className="text-3xl font-bold text-gray-900">{showDetails.stats.enviados.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Enviados</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
                  <p className="text-3xl font-bold text-green-600">{showDetails.stats.entregados.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Entregados</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-200">
                  <p className="text-3xl font-bold text-blue-600">{showDetails.stats.leidos.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Leidos</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-violet-50 rounded-xl p-4 text-center border border-primary-200">
                  <p className="text-3xl font-bold text-primary-600">{showDetails.stats.respondidos.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Respondidos</p>
                </div>
              </div>

              {/* Funnel mejorado */}
              {showDetails.stats.enviados > 0 && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Embudo de conversion</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Enviados', value: showDetails.stats.enviados, pct: 100, color: 'bg-gray-400' },
                      { label: 'Entregados', value: showDetails.stats.entregados, pct: (showDetails.stats.entregados / showDetails.stats.enviados * 100), color: 'bg-green-500' },
                      { label: 'Leidos', value: showDetails.stats.leidos, pct: (showDetails.stats.leidos / showDetails.stats.enviados * 100), color: 'bg-blue-500' },
                      { label: 'Respondidos', value: showDetails.stats.respondidos, pct: (showDetails.stats.respondidos / showDetails.stats.enviados * 100), color: 'bg-primary-500' },
                    ].map((item, idx) => (
                      <div key={item.label} className="flex items-center space-x-4">
                        <span className="w-24 text-sm text-gray-600">{item.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-semibold text-gray-900">{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-xs text-gray-500">{item.value.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Configuracion</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tipo de envio</dt>
                      <dd className="font-medium text-gray-900 capitalize">{showDetails.tipo_envio.toLowerCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Segmentacion</dt>
                      <dd className="font-medium text-gray-900">{showDetails.segmentacion.tipo}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Plantillas</dt>
                      <dd className="font-medium text-gray-900">{showDetails.plantillas.length}</dd>
                    </div>
                  </dl>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Periodo</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Fecha inicio</dt>
                      <dd className="font-medium text-gray-900">{showDetails.fecha_inicio || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Fecha fin</dt>
                      <dd className="font-medium text-gray-900">{showDetails.fecha_fin || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Creada</dt>
                      <dd className="font-medium text-gray-900">{showDetails.createdAt}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetails(null);
                  openEditModal(showDetails);
                }}
                className="px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar</span>
              </button>
              <button
                onClick={() => setShowDetails(null)}
                className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
