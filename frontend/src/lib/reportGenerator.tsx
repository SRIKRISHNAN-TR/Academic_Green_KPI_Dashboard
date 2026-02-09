import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, HeadingLevel, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export interface ReportData {
  kpiType: string;
  location: string;
  dateRange: string;
  records: Array<{
    month: string;
    year: number;
    actual: number;
    target: number;
    status: string;
    location?: string;
  }>;
}

export async function generatePDF(data: ReportData) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(34, 139, 34);
  doc.text("Academic Green KPI Report", 14, 22);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`KPI: ${data.kpiType}`, 14, 32);
  doc.text(`Location: ${data.location}`, 14, 39);
  doc.text(`Period: ${data.dateRange}`, 14, 46);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 53);

  // Summary
  const totalActual = data.records.reduce((s, r) => s + r.actual, 0);
  const totalTarget = data.records.reduce((s, r) => s + r.target, 0);
  const overTarget = data.records.filter(
    (r) => data.kpiType === "Waste Management" ? r.actual < r.target : r.actual > r.target
  );

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Summary", 14, 65);
  doc.setFontSize(10);
  doc.text(`Total Actual: ${totalActual.toLocaleString()}`, 14, 73);
  doc.text(`Total Target: ${totalTarget.toLocaleString()}`, 14, 80);
  doc.text(`Over-Target Months: ${overTarget.length}`, 14, 87);

  // Table
  const tableData = data.records.map((r) => [
    `${r.month} ${r.year}`,
    r.location || data.location,
    r.actual.toLocaleString(),
    r.target.toLocaleString(),
    r.status,
    data.kpiType === "Waste Management"
      ? r.actual >= r.target ? "✓ On Track" : "⚠ Below Target"
      : r.actual <= r.target ? "✓ On Track" : "⚠ Over Target",
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["Period", "Location", "Actual", "Target", "Status", "Assessment"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [34, 139, 34] },
    alternateRowStyles: { fillColor: [245, 255, 245] },
  });

  doc.save(`Green_KPI_Report_${data.kpiType.replace(/\s/g, "_")}.pdf`);
}

export async function generateDOCX(data: ReportData) {
  const totalActual = data.records.reduce((s, r) => s + r.actual, 0);
  const totalTarget = data.records.reduce((s, r) => s + r.target, 0);
  const overTarget = data.records.filter(
    (r) => data.kpiType === "Waste Management" ? r.actual < r.target : r.actual > r.target
  );

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "999999",
  };
  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  const headerRow = new TableRow({
    children: ["Period", "Location", "Actual", "Target", "Status", "Assessment"].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
          shading: { fill: "228B22" },
          borders,
        })
    ),
  });

  const dataRows = data.records.map(
    (r) =>
      new TableRow({
        children: [
          `${r.month} ${r.year}`,
          r.location || data.location,
          r.actual.toLocaleString(),
          r.target.toLocaleString(),
          r.status,
          data.kpiType === "Waste Management"
            ? r.actual >= r.target ? "On Track" : "Below Target"
            : r.actual <= r.target ? "On Track" : "Over Target",
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
              borders,
            })
        ),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Academic Green KPI Report",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: `KPI: ${data.kpiType}`, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: `Location: ${data.location}`, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: `Period: ${data.dateRange}`, size: 24 })] }),
          new Paragraph({
            children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 24 })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: `Total Actual: ${totalActual.toLocaleString()}`, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: `Total Target: ${totalTarget.toLocaleString()}`, size: 22 })] }),
          new Paragraph({
            children: [new TextRun({ text: `Over-Target Months: ${overTarget.length}`, size: 22 })],
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Detailed Data",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new DocxTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Green_KPI_Report_${data.kpiType.replace(/\s/g, "_")}.docx`);
}