import EmployeeDashboard from "@/components/employee-dashboard";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeByIdPage({ params }: Props) {
  const { id } = await params;

  return <EmployeeDashboard employeeId={id} />;
}