'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Datos mockup para demostración
const MOCK_METRICS = {
  totalEnviados: 12458,
  tasaEntrega: 98.5,
  tasaLectura: 76.3,
  tasaRespuesta: 42.8,
  tiempoPromedioRespuesta: '2h 15m',
  plantillasActivas: 24,
  campanasEnCurso: 5,
  contactosAlcanzados: 8934,
};

const MOCK_CHART_DATA = [
  { fecha: '01 Feb', enviados: 420, entregados: 415, leidos: 312, respondidos: 156 },
  { fecha: '02 Feb', enviados: 380, entregados: 375, leidos: 298, respondidos: 142 },
  { fecha: '03 Feb', enviados: 520, entregados: 512, leidos: 408, respondidos: 198 },
  { fecha: '04 Feb', enviados: 450, entregados: 445, leidos: 356, respondidos: 178 },
  { fecha: '05 Feb', enviados: 610, entregados: 601, leidos: 482, respondidos: 245 },
  { fecha: '06 Feb', enviados: 580, entregados: 572, leidos: 458, respondidos: 232 },
  { fecha: '07 Feb', enviados: 490, entregados: 485, leidos: 392, respondidos: 189 },
];

const MOCK_PLANTILLAS_RENDIMIENTO = [
  { nombre: 'Bienvenida Lead', enviados: 3245, entregados: 3198, leidos: 2456, respondidos: 987, tasa: 30.4 },
  { nombre: 'Seguimiento Visita', enviados: 2890, entregados: 2845, leidos: 2134, respondidos: 856, tasa: 29.6 },
  { nombre: 'Promocion Proyecto', enviados: 2456, entregados: 2412, leidos: 1834, respondidos: 623, tasa: 25.4 },
  { nombre: 'Recordatorio Cita', enviados: 1987, entregados: 1965, leidos: 1678, respondidos: 534, tasa: 26.9 },
  { nombre: 'Informacion Unidad', enviados: 1880, entregados: 1856, leidos: 1423, respondidos: 445, tasa: 23.7 },
];

const MOCK_CAMPANAS = [
  { nombre: 'Lanzamiento Viva Sur', estado: 'ACTIVA', enviados: 2345, entregados: 2310, conversion: 8.5 },
  { nombre: 'Promo Febrero', estado: 'ACTIVA', enviados: 1890, entregados: 1865, conversion: 6.2 },
  { nombre: 'Seguimiento Leads Enero', estado: 'FINALIZADA', enviados: 3456, entregados: 3420, conversion: 12.3 },
  { nombre: 'Reactivacion Inactivos', estado: 'PROGRAMADA', enviados: 0, entregados: 0, conversion: 0 },
];

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

export default function WhatsAppDashboardPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('enviados');

  const dateRanges = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ];

  const pieData = useMemo(() => [
    { name: 'Entregados', value: MOCK_METRICS.tasaEntrega },
    { name: 'No Entregados', value: 100 - MOCK_METRICS.tasaEntrega },
  ], []);

  const responseDistribution = useMemo(() => [
    { name: 'Respondidos', value: MOCK_METRICS.tasaRespuesta },
    { name: 'Leidos', value: MOCK_METRICS.tasaLectura - MOCK_METRICS.tasaRespuesta },
    { name: 'Solo Entregados', value: MOCK_METRICS.tasaEntrega - MOCK_METRICS.tasaLectura },
    { name: 'No Entregados', value: 100 - MOCK_METRICS.tasaEntrega },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
          <p className="text-gray-600 mt-1">Metricas y rendimiento de mensajeria</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm text-gray-600">Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enviados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_METRICS.totalEnviados.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12.5% vs periodo anterior
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasa de Entrega</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_METRICS.tasaEntrega}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +0.8% vs periodo anterior
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasa de Lectura</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_METRICS.tasaLectura}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +3.2% vs periodo anterior
              </p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-xl">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasa de Respuesta</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_METRICS.tasaRespuesta}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +5.1% vs periodo anterior
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Evolucion de Mensajes</h2>
            <div className="flex items-center space-x-2">
              {['enviados', 'entregados', 'leidos', 'respondidos'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize ${
                    selectedMetric === metric
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribucion de Respuestas</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={responseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {responseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {responseDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/80">Tiempo Promedio Respuesta</p>
              <p className="text-xl font-bold">{MOCK_METRICS.tiempoPromedioRespuesta}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/80">Plantillas Activas</p>
              <p className="text-xl font-bold">{MOCK_METRICS.plantillasActivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/80">Campanas en Curso</p>
              <p className="text-xl font-bold">{MOCK_METRICS.campanasEnCurso}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/80">Contactos Alcanzados</p>
              <p className="text-xl font-bold">{MOCK_METRICS.contactosAlcanzados.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento por Plantilla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rendimiento por Plantilla</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Plantilla</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enviados</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tasa Resp.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PLANTILLAS_RENDIMIENTO.map((plantilla) => (
                  <tr key={plantilla.nombre} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{plantilla.nombre}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <p className="text-sm text-gray-600">{plantilla.enviados.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        plantilla.tasa >= 30 ? 'bg-green-100 text-green-800' :
                        plantilla.tasa >= 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plantilla.tasa}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campanas Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Campanas Recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Campana</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_CAMPANAS.map((campana) => (
                  <tr key={campana.nombre} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{campana.nombre}</p>
                      <p className="text-xs text-gray-500">{campana.enviados.toLocaleString()} enviados</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        campana.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                        campana.estado === 'FINALIZADA' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          campana.estado === 'ACTIVA' ? 'bg-green-500' :
                          campana.estado === 'FINALIZADA' ? 'bg-gray-500' :
                          'bg-yellow-500'
                        }`} />
                        <span>{campana.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-medium text-primary-600">
                        {campana.conversion > 0 ? `${campana.conversion}%` : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
