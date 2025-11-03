/**
 * ERP Unit ID to Store Name Mapping
 * Maps ERP unit IDs to their corresponding SolarShop store names
 */
export const ERP_UNIT_NAMES: Record<string, string> = {
  '01': 'SolarShop Buzin, Zagreb',
  '02': 'SolarShop Buzin, Zagreb',
  '03': 'SolarShop Središće, Zagreb',
  '04': 'SolarShop Split',
  '13': 'SolarShop Sesvete, Zagreb',
  '17': 'SolarShop Buzin, Zagreb',
  '21': 'SolarShop Zadar',
  '24': 'SolarShop Buzin, Zagreb',
  '28': 'SolarShop Rijeka',
  '30': 'SolarShop Jastrebarsko'
};

/**
 * Get the store name for a given unit ID
 * @param unitId - The ERP unit ID (e.g., '01', '28', etc.)
 * @param unitName - The ERP unit name (RADJEDNAZIV) as fallback
 * @returns The store name, or the unit name from ERP, or the unit ID
 */
export function getUnitName(unitId: string | undefined, unitName?: string): string {
  if (!unitId) return unitName || '';
  // Return mapped name if exists, otherwise return the unit name from ERP, or the unit ID
  return ERP_UNIT_NAMES[unitId] || unitName || unitId;
}
