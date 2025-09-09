'use client';

import { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/lib/routes';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MainNav() {
  const { user, isAdmin, isDoctor, isPatient, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR or initial render
  if (!isClient) {
    return null;
  }

  const navigation = [
    { name: 'Inicio', href: PUBLIC_ROUTES.HOME, current: pathname === PUBLIC_ROUTES.HOME },
    ...(user && isAdmin ? [
      { name: 'Administración', href: '/admin/dashboard', current: pathname?.startsWith('/admin') },
    ] : []),
    ...(user && isDoctor ? [
      { name: 'Mi Agenda', href: '/doctor/appointments', current: pathname?.startsWith('/doctor/appointments') },
      { name: 'Pacientes', href: '/doctor/patients', current: pathname?.startsWith('/doctor/patients') },
    ] : []),
    ...(user && isPatient ? [
      { name: 'Buscar Médicos', href: '/patient/doctors', current: pathname?.startsWith('/patient/doctors') },
      { name: 'Mis Citas', href: '/patient/appointments', current: pathname?.startsWith('/patient/appointments') },
    ] : []),
    ...(user && isPatient ? [] : [
      { name: 'Médicos', href: '/doctors', current: pathname === '/doctors' },
    ]),
    { name: 'Contacto', href: '/contact', current: pathname === '/contact' },
  ];

  const userNavigation = [
    ...(user && isAdmin ? [
      { name: 'Panel de Administración', href: '/admin/dashboard' },
    ] : []),
    ...(user && isDoctor ? [
      { name: 'Perfil', href: '/doctor/profile' },
      { name: 'Configuración', href: '/settings' },
    ] : []),
    ...(user && isPatient ? [
      { name: 'Mi Perfil', href: '/patient/profile' },
      { name: 'Configuración', href: '/settings' },
    ] : []),
    { name: 'Cerrar sesión', href: '#', onClick: signOut },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/">
                    <span className="text-xl font-bold text-blue-600">Platform Médicos</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="sr-only">Abrir menú de usuario</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                onClick={(e) => {
                                  if (item.onClick) {
                                    e.preventDefault();
                                    item.onClick();
                                  }
                                }}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Abrir menú principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-l-4 border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                    'block py-2 pl-3 pr-4 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.email}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {isAdmin ? 'Administrador' : isDoctor ? 'Médico' : 'Paciente'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <Link
                    href="/login"
                    className="block w-full text-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
