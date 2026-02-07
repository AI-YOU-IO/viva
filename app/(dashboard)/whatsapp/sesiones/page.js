'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { whatsappQRService } from '@/lib/whatsappService';

const STATUS_STYLES = {
  connected: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Conectado' },
  qr: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Esperando QR' },
  logout: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', label: 'Desconectado' },
  loading: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Cargando...' },
};

const EMPTY_FORM = {
  session_id: '',
  titulo: '',
};

export default function WhatsAppSesionesPage() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSesion, setEditingSesion] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [qrLoading, setQRLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Cargar sesiones al iniciar
  const loadSesiones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await whatsappQRService.listar();
      if (response.success && response.data) {
        setSesiones(response.data);
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      toast.error('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estados de las sesiones
  const loadEstados = useCallback(async () => {
    try {
      const response = await whatsappQRService.obtenerEstados();
      if (response.success && response.data) {
        setSesiones((prev) =>
          prev.map((s) => {
            const estado = response.data.find((e) => e.session_id === s.session_id);
            if (estado) {
              return { ...s, estado: estado.status, numero: estado.numero || s.numero };
            }
            return s;
          })
        );
      }
    } catch (error) {
      console.error('Error al obtener estados:', error);
    }
  }, []);

  useEffect(() => {
    loadSesiones();
  }, [loadSesiones]);

  // Polling para actualizar estados cada 5 segundos
  useEffect(() => {
    if (sesiones.length === 0) return;

    const interval = setInterval(() => {
      loadEstados();
    }, 5000);

    return () => clearInterval(interval);
  }, [sesiones.length, loadEstados]);

  const filteredSesiones = sesiones.filter((s) =>
    s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSesion(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (sesion) => {
    setEditingSesion(sesion);
    setFormData({
      session_id: sesion.session_id,
      titulo: sesion.titulo,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.session_id || !formData.titulo) {
      toast.error('Completa todos los campos');
      return;
    }

    // Validar session_id unico
    const exists = sesiones.some(
      (s) => s.session_id === formData.session_id && s.id !== editingSesion?.id
    );
    if (exists) {
      toast.error('Ya existe una sesion con ese ID');
      return;
    }

    setSaving(true);
    try {
      if (editingSesion) {
        const response = await whatsappQRService.actualizar({
          id: editingSesion.id,
          session_id: formData.session_id,
          titulo: formData.titulo,
        });
        if (response.success) {
          toast.success('Sesion actualizada correctamente');
          loadSesiones();
        } else {
          throw new Error(response.message || 'Error al actualizar');
        }
      } else {
        const response = await whatsappQRService.crear({
          session_id: formData.session_id,
          titulo: formData.titulo,
        });
        if (response.success) {
          toast.success('Sesion creada correctamente');
          loadSesiones();
          // Abrir modal de QR automaticamente
          if (response.data) {
            setTimeout(() => setShowQRModal(response.data), 500);
          }
        } else {
          throw new Error(response.message || 'Error al crear');
        }
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(error.message || 'Error al guardar la sesion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sesion) => {
    try {
      const response = await whatsappQRService.eliminar(sesion.id);
      if (response.success) {
        toast.success('Sesion eliminada correctamente');
        loadSesiones();
      } else {
        throw new Error(response.message || 'Error al eliminar');
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Error al eliminar la sesion');
    }
  };

  const handleDisconnect = async (sesion) => {
    try {
      // Aqui se llamaria al endpoint de desconexion
      setSesiones(
        sesiones.map((s) =>
          s.id === sesion.id ? { ...s, estado: 'logout', numero: null } : s
        )
      );
      toast.success('Sesion desconectada');
    } catch (error) {
      toast.error('Error al desconectar');
    }
  };

  const handleReconnect = (sesion) => {
    setSesiones(
      sesiones.map((s) => (s.id === sesion.id ? { ...s, estado: 'qr' } : s))
    );
    openQRModal(sesion);
  };

  const openQRModal = async (sesion) => {
    setShowQRModal(sesion);
    setQRLoading(true);
    setQrData(null);
    try {
      const response = await whatsappQRService.obtenerQR(sesion.session_id);
      if (response.success && response.data?.qr) {
        setQrData(response.data.qr);
      }
    } catch (error) {
      console.error('Error al obtener QR:', error);
      toast.error('Error al obtener el codigo QR');
    } finally {
      setQRLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sesiones WhatsApp</h1>
          <p className="text-gray-600 mt-1">Gestiona tus conexiones de WhatsApp</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Sesion</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Sesiones</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sesiones.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm text-gray-500">Conectadas</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {sesiones.filter((s) => s.estado === 'connected').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <p className="text-sm text-gray-500">Esperando QR</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {sesiones.filter((s) => s.estado === 'qr').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Mensajes Hoy</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {sesiones.reduce((acc, s) => acc + s.mensajes_hoy, 0)}
          </p>
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
            placeholder="Buscar por titulo o session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-12 bg-gray-200" />
              <div className="p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-200 rounded-lg" />
                  <div className="h-16 bg-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="h-12 bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredSesiones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay sesiones configuradas</h3>
          <p className="text-gray-500 mb-4">Crea tu primera sesion de WhatsApp</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Crear sesion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSesiones.map((sesion) => {
            const statusStyle = STATUS_STYLES[sesion.estado];
            return (
              <div
                key={sesion.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Header con estado */}
                <div className={`px-5 py-3 ${sesion.estado === 'connected' ? 'bg-green-50' : sesion.estado === 'qr' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${sesion.estado === 'connected' ? 'animate-pulse' : ''}`} />
                      <span>{statusStyle.label}</span>
                    </span>
                    <p className="text-xs text-gray-500">ID: {sesion.session_id}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{sesion.titulo}</h3>
                      <p className="text-sm text-gray-500">
                        {sesion.numero || 'Sin numero conectado'}
                      </p>
                    </div>
                  </div>

                  {sesion.estado === 'connected' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{sesion.mensajes_hoy}</p>
                        <p className="text-xs text-gray-500">Mensajes hoy</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-gray-900">{sesion.ultimo_mensaje?.split(' ')[1] || '-'}</p>
                        <p className="text-xs text-gray-500">Ultimo mensaje</p>
                      </div>
                    </div>
                  )}

                  {sesion.estado === 'qr' && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4 text-center">
                      <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-sm text-yellow-700">Escanea el codigo QR para conectar</p>
                      <button
                        onClick={() => openQRModal(sesion)}
                        className="mt-2 px-4 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Ver codigo QR
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Creado: {sesion.createdAt}</p>
                  <div className="flex items-center space-x-1">
                    {sesion.estado === 'connected' && (
                      <button
                        onClick={() => handleDisconnect(sesion)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Desconectar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    )}
                    {sesion.estado === 'logout' && (
                      <button
                        onClick={() => handleReconnect(sesion)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reconectar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(sesion)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(sesion)}
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
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSesion ? 'Editar Sesion' : 'Nueva Sesion'}
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

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session ID *</label>
                <input
                  type="text"
                  value={formData.session_id}
                  onChange={(e) => setFormData({ ...formData, session_id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="whatsapp_ventas"
                />
                <p className="text-xs text-gray-400 mt-1">Identificador unico (sin espacios)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="WhatsApp Ventas"
                />
              </div>
            </div>

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
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                <span>{saving ? 'Guardando...' : editingSesion ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Escanear Codigo QR</h2>
              <button
                onClick={() => setShowQRModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-base font-medium text-gray-900">{showQRModal.titulo}</h3>
                <p className="text-sm text-gray-500">ID: {showQRModal.session_id}</p>
              </div>

              {/* QR Code */}
              <div className="bg-gray-100 rounded-xl p-8 mb-6">
                {qrLoading ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4" />
                    <p className="text-sm text-gray-600">Obteniendo codigo QR...</p>
                  </div>
                ) : qrData ? (
                  <div className="bg-white p-4 rounded-lg flex justify-center">
                    <img
                      src={qrData}
                      alt="Codigo QR WhatsApp"
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-gray-600">No se pudo obtener el codigo QR</p>
                    <button
                      onClick={() => openQRModal(showQRModal)}
                      className="mt-2 text-sm text-primary-600 hover:underline"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">1</span>
                  <p>Abre WhatsApp en tu telefono</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">2</span>
                  <p>Ve a Configuracion &gt; Dispositivos vinculados</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">3</span>
                  <p>Toca "Vincular un dispositivo" y escanea el codigo</p>
                </div>
              </div>

              {!qrLoading && qrData && (
                <button
                  onClick={() => openQRModal(showQRModal)}
                  className="w-full mt-6 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Actualizar codigo QR
                </button>
              )}
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
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Sesion</h3>
                <p className="text-sm text-gray-500">
                  ¿Estas seguro de eliminar la sesion <strong>{showDeleteConfirm.titulo}</strong>?
                </p>
              </div>
            </div>
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">
              Esta accion desconectara WhatsApp y eliminara todos los datos de la sesion.
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
