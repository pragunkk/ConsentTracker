import { users, consentRecords, type User, type InsertUser, type ConsentRecord, type InsertConsentRecord } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Consent records operations
  getAllConsentRecords(): Promise<ConsentRecord[]>;
  getConsentRecord(id: number): Promise<ConsentRecord | undefined>;
  createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord>;
  updateConsentRecord(id: number, record: Partial<ConsentRecord>): Promise<ConsentRecord | undefined>;
  deleteConsentRecord(id: number): Promise<boolean>;
  
  // Search and filter operations
  searchConsentRecords(query: string): Promise<ConsentRecord[]>;
  getConsentRecordsByStatus(status: string): Promise<ConsentRecord[]>;
  getConsentRecordsByUser(userId: number): Promise<ConsentRecord[]>;
  getConsentRecordsByDateRange(startDate: Date, endDate: Date): Promise<ConsentRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private consentRecords: Map<number, ConsentRecord>;
  private currentUserId: number;
  private currentConsentId: number;

  constructor() {
    this.users = new Map();
    this.consentRecords = new Map();
    this.currentUserId = 1;
    this.currentConsentId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers = [
      { username: "sarah.wilson", password: "password123" },
      { username: "michael.chen", password: "password123" },
      { username: "emma.rodriguez", password: "password123" },
      { username: "david.kim", password: "password123" },
      { username: "john.doe", password: "password123" },
      { username: "lisa.thompson", password: "password123" },
      { username: "alex.johnson", password: "password123" },
      { username: "maria.garcia", password: "password123" },
      { username: "robert.brown", password: "password123" },
      { username: "jennifer.davis", password: "password123" },
    ];

    sampleUsers.forEach(user => {
      const newUser: User = { ...user, id: this.currentUserId++ };
      this.users.set(newUser.id, newUser);
    });

    // Create diverse sample consent records
    const sampleRecords = [
      {
        documentName: "Financial_Report_2023.pdf",
        dataAccessed: "Revenue data, Q4 metrics",
        hostUserId: 1,
        hostUserName: "Sarah Wilson",
        guestUserId: 2,
        guestUserName: "Michael Chen",
        accessDate: new Date("2024-01-15T14:30:00Z"),
        expiryDate: new Date("2024-02-15T14:30:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Financial audit verification",
        documentSize: "2.4 MB",
        documentType: "pdf",
      },
      {
        documentName: "Contract_Template_v2.docx",
        dataAccessed: "Terms and conditions",
        hostUserId: 3,
        hostUserName: "Emma Rodriguez",
        guestUserId: 4,
        guestUserName: "David Kim",
        accessDate: new Date("2024-01-10T10:00:00Z"),
        expiryDate: new Date("2024-01-20T10:00:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "Contract review",
        documentSize: "1.2 MB",
        documentType: "docx",
      },
      {
        documentName: "Employee_Database.xlsx",
        dataAccessed: "Contact information",
        hostUserId: 5,
        hostUserName: "John Doe",
        guestUserId: 6,
        guestUserName: "Lisa Thompson",
        accessDate: new Date("2023-11-28T09:00:00Z"),
        expiryDate: new Date("2023-12-28T09:00:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "HR verification",
        documentSize: "3.1 MB",
        documentType: "xlsx",
      },
      {
        documentName: "Product_Roadmap_2024.pptx",
        dataAccessed: "Strategic initiatives, timeline",
        hostUserId: 2,
        hostUserName: "Michael Chen",
        guestUserId: 7,
        guestUserName: "Alex Johnson",
        accessDate: new Date("2024-01-20T16:15:00Z"),
        expiryDate: new Date("2024-03-20T16:15:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Product strategy alignment",
        documentSize: "4.8 MB",
        documentType: "pptx",
      },
      {
        documentName: "Legal_Compliance_Checklist.pdf",
        dataAccessed: "Regulatory requirements",
        hostUserId: 4,
        hostUserName: "David Kim",
        guestUserId: 8,
        guestUserName: "Maria Garcia",
        accessDate: new Date("2024-01-12T11:20:00Z"),
        expiryDate: new Date("2024-02-12T11:20:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Compliance review",
        documentSize: "890 KB",
        documentType: "pdf",
      },
      {
        documentName: "Marketing_Campaign_Data.xlsx",
        dataAccessed: "Customer metrics, conversion rates",
        hostUserId: 6,
        hostUserName: "Lisa Thompson",
        guestUserId: 9,
        guestUserName: "Robert Brown",
        accessDate: new Date("2024-01-08T13:45:00Z"),
        expiryDate: new Date("2024-01-18T13:45:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "Marketing analysis",
        documentSize: "2.1 MB",
        documentType: "xlsx",
      },
      {
        documentName: "IT_Security_Policy.docx",
        dataAccessed: "Access control protocols",
        hostUserId: 7,
        hostUserName: "Alex Johnson",
        guestUserId: 10,
        guestUserName: "Jennifer Davis",
        accessDate: new Date("2023-12-01T08:30:00Z"),
        expiryDate: new Date("2023-12-31T08:30:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Security audit",
        documentSize: "1.5 MB",
        documentType: "docx",
      },
      {
        documentName: "Budget_Proposal_2024.pdf",
        dataAccessed: "Department allocations",
        hostUserId: 8,
        hostUserName: "Maria Garcia",
        guestUserId: 1,
        guestUserName: "Sarah Wilson",
        accessDate: new Date("2024-01-18T15:00:00Z"),
        expiryDate: new Date("2024-04-18T15:00:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Budget planning",
        documentSize: "3.7 MB",
        documentType: "pdf",
      },
      {
        documentName: "Training_Materials.zip",
        dataAccessed: "Employee onboarding content",
        hostUserId: 9,
        hostUserName: "Robert Brown",
        guestUserId: 3,
        guestUserName: "Emma Rodriguez",
        accessDate: new Date("2024-01-05T09:15:00Z"),
        expiryDate: new Date("2024-01-15T09:15:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "HR training coordination",
        documentSize: "15.2 MB",
        documentType: "zip",
      },
      {
        documentName: "Client_Feedback_Survey.xlsx",
        dataAccessed: "Customer satisfaction scores",
        hostUserId: 10,
        hostUserName: "Jennifer Davis",
        guestUserId: 5,
        guestUserName: "John Doe",
        accessDate: new Date("2023-11-15T14:20:00Z"),
        expiryDate: new Date("2023-12-15T14:20:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Customer experience analysis",
        documentSize: "2.8 MB",
        documentType: "xlsx",
      },
      {
        documentName: "Company_Handbook_2024.pdf",
        dataAccessed: "HR policies, benefits information",
        hostUserId: 1,
        hostUserName: "Sarah Wilson",
        guestUserId: 3,
        guestUserName: "Emma Rodriguez",
        accessDate: new Date("2024-01-22T09:30:00Z"),
        expiryDate: new Date("2024-02-22T09:30:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Employee orientation",
        documentSize: "5.7 MB",
        documentType: "pdf",
      },
      {
        documentName: "Vendor_Contracts_2024.docx",
        dataAccessed: "Payment terms, deliverables",
        hostUserId: 2,
        hostUserName: "Michael Chen",
        guestUserId: 4,
        guestUserName: "David Kim",
        accessDate: new Date("2024-01-14T11:45:00Z"),
        expiryDate: new Date("2024-01-24T11:45:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "Procurement review",
        documentSize: "3.3 MB",
        documentType: "docx",
      },
      {
        documentName: "Sales_Performance_Q1.xlsx",
        dataAccessed: "Revenue metrics, team performance",
        hostUserId: 3,
        hostUserName: "Emma Rodriguez",
        guestUserId: 5,
        guestUserName: "John Doe",
        accessDate: new Date("2024-01-16T14:00:00Z"),
        expiryDate: new Date("2024-02-16T14:00:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Sales strategy planning",
        documentSize: "2.9 MB",
        documentType: "xlsx",
      },
      {
        documentName: "Technical_Architecture_Doc.pdf",
        dataAccessed: "System specifications, API docs",
        hostUserId: 4,
        hostUserName: "David Kim",
        guestUserId: 6,
        guestUserName: "Lisa Thompson",
        accessDate: new Date("2023-12-20T13:15:00Z"),
        expiryDate: new Date("2024-01-20T13:15:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Development planning",
        documentSize: "8.2 MB",
        documentType: "pdf",
      },
      {
        documentName: "Customer_Support_Tickets.csv",
        dataAccessed: "Issue tracking, resolution times",
        hostUserId: 5,
        hostUserName: "John Doe",
        guestUserId: 7,
        guestUserName: "Alex Johnson",
        accessDate: new Date("2024-01-19T10:20:00Z"),
        expiryDate: new Date("2024-02-19T10:20:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Support analysis",
        documentSize: "1.8 MB",
        documentType: "csv",
      },
    ];

    sampleRecords.forEach(record => {
      const newRecord: ConsentRecord = {
        ...record,
        id: this.currentConsentId++,
        createdAt: new Date(),
      };
      this.consentRecords.set(newRecord.id, newRecord);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllConsentRecords(): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).sort((a, b) => 
      new Date(b.accessDate).getTime() - new Date(a.accessDate).getTime()
    );
  }

  async getConsentRecord(id: number): Promise<ConsentRecord | undefined> {
    return this.consentRecords.get(id);
  }

  async createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord> {
    const id = this.currentConsentId++;
    const newRecord: ConsentRecord = {
      ...record,
      id,
      status: record.status || "active",
      hostUserId: record.hostUserId || 1,
      guestUserId: record.guestUserId || 2,
      createdAt: new Date(),
    };
    this.consentRecords.set(id, newRecord);
    return newRecord;
  }

  async updateConsentRecord(id: number, record: Partial<ConsentRecord>): Promise<ConsentRecord | undefined> {
    const existingRecord = this.consentRecords.get(id);
    if (!existingRecord) return undefined;
    
    const updatedRecord: ConsentRecord = { ...existingRecord, ...record };
    this.consentRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteConsentRecord(id: number): Promise<boolean> {
    return this.consentRecords.delete(id);
  }

  async searchConsentRecords(query: string): Promise<ConsentRecord[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.consentRecords.values()).filter(record =>
      record.documentName.toLowerCase().includes(lowercaseQuery) ||
      record.dataAccessed.toLowerCase().includes(lowercaseQuery) ||
      record.hostUserName.toLowerCase().includes(lowercaseQuery) ||
      record.guestUserName.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getConsentRecordsByStatus(status: string): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).filter(record => 
      record.status === status
    );
  }

  async getConsentRecordsByUser(userId: number): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).filter(record => 
      record.hostUserId === userId || record.guestUserId === userId
    );
  }

  async getConsentRecordsByDateRange(startDate: Date, endDate: Date): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).filter(record => {
      const accessDate = new Date(record.accessDate);
      return accessDate >= startDate && accessDate <= endDate;
    });
  }
}

export const storage = new MemStorage();
