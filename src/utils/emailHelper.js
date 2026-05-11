import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_36kp6wg";
const EMAILJS_TEMPLATE_ID = "template_1c9n9w2";  // ✔ correct one
const EMAILJS_PUBLIC_KEY = "3oPaXcWIwr2sMfais";

export const sendEmail = async (data) => {
  try {
    const res = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      data,
      EMAILJS_PUBLIC_KEY
    );

    console.log("EMAIL SENT SUCCESSFULLY", res);
    return true;
  } catch (error) {
    console.error("EMAILJS ERROR:", error);
    return false;
  }
};
