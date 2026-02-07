'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';

// Configuración de colores del degradado del perfil
const GRADIENT_CONFIG = {
  // Opciones predefinidas de degradados
  presets: {
    purple: {
      name: 'Púrpura',
      header: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
      avatar: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
      badge: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    blue: {
      name: 'Azul',
      header: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
      avatar: 'linear-gradient(135deg, #0093E9 0%, #2563eb 50%, #3b82f6 100%)',
      badge: 'linear-gradient(135deg, #0093E9 0%, #2563eb 100%)',
    },
    green: {
      name: 'Verde',
      header: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      avatar: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      badge: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    },
    orange: {
      name: 'Naranja',
      header: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)',
      avatar: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
      badge: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    dark: {
      name: 'Oscuro',
      header: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      avatar: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
      badge: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    },
    sunset: {
      name: 'Atardecer',
      header: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      avatar: 'linear-gradient(135deg, #f472b6 0%, #fb923c 50%, #facc15 100%)',
      badge: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)',
    },
    ocean: {
      name: 'Océano',
      header: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
      avatar: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
      badge: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    },
    rose: {
      name: 'Rosa',
      header: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
      avatar: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%)',
      badge: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    },
  },
  // Color por defecto
  default: 'purple',
};

export default function PerfilPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(GRADIENT_CONFIG.default);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    rol_nombre: '',
    id_empresa: '',
    modulos: [],
  });
  const [stats, setStats] = useState({
    conversaciones: 0,
    leads: 0,
    mensajes: 0,
  });

  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('profile_theme');
    if (savedTheme && GRADIENT_CONFIG.presets[savedTheme]) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUserData({
        id: session.user.id || '',
        username: session.user.username || '',
        email: session.user.email || '',
        rol_nombre: session.user.rol_nombre || '',
        id_empresa: session.user.id_empresa || '',
        modulos: session.user.modulos || [],
      });
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const [convRes, leadsRes] = await Promise.allSettled([
        apiClient.get('/crm/conversaciones?limit=1'),
        apiClient.get('/crm/leads?limit=1'),
      ]);

      setStats({
        conversaciones: convRes.status === 'fulfilled' ? (convRes.value?.total || convRes.value?.data?.length || 0) : 0,
        leads: leadsRes.status === 'fulfilled' ? (leadsRes.value?.total || leadsRes.value?.data?.length || 0) : 0,
        mensajes: 0,
      });
    } catch (error) {
      console.log('No se pudieron cargar las estadísticas');
    }
  };

  const currentGradient = GRADIENT_CONFIG.presets[selectedTheme];

  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
    localStorage.setItem('profile_theme', themeKey);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      const userId = session?.user?.id;
      if (!userId) {
        setPasswordError('No se pudo identificar al usuario');
        return;
      }

      await apiClient.put(`/crm/usuarios/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.msg || 'Error al cambiar la contraseña');
    }
  };

  const openPasswordModal = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, text: 'Débil', color: 'bg-red-500' };
    if (strength <= 3) return { level: strength, text: 'Media', color: 'bg-yellow-500' };
    return { level: strength, text: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const tabs = [
    { id: 'info', label: 'Información', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'security', label: 'Seguridad', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
    { id: 'access', label: 'Accesos', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
  ];

  const quickActions = [
    { label: 'Ver Conversaciones', href: '/conversaciones', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ), color: 'from-blue-500 to-blue-600' },
    { label: 'Gestionar Leads', href: '/leads', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), color: 'from-emerald-500 to-emerald-600' },
    { label: 'Configuración', href: '/configuracion', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con Avatar grande - Full Width */}
      <div className="bg-white shadow-sm border-b border-gray-200 overflow-hidden">
        <div
          className="h-40 relative"
          style={{ background: currentGradient.header }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>

          {/* Botón para cambiar tema */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all group"
            title="Cambiar tema"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 -mt-16">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold text-white shadow-xl border-4 border-white"
                style={{ background: currentGradient.avatar }}
              >
                {userData.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Info básica */}
            <div className="flex-1 lg:pb-2">
              <h1 className="text-3xl font-bold text-gray-900">@{userData.username || 'Usuario'}</h1>
              <p className="text-gray-500 text-lg">{userData.email || 'Sin correo registrado'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
                  style={{ background: currentGradient.badge }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {userData.rol_nombre || 'Sin rol'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Empresa #{userData.id_empresa || '—'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  En línea
                </span>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="flex gap-4 lg:pb-2">
              <div className="text-center px-6 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 min-w-[120px]">
                <p className="text-3xl font-bold text-blue-600">{stats.conversaciones}</p>
                <p className="text-sm text-blue-600/70">Conversaciones</p>
              </div>
              <div className="text-center px-6 py-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 min-w-[120px]">
                <p className="text-3xl font-bold text-emerald-600">{stats.leads}</p>
                <p className="text-sm text-emerald-600/70">Leads</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Acciones rápidas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acciones rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                    <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Estado de la cuenta */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Estado de la cuenta
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Activo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verificación</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sesión</span>
                  <span className="text-xs text-gray-500">Activa ahora</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tema</span>
                  <button
                    onClick={() => setShowThemeModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: currentGradient.badge }}
                    ></div>
                    {currentGradient.name}
                  </button>
                </div>
              </div>
            </div>

            {/* Personalización */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Personalización
              </h3>
              <button
                onClick={() => setShowThemeModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all group border border-gray-200"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: currentGradient.badge }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-700">Cambiar tema</p>
                  <p className="text-xs text-gray-500">Personaliza los colores de tu perfil</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Columna derecha - Tabs con contenido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Tab: Información */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Datos de la cuenta
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Usuario</p>
                            <p className="font-medium text-gray-900 truncate">@{userData.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Correo</p>
                            <p className="font-medium text-gray-900 truncate">{userData.email || 'No registrado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">ID Empresa</p>
                            <p className="font-medium text-gray-900">{userData.id_empresa || 'No asignado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Rol</p>
                            <p className="font-medium text-gray-900">{userData.rol_nombre || 'Sin rol'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actividad reciente */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Actividad reciente
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Inicio de sesión exitoso</p>
                            <p className="text-xs text-gray-500">Sesión actual activa</p>
                          </div>
                          <span className="text-xs text-gray-400">Ahora</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Seguridad */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Seguridad de la cuenta
                      </h3>

                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Contraseña</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Mantén tu cuenta segura actualizando tu contraseña regularmente.
                            </p>
                            <button
                              onClick={openPasswordModal}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Cambiar contraseña
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-amber-800">Recomendaciones de seguridad</h4>
                            <ul className="mt-2 text-sm text-amber-700 space-y-1">
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                Usa al menos 8 caracteres
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                Incluye mayúsculas y minúsculas
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                Añade números y símbolos especiales
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Sesiones activas */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Sesión actual
                        </h4>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Este dispositivo</p>
                            <p className="text-xs text-gray-500">Navegador web • Activa ahora</p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Activa
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Accesos */}
                {activeTab === 'access' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Módulos habilitados
                      </h3>

                      {userData.modulos && userData.modulos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userData.modulos.map((modulo, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                            >
                              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{modulo.nombre || modulo}</p>
                                <p className="text-xs text-green-600">Acceso habilitado</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">No hay módulos asignados</p>
                          <p className="text-sm text-gray-400 mt-1">Contacta al administrador para obtener accesos</p>
                        </div>
                      )}
                    </div>

                    {/* Permisos del rol */}
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Tu rol: {userData.rol_nombre || 'Sin rol'}
                      </h4>
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-sm text-indigo-700">
                          Los permisos y accesos están determinados por tu rol asignado. Si necesitas permisos adicionales, contacta al administrador del sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Selector de Tema */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div
              className="p-6 text-white"
              style={{ background: currentGradient.header }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Personalizar tema</h2>
                    <p className="text-white/70 text-sm">Elige los colores de tu perfil</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(GRADIENT_CONFIG.presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      selectedTheme === key
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-2"
                      style={{ background: preset.header }}
                    ></div>
                    <p className="text-xs font-medium text-gray-700">{preset.name}</p>
                    {selectedTheme === key && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
                >
                  Aplicar tema
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div
              className="p-6 text-white"
              style={{ background: currentGradient.header }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
                  <p className="text-white/70 text-sm">Actualiza tu contraseña de acceso</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.level <= 2 ? 'text-red-600' :
                          passwordStrength.level <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Repite la nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-green-600">Las contraseñas coinciden</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-xs text-red-600">Las contraseñas no coinciden</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
