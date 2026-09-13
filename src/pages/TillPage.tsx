import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2, RefreshCw, Banknote, Clock, Upload, Download } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Till {
  id: string;
  tillNumber: string;
  status: 'closed' | 'open';
  openedAt: string | null;
  closedAt: string | null;
  openedBy: string;
  closedBy: string | null;
  openingBalance: number;
  closingBalance: number;
  cashIn: number;
  cashOut: number;
  salesTotal: number;
  variance: number;
}

interface CashMovement {
  id: string;
  tillId: string;
  type: 'cash-in' | 'cash-out';
  amount: number;
  description: string;
  timestamp: string;
  processedBy: string;
}

export default function TillPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [till, setTill] = useState<Till | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(''); // For filtering movements

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockTill: Till = {
          id: 'TILL-001',
          tillNumber: 'TILL-01',
          status: 'open',
          openedAt: '2024-01-16 08:00:00',
          closedAt: null,
          openedBy: 'staff1',
          closedBy: null,
          openingBalance: 200.00,
          closingBalance: 0, // Will be calculated when closed
          cashIn: 0,
          cashOut: 0,
          salesTotal: 0,
          variance: 0
        };

        const mockCashMovements: CashMovement[] = [
          {
            id: 'CM-001',
            tillId: 'TILL-001',
            type: 'cash-in',
            amount: 50.00,
            description: 'Float top-up',
            timestamp: '2024-01-16 07:55:00',
            processedBy: 'staff1'
          },
          {
            id: 'CM-002',
            tillId: 'TILL-001',
            type: 'cash-out',
            amount: 20.00,
            description: 'Paid for supplier invoice',
            timestamp: '2024-01-16 09:30:00',
            processedBy: 'staff1'
          },
          {
            id: 'CM-003',
            tillId: 'TILL-001',
            type: 'cash-in',
            amount: 100.00,
            description: 'Customer refund',
            timestamp: '2024-01-16 11:15:00',
            processedBy: 'staff2'
          }
        ];

        setTill(mockTill);
        setCashMovements(mockCashMovements);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load till data');
        toast({
          title: "Error",
          description: err.message || 'Failed to load till data',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter cash movements based on date
  const filteredMovements = cashMovements.filter(movement => {
    if (!selectedDate) return true;
    const movementDate = movement.timestamp.split(' ')[0];
    return movementDate === selectedDate;
  });

  // Calculate till totals
  const calculateTillTotals = () => {
    if (!till) return null;
    
    const cashIn = cashMovements.reduce((sum, m) => 
      m.type === 'cash-in' ? sum + m.amount : sum, 0);
    
    const cashOut = cashMovements.reduce((sum, m) => 
      m.type === 'cash-out' ? sum + m.amount : sum, 0);
    
    // In real app, salesTotal would come from POS sales
    const salesTotal = 1250.50; // Mock value
    
    const expectedClosing = till.openingBalance + cashIn - cashOut + salesTotal;
    const variance = 0; // In real app, this would be actual counted - expected
    
    return {
      ...till,
      cashIn,
      cashOut,
      salesTotal,
      variance,
      closingBalance: expectedClosing + variance
    };
  };

  const tillWithTotals = calculateTillTotals();

  // Handle till actions
  const handleOpenTill = () => {
    // In real app: POST /till/open
    toast({
      title: "Till Opened",
      description: "Till has been opened for business",
      variant: "default"
    });
    
    // Update till status
    setTill(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'open',
        openedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        openedBy: user?.username || 'staff1'
      };
    });
  };

  const handleCloseTill = () => {
    // In real app: POST /till/close
    if (!tillWithTotals) return;
    
    toast({
      title: "Till Closed",
      description: `Till closed with variance of £{tillWithTotals.variance.toFixed(2)}`,
      variant: "default"
    });
    
    // Update till status
    setTill(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'closed',
        closedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        closedBy: user?.username || 'staff1',
        closingBalance: tillWithTotals.closingBalance
      };
    });
  };

  const handleCashIn = () => {
    toast({
      title: "Cash In",
      description: "Opening cash in form",
      variant: "default"
    });
  };

  const handleCashOut = () => {
    toast({
      title: "Cash Out",
      description: "Opening cash out form",
      variant: "default"
    });
  };

  const handleCountTill = () => {
    toast({
      title: "Count Till",
      description: "Opening till count form",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Till Management</h1>
        <div className="flex items-center space-x-3">
          <Button
            variant={tillWithTotals?.status === 'open' ? 'destructive' : 'default'}
            onClick={tillWithTotals?.status === 'open' ? handleCloseTill : handleOpenTill}
            className="flex-1 px-4 py-2"
          >
            {tillWithTotals?.status === 'open' ? (
              <>
                <Clock className="mr-2 h-4 w-4" /> Close Till
              </>
            ) : (
              <>
                <Banknote className="mr-2 h-4 w-4" /> Open Till
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCashIn}
          >
            <Plus className="mr-2 h-4 w-4" /> Cash In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCashOut}
          >
            <Minus className="mr-2 h-4 w-4" /> Cash Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCountTill}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Count Till
          </Button>
        </div>
      </div>

      {/* Till Status and Balance */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900">Till Status</h3>
            <p className={tillWithTotals?.status === 'open' ? "text-green-600 font-bold text-xl" : "text-red-600 font-bold text-xl"}>
              {tillWithTotals?.status === 'open' ? 'OPEN' : 'CLOSED'}
            </p>
            <p className="text-sm text-slate-500">
              {tillWithTotals ? `Till #${tillWithTotals.tillNumber}` : 'No till data'}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900">Opening Balance</h3>
            <p className="text-2xl font-bold text-slate-900">
              £{tillWithTotals?.openingBalance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-slate-500">At opening</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900">Current Balance</h3>
            <p className="text-2xl font-bold text-slate-900">
              £{(tillWithTotals?.openingBalance || 0) + (tillWithTotals?.cashIn || 0) - (tillWithTotals?.cashOut || 0) + (tillWithTotals?.salesTotal || 0)}.toFixed(2)
            </p>
            <p className="text-sm text-slate-500">Including sales</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900">Closing Balance</h3>
            <p className="text-2xl font-bold text-slate-900">
              £{tillWithTotals?.closingBalance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-slate-500">Expected when closed</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-700">Variance:</span>
            <span className={tillWithTotals?.variance !== 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              £{Math.abs(tillWithTotals?.variance || 0).toFixed(2)} 
              {tillWithTotals?.variance > 0 ? '(over)' : tillWithTotals?.variance < 0 ? '(short)' : '(balanced)'}
            </span>
          </div>
        </div>
      </div>

      {/* Date Filter for Movements */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-slate-700">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-2 rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate('')}
          >
            Clear Filter
          </Button>
        </div>
      </div>

      {/* Cash Movements Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Cash Movements ({filteredMovements.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && cashMovements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading cash movements...</p>
            </div>
          ) : (
            <>
              {filteredMovements.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No cash movements match the current filter
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Timestamp</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Amount</TableHead>
                      <TableHead className="w-20">Processed By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="text-sm text-slate-600">{movement.timestamp}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={movement.type === 'cash-in' ? 'default' : 'destructive'}
                            className="text-xs px-2 py-1"
                          >
                            {movement.type === 'cash-in' ? 'CASH IN' : 'CASH OUT'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{movement.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.type === 'cash-in' ? 
                            `+£{movement.amount.toFixed(2)}` : 
                            `-£{movement.amount.toFixed(2)}`}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{movement.processedBy}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              // View movement details
                              toast({
                                title: "Movement Details",
                                description: `Viewing details for movement ID: ${movement.id}`,
                                variant: "default"
                              });
                            }}
                            className="p-1"
                          >
                            <Eye className="h-3 w-3 text-slate-600" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              // Edit movement
                              toast({
                                title: "Edit Movement",
                                description: `Editing movement ID: ${movement.id}`,
                                variant: "default"
                              });
                            }}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              // Delete movement
                              toast({
                                title: "Delete Movement",
                                description: `Deleting movement ID: ${movement.id}`,
                                variant: "destructive"
                              });
                            }}
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
        <CardFooter className="pt-4 border-t border-[#E2E8F0]">
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Import/export functionality
                toast({
                  title: "Import/Export",
                  description: "Opening import/export options for till data",
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
                  title: "Export Till Data",
                  description: "Exporting till movements and summary",
                  variant: "default"
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardFooter>
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

function Banknote() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="12" rx="2"></rect>
      <path d="M8 8h8"></path>
      <path d="M8 12h8"></path>
      <path d="M8 16h8"></path>
    </svg>
  );
}

function Clock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function Plus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
}

function Minus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="12" x2="16" y2="12"></line>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 5 6 5 20 9 20 9 6 13 6 13 20 17 20 17 6 19 6 19 20 21 20 21 6 23 6 23 4 3 4"></polygon>
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