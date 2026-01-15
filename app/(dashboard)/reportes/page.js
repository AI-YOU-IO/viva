'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

const FUNNEL_COLORS = ['#3B82F6', '#22C55E', '#EAB308'];

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

export default function ReportesPage() {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tipoReporte, setTipoReporte] = useState("mensajes");

  // Calcular fechas segun el rango seleccionado
  const getDateParams = useCallback(() => {
    const now = new Date();
    let fromDate = null;
    let toDate = now.toISOString().split('T')[0];

    switch (dateRange) {
      case 'today':
        fromDate = toDate;
        break;
      case '7d':
        fromDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case '1m':
        fromDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
        break;
      case '3m':
        fromDate = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0];
        break;
      case '6m':
        fromDate = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
        break;
      case '12m':
        fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
        break;
      case 'custom':
        fromDate = dateFrom || null;
        toDate = dateTo || new Date().toISOString().split('T')[0];
        break;
      default:
        return {};
    }

    const params = {};
    if (fromDate) params.dateFrom = fromDate;
    if (toDate && dateRange !== 'all') params.dateTo = toDate;
    return params;
  }, [dateRange, dateFrom, dateTo]);

  const loadFunnelData = useCallback(async () => {
    try {
      setLoading(true);
      const params = getDateParams();
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/crm/reportes/funnel?${queryString}` : '/crm/reportes/funnel';
      const response = await apiClient.get(url);
      setFunnelData(response.data);
    } catch (error) {
      console.error('Error al cargar datos del embudo:', error);
    } finally {
      setLoading(false);
    }
  }, [getDateParams]);

  useEffect(() => {
    loadFunnelData();
  }, [loadFunnelData]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value !== 'custom') {
      setDateFrom('');
      setDateTo('');
    }
  };

  const clearFilters = () => {
    setDateRange('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = dateRange !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const funnelStages = funnelData ? [
    funnelData.totalLeads,
    funnelData.contactados,
    funnelData.interesados
  ] : [];

  const maxValue = funnelStages.length > 0 ? funnelStages[0].valor : 0;

  const mockCampaigns = [
    {
      id: 1,
      nombre: "Migracion",
      estado: "En funcionamiento",
      update_at: "10-01-2025",
      reglas_activas: 1
    }
  ]

  const mockActivas = [
    {
      id: 1,
      nombre: "Migracion",
      agentes_activos: 5,
      agentes_libres: 10,
      llamando: 6,
      respuestas: 22,
      no_atendido: 12,
      fallidas: 1,
      dropped: 5,
      porcentaje: "20%"
    },
    {
      id: 2,
      nombre: "Migracion",
      agentes_activos: 5,
      agentes_libres: 10,
      llamando: 6,
      respuestas: 22,
      no_atendido: 12,
      fallidas: 1,
      dropped: 5,
      porcentaje: "20%"
    },
    {
      id: 3,
      nombre: "Migracion",
      agentes_activos: 5,
      agentes_libres: 10,
      llamando: 6,
      respuestas: 22,
      no_atendido: 12,
      fallidas: 1,
      dropped: 5,
      porcentaje: "20%"
    },
    {
      id: 4,
      nombre: "Migracion",
      agentes_activos: 5,
      agentes_libres: 10,
      llamando: 6,
      respuestas: 22,
      no_atendido: 12,
      fallidas: 1,
      dropped: 5,
      porcentaje: "20%"
    }
  ]

  const mockLlamadas = [
    {
      id: 1,
      nombre: "Migracion",
      telefono: "992994112",
      inicio: "00:00:10"
    },
    {
      id: 2,
      nombre: "Migracion",
      telefono: "992114112",
      inicio: "00:00:11"
    },
  ]

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Visualiza el rendimiento del proceso de ventas</p>
        </div>
        <div className='items-center flex min-w-[180px]'>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            onChange={(e) => setTipoReporte(e.target.value)}
            value={tipoReporte}
          >
            <option value="mensajes">Mensajes</option>
            <option value="llamadas">Llamadas</option>
          </select>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Rango de fecha */}
          <div className="min-w-[180px]">
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

          {/* Botón actualizar */}
          <button
            onClick={loadFunnelData}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>
              Filtro aplicado: {DATE_RANGES.find(r => r.value === dateRange)?.label}
              {dateRange === 'custom' && dateFrom && dateTo && ` (${dateFrom} - ${dateTo})`}
            </span>
          </div>
        )}
      </div>
      
      {/* Contenido de reportes - Ventas o Llamadas*/}
      {tipoReporte == "mensajes" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Embudo de Ventas</h2>
        </div>

        {funnelData && (
          <div className="space-y-6">
            {/* Funnel Chart */}
            <div className="flex flex-col items-center py-8">
              {funnelStages.map((stage, index) => {
                const widthPercentage = maxValue > 0 ? (stage.valor / maxValue) * 100 : 0;
                const minWidth = 30;
                const calculatedWidth = Math.max(widthPercentage, minWidth);

                return (
                  <div
                    key={stage.nombre}
                    className="relative flex items-center justify-center transition-all duration-300 hover:scale-105"
                    style={{
                      width: `${calculatedWidth}%`,
                      minWidth: '200px',
                      maxWidth: '100%',
                      backgroundColor: FUNNEL_COLORS[index],
                      height: '80px',
                      clipPath: index === funnelStages.length - 1
                        ? 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)'
                        : 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)',
                      marginTop: index === 0 ? '0' : '-8px',
                    }}
                  >
                    <div className="text-white text-center z-10">
                      <div className="text-lg font-bold">{stage.valor.toLocaleString()}</div>
                      <div className="text-sm opacity-90">{stage.nombre}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {funnelStages.map((stage, index) => (
                <div
                  key={stage.nombre}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: FUNNEL_COLORS[index] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-600">{stage.nombre}</span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {stage.valor.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({stage.porcentaje}%)
                    </span>
                  </div>
                  {index > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Conversion desde Total: {stage.porcentaje}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conversion Rates */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Tasas de Conversion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Total Leads → Contactados</span>
                  <span className="font-semibold text-blue-900">
                    {funnelData.contactados.porcentaje}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Total Leads → Interesados</span>
                  <span className="font-semibold text-blue-900">
                    {funnelData.interesados.porcentaje}%
                  </span>
                </div>
                {funnelData.contactados.valor > 0 && (
                  <div className="flex items-center justify-between md:col-span-2">
                    <span className="text-sm text-blue-700">Contactados → Interesados</span>
                    <span className="font-semibold text-blue-900">
                      {Math.round((funnelData.interesados.valor / funnelData.contactados.valor) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!funnelData && (
          <div className="text-center py-8 text-gray-500">
            No hay datos disponibles para mostrar
          </div>
        )}
      </div>
      ) : (
        <div className='flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex w-full flex-col gap-6'>
              {/* Recuadro de llamadas */}
              <div className=' flex flex-col bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='text-white font-bold bg-primary-600 p-3'>
                  Total de Llamadas
                </div>
                <div className="p-5">
                  <div className='flex flex-row gap-6 items-center mb-5'>
                    <h3 className='font-semibold text-gray-800'>Llamadas hoy</h3>
                    <div className='rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-bold shadow-sm'>600</div>
                  </div>
                  <div className='flex flex-row justify-between'>
                    <div className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Total llamadas</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm' style={{width: '80%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Total no atendidas</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-sm' style={{width: '60%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Dropped</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm' style={{width: '45%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Agentes disponibles</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-sm' style={{width: '70%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Agentes hablando</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm' style={{width: '55%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Agentes en tipificación</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-sm' style={{width: '35%'}}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between mb-1'>
                          <label className='text-sm font-medium text-gray-700'>Agentes sin trabajar</label>
                          <label className='text-sm font-bold text-gray-900'>100</label>
                        </div>
                        <div className='relative bg-gray-200 rounded-full w-[300px] h-3 overflow-hidden'>
                          <div className='absolute top-0 left-0 h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-sm' style={{width: '25%'}}/>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row justify-between gap-5'>
                      <div className='flex flex-col gap-4'>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-blue-900'>00:00:30</p>
                          <p className='text-xs font-semibold text-blue-700 text-center'>Avg Ready Time</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-emerald-900'>00:00:30</p>
                          <p className='text-xs font-semibold text-emerald-700 text-center'>Avg Talk Time</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-teal-900'>20%</p>
                          <p className='text-xs font-semibold text-teal-700 text-center'>% atendidas</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-indigo-900'>21</p>
                          <p className='text-xs font-semibold text-indigo-700 text-center'>Agentes conectados</p>
                        </div>
                      </div>
                      <div className='flex flex-col gap-4'>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-purple-900'>00:00:30</p>
                          <p className='text-xs font-semibold text-purple-700 text-center'>Medio tiempo llamado</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-violet-900'>00:00:30</p>
                          <p className='text-xs font-semibold text-violet-700 text-center'>Tiempo medio en codificación</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-rose-900'>80%</p>
                          <p className='text-xs font-semibold text-rose-700 text-center'>% no atendidas</p>
                        </div>
                        <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                          <p className='text-xl font-bold text-green-900'>10</p>
                          <p className='text-xs font-semibold text-green-700 text-center'>Exito</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Recuadro de estado de campañas */}
              <div className='flex flex-col bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='text-white font-bold bg-primary-600 p-3'>
                  Estado de campañas
                </div>
                <div className="p-3">
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaña</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado de campaña</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última actualización de estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reglas activas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockCampaigns.map((cam) => {
                        return (
                          <tr key={cam.id} className='hover:bg-gray-50'>
                            <td className="px-6 py-4 text-sm text-gray-900">{cam.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{cam.estado}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{cam.update_at}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{cam.reglas_activas}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className='flex w-full flex-col gap-6'>
              {/* Recuadro de campañas activas */}
              <div className=' flex flex-col bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='text-white font-bold bg-primary-600 p-3'>
                  Estado de campañas activas
                </div>
                <div className="p-3">
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaña</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agentes activos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">agentes libres</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">llamando</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">respuestas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">no atendidas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">fallidas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">dropped</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% dropped</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockActivas.map((activa) => {
                        return (
                          <tr key={activa.id} className='hover:bg-gray-50'>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.agentes_activos}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.agentes_libres}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.llamando}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.respuestas}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.no_atendido}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.fallidas}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.dropped}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{activa.porcentaje}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Recuadro de llamadas realizadas */}
              <div className='flex flex-col bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='text-white font-bold bg-primary-600 p-3'>
                  Llamadas realizadas
                </div>
                <div className="p-3">
                  <table className='min-w-full table-fixed divide-y divide-gray-200'>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaña</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefóno</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">inicio de llamada</th>              
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockLlamadas.map((llamada) => {
                        return (
                           <tr key={llamada.id} className='hover:bg-gray-50'>
                            <td className="px-6 py-4 text-sm text-gray-900">{llamada.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{llamada.telefono}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{llamada.inicio}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
