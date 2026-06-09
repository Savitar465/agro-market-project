"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { rolesLabel } from "@/lib/roles";
import { getCurrentUser, type ManagedUser } from "@/lib/services/users-http";

type QuickLink = { href: string; label: string; description: string };

const CONSUMER_LINKS: QuickLink[] = [
  {
    href: "/store",
    label: "Explorar tienda",
    description: "Descubre productos de productores locales.",
  },
  {
    href: "/cart",
    label: "Mi carrito",
    description: "Revisa los productos que vas a comprar.",
  },
  {
    href: "/orders",
    label: "Mis pedidos",
    description: "Consulta el historial y estado de tus compras.",
  },
];

const PRODUCER_LINKS: QuickLink[] = [
  {
    href: "/inventory",
    label: "Mi inventario",
    description: "Gestiona el stock de tus productos.",
  },
  {
    href: "/sell",
    label: "Publicar producto",
    description: "Agrega un nuevo producto a la venta.",
  },
  {
    href: "/orders/sales",
    label: "Pedidos recibidos",
    description: "Gestiona y actualiza el estado de tus ventas.",
  },
  {
    href: "/sellers/create",
    label: "Mi perfil de vendedor",
    description: "Configura tus datos como productor.",
  },
];

const ADMIN_LINKS: QuickLink[] = [
  {
    href: "/admin/users",
    label: "Gestión de usuarios",
    description: "Crear, editar, suspender y asociar tipos de usuario.",
  },
  {
    href: "/inventory",
    label: "Inventario",
    description: "Supervisa los productos de la plataforma.",
  },
  {
    href: "/orders/sales",
    label: "Pedidos",
    description: "Supervisa y actualiza el estado de todos los pedidos.",
  },
];

function LinkCards({ title, links }: { title: string; links: QuickLink[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-gray-200 p-4 transition hover:border-indigo-400 hover:shadow-sm"
          >
            <p className="font-medium text-indigo-600">{link.label}</p>
            <p className="mt-1 text-sm text-gray-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { user: authUser, isAdmin, isSeller } = useAuth();
  // A consumer is any non-seller, non-admin (the default "user" role).
  const isConsumer = !isAdmin && !isSeller;

  const [profile, setProfile] = useState<ManagedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (active) setProfile(me);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar el perfil",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fall back to the cached auth user while /users/me loads.
  const display = profile ?? authUser;

  const heading = isAdmin
    ? "Perfil de administrador"
    : isSeller
      ? "Perfil de productor"
      : "Perfil de consumidor";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 rounded-lg border border-gray-200 p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {display?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Usuario</dt>
            <dd className="mt-1 text-sm text-gray-900">
              @{display?.username ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {display?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tipo de usuario
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rolesLabel(display?.roles ?? [])}
            </dd>
          </div>
          {profile ? (
            <div>
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1 text-sm">
                {profile.isActive ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                    Suspendido
                  </span>
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {isAdmin ? (
        <LinkCards title="Administración" links={ADMIN_LINKS} />
      ) : null}
      {isSeller ? (
        <LinkCards title="Herramientas de productor" links={PRODUCER_LINKS} />
      ) : null}
      {isConsumer ? (
        <LinkCards title="Tu actividad de compra" links={CONSUMER_LINKS} />
      ) : null}
    </div>
  );
}
