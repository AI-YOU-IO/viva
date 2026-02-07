'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Cargar conteo de mensajes no leidos
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.get('/crm/contactos/unread/count');
        setUnreadCount(response.data?.data?.unreadCount || 0);
      } catch (error) {
        console.error('Error al cargar conteo de no leidos:', error);
      }
    };

    if (session?.accessToken) {
      fetchUnreadCount();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.accessToken]);

  // Expandir automaticamente el menu si estamos en una subruta
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some((sub) => pathname.startsWith(sub.path));
        if (isInSubmenu) {
          setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Menú para Super Admin (id_rol=1 y id_empresa=0)
  const superAdminMenuItems = [
    {
      name: 'Administración',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/administracion',
      badge: null,
    },
  ];

  // Menú normal para usuarios de empresa
  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/dashboard',
      badge: null,
    },
    {
      name: 'Conversaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      path: '/conversaciones',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: 'Leads',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/leads',
      badge: null,
    },
    {
      name: 'Reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/reportes',
      badge: null,
    },
    {
      name: 'Campañas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      path: '/campanias',
      badge: null,
    },
    {
      name: 'Proyectos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/proyectos',
      badge: null,
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      path: '/whatsapp/dashboard',
      badge: null,
      submenu: [
        { name: 'Dashboard', path: '/whatsapp/dashboard' },
        { name: 'Plantillas', path: '/whatsapp/plantillas' },
        { name: 'Campañas', path: '/whatsapp/campanas' },
        { name: 'Sesiones', path: '/whatsapp/sesiones' },
      ],
    },
    {
      name: 'Recursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: '/recursos',
      badge: null,
    },
    {
      name: 'Configuración',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/configuracion',
      badge: null,
    },
  ];

  // Verificar si es Super Admin (id_rol=1 y id_empresa=0)
  const isSuperAdmin = session?.user?.id_rol === 1 && (session?.user?.id_empresa === 0 || session?.user?.id_empresa === '0' || !session?.user?.id_empresa);

  // Filtrar menu items basado en los módulos del usuario
  const filteredMenuItems = useMemo(() => {
    if (!session?.user) return menuItems;

    // Si es Super Admin (id_rol=1 y id_empresa=0), solo mostrar Administración
    if (isSuperAdmin) {
      return superAdminMenuItems;
    }

    // Si es administrador de empresa (rol 1 con id_empresa > 0), mostrar todo
    if (session.user.id_rol === 1) {
      return menuItems;
    }

    // Para otros roles, filtrar por módulos permitidos
    const userModulos = session.user.modulos || [];
    const allowedRoutes = userModulos.map(m => m.ruta);

    return menuItems.filter(item => allowedRoutes.includes(item.path));
  }, [session?.user, isSuperAdmin]);

  return (
    <aside
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)' }}
    >
      {/* Logo y Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50" style={{ background: 'linear-gradient(135deg, rgb(17, 19, 26), rgb(27, 30, 39))' }}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">AI-YOU</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Botón expandir cuando está colapsado */}
      {isCollapsed && (
        <div className="flex justify-center py-3 border-b border-indigo-700/50">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Menu Items */}
      <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.path || (item.submenu && item.submenu.some((sub) => pathname === sub.path));
          const isExpanded = expandedMenus[item.name];
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          return (
            <div key={item.path}>
              {hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/20 text-white font-medium shadow-lg backdrop-blur-sm'
                        : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                      <span className={isActive ? 'text-cyan-300' : 'text-indigo-300'}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {!isCollapsed && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l border-indigo-500/30 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
                            className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                              isSubActive
                                ? 'bg-white/15 text-white font-medium'
                                : 'text-indigo-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/20 text-white font-medium shadow-lg backdrop-blur-sm'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                    <span className={isActive ? 'text-cyan-300' : 'text-indigo-300'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500 text-white rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold bg-cyan-500 text-white rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
