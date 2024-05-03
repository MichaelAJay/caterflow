export type EzCaterAddress = {
  city: string;
  deliveryInstructions: string | null;
  name: string; // May be ""
  state: string;
  stateName: string;
  street: string | null;
  street2: string | null;
  street3: string | null;
  zip: string;
};
