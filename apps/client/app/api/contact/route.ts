import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { Resend } from 'resend';
import axios from 'axios';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const DepartmentEnum = {
  sales: 'sales',
  support: 'support',
  technical: 'technical',
  billing: 'billing',
  partnership: 'partnership',
  general: 'general',
} as const;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\u00C0-\u017F'-]+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .refine((email) => {
      const domain = email.split('@')[1];
      return domain && domain.length > 1 && !domain.includes('..');
    }, 'Invalid email format'),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return /^[\+]?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
    }, 'Please enter a valid phone number'),
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),
  department: z.enum(Object.keys(DepartmentEnum) as [keyof typeof DepartmentEnum])
    .optional()
    .default('general'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must not exceed 2000 characters')
    .refine((msg) => {
      // Check for minimum meaningful content
      const words = msg.trim().split(/\s+/);
      return words.length >= 3;
    }, 'Message must contain at least 3 words'),
  consent: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  marketingConsent: z.boolean().optional().default(false),
  recaptchaToken: z.string().optional(),
  timestamp: z.string().datetime('Invalid timestamp format'),
  userAgent: z.string().max(500, 'User agent string too long'),
  source: z.string().max(100, 'Source field too long').optional()
});

// Rate limiting - simple in-memory store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5; // 5 requests per hour
  const windowMs = 60 * 60 * 1000; // 1 hour

  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token || !process.env.RECAPTCHA_SECRET_KEY) {
    return true; // Skip verification if no token or secret key
  }

  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token
    });

    return response.data.success && response.data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

async function sendEmail(data: any) {
  // Send email using Resend
  const emailData = {
    from: 'noreply@seoanalyzer.com',
    to: 'support@seoanalyzer.com',
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Department:</strong> ${data.department || 'General'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
      <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
    `
  };

  try {
    const response = await resend.emails.send(emailData);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email with Resend:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Verify reCAPTCHA if token is provided
    if (validatedData.recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
      if (!recaptchaValid) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    // Check for suspicious patterns (basic spam detection)
    const suspiciousPatterns = [
      /viagra|cialis|pharmacy/i,
      /\b(SEO|backlink|link building)\s+service\b/i,
      /click here|visit now/i,
      /http[s]?:\/\//g // Multiple URLs
    ];

    const messageText = `${validatedData.name} ${validatedData.email} ${validatedData.message}`;
    const isSuspicious = suspiciousPatterns.some(pattern => {
      const matches = messageText.match(pattern);
      return matches && matches.length > 2; // Allow some mentions but flag excessive ones
    });

    if (isSuspicious) {
      console.log('Suspicious submission detected:', { ip, data: validatedData });
      // Still return success to avoid revealing spam detection
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Send email notification
    await sendEmail(validatedData);

    // In production, you might also want to:
    // 1. Store the submission in a database
    // 2. Send auto-reply email to the user
    // 3. Create a ticket in your support system
    // 4. Send notification to Slack/Discord

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: z.core.$ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }


    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
