import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected.' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'traffic'; // 'traffic', 'channels', 'content', 'locations', 'devices', 'insights'

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const propertyId = settings?.googleAnalyticsPropertyId;

  if (!propertyId) {
    return NextResponse.json({ error: 'Google Analytics Property ID not configured.' }, { status: 400 });
  }

  try {
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
    
    if (type === 'traffic') {
      // Traffic over last 28 days
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        }
      });
      return NextResponse.json(response.data);
    } 
    else if (type === 'channels') {
      // Channels (Organic, Direct, etc.)
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'activeUsers' }]
        }
      });
      return NextResponse.json(response.data);
    }
    else if (type === 'locations') {
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }]
        }
      });
      return NextResponse.json(response.data);
    }
    else if (type === 'devices') {
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }]
        }
      });
      return NextResponse.json(response.data);
    }
    else if (type === 'content') {
      // Top content
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'engagementRate' }, { name: 'averageSessionDuration' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: '10'
        }
      });
      return NextResponse.json(response.data);
    }
    else if (type === 'insights') {
      // New vs Returning, and Engagement
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'newVsReturning' }],
          metrics: [{ name: 'activeUsers' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }]
        }
      });
      return NextResponse.json(response.data);
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (err: any) {
    console.error('Analytics Data API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch Analytics report' }, { status: 500 });
  }
}
