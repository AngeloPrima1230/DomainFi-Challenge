import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(ip: string, limit: number = 3, windowMs: number = 60000): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = ip;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

// Get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
}

// Validation function
function validateContactForm(data: { name: string; email: string; company?: string; message: string }) {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  // Sanitize data
  const sanitizedData = {
    name: data.name?.trim().substring(0, 100) || '',
    email: data.email?.trim().toLowerCase().substring(0, 100) || '',
    company: data.company?.trim().substring(0, 100) || '',
    message: data.message?.trim().substring(0, 2000) || ''
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : null
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, 3); // 3 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message: 'Rate limit exceeded. Please try again later.',
          reset: rateLimitResult.reset
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, company, message, recaptchaToken } = body;
    
    // Debug logging
    console.log('Received form data:', { name, email, company, message, hasRecaptchaToken: !!recaptchaToken });

    // Validate reCAPTCHA token (skip in development if not configured)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaToken && recaptchaSecret) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA with Google (only if configured)
    let recaptchaData = { success: true, score: 1.0 }; // Default for development
    
    if (recaptchaToken && recaptchaSecret) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: recaptchaToken
        })
      });

      recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return NextResponse.json(
          { message: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    } else {
      console.log('reCAPTCHA verification skipped (development mode)');
    }

    // Validate and sanitize form data
    const validation = validateContactForm({ name, email, company, message });
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return NextResponse.json(
        {
          message: 'Invalid form data',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { sanitizedData } = validation;
    if (!sanitizedData) {
      return NextResponse.json(
        { message: 'Validation failed' },
        { status: 500 }
      );
    }

    // Compose the Discord message with additional security info
    const content = [
      `**New Contact Form Submission**`,
      `**Name:** ${sanitizedData.name}`,
      `**Email:** ${sanitizedData.email}`,
      sanitizedData.company ? `**Company:** ${sanitizedData.company}` : '',
      `**Message:**\n${sanitizedData.message}`,
      `**Security Info:**`,
      `- IP: ${clientIP}`,
      `- reCAPTCHA Score: ${recaptchaData.score}`,
      `- Timestamp: ${new Date().toISOString()}`
    ].filter(Boolean).join('\n');

    // Send to Discord webhook with error handling
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
      } catch (webhookError) {
        console.error('Discord webhook error:', webhookError);
        // Don't fail the request if Discord is down, but log it
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not configured - message not sent to Discord');
    }

    // Log successful submission
    console.log(`Contact form submission from ${clientIP}: ${sanitizedData.email}`);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      rateLimit: {
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset
      }
    });

  } catch (error: any) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { message: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
