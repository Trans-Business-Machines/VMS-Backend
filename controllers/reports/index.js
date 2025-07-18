// External module imports
const PDFDocument = require("pdfkit");

// Internal module imports
const { AuthError } = require("../../utils/index");
const { getMonthlyData } = require("../../models/visit");
const { startOfMonth, endOfMonth } = require("date-fns");
const { capitalize } = require("../../utils/services");

/*------------------ Reports Controller methods ------------------ */
async function generateMontlyReport(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin"].includes(user.role)) {
    return next(
      new AuthError("Forbidden, only admins can generate monthly reports.", 403)
    );
  }

  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);

  try {
    // Get the monthly data from the DB
    const { topPurposes, totalVisits, topHosts } = await getMonthlyData(start, end);
    const doc = new PDFDocument({ size: "A4" });

    // Pipe to HTTP response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly-report.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Monthly Visitor Report", { align: "center" });
    doc.moveDown(1.5);

    // Total visits
    doc.fontSize(16).text(`Total Visitors This Month: ${totalVisits}`);
    doc.moveDown(1);

    // Top 5 Purposes
    doc.fontSize(16).text("Top 5 Visit Purposes:", { underline: true });
    doc.moveDown(0.5);
    topPurposes.forEach((p, index) => {
      doc.fontSize(14).text(`${index + 1}. ${capitalize(p._id)} — ${p.count} visits`);
    });

    doc.moveDown(1);

    // Top 3 Hosts
    doc.fontSize(16).text("Top 3 Hosts With Most Visits:", { underline: true });
    doc.moveDown(0.5);
    topHosts.forEach((h, index) => {
      const name = `${capitalize(h.firstname)} ${capitalize(h.lastname)}`;
      doc.fontSize(14).text(`${index + 1}. ${name} — ${h.count} visits`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
}

/*------------------ Reports Controller methods export ------------------ */
module.exports = {
  generateMontlyReport,
};
