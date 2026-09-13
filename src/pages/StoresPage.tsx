import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, RefreshCw, Store, MapPin, Users } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  manager: string | null;
  openedDate: string;
  isActive: boolean;
  totalSales: number;
  employeeCount: number;
}

export default function StoresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name'); // name, totalSales, employeeCount
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockStores: Store[] = [
          {
            id: 'STR-001',
            name: 'London Flagship',
            code: 'LDN-001',
            address: '123 Oxford Street',
            city: 'London',
            postalCode: 'W1D 2AB',
            country: 'United Kingdom',
            phone: '020 7946 0123',
            email: 'london@onestoresolution.com',
            manager: 'Sarah Johnson',
            openedDate: '2020-03-15',
            isActive: true,
            totalSales: 1250000.00,
            employeeCount: 25
            },
          {
            id: 'STR-002',
            name: 'Manchester Central',
            code: 'MCR-001',
            address: '45 Market Street',
            city: 'Manchester',
            postalCode: 'M1 1AA',
            country: 'United Kingdom',
            phone: '0161 496 0123',
            email: 'manchester@onestoresolution.com',
            manager: 'David Wilson',
            openedDate: '2021-07-22',
            isActive: true,
            totalSales: 890000.00,
            employeeCount: 18
          },
          {
            id: 'STR-003',
            name: 'Birmingham East',
            code: 'BHM-001',
            address: '78 New Street',
            city: 'Birmingham',
            postalCode: 'B2 4AA',
            country: 'United Kingdom',
            phone: '0121 555 0198',
            email: 'birmingham@onestoresolution.com',
            manager: 'Lisa Brown',
            openedDate: '2022-01-10',
            isActive: true,
            totalSales: 650000.00,
            employeeCount: 15
          },
          {
            id: 'STR-004',
            name: 'London Westfield',
            code: 'LDN-002',
            address: 'Westfield Shopping Centre',
            city: 'London',
            postalCode: 'W12 7GF',
            country: 'United Kingdom',
            phone: '020 8239 1234',
            email: 'westfield@onestoresolution.com',
            manager: 'Mike Davis',
            openedDate: '2023-03-15',
            isActive: true,
            totalSales: 980000.00,
            employeeCount: 22
          },
          {
            id: 'STR-005',
            name: 'Glasgow City',
            code: 'GLA-001',
            address: '23 Buchanan Street',
            city: 'Glasgow',
            postalCode: 'G1 3AA',
            country: 'United Kingdom',
            phone: '0141 333 0189',
            email: 'glasgow@onestoresolution.com',
            manager: 'Rachel Smith',
            openedDate: '2023-11-05',
            isActive: false, // Temporarily closed for renovation
            totalSales: 120000.00,
            employeeCount: 8
          }
        ];

        setStores(mockStores);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load stores');
        toast({
          title: "Error",
          description: err.message || 'Failed to load stores',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort stores
  const filteredAndSortedStores = stores
    .filter(store => 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.manager && store.manager.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      const valueA = sortBy === 'name' 
        ? a.name.toLowerCase()
        : sortBy === 'totalSales'
        ? a.totalSales
        : sortBy === 'employeeCount'
        ? a.employeeCount
        : a.openedDate;
      
      const valueB = sortBy === 'name' 
        ? b.name.toLowerCase()
        : sortBy === 'totalSales'
        ? b.totalSales
        : sortBy === 'employeeCount'
        ? b.employeeCount
        : b.openedDate;
      
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle store actions
  const viewStoreDetails = (id: string) => {
    toast({
      title: "Store Details",
      description: `Viewing store details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditStore = (id: string) => {
    toast({
      title: "Edit Store",
      description: `Editing store details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteStore = async (id: string) => {
    // In real app: await api.delete(`/stores/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStores(stores.filter(s => s.id !== id));
            toast({
              title: "Store Deleted",
              description: "Store has been removed",
              variant: "default"
            });
          } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete store',
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    // In real app: toggle status via API
    setStores(stores.map(store =>
      store.id === id ? { ...store, isActive: !store.isActive } : store
    ));
    
    toast({
      title: "Status Updated",
      description: "Store status has been updated",
      variant: "default"
    });
  };

  const handleSetAsCurrent = (id: string) => {
    // In real app: set as current store via context
    const store = stores.find(s => s.id === id);
    if (store) {
      // This would update the StoreContext
      toast({
        title: "Store Selected",
        description: `${store.name} is now the current store`,
        variant: "default"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Store Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add store modal would go here
            toast({
              title: "Add Store",
              description: "Opening add store form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Store
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
                title: "Export Stores",
                description: "Exporting store data",
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Stores</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, code, city, or manager..."
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
              <option value="totalSales">Total Sales</option>
              <option value="employeeCount">Employee Count</option>
              <option value="openedDate">Opened Date</option>
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

      {/* Stores Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Stores ({filteredAndSortedStores.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && stores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading stores...</p>
            </div>
          ) : (
            <>
              {filteredAndSortedStores.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No stores match the current search
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Store Name</TableHead>
                      <TableHead className="w-20">Store Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-20">Manager</TableHead>
                      <TableHead className="w-20">Opened Date</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Total Sales</TableHead>
                      <TableHead className="w-20">Employees</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedStores.map((store) => (
                      <TableRow key={store.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{store.name}</TableCell>
                        <TableCell className="text-sm text-slate-500">{store.code}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {store.city}, {store.postalCode}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{store.manager || 'Not assigned'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{store.openedDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={store.isActive ? 'default' : 'secondary'}
                            className="text-xs px-2 py-1"
                          >
                            {store.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">£{store.totalSales.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{store.employeeCount}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => viewStoreDetails(store.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditStore(store.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleSetAsCurrent(store.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Select
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteStore(store.id)}
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

function RefreshCw() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h5"></path>
    </svg>
  );
}

function Store() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12z"></path>
      <path d="M7 11h10"></path>
      <path d="M7 14h6"></path>
    </svg>
  );
}

function MapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15 9l3 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9l3-6z"></path>
    </svg>
  );
}

function Users() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <circle cx="20" cy="7" r="4"></circle>
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

function Edit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.364 5.636l-2.828 2.828-8.485-8.485L5.636 18.364l1.414 1.414L16.95 7.05z"></path>
      <path d="M11.364 15.364l1.414-1.414L3 7.364l-1.414 1.414 9.778 9.778z"></path>
    </svg>
  );
}

function Trash2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWeight="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 5 6 5 20 9 20 9 6 13 6 13 20 17 20 17 6 19 6 19 20 21 20 21 6 23 6 23 4 3 4"></polygon>
    </svg>
  );
}

function CheckCircle2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWeight="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4"></path>
    </svg>
  );
}