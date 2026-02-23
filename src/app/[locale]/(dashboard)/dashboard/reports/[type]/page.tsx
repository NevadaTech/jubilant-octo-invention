import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ReportViewer } from "@/modules/reports/presentation/components";
import { slugToReportType } from "@/modules/reports/presentation/utils/report-utils";

const REPORT_LABELS: Record<string, { title: string; description: string }> = {
  "available-inventory": {
    title: "Available Inventory",
    description: "Current stock levels by product, warehouse, and location",
  },
  "movement-history": {
    title: "Movement History",
    description:
      "Detailed history of all inventory entries, exits, and adjustments",
  },
  valuation: {
    title: "Inventory Valuation",
    description: "Total inventory value using weighted average cost (WAC)",
  },
  "low-stock": {
    title: "Low Stock Alerts",
    description: "Products below minimum stock with criticality levels",
  },
  movements: {
    title: "Movement Summary",
    description: "Aggregated movement statistics by type and warehouse",
  },
  financial: {
    title: "Financial Report",
    description: "Revenue, costs, and gross margins by period and warehouse",
  },
  turnover: {
    title: "Inventory Turnover",
    description: "Stock rotation analysis and days of inventory on hand",
  },
  sales: {
    title: "Sales Report",
    description: "Sales summary by period with revenue and order counts",
  },
  "sales-by-product": {
    title: "Sales by Product",
    description: "Detailed sales analysis broken down by product",
  },
  "sales-by-warehouse": {
    title: "Sales by Warehouse",
    description: "Sales performance compared across warehouses",
  },
  returns: {
    title: "Returns Report",
    description: "Summary of all product returns and their status",
  },
  "returns-by-type": {
    title: "Returns by Type",
    description: "Analysis of customer vs. supplier returns",
  },
  "returns-by-product": {
    title: "Returns by Product",
    description: "Return rates and trends broken down by product",
  },
  "returns-customer": {
    title: "Customer Returns",
    description: "Returns received from customers with full details",
  },
  "returns-supplier": {
    title: "Supplier Returns",
    description: "Returns sent back to suppliers with full details",
  },
};

interface Props {
  params: Promise<{ locale: string; type: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const reportType = slugToReportType(type);
  if (!reportType) notFound();

  const labels = REPORT_LABELS[type] ?? {
    title: type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: "View and analyze report data",
  };

  return (
    <ReportViewer
      type={reportType}
      title={labels.title}
      description={labels.description}
    />
  );
}
