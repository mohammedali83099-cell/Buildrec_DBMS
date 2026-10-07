export interface Project {
  Project_ID: number;
  Project_Name: string;
  Budget?: number;
  Status?: string;
}

export interface Site {
  Site_ID: number;
  Project_ID: number;
  Site_Name: string;
  Location?: string;
  Project_Name?: string;
}

export interface Contractor {
  Contractor_ID: number;
  Contractor_Name: string;
  Contact_Info?: string;
}

export interface WorkPackage {
  Work_Package_ID: number;
  Site_ID: number;
  Contractor_ID: number;
  Work_Package_Name: string;
  Verified_Quantity: number;
  Site_Name?: string;
  Contractor_Name?: string;
  Current_Progress?: number;
  // Aliases for UI flexibility
  Package_ID?: number;
  Package_Name?: string;
}

export interface Material {
  Material_ID: number;
  Material_Name: string;
  Unit_Of_Measure?: string;
  Unit?: string;
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
  Expected_Delivery_Date?: string;
  Supplier_Name?: string;
}

export interface Delivery {
  Delivery_ID: number;
  PO_ID: number;
  Site_ID: number;
  Delivery_Date: string;
  Site_Name?: string;
  Order_Date?: string;
  Supplier_Name?: string;
  Challan_No?: string;
  Received_By?: string;
}

export interface DeliveryItem {
  Delivery_Item_ID: number;
  Delivery_ID: number;
  Material_ID: number;
  Quantity_Delivered: number;
  Unit_Price?: number;
  Material_Name?: string;
  Delivery_Date?: string;
  Site_ID?: number;
  Delivered_Quantity?: number;
  Inspected_Status?: string;
  Unit?: string;
}

export interface SiteStock {
  Stock_ID: number;
  Site_ID: number;
  Material_ID: number;
  Quantity_Available: number;
  Site_Name?: string;
  Material_Name?: string;
  Unit_Of_Measure?: string;
  Current_Stock?: number;
  Unit?: string;
}

export interface Issue {
  Issue_ID: number;
  Stock_ID: number;
  Work_Package_ID: number;
  Quantity_Issued: number;
  Issue_Date?: string;
  Site_Name?: string;
  Material_Name?: string;
  Work_Package_Name?: string;
  Issued_Quantity?: number;
  Package_ID?: number;
  Package_Name?: string;
  Unit?: string;
}

export interface LabourTeam {
  Labour_Team_ID: number;
  Team_Name: string;
  Team_ID?: number;
  Team_Leader?: string;
  Number_Of_Workers?: number;
  Site_ID?: number;
}

export interface ProgressEntry {
  Progress_ID: number;
  Work_Package_ID: number;
  Labour_Team_ID: number;
  Percent_Complete: number;
  Progress_Date: string;
  Work_Package_Name?: string;
  Team_Name?: string;
  Package_ID?: number;
  Progress_Percentage?: number;
  Recorded_Date?: string;
  Package_Name?: string;
}

export interface Bill {
  Bill_ID: number;
  Work_Package_ID: number;
  Billed_Quantity: number;
  Bill_Amount: number;
  Bill_Date?: string;
  Status?: string;
  Work_Package_Name?: string;
  Verified_Quantity?: number;
  Contractor_Name?: string;
  Total_Paid?: number;
  Paid_Amount?: number;
  Balance_Due?: number;
  Package_ID?: number;
  Package_Name?: string;
}

export interface Payment {
  Payment_ID: number;
  Bill_ID: number;
  Amount_Paid: number;
  Payment_Date: string;
  Bill_Amount?: number;
  Work_Package_Name?: string;
  Contractor_Name?: string;
  Payment_Amount?: number;
  Payment_Mode?: string;
  Package_Name?: string;
}

export interface DashboardSummary {
  projectCount: number;
  siteCount: number;
  contractorCount: number;
  workPackageCount: number;
  materialCount: number;
  totalStock: number;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  avgProgress: number;
  dbConnected: boolean;
}
