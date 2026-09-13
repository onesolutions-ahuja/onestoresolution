import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, RefreshCw, BarChart3, ChartBar, ClipboardList, Calendar, DollarSign, AlertTriangle, Users, Truck } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  format: 'pdf' | 'excel' | 'csv';
  isScheduled: boolean;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState('today'); // today, week, month, custom

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockReports: Report[] = [
          {
            id: 'REP-001',
            name: 'Daily Sales Summary',
            description: 'Summary of daily sales, payments, and taxes',
            category: 'Sales',
            lastGenerated: '2024-01-16 08:00:00',
            frequency: 'daily',
            format: 'pdf',
            isScheduled: true
          },
          {
            id: 'REP-002',
            name: 'Weekly Inventory Report',
            description: 'Stock levels, movements, and valuation',
            category: 'Inventory',
            lastGenerated: '2024-01-15 09:00:00',
            frequency: 'weekly',
            format: 'excel',
            isScheduled: true
          },
          {
            id: 'REP-003',
            name: 'Monthly Sales Trends',
            description: 'Sales performance trends and forecasts',
            category: 'Sales',
            lastGenerated: '2024-01-01 10:00:00',
            frequency: 'monthly',
            format: 'pdf',
            isScheduled: true
          },
          {
            id: 'REP-004',
            name: 'Top Selling Products',
            description: 'Ranking of products by sales volume and revenue',
            category: 'Sales',
            lastGenerated: '2024-01-14 14:30:00',
            frequency: 'on-demand',
            format: 'excel',
            isScheduled: false
          },
          {
            id: 'REP-005',
            name: 'Supplier Performance',
            description: 'On-time delivery, quality, and pricing analysis',
            category: 'Suppliers',
            lastGenerated: '2024-01-10 11:00:00',
            frequency: 'monthly',
            format: 'pdf',
            isScheduled: true
          },
          {
            id: 'REP-006',
            name: 'Customer Loyalty Report',
            description: 'Repeat customers, average spend, and retention',
            category: 'Customers',
            lastGenerated: '2024-01-12 16:45:00',
            frequency: 'weekly',
            format: 'csv',
            isScheduled: false
          },
          {
            id: 'REP-007',
            name: 'Tax/VAT Summary',
            description: 'Tax collected, refunds, and liabilities',
            category: 'Finance',
            lastGenerated: '2024-01-16 07:30:00',
            frequency: 'daily',
            format: 'pdf',
            isScheduled: true
          },
          {
            id: 'REP-008',
            name: 'Employee Performance',
            description: 'Sales per employee, transactions, and efficiency',
            category: 'Staff',
            lastGenerated: '2024-01-08 09:00:00',
            frequency: 'monthly',
            format: 'excel',
            isScheduled: true
          }
        ];

        setReports(mockReports);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
        toast({
          title: "Error",
          description: err.message || 'Failed to load reports',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter reports based on search and category
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(report => 
    activeTab === 'all' || report.category.toLowerCase() === activeTab.toLowerCase()
  );

  // Handle report actions
  const runReport = (id: string) => {
    toast({
      title: "Running Report",
      description: `Generating report: ${reports.find(r => r.id === id)?.name}`,
      variant: "default"
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Report has been generated and is ready for download",
        variant: "default"
      });
    }, 2000);
  };

  const scheduleReport = (id: string) => {
    toast({
      title: "Report Scheduled",
      description: `Report will be generated automatically`,
      variant: "default"
    });
    
    setReports(reports.map(report => 
      report.id === id ? { ...report, isScheduled: true } : report
    ));
  };

  const unscheduleReport = (id: string) => {
    toast({
      title: "Report Unscheduled",
      description: `Report will no longer be generated automatically`,
      variant: "default"
    });
    
    setReports(reports.map(report => 
      report.id === id ? { ...report, isScheduled: false } : report
    ));
  };

  const viewReportDetails = (id: string) => {
    toast({
      title: "Report Details",
      description: `Viewing details for report: ${reports.find(r => r.id === id)?.name}`,
      variant: "default"
    });
  };

  const exportReport = (id: string) => {
    toast({
      title: "Exporting Report",
      description: `Exporting report in selected format`,
      variant: "default"
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Report has been exported successfully",
        variant: "default"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => {
            // Add custom report modal would go here
            toast({
              title: "New Report",
              description: "Opening new report builder",
              variant: "default"
            });
          }}>
            <Plus className="mr-2 h-4 w-4" /> New Report
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
                title: "Export Reports",
                description: "Exporting report definitions",
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
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Search Reports:</label>
          <Input
            type="text"
            placeholder="Search by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
          />
          
          <div className="relative ml-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3]"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            {dateRange === 'custom' && (
              <div className="mt-2">
                <input
                  type="date"
                  placeholder="Start date"
                  className="mr-2 rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] w-1/2"
                />
                <input
                  type="date"
                  placeholder="End date"
                  className="rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] w-1/2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Report Categories */}
      <div className="mb-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 border-b border-[#E2E8F0]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* All reports */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => viewReportDetails(report.id)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{report.name}</h3>
                        <p className="text-sm text-slate-600">{report.description}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={report.isScheduled ? "text-green-600" : "text-slate-500"}>
                          {report.isScheduled ? "⏰ Scheduled" : "⚡ On Demand"}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-400">{report.frequency}</span>
                        <span className="text-slate-400">|</span>
                        <span className={report.format === 'pdf' ? 'text-red-600' : report.format === 'excel' ? 'text-green-600' : 'text-blue-600'}>
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Last Generated: {report.lastGenerated || 'Never'}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => runReport(report.id)}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Run
                        </Button>
                        {report.isScheduled ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => unscheduleReport(report.id)}
                            className="p-1"
                          >
                            <AlertTriangle className="h-3 w-3 text-slate-600" /> Unschedule
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => scheduleReport(report.id)}
                            className="p-1"
                          >
                            <Calendar className="h-3 w-3 text-slate-600" /> Schedule
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => exportReport(report.id)}
                          className="p-1"
                        >
                          <Download className="h-3 w-3" /> Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            {/* Sales reports only */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => viewReportDetails(report.id)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{report.name}</h3>
                        <p className="text-sm text-slate-600">{report.description}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={report.isScheduled ? "text-green-600" : "text-slate-500"}>
                          {report.isScheduled ? "⏰ Scheduled" : "⚡ On Demand"}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-400">{report.frequency}</span>
                        <span className="text-slate-400">|</span>
                        <span className={report.format === 'pdf' ? 'text-red-600' : report.format === 'excel' ? 'text-green-600' : 'text-blue-600'}>
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Last Generated: {report.lastGenerated || 'Never'}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => runReport(report.id)}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Run
                        </Button>
                        {report.isScheduled ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => unscheduleReport(report.id)}
                            className="p-1"
                          >
                            <AlertTriangle className="h-3 w-3 text-slate-600" /> Unschedule
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => scheduleReport(report.id)}
                            className="p-1"
                          >
                            <Calendar className="h-3 w-3 text-slate-600" /> Schedule
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => exportReport(report.id)}
                          className="p-1"
                        >
                          <Download className="h-3 w-3" /> Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would follow similar pattern - simplified for brevity */}
          <TabsContent value="inventory">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900">Inventory Reports</h3>
              <p className="text-slate-600">Showing inventory-related reports</p>
              {/* Inventory reports would be filtered here */}
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900">Supplier Reports</h3>
              <p className="text-slate-600">Showing supplier-related reports</p>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900">Customer Reports</h3>
              <p className="text-slate-600">Showing customer-related reports</p>
            </div>
          </TabsContent>

          <TabsContent value="finance">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900">Financial Reports</h3>
              <p className="text-slate-600">Showing finance-related reports</p>
            </div>
          </TabsContent>

          <TabsContent value="staff">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900">Staff Reports</h3>
              <p className="text-slate-600">Showing staff-related reports</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-600">Reports Generated Today</h3>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-slate-900">
            3
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-600">Scheduled Reports</h3>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-slate-900">
            4
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-600">Most Popular Report</h3>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-slate-900">
            Daily Sales
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-600">Avg. Generation Time</h3>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-slate-900">
            2.3s
          </CardContent>
        </Card>
      </div>
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

function ChartBar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="4" height="18"></rect>
      <rect x="10" y="2" width="4" height="20"></rect>
      <rect x="17" y="9" width="4" height="15"></rect>
    </svg>
  );
}

function ClipboardList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="12" height="16" rx="2"></rect>
      <path d="M4 6h2v12H4V6z"></path>
    </svg>
  );
}

function Calendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="4" y1="10" x2="20" y2="10"></line>
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

function AlertTriangle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4l3 3"></path>
      <path d="M12 17h.01"></path>
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

function Truck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="12" rx="2"></rect>
      <path d="M2 8h20v9H2V8z"></path>
      <path d="M8 11h8"></path>
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