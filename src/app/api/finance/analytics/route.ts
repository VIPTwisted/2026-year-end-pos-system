import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = {
    kpis: {
      customersPastDue: 60,
      customersBalanceDue: 9970000,
      customersOverCreditLimit: 386110,
    },
    agedBalances: [
      { label: 'Current',       value: 1100000, color: '#1e2a4a' },
      { label: '60 days',       value: 2400000, color: '#0d9488' },
      { label: '90 days',       value: 3150000, color: '#d97706' },
      { label: '180 and over',  value: 1500000, color: '#db2777' },
    ],
    topProductsByRevenue: [
      { name: 'High end',     highEnd: 2700000000, accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 0         },
      { name: 'Car Audio',    highEnd: 0,          accessories: 420000000, autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 0         },
      { name: 'MultiDesign',  highEnd: 0,          accessories: 0,         autoAudio: 390000000, autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 0         },
      { name: 'Projectors 1', highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 410000000, parts: 0,       speakers: 0,        salamanca: 0         },
      { name: 'Speakers 1',   highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 380000000, speakers: 0,        salamanca: 0         },
      { name: 'Standard',     highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 360000000, salamanca: 0        },
      { name: 'Speakers 2',   highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 340000000, salamanca: 0        },
      { name: 'Salamanca S',  highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 420000000 },
      { name: 'Salamanca 2',  highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 400000000 },
      { name: 'Salamanca 1',  highEnd: 0,          accessories: 0,         autoAudio: 0,         autoSpeakers: 0,       parts: 0,         speakers: 0,        salamanca: 380000000 },
    ],
    bankBalances: [
      { company: 'demf', account: 'DEMF-OPER', currency: 'EUR', actualBalance: 433708.30, systemBalance: 433708.30, usdBalance: 472100.50 },
      { company: 'demf', account: 'DEMF-USD',  currency: 'USD', actualBalance: 316607.06, systemBalance: 316607.06, usdBalance: 316607.06 },
      { company: 'usmf', account: 'USMF-EUR',  currency: 'EUR', actualBalance: 221450.00, systemBalance: 221450.00, usdBalance: 240575.25 },
      { company: 'usmf', account: 'USMF-OPER', currency: 'USD', actualBalance: 1842300.00, systemBalance: 1842300.00, usdBalance: 1842300.00 },
      { company: 'usmf', account: 'USMF-PAYR', currency: 'USD', actualBalance: 587200.00, systemBalance: 587200.00, usdBalance: 587200.00 },
      { company: 'usrt', account: 'USRT-EUR',  currency: 'EUR', actualBalance: 98600.00,  systemBalance: 98600.00,  usdBalance: 107100.40 },
      { company: 'usrt', account: 'USRT-OPER', currency: 'USD', actualBalance: 634800.00, systemBalance: 634800.00, usdBalance: 634800.00 },
      { company: 'usrt', account: 'USRT-PAYR', currency: 'USD', actualBalance: 215400.00, systemBalance: 215400.00, usdBalance: 215400.00 },
    ],
    topCustomersByRevenue: [
      { name: 'Fabrikam India Ltd',          main: 420000000, other: 80000000,  retail: 60000000,  wholesale: 90000000,  demand: 40000000  },
      { name: 'Fourth Coffee Inc',           main: 380000000, other: 70000000,  retail: 50000000,  wholesale: 110000000, demand: 35000000  },
      { name: 'Talipac Tour India',          main: 290000000, other: 60000000,  retail: 80000000,  wholesale: 70000000,  demand: 25000000  },
      { name: 'Wide World India',            main: 950000000, other: 120000000, retail: 90000000,  wholesale: 150000000, demand: 80000000  },
      { name: 'Wingsto Shopping',            main: 310000000, other: 55000000,  retail: 95000000,  wholesale: 65000000,  demand: 30000000  },
      { name: 'Demand Distribut',            main: 260000000, other: 40000000,  retail: 30000000,  wholesale: 50000000,  demand: 180000000 },
      { name: 'Northeast Distribut',         main: 340000000, other: 90000000,  retail: 45000000,  wholesale: 120000000, demand: 60000000  },
      { name: 'Orchid Wholesale',            main: 280000000, other: 50000000,  retail: 35000000,  wholesale: 200000000, demand: 28000000  },
      { name: 'Contoso Americas',            main: 430000000, other: 110000000, retail: 70000000,  wholesale: 130000000, demand: 55000000  },
      { name: 'Oak Company',                 main: 190000000, other: 30000000,  retail: 25000000,  wholesale: 45000000,  demand: 20000000  },
    ],
    purchasesByMonth: {
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      series: [
        { name: 'DEMF',  color: '#4f46e5', values: [12,15,18,14,20,22,35,42,55,48,38,30] },
        { name: 'USMF',  color: '#06b6d4', values: [20,25,28,22,30,35,60,75,80,70,55,45] },
        { name: 'USRT',  color: '#10b981', values: [8,10,12,9,14,18,25,30,28,22,18,15]   },
        { name: 'GBSI',  color: '#f59e0b', values: [5,7,9,6,10,12,18,20,22,19,14,11]     },
        { name: 'FRSI',  color: '#ef4444', values: [3,4,5,4,6,8,12,15,18,14,10,8]        },
        { name: 'JPMF',  color: '#8b5cf6', values: [6,8,10,7,12,14,20,24,26,21,16,13]    },
        { name: 'MXMF',  color: '#ec4899', values: [4,5,6,4,7,9,13,16,19,15,11,9]        },
        { name: 'BRMF',  color: '#14b8a6', values: [2,3,4,3,5,6,9,11,13,10,8,6]          },
        { name: 'INMF',  color: '#f97316', values: [7,9,11,8,13,15,22,27,30,25,19,15]    },
        { name: 'CNMF',  color: '#a855f7', values: [9,11,14,10,16,18,27,32,35,29,22,18]  },
        { name: 'AUMF',  color: '#22d3ee', values: [3,4,5,3,5,7,10,12,14,11,9,7]         },
        { name: 'CAMF',  color: '#fb923c', values: [4,5,7,5,8,10,14,17,20,16,12,10]      },
        { name: 'ITMF',  color: '#a3e635', values: [2,3,4,3,5,6,8,10,12,9,7,5]           },
        { name: 'ESMF',  color: '#34d399', values: [2,2,3,2,4,5,7,9,10,8,6,5]            },
        { name: 'SEMF',  color: '#60a5fa', values: [1,2,3,2,3,4,6,8,9,7,5,4]             },
        { name: 'NLMF',  color: '#f472b6', values: [2,2,3,2,3,4,6,7,8,7,5,4]             },
        { name: 'BEMF',  color: '#818cf8', values: [1,2,2,1,3,3,5,6,7,6,4,3]             },
      ],
    },
  }

  return NextResponse.json(data)
}
