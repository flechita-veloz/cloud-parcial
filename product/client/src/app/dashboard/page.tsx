"use client";

import {
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import CardExpenseSummary from "./CardLoansSummary";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";
import { useGetDashboardMetricsQuery } from "@/state/api";
import DateRangePicker from "../(components)/DateRangePicker";
import { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    console.log("NEXT_PUBLIC_API_:", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const { data: dashboardMetrics } = useGetDashboardMetricsQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  console.log("dashboard metrics:", dashboardMetrics);
  return (
    <>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mt-4 gap-4">
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={setDateRange}
      />
    </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
        {/* <CardPopularProducts /> */}
        <CardSalesSummary startDate={dateRange.startDate} endDate={dateRange.endDate} />
        <CardPurchaseSummary startDate={dateRange.startDate} endDate={dateRange.endDate} />
        <CardExpenseSummary startDate={dateRange.startDate} endDate={dateRange.endDate} />
        <StatCard
          title="Gasto & Transacciones"
          primaryIcon={<Package className="text-blue-600 w-6 h-6" />}
          details={[
            {
              title: "Gastos",
              amount: `S/ ${(
                dashboardMetrics?.expenseSummary?.totalExpense || 0
              ).toLocaleString("es-PE", { maximumFractionDigits: 2 })}`,
              changePercentage:
                dashboardMetrics?.expenseSummary?.changePercentage || 0,
              IconComponent:
                (dashboardMetrics?.expenseSummary?.changePercentage || 0) >= 0
                  ? TrendingUp
                  : TrendingDown,
            },
            {
              title: "Depósitos",
              amount: `S/ ${(
                dashboardMetrics?.transactionSummary?.deposit?.total || 0
              ).toLocaleString("es-PE", { maximumFractionDigits: 2 })}`,
              changePercentage:
                dashboardMetrics?.transactionSummary?.deposit?.changePercentage || 0,
              IconComponent:
                (dashboardMetrics?.transactionSummary?.deposit?.changePercentage || 0) >=
                0
                  ? TrendingUp
                  : TrendingDown,
            },
            {
              title: "Retiros",
              amount: `S/ ${(
                dashboardMetrics?.transactionSummary?.withdrawal?.total || 0
              ).toLocaleString("es-PE", { maximumFractionDigits: 2 })}`,
              changePercentage:
                dashboardMetrics?.transactionSummary?.withdrawal?.changePercentage || 0,
              IconComponent:
                (dashboardMetrics?.transactionSummary?.withdrawal?.changePercentage ||
                  0) >= 0
                  ? TrendingUp
                  : TrendingDown,
            },
          ]}
        />
      </div>
    </>
  );
};

export default Dashboard;
