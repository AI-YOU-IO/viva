'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';
import * as XLSX from 'xlsx';

// Mapeo de nombres de colores a códigos hex
const COLOR_MAP = {
  'rojo': '#EF4444',
  'naranja': '#F97316',
  'amarillo': '#EAB308',
  'verde': '#22C55E',
  'azul': '#3B82F6',
  'indigo': '#6366F1',
  'cyan': '#06B6D4',
  'teal': '#14B8A6',
  'gris': '#6B7280',
  'morado': '#A855F7',
  'rosa': '#EC4899',
};

const getColorHex = (color) => {
  if (!color) return '#6B7280';
  if (color.startsWith('#')) return color;
  return COLOR_MAP[color.toLowerCase()] || '#6B7280';
};

// Rangos de fecha predefinidos
const DATE_RANGES = [
  { label: 'Todos', value: 'all' },
  { label: 'Hoy', value: 'today' },
  { label: 'Ultima semana', value: '7d' },
  { label: 'Ultimo mes', value: '1m' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '12 meses', value: '12m' },
  { label: 'Personalizado', value: 'custom' },
];

const ITEMS_PER_PAGE = 50;

export default function LeadsPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tipificaciones, setTipificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedTipificacion, setSelectedTipificacion] = useState('');
  const [selectedTipificacionAsesor, setSelectedTipificacionAsesor] = useState('');
  const [selectedAsesorFilter, setSelectedAsesorFilter] = useState('');
  const [asesoresFilter, setAsesoresFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showAsesorModal, setShowAsesorModal] = useState(false);
  const [asesores, setAsesores] = useState([]);
  const [assigningAsesor, setAssigningAsesor] = useState(false);
  const [selectedAsesorId, setSelectedAsesorId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [savingLead, setSavingLead] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLead, setDetailLead] = useState(null);
  const [perfilamientoData, setPerfilamientoData] = useState([]);
  const [loadingPerfilamiento, setLoadingPerfilamiento] = useState(false);

  // Verificar si el usuario puede filtrar por asesor (rol 1 o 2)
  const canFilterByAsesor = session?.user?.id_rol === 1 || session?.user?.id_rol === 2;

  useEffect(() => {
    loadData();
  }, []);

  // Cargar asesores para filtro cuando la session cambie
  useEffect(() => {
    const loadAsesoresFilter = async () => {
      if (canFilterByAsesor) {
        try {
          const response = await apiClient.get('/crm/leads/asesores');
          setAsesoresFilter(response.data || []);
        } catch (error) {
          console.error('Error al cargar asesores para filtro:', error);
        }
      }
    };
    loadAsesoresFilter();
  }, [canFilterByAsesor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, estadosRes, tipificacionesRes, proveedoresRes, planesRes] = await Promise.all([
        apiClient.get('/crm/leads'),
        apiClient.get('/crm/estados'),
        apiClient.get('/crm/tipificaciones'),
        apiClient.get('/crm/leads/proveedores'),
        apiClient.get('/crm/leads/planes')
      ]);
      setLeads(leadsRes.data || []);
      setEstados(estadosRes.data || []);
      setTipificaciones(tipificacionesRes.data || []);
      setProveedores(proveedoresRes.data || []);
      setPlanes(planesRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailModal = async (lead) => {
    setDetailLead(lead);
    setShowDetailModal(true);
    setPerfilamientoData([]);
    setLoadingPerfilamiento(true);
    try {
      const response = await apiClient.get(`/crm/leads/${lead.id}/perfilamiento`);
      setPerfilamientoData(response.data || []);
    } catch (error) {
      console.error('Error al cargar perfilamiento:', error);
    } finally {
      setLoadingPerfilamiento(false);
    }
  };

  const handleOpenEditModal = (lead) => {
    setEditingLead({
      id: lead.id,
      nombre_completo: lead.nombre_completo || '',
      dni: lead.dni || '',
      celular: lead.celular || lead.contacto_celular || '',
      direccion: lead.direccion || '',
      id_estado: lead.id_estado || '',
      id_provedor: lead.id_provedor || '',
      id_plan: lead.id_plan || '',
      id_tipificacion: lead.id_tipificacion || '',
      id_asesor: lead.id_asesor || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditingLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveLead = async () => {
    if (!editingLead) return;

    try {
      setSavingLead(true);
      await apiClient.put(`/crm/leads/${editingLead.id}`, editingLead);
      alert('Lead actualizado correctamente');
      setShowEditModal(false);
      setEditingLead(null);
      loadData();
    } catch (error) {
      console.error('Error al actualizar lead:', error);
      alert('Error al actualizar lead');
    } finally {
      setSavingLead(false);
    }
  };

  // Calcular fecha desde según el rango seleccionado
  const getDateRangeFilter = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let fromDate = null;
    let toDate = new Date(now);

    switch (dateRange) {
      case 'today':
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case '1m':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      case '3m':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 3);
        break;
      case '6m':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 6);
        break;
      case '12m':
        fromDate = new Date(now);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
      case 'custom':
        if (dateFrom) fromDate = new Date(dateFrom + 'T00:00:00');
        if (dateTo) toDate = new Date(dateTo + 'T23:59:59');
        break;
      default:
        return { fromDate: null, toDate: null };
    }

    return { fromDate, toDate };
  };

  const filteredLeads = leads.filter(lead => {
    // Filtro de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (lead.nombre_completo && lead.nombre_completo.toLowerCase().includes(searchLower)) ||
      (lead.celular && lead.celular.includes(searchTerm)) ||
      (lead.dni && lead.dni.includes(searchTerm)) ||
      (lead.contacto_celular && lead.contacto_celular.includes(searchTerm))
    );

    // Filtro de fecha
    const { fromDate, toDate } = getDateRangeFilter();
    let matchesDate = true;

    if (fromDate || toDate) {
      const leadDate = new Date(lead.created_at);
      if (fromDate && leadDate < fromDate) matchesDate = false;
      if (toDate && leadDate > toDate) matchesDate = false;
    }

    // Filtro de estado
    const matchesEstado = !selectedEstado || lead.id_estado === parseInt(selectedEstado);

    // Filtro de tipificación
    const matchesTipificacion = !selectedTipificacion || lead.id_tipificacion === parseInt(selectedTipificacion);

    // Filtro de tipificación asesor
    const matchesTipificacionAsesor = !selectedTipificacionAsesor || lead.id_tipificacion_asesor === parseInt(selectedTipificacionAsesor);

    // Filtro de asesor
    const matchesAsesor = !selectedAsesorFilter || lead.id_asesor === parseInt(selectedAsesorFilter);

    return matchesSearch && matchesDate && matchesEstado && matchesTipificacion && matchesTipificacionAsesor && matchesAsesor;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value !== 'custom') {
      setDateFrom('');
      setDateTo('');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange('all');
    setDateFrom('');
    setDateTo('');
    setSelectedEstado('');
    setSelectedTipificacion('');
    setSelectedTipificacionAsesor('');
    setSelectedAsesorFilter('');
    setCurrentPage(1);
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedLeads([]);
    }
    setSelectionMode(!selectionMode);
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    }
  };

  const handleOpenAsesorModal = async () => {
    try {
      const response = await apiClient.get('/crm/leads/asesores');
      setAsesores(response.data || []);
      setSelectedAsesorId('');
      setShowAsesorModal(true);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      alert('Error al cargar la lista de asesores');
    }
  };

  const handleAssignAsesor = async (asesorId) => {
    if (selectedLeads.length === 0) return;

    try {
      setAssigningAsesor(true);
      await apiClient.post('/crm/leads/bulk-assign', {
        lead_ids: selectedLeads,
        id_asesor: asesorId
      });

      alert(`${selectedLeads.length} leads asignados correctamente`);
      setShowAsesorModal(false);
      setSelectedLeads([]);
      setSelectionMode(false);
      loadData();
    } catch (error) {
      console.error('Error al asignar asesor:', error);
      alert('Error al asignar asesor');
    } finally {
      setAssigningAsesor(false);
    }
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, dateFrom, dateTo, selectedEstado, selectedTipificacion, selectedTipificacionAsesor, selectedAsesorFilter]);

  const hasActiveFilters = searchTerm || dateRange !== 'all' || selectedEstado || selectedTipificacion || selectedTipificacionAsesor || selectedAsesorFilter;

  const handleExportExcel = () => {
    const dataToExport = filteredLeads.map(lead => ({
      'ID': lead.id,
      'Nombre': lead.nombre_completo || '',
      'DNI': lead.dni || '',
      'Celular': lead.celular || lead.contacto_celular || '',
      'Direccion': lead.direccion || '',
      'Estado': lead.estado_nombre || '',
      'Proveedor': lead.proveedor_nombre || '',
      'Plan': lead.plan_nombre || '',
      'Tipificacion': lead.tipificacion_nombre || '',
      'Asesor': lead.asesor_nombre || '',
      'Fecha Registro': lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');

    const colWidths = [
      { wch: 6 },   // ID
      { wch: 30 },  // Nombre
      { wch: 12 },  // DNI
      { wch: 15 },  // Celular
      { wch: 40 },  // Direccion
      { wch: 15 },  // Estado
      { wch: 15 },  // Proveedor
      { wch: 20 },  // Plan
      { wch: 20 },  // Tipificacion
      { wch: 20 },  // Asesor
      { wch: 20 },  // Fecha Registro
    ];
    ws['!cols'] = colWidths;

    const fileName = hasActiveFilters
      ? `leads_filtrados_${new Date().toISOString().slice(0, 10)}.xlsx`
      : `leads_todos_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Gestiona los prospectos del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectionMode && selectedLeads.length > 0 ? (
            <button
              onClick={handleOpenAsesorModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Aceptar asignacion ({selectedLeads.length})</span>
            </button>
          ) : (
            <button
              onClick={toggleSelectionMode}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                selectionMode
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{selectionMode ? 'Cancelar' : 'Asignar Asesor'}</span>
            </button>
          )}
          <button
            onClick={handleExportExcel}
            disabled={filteredLeads.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, celular o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Rango de fecha */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Estado */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipificación */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipificacion</label>
            <select
              value={selectedTipificacion}
              onChange={(e) => setSelectedTipificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              {tipificaciones.map((tip) => (
                <option key={tip.id} value={tip.id}>
                  {tip.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipificación Asesor */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipif. Asesor</label>
            <select
              value={selectedTipificacionAsesor}
              onChange={(e) => setSelectedTipificacionAsesor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              {tipificaciones.map((tip) => (
                <option key={tip.id} value={tip.id}>
                  {tip.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Asesor - Solo para rol 1 y 2 */}
          {canFilterByAsesor && (
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Asesor</label>
              <select
                value={selectedAsesorFilter}
                onChange={(e) => setSelectedAsesorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {asesoresFilter.map((asesor) => (
                  <option key={asesor.id} value={asesor.id}>
                    {asesor.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fechas personalizadas */}
          {dateRange === 'custom' && (
            <>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}

          {/* Botón limpiar */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>
              Mostrando {filteredLeads.length} de {leads.length} leads
              {dateRange !== 'all' && dateRange !== 'custom' && ` (${DATE_RANGES.find(r => r.value === dateRange)?.label})`}
              {dateRange === 'custom' && dateFrom && dateTo && ` (${dateFrom} - ${dateTo})`}
            </span>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{filteredLeads.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Con datos completos</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredLeads.filter(l => l.nombre_completo && l.dni).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Sin datos</p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredLeads.filter(l => !l.nombre_completo).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Con plan asignado</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredLeads.filter(l => l.id_plan).length}
          </p>
        </div>
      </div>

      {/* Tabla de leads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectionMode && (
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipificacion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipificación Asesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}`}>
                  {selectionMode && (
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{lead.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.nombre_completo || <span className="text-gray-400 italic">Sin nombre</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.dni || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.celular || lead.contacto_celular || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.estado_nombre ? (
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                        style={{
                          backgroundColor: getColorHex(lead.estado_color)
                        }}
                      >
                        {lead.estado_nombre}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.proveedor_nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.plan_nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.tipificacion_nombre ? (
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                        style={{
                          backgroundColor: getColorHex(lead.tipificacion_color)
                        }}
                      >
                        {lead.tipificacion_nombre}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.tipificacion_asesor_nombre ? (
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                        style={{
                          backgroundColor: getColorHex(lead.tipificacion_asesor_color)
                        }}
                      >
                        {lead.tipificacion_asesor_nombre}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.asesor_nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenDetailModal(lead)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Ver detalle"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(lead)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar lead"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilters ? 'No se encontraron leads con los filtros aplicados' : 'No hay leads registrados'}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} - {Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} registros
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Números de página */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === i
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Selección de Asesor */}
      {showAsesorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Seleccionar Asesor
              </h3>
              <button
                onClick={() => setShowAsesorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona un asesor para asignar a los {selectedLeads.length} leads seleccionados:
              </p>
              {asesores.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay asesores disponibles</p>
              ) : (
                <div>
                  <select
                    value={selectedAsesorId}
                    onChange={(e) => setSelectedAsesorId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">-- Seleccionar asesor --</option>
                    {asesores.map((asesor) => (
                      <option key={asesor.id} value={asesor.id}>
                        {asesor.username} - {asesor.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={() => setShowAsesorModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAssignAsesor(selectedAsesorId)}
                disabled={!selectedAsesorId || assigningAsesor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {assigningAsesor ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Asignando...</span>
                  </>
                ) : (
                  <span>Aceptar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Lead */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Lead #{editingLead.id}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLead(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editingLead.nombre_completo}
                  onChange={(e) => handleEditChange('nombre_completo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese nombre completo"
                />
              </div>

              {/* DNI y Celular en una fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input
                    type="text"
                    value={editingLead.dni}
                    onChange={(e) => handleEditChange('dni', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese DNI"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <input
                    type="text"
                    value={editingLead.celular}
                    onChange={(e) => handleEditChange('celular', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese celular"
                    maxLength={9}
                  />
                </div>
              </div>

              {/* Direccion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                <input
                  type="text"
                  value={editingLead.direccion}
                  onChange={(e) => handleEditChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese direccion"
                />
              </div>

              {/* Estado y Tipificacion en una fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={editingLead.id_estado || ''}
                    onChange={(e) => handleEditChange('id_estado', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipificacion</label>
                  <select
                    value={editingLead.id_tipificacion || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {tipificaciones.map((tip) => (
                      <option key={tip.id} value={tip.id}>
                        {tip.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipificacion Asesor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipificacion Asesor</label>
                <select
                  value={editingLead.id_tipificacion_asesor || ''}
                  onChange={(e) => handleEditChange('id_tipificacion_asesor', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Seleccionar --</option>
                  {tipificaciones.map((tip) => (
                    <option key={tip.id} value={tip.id}>
                      {tip.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proveedor y Plan en una fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select
                    value={editingLead.id_provedor || ''}
                    onChange={(e) => handleEditChange('id_provedor', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={editingLead.id_plan || ''}
                    onChange={(e) => handleEditChange('id_plan', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {planes.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asesor */}
              {canFilterByAsesor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asesor</label>
                  <select
                    value={editingLead.id_asesor || ''}
                    onChange={(e) => handleEditChange('id_asesor', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Sin asesor --</option>
                    {asesoresFilter.map((asesor) => (
                      <option key={asesor.id} value={asesor.id}>
                        {asesor.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLead}
                disabled={savingLead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {savingLead ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Lead */}
      {showDetailModal && detailLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalle del Lead #{detailLead.id}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailLead(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Nombre Completo */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Nombre Completo</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.nombre_completo || '-'}</span>
              </div>

              {/* DNI */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">DNI</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.dni || '-'}</span>
              </div>

              {/* Celular */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Celular</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.celular || detailLead.contacto_celular || '-'}</span>
              </div>

              {/* Direccion */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Direccion</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.direccion || '-'}</span>
              </div>

              {/* Estado */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Estado</span>
                <div className="col-span-2">
                  {detailLead.estado_nombre ? (
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getColorHex(detailLead.estado_color) }}
                    >
                      {detailLead.estado_nombre}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </div>

              {/* Tipificacion */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Tipificacion</span>
                <div className="col-span-2">
                  {detailLead.tipificacion_nombre ? (
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getColorHex(detailLead.tipificacion_color) }}
                    >
                      {detailLead.tipificacion_nombre}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </div>

              {/* Tipificacion Asesor */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Tipificacion Asesor</span>
                <div className="col-span-2">
                  {detailLead.tipificacion_asesor_nombre ? (
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getColorHex(detailLead.tipificacion_asesor_color) }}
                    >
                      {detailLead.tipificacion_asesor_nombre}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </div>

              {/* Proveedor */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Proveedor</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.proveedor_nombre || '-'}</span>
              </div>

              {/* Plan */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Plan</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.plan_nombre || '-'}</span>
              </div>

              {/* Asesor */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Asesor</span>
                <span className="col-span-2 text-sm text-gray-900">{detailLead.asesor_nombre || '-'}</span>
              </div>

              {/* Fecha de Registro */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Fecha de Registro</span>
                <span className="col-span-2 text-sm text-gray-900">{formatDate(detailLead.created_at)}</span>
              </div>

              {/* Seccion de Perfilamiento */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Preguntas de Perfilamiento</h4>
                {loadingPerfilamiento ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : perfilamientoData.length > 0 ? (
                  <div className="space-y-3">
                    {perfilamientoData.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">{item.pregunta}</p>
                        <p className="text-sm text-gray-900 mt-1">{item.respuesta || '-'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic py-2">Sin respuestas de perfilamiento</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailLead(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenEditModal(detailLead);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
