import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, Truck } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  taxId: string | null;
  productsSupplied: number;
  rating: number; // 1-5 stars
  isActive: boolean;
  createdAt: string;
  lastOrderDate: string | null;
}

export default function SuppliersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name'); // name, productsSupplied, rating
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockSuppliers: Supplier[] = [
          {
            id: 'SUP-001',
            name: 'FreshFarms Ltd',
            contactPerson: 'David Green',
            email: 'david@freshfarms.co.uk',
            phone: '020 7946 0123',
            address: '45 Farm Lane',
            city: 'Kent',
            postalCode: 'ME14 5AA',
            taxId: 'GB123456789',
            productsSupplied: 24,
            rating: 4.8,
            isActive: true,
            createdAt: '2023-05-15',
            lastOrderDate: '2024-01-10'
          },
          {
            id: 'SUP-002',
            name: 'BeanThere Co',
            contactPerson: 'Maria Santos',
            email: 'maria@beanthere.co.uk',
            phone: '0161 496 0123',
            address: '78 Coffee Row',
            city: 'Manchester',
            postalCode: 'M1 2AA',
            taxId: 'GB987654321',
            productsSupplied: 12,
            rating: 4.9,
            isActive: true,
            createdAt: '2023-07-22',
            lastOrderDate: '2024-01-12'
          },
          {
            id: 'SUP-003',
            name: 'MooMoo Dairy',
            contactPerson: 'Tom Wilson',
            email: 'tom@moomoocdairy.co.uk',
            phone: '0121 555 0198',
            address: '12 Pasture Way',
            city: 'Birmingham',
            postalCode: 'B3 3AA',
            taxId: 'GB456789123',
            productsSupplied: 15,
            rating: 4.5,
            isActive: true,
            createdAt: '2023-03-10',
            lastOrderDate: '2024-01-11'
          },
          {
            id: 'SUP-004',
            name: 'BreadBasket Inc',
            contactPerson: 'Sarah Johnson',
            email: 'sarah@breadbasket.co.uk',
            phone: '0113 222 0147',
            address: '34 Bakery Street',
            city: 'Leeds',
            postalCode: 'LS2 4AA',
            taxId: 'GB789123456',
            productsSupplied: 8,
            rating: 4.2,
            isActive: true,
            createdAt: '2023-11-05',
            lastOrderDate: '2024-01-09'
          },
          {
            id: 'SUP-005',
            name: 'HappyHens Ltd',
            contactPerson: 'Robert Taylor',
            email: null,
            phone: '0141 333 0189',
            address: '56 Hen House Lane',
            city: 'Glasgow',
            postalCode: 'G2 5AA',
            taxId: null,
            productsSupplied: 5,
            rating: 3.8,
            isActive: false,
            createdAt: '2023-08-30',
            lastOrderDate: '2023-12-15'
          }
        ];

        setSuppliers(mockSuppliers);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load suppliers');
        toast({
          title: "Error",
          description: err.message || 'Failed to load suppliers',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort suppliers
  const filteredAndSortedSuppliers = suppliers
    .filter(supplier => 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      const valueA = sortBy === 'name' 
        ? a.name.toLowerCase()
        : sortBy === 'productsSupplied'
        ? a.productsSupplied
        : sortBy === 'rating'
        ? a.rating
        : a.id;
      
      const valueB = sortBy === 'name' 
        ? b.name.toLowerCase()
        : sortBy === 'productsSupplied'
        ? b.productsSupplied
        : sortBy === 'rating'
        ? b.rating
        : b.id;
      
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle supplier actions
  const viewSupplierDetails = (id: string) => {
    toast({
      title: "Supplier Details",
      description: `Viewing supplier details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditSupplier = (id: string) => {
    toast({
      title: "Edit Supplier",
      description: `Editing supplier details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteSupplier = async (id: string) => {
    // In real app: await api.delete(`/suppliers/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast({
        title: "Supplier Deleted",
        description: "Supplier has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete supplier',
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    // In real app: toggle status via API
    setSuppliers(suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, isActive: !supplier.isActive } : supplier
    ));
    
    toast({
      title: "Status Updated",
      description: "Supplier status has been updated",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Supplier Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add supplier modal would go here
            toast({
              title: "Add Supplier",
              description: "Opening add supplier form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
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
                title: "Export Suppliers",
                description: "Exporting supplier data",
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Suppliers</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, contact, or email..."
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
              <option value="productsSupplied">Products Supplied</option>
              <option value="rating">Rating</option>
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

      {/* Suppliers Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Suppliers ({filteredAndSortedSuppliers.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && suppliers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading suppliers...</p>
            </div>
          ) : (
            <>
              {filteredAndSortedSuppliers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No suppliers match the current search
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Supplier Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead className="w-20">Email</TableHead>
                      <TableHead className="w-20">Phone</TableHead>
                      <TableHead className="w-20">Products Supplied</TableHead>
                      <TableHead className="w-16">Rating</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Created At</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{supplier.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{supplier.contactPerson}</TableCell>
                        <TableCell className="text-sm text-slate-600">{supplier.email || '-'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{supplier.phone || '-'}</TableCell>
                        <TableCell className="text-center">{supplier.productsSupplied}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                filled={star <= supplier.rating}
                                size={12}
                                color={star <= Math.floor(supplier.rating) ? '#FBBF24' : supplier.rating % 1 >= 0.5 ? '#FBBF24' : '#E5E7EB'}
                              />
                            ))}
                            <span className="ml-1 text-sm text-slate-600">{supplier.rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={supplier.isActive ? 'default' : 'secondary'}
                            className="text-xs px-2 py-1"
                          >
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{supplier.createdAt}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => viewSupplierDetails(supplier.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditSupplier(supplier.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteSupplier(supplier.id)}
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

function Star({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={filled ? color : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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