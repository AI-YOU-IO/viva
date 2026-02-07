'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_PLANTILLAS = 'https://json-server-two-pink.vercel.app/whatsapp-plantillas';

const STATUS_STYLES = {
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Aprobada' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pendiente' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Rechazada' },
};

const CATEGORY_LABELS = {
  MARKETING: 'Marketing',
  UTILITY: 'Utilidad',
  AUTHENTICATION: 'Autenticacion',
};

const EMPTY_FORM = {
  name: '',
  category: 'MARKETING',
  language: 'es',
  header_type: 'TEXT',
  header_text: '',
  body: '',
  footer: '',
  buttons: [],
};

const MOCK_PLANTILLAS = [
  {
    id: 1,
    name: 'bienvenida_lead',
    status: 'APPROVED',
    category: 'MARKETING',
    language: 'es',
    components: {
      header: { type: 'TEXT', text: 'Bienvenido a {{1}}' },
      body: 'Hola {{1}}, gracias por tu interes en nuestros proyectos inmobiliarios. Estamos encantados de ayudarte a encontrar tu hogar ideal.',
      footer: 'Responde MENU para ver opciones',
      buttons: [{ type: 'QUICK_REPLY', text: 'Ver proyectos' }, { type: 'QUICK_REPLY', text: 'Hablar con asesor' }],
    },
    createdAt: '2024-01-15',
    stats: { enviados: 3245, entregados: 3198, leidos: 2456 },
  },
  {
    id: 2,
    name: 'seguimiento_visita',
    status: 'APPROVED',
    category: 'UTILITY',
    language: 'es',
    components: {
      header: { type: 'TEXT', text: 'Recordatorio de Visita' },
      body: 'Hola {{1}}, te recordamos tu visita programada para el {{2}} a las {{3}} en {{4}}. Te esperamos!',
      footer: '',
      buttons: [{ type: 'QUICK_REPLY', text: 'Confirmar' }, { type: 'QUICK_REPLY', text: 'Reprogramar' }],
    },
    createdAt: '2024-01-20',
    stats: { enviados: 2890, entregados: 2845, leidos: 2134 },
  },
  {
    id: 3,
    name: 'promocion_febrero',
    status: 'PENDING',
    category: 'MARKETING',
    language: 'es',
    components: {
      header: { type: 'TEXT', text: 'Oferta Especial!' },
      body: 'Aprovecha nuestra promocion de febrero: {{1}}% de descuento en departamentos seleccionados. Valido hasta el {{2}}.',
      footer: 'Terminos y condiciones aplican',
      buttons: [{ type: 'URL', text: 'Ver promocion', url: 'https://example.com/promo' }],
    },
    createdAt: '2024-02-01',
    stats: { enviados: 0, entregados: 0, leidos: 0 },
  },
  {
    id: 4,
    name: 'cotizacion_unidad',
    status: 'APPROVED',
    category: 'UTILITY',
    language: 'es',
    components: {
      header: { type: 'TEXT', text: 'Tu Cotizacion' },
      body: 'Hola {{1}}, aqui tienes la cotizacion de la unidad {{2}}:\n\nPrecio Lista: {{3}}\nPrecio Promocional: {{4}}\nArea: {{5}} m2\n\nContacta a tu asesor para mas detalles.',
      footer: 'Precios sujetos a cambio sin previo aviso',
      buttons: [{ type: 'QUICK_REPLY', text: 'Separar unidad' }, { type: 'QUICK_REPLY', text: 'Ver mas opciones' }],
    },
    createdAt: '2024-01-25',
    stats: { enviados: 1987, entregados: 1965, leidos: 1678 },
  },
  {
    id: 5,
    name: 'encuesta_satisfaccion',
    status: 'REJECTED',
    category: 'MARKETING',
    language: 'es',
    components: {
      header: { type: 'TEXT', text: 'Tu opinion nos importa' },
      body: 'Hola {{1}}, queremos conocer tu experiencia. Por favor califica nuestro servicio del 1 al 5.',
      footer: '',
      buttons: [],
    },
    createdAt: '2024-02-03',
    stats: { enviados: 0, entregados: 0, leidos: 0 },
  },
];

export default function WhatsAppPlantillasPage() {
  const [plantillas, setPlantillas] = useState(MOCK_PLANTILLAS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [showSendModal, setShowSendModal] = useState(null);
  const [sendPhone, setSendPhone] = useState('');
  const [sendVariables, setSendVariables] = useState({});
  const [sending, setSending] = useState(false);

  const filteredPlantillas = plantillas.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.components.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingPlantilla(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (plantilla) => {
    setEditingPlantilla(plantilla);
    setFormData({
      name: plantilla.name,
      category: plantilla.category,
      language: plantilla.language,
      header_type: plantilla.components.header?.type || 'TEXT',
      header_text: plantilla.components.header?.text || '',
      body: plantilla.components.body,
      footer: plantilla.components.footer || '',
      buttons: plantilla.components.buttons || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.body) {
      toast.error('Completa los campos obligatorios: Nombre y Contenido');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        status: 'PENDING',
        category: formData.category,
        language: formData.language,
        components: {
          header: formData.header_text ? { type: formData.header_type, text: formData.header_text } : null,
          body: formData.body,
          footer: formData.footer || '',
          buttons: formData.buttons,
        },
        createdAt: new Date().toISOString().split('T')[0],
        stats: { enviados: 0, entregados: 0, leidos: 0 },
      };

      if (editingPlantilla) {
        setPlantillas(plantillas.map((p) => p.id === editingPlantilla.id ? { ...payload, id: editingPlantilla.id } : p));
        toast.success('Plantilla actualizada correctamente');
      } else {
        setPlantillas([...plantillas, { ...payload, id: Date.now() }]);
        toast.success('Plantilla creada correctamente');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (plantilla) => {
    if (confirm(`¿Estas seguro de eliminar la plantilla "${plantilla.name}"?`)) {
      setPlantillas(plantillas.filter((p) => p.id !== plantilla.id));
      toast.success('Plantilla eliminada correctamente');
    }
  };

  const extractVariables = (text) => {
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches)].map((m) => m.replace(/[{}]/g, ''));
  };

  const openSendModal = (plantilla) => {
    const allText = `${plantilla.components.header?.text || ''} ${plantilla.components.body}`;
    const variables = extractVariables(allText);
    const initialVars = {};
    variables.forEach((v) => {
      initialVars[v] = '';
    });
    setSendVariables(initialVars);
    setSendPhone('');
    setShowSendModal(plantilla);
  };

  const handleSend = async () => {
    if (!sendPhone || sendPhone.length < 9) {
      toast.error('Ingresa un numero de telefono valido');
      return;
    }

    setSending(true);
    try {
      // Simulacion de envio
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Mensaje enviado a ${sendPhone}`);
      setShowSendModal(null);
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const addButton = () => {
    if (formData.buttons.length < 3) {
      setFormData({
        ...formData,
        buttons: [...formData.buttons, { type: 'QUICK_REPLY', text: '' }],
      });
    }
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setFormData({ ...formData, buttons: newButtons });
  };

  const removeButton = (index) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index),
    });
  };

  const renderPreviewMessage = (plantilla) => {
    let body = plantilla.components.body;
    Object.keys(sendVariables).forEach((key) => {
      body = body.replace(`{{${key}}}`, sendVariables[key] || `[Variable ${key}]`);
    });
    return body;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas WhatsApp</h1>
          <p className="text-gray-600 mt-1">Gestiona tus plantillas de mensajes aprobadas por Meta</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Plantilla</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/20 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Total Plantillas</p>
              <p className="text-3xl font-bold mt-1">{plantillas.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <p className="text-sm text-gray-500">Aprobadas</p>
              </div>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {plantillas.filter((p) => p.status === 'APPROVED').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-yellow-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {plantillas.filter((p) => p.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-red-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <p className="text-sm text-gray-500">Rechazadas</p>
              </div>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {plantillas.filter((p) => p.status === 'REJECTED').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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
              placeholder="Buscar por nombre o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los estados</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="REJECTED">Rechazadas</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las categorias</option>
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utilidad</option>
            <option value="AUTHENTICATION">Autenticacion</option>
          </select>
        </div>
      </div>

      {/* Plantillas Grid */}
      {filteredPlantillas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron plantillas</h3>
          <p className="text-gray-500 mb-4">Crea tu primera plantilla o ajusta los filtros</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Crear plantilla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantillas.map((plantilla) => {
            const statusStyle = STATUS_STYLES[plantilla.status];
            const deliveryRate = plantilla.stats.enviados > 0
              ? Math.round((plantilla.stats.entregados / plantilla.stats.enviados) * 100)
              : 0;
            const readRate = plantilla.stats.entregados > 0
              ? Math.round((plantilla.stats.leidos / plantilla.stats.entregados) * 100)
              : 0;

            return (
              <div
                key={plantilla.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300"
              >
                {/* Header con gradiente segun status */}
                <div className={`px-5 py-4 ${
                  plantilla.status === 'APPROVED' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100' :
                  plantilla.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100' :
                  'bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${
                          plantilla.status === 'APPROVED' ? 'bg-green-100' :
                          plantilla.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <svg className={`w-4 h-4 ${
                            plantilla.status === 'APPROVED' ? 'text-green-600' :
                            plantilla.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{plantilla.name}</h3>
                          <p className="text-xs text-gray-500">{CATEGORY_LABELS[plantilla.category]} · {plantilla.language.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${plantilla.status === 'PENDING' ? 'animate-pulse' : ''}`} />
                      <span>{statusStyle.label}</span>
                    </span>
                  </div>
                </div>

                {/* Preview estilo WhatsApp */}
                <div className="px-4 py-4" style={{ backgroundColor: '#ECE5DD' }}>
                  <div className="relative">
                    {/* Bubble tail */}
                    <div className="absolute -right-1 top-0 w-3 h-3 overflow-hidden">
                      <div className="absolute transform rotate-45 bg-[#DCF8C6] w-3 h-3 -left-1.5 top-0"></div>
                    </div>
                    <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm max-h-28 overflow-hidden">
                      {plantilla.components.header && (
                        <p className="text-sm font-semibold text-gray-900 mb-1 truncate">
                          {plantilla.components.header.text}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {plantilla.components.body}
                      </p>
                      {plantilla.components.buttons && plantilla.components.buttons.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-[#c5e8b0]">
                          {plantilla.components.buttons.slice(0, 2).map((btn, idx) => (
                            <span key={idx} className="text-xs text-[#00a884] font-medium truncate">
                              {btn.text}
                            </span>
                          ))}
                          {plantilla.components.buttons.length > 2 && (
                            <span className="text-xs text-gray-400">+{plantilla.components.buttons.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats mejoradas */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{plantilla.stats.enviados.toLocaleString()}</p>
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
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowPreview(plantilla)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {plantilla.status === 'APPROVED' && (
                        <button
                          onClick={() => openSendModal(plantilla)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-[#25D366] text-white font-medium rounded-lg hover:bg-[#128C7E] transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>Enviar</span>
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(plantilla)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(plantilla)}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal - Mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <p className="text-sm text-primary-100">Configura tu plantilla de mensaje de WhatsApp</p>
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

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Formulario */}
                <div className="lg:col-span-3 p-6 space-y-5 border-r border-gray-100">
                  {/* Nombre y Categoria */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>Nombre *</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder="bienvenida_lead"
                      />
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Solo letras, numeros y guiones bajos</span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span>Categoria</span>
                        </span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utilidad</option>
                        <option value="AUTHENTICATION">Autenticacion</option>
                      </select>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <div className="p-1 bg-primary-100 rounded">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span>Encabezado (opcional)</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                        <select
                          value={formData.header_type}
                          onChange={(e) => setFormData({ ...formData, header_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                        >
                          <option value="TEXT">Texto</option>
                          <option value="IMAGE">Imagen</option>
                          <option value="VIDEO">Video</option>
                          <option value="DOCUMENT">Documento</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Texto</label>
                        <input
                          type="text"
                          value={formData.header_text}
                          onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                          placeholder="Bienvenido a {{1}}"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span>Contenido del mensaje *</span>
                      </span>
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors resize-none"
                      placeholder="Hola {{1}}, gracias por tu interes en nuestros servicios..."
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Usa {"{{1}}"}, {"{{2}}"}, etc. para variables</span>
                      </p>
                      <span className="text-xs text-gray-400">{formData.body.length}/1024</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Pie de mensaje (opcional)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.footer}
                      onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Responde MENU para ver opciones"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <div className="p-1 bg-primary-100 rounded">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <span>Botones (opcional)</span>
                      </h3>
                      {formData.buttons.length < 3 && (
                        <button
                          onClick={addButton}
                          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                    {formData.buttons.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-400">
                        <p>No hay botones configurados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.buttons.map((button, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full text-xs font-semibold text-primary-600">
                              {index + 1}
                            </div>
                            <select
                              value={button.type}
                              onChange={(e) => updateButton(index, 'type', e.target.value)}
                              className="w-36 px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50"
                            >
                              <option value="QUICK_REPLY">Respuesta rapida</option>
                              <option value="URL">URL</option>
                              <option value="PHONE_NUMBER">Telefono</option>
                            </select>
                            <input
                              type="text"
                              value={button.text}
                              onChange={(e) => updateButton(index, 'text', e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                              placeholder="Texto del boton"
                            />
                            {button.type === 'URL' && (
                              <input
                                type="text"
                                value={button.url || ''}
                                onChange={(e) => updateButton(index, 'url', e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                placeholder="https://..."
                              />
                            )}
                            <button
                              onClick={() => removeButton(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview en tiempo real */}
                <div className="lg:col-span-2 bg-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Vista previa en tiempo real</span>
                  </h3>

                  <div
                    className="rounded-xl overflow-hidden shadow-lg"
                    style={{ backgroundColor: '#ECE5DD' }}
                  >
                    <div className="p-4 min-h-[300px]">
                      <div className="flex justify-end">
                        <div className="relative max-w-[90%]">
                          <div className="absolute -right-2 top-0 w-3 h-3 overflow-hidden">
                            <div className="absolute transform rotate-45 bg-[#DCF8C6] w-3 h-3 -left-1.5 top-0"></div>
                          </div>
                          <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm">
                            {formData.header_text && (
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {formData.header_text || 'Encabezado'}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {formData.body || 'El contenido de tu mensaje aparecera aqui...'}
                            </p>
                            {formData.footer && (
                              <p className="text-xs text-gray-500 mt-2">{formData.footer}</p>
                            )}
                            {formData.buttons.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#c5e8b0] space-y-1">
                                {formData.buttons.map((btn, idx) => (
                                  <button
                                    key={idx}
                                    className="w-full py-1.5 text-sm text-[#00a884] font-medium hover:bg-[#c5e8b0]/50 rounded transition-colors"
                                  >
                                    {btn.text || `Boton ${idx + 1}`}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-[10px] text-gray-500">12:30</span>
                              <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 11" fill="currentColor">
                                <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273zm2.992 0a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.066-1.009-.566.718 1.352 1.352a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Nota importante</p>
                        <p className="mt-0.5">Las plantillas deben ser aprobadas por Meta antes de poder usarlas. El proceso puede tomar hasta 24 horas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Campos obligatorios
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.body}
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
                      <span>{editingPlantilla ? 'Actualizar' : 'Crear Plantilla'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal - WhatsApp Style */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Phone Frame Header */}
            <div className="bg-[#075E54] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPreview(null)}
                    className="p-1 text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Vista Previa</p>
                    <p className="text-white/70 text-xs">{showPreview.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-white/80">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chat Background */}
            <div
              className="p-4 min-h-[320px]"
              style={{
                backgroundColor: '#ECE5DD',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {/* Message Bubble */}
              <div className="flex justify-end mb-2">
                <div className="relative max-w-[85%]">
                  {/* Bubble tail */}
                  <div className="absolute -right-2 top-0 w-4 h-4 overflow-hidden">
                    <div className="absolute transform rotate-45 bg-[#DCF8C6] w-4 h-4 -left-2 top-0"></div>
                  </div>

                  <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm">
                    {showPreview.components.header && (
                      <p className="text-[15px] font-semibold text-gray-900 mb-1.5">
                        {showPreview.components.header.text}
                      </p>
                    )}
                    <p className="text-[14px] text-gray-800 whitespace-pre-line leading-relaxed">
                      {showPreview.components.body}
                    </p>
                    {showPreview.components.footer && (
                      <p className="text-[12px] text-gray-500 mt-2">{showPreview.components.footer}</p>
                    )}

                    {/* Buttons */}
                    {showPreview.components.buttons && showPreview.components.buttons.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#c5e8b0] space-y-1.5">
                        {showPreview.components.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            className="w-full py-2 text-[14px] text-[#00a884] font-medium hover:bg-[#c5e8b0]/50 rounded-md transition-colors flex items-center justify-center space-x-1"
                          >
                            {btn.type === 'URL' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            )}
                            {btn.type === 'PHONE_NUMBER' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            )}
                            <span>{btn.text}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-[11px] text-gray-500">12:30</span>
                      <svg className="w-4 h-4 text-[#53bdeb]" viewBox="0 0 16 11" fill="currentColor">
                        <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273zm2.992 0a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.066-1.009-.566.718 1.352 1.352a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#F0F0F0] px-3 py-2 flex items-center space-x-2">
              <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400 text-sm flex-1">Mensaje</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>

            {/* Template Info Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${STATUS_STYLES[showPreview.status].bg} ${STATUS_STYLES[showPreview.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[showPreview.status].dot}`} />
                    <span>{STATUS_STYLES[showPreview.status].label}</span>
                  </span>
                  <span className="text-gray-500">{CATEGORY_LABELS[showPreview.category]}</span>
                </div>
                <button
                  onClick={() => setShowPreview(null)}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal - Mejorado */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Header verde WhatsApp */}
            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Enviar Plantilla</h2>
                  <p className="text-sm text-white/80">{showSendModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSendModal(null)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Formulario */}
              <div className="p-6 space-y-5 border-r border-gray-100">
                {/* Telefono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Numero de telefono *</span>
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600">
                      <span className="text-lg">🇵🇪</span>
                      <span>+51</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-[#25D366] bg-gray-50 focus:bg-white transition-colors"
                        placeholder="999 888 777"
                      />
                      {sendPhone.length === 9 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Ingresa el numero sin el codigo de pais</p>
                </div>

                {/* Variables */}
                {Object.keys(sendVariables).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <div className="p-1 bg-primary-100 rounded">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <span>Personaliza las variables</span>
                    </h3>
                    <div className="space-y-3">
                      {Object.keys(sendVariables).map((key) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Variable {`{{${key}}}`}
                          </label>
                          <input
                            type="text"
                            value={sendVariables[key]}
                            onChange={(e) => setSendVariables({ ...sendVariables, [key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-[#25D366] bg-white text-sm"
                            placeholder={key === '1' ? 'Ej: Juan' : `Valor para {{${key}}}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <p className="font-medium">Sobre las plantillas</p>
                      <p className="mt-0.5">Solo puedes enviar plantillas aprobadas por Meta. Los mensajes se cobran segun tu plan.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Vista previa del mensaje</span>
                </h3>

                <div
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{ backgroundColor: '#ECE5DD' }}
                >
                  {/* Chat header mini */}
                  <div className="bg-[#075E54] px-3 py-2 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">+51 {sendPhone || '---'}</p>
                      <p className="text-white/60 text-xs">en linea</p>
                    </div>
                  </div>

                  <div className="p-4 min-h-[200px]">
                    <div className="flex justify-end">
                      <div className="relative max-w-[90%]">
                        <div className="absolute -right-2 top-0 w-3 h-3 overflow-hidden">
                          <div className="absolute transform rotate-45 bg-[#DCF8C6] w-3 h-3 -left-1.5 top-0"></div>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm">
                          {showSendModal.components.header && (
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {showSendModal.components.header.text}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {renderPreviewMessage(showSendModal)}
                          </p>
                          {showSendModal.components.footer && (
                            <p className="text-xs text-gray-500 mt-2">{showSendModal.components.footer}</p>
                          )}
                          {showSendModal.components.buttons && showSendModal.components.buttons.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#c5e8b0] space-y-1">
                              {showSendModal.components.buttons.map((btn, idx) => (
                                <button
                                  key={idx}
                                  className="w-full py-1.5 text-sm text-[#00a884] font-medium hover:bg-[#c5e8b0]/50 rounded transition-colors"
                                >
                                  {btn.text}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <span className="text-[10px] text-gray-500">{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 11" fill="currentColor">
                              <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .501.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.337-.273z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
                </svg>
                <span>Plantilla: <strong className="text-gray-700">{showSendModal.name}</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSendModal(null)}
                  className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || sendPhone.length !== 9}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-medium rounded-xl hover:from-[#20bd5a] hover:to-[#0f7a6a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-green-500/25"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      <span>Enviar mensaje</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
