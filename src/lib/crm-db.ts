import { prisma } from '@/lib/prisma'

export async function initCrmTables() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCContact" (
      id TEXT PRIMARY KEY,
      contactNo TEXT UNIQUE,
      name TEXT NOT NULL,
      contactType TEXT DEFAULT 'Company',
      companyName TEXT,
      phone TEXT,
      email TEXT,
      salesperson TEXT,
      territory TEXT,
      lastModified DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCInteraction" (
      id TEXT PRIMARY KEY,
      entryNo INTEGER,
      interactionDate TEXT,
      contactId TEXT,
      template TEXT,
      description TEXT,
      cost REAL DEFAULT 0,
      duration INTEGER DEFAULT 0,
      initiatedBy TEXT DEFAULT 'Us',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCOpportunity" (
      id TEXT PRIMARY KEY,
      opportunityNo TEXT UNIQUE,
      description TEXT,
      contactId TEXT,
      salesperson TEXT,
      status TEXT DEFAULT 'Open',
      stage TEXT,
      probability REAL DEFAULT 0,
      estimatedValue REAL DEFAULT 0,
      closeDate TEXT,
      campaignId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCCampaign" (
      id TEXT PRIMARY KEY,
      campaignNo TEXT UNIQUE,
      description TEXT,
      startingDate TEXT,
      endingDate TEXT,
      statusCode TEXT DEFAULT 'Active',
      salesperson TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCSegment" (
      id TEXT PRIMARY KEY,
      segmentNo TEXT UNIQUE,
      description TEXT,
      salesperson TEXT,
      segmentDate TEXT,
      campaignId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCCrmTask" (
      id TEXT PRIMARY KEY,
      taskNo TEXT UNIQUE,
      description TEXT,
      taskType TEXT DEFAULT 'Phone Call',
      contactId TEXT,
      taskDate TEXT,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Normal',
      salesperson TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "BCSegmentContact" (
      id TEXT PRIMARY KEY,
      segmentId TEXT NOT NULL,
      contactId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
}

export function cuid() {
  return 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}
