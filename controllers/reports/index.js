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
    const reportData = await getMonthlyData(start, end);

    // create pdf document instance
    const doc = new PDFDocument();

    // set the appropriate headers for this response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=monthly_report.pdf"
    );

    // pipe the file to the HTTP response object
    doc.pipe(res);

    doc
      .fontSize(24)
      .text("Monthly Visitors Report", { align: "center", underline: true });

    doc.fontSize(16).text(`Total visitors: ${reportData.totalVisits}`);
    doc.moveDown();

    // Add top 3 hosts
    doc.text("Top 3 hosts with most visitors:");
    reportData.topHosts.forEach((h, index) => {
      doc.text(
        `${index + 1}.  ${capitalize(h.firstname)} ${capitalize(
          h.lastname
        )} - ${h.count} visits`,
        {
          indent: 20,
        }
      );
    });

    doc.moveDown();

    // Add top 5 visit purposes
    doc.text("Top 5 visit purposes:");
    reportData.topPurposes?.forEach((p, index) => {
      doc.text(`${index + 1}.  ${capitalize(p._id)} - ${p.count} visitors`, {
        indent: 20,
      });
    });

    // Move cursor near the bottom
    doc.moveDown(50);

    doc
      .fontSize(14)
      .font("Helvetica-Oblique")
      .text("Visitor Management System", { align: "center" });

    // End the stream
    doc.end();
  } catch (error) {
    next(error);
  }
}

/*------------------ Reports Controller methods export ------------------ */
module.exports = {
  generateMontlyReport,
};
