import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import React from "react";

interface CardLoanSummaryProps {
  startDate?: string;
  endDate?: string;
}

const colors = {
  Devuelto: "#00C49F",
  "Por devolver": "#FF8042",
  Vendido: "#0088FE",
};

const CardLoanSummary = ({ startDate, endDate }: CardLoanSummaryProps) => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery(
    startDate && endDate ? { startDate, endDate } : undefined
  );

  const loanSummary = dashboardMetrics?.loanSummary || [];

  // Crear datos a partir de los tres campos numéricos
  const totalLoanedReturned = loanSummary.reduce(
    (acc, item) => acc + (item.totalLoanedReturned || 0),
    0
  );
  const totalLoanedUnreturned = loanSummary.reduce(
    (acc, item) => acc + (item.totalLoanedUnreturned || 0),
    0
  );
  const totalSold = loanSummary.reduce(
    (acc, item) => acc + (item.totalSold || 0),
    0
  );

  const data = [
    { name: "Devuelto", value: totalLoanedReturned },
    { name: "Por devolver", value: totalLoanedUnreturned },
    { name: "Vendido", value: totalSold },
  ];

  const totalLoans = data.reduce((sum, item) => sum + item.value, 0);
  const formattedTotalLoans = totalLoans.toLocaleString("es-PE", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="row-span-5 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Cargando...</div>
      ) : (
        <>
          {/* ENCABEZADO */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Resumen de Préstamos
            </h2>
            <hr />
          </div>

          {/* CUERPO */}
          <div className="flex justify-center py-5 relative">
            <ResponsiveContainer width={240} height={250}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  label
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        colors[entry.name as keyof typeof colors] || "#8884d8"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="font-bold text-xl">
                S/ {formattedTotalLoans}
              </span>
            </div>
          </div>

          {/* LEYENDA */}
          <ul className="flex justify-center gap-6 pb-5">
            {data.map((entry, index) => (
              <li key={index} className="flex items-center text-xs">
                <span
                  className="mr-2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      colors[entry.name as keyof typeof colors],
                  }}
                ></span>
                {entry.name}
              </li>
            ))}
          </ul>

          {/* PIE */}
          <div>
            <hr />
            <div className="mt-3 flex justify-between items-center px-7 mb-4">
              <div className="pt-2">
                <p className="text-sm">
                  Total:{" "}
                  <span className="font-semibold">S/ {formattedTotalLoans}</span>
                </p>
              </div>
              <span className="flex items-center mt-2 text-green-600">
                <TrendingUp className="mr-2" />
                30%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardLoanSummary;
