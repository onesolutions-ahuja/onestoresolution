import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Return {
  id: string;
  returnNumber: string;
  saleId: string;
  saleDate: string;
  customer: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  itemsCount: number;
  returnAmount: number;
  processedBy: string;
}

export default function ReturnsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockReturns: Return[] = [
          {
            id: 'RET-001',
            returnNumber: 'RET-2024-001',
            saleId: 'SAL-2024-015',
            saleDate: '2024-01-14',
            customer: 'John Smith',
            returnDate: '2024-01-15',
            status: 'completed',
            reason: 'Damaged goods',
            itemsCount: 2,
            returnAmount: 24.98,
            processedBy: 'staff1'
          },
          {
            id: 'RET-002',
            returnNumber: 'RET-2024-002',
            saleId: 'SAL-2024-018',
            saleDate: '2024-01-13',
            customer: 'Jane Doe',
            returnDate: '2024-01-16',
            status: 'approved',
            reason: 'Changed mind',
            itemsCount: 1,
            returnAmount: 12.99,
            processedBy: 'manager'
          },
          {
            id: 'RET-003',
            returnNumber: 'RET-2024-003',
            saleId: 'SAL-2024-020',
            saleDate: '2024-01-14',
            customer: 'Bob Wilson',
            returnDate: '2024-01-16',
            status: 'pending',
            reason: 'Wrong item received',
            itemsCount: 3,
            returnAmount: 45.00,
            processedBy: null
          },
          {
            id: 'RET-004',
            returnNumber: 'RET-2024-004',
            saleId: 'SAL-2024-022',
            saleDate: '2024-01-15',
            customer: 'Alice Johnson',
            returnDate: '2024-01-17',
            status: 'rejected',
            reason: 'Outside return window',
            itemsCount: 1,
            returnAmount: 8.50,
            processedBy: 'staff2'
          }
        ];

        setReturns(mockReturns);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load returns');
        toast({
          title: "Error",
          description: err.message || 'Failed to load returns',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter returns based on search and status
  const filteredReturns = returns.filter(ret => 
    ret.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.saleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ret.reason && ret.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(ret => 
    statusFilter === 'All' || ret.status === statusFilter.toLowerCase()
  );

  // Handle return actions
  const viewReturnDetails = (id: string) => {
    toast({
      title: "Return Details",
      description: `Viewing return details for ID: ${id}`,
      variant: "default"
    });
  };

  const handleEditReturn = (id: string) => {
    toast({
      title: "Edit Return",
      description: `Editing return for ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteReturn = async (id: string) => {
    // In real app: await api.delete(`/returns/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setReturns(returns.filter(r => r.id !== id));
      toast({
        title: "Return Deleted",
        description: "Return has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete return',
        variant: "destructive"
      });
    }
  };

  const handleApproveReturn = (id: string) => {
    // In real app: update status via API
    setReturns(returns.map(ret => 
      ret.id === id ? { ...ret, status: 'approved' } : ret
    ));
    
    toast({
      title: "Return Approved",
      description: "Return has been approved for processing",
      variant: "default"
    });
  };

  const handleRejectReturn = (id: string) => {
    // In real app: update status via API
    setReturns(returns.map(ret => 
      ret.id === id ? { ...ret, status: 'rejected' } : ret
    ));
    
    toast({
      title: "Return Rejected",
      description: "Return has been rejected",
      variant: "destructive"
    });
  };

  const handleCompleteReturn = (id: string) => {
    // In real app: update status via API
    setReturns(returns.map(ret => 
      ret.id === id ? { ...ret, status: 'completed' } : ret
    ));
    
    toast({
      title: "Return Completed",
      description: "Return has been completed and refunded",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Returns Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add return modal would go here
            toast({
              title: "New Return",
              description: "Opening new return form",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> New Return
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
                title: "Export Returns",
                description: "Exporting return data",
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Returns</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by return number, sale ID, customer, or reason..."
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
                  // Refresh returns
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast({
                      title: "Returns Refreshed",
                      description: "Returns have been refreshed",
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
                    title: "Returns Report",
                    description: "Generating returns report",
                    variant: "default"
                  });
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Returns ({filteredReturns.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && returns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading returns...</p>
            </div>
          ) : (
            <>
              {filteredReturns.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No returns match the current filters
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Return Number</TableHead>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Reason</TableHead>
                      <TableHead className="w-20">Items Count</TableHead>
                      <TableHead className="w-20">Return Amount</TableHead>
                      <TableHead className="w-20">Processed By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((ret) => (
                      <TableRow key={ret.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{ret.returnNumber}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ret.saleId}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ret.customer}</TableCell>
                        <TableCell className="text-center">{ret.returnDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={ret.status === 'pending' ? 'secondary' : ret.status === 'approved' ? 'default' : ret.status === 'rejected' ? 'destructive' : 'default'}
                            className="text-xs px-2 py-1"
                          >
                            {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{ret.reason}</TableCell>
                        <TableCell className="text-center">{ret.itemsCount}</TableCell>
                        <TableCell className="text-right font-medium">£{ret.returnAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ret.processedBy || '-'}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => viewReturnDetails(ret.id)}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditReturn(ret.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          {ret.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleApproveReturn(ret.id)}
                                className="p-1 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleRejectReturn(ret.id)}
                                className="p-1 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          {ret.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleCompleteReturn(ret.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteReturn(ret.id)}
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

function AlertTriangle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4l3 3"></path>
      <path d="M12 17h.01"></path>
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