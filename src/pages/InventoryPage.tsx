import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, RefreshCw, Upload, Download } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  barcode: string | null;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  category: string;
  supplier: string;
  unitCost: number;
  lastUpdated: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockInventory: InventoryItem[] = [
          {
            id: 'INV-001',
            productName: 'Organic Bananas',
            sku: 'BAN-ORG-001',
            barcode: '0012345678905',
            currentStock: 25,
            minStock: 10,
            maxStock: 100,
            location: 'Aisle 1, Shelf 3',
            category: 'Produce',
            supplier: 'FreshFarms Ltd',
            unitCost: 0.50,
            lastUpdated: '2024-01-15 08:30'
          },
          {
            id: 'INV-002',
            productName: 'Premium Coffee Beans',
            sku: 'COF-PRE-005',
            barcode: '0012345678912',
            currentStock: 12,
            minStock: 5,
            maxStock: 50,
            location: 'Aisle 3, Shelf 1',
            category: 'Beverages',
            supplier: 'BeanThere Co',
            unitCost: 8.00,
            lastUpdated: '2024-01-14 16:45'
          },
          {
            id: 'INV-003',
            productName: 'Whole Milk 2L',
            sku: 'MILK-WHL-002',
            barcode: '0012345678929',
            currentStock: 18,
            minStock: 8,
            maxStock: 60,
            location: 'Cooler 2, Shelf 2',
            category: 'Dairy',
            supplier: 'MooMoo Dairy',
            unitCost: 1.80,
            lastUpdated: '2024-01-15 07:15'
          },
          {
            id: 'INV-004',
            productName: 'Whole Wheat Bread',
            sku: 'BREAD-WHT-003',
            barcode: '0012345678936',
            currentStock: 8,
            minStock: 5,
            maxStock: 40,
            location: 'Aisle 2, Shelf 4',
            category: 'Bakery',
            supplier: 'BreadBasket Inc',
            unitCost: 2.00,
            lastUpdated: '2024-01-15 06:00'
          },
          {
            id: 'INV-005',
            productName: 'Free Range Eggs 12pk',
            sku: 'EGG-FRE-004',
            barcode: '0012345678943',
            currentStock: 30,
            minStock: 10,
            maxStock: 80,
            location: 'Cooler 1, Shelf 3',
            category: 'Dairy',
            supplier: 'HappyHens Ltd',
            unitCost: 3.50,
            lastUpdated: '2024-01-15 09:20'
          }
        ];

        setInventory(mockInventory);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory');
        toast({
          title: "Error",
          description: err.message || 'Failed to load inventory',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter inventory based on search and location
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.barcode && item.barcode.includes(searchQuery));
    
    const matchesLocation = selectedLocation === 'All' || item.location.includes(selectedLocation);
    
    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = ['All', ...new Set(inventory.map(item => item.location.split(',')[0]))];

  // Handle inventory actions
  const handleAdjustStock = (id: string) => {
    toast({
      title: "Stock Adjustment",
      description: `Opening stock adjustment for item ID: ${id}`,
      variant: "default"
    });
  };

  const handleViewHistory = (id: string) => {
    toast({
      title: "Stock History",
      description: `Viewing stock history for item ID: ${id}`,
      variant: "default"
    });
  };

  const handleTransferStock = (id: string) => {
    toast({
      title: "Stock Transfer",
      description: `Opening stock transfer for item ID: ${id}`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add inventory item modal would go here
            toast({
              title: "Add Inventory Item",
              description: "Opening add inventory form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
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
                title: "Export Inventory",
                description: "Exporting inventory data",
                variant: "default"
              });
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Inventory</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by product name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3]"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Actions</label>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Refresh inventory
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast({
                      title: "Inventory Refreshed",
                      description: "Inventory data has been refreshed",
                      variant: "default"
                    });
                  }, 1000);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Low stock report
                  toast({
                    title: "Low Stock Report",
                    description: "Generating low stock report",
                    variant: "default"
                  });
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Low Stock
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Inventory Items ({filteredInventory.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading inventory...</p>
            </div>
          ) : (
            <>
              {filteredInventory.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No inventory items match the current filters
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Product Name</TableHead>
                      <TableHead className="w-20">SKU</TableHead>
                      <TableHead className="w-20">Barcode</TableHead>
                      <TableHead className="text-center w-16">Stock</TableHead>
                      <TableHead className="text-center w-16">Min/Max</TableHead>
                      <TableHead className="w-20">Location</TableHead>
                      <TableHead className="w-20">Category</TableHead>
                      <TableHead className="w-20">Supplier</TableHead>
                      <TableHead className="w-20">Unit Cost</TableHead>
                      <TableHead className="w-20">Last Updated</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                        <TableCell className="text-sm text-slate-500">{item.sku}</TableCell>
                        <TableCell className="text-sm text-slate-500">{item.barcode || '-'}</TableCell>
                        <TableCell className="text-center font-medium">
                          {item.currentStock <= item.minStock ? (
                            <Badge variant="destructive" className="text-xs px-2 py-1">
                              LOW ({item.currentStock})
                            </Badge>
                          ) : (
                            <span className={item.currentStock < item.minStock * 1.5 ? "text-orange-600" : "text-green-600"} font-medium>
                              {item.currentStock}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {item.minStock}/{item.maxStock}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{item.location}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.category}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.supplier}</TableCell>
                        <TableCell className="text-right">£{item.unitCost.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.lastUpdated}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleAdjustStock(item.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Adjust
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleViewHistory(item.id)}
                            className="p-1"
                          >
                            <RefreshCw className="h-3 w-3 text-slate-600" /> History
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleTransferStock(item.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Upload className="h-3 w-3" /> Transfer
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