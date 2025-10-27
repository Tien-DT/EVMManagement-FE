import { jsPDF } from "jspdf";
import applyVietnameseFont from "./registerNotoSansFont";

const DEFAULT_FONT = "NotoSans";
const COLORS = {
  text: { primary: [55, 65, 81], muted: [100, 116, 139], accent: [30, 41, 59] },
  divider: [226, 232, 240],
  cardBorder: [191, 219, 254],
  cardFill: [248, 250, 252],
  sectionFill: [237, 242, 247],
  sectionBorder: [226, 232, 240],
};

const PAGE_CONFIG = {
  marginX: 18,
  marginTop: 28,
  marginBottom: 20,
  lineHeight: 6,
  labelWidth: 42,
};

const setBodyFont = (doc) => {
  doc.setFont(DEFAULT_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text.primary);
};

/**
 * Creates a jsPDF instance and renders contract information using a consistent layout.
 *
 * @param {Object} config
 * @param {string} config.title - Title shown at the top of the document.
 * @param {Array<Object>} config.sections - Structured content sections to render.
 * @param {Object} [config.signature] - Configuration for the signature block.
 * @param {string} [config.signature.leftLabel] - Label for the left signature column.
 * @param {string} [config.signature.rightLabel] - Label for the right signature column.
 * @param {string[]} [config.signature.extraNotes] - Additional notes rendered beneath signatures.
 * @param {string} [config.signature.preparedBy] - Text showing who prepared the document.
 * @returns {import("jspdf").jsPDF}
 */
export const buildContractPdf = ({ title, sections = [], signature } = {}) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  applyVietnameseFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_CONFIG.marginX * 2;

  doc.setFont(DEFAULT_FONT, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.text.accent);
  doc.text(title || "Hợp đồng mua bán", pageWidth / 2, 22, { align: "center" });

  let cursorY = PAGE_CONFIG.marginTop;
  setBodyFont(doc);

  const ensureSpace = (height = PAGE_CONFIG.lineHeight) => {
    if (cursorY + height > pageHeight - PAGE_CONFIG.marginBottom) {
      doc.addPage();
      applyVietnameseFont(doc);
      cursorY = PAGE_CONFIG.marginTop;
      setBodyFont(doc);
    }
  };

  const drawSectionHeader = (sectionTitle) => {
    if (!sectionTitle) {
      return;
    }
    ensureSpace(14);
    doc.setFillColor(...COLORS.sectionFill);
    doc.setDrawColor(...COLORS.sectionBorder);
    doc.roundedRect(
      PAGE_CONFIG.marginX,
      cursorY - 4,
      contentWidth,
      10,
      2,
      2,
      "F"
    );
    doc.setFont(DEFAULT_FONT, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text.accent);
    doc.text(sectionTitle, PAGE_CONFIG.marginX + 3, cursorY + 3);
    cursorY += 12;
    setBodyFont(doc);
  };

  const addKeyValueRow = (label, value) => {
    if (!label) return;
    const displayValue = value ?? "—";
    const labelX = PAGE_CONFIG.marginX;
    const valueX = PAGE_CONFIG.marginX + PAGE_CONFIG.labelWidth + 4;
    const valueWidth = contentWidth - (valueX - PAGE_CONFIG.marginX);
    const lines = doc.splitTextToSize(String(displayValue), valueWidth);
    const blockHeight = Math.max(lines.length, 1) * PAGE_CONFIG.lineHeight;

    ensureSpace(blockHeight);

    doc.setFont(DEFAULT_FONT, "bold");
    doc.text(`${label}:`, labelX, cursorY);
    doc.setFont(DEFAULT_FONT, "normal");
    doc.text(lines, valueX, cursorY);
    cursorY += blockHeight;
    cursorY += 1;
  };

  const addKeyValueGroup = (rows = []) => {
    rows.filter(Boolean).forEach((row) =>
      addKeyValueRow(row.label, row.value)
    );
    cursorY += 2;
  };

  const addParagraph = (text) => {
    const safeText = text && text.trim().length > 0 ? text : "Không có thông tin.";
    const lines = doc.splitTextToSize(safeText, contentWidth);
    const blockHeight = lines.length * PAGE_CONFIG.lineHeight;
    ensureSpace(blockHeight);
    doc.text(lines, PAGE_CONFIG.marginX, cursorY);
    cursorY += blockHeight + 2;
  };

  const drawInfoCard = (title, rows = []) => {
    if (!rows.length) {
      return;
    }

    const labelX = PAGE_CONFIG.marginX + 5;
    const valueX = labelX + PAGE_CONFIG.labelWidth;
    const valueWidth = contentWidth - (valueX - PAGE_CONFIG.marginX) - 5;

    let cardHeight = 10;
    rows.forEach((row) => {
      const valueText = row?.value ?? "—";
      const lines = doc.splitTextToSize(String(valueText), valueWidth);
      cardHeight += Math.max(lines.length, 1) * PAGE_CONFIG.lineHeight;
    });

    ensureSpace(cardHeight + 6);

    doc.setDrawColor(...COLORS.cardBorder);
    doc.setFillColor(...COLORS.cardFill);
    doc.roundedRect(
      PAGE_CONFIG.marginX,
      cursorY,
      contentWidth,
      cardHeight + 4,
      2,
      2,
      "FD"
    );

    let innerY = cursorY + 8;
    doc.setFont(DEFAULT_FONT, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text.accent);
    doc.text(title || "", PAGE_CONFIG.marginX + 5, innerY);
    innerY += 4;

    rows.forEach((row) => {
      const valueText = row?.value ?? "—";
      const lines = doc.splitTextToSize(String(valueText), valueWidth);
      const height = Math.max(lines.length, 1) * PAGE_CONFIG.lineHeight;

      doc.setFont(DEFAULT_FONT, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text.primary);
      doc.text(`${row?.label || ""}:`, labelX, innerY);

      doc.setFont(DEFAULT_FONT, "normal");
      doc.text(lines, valueX, innerY);

      innerY += height;
    });

    cursorY += cardHeight + 10;
    setBodyFont(doc);
  };

  const addCardGroup = (cards = []) => {
    cards.filter(Boolean).forEach((card, index) => {
      const title = card.title || `Mục ${index + 1}`;
      drawInfoCard(title, card.rows);
    });
  };

  const addBulletList = (items = []) => {
    items
      .filter((item) => item && item.length)
      .forEach((item) => {
        const lines = doc.splitTextToSize(item, contentWidth - 6);
        const height = lines.length * PAGE_CONFIG.lineHeight;
        ensureSpace(height + PAGE_CONFIG.lineHeight);
        doc.text(`• ${lines[0]}`, PAGE_CONFIG.marginX, cursorY);
        lines.slice(1).forEach((line, idx) => {
          doc.text(
            line,
            PAGE_CONFIG.marginX + 6,
            cursorY + (idx + 1) * PAGE_CONFIG.lineHeight
          );
        });
        cursorY += height + 2;
      });
  };

  sections
    .filter((section) => section)
    .forEach((section) => {
      const hasContent =
        (section.rows && section.rows.length) ||
        (section.text && section.text.trim().length) ||
        (section.cards && section.cards.length) ||
        (section.items && section.items.length);

      if (!hasContent) {
        return;
      }

      drawSectionHeader(section.title);

      switch (section.type) {
        case "keyValue":
          addKeyValueGroup(section.rows);
          break;
        case "text":
          addParagraph(section.text);
          break;
        case "cards":
          addCardGroup(section.cards);
          break;
        case "list":
          addBulletList(section.items);
          break;
        default:
          break;
      }
    });

  if (signature) {
    ensureSpace(38);
    const columnWidth = contentWidth / 2;
    doc.setFont(DEFAULT_FONT, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text.accent);
    doc.text("ĐẠI DIỆN CÁC BÊN", PAGE_CONFIG.marginX, cursorY);
    cursorY += 7;

    doc.text(signature.leftLabel || "Bên bán", PAGE_CONFIG.marginX, cursorY);
    doc.text(
      signature.rightLabel || "Bên mua",
      PAGE_CONFIG.marginX + columnWidth,
      cursorY
    );

    doc.setFont(DEFAULT_FONT, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text.muted);
    cursorY += 5;
    const placeholder = "(Ký, ghi rõ họ tên)";
    doc.text(placeholder, PAGE_CONFIG.marginX, cursorY);
    doc.text(
      placeholder,
      PAGE_CONFIG.marginX + columnWidth,
      cursorY
    );
    cursorY += 25;

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text.primary);
    if (signature.extraNotes) {
      signature.extraNotes
        .filter(Boolean)
        .forEach((note) => {
          ensureSpace(PAGE_CONFIG.lineHeight);
          doc.text(note, PAGE_CONFIG.marginX, cursorY);
          cursorY += PAGE_CONFIG.lineHeight;
        });
    }

    if (signature.preparedBy) {
      ensureSpace(PAGE_CONFIG.lineHeight);
      doc.text(
        `Người lập: ${signature.preparedBy}`,
        PAGE_CONFIG.marginX,
        cursorY
      );
      cursorY += PAGE_CONFIG.lineHeight;
    }
  }

  return doc;
};

export default buildContractPdf;
