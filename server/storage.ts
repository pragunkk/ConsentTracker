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
    ];

    sampleUsers.forEach(user => {
      const newUser: User = { ...user, id: this.currentUserId++ };
      this.users.set(newUser.id, newUser);
    });

    // Create sample consent records
    const sampleRecords = [
      {
        documentName: "Financial_Report_2023.pdf",
        dataAccessed: "Revenue data, Q4 metrics",
        hostUserId: 1,
        hostUserName: "Sarah Wilson",
        guestUserId: 2,
        guestUserName: "Michael Chen",
        accessDate: new Date("2023-12-15T14:30:00Z"),
        expiryDate: new Date("2024-01-15T14:30:00Z"),
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
        accessDate: new Date("2023-12-10T10:00:00Z"),
        expiryDate: new Date("2023-12-20T10:00:00Z"),
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
        expiryDate: new Date("2023-11-30T09:00:00Z"),
        status: "expired",
        accessLevel: "read",
        purpose: "HR verification",
        documentSize: "3.1 MB",
        documentType: "xlsx",
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
