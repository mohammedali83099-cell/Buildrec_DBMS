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
  // Aliases for API compatibility
  Package_ID?: number;
  Package_Name?: string;
  Target_Start_Date?: string;
  Target_End_Date?: string;
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
}

export interface Delivery {
  Delivery_ID: number;
  PO_ID: number;
  Site_ID: number;
  Delivery_Date: string;
  Challan_No?: string;
  Received_By?: string;
}

export interface DeliveryItem {
  Delivery_Item_ID: number;
  Delivery_ID: number;
  Material_ID: number;
  Quantity_Delivered: number;
  Delivered_Quantity?: number;
  Unit_Price?: number;
  Inspected_Status?: string;
}

export interface SiteStock {
  Stock_ID: number;
  Site_ID: number;
  Material_ID: number;
  Quantity_Available: number;
  Current_Stock?: number;
}

export interface Issue {
  Issue_ID: number;
  Stock_ID: number;
  Work_Package_ID: number;
  Quantity_Issued: number;
  Issued_Quantity?: number;
  Issue_Date?: string;
  Site_ID?: number;
  Material_ID?: number;
  Package_ID?: number;
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
  Package_ID?: number;
  Progress_Percentage?: number;
  Recorded_Date?: string;
}

export interface Bill {
  Bill_ID: number;
  Work_Package_ID: number;
  Billed_Quantity: number;
  Bill_Amount: number;
  Bill_Date?: string;
  Status?: string;
  Package_ID?: number;
}

export interface Payment {
  Payment_ID: number;
  Bill_ID: number;
  Amount_Paid: number;
  Payment_Amount?: number;
  Payment_Date: string;
  Payment_Mode?: string;
}

export const initialProjects: Project[] = [
  { Project_ID: 101, Project_Name: 'Metro Rail Station', Budget: 45000000, Status: 'In Progress' },
  { Project_ID: 102, Project_Name: 'Green Valley Apartments', Budget: 32000000, Status: 'In Progress' },
  { Project_ID: 103, Project_Name: 'City Hospital Complex', Budget: 58000000, Status: 'In Progress' },
  { Project_ID: 104, Project_Name: 'Tech Park Phase 2', Budget: 40000000, Status: 'In Progress' },
  { Project_ID: 105, Project_Name: 'Riverfront Commercial Center', Budget: 65000000, Status: 'In Progress' },
  { Project_ID: 106, Project_Name: 'Airport Terminal Expansion', Budget: 85000000, Status: 'In Progress' },
  { Project_ID: 107, Project_Name: 'Smart City Housing', Budget: 38000000, Status: 'In Progress' },
  { Project_ID: 108, Project_Name: 'Industrial Park Development', Budget: 50000000, Status: 'In Progress' },
  { Project_ID: 109, Project_Name: 'University Campus Expansion', Budget: 42000000, Status: 'In Progress' },
  { Project_ID: 110, Project_Name: 'Central Water Treatment Plant', Budget: 30000000, Status: 'In Progress' },
  { Project_ID: 111, Project_Name: 'Sports Complex Development', Budget: 48000000, Status: 'In Progress' },
  { Project_ID: 112, Project_Name: 'Highway Flyover Package', Budget: 55000000, Status: 'In Progress' },
  { Project_ID: 113, Project_Name: 'Logistics Hub Project', Budget: 36000000, Status: 'In Progress' },
  { Project_ID: 114, Project_Name: 'Solar Manufacturing Facility', Budget: 44000000, Status: 'In Progress' },
  { Project_ID: 115, Project_Name: 'Urban Drainage Upgrade', Budget: 25000000, Status: 'In Progress' }
];

export const initialSites: Site[] = [
  { Site_ID: 201, Project_ID: 101, Site_Name: 'North Station Site', Location: 'Sector 14, Ring Road' },
  { Site_ID: 202, Project_ID: 101, Site_Name: 'South Station Site', Location: 'Central Plaza Terminal' },
  { Site_ID: 203, Project_ID: 102, Site_Name: 'Tower A Site', Location: 'Lake View Enclave, Block A' },
  { Site_ID: 204, Project_ID: 102, Site_Name: 'Tower B Site', Location: 'Lake View Enclave, Block B' },
  { Site_ID: 205, Project_ID: 103, Site_Name: 'Main Hospital Site', Location: 'Healthcare Boulevard, Ward 9' },
  { Site_ID: 206, Project_ID: 104, Site_Name: 'Tech Park Main Site', Location: 'IT Corridor, Plot 52' },
  { Site_ID: 207, Project_ID: 105, Site_Name: 'Commercial Block A', Location: 'Riverfront Promenade North' },
  { Site_ID: 208, Project_ID: 105, Site_Name: 'Commercial Block B', Location: 'Riverfront Promenade South' },
  { Site_ID: 209, Project_ID: 106, Site_Name: 'Terminal Expansion Zone', Location: 'International Airport Wing C' },
  { Site_ID: 210, Project_ID: 107, Site_Name: 'Housing Sector A', Location: 'Smart City Phase 1' },
  { Site_ID: 211, Project_ID: 107, Site_Name: 'Housing Sector B', Location: 'Smart City Phase 2' },
  { Site_ID: 212, Project_ID: 108, Site_Name: 'Industrial Zone A', Location: 'MIDC Heavy Industry Area' },
  { Site_ID: 213, Project_ID: 109, Site_Name: 'Academic Block Site', Location: 'University Campus West' },
  { Site_ID: 214, Project_ID: 109, Site_Name: 'Residential Campus Site', Location: 'University Campus East' },
  { Site_ID: 215, Project_ID: 110, Site_Name: 'Treatment Plant Site', Location: 'Reservoir Road North' },
  { Site_ID: 216, Project_ID: 111, Site_Name: 'Stadium Site', Location: 'Sports City Complex A' },
  { Site_ID: 217, Project_ID: 111, Site_Name: 'Indoor Arena Site', Location: 'Sports City Complex B' },
  { Site_ID: 218, Project_ID: 112, Site_Name: 'Flyover East Site', Location: 'Highway NH-44, Km 12' },
  { Site_ID: 219, Project_ID: 112, Site_Name: 'Flyover West Site', Location: 'Highway NH-44, Km 16' },
  { Site_ID: 220, Project_ID: 113, Site_Name: 'Warehouse Zone', Location: 'Logistics Park Gate 1' },
  { Site_ID: 221, Project_ID: 114, Site_Name: 'Manufacturing Plant Site', Location: 'Green Energy SEZ' },
  { Site_ID: 222, Project_ID: 115, Site_Name: 'Drainage Zone A', Location: 'Municipal Catchment Area A' },
  { Site_ID: 223, Project_ID: 115, Site_Name: 'Drainage Zone B', Location: 'Municipal Catchment Area B' },
  { Site_ID: 224, Project_ID: 108, Site_Name: 'Industrial Zone B', Location: 'MIDC Heavy Industry Area East' },
  { Site_ID: 225, Project_ID: 113, Site_Name: 'Logistics Office Site', Location: 'Logistics Park Gate 3' }
];

export const initialContractors: Contractor[] = [
  { Contractor_ID: 301, Contractor_Name: 'BuildRight Constructions', Contact_Info: '+91-9876543210, contact@buildright.in' },
  { Contractor_ID: 302, Contractor_Name: 'Apex Infrastructure', Contact_Info: '+91-9811223344, info@apexbuilders.com' },
  { Contractor_ID: 303, Contractor_Name: 'UrbanWorks Ltd', Contact_Info: '+91-9922334455, support@urbanworks.in' },
  { Contractor_ID: 304, Contractor_Name: 'PrimeBuild Contractors', Contact_Info: '+91-9733445566, projects@primebuild.org' },
  { Contractor_ID: 305, Contractor_Name: 'Vertex Civil Works', Contact_Info: '+91-9844556677, sales@vertexcivil.in' },
  { Contractor_ID: 306, Contractor_Name: 'Shakti Engineering', Contact_Info: '+91-9855667788, projects@shaktiengg.com' },
  { Contractor_ID: 307, Contractor_Name: 'NexGen Structures', Contact_Info: '+91-9866778899, info@nexgenstruct.com' },
  { Contractor_ID: 308, Contractor_Name: 'BlueLine Projects', Contact_Info: '+91-9877889900, contact@blueline.in' },
  { Contractor_ID: 309, Contractor_Name: 'CivicCore Builders', Contact_Info: '+91-9888990011, admin@civiccore.org' },
  { Contractor_ID: 310, Contractor_Name: 'MegaSpan Infrastructure', Contact_Info: '+91-9899001122, projects@megaspan.in' }
];

export const initialWorkPackages: WorkPackage[] = [
  { Work_Package_ID: 401, Site_ID: 201, Contractor_ID: 301, Work_Package_Name: 'Site Preparation', Verified_Quantity: 800 },
  { Work_Package_ID: 402, Site_ID: 201, Contractor_ID: 301, Work_Package_Name: 'Foundation Work', Verified_Quantity: 1200 },
  { Work_Package_ID: 403, Site_ID: 201, Contractor_ID: 302, Work_Package_Name: 'Structural Framework', Verified_Quantity: 1500 },
  { Work_Package_ID: 404, Site_ID: 202, Contractor_ID: 302, Work_Package_Name: 'Station Finishing', Verified_Quantity: 900 },
  { Work_Package_ID: 405, Site_ID: 202, Contractor_ID: 303, Work_Package_Name: 'Electrical Installation', Verified_Quantity: 700 },
  { Work_Package_ID: 406, Site_ID: 203, Contractor_ID: 303, Work_Package_Name: 'Excavation and Foundation', Verified_Quantity: 1100 },
  { Work_Package_ID: 407, Site_ID: 203, Contractor_ID: 303, Work_Package_Name: 'Concrete Work', Verified_Quantity: 1300 },
  { Work_Package_ID: 408, Site_ID: 204, Contractor_ID: 304, Work_Package_Name: 'Masonry Work', Verified_Quantity: 1000 },
  { Work_Package_ID: 409, Site_ID: 204, Contractor_ID: 304, Work_Package_Name: 'Plumbing Installation', Verified_Quantity: 650 },
  { Work_Package_ID: 410, Site_ID: 205, Contractor_ID: 304, Work_Package_Name: 'Civil and Foundation Work', Verified_Quantity: 1600 },
  { Work_Package_ID: 411, Site_ID: 205, Contractor_ID: 305, Work_Package_Name: 'MEP Installation', Verified_Quantity: 1000 },
  { Work_Package_ID: 412, Site_ID: 206, Contractor_ID: 302, Work_Package_Name: 'Structural Framework', Verified_Quantity: 1400 },
  { Work_Package_ID: 413, Site_ID: 206, Contractor_ID: 306, Work_Package_Name: 'Electrical and HVAC Work', Verified_Quantity: 850 },
  { Work_Package_ID: 414, Site_ID: 207, Contractor_ID: 305, Work_Package_Name: 'Commercial Foundation', Verified_Quantity: 1250 },
  { Work_Package_ID: 415, Site_ID: 207, Contractor_ID: 305, Work_Package_Name: 'Flooring and Finishing', Verified_Quantity: 900 },
  { Work_Package_ID: 416, Site_ID: 208, Contractor_ID: 307, Work_Package_Name: 'Facade Installation', Verified_Quantity: 750 },
  { Work_Package_ID: 417, Site_ID: 208, Contractor_ID: 307, Work_Package_Name: 'Interior Works', Verified_Quantity: 800 },
  { Work_Package_ID: 418, Site_ID: 209, Contractor_ID: 308, Work_Package_Name: 'Terminal Structure', Verified_Quantity: 1800 },
  { Work_Package_ID: 419, Site_ID: 209, Contractor_ID: 308, Work_Package_Name: 'Passenger Facility Works', Verified_Quantity: 1200 },
  { Work_Package_ID: 420, Site_ID: 210, Contractor_ID: 309, Work_Package_Name: 'Residential Foundations', Verified_Quantity: 1400 },
  { Work_Package_ID: 421, Site_ID: 211, Contractor_ID: 309, Work_Package_Name: 'Residential Finishing', Verified_Quantity: 1000 },
  { Work_Package_ID: 422, Site_ID: 212, Contractor_ID: 310, Work_Package_Name: 'Industrial Foundations', Verified_Quantity: 1700 },
  { Work_Package_ID: 423, Site_ID: 224, Contractor_ID: 310, Work_Package_Name: 'Utility Installation', Verified_Quantity: 900 },
  { Work_Package_ID: 424, Site_ID: 213, Contractor_ID: 306, Work_Package_Name: 'Academic Building Structure', Verified_Quantity: 1500 },
  { Work_Package_ID: 425, Site_ID: 214, Contractor_ID: 306, Work_Package_Name: 'Campus Infrastructure', Verified_Quantity: 1000 },
  { Work_Package_ID: 426, Site_ID: 215, Contractor_ID: 305, Work_Package_Name: 'Treatment Plant Civil Works', Verified_Quantity: 1900 },
  { Work_Package_ID: 427, Site_ID: 216, Contractor_ID: 308, Work_Package_Name: 'Stadium Structure', Verified_Quantity: 2000 },
  { Work_Package_ID: 428, Site_ID: 217, Contractor_ID: 308, Work_Package_Name: 'Arena Systems', Verified_Quantity: 1200 },
  { Work_Package_ID: 429, Site_ID: 218, Contractor_ID: 309, Work_Package_Name: 'Flyover Pier Construction', Verified_Quantity: 1800 },
  { Work_Package_ID: 430, Site_ID: 219, Contractor_ID: 309, Work_Package_Name: 'Flyover Deck Construction', Verified_Quantity: 1600 }
];

export const initialMaterials: Material[] = [
  { Material_ID: 501, Material_Name: 'Cement', Unit_Of_Measure: 'Bags (50kg)' },
  { Material_ID: 502, Material_Name: 'Steel', Unit_Of_Measure: 'Metric Tons' },
  { Material_ID: 503, Material_Name: 'Sand', Unit_Of_Measure: 'Cubic Meters' },
  { Material_ID: 504, Material_Name: 'Bricks', Unit_Of_Measure: 'Pieces (x1000)' },
  { Material_ID: 505, Material_Name: 'Electrical Cable', Unit_Of_Measure: 'Meters' },
  { Material_ID: 506, Material_Name: 'Concrete Blocks', Unit_Of_Measure: 'Pieces' },
  { Material_ID: 507, Material_Name: 'Aggregates', Unit_Of_Measure: 'Cubic Meters' },
  { Material_ID: 508, Material_Name: 'Ready Mix Concrete', Unit_Of_Measure: 'Cubic Meters' },
  { Material_ID: 509, Material_Name: 'Rebar', Unit_Of_Measure: 'Metric Tons' },
  { Material_ID: 510, Material_Name: 'PVC Pipes', Unit_Of_Measure: 'Meters' },
  { Material_ID: 511, Material_Name: 'Tiles', Unit_Of_Measure: 'Square Meters' },
  { Material_ID: 512, Material_Name: 'Glass Panels', Unit_Of_Measure: 'Square Meters' },
  { Material_ID: 513, Material_Name: 'Paint', Unit_Of_Measure: 'Liters' },
  { Material_ID: 514, Material_Name: 'Structural Bolts', Unit_Of_Measure: 'Boxes (x100)' },
  { Material_ID: 515, Material_Name: 'Waterproofing Membrane', Unit_Of_Measure: 'Rolls' }
];

export const initialSuppliers: Supplier[] = [
  { Supplier_ID: 601, Supplier_Name: 'UltraBuild Materials', Contact_Info: '+91-8800112233, sales@ultrabuild.com' },
  { Supplier_ID: 602, Supplier_Name: 'National Steel Suppliers', Contact_Info: '+91-8811223344, supply@nationalsteel.in' },
  { Supplier_ID: 603, Supplier_Name: 'Reliable Construction Supply', Contact_Info: '+91-8822334455, orders@reliablesupply.com' },
  { Supplier_ID: 604, Supplier_Name: 'PowerTech Supplies', Contact_Info: '+91-8833445566, corporate@powertech.com' },
  { Supplier_ID: 605, Supplier_Name: 'Prime Cement Distributors', Contact_Info: '+91-8844556677, sales@primecement.in' },
  { Supplier_ID: 606, Supplier_Name: 'Metro Aggregates', Contact_Info: '+91-8855667788, dispatch@metroaggregates.com' },
  { Supplier_ID: 607, Supplier_Name: 'SteelCore India', Contact_Info: '+91-8866778899, bulk@steelcore.in' },
  { Supplier_ID: 608, Supplier_Name: 'BuildTech Products', Contact_Info: '+91-8877889900, support@buildtech.org' },
  { Supplier_ID: 609, Supplier_Name: 'SafeFlow Systems', Contact_Info: '+91-8888990011, contact@safeflow.in' },
  { Supplier_ID: 610, Supplier_Name: 'Urban Materials Co', Contact_Info: '+91-8899001122, info@urbanmaterials.com' }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  { PO_ID: 701, Supplier_ID: 601, Order_Date: '2026-08-01', Expected_Delivery_Date: '2026-08-05' },
  { PO_ID: 702, Supplier_ID: 602, Order_Date: '2026-08-03', Expected_Delivery_Date: '2026-08-07' },
  { PO_ID: 703, Supplier_ID: 603, Order_Date: '2026-08-05', Expected_Delivery_Date: '2026-08-09' },
  { PO_ID: 704, Supplier_ID: 604, Order_Date: '2026-08-07', Expected_Delivery_Date: '2026-08-11' },
  { PO_ID: 705, Supplier_ID: 605, Order_Date: '2026-08-10', Expected_Delivery_Date: '2026-08-14' },
  { PO_ID: 706, Supplier_ID: 606, Order_Date: '2026-08-12', Expected_Delivery_Date: '2026-08-16' },
  { PO_ID: 707, Supplier_ID: 607, Order_Date: '2026-08-15', Expected_Delivery_Date: '2026-08-19' },
  { PO_ID: 708, Supplier_ID: 608, Order_Date: '2026-08-18', Expected_Delivery_Date: '2026-08-22' },
  { PO_ID: 709, Supplier_ID: 609, Order_Date: '2026-08-20', Expected_Delivery_Date: '2026-08-24' },
  { PO_ID: 710, Supplier_ID: 610, Order_Date: '2026-08-22', Expected_Delivery_Date: '2026-08-26' }
];

export const initialDeliveries: Delivery[] = [
  { Delivery_ID: 801, PO_ID: 701, Site_ID: 201, Delivery_Date: '2026-08-04' },
  { Delivery_ID: 802, PO_ID: 702, Site_ID: 201, Delivery_Date: '2026-08-06' },
  { Delivery_ID: 803, PO_ID: 703, Site_ID: 203, Delivery_Date: '2026-08-08' },
  { Delivery_ID: 804, PO_ID: 704, Site_ID: 204, Delivery_Date: '2026-08-10' },
  { Delivery_ID: 805, PO_ID: 705, Site_ID: 205, Delivery_Date: '2026-08-12' },
  { Delivery_ID: 806, PO_ID: 706, Site_ID: 206, Delivery_Date: '2026-08-14' },
  { Delivery_ID: 807, PO_ID: 707, Site_ID: 207, Delivery_Date: '2026-08-17' },
  { Delivery_ID: 808, PO_ID: 708, Site_ID: 208, Delivery_Date: '2026-08-20' },
  { Delivery_ID: 809, PO_ID: 709, Site_ID: 209, Delivery_Date: '2026-08-22' },
  { Delivery_ID: 810, PO_ID: 710, Site_ID: 210, Delivery_Date: '2026-08-24' }
];

export const initialDeliveryItems: DeliveryItem[] = [
  { Delivery_Item_ID: 901, Delivery_ID: 801, Material_ID: 501, Quantity_Delivered: 500, Unit_Price: 380 },
  { Delivery_Item_ID: 902, Delivery_ID: 801, Material_ID: 503, Quantity_Delivered: 900, Unit_Price: 1800 },
  { Delivery_Item_ID: 903, Delivery_ID: 802, Material_ID: 502, Quantity_Delivered: 700, Unit_Price: 58000 },
  { Delivery_Item_ID: 904, Delivery_ID: 803, Material_ID: 501, Quantity_Delivered: 800, Unit_Price: 385 },
  { Delivery_Item_ID: 905, Delivery_ID: 804, Material_ID: 504, Quantity_Delivered: 600, Unit_Price: 7500 },
  { Delivery_Item_ID: 906, Delivery_ID: 804, Material_ID: 506, Quantity_Delivered: 500, Unit_Price: 45 },
  { Delivery_Item_ID: 907, Delivery_ID: 805, Material_ID: 507, Quantity_Delivered: 1000, Unit_Price: 1200 },
  { Delivery_Item_ID: 908, Delivery_ID: 806, Material_ID: 508, Quantity_Delivered: 900, Unit_Price: 4200 },
  { Delivery_Item_ID: 909, Delivery_ID: 806, Material_ID: 509, Quantity_Delivered: 450, Unit_Price: 56000 },
  { Delivery_Item_ID: 910, Delivery_ID: 807, Material_ID: 510, Quantity_Delivered: 650, Unit_Price: 220 }
];

export const initialSiteStock: SiteStock[] = [
  { Stock_ID: 1001, Site_ID: 201, Material_ID: 501, Quantity_Available: 1200 },
  { Stock_ID: 1002, Site_ID: 201, Material_ID: 503, Quantity_Available: 1800 },
  { Stock_ID: 1003, Site_ID: 201, Material_ID: 502, Quantity_Available: 1000 },
  { Stock_ID: 1004, Site_ID: 202, Material_ID: 505, Quantity_Available: 900 },
  { Stock_ID: 1005, Site_ID: 202, Material_ID: 501, Quantity_Available: 1100 },
  { Stock_ID: 1006, Site_ID: 203, Material_ID: 501, Quantity_Available: 1500 },
  { Stock_ID: 1007, Site_ID: 203, Material_ID: 504, Quantity_Available: 1000 },
  { Stock_ID: 1008, Site_ID: 204, Material_ID: 504, Quantity_Available: 1200 },
  { Stock_ID: 1009, Site_ID: 204, Material_ID: 506, Quantity_Available: 900 },
  { Stock_ID: 1010, Site_ID: 205, Material_ID: 507, Quantity_Available: 1600 }
];

export const initialIssues: Issue[] = [
  { Issue_ID: 1101, Stock_ID: 1001, Work_Package_ID: 401, Quantity_Issued: 250, Issue_Date: '2026-08-10' },
  { Issue_ID: 1102, Stock_ID: 1001, Work_Package_ID: 402, Quantity_Issued: 300, Issue_Date: '2026-08-15' },
  { Issue_ID: 1103, Stock_ID: 1002, Work_Package_ID: 401, Quantity_Issued: 400, Issue_Date: '2026-08-12' },
  { Issue_ID: 1104, Stock_ID: 1002, Work_Package_ID: 402, Quantity_Issued: 500, Issue_Date: '2026-08-18' },
  { Issue_ID: 1105, Stock_ID: 1003, Work_Package_ID: 403, Quantity_Issued: 350, Issue_Date: '2026-08-14' },
  { Issue_ID: 1106, Stock_ID: 1003, Work_Package_ID: 403, Quantity_Issued: 250, Issue_Date: '2026-08-20' },
  { Issue_ID: 1107, Stock_ID: 1004, Work_Package_ID: 405, Quantity_Issued: 300, Issue_Date: '2026-08-16' },
  { Issue_ID: 1108, Stock_ID: 1004, Work_Package_ID: 405, Quantity_Issued: 250, Issue_Date: '2026-08-22' },
  { Issue_ID: 1109, Stock_ID: 1005, Work_Package_ID: 404, Quantity_Issued: 350, Issue_Date: '2026-08-18' },
  { Issue_ID: 1110, Stock_ID: 1005, Work_Package_ID: 404, Quantity_Issued: 300, Issue_Date: '2026-08-24' }
];

export const initialLabourTeams: LabourTeam[] = [
  { Labour_Team_ID: 1201, Team_Name: 'Foundation Team' },
  { Labour_Team_ID: 1202, Team_Name: 'Structural Team' },
  { Labour_Team_ID: 1203, Team_Name: 'Electrical Team' },
  { Labour_Team_ID: 1204, Team_Name: 'Civil Works Team' },
  { Labour_Team_ID: 1205, Team_Name: 'Finishing Team' },
  { Labour_Team_ID: 1206, Team_Name: 'MEP Team' },
  { Labour_Team_ID: 1207, Team_Name: 'Plumbing Team' },
  { Labour_Team_ID: 1208, Team_Name: 'Road Works Team' },
  { Labour_Team_ID: 1209, Team_Name: 'Steel Works Team' },
  { Labour_Team_ID: 1210, Team_Name: 'General Construction Team' }
];

export const initialProgressEntries: ProgressEntry[] = [
  { Progress_ID: 1301, Work_Package_ID: 401, Labour_Team_ID: 1201, Percent_Complete: 35.0, Progress_Date: '2026-09-01' },
  { Progress_ID: 1302, Work_Package_ID: 401, Labour_Team_ID: 1201, Percent_Complete: 65.0, Progress_Date: '2026-09-20' },
  { Progress_ID: 1303, Work_Package_ID: 402, Labour_Team_ID: 1201, Percent_Complete: 40.0, Progress_Date: '2026-09-05' },
  { Progress_ID: 1304, Work_Package_ID: 402, Labour_Team_ID: 1201, Percent_Complete: 72.0, Progress_Date: '2026-09-25' },
  { Progress_ID: 1305, Work_Package_ID: 403, Labour_Team_ID: 1202, Percent_Complete: 30.0, Progress_Date: '2026-09-03' },
  { Progress_ID: 1306, Work_Package_ID: 403, Labour_Team_ID: 1202, Percent_Complete: 58.0, Progress_Date: '2026-09-24' },
  { Progress_ID: 1307, Work_Package_ID: 404, Labour_Team_ID: 1205, Percent_Complete: 45.0, Progress_Date: '2026-09-08' },
  { Progress_ID: 1308, Work_Package_ID: 404, Labour_Team_ID: 1205, Percent_Complete: 78.0, Progress_Date: '2026-09-28' },
  { Progress_ID: 1309, Work_Package_ID: 405, Labour_Team_ID: 1203, Percent_Complete: 35.0, Progress_Date: '2026-09-10' },
  { Progress_ID: 1310, Work_Package_ID: 405, Labour_Team_ID: 1203, Percent_Complete: 70.0, Progress_Date: '2026-09-30' }
];

export const initialBills: Bill[] = [
  { Bill_ID: 1401, Work_Package_ID: 401, Billed_Quantity: 500, Bill_Amount: 750000, Bill_Date: '2026-09-08', Status: 'Approved' },
  { Bill_ID: 1402, Work_Package_ID: 402, Billed_Quantity: 700, Bill_Amount: 1050000, Bill_Date: '2026-09-12', Status: 'Approved' },
  { Bill_ID: 1403, Work_Package_ID: 403, Billed_Quantity: 850, Bill_Amount: 1275000, Bill_Date: '2026-09-15', Status: 'Approved' },
  { Bill_ID: 1404, Work_Package_ID: 404, Billed_Quantity: 600, Bill_Amount: 900000, Bill_Date: '2026-09-18', Status: 'Approved' },
  { Bill_ID: 1405, Work_Package_ID: 405, Billed_Quantity: 450, Bill_Amount: 630000, Bill_Date: '2026-09-20', Status: 'Approved' },
  { Bill_ID: 1406, Work_Package_ID: 406, Billed_Quantity: 650, Bill_Amount: 975000, Bill_Date: '2026-09-22', Status: 'Approved' },
  { Bill_ID: 1407, Work_Package_ID: 407, Billed_Quantity: 800, Bill_Amount: 1120000, Bill_Date: '2026-09-23', Status: 'Approved' },
  { Bill_ID: 1408, Work_Package_ID: 408, Billed_Quantity: 550, Bill_Amount: 825000, Bill_Date: '2026-09-25', Status: 'Approved' },
  { Bill_ID: 1409, Work_Package_ID: 409, Billed_Quantity: 350, Bill_Amount: 490000, Bill_Date: '2026-09-26', Status: 'Approved' },
  { Bill_ID: 1410, Work_Package_ID: 410, Billed_Quantity: 900, Bill_Amount: 1350000, Bill_Date: '2026-09-28', Status: 'Approved' }
];

export const initialPayments: Payment[] = [
  { Payment_ID: 1501, Bill_ID: 1401, Amount_Paid: 300000, Payment_Date: '2026-09-10' },
  { Payment_ID: 1502, Bill_ID: 1401, Amount_Paid: 200000, Payment_Date: '2026-09-25' },
  { Payment_ID: 1503, Bill_ID: 1402, Amount_Paid: 500000, Payment_Date: '2026-09-15' },
  { Payment_ID: 1504, Bill_ID: 1402, Amount_Paid: 250000, Payment_Date: '2026-09-30' },
  { Payment_ID: 1505, Bill_ID: 1403, Amount_Paid: 600000, Payment_Date: '2026-09-18' },
  { Payment_ID: 1506, Bill_ID: 1404, Amount_Paid: 450000, Payment_Date: '2026-09-20' },
  { Payment_ID: 1507, Bill_ID: 1404, Amount_Paid: 200000, Payment_Date: '2026-10-01' },
  { Payment_ID: 1508, Bill_ID: 1405, Amount_Paid: 300000, Payment_Date: '2026-09-22' },
  { Payment_ID: 1509, Bill_ID: 1406, Amount_Paid: 500000, Payment_Date: '2026-09-24' },
  { Payment_ID: 1510, Bill_ID: 1406, Amount_Paid: 200000, Payment_Date: '2026-10-02' }
];
