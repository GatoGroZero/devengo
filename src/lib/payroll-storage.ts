import { Employee, employees as defaultEmployees } from "@/lib/payroll";

const STORAGE_KEY = "devengo_employees";

export function loadEmployees(): Employee[] {
  if (typeof window === "undefined") {
    return defaultEmployees;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
    return defaultEmployees;
  }

  try {
    const parsed = JSON.parse(raw) as Employee[];

    if (!Array.isArray(parsed)) {
      throw new Error("Formato inválido");
    }

    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
    return defaultEmployees;
  }
}

export function saveEmployees(employees: Employee[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function updateEmployee(updatedEmployee: Employee) {
  const currentEmployees = loadEmployees();

  const nextEmployees = currentEmployees.map((employee) =>
    employee.id === updatedEmployee.id ? updatedEmployee : employee
  );

  saveEmployees(nextEmployees);
  return nextEmployees;
}

export function resetEmployees() {
  saveEmployees(defaultEmployees);
  return defaultEmployees;
}