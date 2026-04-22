import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VEHICLES = [
  { id: 'veh-001', vehicleId: 'VEH-0001', makeModel: 'Ford Transit 250', year: 2022, licensePlate: 'NVP-1042', assignedDriver: 'Marcus Webb', mileage: 34820, lastService: '2026-02-15', nextService: '2026-05-15', status: 'In Use', location: 'Downtown Hub' },
  { id: 'veh-002', vehicleId: 'VEH-0002', makeModel: 'Chevrolet Silverado', year: 2021, licensePlate: 'NVP-2087', assignedDriver: 'Lena Kovacs', mileage: 52140, lastService: '2026-01-20', nextService: '2026-04-20', status: 'Maintenance', location: 'Service Center' },
  { id: 'veh-003', vehicleId: 'VEH-0003', makeModel: 'Mercedes Sprinter', year: 2023, licensePlate: 'NVP-3301', assignedDriver: 'Unassigned', mileage: 18600, lastService: '2026-03-10', nextService: '2026-09-10', status: 'Available', location: 'Main Depot' },
  { id: 'veh-004', vehicleId: 'VEH-0004', makeModel: 'Toyota Tundra', year: 2020, licensePlate: 'NVP-4455', assignedDriver: 'Carlos Ruiz', mileage: 71230, lastService: '2025-12-01', nextService: '2026-03-01', status: 'Maintenance', location: 'Service Center' },
  { id: 'veh-005', vehicleId: 'VEH-0005', makeModel: 'Ford F-150', year: 2023, licensePlate: 'NVP-5512', assignedDriver: 'Priya Singh', mileage: 12400, lastService: '2026-03-28', nextService: '2026-09-28', status: 'In Use', location: 'North Warehouse' },
  { id: 'veh-006', vehicleId: 'VEH-0006', makeModel: 'Dodge Ram 1500', year: 2019, licensePlate: 'NVP-6673', assignedDriver: 'Unassigned', mileage: 98340, lastService: '2025-11-15', nextService: '2026-02-15', status: 'Out of Service', location: 'Main Depot' },
  { id: 'veh-007', vehicleId: 'VEH-0007', makeModel: 'Isuzu NPR', year: 2022, licensePlate: 'NVP-7789', assignedDriver: 'James Okafor', mileage: 29700, lastService: '2026-02-28', nextService: '2026-08-28', status: 'Available', location: 'East Distribution' },
  { id: 'veh-008', vehicleId: 'VEH-0008', makeModel: 'GMC Savana', year: 2021, licensePlate: 'NVP-8834', assignedDriver: 'Unassigned', mileage: 44510, lastService: '2026-01-05', nextService: '2026-07-05', status: 'In Use', location: 'Airport Logistics' },
]

const MAINTENANCE = [
  { vehicleId: 'VEH-0002', vehicle: 'Chevrolet Silverado', serviceType: 'Oil Change + Filter', dueDate: '2026-04-20', estimatedCost: 180, assignedMechanic: 'Ray Dominguez' },
  { vehicleId: 'VEH-0004', vehicle: 'Toyota Tundra', serviceType: 'Full Brake Service', dueDate: '2026-03-01', estimatedCost: 850, assignedMechanic: 'Ray Dominguez' },
  { vehicleId: 'VEH-0006', vehicle: 'Dodge Ram 1500', serviceType: 'Transmission Rebuild', dueDate: '2026-02-15', estimatedCost: 3200, assignedMechanic: 'Tom Greer' },
  { vehicleId: 'VEH-0001', vehicle: 'Ford Transit 250', serviceType: '30K Mile Service', dueDate: '2026-05-15', estimatedCost: 420, assignedMechanic: 'Unassigned' },
  { vehicleId: 'VEH-0008', vehicle: 'GMC Savana', serviceType: 'Tire Rotation + Alignment', dueDate: '2026-07-05', estimatedCost: 220, assignedMechanic: 'Unassigned' },
]

export async function GET() {
  const avgMileage = Math.round(VEHICLES.reduce((s, v) => s + v.mileage, 0) / VEHICLES.length)
  return NextResponse.json({ vehicles: VEHICLES, maintenance: MAINTENANCE, avgMileage })
}
