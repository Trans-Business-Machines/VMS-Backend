// External module imports
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { addMinutes } = require("date-fns")

// Internal module imports
const { OTPSchema } = require("../schemas")
const { SALT_ROUNDS, jwtResetTokenOpts } = require("../constants");
const { CustomError } = require("../utils/index")

// load env variables
dotenv.config()

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET

// create otp model
const oneTimePass = mongoose.model("otp", OTPSchema)

/* -------------------- model methods -------------------- */
async function storeOTP(otp, email) {
    try {
        // hash my one time passowrd
        const hashedOTP = await bcrypt.hash(otp, 10);
        const otpObj = {
            email,
            otp: hashedOTP,
            expiresAt: addMinutes(new Date(), 15)
        }

        const result = await oneTimePass.create(otpObj)

        if (result) {
            return true
        } else {
            return false
        }
    } catch (error) {
        throw error
    }

}

async function createResetToken(otpCode, details) {
    const { email, userId } = details
    try {
        // Get otp object
        const otpObj = await oneTimePass.findOne({ email })

        // compare otp
        const isValid = await bcrypt.compare(otpCode, otpObj.otp)

        if (!isValid) {
            throw new CustomError("Invalid one time pass code!", 400);
        }

        // check expiry
        const rightNow = new Date().getTime()

        if (rightNow > otpObj.expiresAt) {
            throw new CustomError("OTP expired!", 400);
        }

        // delete the OTP
        await oneTimePass.deleteOne({ email })

        // create a 12 minutes reset token for password resetting
        const token = await jwt.sign({ userId, purpose: "reset-password" }, JWT_TOKEN_SECRET, jwtResetTokenOpts)

        return token;
        // create reset token
    } catch (error) {
        throw error
    }
}

/* -------------------- model methods exports -------------------- */
module.exports = {
    storeOTP,
    createResetToken
}
