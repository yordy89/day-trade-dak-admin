import { jsPDF } from 'jspdf';
import * as Papa from 'papaparse';

// Dynamic import for jspdf-autotable to avoid build issues
let autoTable: any;
if (typeof window !== 'undefined') {
  autoTable = require('jspdf-autotable').default;
}

interface ExportUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: string;
  status?: string;
  subscriptions?: Array<{
    plan: string;
    status: string;
  }>;
  lastLogin?: Date | string;
  createdAt?: Date | string;
}

export class ExportUtils {
  static formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatDateTime(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static prepareUserData(users: ExportUser[]) {
    return users.map(user => ({
      ID: user._id,
      Email: user.email,
      'Full Name': user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-',
      Role: user.role || 'user',
      Status: user.status || 'active',
      'Subscription Plan': user.subscriptions?.[0]?.plan || 'none',
      'Subscription Status': user.subscriptions?.[0]?.status || 'none',
      'Last Login': this.formatDateTime(user.lastLogin),
      'Created At': this.formatDate(user.createdAt),
    }));
  }

  static exportToCSV(users: ExportUser[], filename?: string) {
    const data = this.prepareUserData(users);
    const csv = Papa.unparse(data);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static exportToPDF(users: ExportUser[], filters?: any, filename?: string) {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !autoTable) {
      console.error('PDF export is only available in browser environment');
      return;
    }
    
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const data = this.prepareUserData(users);
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74); // DayTradeDak green
    doc.text('DayTradeDak Users Export', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Users: ${users.length}`, 14, 34);
    
    // Add filters info if any
    if (filters) {
      let filterText = 'Filters: ';
      const activeFilters = [];
      
      if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
      if (filters.status && filters.status !== 'all') activeFilters.push(`Status: ${filters.status}`);
      if (filters.subscription && filters.subscription !== 'all') {
        activeFilters.push(`Subscription: ${filters.subscription === 'none' ? 'No Subscription' : filters.subscription}`);
      }
      if (filters.role && filters.role !== 'all') activeFilters.push(`Role: ${filters.role}`);
      
      if (activeFilters.length > 0) {
        filterText += activeFilters.join(', ');
        doc.text(filterText, 14, 40);
      }
    }
    
    // Prepare table data
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => Object.values(row));
    
    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: filters && Object.keys(filters).some(k => filters[k] && filters[k] !== 'all') ? 45 : 40,
      theme: 'striped',
      headStyles: {
        fillColor: [22, 163, 74], // DayTradeDak green
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // ID
        1: { cellWidth: 40 }, // Email
        2: { cellWidth: 35 }, // Full Name
        3: { cellWidth: 20 }, // Role
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 35 }, // Subscription Plan
        6: { cellWidth: 25 }, // Subscription Status
        7: { cellWidth: 35 }, // Last Login
        8: { cellWidth: 25 }, // Created At
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data: any) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      },
    });
    
    // Add summary at the end
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 50;
    if (finalY < doc.internal.pageSize.height - 20) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Export Summary', 14, finalY);
      
      doc.setFontSize(9);
      const subscriptionStats = users.reduce((acc, user) => {
        const plan = user.subscriptions?.[0]?.plan || 'none';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      let yPos = finalY + 6;
      Object.entries(subscriptionStats).forEach(([plan, count]) => {
        if (yPos < doc.internal.pageSize.height - 15) {
          doc.text(`${plan === 'none' ? 'No Subscription' : plan}: ${count} users`, 14, yPos);
          yPos += 5;
        }
      });
    }
    
    // Save the PDF
    doc.save(filename || `users_export_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportFromAPI(
    format: 'csv' | 'pdf',
    params: any,
    token: string
  ): Promise<void> {
    try {
      // Fetch all users with filters from API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/admin/users?${new URLSearchParams({
          ...params,
          limit: '10000', // Get all users
        })}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      const users = data.users || [];

      if (format === 'csv') {
        this.exportToCSV(users);
      } else if (format === 'pdf') {
        this.exportToPDF(users, params);
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
}