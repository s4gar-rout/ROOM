export type Rental = {
  id: string;
  title: string;
  location: string;
  area: string;
  rent: number;
  deposit: number;
  propertyType: "Room" | "PG" | "1BHK" | "2BHK";
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished";
  availableFrom: string;
  image?: string;
};