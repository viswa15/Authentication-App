import {mailtrapClient, sender} from "./mailtrap.config.js";
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE
} from "./emailsTemplate.js";

export const sendVerificationEmail = async(email,verificationToken) =>{
    const recepient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from : sender,
            to : recepient,
            subject : "Verify your email",
            html : VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category : "Email verification"
        })

    }catch(e){
        console.log("Error sending verification",e);
        throw new Error(`Error sending verification email ${e}`);
    }
}

export const sendWelcomeEmail = async(email,name) =>{
    const recepient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recepient,
            template_uuid: "6a2bf66f-1c07-4acc-88d3-d39abaab67a6",
            template_variables: {
                company_info_name: "Auth Company",
                "name": name,
            }
        })
    }catch(e){
        console.error(`Error sending welcome email`, e);

        throw new Error(`Error sending welcome email: ${e}`);
    }
}

export const sendResetPasswordEmail = async(email,resetURL) =>{
    const recepient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recepient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset"
        })
    }catch(e){
        console.error(`Error sending welcome email`, e);

        throw new Error(`Error sending welcome email: ${e}`);
    }
}

export const sendResetSuccessEmail = async(email) => {
    const recepient = [{email}];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recepient,
            subject: "Password reset successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password reset"
        })
    } catch (e) {
        console.error(`Error sending welcome email`, e);

        throw new Error(`Error sending welcome email: ${e}`);
    }
}