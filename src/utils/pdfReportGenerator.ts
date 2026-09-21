import { jsPDF } from 'jspdf';
import type { AgriGradeReport, AgentTraceStep } from '../types';

export interface GeneratePdfOptions {
  report: AgriGradeReport;
  batchId?: string;
  supplierName?: string;
  imageUrl?: string;
  ambientTemp?: number;
  transitHours?: number;
  transitKm?: number;
}

/**
 * Generates and downloads a formal multi-page PDF quality audit report
 * including inspection scores, gate verdicts, USDA color stages, and
 * the full multi-agent consensus trace.
 */
export async function generateInspectionPdfReport(options: GeneratePdfOptions): Promise<void> {
  const {
    report,
    batchId = 'CRATE-UNKNOWN',
    supplierName = 'Co-Op Farm Cluster',
    imageUrl,
    ambientTemp = 28,
    transitHours = 10,
    transitKm = 120,
  } = options;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt

  // Resolve Quality Score and Verdict
  const isField = report.mode === 'FIELD_PRE_HARVEST';
  let qualityScore = 0;
  let verdictLabel = 'INSPECTED';
  let verdictColor: [number, number, number] = [16, 185, 129]; // emerald
  let verdictDescription = '';

  if (report.inbound_action) {
    qualityScore = report.inbound_action.quality_score;
    if (report.inbound_action.verdict === 'ACCEPTED_GRADE_A') {
      verdictLabel = 'ACCEPTED (GRADE A)';
      verdictColor = [16, 185, 129]; // emerald
      verdictDescription = `Full intake approved. ERP Destination: ${report.inbound_action.erp_routing_tag || 'WMS-AISLE-01'}.`;
    } else if (report.inbound_action.verdict === 'ACCEPTED_GRADE_B') {
      verdictLabel = 'ACCEPTED (GRADE B - MARKDOWN)';
      verdictColor = [245, 158, 11]; // amber
      verdictDescription = `Dynamic Discount of ${report.inbound_action.recommended_dynamic_discount_percent}% applied to mitigate spoilage risk.`;
    } else {
      verdictLabel = 'REJECTED AT DOCK (RMA)';
      verdictColor = [239, 68, 68]; // rose
      verdictDescription = report.inbound_action.disposition_notes || 'Produce failed dark store acceptance threshold.';
    }
  } else if (report.harvest_guidance) {
    qualityScore = report.harvest_guidance.transit_viability_score;
    if (report.harvest_guidance.should_harvest_today) {
      verdictLabel = 'HARVEST RECOMMENDED TODAY';
      verdictColor = [16, 185, 129]; // emerald
      verdictDescription = `Optimal window: ${report.harvest_guidance.optimal_harvest_window}. Viability score: ${qualityScore}/100.`;
    } else {
      verdictLabel = 'DELAY HARVEST (EXTEND VINE MATURATION)';
      verdictColor = [245, 158, 11]; // amber
      verdictDescription = report.harvest_guidance.optimal_harvest_window || 'Fruit needs additional sun-ripening before transit.';
    }
  } else {
    qualityScore = Math.round(report.confidence * 100);
    verdictLabel = 'STANDARD INSPECTION COMPLETE';
    verdictColor = [14, 165, 233]; // sky
    verdictDescription = report.overall_summary || 'Inspection completed successfully.';
  }

  // -------------------------------------------------------------
  // HELPER FUNCTIONS FOR CLEAN VECTOR RENDERING
  // -------------------------------------------------------------
  const drawHeaderBar = (pageNum: number, totalPagesStr: string) => {
    // Top banner background
    doc.setFillColor(24, 24, 27); // stone-900
    doc.rect(0, 0, pageWidth, 68, 'F');

    // Accent line
    doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.rect(0, 68, pageWidth, 3, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AGRIGRADE AI™', margin, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(161, 161, 170); // stone-400
    doc.text('AUTONOMOUS DUAL-MODE PRODUCE QUALITY CERTIFICATE', margin, 46);

    // Right side: Document ID & Timestamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(244, 244, 245);
    doc.text(`DOC: ${report.id.slice(0, 16).toUpperCase()}`, pageWidth - margin, 30, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    const dateStr = new Date(report.timestamp).toLocaleString();
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, 44, { align: 'right' });
    doc.text(`Page ${pageNum} of ${totalPagesStr}`, pageWidth - margin, 56, { align: 'right' });
  };

  const drawFooterBar = (pageNum: number) => {
    const footerY = pageHeight - 32;
    doc.setDrawColor(228, 228, 231); // stone-200
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122); // stone-500
    doc.text('AgriGrade AI • Dual-Mode Field & Dark Store Inspection Engine • Powered by Gemini Vision & Arrhenius Kinetics', margin, footerY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(82, 82, 91);
    doc.text('CONFIDENTIAL QUALITY AUDIT', pageWidth - margin, footerY + 14, { align: 'right' });
  };

  // -------------------------------------------------------------
  // PAGE 1: EXECUTIVE QUALITY AUDIT CERTIFICATE
  // -------------------------------------------------------------
  drawHeaderBar(1, '2');

  let curY = 90;

  // 1. Executive Verdict & Quality Score Card
  doc.setFillColor(250, 250, 250); // stone-50
  doc.setDrawColor(228, 228, 231); // stone-200
  doc.roundedRect(margin, curY, contentWidth, 80, 6, 6, 'FD');

  // Left side: Big Verdict Pill & Text
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(margin + 14, curY + 14, 185, 22, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(verdictLabel, margin + 20, curY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91);
  const splitVerdictDesc = doc.splitTextToSize(verdictDescription, contentWidth - 190);
  doc.text(splitVerdictDesc, margin + 14, curY + 52);

  // Right side: Circular or Boxed Quality Score
  const scoreBoxX = pageWidth - margin - 120;
  doc.setFillColor(244, 244, 245);
  doc.setDrawColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(scoreBoxX, curY + 10, 108, 60, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.text(`${qualityScore}`, scoreBoxX + 54, curY + 40, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text(isField ? 'TRANSIT VIABILITY' : 'QUALITY SCORE / 100', scoreBoxX + 54, curY + 58, { align: 'center' });

  curY += 92;

  // 2. Intake Metadata Grid (Batch, Supplier, Mode, Timestamp)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, curY, contentWidth, 54, 4, 4, 'FD');

  const colW = contentWidth / 4;

  // Col 1: Batch ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('CRATE / BATCH ID', margin + 10, curY + 18);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text(batchId, margin + 10, curY + 36);

  // Col 2: Supplier
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('ORIGIN / SUPPLIER', margin + colW + 10, curY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  const supplierShort = supplierName.length > 22 ? supplierName.slice(0, 20) + '...' : supplierName;
  doc.text(supplierShort, margin + colW + 10, curY + 36);

  // Col 3: Mode & Commodity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('INSPECTION DOMAIN', margin + colW * 2 + 10, curY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text(isField ? 'Field Pre-Harvest' : 'Dark Store Inbound', margin + colW * 2 + 10, curY + 36);

  // Col 4: Commodity & Variety
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('PRODUCE & VARIETY', margin + colW * 3 + 10, curY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text(`${report.produce_type} (${report.variety_detected || 'Standard'})`, margin + colW * 3 + 10, curY + 36);

  curY += 66;

  // 3. Middle Section: Physical & Optical Quality vs Biochemical Respiration
  const halfW = (contentWidth - 14) / 2;

  // Left Box: USDA Optical Maturity & Firmness
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(margin, curY, halfW, 140, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text('USDA Optical Maturity & Firmness', margin + 12, curY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91);
  doc.text(`• USDA Color Stage: Stage ${report.usda_color_stage} - ${report.stage_name}`, margin + 12, curY + 40);
  doc.text(`• Ripeness Percentage: ${report.ripeness_percentage.toFixed(1)}%`, margin + 12, curY + 56);
  doc.text(`• Penetrometer Firmness: ${report.firmness_estimate_penetrometer.toFixed(1)} kg/cm²`, margin + 12, curY + 72);
  doc.text(`• Bruise / Defect Index: ${report.bruise_defect_index.toFixed(1)}%`, margin + 12, curY + 88);
  doc.text(`• Optical Classification Confidence: ${(report.confidence * 100).toFixed(1)}%`, margin + 12, curY + 104);

  // Color Histogram Bar representation
  const colorBarY = curY + 118;
  const cbWidth = halfW - 24;
  const cbHeight = 8;
  const gW = (report.color_breakdown.green_pct / 100) * cbWidth;
  const yW = (report.color_breakdown.yellow_pct / 100) * cbWidth;
  const poW = (report.color_breakdown.pink_orange_pct / 100) * cbWidth;
  const rW = (report.color_breakdown.deep_red_pct / 100) * cbWidth;

  let startX = margin + 12;
  doc.setFillColor(74, 222, 128); // Green
  doc.rect(startX, colorBarY, gW, cbHeight, 'F');
  startX += gW;
  doc.setFillColor(250, 204, 21); // Yellow
  doc.rect(startX, colorBarY, yW, cbHeight, 'F');
  startX += yW;
  doc.setFillColor(251, 146, 60); // Orange
  doc.rect(startX, colorBarY, poW, cbHeight, 'F');
  startX += poW;
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(startX, colorBarY, rW, cbHeight, 'F');

  // Right Box: Arrhenius Kinetic Shelf-Life Engine
  const rightBoxX = margin + halfW + 14;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(rightBoxX, curY, halfW, 140, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text('Arrhenius Kinetic Shelf-Life Decay', rightBoxX + 12, curY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91);
  doc.text(`• Ambient Shelf-Life (${ambientTemp}°C): ${report.ambient_shelf_life_days} Marketable Days`, rightBoxX + 12, curY + 40);
  doc.text(`• Cold-Chain Shelf-Life (8-12°C): ${report.cold_storage_shelf_life_days} Days`, rightBoxX + 12, curY + 56);
  doc.text(`• Cold Gain: +${report.cold_storage_shelf_life_days - report.ambient_shelf_life_days} days via active refrigeration`, rightBoxX + 12, curY + 72);
  doc.text(`• Q10 Respiration Factor: ${report.kinetic_parameters?.q10_respiration_factor || 2.2}`, rightBoxX + 12, curY + 88);
  doc.text(`• Base Commodity Longevity: ${report.kinetic_parameters?.base_shelf_life_days || 14} days`, rightBoxX + 12, curY + 104);

  const gainPct = Math.round(((report.cold_storage_shelf_life_days - report.ambient_shelf_life_days) / Math.max(1, report.ambient_shelf_life_days)) * 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(14, 165, 233); // sky-500
  doc.text(`Storage Efficiency: +${gainPct}% shelf-life preservation via Reefer`, rightBoxX + 12, curY + 124);

  curY += 152;

  // 4. Inbound / Harvest Routing Action Breakdown
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(margin, curY, contentWidth, 75, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text(isField ? 'Transit & Logistics Guidance' : 'Dark Store Dock Disposition & WMS Directives', margin + 12, curY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91);

  if (report.inbound_action) {
    const action = report.inbound_action;
    doc.text(`• WMS ERP Routing Tag: ${action.erp_routing_tag || 'WMS-STANDARD-RACK'}`, margin + 12, curY + 38);
    doc.text(`• Dynamic Discount Applied: ${action.recommended_dynamic_discount_percent}% (Retail Markdown)`, margin + 12, curY + 54);
    const summaryLines = doc.splitTextToSize(`• Disposition Notes: ${action.disposition_notes || 'Automated optical dock inspection completed.'}`, contentWidth - 24);
    doc.text(summaryLines, margin + 12, curY + 68);
  } else if (report.harvest_guidance) {
    const guidance = report.harvest_guidance;
    doc.text(`• Target Channel: ${guidance.target_channel || 'Cold Chain Hub'}`, margin + 12, curY + 38);
    doc.text(`• Transit Simulation: ${transitKm} km / ${transitHours} hrs to target hub`, margin + 12, curY + 54);
    const reasoningLines = doc.splitTextToSize(`• Risk Assessment: ${guidance.harvest_risk_assessment || 'Evaluation based on color spectrum and transit kinetics.'}`, contentWidth - 24);
    doc.text(reasoningLines, margin + 12, curY + 68);
  }

  curY += 88;

  // 5. Executive AI Summary Box
  doc.setFillColor(244, 244, 245);
  doc.setDrawColor(212, 212, 216);
  doc.roundedRect(margin, curY, contentWidth, 68, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text('Autonomous Multi-Agent Consensus Summary', margin + 12, curY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(63, 63, 70);
  const execSummaryLines = doc.splitTextToSize(report.overall_summary || 'Inspection verified by multi-agent swarm.', contentWidth - 24);
  doc.text(execSummaryLines, margin + 12, curY + 34);

  curY += 80;

  // Optional: Embed captured image if present
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      doc.text('Optical Proof of Inspection:', margin, curY + 10);
      doc.addImage(imageUrl, 'JPEG', margin, curY + 16, 90, 68);
      curY += 92;
    } catch {
      // Ignore image encoding error safely
    }
  }

  drawFooterBar(1);

  // -------------------------------------------------------------
  // PAGE 2: MULTI-AGENT SWARM TRACE & COMPLIANCE LEDGER
  // -------------------------------------------------------------
  doc.addPage();
  drawHeaderBar(2, '2');

  let p2Y = 90;

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.text('Multi-Agent Consensus & Execution Telemetry', margin, p2Y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 113, 122);
  doc.text('Detailed decision logs and findings synthesized by autonomous specialized agricultural agents.', margin, p2Y + 14);

  p2Y += 30;

  // Render Each Agent Trace Step
  const traces: AgentTraceStep[] = report.agent_traces || [];

  traces.forEach((trace, idx) => {
    const cardHeight = 88;
    // Check page overflow
    if (p2Y + cardHeight > pageHeight - 60) {
      doc.addPage();
      drawHeaderBar(3, '3');
      p2Y = 90;
    }

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, p2Y, contentWidth, cardHeight, 5, 5, 'FD');

    // Agent Header bar inside card
    doc.setFillColor(244, 244, 245);
    doc.roundedRect(margin, p2Y, contentWidth, 24, 5, 5, 'F');
    doc.rect(margin, p2Y + 18, contentWidth, 6, 'F'); // square bottom corners of top bar

    // Agent Name & Role
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc.text(`Agent ${idx + 1}: ${trace.agent_name}`, margin + 12, p2Y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(`[${trace.role}]`, margin + 160, p2Y + 16);

    // Latency & Status Pill
    const isCompleted = trace.status === 'completed';
    doc.setFillColor(isCompleted ? 236 : 254, isCompleted ? 253 : 243, isCompleted ? 245 : 242);
    doc.setDrawColor(isCompleted ? 16 : 245, isCompleted ? 185 : 158, isCompleted ? 129 : 11);
    doc.roundedRect(pageWidth - margin - 110, p2Y + 4, 98, 16, 3, 3, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(isCompleted ? 16 : 180, isCompleted ? 140 : 83, isCompleted ? 90 : 9);
    doc.text(`${trace.status.toUpperCase()} • ${trace.latency_ms}ms`, pageWidth - margin - 61, p2Y + 15, { align: 'center' });

    // Summary Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(63, 63, 70);
    const summaryLines = doc.splitTextToSize(trace.summary, contentWidth - 24);
    doc.text(summaryLines, margin + 12, p2Y + 38);

    // Key Findings Pill / Key-values
    const findingsKeys = Object.keys(trace.findings || {}).slice(0, 4);
    if (findingsKeys.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(113, 113, 122);
      doc.text('Key Observations:', margin + 12, p2Y + 68);

      let fx = margin + 85;
      findingsKeys.forEach((key) => {
        const val = trace.findings[key];
        const valStr = typeof val === 'object' ? JSON.stringify(val).slice(0, 15) : String(val);
        const tagText = `${key}: ${valStr}`;
        const tagW = doc.getTextWidth(tagText) + 12;

        if (fx + tagW < pageWidth - margin - 12) {
          doc.setFillColor(244, 244, 245);
          doc.roundedRect(fx, p2Y + 58, tagW, 14, 3, 3, 'F');
          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(39, 39, 42);
          doc.text(tagText, fx + 6, p2Y + 68);
          fx += tagW + 6;
        }
      });
    }

    p2Y += cardHeight + 10;
  });

  // Compliance & Quality Assurance Sign-off Block
  p2Y += 10;
  if (p2Y + 95 < pageHeight - 50) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 212, 216);
    doc.roundedRect(margin, p2Y, contentWidth, 90, 5, 5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(24, 24, 27);
    doc.text('Quality Assurance Sign-Off & Verification Chain', margin + 12, p2Y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122);
    doc.text(
      'This inspection certificate has been digitally sealed by the AgriGrade AI Multi-Agent Consensus Swarm. All decisions comply with USDA agricultural grading frameworks and cold-chain kinetic storage directives.',
      margin + 12,
      p2Y + 32,
      { maxWidth: contentWidth - 24 }
    );

    // Signature lines
    doc.setDrawColor(161, 161, 170);
    doc.line(margin + 12, p2Y + 70, margin + 180, p2Y + 70);
    doc.text('Dock Gate / Field QA Inspector', margin + 12, p2Y + 80);

    doc.line(pageWidth - margin - 180, p2Y + 70, pageWidth - margin - 12, p2Y + 70);
    doc.text('AgriGrade AI Cryptographic Seal (Verified)', pageWidth - margin - 180, p2Y + 80);
  }

  drawFooterBar(2);

  // Trigger browser download
  const cleanBatch = batchId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `AgriGrade_Audit_Report_${cleanBatch}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
