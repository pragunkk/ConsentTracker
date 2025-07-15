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
    // Create sample users (realistic Indian names)
    const sampleUsers = [
      { username: "rohit.sharma", password: "password123" },
      { username: "priya.verma", password: "password123" },
      { username: "ananya.iyer", password: "password123" },
      { username: "sachin.patel", password: "password123" },
      { username: "arjun.singh", password: "password123" },
      { username: "deepa.nair", password: "password123" },
      { username: "amit.jain", password: "password123" },
      { username: "meera.rao", password: "password123" },
      { username: "vikram.menon", password: "password123" },
      { username: "isha.kapoor", password: "password123" },
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
        hostUserName: "Rohit Sharma",
        guestUserId: 2,
        guestUserName: "Accounts Department",
        accessDate: new Date("2024-01-15T14:30:00Z"),
        expiryDate: new Date("2024-02-15T14:30:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Financial audit verification",
        documentSize: "2.4 MB",
        documentType: "pdf",
      },
      {
        documentName: "Activities document-rohit-IIIT Bangalore.pdf",
        dataAccessed: "Student activities, achievements",
        hostUserId: 1,
        hostUserName: "Rohit Sharma",
        guestUserId: 3,
        guestUserName: "Admissions Office",
        accessDate: new Date("2024-12-05T10:34:28Z"),
        expiryDate: new Date("2024-12-26T18:30:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Education",
        documentSize: "1.1 MB",
        documentType: "pdf",
      },
      {
        documentName: "Data verification-rohit-Sachin.docx",
        dataAccessed: "Verification details, supporting docs",
        hostUserId: 4,
        hostUserName: "Sachin Patel",
        guestUserId: 5,
        guestUserName: "Administration",
        accessDate: new Date("2024-12-05T11:24:13Z"),
        expiryDate: new Date("2024-12-18T18:30:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "Education",
        documentSize: "2.0 MB",
        documentType: "docx",
      },
      {
        documentName: "Hostel Allotment List.xlsx",
        dataAccessed: "Room numbers, student names",
        hostUserId: 2,
        hostUserName: "Priya Verma",
        guestUserId: 6,
        guestUserName: "Hostel Manager",
        accessDate: new Date("2024-11-20T09:00:00Z"),
        expiryDate: new Date("2024-12-20T09:00:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Accommodation",
        documentSize: "1.8 MB",
        documentType: "xlsx",
      },
      {
        documentName: "Scholarship Approval.pdf",
        dataAccessed: "Scholarship details, eligibility",
        hostUserId: 3,
        hostUserName: "Ananya Iyer",
        guestUserId: 7,
        guestUserName: "Scholarship Cell",
        accessDate: new Date("2024-10-10T10:00:00Z"),
        expiryDate: new Date("2024-11-10T10:00:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Financial Aid",
        documentSize: "900 KB",
        documentType: "pdf",
      },
      {
        documentName: "Library Access Card.pdf",
        dataAccessed: "Library card, access permissions",
        hostUserId: 8,
        hostUserName: "Meera Rao",
        guestUserId: 9,
        guestUserName: "Library",
        accessDate: new Date("2024-09-01T08:30:00Z"),
        expiryDate: new Date("2024-12-01T08:30:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Library Access",
        documentSize: "500 KB",
        documentType: "pdf",
      },
      {
        documentName: "Medical Certificate.docx",
        dataAccessed: "Medical records, fitness status",
        hostUserId: 10,
        hostUserName: "Isha Kapoor",
        guestUserId: 1,
        guestUserName: "Medical Center",
        accessDate: new Date("2024-12-10T14:00:00Z"),
        expiryDate: new Date("2024-12-20T14:00:00Z"),
        status: "expiring",
        accessLevel: "read",
        purpose: "Health Verification",
        documentSize: "1.3 MB",
        documentType: "docx",
      },
      {
        documentName: "Fee Receipt 2024.pdf",
        dataAccessed: "Payment details, transaction ID",
        hostUserId: 5,
        hostUserName: "Arjun Singh",
        guestUserId: 2,
        guestUserName: "Accounts Department",
        accessDate: new Date("2024-12-01T12:00:00Z"),
        expiryDate: new Date("2024-12-31T12:00:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Fee Payment",
        documentSize: "700 KB",
        documentType: "pdf",
      },
      {
        documentName: "Bonafide Certificate.pdf",
        dataAccessed: "Student status, course details",
        hostUserId: 6,
        hostUserName: "Deepa Nair",
        guestUserId: 8,
        guestUserName: "Student Affairs",
        accessDate: new Date("2024-11-15T10:00:00Z"),
        expiryDate: new Date("2024-12-15T10:00:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "Student Verification",
        documentSize: "600 KB",
        documentType: "pdf",
      },
      {
        documentName: "Internship Offer Letter.pdf",
        dataAccessed: "Internship details, company name",
        hostUserId: 7,
        hostUserName: "Amit Jain",
        guestUserId: 4,
        guestUserName: "Placement Cell",
        accessDate: new Date("2024-10-20T09:30:00Z"),
        expiryDate: new Date("2024-11-20T09:30:00Z"),
        status: "active",
        accessLevel: "read",
        purpose: "Placement",
        documentSize: "1.7 MB",
        documentType: "pdf",
      },
      // ...existing records...
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
      accessLevel: record.accessLevel || "read",
      purpose: record.purpose || "",
      documentSize: record.documentSize || "",
      documentType: record.documentType || "",
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
