import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, ClipboardList, Truck } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  itemsCount: number;
  createdBy: string;
}

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockPurchaseOrders: PurchaseOrder[] = [
          {
            id: 'PO-001',
            poNumber: 'PO-2024-001',
            supplier: 'FreshFarms Ltd',
            orderDate: '2024-01-10',
            expectedDate: '2024-01-17',
            status: 'received',
            totalAmount: 1250.50,
            itemsCount: 15,
            createdBy: 'admin'
          },
          {
            id: 'PO-002',
            poNumber: 'PO-2024-002',
            supplier: 'BeanThere Co',
            orderDate: '2024-01-11',
            expectedDate: '2024-01-18',
            status: 'confirmed',
            totalAmount: 890.25,
            itemsCount: 8,
            createdBy: 'manager'
          },
          {
            id: 'PO-003',
            poNumber: 'PO-2024-003',
            supplier: 'MooMoo Dairy',
            orderDate: '2024-01-12',
            expectedDate: '2024-01-19',
            status: 'sent',
            totalAmount: 450.75,
            itemsCount: 12,
            createdBy: 'staff1'
          },
          {
            id: 'PO-004',
            poNumber: 'PO-2024-004',
            supplier: 'BreadBasket Inc',
            orderDate: '2024-01-13',
            expectedDate: '2024-01-20',
            status: 'draft',
            totalAmount: 320.00,
            itemsCount: 6,
            createdBy: 'staff2'
          },
          {
            id: 'PO-005',
            poNumber: 'PO-2024-005',
            supplier: 'HappyHens Ltd',
            orderDate: '2024-01-14',
            expectedDate: '2024-01-21',
            status: 'cancelled',
            totalAmount: 150.00,
            itemsCount: 4,
            createdBy: 'admin'
          }
        ];

        setPurchaseOrders(mockPurchaseOrders);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load purchase orders');
        toast({
          title: "Error",
          description: err.message || 'Failed to load purchase orders',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter purchase orders based on search and status
  const filteredPurchaseOrders = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(po => 
    statusFilter === 'All' || po.status === statusFilter.toLowerCase()
  );

  // Handle purchase order actions
  const viewPODetails = (id: string) => {
    toast({
      title: "PO Details",
      description: `Viewing purchase order details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditPO = (id: string) => {
    toast({
      title: "Edit PO",
      description: `Editing purchase order for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeletePO = async (id: string) => {
    // In real app: await api.delete(`/purchase-orders/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      toast({
        title: "PO Deleted",
        description: "Purchase order has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete purchase order',
        variant: "destructive"
      });
    }
  };

  const handleReceivePO = (id: string) => {
    toast({
      title: "Receive PO",
      description: `Opening receive stock for PO ID: ${id}`,
      variant: "default"
    });
  };

  const handleSendPO = (id: string) => {
    toast({
      title: "Send PO",
      description: `Sending purchase order to supplier for ID: ${id}`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add PO modal would go here
            toast({
              title: "New Purchase Order",
              description: "Opening new purchase order form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> New PO
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
                title: "Export POs",
                description: "Exporting purchase order data",
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Search POs</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by PO number, supplier, or created by..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3]"
            >
              <option value="All">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Actions</label>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Refresh POs
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast({
                      title: "POs Refreshed",
                      description: "Purchase orders have been refreshed",
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
                  // Generate report
                  toast({
                    title: "PO Report",
                    description: "Generating purchase order report",
                    variant: "default"
                  });
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Purchase Orders ({filteredPurchaseOrders.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading purchase orders...</p>
            </div>
          ) : (
            <>
              {filteredPurchaseOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No purchase orders match the current filters
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="w-20">Order Date</TableHead>
                      <TableHead className="w-20">Expected Date</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Total Amount</TableHead>
                      <TableHead className="w-20">Items Count</TableHead>
                      <TableHead className="w-20">Created By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchaseOrders.map((po) => (
                      <TableRow key={po.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{po.poNumber}</TableCell>
                        <TableCell className="text-sm text-slate-600">{po.supplier}</TableCell>
                        <TableCell className="text-center">{po.orderDate}</TableCell>
                        <TableCell className="text-center">{po.expectedDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={po.status === 'draft' ? 'secondary' : po.status === 'sent' ? 'default' : po.status === 'confirmed' ? 'default' : po.status === 'received' ? 'default' : 'destructive'}
                            className="text-xs px-2 py-1"
                          >
                            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">£{po.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{po.itemsCount}</TableCell>
                        <TableCell className="text-sm text-slate-600">{po.createdBy}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => viewPODetails(po.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditPO(po.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          {po.status !== 'cancelled' && (
                            <>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleReceivePO(po.id)}
                                className="p-1 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Receive
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleSendPO(po.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50"
                              >
                                <Send className="h-3 w-3" /> Send
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeletePO(po.id)}
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

function BarChart3() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="3" x2="21" y2="21"></line>
    </svg>
  );
}

function Send() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" x3="2" y3="22"></line>
      <polyline points="22 2 15 22 2 22"></polyline>
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