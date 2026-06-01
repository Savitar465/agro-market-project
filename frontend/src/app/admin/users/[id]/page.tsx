"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { ALL_ROLES, roleLabel } from "@/lib/roles";
import type { Role } from "@/lib/services/auth-http";
import {
  getUser,
  type ManagedUser,
  reactivateUser,
  suspendUser,
  updateUser,
} from "@/lib/services/users-http";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user: currentUser } = useAuth();
  const isSelf = currentUser?.id === id;

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const applyUser = useCallback((u: ManagedUser) => {
    setUser(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setRoles(u.roles);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const u = await getUser(id);
        if (active) applyUser(u);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Usuario no encontrado",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, applyUser]);

  const toggleRole = (role: Role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (roles.length === 0) {
      setError("Selecciona al menos un tipo de usuario.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateUser(id, { name, username, email, roles });
      applyUser(updated);
      setNotice("Cambios guardados.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    setIsToggling(true);
    setError(null);
    setNotice(null);
    try {
      const updated = user.isActive
        ? await suspendUser(id)
        : await reactivateUser(id);
      applyUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-8">Loading...</div>;
  }

  if (error && !user) {
    return <div className="px-4 py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Editar usuario</h1>
        {user ? (
          <span
            className={
              user.isActive
                ? "inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
                : "inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
            }
          >
            {user.isActive ? "Activo" : "Suspendido"}
          </span>
        ) : null}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre completo
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Usuario
          </label>
          <input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">
            Tipo de usuario
          </legend>
          <div className="mt-2 space-y-2">
            {ALL_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {roleLabel(role)}
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="text-sm text-green-600">{notice}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Volver
          </Link>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          disabled={isToggling || isSelf}
          onClick={handleToggleActive}
          className="w-full rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
          title={isSelf ? "No puedes cambiar tu propio estado" : undefined}
        >
          {user?.isActive ? "Suspender usuario" : "Reactivar usuario"}
        </button>
      </div>
    </div>
  );
}
