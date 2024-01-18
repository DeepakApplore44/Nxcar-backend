require("dotenv").config();
const moment = require("moment");
const twilio = require("twilio");
const User = require("../models/user.model");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * ! Saving the details filled by user to buy a car
 * @param {*} req
 * @param {*} res
 */

module.exports.saveUserDetails = async (req, res) => {
  try {
    const { phoneNumber, name, email, vehichleNumber } = req.body;

    const checkPhoneNumber = await User.findOne({ phoneNumber });

    if (checkPhoneNumber)
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered",
      });

    const otp = Math.floor(1000 + Math.random() * 9000);

    const otpExpiresAt = moment().add(1, "minutes").toDate();

    /**
     * ! Sending OTP sms to the phone number provided
     */

    const message = `Your OTP for verification is: ${otp}`;
    await client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    /**
     * ! Creating a new user based on the details provided
     */

    const newUser = await User.create({
      phoneNumber,
      name,
      email,
      vehichleNumber,
      otp,
      otpExpiresAt,
    });

    return res.status(201).json({
      success: true,
      message: "User details saved.",
      data: newUser,
    });
  } catch (error) {
    console.log("Error --->", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to save user" });
  }
};

/**
 * ! Verify the OTP received on the phone number
 * @param {*} req
 * @param {*} res
 */

module.exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, resendOTP = false, otp } = req.body;

    const checkUser = await User.findOne({ phoneNumber });

    if (resendOTP) {
      const newOTP = Math.floor(1000 + Math.random() * 9000);
      const message = `Your OTP for verification is: ${newOTP}`;
      await client.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      checkUser.otp = newOTP;

      await checkUser.save();

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    }

    if (checkUser.otp !== otp)
      return res.status(400).json({
        success: false,
        message: "OTP does not match !",
      });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("Error --->", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify OTP" });
  }
};
