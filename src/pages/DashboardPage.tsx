import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Metric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface RecentSale {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const dateRange = searchParams.get('range') || 'today';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Mock dashboard data for now.
        // Replace this with API calls later when the backend dashboard
        // endpoints are ready.

        const mockMetrics: Metric[] = [
          {
            title: "Today's Revenue",
            value: '£2,450.00',
            change: 12.5,
            changeType: 'up',
            icon: TrendingUp,
            color: 'text-green-500',
          },
          {
            title: "Today's Sales",
            value: 24,
            change: 8.3,
            changeType: 'up',
            icon: DollarSign,
            color: 'text-blue-500',
          },
          {
            title: 'Total Products',
            value: 156,
            change: -2.1,
            changeType: 'down',
            icon: Users,
            color: 'text-purple-500',
          },
          {
            title: 'Low Stock Items',
            value: 5,
            change: 25.0,
            changeType: 'up',
            icon: AlertTriangle,
            color: 'text-red-500',
          },
        ];

        const mockRecentSales: RecentSale[] = [
          {
            id: 'SAL-001',
            date: '2024-01-15 14:30',
            customer: 'John Smith',
            amount: 89.99,
            status: 'completed',
            paymentMethod: 'Card',
          },
          {
            id: 'SAL-002',
            date: '2024-01-15 13:45',
            customer: 'Jane Doe',
            amount: 156.5,
            status: 'completed',
            paymentMethod: 'Cash',
          },
          {
            id: 'SAL-003',
            date: '2024-01-15 12:20',
            customer: 'Bob Wilson',
            amount: 45.0,
            status: 'pending',
            paymentMethod: 'Card',
          },
        ];

        const mockLowStock: LowStockItem[] = [
          {
            id: 'PROD-001',
            name: 'Organic Bananas',
            sku: 'BAN-ORG-001',
            currentStock: 3,
            minStock: 10,
            category: 'Produce',
          },
          {
            id: 'PROD-002',
            name: 'Premium Coffee Beans',
            sku: 'COF-PRE-005',
            currentStock: 2,
            minStock: 5,
            category: 'Beverages',
          },
        ];

        setMetrics(mockMetrics);
        setRecentSales(mockRecentSales);
        setLowStockItems(mockLowStock);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, user]);

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-200">
        <h3 className="text-red-800 font-medium mb-2">
          Error loading dashboard
        </h3>

        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          {user && (
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, {user.full_name || user.username}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">

          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-1 p-2 rounded hover:bg-[#F1F5F9] text-slate-600 hover:text-slate-900"
            >
              <span className="text-sm">
                {dateRange === 'today'
                  ? 'Today'
                  : dateRange === 'week'
                    ? 'This Week'
                    : 'This Month'}
              </span>

              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <Card key={metric.title} className="h-full">

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">

                  <div className="flex items-center space-x-2">

                    <MetricIcon
                      className={cn(
                        'h-5 w-5',
                        metric.color
                      )}
                    />

                    <h3
                      className={cn(
                        metric.title.length > 15
                          ? 'text-sm'
                          : 'text-base',
                        'font-medium text-slate-600'
                      )}
                    >
                      {metric.title}
                    </h3>

                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                  >
                    <RefreshCw className="h-3 w-3 text-slate-400" />
                  </Button>

                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-2xl font-bold text-slate-900">
                  {typeof metric.value === 'number'
                    ? metric.value.toLocaleString()
                    : metric.value}
                </p>
              </CardContent>

              <CardFooter className="pt-2">

                <div className="flex items-center justify-between text-sm w-full">

                  <span
                    className={cn(
                      'flex items-center space-x-1',
                      metric.changeType === 'up' &&
                        'text-green-600',
                      metric.changeType === 'down' &&
                        'text-red-600',
                      metric.changeType === 'neutral' &&
                        'text-slate-500'
                    )}
                  >
                    {metric.changeType === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : metric.changeType === 'down' ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}

                    <span>
                      {Math.abs(metric.change)}%
                    </span>
                  </span>

                  <span className="text-slate-500">
                    vs last period
                  </span>

                </div>

              </CardFooter>

            </Card>
          );
        })}

      </div>

      {/* Dashboard Tabs */}
      <div className="space-y-4">

        <Tabs
          defaultValue="overview"
          className="w-full"
        >

          <TabsList className="grid w-full grid-cols-3 border-b border-[#E2E8F0]">

            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>

            <TabsTrigger value="sales">
              Sales Trends
            </TabsTrigger>

            <TabsTrigger value="inventory">
              Inventory
            </TabsTrigger>

          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">

            <div className="space-y-6">

              {/* Recent Sales */}
              <div className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Sales
                </h2>

                {recentSales.length > 0 ? (

                  <Table className="w-full">

                    <TableHeader>

                      <TableRow>

                        <TableHead>
                          Date
                        </TableHead>

                        <TableHead>
                          Customer
                        </TableHead>

                        <TableHead className="text-right">
                          Amount
                        </TableHead>

                        <TableHead>
                          Status
                        </TableHead>

                        <TableHead>
                          Payment
                        </TableHead>

                      </TableRow>

                    </TableHeader>

                    <TableBody>

                      {recentSales.map((sale) => (

                        <TableRow key={sale.id}>

                          <TableCell className="text-sm text-slate-600">
                            {sale.date.split(' ')[0]}
                          </TableCell>

                          <TableCell className="font-medium text-slate-900">
                            {sale.customer}
                          </TableCell>

                          <TableCell className="text-sm font-medium text-right">
                            £{sale.amount.toFixed(2)}
                          </TableCell>

                          <TableCell>

                            <Badge
                              variant={
                                sale.status === 'completed'
                                  ? 'default'
                                  : sale.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                              className="text-xs px-2.5 py-0.5"
                            >
                              {sale.status
                                .charAt(0)
                                .toUpperCase() +
                                sale.status.slice(1)}
                            </Badge>

                          </TableCell>

                          <TableCell className="text-sm">

                            {sale.paymentMethod === 'Card' ? (

                              <span className="text-blue-600">
                                💳 Card
                              </span>

                            ) : sale.paymentMethod === 'Cash' ? (

                              <span className="text-green-600">
                                💵 Cash
                              </span>

                            ) : (

                              <span className="text-purple-600">
                                📱 Mobile
                              </span>

                            )}

                          </TableCell>

                        </TableRow>

                      ))}

                    </TableBody>

                  </Table>

                ) : (

                  <p className="text-center py-8 text-slate-500">
                    No recent sales
                  </p>

                )}

              </div>

              {/* Low Stock */}
              <div className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900">
                  Low Stock Alert
                </h2>

                {lowStockItems.length > 0 ? (

                  <Table className="w-full">

                    <TableHeader>

                      <TableRow>

                        <TableHead>
                          Product
                        </TableHead>

                        <TableHead>
                          SKU
                        </TableHead>

                        <TableHead className="text-center">
                          Current
                        </TableHead>

                        <TableHead className="text-center">
                          Minimum
                        </TableHead>

                        <TableHead>
                          Category
                        </TableHead>

                        <TableHead>
                          Action
                        </TableHead>

                      </TableRow>

                    </TableHeader>

                    <TableBody>

                      {lowStockItems.map((item) => (

                        <TableRow key={item.id}>

                          <TableCell className="font-medium text-slate-900">
                            {item.name}
                          </TableCell>

                          <TableCell className="text-sm text-slate-500">
                            {item.sku}
                          </TableCell>

                          <TableCell className="text-center font-bold text-red-600">
                            {item.currentStock}
                          </TableCell>

                          <TableCell className="text-center">
                            {item.minStock}
                          </TableCell>

                          <TableCell className="text-sm text-slate-600">
                            {item.category}
                          </TableCell>

                          <TableCell className="text-center">

                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Restock
                            </Button>

                          </TableCell>

                        </TableRow>

                      ))}

                    </TableBody>

                  </Table>

                ) : (

                  <p className="text-center py-8 text-slate-500">
                    All items are adequately stocked
                  </p>

                )}

              </div>

            </div>

          </TabsContent>

          {/* Sales */}
          <TabsContent value="sales">

            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Sales Chart Placeholder
            </div>

          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory">

            <div className="space-y-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Inventory Value
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card>

                  <CardHeader>
                    <CardTitle>
                      Total Inventory Value
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-2xl font-bold text-slate-900">
                    £45,230.00
                  </CardContent>

                </Card>

                <Card>

                  <CardHeader>
                    <CardTitle>
                      Categories
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">

                    <div className="flex justify-between text-sm">
                      <span>Produce</span>
                      <span>£12,450.00</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Beverages</span>
                      <span>£8,320.00</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Snacks</span>
                      <span>£6,780.00</span>
                    </div>

                  </CardContent>

                </Card>

              </div>

            </div>

          </TabsContent>

        </Tabs>

      </div>

    </div>
  );
}
