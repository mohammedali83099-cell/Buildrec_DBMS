// Backend Domain Model & Entity Interfaces

export interface Project {
  Project_ID: number;
  Project_Name: string;
  Start_Date?: string;
  End_Date?: string;
  Site_Count?: number;
}

export interface Site {
  Site_ID: number;
  Project_ID: number;
  Site_Name: string;
  Location?: string;
}

export interface Material {
  Material_ID: number;
  Material_Name: string;
  Unit_Of_Measure?: string;
}

export interface Supplier {
  Supplier_ID: number;
  Supplier_Name: string;
  Contact_Info?: string;
}

export interface PurchaseOrder {
  PO_ID: number;
  Supplier_ID: number;
  Order_Date: string;
}

export interface Delivery {
  Delivery_ID: number;
  PO_ID: number;
  Site_ID: number;
  Delivery_Date: string;
}

export interface DeliveryItem {
  Delivery_Item_ID: number;
  Delivery_ID: number;
  Material_ID: number;
  Quantity_Delivered: number;
  Unit_Price?: number;
}

export interface SiteStock {
  Stock_ID: number;
  Site_ID: number;
  Material_ID: number;
  Quantity_Available: number;
}

export interface Contractor {
  Contractor_ID: number;
  Contractor_Name: string;
  Contact_Info?: string;
}

export interface LabourTeam {
  Labour_Team_ID: number;
  Team_Name: string;
}

export interface WorkPackage {
  Work_Package_ID: number;
  Site_ID: number;
  Contractor_ID: number;
  Work_Package_Name: string;
  Verified_Quantity: number;
}

export interface MaterialIssue {
  Issue_ID: number;
  Stock_ID: number;
  Work_Package_ID: number;
  Quantity_Issued: number;
  Issue_Date?: string;
}

export interface ProgressEntry {
  Progress_ID: number;
  Work_Package_ID: number;
  Labour_Team_ID: number;
  Percent_Complete: number;
  Progress_Date: string;
}

export interface ContractorBill {
  Bill_ID: number;
  Work_Package_ID: number;
  Billed_Quantity: number;
  Bill_Amount: number;
  Bill_Date?: string;
  Status?: string;
}

export interface Payment {
  Payment_ID: number;
  Bill_ID: number;
  Amount_Paid: number;
  Payment_Date: string;
}
