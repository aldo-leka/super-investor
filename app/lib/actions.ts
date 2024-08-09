'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signIn('credentials', { email, password, redirectTo: '/' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logOut() {
  await signOut();
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email=${email}`;
    if (existingUser.rows.length > 0) {
      return 'User with this email already exists.';
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const user = await sql`
      INSERT INTO users (first_name, last_name, email, password, email_verified, verification_token)
      VALUES (${first_name}, ${last_name}, ${email}, ${hashedPassword}, false, ${verificationToken})
      RETURNING id, email
    `;

    const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    const { data, error } = await resend.emails.send({
      from: 'Super Investor <support@getsuperinvestor.com>',
      to: email,
      subject: 'Super Investor - Please activate your account',
      html: `
        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
          <h1>Welcome to Super Investor!</h1>
          <p>Super Investor is your modern platform for SEC filings research. Please activate your account below to access the following features and more:</p>
          <ul>
            <li><strong>Take Notes:</strong> Conveniently take notes on each filing, making it easier to keep track of important details.</li>
            <li><strong>Easy Lookup:</strong> Our platform makes it super convenient and simple to look up filings, saving you time and effort.</li>
          </ul>
          <p>
            <a href='${confirmationLink}' style='display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;'>Activate Account</a>
          </p>
          <p>If you have any questions, please reach out to <a href='mailto:support@getsuperinvestor.com'>support@getsuperinvestor.com</a>.</p>
        </div>
      `
    });

    console.log('resend response', data, error);

    return 'Registration successful. Please check your email to verify your account.';
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong.';
  }
}

export async function updateUserProfile(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;

    // Check if user exists
    const existingUser = await sql`SELECT * FROM users WHERE email=${email}`;
    if (existingUser.rows.length === 0) {
      return 'User not found.';
    }

    // Update user profile
    await sql`
      UPDATE users
      SET first_name = ${first_name}, last_name = ${last_name}, email = ${email}
      WHERE email = ${email}
    `;

    return 'Profile updated successfully.';
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong.';
  }
}