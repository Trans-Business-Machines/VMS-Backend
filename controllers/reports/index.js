// Internal module imports
const { AuthError } = require("../../utils/index")
const { getMonthlyData } = require("../../models/visit");
const { startOfMonth, endOfMonth } = require("date-fns")

/*------------------ Reports Controller methods ------------------ */
async function generateMontlyReport(req, res, next) {
    const user = req.user

    if (!["super admin", "admin"].includes(user.role)) {
        return next(new AuthError("Forbidden, only admins can generate monthly reports.", 403))
    }

    const today = new Date()
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    try {
        const reportData = await getMonthlyData(start, end)
        res.json(reportData)

    } catch (error) {
        next(error)
    }

}


/*------------------ Reports Controller methods export ------------------ */
module.exports = {
    generateMontlyReport
}