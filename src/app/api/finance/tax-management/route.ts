export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const TAX_CODES = [
  { code:'SALES_TAX_IL', description:'Illinois Sales Tax',  taxType:'Sales',   rate:6.25, authority:'IL Dept Revenue',  effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'COOK_CO_TAX',  description:'Cook County Tax',      taxType:'Sales',   rate:1.75, authority:'Cook County',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'CHICAGO_CITY', description:'Chicago City Tax',     taxType:'Sales',   rate:0.25, authority:'Chicago City',      effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'NY_STATE_TAX', description:'New York State',       taxType:'Sales',   rate:4.00, authority:'NY Dept Tax',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'NY_CITY_TAX',  description:'New York City',        taxType:'Sales',   rate:4.50, authority:'NYC Dept Finance',  effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'IL_FOOD_TAX',  description:'Illinois Food Tax',    taxType:'Reduced', rate:1.00, authority:'IL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'USE_TAX_IL',   description:'Illinois Use Tax',     taxType:'Use',     rate:6.25, authority:'IL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'EXEMPT',       description:'Tax Exempt',           taxType:'Exempt',  rate:0.00, authority:'N/A',               effectiveFrom:'Jan 1, 2020', effectiveTo:'—',             active:true  },
  { code:'CA_STATE_TAX', description:'California State Tax', taxType:'Sales',   rate:7.25, authority:'CA Dept Tax',       effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'LA_COUNTY_TAX',description:'Los Angeles County',   taxType:'Sales',   rate:2.25, authority:'LA County',         effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'TX_STATE_TAX', description:'Texas State Tax',      taxType:'Sales',   rate:6.25, authority:'TX Comptroller',    effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'TX_LOCAL_TAX', description:'Texas Local Tax',      taxType:'Sales',   rate:2.00, authority:'TX City',           effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'FL_STATE_TAX', description:'Florida State Tax',    taxType:'Sales',   rate:6.00, authority:'FL Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'FL_COUNTY_TAX',description:'Florida County Tax',   taxType:'Sales',   rate:1.00, authority:'FL County',         effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:true  },
  { code:'WA_STATE_TAX', description:'Washington State Tax', taxType:'Sales',   rate:6.50, authority:'WA Dept Revenue',   effectiveFrom:'Jan 1, 2026', effectiveTo:'Dec 31, 2026', active:false },
]

const TAX_GROUPS = [
  { group:'CHICAGO_METRO', description:'Chicago Metropolitan',  codes:['SALES_TAX_IL','COOK_CO_TAX','CHICAGO_CITY'], effectiveRate:8.25, states:'IL' },
  { group:'NEW_YORK_CITY', description:'New York City',          codes:['NY_STATE_TAX','NY_CITY_TAX'],                effectiveRate:8.50, states:'NY' },
  { group:'STANDARD',      description:'Standard (default)',     codes:['SALES_TAX_IL'],                              effectiveRate:6.25, states:'IL' },
  { group:'FOOD_REDUCED',  description:'Food Items',             codes:['IL_FOOD_TAX'],                               effectiveRate:1.00, states:'IL' },
  { group:'CALIFORNIA',    description:'California Standard',    codes:['CA_STATE_TAX','LA_COUNTY_TAX'],              effectiveRate:9.50, states:'CA' },
  { group:'TEXAS_STD',     description:'Texas Standard',         codes:['TX_STATE_TAX','TX_LOCAL_TAX'],               effectiveRate:8.25, states:'TX' },
]

export async function GET() {
  return NextResponse.json({ taxCodes: TAX_CODES, taxGroups: TAX_GROUPS })
}
