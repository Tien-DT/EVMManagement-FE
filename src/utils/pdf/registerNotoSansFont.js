import notoSansRegularBase64 from "../../assets/fonts/notoSansRegularBase64";
import notoSansSemiBoldBase64 from "../../assets/fonts/notoSansSemiBoldBase64";

const FONT_FAMILY_NAME = "NotoSans";
const FONT_MARKER = "__NotoSansEmbedded__";

const FONT_DEFINITIONS = [
  {
    fileName: "NotoSans-Regular.ttf",
    style: "normal",
    data: notoSansRegularBase64,
  },
  {
    fileName: "NotoSans-SemiBold.ttf",
    style: "bold",
    data: notoSansSemiBoldBase64,
  },
];

/**
 * Ensures that jsPDF document has Unicode fonts capable of rendering Vietnamese characters.
 * Fonts are embedded once per document and subsequent calls only reset the active font.
 *
 * @param {import("jspdf").jsPDF} doc - jsPDF instance that will receive the font.
 */
export const applyVietnameseFont = (doc) => {
  if (!doc) return;

  if (!doc.internal[FONT_MARKER]) {
    FONT_DEFINITIONS.forEach(({ fileName, data, style }) => {
      doc.addFileToVFS(fileName, data);
      doc.addFont(fileName, FONT_FAMILY_NAME, style);
    });
    doc.internal[FONT_MARKER] = true;
  }

  doc.setFont(FONT_FAMILY_NAME, "normal");
};

export default applyVietnameseFont;
