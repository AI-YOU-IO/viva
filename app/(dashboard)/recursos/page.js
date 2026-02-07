'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

const TipoIcon = ({ tipo, className = 'w-5 h-5' }) => {
  const icons = {
    imagen: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    video: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    pdf: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h4" />
      </svg>
    ),
    documento: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    otro: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    ),
  };
  return icons[tipo] || icons.otro;
};

const TIPO_RECURSO_ICONS = {
  imagen: { color: 'bg-blue-100 text-blue-700', ext: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
  video: { color: 'bg-purple-100 text-purple-700', ext: ['mp4', 'mov', 'avi', 'webm'] },
  pdf: { color: 'bg-red-100 text-red-700', ext: ['pdf'] },
  documento: { color: 'bg-green-100 text-green-700', ext: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'] },
  otro: { color: 'bg-gray-100 text-gray-700', ext: [] },
};

const EMPTY_FORM = {
  nombre: '',
  url: '',
  tipo_recurso_id: '',
  id_proyecto: '',
  id_tipologia: '',
};

const VIEW_MODES = { grid: 'grid', list: 'list' };

// Datos falsos para desarrollo
const MOCK_TIPOS_RECURSO = [
  { id: 1, name: 'Imagen' },
  { id: 2, name: 'Video' },
  { id: 3, name: 'PDF' },
  { id: 4, name: 'Documento' },
  { id: 5, name: 'Otro' },
];

const MOCK_PROYECTOS = [
  { id: 1, nombre: 'Residencial Las Palmas' },
  { id: 2, nombre: 'Torre Mirador' },
  { id: 3, nombre: 'Parque Central' },
  { id: 4, nombre: 'Villa Serena' },
];

const MOCK_TIPOLOGIAS = [
  { id: 1, nombre: 'Departamento 2D' },
  { id: 2, nombre: 'Departamento 3D' },
  { id: 3, nombre: 'Penthouse' },
  { id: 4, nombre: 'Estudio' },
];

const MOCK_RECURSOS = [
  {
    id: 1,
    nombre: 'Fachada principal',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 1,
    id_tipologia: null,
  },
  {
    id: 2,
    nombre: 'Render interior sala',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 1,
    id_tipologia: 1,
  },
  {
    id: 3,
    nombre: 'Plano arquitectónico',
    url: 'https://example.com/planos/plano-torre-mirador.pdf',
    tipo_recurso_id: 3,
    id_proyecto: 2,
    id_tipologia: 2,
  },
  {
    id: 4,
    nombre: 'Video recorrido virtual',
    url: 'https://example.com/videos/recorrido-virtual.mp4',
    tipo_recurso_id: 2,
    id_proyecto: 2,
    id_tipologia: null,
  },
  {
    id: 5,
    nombre: 'Brochure comercial',
    url: 'https://example.com/docs/brochure-parque-central.pdf',
    tipo_recurso_id: 3,
    id_proyecto: 3,
    id_tipologia: null,
  },
  {
    id: 6,
    nombre: 'Vista aérea del proyecto',
    url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 3,
    id_tipologia: null,
  },
  {
    id: 7,
    nombre: 'Cotización modelo A',
    url: 'https://example.com/docs/cotizacion-modelo-a.xlsx',
    tipo_recurso_id: 4,
    id_proyecto: 1,
    id_tipologia: 1,
  },
  {
    id: 8,
    nombre: 'Cocina moderna render',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 4,
    id_tipologia: 3,
  },
  {
    id: 9,
    nombre: 'Video testimonial cliente',
    url: 'https://example.com/videos/testimonial-cliente.mp4',
    tipo_recurso_id: 2,
    id_proyecto: 4,
    id_tipologia: null,
  },
  {
    id: 10,
    nombre: 'Área de piscina',
    url: 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 2,
    id_tipologia: null,
  },
  {
    id: 11,
    nombre: 'Contrato modelo',
    url: 'https://example.com/docs/contrato-modelo.docx',
    tipo_recurso_id: 4,
    id_proyecto: null,
    id_tipologia: null,
  },
  {
    id: 12,
    nombre: 'Dormitorio principal',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
    tipo_recurso_id: 1,
    id_proyecto: 1,
    id_tipologia: 2,
  },
];

export default function RecursosPage() {
  const { data: session } = useSession();
  const [recursos, setRecursos] = useState([]);
  const [tiposRecurso, setTiposRecurso] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tipologias, setTipologias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState(null);
  const [deletingRecurso, setDeletingRecurso] = useState(null);
  const [previewRecurso, setPreviewRecurso] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [viewMode, setViewMode] = useState(VIEW_MODES.grid);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recursosRes, tiposRes, proyectosRes, tipologiasRes] = await Promise.allSettled([
        apiClient.get('/crm/recursos'),
        apiClient.get('/crm/tipo-recursos'),
        apiClient.get('/crm/proyectos'),
        apiClient.get('/crm/tipologias'),
      ]);

      const recursosData = recursosRes.status === 'fulfilled' ? (recursosRes.value?.data || recursosRes.value || []) : [];
      const tiposData = tiposRes.status === 'fulfilled' ? (tiposRes.value?.data || tiposRes.value || []) : [];
      const proyectosData = proyectosRes.status === 'fulfilled' ? (proyectosRes.value?.data || proyectosRes.value || []) : [];
      const tipologiasData = tipologiasRes.status === 'fulfilled' ? (tipologiasRes.value?.data || tipologiasRes.value || []) : [];

      // Usar datos falsos si la API no devuelve datos
      setRecursos(recursosData.length > 0 ? recursosData : MOCK_RECURSOS);
      setTiposRecurso(tiposData.length > 0 ? tiposData : MOCK_TIPOS_RECURSO);
      setProyectos(proyectosData.length > 0 ? proyectosData : MOCK_PROYECTOS);
      setTipologias(tipologiasData.length > 0 ? tipologiasData : MOCK_TIPOLOGIAS);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    try {
      const pathname = new URL(url).pathname;
      const lastDot = pathname.lastIndexOf('.');
      if (lastDot === -1) return '';
      return pathname.substring(lastDot + 1).toLowerCase();
    } catch {
      return url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || '';
    }
  };

  const getTipoByExtension = (url, tipoRecursoId) => {
    const ext = getFileExtension(url);
    for (const [key, value] of Object.entries(TIPO_RECURSO_ICONS)) {
      if (value.ext.includes(ext)) return key;
    }
    // Fallback por tipo_recurso_id
    if (tipoRecursoId) {
      const tipoNombre = tiposRecurso.find(t => t.id === tipoRecursoId)?.name?.toLowerCase();
      if (tipoNombre) {
        if (tipoNombre.includes('imagen') || tipoNombre.includes('image') || tipoNombre.includes('foto')) return 'imagen';
        if (tipoNombre.includes('video')) return 'video';
        if (tipoNombre.includes('pdf')) return 'pdf';
        if (tipoNombre.includes('documento') || tipoNombre.includes('document')) return 'documento';
      }
    }
    return 'otro';
  };

  const getTipoRecursoNombre = (tipoId) => {
    const tipo = tiposRecurso.find(t => t.id === tipoId);
    return tipo?.name || 'Sin tipo';
  };

  const getProyectoNombre = (proyectoId) => {
    if (!proyectoId) return null;
    const proyecto = proyectos.find(p => p.id === proyectoId);
    return proyecto?.nombre || proyecto?.name || null;
  };

  const isImageUrl = (url, tipoRecursoId) => {
    if (!url) return false;
    const ext = getFileExtension(url);
    if (TIPO_RECURSO_ICONS.imagen.ext.includes(ext)) return true;
    if (tipoRecursoId) {
      const tipoNombre = tiposRecurso.find(t => t.id === tipoRecursoId)?.name?.toLowerCase();
      if (tipoNombre && (tipoNombre.includes('imagen') || tipoNombre.includes('image') || tipoNombre.includes('foto'))) return true;
    }
    return false;
  };

  const isVideoUrl = (url, tipoRecursoId) => {
    if (!url) return false;
    const ext = getFileExtension(url);
    if (TIPO_RECURSO_ICONS.video.ext.includes(ext)) return true;
    if (tipoRecursoId) {
      const tipoNombre = tiposRecurso.find(t => t.id === tipoRecursoId)?.name?.toLowerCase();
      if (tipoNombre && tipoNombre.includes('video')) return true;
    }
    return false;
  };

  const filteredRecursos = recursos.filter((r) => {
    const matchSearch = r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || r.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'all' || r.tipo_recurso_id?.toString() === filterTipo;
    return matchSearch && matchTipo;
  });

  const stats = {
    total: recursos.length,
    imagenes: recursos.filter(r => getTipoByExtension(r.url, r.tipo_recurso_id) === 'imagen').length,
    videos: recursos.filter(r => getTipoByExtension(r.url, r.tipo_recurso_id) === 'video').length,
    documentos: recursos.filter(r => ['pdf', 'documento'].includes(getTipoByExtension(r.url, r.tipo_recurso_id))).length,
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingRecurso(null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (recurso) => {
    setFormData({
      nombre: recurso.nombre || '',
      url: recurso.url || '',
      tipo_recurso_id: recurso.tipo_recurso_id?.toString() || '',
      id_proyecto: recurso.id_proyecto?.toString() || '',
      id_tipologia: recurso.id_tipologia?.toString() || '',
    });
    setEditingRecurso(recurso);
    setSelectedFile(null);
    setShowModal(true);
  };

  const openDeleteModal = (recurso) => {
    setDeletingRecurso(recurso);
    setShowDeleteModal(true);
  };

  const openPreview = (recurso) => {
    setPreviewRecurso(recurso);
    setShowPreviewModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.nombre) {
        setFormData(prev => ({ ...prev, nombre: file.name.split('.')[0] }));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!formData.nombre) {
        setFormData(prev => ({ ...prev, nombre: file.name.split('.')[0] }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.url.trim() && !selectedFile) {
      toast.error('Debes ingresar una URL o subir un archivo');
      return;
    }
    if (!formData.tipo_recurso_id) {
      toast.error('Selecciona un tipo de recurso');
      return;
    }

    setSaving(true);
    try {
      let url = formData.url;

      // Si hay archivo, subirlo primero
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        setUploading(true);
        const uploadRes = await apiClient.upload('/crm/recursos/upload', uploadData);
        url = uploadRes?.data?.url || uploadRes?.url || url;
        setUploading(false);
      }

      const payload = {
        nombre: formData.nombre.trim(),
        url: url.trim(),
        tipo_recurso_id: parseInt(formData.tipo_recurso_id),
        ...(formData.id_proyecto ? { id_proyecto: parseInt(formData.id_proyecto) } : {}),
        ...(formData.id_tipologia ? { id_tipologia: parseInt(formData.id_tipologia) } : {}),
      };

      if (editingRecurso) {
        await apiClient.put(`/crm/recursos/${editingRecurso.id}`, payload);
        toast.success('Recurso actualizado correctamente');
      } else {
        await apiClient.post('/crm/recursos', payload);
        toast.success('Recurso creado correctamente');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error?.msg || error?.message || 'Error al guardar el recurso');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecurso) return;
    try {
      await apiClient.delete(`/crm/recursos/${deletingRecurso.id}`);
      toast.success('Recurso eliminado correctamente');
      setShowDeleteModal(false);
      setDeletingRecurso(null);
      loadData();
    } catch (error) {
      toast.error(error?.msg || 'Error al eliminar el recurso');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              Recursos
            </h1>
            <p className="text-gray-500 mt-1">Gestiona imágenes, videos, documentos y más</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo recurso
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-1">Total</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.imagenes}</p>
                <p className="text-sm text-gray-500 mt-1">Imagenes</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <TipoIcon tipo="imagen" className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{stats.videos}</p>
                <p className="text-sm text-gray-500 mt-1">Videos</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <TipoIcon tipo="video" className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">{stats.documentos}</p>
                <p className="text-sm text-gray-500 mt-1">Documentos</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <TipoIcon tipo="pdf" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            {/* Filter tipo */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[160px]"
            >
              <option value="all">Todos los tipos</option>
              {tiposRecurso.map(tipo => (
                <option key={tipo.id} value={tipo.id.toString()}>{tipo.name}</option>
              ))}
            </select>
            {/* View mode */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode(VIEW_MODES.grid)}
                className={`p-2 rounded-lg transition-all ${viewMode === VIEW_MODES.grid ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode(VIEW_MODES.list)}
                className={`p-2 rounded-lg transition-all ${viewMode === VIEW_MODES.list ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredRecursos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterTipo !== 'all' ? 'No se encontraron recursos' : 'Sin recursos aún'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterTipo !== 'all' ? 'Intenta cambiar los filtros de búsqueda' : 'Sube tu primer archivo para empezar'}
            </p>
            {!searchTerm && filterTipo === 'all' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Subir recurso
              </button>
            )}
          </div>
        ) : viewMode === VIEW_MODES.grid ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecursos.map((recurso) => {
              const tipoVisual = getTipoByExtension(recurso.url, recurso.tipo_recurso_id);
              const tipoConfig = TIPO_RECURSO_ICONS[tipoVisual];
              const proyectoNombre = getProyectoNombre(recurso.id_proyecto);
              const esImagen = isImageUrl(recurso.url, recurso.tipo_recurso_id);

              return (
                <div key={recurso.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all hover:-translate-y-0.5">
                  {/* Preview */}
                  <div
                    className="h-44 relative cursor-pointer overflow-hidden bg-gray-100"
                    onClick={() => openPreview(recurso)}
                  >
                    {esImagen ? (
                      <img
                        src={recurso.url}
                        alt={recurso.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`${esImagen ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}>
                      <div className={`w-16 h-16 rounded-2xl ${tipoConfig.color} flex items-center justify-center`}>
                        <TipoIcon tipo={tipoVisual} className="w-8 h-8" />
                      </div>
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openPreview(recurso); }}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                          title="Vista previa"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <a
                          href={recurso.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                          title="Abrir en nueva pestaña"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    {/* Badge tipo */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${tipoConfig.color} backdrop-blur-sm inline-flex items-center gap-1`}>
                      <TipoIcon tipo={tipoVisual} className="w-3.5 h-3.5" />
                      {getTipoRecursoNombre(recurso.tipo_recurso_id)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate" title={recurso.nombre}>{recurso.nombre}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {proyectoNombre && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-indigo-50 text-indigo-700">
                          {proyectoNombre}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{getFileExtension(recurso.url) ? `.${getFileExtension(recurso.url)}` : getTipoRecursoNombre(recurso.tipo_recurso_id)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(recurso)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(recurso.url);
                          toast.success('URL copiada');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copiar URL
                      </button>
                      <button
                        onClick={() => openDeleteModal(recurso)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          /* List View */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Recurso</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Proyecto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">URL</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecursos.map((recurso) => {
                  const tipoVisual = getTipoByExtension(recurso.url, recurso.tipo_recurso_id);
                  const tipoConfig = TIPO_RECURSO_ICONS[tipoVisual];
                  const proyectoNombre = getProyectoNombre(recurso.id_proyecto);

                  return (
                    <tr key={recurso.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                            {isImageUrl(recurso.url, recurso.tipo_recurso_id) ? (
                              <img src={recurso.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${tipoConfig.color}`}>
                                <TipoIcon tipo={tipoVisual} className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{recurso.nombre}</p>
                            <p className="text-xs text-gray-400">{getFileExtension(recurso.url) ? `.${getFileExtension(recurso.url)}` : getTipoRecursoNombre(recurso.tipo_recurso_id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${tipoConfig.color}`}>
                          <TipoIcon tipo={tipoVisual} className="w-3.5 h-3.5" />
                          {getTipoRecursoNombre(recurso.tipo_recurso_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {proyectoNombre ? (
                          <span className="text-sm text-gray-700">{proyectoNombre}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-500 truncate max-w-[200px]" title={recurso.url}>{recurso.url}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openPreview(recurso)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Vista previa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => openEditModal(recurso)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => openDeleteModal(recurso)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingRecurso ? 'Editar recurso' : 'Nuevo recurso'}</h2>
                    <p className="text-white/70 text-sm">Sube archivos o añade URLs</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Drag & Drop Zone */}
              {!editingRecurso && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 text-gray-400 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">Arrastra un archivo aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-400 mt-1">Imágenes, videos, PDFs, documentos</p>
                    </>
                  )}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nombre del recurso"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL {selectedFile ? '(se generará al subir)' : '*'}</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={selectedFile ? 'Se generará automáticamente' : 'https://ejemplo.com/archivo.pdf'}
                  disabled={!!selectedFile}
                />
              </div>

              {/* Tipo recurso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de recurso *</label>
                <select
                  value={formData.tipo_recurso_id}
                  onChange={(e) => setFormData({ ...formData, tipo_recurso_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposRecurso.map(tipo => (
                    <option key={tipo.id} value={tipo.id.toString()}>{tipo.name}</option>
                  ))}
                </select>
              </div>

              {/* Campos opcionales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <select
                    value={formData.id_proyecto}
                    onChange={(e) => setFormData({ ...formData, id_proyecto: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Sin proyecto</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.nombre || p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipología <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <select
                    value={formData.id_tipologia}
                    onChange={(e) => setFormData({ ...formData, id_tipologia: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Sin tipología</option>
                    {tipologias.map(t => (
                      <option key={t.id} value={t.id.toString()}>{t.nombre || t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (uploading ? 'Subiendo archivo...' : 'Guardando...') : editingRecurso ? 'Actualizar' : 'Crear recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Eliminar recurso</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              ¿Estás seguro de eliminar <strong>"{deletingRecurso?.nombre}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreviewModal && previewRecurso && (() => {
        const previewTipo = getTipoByExtension(previewRecurso.url, previewRecurso.tipo_recurso_id);
        const previewTipoConfig = TIPO_RECURSO_ICONS[previewTipo];
        const previewProyecto = getProyectoNombre(previewRecurso.id_proyecto);
        const previewExt = getFileExtension(previewRecurso.url);
        const previewEsImagen = isImageUrl(previewRecurso.url, previewRecurso.tipo_recurso_id);
        const previewEsVideo = isVideoUrl(previewRecurso.url, previewRecurso.tipo_recurso_id);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col" style={{ height: '90vh' }} onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${previewTipoConfig.color} flex items-center justify-center flex-shrink-0`}>
                    <TipoIcon tipo={previewTipo} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">{previewRecurso.nombre}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 uppercase font-medium">{previewExt ? `.${previewExt}` : getTipoRecursoNombre(previewRecurso.tipo_recurso_id)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-xs text-gray-500">{getTipoRecursoNombre(previewRecurso.tipo_recurso_id)}</span>
                      {previewProyecto && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-xs text-gray-500">{previewProyecto}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewRecurso.url);
                      toast.success('URL copiada al portapapeles');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  <a
                    href={previewRecurso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Abrir en nueva pestana"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href={previewRecurso.url}
                    download
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cerrar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
                {/* Preview */}
                <div className="flex-1 min-w-0 min-h-0 bg-gray-950 relative">
                  {/* Checker pattern for transparent images */}
                  {previewEsImagen && (
                    <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
                    {previewEsImagen ? (
                      <img
                        src={previewRecurso.url}
                        alt={previewRecurso.nombre}
                        className="max-w-full max-h-full object-contain relative z-10"
                      />
                    ) : previewEsVideo ? (
                      <video
                        src={previewRecurso.url}
                        controls
                        className="max-w-full max-h-full"
                      />
                    ) : getFileExtension(previewRecurso.url) === 'pdf' ? (
                      <iframe
                        src={previewRecurso.url}
                        className="w-full h-full"
                        title={previewRecurso.nombre}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className={`w-20 h-20 rounded-2xl ${previewTipoConfig.color} flex items-center justify-center mb-6`}>
                          <TipoIcon tipo={previewTipo} className="w-10 h-10" />
                        </div>
                        <p className="text-white/90 text-lg font-medium mb-1">Vista previa no disponible</p>
                        <p className="text-white/40 text-sm mb-6">Este tipo de archivo no se puede previsualizar directamente</p>
                        <div className="flex items-center gap-3">
                          <a
                            href={previewRecurso.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Abrir archivo
                          </a>
                          <a
                            href={previewRecurso.url}
                            download
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-sm border border-white/10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar info */}
                <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 flex-shrink-0 overflow-y-auto">
                  <div className="p-5 space-y-5">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Detalles</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-xs text-gray-500 mb-0.5">Nombre</dt>
                          <dd className="text-sm font-medium text-gray-900 break-words">{previewRecurso.nombre}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 mb-0.5">Tipo de recurso</dt>
                          <dd>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${previewTipoConfig.color}`}>
                              <TipoIcon tipo={previewTipo} className="w-3.5 h-3.5" />
                              {getTipoRecursoNombre(previewRecurso.tipo_recurso_id)}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 mb-0.5">Formato</dt>
                          <dd className="text-sm text-gray-700 uppercase">{previewExt ? `.${previewExt}` : '—'}</dd>
                        </div>
                        {previewProyecto && (
                          <div>
                            <dt className="text-xs text-gray-500 mb-0.5">Proyecto</dt>
                            <dd className="text-sm text-gray-700">{previewProyecto}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <hr className="border-gray-200" />

                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">URL del recurso</h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <p className="text-xs text-gray-500 break-all leading-relaxed">{previewRecurso.url}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(previewRecurso.url);
                          toast.success('URL copiada al portapapeles');
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copiar URL
                      </button>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setShowPreviewModal(false); openEditModal(previewRecurso); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar recurso
                      </button>
                      <button
                        onClick={() => { setShowPreviewModal(false); openDeleteModal(previewRecurso); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar recurso
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
