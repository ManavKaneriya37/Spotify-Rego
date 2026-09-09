import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";

async function startListener() {
  subscribeToQueue("user_registered", async (msg) => {
    const {
      id,
      email,
      role,
      fullname: { firstName, lastName },
    } = msg;

    const template = `
        <h1>Welcome to Spotify Rego, ${firstName}!</h1>
        <p>Thank you for registering with us. We're excited to have you on board.</p>
        <p>Your account details:</p>
        <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Role:</strong> ${role}</li>
            <li><strong>Full Name:</strong> ${firstName} ${lastName}</li>
        </ul>
        <p>We hope you enjoy using our service!</p>
        <p>Best regards,</p>
        <p>The Spotify Rego Team</p>
    `;
    
    await sendEmail(
      email,
      "Welcome to Spotify Rego!",
      `Hello ${firstName},\n\nThank you for registering with us. We're excited to have you on board.\n\nYour account details:\n- Email: ${email}\n- Role: ${role}\n- Full Name: ${firstName} ${lastName}\n\nWe hope you enjoy using our service!\n\nBest regards,\nThe Spotify Rego Team`,
      template,
    );
  });
}

export default startListener;
