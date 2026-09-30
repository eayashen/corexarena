"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Eye,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Mail,
  User,
  KeyRound,
  X,
  RefreshCw,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/utils/date";

interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "viewadmin" | "admin";
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminAccountsManagementProps {
  currentAdminEmail?: string;
  adminRole?: string;
}

export const AdminAccountsManagement: React.FC<AdminAccountsManagementProps> = ({
  currentAdminEmail = "",
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"superadmin" | "viewadmin">("viewadmin");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"superadmin" | "viewadmin">("viewadmin");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load admin accounts.");
      }
      setAdmins(data.admins || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load admin accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create admin account.");
      }

      setSuccessMsg(`Admin account "${createName}" (${createRole}) created successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("viewadmin");
      fetchAdmins();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create admin account.");
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditRole(admin.role === "superadmin" ? "superadmin" : "viewadmin");
    setEditPassword("");
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin || isReadOnly) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const payload: any = {
        name: editName.trim(),
        role: editRole,
      };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      const res = await fetch(`/api/admin/accounts/${editingAdmin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update admin account.");
      }

      setSuccessMsg(`Admin account "${editingAdmin.email}" updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setEditError(err.message || "Failed to update admin account.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminAccount) => {
    if (isReadOnly) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the admin account "${admin.name}" (${admin.email})?`
    );
    if (!confirmDelete) return;

    setDeletingId(admin._id);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/accounts/${admin._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete admin account.");
      }

      setSuccessMsg(`Admin account "${admin.email}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete admin account.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-stadium-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pitch-400" />
            Administrator Account Management
          </h3>
          <p className="text-xs text-stadium-400 mt-1">
            Configure system access roles: <strong className="text-pitch-300">superadmin</strong> (full write control) and <strong className="text-cyan-300">viewadmin</strong> (read-only monitoring).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="p-2.5 rounded-xl bg-stadium-850 hover:bg-stadium-800 border border-stadium-750 text-stadium-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-black text-xs shadow-glow flex items-center gap-1.5 transition-all"
              id="btn-add-admin-account"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Administrator</span>
            </button>
          )}
        </div>
      </div>

      {/* View-Only Mode Banner */}
      {isReadOnly && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>View-Only Mode:</strong> You are logged in as a <strong>viewadmin</strong>. You can view all existing administrators and their assigned roles, but only a <strong>superadmin</strong> can create, edit, or delete admin accounts.
          </span>
        </div>
      )}

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admins Table / Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stadium-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-pitch-400 mx-auto" />
          <p>Loading administrator accounts...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="py-16 text-center rounded-2xl glass-card border border-stadium-750 text-stadium-400 space-y-2">
          <Users className="w-8 h-8 mx-auto text-stadium-500" />
          <p className="text-sm font-semibold">No administrator accounts found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass-card border border-stadium-750 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stadium-850/90 text-stadium-400 font-bold uppercase tracking-wider border-b border-stadium-750">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Last Login</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Created</th>
                {!isReadOnly && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stadium-800/80">
              {admins.map((acc) => {
                const isSuper = acc.role === "superadmin" || acc.role === "admin";
                const isCurrent = acc.email.toLowerCase() === currentAdminEmail.toLowerCase();

                return (
                  <tr
                    key={acc._id}
                    className="hover:bg-stadium-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            isSuper
                              ? "bg-pitch-500/20 text-pitch-300 border border-pitch-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}
                        >
                          {acc.name ? acc.name.slice(0, 2).toUpperCase() : "AD"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {acc.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pitch-500/20 text-pitch-300 border border-pitch-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stadium-400 font-mono">
                            ID: {acc._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stadium-200">
                      {acc.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          SUPERADMIN (Full Control)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          VIEWADMIN (Read Only)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-stadium-300 hidden md:table-cell">
                      {acc.lastLogin ? (
                        new Date(acc.lastLogin).toLocaleString("en-US", {
                          timeZone: "Asia/Dhaka",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-stadium-500 italic">Never</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-stadium-400 hidden lg:table-cell">
                      {formatDisplayDate(acc.createdAt.slice(0, 10))}
                    </td>

                    {!isReadOnly && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(acc)}
                          className="px-2.5 py-1 rounded-lg bg-stadium-800 hover:bg-stadium-750 text-stadium-200 text-xs font-semibold border border-stadium-700 inline-flex items-center gap-1 transition-colors"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-3 h-3 text-pitch-400" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          disabled={isCurrent || deletingId === acc._id}
                          onClick={() => handleDeleteAdmin(acc)}
                          className="px-2.5 py-1 rounded-lg bg-stadium-800 hover:bg-red-950/50 text-stadium-300 hover:text-red-300 text-xs font-semibold border border-stadium-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
                          title={
                            isCurrent
                              ? "Cannot delete your own account"
                              : "Delete Admin"
                          }
                        >
                          {deletingId === acc._id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-3 h-3 text-red-400" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Add New Admin */}
      {showCreateModal && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-stadium-900 border border-stadium-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-pitch-400" />
                Add New Administrator
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stadium-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stadium-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white placeholder-stadium-500 focus:outline-none focus:border-pitch-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Email Address (Login ID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stadium-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="e.g. manager@corexarena.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white placeholder-stadium-500 focus:outline-none focus:border-pitch-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Assigned Role & Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateRole("viewadmin")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      createRole === "viewadmin"
                        ? "bg-cyan-950/40 border-cyan-400 text-white shadow-glow"
                        : "bg-stadium-850 border-stadium-750 text-stadium-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Viewadmin</span>
                    </div>
                    <p className="text-[10px] text-stadium-400 mt-1">
                      Read-only access to bookings, slots, and revenue. Cannot modify data.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole("superadmin")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      createRole === "superadmin"
                        ? "bg-emerald-950/40 border-emerald-400 text-white shadow-glow"
                        : "bg-stadium-850 border-stadium-750 text-stadium-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Superadmin</span>
                    </div>
                    <p className="text-[10px] text-stadium-400 mt-1">
                      Full control: create, edit, approve, reschedule, slots, settings, and accounts.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stadium-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white placeholder-stadium-500 focus:outline-none focus:border-pitch-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stadium-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-stadium-800 text-stadium-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-bold flex items-center gap-1.5"
                >
                  {createLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Admin */}
      {editingAdmin && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-stadium-900 border border-stadium-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-pitch-400" />
                Edit Administrator: {editingAdmin.email}
              </h3>
              <button
                onClick={() => setEditingAdmin(null)}
                className="text-stadium-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
                />
              </div>

              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Role & Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole("viewadmin")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === "viewadmin"
                        ? "bg-cyan-950/40 border-cyan-400 text-white shadow-glow"
                        : "bg-stadium-850 border-stadium-750 text-stadium-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Viewadmin</span>
                    </div>
                    <p className="text-[10px] text-stadium-400 mt-1">Read-only</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole("superadmin")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === "superadmin"
                        ? "bg-emerald-950/40 border-emerald-400 text-white shadow-glow"
                        : "bg-stadium-850 border-stadium-750 text-stadium-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Superadmin</span>
                    </div>
                    <p className="text-[10px] text-stadium-400 mt-1">Full control</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stadium-300 font-semibold mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New password (optional)"
                  className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white placeholder-stadium-500 focus:outline-none focus:border-pitch-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stadium-800">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-stadium-800 text-stadium-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-bold flex items-center gap-1.5"
                >
                  {editLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
