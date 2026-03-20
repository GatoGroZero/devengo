export type EmployeeStatus = "Activo" | "Pausado";

export type PaymentMethod = "Wallet Devengo" | "Cuenta bancaria";

export type Employee = {
  id: string;
  name: string;
  dailySalary: number;
  workedDays: number;
  withdrawn: number;
  maxWithdrawPercent: number;
  status: EmployeeStatus;
  paymentMethod: PaymentMethod;
};

export const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Luis Hernández",
    dailySalary: 450,
    workedDays: 3,
    withdrawn: 200,
    maxWithdrawPercent: 0.5,
    status: "Activo",
    paymentMethod: "Wallet Devengo",
  },
  {
    id: "emp-002",
    name: "Ana Martínez",
    dailySalary: 500,
    workedDays: 2,
    withdrawn: 0,
    maxWithdrawPercent: 0.5,
    status: "Activo",
    paymentMethod: "Cuenta bancaria",
  },
  {
    id: "emp-003",
    name: "Carlos Rivera",
    dailySalary: 380,
    workedDays: 2,
    withdrawn: 0,
    maxWithdrawPercent: 0.5,
    status: "Activo",
    paymentMethod: "Wallet Devengo",
  },
  {
    id: "emp-004",
    name: "Mariana Soto",
    dailySalary: 620,
    workedDays: 4,
    withdrawn: 400,
    maxWithdrawPercent: 0.4,
    status: "Pausado",
    paymentMethod: "Cuenta bancaria",
  },
];

export function calculateAccrued(employee: Employee) {
  return employee.dailySalary * employee.workedDays;
}

export function calculateAvailable(employee: Employee) {
  const accrued = calculateAccrued(employee);
  const maxWithdrawable = accrued * employee.maxWithdrawPercent;
  const available = maxWithdrawable - employee.withdrawn;

  return Math.max(0, Math.round(available));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCompanyStats() {
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Activo"
  ).length;

  const totalAccruedToday = employees.reduce(
    (total, employee) => total + calculateAccrued(employee),
    0
  );

  const pendingWithdrawals = employees.filter(
    (employee) => calculateAvailable(employee) > 0
  ).length;

  return {
    activeEmployees,
    totalAccruedToday,
    pendingWithdrawals,
  };
}

export function getEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}