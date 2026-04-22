import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_INTEGRATIONS = [
  { featureName: 'Payment Processing', featureCategory: 'payments', description: 'Accept card payments in-store and online', thirdPartyName: 'Adyen', estimatedCost: '$0.10/txn + 0.3%', status: 'evaluating', priority: 'high', nativeAlternative: 'Basic Stripe Connector' },
  { featureName: 'Online Payment Gateway', featureCategory: 'payments', description: 'Web checkout payment processing', thirdPartyName: 'Stripe', estimatedCost: '2.9% + $0.30/txn', status: 'native_built', priority: 'high', nativeAlternative: 'Native Stripe PaymentConnector' },
  { featureName: 'Mobile Wallet — Apple', featureCategory: 'payments', description: 'Apple Pay tap-to-pay support', thirdPartyName: 'Apple Pay', estimatedCost: 'Free (via Stripe)', status: 'backlog', priority: 'medium', nativeAlternative: null },
  { featureName: 'Store Locator / Maps', featureCategory: 'location', description: 'Interactive store finder on ecom site', thirdPartyName: 'Google Maps', estimatedCost: '$7/1K requests', status: 'backlog', priority: 'low', nativeAlternative: 'Static address display' },
  { featureName: 'CDN & Edge Security', featureCategory: 'infrastructure', description: 'Global CDN, DDoS protection, WAF', thirdPartyName: 'Cloudflare', estimatedCost: '$20/mo (Pro)', status: 'evaluating', priority: 'high', nativeAlternative: null },
  { featureName: 'Transactional Email', featureCategory: 'email', description: 'High-volume transactional email delivery', thirdPartyName: 'SendGrid', estimatedCost: '$19.95/mo (50K emails)', status: 'backlog', priority: 'high', nativeAlternative: 'Native SMTP Profile' },
  { featureName: 'SMS Notifications', featureCategory: 'messaging', description: 'Order alerts, loyalty texts, 2FA', thirdPartyName: 'Twilio', estimatedCost: '$0.0079/SMS', status: 'backlog', priority: 'medium', nativeAlternative: null },
  { featureName: 'Push Notifications', featureCategory: 'messaging', description: 'Mobile + web push for promotions', thirdPartyName: 'Firebase', estimatedCost: 'Free tier available', status: 'backlog', priority: 'low', nativeAlternative: null },
  { featureName: 'Shipping & Label Print', featureCategory: 'fulfillment', description: 'Multi-carrier shipping rates + labels', thirdPartyName: 'EasyPost', estimatedCost: 'Carrier rates + $0.01/label', status: 'backlog', priority: 'medium', nativeAlternative: null },
  { featureName: 'Tax Calculation', featureCategory: 'tax', description: 'Automated sales tax compliance', thirdPartyName: 'Avalara', estimatedCost: '$50/mo+', status: 'backlog', priority: 'high', nativeAlternative: 'Manual tax rates' },
  { featureName: 'Fraud Detection', featureCategory: 'security', description: 'ML-based fraud scoring on orders', thirdPartyName: 'Stripe Radar', estimatedCost: '$0.05/screened', status: 'evaluating', priority: 'high', nativeAlternative: null },
  { featureName: 'Product Recommendations', featureCategory: 'ai', description: 'AI-personalized product suggestions', thirdPartyName: 'Azure Personalizer', estimatedCost: '$1/1K calls', status: 'backlog', priority: 'medium', nativeAlternative: 'Manual featured products' },
  { featureName: 'CRM Integration', featureCategory: 'crm', description: 'Sync customers to D365 Customer Insights', thirdPartyName: 'Dynamics 365 CI', estimatedCost: '$1,500/mo', status: 'native_built', priority: 'high', nativeAlternative: 'Native CRM module' },
  { featureName: 'Team Collaboration', featureCategory: 'productivity', description: 'Order alerts and team chat', thirdPartyName: 'Teams', estimatedCost: '$6/user/mo', status: 'backlog', priority: 'low', nativeAlternative: 'Native notification center' },
  { featureName: 'Customer Identity', featureCategory: 'auth', description: 'Social login + MFA for B2C customers', thirdPartyName: 'Azure AD B2C', estimatedCost: '$0.0033/MAU', status: 'evaluating', priority: 'medium', nativeAlternative: 'Email/password only' },
  { featureName: 'Content Moderation', featureCategory: 'ai', description: 'AI review moderation for user content', thirdPartyName: 'Azure Content Safety', estimatedCost: '$1/1K calls', status: 'backlog', priority: 'low', nativeAlternative: null },
]

export async function GET() {
  const existing = await prisma.integrationPartner.count()
  if (existing === 0) {
    await prisma.integrationPartner.createMany({ data: SEED_INTEGRATIONS })
  }
  const partners = await prisma.integrationPartner.findMany({ orderBy: { featureCategory: 'asc' } })
  return NextResponse.json(partners)
}

export async function POST(req: Request) {
  const body = await req.json()
  const partner = await prisma.integrationPartner.create({ data: body })
  return NextResponse.json(partner, { status: 201 })
}
