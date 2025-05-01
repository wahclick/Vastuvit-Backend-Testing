export class CompleteProfileDto {
    mobile: string; // Used to find the manager
    name: string;
    password: string;
    address: string;
    profileImage?: string;
    firmDetails: {
      firmName: string;
      address: {
        buildingNumber: string;
        streetArea: string;
        landmark: string;
        city: string;
        state: string;
        country: string;
      };
      numberOfEmployees: string;
      logo?: string;
    };
  }