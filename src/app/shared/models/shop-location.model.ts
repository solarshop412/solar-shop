export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  phoneLink: string;
  mobile?: string;
  email?: string;
  workingHours: string;
  latitude: number;
  longitude: number;
  isFranchise: boolean;
  mapRedirect: string;
}