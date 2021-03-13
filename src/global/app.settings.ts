//The values used here should really come from a settings table in database.

import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
/*Below is to directly read .env file from settings. 
See https://www.npmjs.com/package/dotenv.
It is used to get the particulars of Gmail account for SMTP mailer
*/
require('dotenv').config({ path: 'thirdparty.env' });

//user management
export const PASSWORD_RESET_EXPIRATION = 86400000 * 2 //24 hours * 2 in milliseconds

export const EMAIL_VERIFICATION_EXPIRATION = 86400000 * 2 //24 hours * 2 in milliseconds

export const LOGO_FILE_SIZE_LIMIT = 1000 * 1024;
export const PHOTO_FILE_SIZE_LIMIT = 1000 * 1024;

//Prepare nodemailer using sendgrid. I signed up for one. 
//See https://nodemailer.com/smtp/; https://nodemailer.com/smtp/#authentication
/* sendGrid account not active. Using Gmail instead. See below.*/
const nodemailerOptions = {
    pool: true,
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {//I generated these with my free account
        user: "",
        pass: ""
    },
    logger: true,
    //debug: true

}
export const smtpTransport: Mail = nodemailer.createTransport(nodemailerOptions);

/**
 * Settings for Gmail as SMTP server
 */
const nodemailerOptionsGmail = {
    service: 'gmail',
    auth: {
        user: process.env.SMTPUSER,
        pass: process.env.SMTPPWORD
    }
}

export const smtpTransportGmail: Mail = nodemailer.createTransport(nodemailerOptionsGmail);


export const resetPasswordMailOptionSettings = {
    textTemplate: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    {url}
    If you did not request this, please ignore this email and your password will remain unchanged.\n\n`,
    //replyAddress: "noreply@pau.edu.ng",
    subject: "Reset Password - piosystems.com",
    from: "noreply@piosystems.com"

}

export const confirmEmailMailOptionSettings = {
    textTemplate: `You are receiving this because the email address associated with your account requires confirmation.\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    {url}`,
    subject: "Confirm Email - piosystems.com",
    from: "noreply@piosystems.com"

}

export const APP_NAME: string = "Tenant Manager";

export const APP_DESCRIPTION: string = "This app is designed by Pius Onobhayedo for the management of tenants for any Web-based multitenant application";

export const API_VERSION: string = "v1";

export const USE_API_VERSION_IN_URL: boolean = true;

export const AUTO_SEND_CONFIRM_EMAIL: boolean = true;


export enum TenantTeamRole {
    A = "admin",
    M = "marketing",
    C = "content-manager"
}

export enum TenantAccountOfficerRole {
    M = "manager",
    T = "tech-support"
}

export enum LandLordRoles { //better use this for creating roles, so as to ensure that the names are always the same
    Admin = 'admin_landlord',
    SuperAdmin = 'superadmin_landlord',
    User = 'user_landlord'
}

export enum TenantRoles { //better use this for creating roles, so as to ensure that the names are always the same
    Admin = 'admin',
    SuperAdmin = 'superadmin',
    User = 'user'
}

export const PROTOCOL: "https" | "http" = "http";


//For JWT
export const jwtConstants = {
    SECRET: process.env.SECRET_KEY,
    SECRET_KEY_EXPIRATION: parseInt(process.env.SECRET_KEY_EXPIRATION),//integer value is read as seconds. string value with no unit specified, is read as millisecs. See https://www.npmjs.com/package/jsonwebtoken for units
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    REFRESH_SECRET_KEY_EXPIRATION: process.env.REFRESH_SECRET_KEY_EXPIRATION

};

export const fbConstants = {
    APP_ID: process.env.APP_ID,
    APP_SECRET: process.env.APP_SECRET,
    CALLBACK_URL: API_VERSION !=''? `http://localhost:3003/${API_VERSION}/auth/facebook/redirect`: `http://localhost:3003/auth/facebook/redirect`,
    SCOPE:'email, user_gender, user_birthday, ', //see https://developers.facebook.com/docs/permissions/reference for possibilities
    PROFILE_FIELDS:['id', 'displayName', 'photos', 'emails', 'gender', 'name', 'profileUrl'],
    CREATE_USER_IF_NOT_EXISTS:  true
}