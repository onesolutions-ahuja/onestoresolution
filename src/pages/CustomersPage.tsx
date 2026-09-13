import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, Users } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  totalSpent: number;
  orderCount: number;
  lastVisit: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name'); // name, totalSpent, lastVisit
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockCustomers: Customer[] = [
          {
            id: 'CUST-001',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '555-123-4567',
            address: '123 Main St',
            city: 'London',
            postalCode: 'SW1A 1AA',
            totalSpent: 1250.50,
            orderCount: 24,
            lastVisit: '2024-01-14',
            isActive: true,
            createdAt: '2023-05-15'
          },
          {
            id: 'CUST-002',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@email.com',
            phone: '555-987-6543',
            address: '456 Oak Ave',
            city: 'Manchester',
            postalCode: 'M1 1AA',
            totalSpent: 890.25,
            orderCount: 18,
            lastVisit: '2024-01-13',
            isActive: true,
            createdAt: '2023-07-22'
          },
          {
            id: 'CUST-003',
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.johnson@email.com',
            phone: '555-456-7890',
            address: '789 Pine Rd',
            city: 'Birmingham',
            postalCode: 'B1 1AA',
            totalSpent: 2100.00,
            orderCount: 35,
            lastVisit: '2024-01-15',
            isActive: true,
            createdAt: '2023-03-10'
          },
          {
            id: 'CUST-004',
            firstName: 'Sarah',
            lastName: 'Williams',
            email: null,
            phone: '555-222-3333',
            address: '321 Elm St',
            city: 'Leeds',
            postalCode: 'LS1 1AA',
            totalSpent: 450.75,
            orderCount: 12,
            lastVisit: '2024-01-10',
            isActive: false,
            createdAt: '2023-11-05'
          },
          {
            id: 'CUST-005',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@email.com',
            phone: '555-777-8888',
            address: '654 Maple Dr',
            city: 'Glasgow',
            postalCode: 'G1 1AA',
            totalSpent: 1650.30,
            orderCount: 28,
            lastVisit: '2024-01-12',
            isActive: true,
            createdAt: '2023-08-30'
          }
        ];

        setCustomers(mockCustomers);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load customers');
        toast({
          title: "Error",
          description: err.message || 'Failed to load customers',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer => 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchQuery))
    )
    .sort((a, b) => {
      let comparison = 0;
      const valueA = sortBy === 'name' 
        ? `${a.firstName} ${a.lastName}`.toLowerCase()
        : sortBy === 'totalSpent'
        ? a.totalSpent
        : sortBy === 'lastVisit'
        ? (a.lastVisit || '').toLowerCase()
        : a.orderCount;
      
      const valueB = sortBy === 'name' 
        ? `${b.firstName} ${b.lastName}`.toLowerCase()
        : sortBy === 'totalSpent'
        ? b.totalSpent
        : sortBy === 'lastVisit'
        ? (b.lastVisit || '').toLowerCase()
        : b.orderCount;
      
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle customer actions
  const handleViewCustomer = (id: string) => {
    toast({
      title: "View Customer",
      description: `Viewing customer details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditCustomer = (id: string) => {
    toast({
      title: "Edit Customer",
      description: `Editing customer details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteCustomer = async (id: string) => {
    // In real app: await api.delete(`/customers/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCustomers(customers.filter(c => c.id !== id));
      toast({
        title: "Customer Deleted",
        description: "Customer has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete customer',
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    // In real app: toggle status via API
    setCustomers(customers.map(customer =>
      customer.id === id ? { ...customer, isActive: !customer.isActive } : customer
    ));
    
    toast({
      title: "Status Updated",
      description: "Customer status has been updated",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add customer modal would go here
            toast({
              title: "Add Customer",
              description: "Opening add customer form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Import/export functionality
              toast({
                title: "Import/Export",
                description: "Opening import/export options",
                variant: "default"
              });
            }}
          >
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Export functionality
              toast({
                title: "Export Customers",
                description: "Exporting customer data",
                variant: "default"
              });
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Customers</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3]"
            >
              <option value="name">Name</option>
              <option value="totalSpent">Total Spent</option>
              <option value="orderCount">Order Count</option>
              <option value="lastVisit">Last Visit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Direction</label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3]"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Customers ({filteredAndSortedCustomers.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading customers...</p>
            </div>
          ) : (
            <>
              {filteredAndSortedCustomers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No customers match the current search
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Customer Name</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead className="w-20">Total Spent</TableHead>
                      <TableHead className="w-20">Order Count</TableHead>
                      <TableHead className="w-20">Last Visit</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Created At</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {customer.email ? (
                            <>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span>{customer.email}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">No email</span>
                          )}
                          {customer.phone ? (
                            <div className="mt-1 flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic mt-1">No phone</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">£{customer.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{customer.orderCount}</TableCell>
                        <TableCell className="text-sm text-slate-600">{customer.lastVisit || 'Never'}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={customer.isActive ? 'default' : 'secondary'}
                            className="text-xs px-2 py-1"
                          >
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{customer.createdAt}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleViewCustomer(customer.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditCustomer(customer.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icons
function Upload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="4" x2="12" y2="15"></line>
    </svg>
  );
}

function Download() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="4" x2="12" y2="15"></line>
    </svg>
  );
}

function Mail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function Phone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 4 8-11 8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}