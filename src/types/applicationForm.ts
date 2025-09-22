export type ApplicationFieldType = 
  | 'shortText' 
  | 'longText' 
  | 'singleSelect' 
  | 'multiSelect' 
  | 'socialMedia';

export interface ApplicationField {
  id: string;
  type: ApplicationFieldType;
  label: string;
  required: boolean;
  options?: string[]; // For select fields
  appliesTo: 'all' | string[]; // 'all' or array of tier IDs
  placeholder?: string;
  socialNetworks?: {
    linkedin: boolean;
    instagram: boolean;
    x: boolean;
  }; // For social media fields
}

export interface ApplicationForm {
  fields: ApplicationField[];
}

export interface TicketTierWithApplication {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface TicketsBlockData {
  tiers: TicketTierWithApplication[];
  applicationForm: ApplicationForm;
}

export const defaultRequiredFields: ApplicationField[] = [
  {
    id: 'fullName',
    type: 'shortText',
    label: 'Full Name',
    required: true,
    appliesTo: 'all',
    placeholder: 'Enter your full name'
  },
  {
    id: 'email',
    type: 'shortText',
    label: 'Email',
    required: true,
    appliesTo: 'all',
    placeholder: 'Enter your email address'
  }
];