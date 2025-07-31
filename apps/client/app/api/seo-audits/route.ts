import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authUtils';

// GET /api/seo-audits - Fetch SEO audits for the current user
export async function GET(request) {
  const authResult = await getAuthenticatedUser(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const audits = await prisma.seoAudit.findMany({
      where: {
        page: {
          crawlJob: {
            project: {
              userId: authResult.user.id,
            },
          },
        },
      },
      include: {
        page: true,
      },
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Error fetching SEO audits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

