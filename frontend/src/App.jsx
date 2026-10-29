
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/employees";

const emptyForm = {
  name: "",
  department: "",
  role: "",
  salary: "",
  joinDate: "",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch employees from MongoDB through the backend API
  const fetchEmployees = async () => {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load employees.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid employee data received.");
      }

      setEmployees(data);
    } catch (err) {
      setError(
        "Employees load nahi ho rahe. Check karo ki backend aur MongoDB chal rahe hain."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search and sort employees
  const filteredEmployees = [...employees]
    .filter((employee) =>
      `${employee.name} ${employee.department} ${employee.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === "salary") {
        valueA = Number(valueA || 0);
        valueB = Number(valueB || 0);

        return sortOrder === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }

      if (sortBy === "joinDate") {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();

        return sortOrder === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }

      valueA = String(valueA || "").toLowerCase();
      valueB = String(valueB || "").toLowerCase();

      const result = valueA.localeCompare(valueB);

      return sortOrder === "asc" ? result : -result;
    });

  // Add or update employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const employeeData = {
        ...formData,
        name: formData.name.trim(),
        department: formData.department.trim(),
        role: formData.role.trim(),
        salary: Number(formData.salary),
      };

      const url =
        editingId !== null
          ? `${API_URL}/${editingId}`
          : API_URL;

      const method = editingId !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save employee."
        );
      }

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchEmployees();
    } catch (err) {
      setError(err.message || "Employee save nahi ho paya.");
    } finally {
      setSaving(false);
    }
  };

  // Open form for editing
  const handleEdit = (employee) => {
    setFormData({
      name: employee.name || "",
      department: employee.department || "",
      role: employee.role || "",
      salary: String(employee.salary ?? ""),
      joinDate: employee.joinDate
        ? String(employee.joinDate).slice(0, 10)
        : "",
    });

    setEditingId(employee._id);
    setShowForm(true);
    setError("");
  };

  // Delete employee from the database
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Kya aap sach mein is employee ko delete karna chahti hain?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete employee."
        );
      }

      await fetchEmployees();
    } catch (err) {
      setError(err.message || "Employee delete nahi ho paya.");
    }
  };

  // Open add employee form
  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // Calculate dashboard statistics
  const departmentsCount = new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ).size;

  const monthlyPayroll = employees.reduce(
    (sum, employee) => sum + Number(employee.salary || 0),
    0
  );

  const currentYear = new Date().getFullYear();

  const newEmployeesCount = employees.filter((employee) => {
    if (!employee.joinDate) return false;

    const joinDate = new Date(employee.joinDate);
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    return joinDate >= startOfYear && joinDate < startOfNextYear;
  }).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#050507] p-6 text-white shadow-xl shadow-black/30 md:block">
        <h1 className="text-2xl font-bold">
          EMS<span className="text-violet-400">.</span>
        </h1>

        <p className="mt-2 text-sm text-indigo-200/70">
          Employee Management
        </p>

        <nav className="mt-10 space-y-3">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 font-semibold shadow-lg shadow-indigo-950/20">
            Dashboard
          </div>

          <a
            href="#employee-directory"
            className="block rounded-xl px-4 py-3 text-indigo-100/75 transition hover:bg-white/10 hover:text-white"
          >
            Employees
          </a>

          <a
            href="#employee-directory"
            className="block rounded-xl px-4 py-3 text-indigo-100/75 transition hover:bg-white/10 hover:text-white"
          >
            Departments
          </a>

          <a
            href="#settings"
            className="block rounded-xl px-4 py-3 text-indigo-100/75 transition hover:bg-white/10 hover:text-white"
          >
            Settings
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 text-sm text-indigo-200/60">
          Employee Portal © 2026
        </div>
      </aside>

      {/* Main content */}
      <main className="p-5 md:ml-64 md:p-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">
              Overview / Dashboard
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Dashboard
            </h2>

            <p className="mt-2 text-slate-400">
              Welcome back! Here's your team overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-bold text-white shadow-md shadow-indigo-500/20">
              A
            </div>

            <div>
              <p className="font-semibold">Admin User</p>
              <p className="text-sm text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700"
          >
            {error}
          </div>
        )}

        {/* Dashboard cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={loading ? "..." : employees.length}
            icon="👥"
            accent="indigo"
          />

          <StatCard
            title="Departments"
            value={loading ? "..." : departmentsCount}
            icon="🏢"
            accent="sky"
          />

          <StatCard
            title="Monthly Payroll"
            value={
              loading
                ? "..."
                : `₹${monthlyPayroll.toLocaleString("en-IN")}`
            }
            icon="💰"
            accent="violet"
          />

          <StatCard
            title="New Employees"
            value={loading ? "..." : newEmployeesCount}
            icon="✨"
            accent="amber"
          />
        </section>

        {/* Employee Directory */}
        <section
          id="employee-directory"
          className="mt-8 rounded-2xl border border-white/10 bg-[#15151b] p-5 shadow-[0_16px_50px_-28px_rgba(99,102,241,0.35)] sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold">
                Employee Directory
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                View and search your team members.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
            >
              + Add Employee
            </button>
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-[#1d1d25] p-5 sm:grid-cols-2"
            >
              <h3 className="text-lg font-bold sm:col-span-2">
                {editingId !== null
                  ? "Edit Employee"
                  : "Add New Employee"}
              </h3>

              {[
                ["name", "Employee Name"],
                ["department", "Department"],
                ["role", "Job Role"],
                ["salary", "Salary"],
              ].map(([field, label]) => (
                <input
                  key={field}
                  type={field === "salary" ? "number" : "text"}
                  placeholder={label}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field]: e.target.value,
                    })
                  }
                  required
                  min={field === "salary" ? "0" : undefined}
                  step={field === "salary" ? "0.01" : undefined}
                  className="rounded-xl border border-white/10 bg-[#111116] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15"
                />
              ))}

              <label className="text-sm text-slate-300">
                Join Date

                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      joinDate: e.target.value,
                    })
                  }
                  required
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-[#111116] px-4 py-3 text-slate-100 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Employee"
                      : "Save Employee"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-white/15 bg-[#25252e] px-5 py-3 text-slate-200 transition hover:border-white/25 hover:bg-[#30303a]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, department or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-6 w-full rounded-xl border border-white/10 bg-[#111116] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:max-w-md"
          />

          {/* Sorting controls */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="font-medium">
              Sort By:

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 rounded-xl border border-white/10 bg-[#111116] px-3 py-2 text-slate-100 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15"
              >
                <option value="name">Name</option>
                <option value="salary">Salary</option>
                <option value="joinDate">Join Date</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "asc" ? "desc" : "asc"
                )
              }
              className="rounded-xl border border-violet-400/20 bg-violet-500/15 px-4 py-2 font-medium text-violet-200 transition hover:bg-violet-500/25"
            >
              {sortOrder === "asc"
                ? "Ascending ↑"
                : "Descending ↓"}
            </button>
          </div>

          {/* Employee table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#20202a] text-sm text-slate-300">
                  <th className="px-4 py-4 font-semibold">
                    Employee
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Department
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Role
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Salary
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Join Date
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b border-white/5 last:border-0 hover:bg-indigo-400/5"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {employee.name}
                      </td>

                      <td className="px-4 py-4">
                        {employee.department}
                      </td>

                      <td className="px-4 py-4">
                        {employee.role}
                      </td>

                      <td className="px-4 py-4">
                        ₹
                        {Number(employee.salary).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {employee.joinDate
                          ? new Date(
                              employee.joinDate
                            ).toLocaleDateString("en-IN")
                          : ""}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(employee)}
                          className="mr-2 rounded-lg bg-indigo-500/15 px-3 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(employee._id)
                          }
                          className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/25"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="settings"
          className="py-8 text-center text-sm text-slate-500"
        >
          © 2026 Employee Management System. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

// Dashboard statistic card
function StatCard({ title, value, icon, accent }) {
  const accentClasses = {
    indigo: "bg-indigo-500/15 text-indigo-300",
    sky: "bg-sky-500/15 text-sky-300",
    violet: "bg-violet-500/15 text-violet-300",
    amber: "bg-amber-500/15 text-amber-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151b] p-5 shadow-[0_12px_35px_-24px_rgba(99,102,241,0.32)] transition duration-200 hover:-translate-y-1 hover:border-indigo-400/25 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${accentClasses[accent]}`}>
          {icon}
        </span>
      </div>

      <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">{value}</h3>
    </div>
  );
}

export default App;
