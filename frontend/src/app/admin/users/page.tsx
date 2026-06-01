"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { rolesLabel } from "@/lib/roles";
import {
  deleteUser,
  listUsers,
  type ManagedUser,
  reactivateUser,
  suspendUser,
} from "@/lib/services/users-http";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleActive = async (target: ManagedUser) => {
    setBusyId(target.id);
    try {
      const updated = target.isActive
        ? await suspendUser(target.id)
        : await reactivateUser(target.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update user");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (target: ManagedUser) => {
    if (!confirm(`Delete user "${target.username}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(target.id);
    try {
      await deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete user");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="px-4 py-8 sm:px-6 lg:px-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-red-600 sm:px-6 lg:px-8">{error}</div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Crear, editar, asociar tipo de usuario y suspender o reactivar
            cuentas.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/users/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Crear usuario
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Usuario
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">
                            {u.name}
                          </div>
                          <div className="text-gray-500">
                            @{u.username} · {u.email}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {rolesLabel(u.roles)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {u.isActive ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                              Suspendido
                            </span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="mr-4 text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === u.id || isSelf}
                            onClick={() => handleToggleActive(u)}
                            className="mr-4 text-amber-600 hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isSelf
                                ? "No puedes cambiar tu propio estado"
                                : undefined
                            }
                          >
                            {u.isActive ? "Suspender" : "Reactivar"}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === u.id || isSelf}
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isSelf
                                ? "No puedes eliminar tu propia cuenta"
                                : undefined
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-sm text-gray-500"
                      >
                        No hay usuarios todavía.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
