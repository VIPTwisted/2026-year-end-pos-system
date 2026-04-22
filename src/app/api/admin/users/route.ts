export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const USERS = [
  { id: 'admin',    username: 'admin',    fullName: 'System Administrator', email: 'admin@novapos.local',    company: 'USMF', role: 'System Admin',      lastLogin: 'Apr 22, 2026', status: 'Active'   },
  { id: 'alice.chen', username: 'alice.chen', fullName: 'Alice Chen',       email: 'alice.chen@novapos.local', company: 'USMF', role: 'Finance Manager',   lastLogin: 'Apr 22, 2026', status: 'Active'   },
  { id: 'bob.wilson', username: 'bob.wilson', fullName: 'Bob Wilson',       email: 'bob.wilson@novapos.local', company: 'USMF', role: 'Purchasing Agent',  lastLogin: 'Apr 21, 2026', status: 'Active'   },
  { id: 'carlos.m',  username: 'carlos.m',  fullName: 'Carlos Mendez',      email: 'carlos.m@novapos.local',  company: 'USRT', role: 'Sales Rep',         lastLogin: 'Apr 22, 2026', status: 'Active'   },
  { id: 'maria.s',   username: 'maria.s',   fullName: 'Maria Santos',       email: 'maria.s@novapos.local',   company: 'USMF', role: 'HR Manager',        lastLogin: 'Apr 20, 2026', status: 'Active'   },
  { id: 'david.k',   username: 'david.k',   fullName: 'David Kim',          email: 'david.kim@novapos.local', company: 'DEMF', role: 'Controller',        lastLogin: 'Apr 19, 2026', status: 'Active'   },
  { id: 'sarah.l',   username: 'sarah.l',   fullName: 'Sarah Lopez',        email: 'sarah.l@novapos.local',   company: 'GBSI', role: 'IT Admin',          lastLogin: 'Apr 15, 2026', status: 'Active'   },
  { id: 'old.user',  username: 'old.user',  fullName: 'Legacy Account',     email: 'old@test.com',            company: 'USMF', role: 'Read Only',         lastLogin: 'Jan 10, 2026', status: 'Inactive' },
  { id: 'james.t',   username: 'james.t',   fullName: 'James Taylor',       email: 'james.t@novapos.local',   company: 'USMF', role: 'Approver',          lastLogin: 'Apr 21, 2026', status: 'Active'   },
  { id: 'linda.r',   username: 'linda.r',   fullName: 'Linda Rivera',       email: 'linda.r@novapos.local',   company: 'USRT', role: 'Finance Manager',   lastLogin: 'Apr 18, 2026', status: 'Active'   },
  { id: 'kevin.p',   username: 'kevin.p',   fullName: 'Kevin Park',         email: 'kevin.p@novapos.local',   company: 'USMF', role: 'Warehouse Worker',  lastLogin: 'Apr 22, 2026', status: 'Active'   },
  { id: 'nina.b',    username: 'nina.b',    fullName: 'Nina Brown',         email: 'nina.b@novapos.local',    company: 'GBSI', role: 'Sales Rep',         lastLogin: 'Apr 17, 2026', status: 'Active'   },
  { id: 'omar.f',    username: 'omar.f',    fullName: 'Omar Farouq',        email: 'omar.f@novapos.local',    company: 'DEMF', role: 'Purchasing Agent',  lastLogin: 'Apr 16, 2026', status: 'Active'   },
  { id: 'priya.n',   username: 'priya.n',   fullName: 'Priya Nair',         email: 'priya.n@novapos.local',   company: 'USMF', role: 'HR Manager',        lastLogin: 'Apr 14, 2026', status: 'Active'   },
  { id: 'raj.k',     username: 'raj.k',     fullName: 'Raj Kumar',          email: 'raj.k@novapos.local',     company: 'USRT', role: 'IT Admin',          lastLogin: 'Apr 22, 2026', status: 'Active'   },
  { id: 'test.user', username: 'test.user', fullName: 'Test Account',       email: 'test@novapos.local',      company: 'USMF', role: 'Read Only',         lastLogin: 'Mar 01, 2026', status: 'Inactive' },
  { id: 'locked.u',  username: 'locked.u',  fullName: 'Locked User',        email: 'locked@novapos.local',    company: 'USMF', role: 'Purchasing Agent',  lastLogin: 'Apr 10, 2026', status: 'Locked'   },
  { id: 'grace.h',   username: 'grace.h',   fullName: 'Grace Huang',        email: 'grace.h@novapos.local',   company: 'GBSI', role: 'Controller',        lastLogin: 'Apr 20, 2026', status: 'Active'   },
  { id: 'marcus.j',  username: 'marcus.j',  fullName: 'Marcus Johnson',     email: 'marcus.j@novapos.local',  company: 'DEMF', role: 'Approver',          lastLogin: 'Apr 19, 2026', status: 'Active'   },
  { id: 'sophie.w',  username: 'sophie.w',  fullName: 'Sophie Weber',       email: 'sophie.w@novapos.local',  company: 'GBSI', role: 'Finance Manager',   lastLogin: 'Apr 21, 2026', status: 'Active'   },
]

const ROLES = [
  { name: 'System Admin',     description: 'Full system access',              usersCount: 1,  modules: 'All Modules'           },
  { name: 'Finance Manager',  description: 'Financial reporting and approval', usersCount: 3,  modules: 'Finance, GL, AP, AR'   },
  { name: 'Purchasing Agent', description: 'Purchase orders and vendors',      usersCount: 3,  modules: 'Procurement, Inventory' },
  { name: 'Sales Rep',        description: 'Sales orders and customers',       usersCount: 2,  modules: 'Sales, CRM'            },
  { name: 'HR Manager',       description: 'Human resources operations',       usersCount: 2,  modules: 'HR, Payroll'           },
  { name: 'Read Only',        description: 'View-only access to all modules',  usersCount: 2,  modules: 'All (read)'            },
  { name: 'Warehouse Worker', description: 'Inventory and warehouse ops',      usersCount: 1,  modules: 'Inventory, WMS'        },
  { name: 'Approver',         description: 'Workflow approval authority',      usersCount: 2,  modules: 'All (approve only)'   },
  { name: 'Controller',       description: 'Financial control and audit',      usersCount: 2,  modules: 'Finance, Audit, GL'    },
  { name: 'IT Admin',         description: 'System configuration and users',   usersCount: 2,  modules: 'Admin, Security'       },
]

export async function GET() {
  return NextResponse.json({ users: USERS, roles: ROLES })
}
