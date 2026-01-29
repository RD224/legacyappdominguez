"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, API_BASE_URL, login as apiLogin, logout as apiLogout } from "@/lib/api";

const TABS = [
  { key: "tasks", label: "Tareas" },
  { key: "projects", label: "Proyectos" },
  { key: "comments", label: "Comentarios" },
  { key: "history", label: "Historial" },
  { key: "notifications", label: "Notificaciones" },
  { key: "search", label: "Búsqueda" },
  { key: "reports", label: "Reportes" },
];

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-500"
        : "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("tasks");
  const [error, setError] = useState("");

  // Shared data
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "Pendiente",
    priority: "Media",
    projectId: "0",
    assignedToId: "0",
    dueDate: "",
    estimatedHours: "",
  });

  // Comments
  const [commentTaskId, setCommentTaskId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // History
  const [historyTaskId, setHistoryTaskId] = useState("");
  const [history, setHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Search
  const [search, setSearch] = useState({
    text: "",
    status: "",
    priority: "",
    projectId: "0",
  });
  const [searchResults, setSearchResults] = useState([]);

  // Reports
  const [reportText, setReportText] = useState("");

  async function refreshLookups() {
    const [u, p] = await Promise.all([apiFetch("/api/users"), apiFetch("/api/projects")]);
    setUsers(u);
    setProjects(p);
  }

  async function refreshTasks() {
    const t = await apiFetch("/api/tasks");
    setTasks(t);
  }

  useEffect(() => {
    if (!user) return;
    refreshLookups().catch((e) => setError(e.message));
    refreshTasks().catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    if (!selectedTask) return;
    setTaskForm({
      title: selectedTask.title || "",
      description: selectedTask.description || "",
      status: selectedTask.status || "Pendiente",
      priority: selectedTask.priority || "Media",
      projectId: selectedTask.project ? selectedTask.project.id : "0",
      assignedToId: selectedTask.assignedTo ? selectedTask.assignedTo.id : "0",
      dueDate: selectedTask.dueDate || "",
      estimatedHours: String(selectedTask.estimatedHours ?? ""),
    });
  }, [selectedTask]);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");
    try {
      const u = await apiLogin(username, password);
      setUser(u);
    } catch (err) {
      setError(err.message);
    }
  }

  function onLogout() {
    apiLogout();
    setUser(null);
    setTab("tasks");
    setSelectedTaskId(null);
    setTasks([]);
    setProjects([]);
    setUsers([]);
  }

  async function addTask() {
    setError("");
    try {
      await apiFetch("/api/tasks", {
        method: "POST",
        body: {
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          priority: taskForm.priority,
          projectId: taskForm.projectId,
          assignedToId: taskForm.assignedToId,
          dueDate: taskForm.dueDate,
          estimatedHours: taskForm.estimatedHours,
        },
      });
      await refreshTasks();
      setSelectedTaskId(null);
      setTaskForm({
        title: "",
        description: "",
        status: "Pendiente",
        priority: "Media",
        projectId: "0",
        assignedToId: "0",
        dueDate: "",
        estimatedHours: "",
      });
    } catch (e) {
      setError(e.message);
    }
  }

  async function updateTask() {
    if (!selectedTaskId) return setError("Selecciona una tarea");
    setError("");
    try {
      await apiFetch(`/api/tasks/${selectedTaskId}`, {
        method: "PUT",
        body: {
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          priority: taskForm.priority,
          projectId: taskForm.projectId,
          assignedToId: taskForm.assignedToId,
          dueDate: taskForm.dueDate,
          estimatedHours: taskForm.estimatedHours,
        },
      });
      await refreshTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTask() {
    if (!selectedTaskId) return setError("Selecciona una tarea");
    if (!confirm("¿Eliminar la tarea seleccionada?")) return;
    setError("");
    try {
      await apiFetch(`/api/tasks/${selectedTaskId}`, { method: "DELETE" });
      setSelectedTaskId(null);
      await refreshTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function addProject() {
    const name = prompt("Nombre del proyecto:");
    if (!name) return;
    const description = prompt("Descripción (opcional):") || "";
    setError("");
    try {
      await apiFetch("/api/projects", { method: "POST", body: { name, description } });
      await refreshLookups();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteProject(projectId) {
    if (!confirm("¿Eliminar proyecto?")) return;
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}`, { method: "DELETE" });
      await refreshLookups();
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadComments() {
    setError("");
    setComments([]);
    try {
      const task = tasks.find((t) => String(t.taskNo) === String(commentTaskId));
      if (!task) return setError("No existe esa tarea (usa el número ID visible en la tabla)");
      const data = await apiFetch(`/api/tasks/${task.id}/comments`);
      setComments(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function addComment() {
    setError("");
    try {
      const task = tasks.find((t) => String(t.taskNo) === String(commentTaskId));
      if (!task) return setError("No existe esa tarea (usa el número ID visible en la tabla)");
      await apiFetch(`/api/tasks/${task.id}/comments`, { method: "POST", body: { commentText } });
      setCommentText("");
      await loadComments();
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadHistory() {
    setError("");
    setHistory([]);
    try {
      const task = tasks.find((t) => String(t.taskNo) === String(historyTaskId));
      if (!task) return setError("No existe esa tarea (usa el número ID visible en la tabla)");
      const data = await apiFetch(`/api/tasks/${task.id}/history`);
      setHistory(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadAllHistory() {
    setError("");
    setAllHistory([]);
    try {
      const data = await apiFetch(`/api/history?limit=100`);
      setAllHistory(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadNotifications() {
    setError("");
    setNotifications([]);
    try {
      const data = await apiFetch(`/api/notifications?unread=true`);
      setNotifications(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function markNotificationsRead() {
    setError("");
    try {
      await apiFetch(`/api/notifications/mark-read`, { method: "POST", body: {} });
      await loadNotifications();
    } catch (e) {
      setError(e.message);
    }
  }

  async function runSearch() {
    setError("");
    setSearchResults([]);
    try {
      const qs = new URLSearchParams();
      if (search.text) qs.set("searchText", search.text);
      if (search.status) qs.set("status", search.status);
      if (search.priority) qs.set("priority", search.priority);
      if (search.projectId) qs.set("projectId", search.projectId);
      const data = await apiFetch(`/api/tasks?${qs.toString()}`);
      setSearchResults(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function generateReport(type) {
    setError("");
    setReportText("");
    try {
      if (type === "tasks") {
        const data = await apiFetch("/api/reports/tasks");
        let text = "=== REPORTE: TASKS ===\n\n";
        Object.entries(data.statusCount || {}).forEach(([k, v]) => {
          text += `${k}: ${v} tareas\n`;
        });
        setReportText(text);
      } else if (type === "projects") {
        const data = await apiFetch("/api/reports/projects");
        let text = "=== REPORTE: PROJECTS ===\n\n";
        (data.projects || []).forEach((p) => {
          text += `${p.name}: ${p.taskCount} tareas\n`;
        });
        setReportText(text);
      } else if (type === "users") {
        const data = await apiFetch("/api/reports/users");
        let text = "=== REPORTE: USERS ===\n\n";
        (data.users || []).forEach((u) => {
          text += `${u.username}: ${u.assignedTaskCount} tareas asignadas\n`;
        });
        setReportText(text);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let pending = 0;
    let highPriority = 0;
    let overdue = 0;
    const now = new Date();
    for (const t of tasks) {
      if (t.status === "Completada") completed++;
      else pending++;
      if (t.priority === "Alta" || t.priority === "Crítica") highPriority++;
      if (t.dueDate && t.status !== "Completada") {
        const due = new Date(t.dueDate);
        if (!Number.isNaN(due.getTime()) && due < now) overdue++;
      }
    }
    return { total, completed, pending, highPriority, overdue };
  }, [tasks]);

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
          <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-zinc-900">Task Manager (Next + Express)</h1>
              <p className="text-sm text-zinc-600">API: {API_BASE_URL}</p>
            </div>
            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}
            <form onSubmit={onLogin} className="grid gap-3">
              <Field label="Usuario">
                <input
                  name="username"
                  defaultValue="admin"
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                />
              </Field>
              <Field label="Contraseña">
                <input
                  name="password"
                  type="password"
                  defaultValue="admin"
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                />
              </Field>
              <Button type="submit">Entrar</Button>
            </form>
            <p className="mt-4 text-xs text-zinc-500">
              Nota: crea tu conexión Mongo Atlas en el backend (`server/`) y ejecuta ambos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Task Manager</h1>
            <p className="text-sm text-zinc-600">
              Usuario: <span className="font-medium text-zinc-900">{user.username}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => refreshTasks()}>
              Refrescar
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              Salir
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  tab === t.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "tasks" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2">
              <h2 className="text-lg font-semibold text-zinc-900">Nueva / Editar Tarea</h2>
              <div className="mt-4 grid gap-3">
                <Field label="Título">
                  <input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((s) => ({ ...s, title: e.target.value }))}
                    className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </Field>
                <Field label="Descripción">
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((s) => ({ ...s, description: e.target.value }))}
                    rows={3}
                    className="rounded-md border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Estado">
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm((s) => ({ ...s, status: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    >
                      {["Pendiente", "En Progreso", "Completada", "Bloqueada", "Cancelada"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Prioridad">
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm((s) => ({ ...s, priority: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    >
                      {["Baja", "Media", "Alta", "Crítica"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Proyecto">
                    <select
                      value={taskForm.projectId}
                      onChange={(e) => setTaskForm((s) => ({ ...s, projectId: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    >
                      <option value="0">Sin proyecto</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Asignado a">
                    <select
                      value={taskForm.assignedToId}
                      onChange={(e) => setTaskForm((s) => ({ ...s, assignedToId: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    >
                      <option value="0">Sin asignar</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Fecha vencimiento (YYYY-MM-DD)">
                    <input
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm((s) => ({ ...s, dueDate: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    />
                  </Field>
                  <Field label="Horas estimadas">
                    <input
                      type="number"
                      step="0.5"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm((s) => ({ ...s, estimatedHours: e.target.value }))}
                      className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                    />
                  </Field>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button onClick={addTask}>Agregar</Button>
                  <Button variant="secondary" onClick={updateTask} disabled={!selectedTaskId}>
                    Actualizar
                  </Button>
                  <Button variant="danger" onClick={deleteTask} disabled={!selectedTaskId}>
                    Eliminar
                  </Button>
                </div>
                <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700">
                  <strong>Estadísticas:</strong>{" "}
                  {`Total: ${stats.total} | Completadas: ${stats.completed} | Pendientes: ${stats.pending} | Alta Prioridad: ${stats.highPriority} | Vencidas: ${stats.overdue}`}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-3">
              <h2 className="text-lg font-semibold text-zinc-900">Lista de Tareas</h2>
              <div className="mt-3 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-zinc-600">
                    <tr className="[&>th]:px-3 [&>th]:py-2 border-b border-zinc-200">
                      <th>ID</th>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Proyecto</th>
                      <th>Asignado</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`cursor-pointer border-b border-zinc-100 [&>td]:px-3 [&>td]:py-2 hover:bg-zinc-50 ${
                          selectedTaskId === t.id ? "bg-zinc-100" : ""
                        }`}
                      >
                        <td className="font-mono">{t.taskNo}</td>
                        <td className="font-medium text-zinc-900">{t.title}</td>
                        <td>{t.status}</td>
                        <td>{t.priority}</td>
                        <td>{t.project ? t.project.name : "Sin proyecto"}</td>
                        <td>{t.assignedTo ? t.assignedTo.username : "Sin asignar"}</td>
                        <td>{t.dueDate || "Sin fecha"}</td>
                      </tr>
                    ))}
                    {tasks.length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-zinc-500" colSpan={7}>
                          No hay tareas todavía.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "projects" ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Proyectos</h2>
              <Button onClick={addProject}>Agregar</Button>
            </div>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr className="[&>th]:px-3 [&>th]:py-2 border-b border-zinc-200">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-100 [&>td]:px-3 [&>td]:py-2">
                      <td className="font-mono">{p.projectNo}</td>
                      <td className="font-medium text-zinc-900">{p.name}</td>
                      <td className="text-zinc-700">{p.description || ""}</td>
                      <td className="text-right">
                        <Button variant="danger" onClick={() => deleteProject(p.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-zinc-500" colSpan={4}>
                        No hay proyectos.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "comments" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-zinc-900">Comentarios de Tareas</h2>
              <div className="mt-4 grid gap-3">
                <Field label="ID Tarea (número visible en la tabla)">
                  <input
                    value={commentTaskId}
                    onChange={(e) => setCommentTaskId(e.target.value)}
                    className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </Field>
                <Field label="Comentario">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="rounded-md border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button onClick={addComment}>Agregar</Button>
                  <Button variant="secondary" onClick={loadComments}>
                    Cargar
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-base font-semibold text-zinc-900">Listado</h3>
              <div className="mt-3 grid gap-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-md border border-zinc-200 p-3">
                    <div className="text-xs text-zinc-500">
                      {new Date(c.createdAt).toLocaleString()} — {c.user ? c.user.username : "Usuario"}
                    </div>
                    <div className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap">{c.commentText}</div>
                  </div>
                ))}
                {comments.length === 0 ? <div className="text-sm text-zinc-500">Sin comentarios.</div> : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "history" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-zinc-900">Historial</h2>
              <div className="mt-4 grid gap-3">
                <Field label="ID Tarea (número visible en la tabla)">
                  <input
                    value={historyTaskId}
                    onChange={(e) => setHistoryTaskId(e.target.value)}
                    className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button onClick={loadHistory}>Cargar Historial</Button>
                  <Button variant="secondary" onClick={loadAllHistory}>
                    Cargar Todo
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500">
                “Cargar Todo” trae los últimos 100 eventos del sistema.
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-base font-semibold text-zinc-900">Eventos</h3>
              <div className="mt-3 grid gap-2">
                {(history.length ? history : allHistory).map((h) => (
                  <div key={h.id} className="rounded-md border border-zinc-200 p-3 text-sm">
                    <div className="text-xs text-zinc-500">
                      {new Date(h.timestamp).toLocaleString()} — {h.action} —{" "}
                      {h.user ? h.user.username : "Desconocido"}
                      {h.task ? ` — Tarea #${h.task.taskNo}` : ""}
                    </div>
                    <div className="mt-1 text-zinc-700">
                      <div>
                        <span className="font-medium">Antes:</span> {h.oldValue || "(vacío)"}
                      </div>
                      <div>
                        <span className="font-medium">Después:</span> {h.newValue || "(vacío)"}
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && allHistory.length === 0 ? (
                  <div className="text-sm text-zinc-500">Sin historial.</div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "notifications" ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900">Notificaciones</h2>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={loadNotifications}>
                  Cargar
                </Button>
                <Button onClick={markNotificationsRead}>Marcar como leídas</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-md border border-zinc-200 p-3 text-sm">
                  <div className="text-xs text-zinc-500">
                    [{n.type}] {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-zinc-900">{n.message}</div>
                </div>
              ))}
              {notifications.length === 0 ? (
                <div className="text-sm text-zinc-500">No hay notificaciones nuevas.</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "search" ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Búsqueda Avanzada</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Field label="Texto">
                <input
                  value={search.text}
                  onChange={(e) => setSearch((s) => ({ ...s, text: e.target.value }))}
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                />
              </Field>
              <Field label="Estado">
                <select
                  value={search.status}
                  onChange={(e) => setSearch((s) => ({ ...s, status: e.target.value }))}
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                >
                  <option value="">Todos</option>
                  {["Pendiente", "En Progreso", "Completada"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prioridad">
                <select
                  value={search.priority}
                  onChange={(e) => setSearch((s) => ({ ...s, priority: e.target.value }))}
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                >
                  <option value="">Todas</option>
                  {["Baja", "Media", "Alta", "Crítica"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Proyecto">
                <select
                  value={search.projectId}
                  onChange={(e) => setSearch((s) => ({ ...s, projectId: e.target.value }))}
                  className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
                >
                  <option value="0">Todos</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-3">
              <Button onClick={runSearch}>Buscar</Button>
            </div>
            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr className="[&>th]:px-3 [&>th]:py-2 border-b border-zinc-200">
                    <th>ID</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Proyecto</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-100 [&>td]:px-3 [&>td]:py-2">
                      <td className="font-mono">{t.taskNo}</td>
                      <td className="font-medium text-zinc-900">{t.title}</td>
                      <td>{t.status}</td>
                      <td>{t.priority}</td>
                      <td>{t.project ? t.project.name : "Sin proyecto"}</td>
                    </tr>
                  ))}
                  {searchResults.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-zinc-500" colSpan={5}>
                        Sin resultados.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "reports" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-zinc-900">Reportes</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => generateReport("tasks")}>Reporte de Tareas</Button>
                <Button variant="secondary" onClick={() => generateReport("projects")}>
                  Reporte de Proyectos
                </Button>
                <Button variant="secondary" onClick={() => generateReport("users")}>
                  Reporte de Usuarios
                </Button>
                <a
                  className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  href={`${API_BASE_URL}/api/export/tasks.csv`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Exportar CSV
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-base font-semibold text-zinc-900">Salida</h3>
              <textarea
                value={reportText}
                readOnly
                rows={14}
                className="mt-3 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
