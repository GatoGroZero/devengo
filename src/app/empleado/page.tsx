import EmployeeDashboard from "@/components/employee-dashboard";
import { employees } from "@/lib/payroll";

export default function EmpleadoPage() {
  const employee = employees[0];

  return <EmployeeDashboard employee={employee} />;
}