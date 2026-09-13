import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, RefreshCw, DollarSign } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Refund {
  id: string;
  refundNumber: string;
  saleId: string;
  saleDate: string;
  customer: string;
  refundDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  refundAmount: number;
  paymentMethod: 'original' | 'store-credit' | 'exchange';
  processedBy: string;
}

export default function RefundsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockRefunds: Refund[] = [
          {
            id: 'REF-001',
            refundNumber: 'REF-2024-001',
            saleId: 'SAL-2024-015',
            saleDate: '2024-01-14',
            customer: 'John Smith',
            refundDate: '2024-01-15',
            status: 'completed',
            reason: 'Damaged goods',
            refundAmount: 24.98,
            paymentMethod: 'original',
            processedBy: 'staff1'
          },
          {
            id: 'REF-002',
            refundNumber: 'REF-2024-002',
            saleId: 'SAL-2024-018',
            saleDate: '2024-01-13',
            customer: 'Jane Doe',
            refundDate: '2024-01-16',
            status: 'approved',
            reason: 'Changed mind',
            refundAmount: 12.99,
            paymentMethod: 'store-credit',
            processedBy: 'manager'
          },
          {
            id: 'REF-003',
            refundNumber: 'REF-2024-003',
            saleId: 'SAL-2024-020',
            saleDate: '2024-01-14',
            customer: 'Bob Wilson',
            refundDate: '2024-01-16',
            status: 'pending',
            reason: 'Wrong item received',
            refundAmount: 45.00,
            paymentMethod: 'original',
            processedBy: null
          },
          {
            id: 'REF-004',
            refundNumber: 'REF-2024-004',
            saleId: 'SAL-2024-022',
            saleDate: '2024-01-15',
            customer: 'Alice Johnson',
            refundDate: '2024-01-17',
            status: 'rejected',
            reason: 'Outside return window',
            refundAmount: 8.50,
            paymentMethod: 'exchange',
            processedBy: 'staff2'
          }
        ];

        setRefunds(mockRefunds);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load refunds');
        toast({
          title: "Error",
          description: err.message || 'Failed to load refunds',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter refunds based on search and status
  const filteredRefunds = refunds.filter(ref => 
    ref.refundNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.saleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ref.reason && ref.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(ref => 
    statusFilter === 'All' || ref.status === statusFilter.toLowerCase()
  );

  // Handle refund actions
  const viewRefundDetails = (id: string) => {
    toast({
      title: "Refund Details",
      description: `Viewing refund details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditRefund = (id: string) => {
    toast({
      title: "Edit Refund",
      description: `Editing refund for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteRefund = async (id: string) => {
    // In real app: await api.delete(`/refunds/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRefunds(refunds.filter(r => r.id !== id));
            toast({
              title: "Refund Deleted",
              description: "Refund has been removed",
              variant: "default"
            });
          } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete refund',
        variant: "destructive"
      });
    }
  };

  const handleApproveRefund = (id: string) => {
    // In real app: update status via API
    setRefunds(refunds.map(ref => 
      ref.id === id ? { ...ref, status: 'approved' } : ref
    ));
    
    toast({
      title: "Refund Approved",
      description: "Refund has been approved for processing",
      variant: "default"
    });
  };

  const handleRejectRefund = (id: string) => {
    // In real app: update status via API
    setRefunds(refunds.map(ref => 
      ref.id === id ? { ...ref, status: 'rejected' } : ref
    ));
    
    toast({
      title: "Refund Rejected",
      description: "Refund has been rejected",
      variant: "destructive"
    });
  };

  const handleCompleteRefund = (id: string) => {
    // In real app: update status via API
    setRefunds(refunds.map(ref => 
      ref.id === id ? { ...ref, status: 'completed' } : ref
    ));
    
    toast({
      title: "Refund Completed",
      description: "Refund has been completed and processed",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Refunds Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add refund modal would go here
            toast({
              title: "New Refund",
              description: "Opening new refund form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> New Refund
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
                title: "Export Refunds",
                description: "Exporting refund data",
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Refunds</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by refund number, sale ID, customer, or reason..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Actions</label>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Refresh refunds
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast({
                      title: "Refunds Refreshed",
                      description: "Refunds have been refreshed",
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
                    title: "Refunds Report",
                    description: "Generating refunds report",
                    variant: "default"
                  });
                }}
              >
                <DollarSign className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Refunds ({filteredRefunds.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && refunds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading refunds...</p>
            </div>
          ) : (
            <>
              {filteredRefunds.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No refunds match the current filters
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Refund Number</TableHead>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Refund Date</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Reason</TableHead>
                      <TableHead className="w-20">Refund Amount</TableHead>
                      <TableHead className="w-20">Payment Method</TableHead>
                      <TableHead className="w-20">Processed By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRefunds.map((ref) => (
                      <TableRow key={ref.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{ref.refundNumber}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ref.saleId}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ref.customer}</TableCell>
                        <TableCell className="text-center">{ref.refundDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={ref.status === 'pending' ? 'secondary' : ref.status === 'approved' ? 'default' : ref.status === 'rejected' ? 'destructive' : 'default'}
                            className="text-xs px-2 py-1"
                          >
                            {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{ref.reason}</TableCell>
                        <TableCell className="text-right font-medium">£{ref.refundAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <span className={ref.paymentMethod === 'original' ? 'text-green-600' : ref.paymentMethod === 'store-credit' ? 'text-blue-600' : 'text-purple-600'}>
                            {ref.paymentMethod === 'original' ? 'Original Payment' : ref.paymentMethod === 'store-credit' ? 'Store Credit' : 'Exchange'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{ref.processedBy || '-'}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => viewRefundDetails(ref.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditRefund(ref.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          {ref.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleApproveRefund(ref.id)}
                                className="p-1 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleRejectRefund(ref.id)}
                                className="p-1 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          {ref.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleCompleteRefund(ref.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteRefund(ref.id)}
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

function DollarSign() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15 9H9L12 2Z"></path>
      <path d="M12 22L15 15H9L12 22Z"></path>
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

function X() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function CheckCircle2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4"></path>
    </svg>
  );
}