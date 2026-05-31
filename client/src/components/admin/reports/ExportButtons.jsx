import { Download, FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../ui/Button";

const buildQuery = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

export function ExportButtons({ filters, onPrint, onPdf }) {
  const token = localStorage.getItem("marketlane-token");

  const download = async (format) => {
    const query = buildQuery({ ...filters, format });
    const response = await fetch(`${api.defaults.baseURL}/admin/reports/export?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = format === "csv" ? "marketlane-report.csv" : "marketlane-report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={onPdf}>
        <FileDown className="h-4 w-4" /> PDF
      </Button>
      <Button type="button" variant="outline" onClick={() => download("csv")}>
        <FileSpreadsheet className="h-4 w-4" /> Excel/CSV
      </Button>
      <Button type="button" variant="outline" onClick={onPrint}>
        <Printer className="h-4 w-4" /> Print
      </Button>
      <Button type="button" variant="outline" onClick={() => download("json")}>
        <Download className="h-4 w-4" /> Data
      </Button>
    </div>
  );
}
