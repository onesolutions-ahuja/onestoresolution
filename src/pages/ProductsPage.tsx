import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { EditProductModal } from '@/components/products/EditProductModal';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string;
  supplier: string;
  status: 'active' | 'inactive' | 'discontinued';
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Organic Bananas',
            sku: 'BAN-ORG-001',
            barcode: '0012345678905',
            sellingPrice: 0.89,
            costPrice: 0.50,
            stock: 25,
            minStock: 10,
            category: 'Produce',
            supplier: 'FreshFarms Ltd',
            status: 'active'
          },
          {
            id: '2',
            name: 'Premium Coffee Beans',
            sku: 'COF-PRE-005',
            barcode: '0012345678912',
            sellingPrice: 12.99,
            costPrice: 8.00,
            stock: 12,
            minStock: 5,
            category: 'Beverages',
            supplier: 'BeanThere Co',
            status: 'active'
          },
          {
            id: '3',
            name: 'Whole Milk 2L',
            sku: 'MILK-WHL-002',
            barcode: '0012345678929',
            sellingPrice: 2.49,
            costPrice: 1.80,
            stock: 18,
            minStock: 8,
            category: 'Dairy',
            supplier: 'MooMoo Dairy',
            status: 'active'
          },
          {
            id: '4',
            name: 'Whole Wheat Bread',
            sku: 'BREAD-WHT-003',
            barcode: '0012345678936',
            sellingPrice: 3.29,
            costPrice: 2.00,
            stock: 8,
            minStock: 5,
            category: 'Bakery',
            supplier: 'BreadBasket Inc',
            status: 'low_stock'
          },
          {
            id: '5',
            name: 'Free Range Eggs 12pk',
            sku: 'EGG-FRE-004',
            barcode: '0012345678943',
            sellingPrice: 4.99,
            costPrice: 3.50,
            stock: 30,
            minStock: 10,
            category: 'Dairy',
            supplier: 'HappyHens Ltd',
            status: 'active'
          }
        ];

        const mockCategories = ['All', 'Produce', 'Beverages', 'Dairy', 'Bakery', 'Snacks', 'Household'];
        const mockSuppliers = ['All', 'FreshFarms Ltd', 'BeanThere Co', 'MooMoo Dairy', 'BreadBasket Inc', 'HappyHens Ltd'];

        setProducts(mockProducts);
        setCategories(mockCategories);
        setSuppliers(mockSuppliers);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
        toast({
          title: "Error",
          description: err.message || 'Failed to load products',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchQuery));
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'All' || product.supplier === selectedSupplier;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'low_stock' && product.stock <= product.minStock) ||
                         (statusFilter === 'active' && product.status === 'active') ||
                         (statusFilter === 'inactive' && product.status === 'inactive') ||
                         (statusFilter === 'discontinued' && product.status === 'discontinued');
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
  });

  // Handle product actions
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeleteProduct = async (id: string) => {
    // In real app: await api.delete(`/products/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Product Deleted",
        description: "Product has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete product',
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (product: Product) => {
    // In real app: toggle status via API
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, status: newStatus } : p
    ));
    
    toast({
      title: "Status Updated",
      description: `Product status changed to ${newStatus}`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setSelectedProduct({} as Product)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <Button
            onClick={() => {
              // Export functionality would go here
              toast({
                title: "Export",
                description: "Products exported to CSV",
                variant: "default"
              });
            }}
            variant="outline"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Products</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded border border-slate-300 px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#0176D3]">
                {selectedCategory}
                <ChevronDown className="ml-2 h-3 w-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-[#0176D3] text-white" : ""}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Supplier</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded border border-slate-300 px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#0176D3]">
                {selectedSupplier}
                <ChevronDown className="ml-2 h-3 w-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {suppliers.map((supplier) => (
                  <DropdownMenuItem
                    key={supplier}
                    onClick={() => setSelectedSupplier(supplier)}
                    className={selectedSupplier === supplier ? "bg-[#0176D3] text-white" : ""}
                  >
                    {supplier}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded border border-slate-300 px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#0176D3]">
                {statusFilter}
                <ChevronDown className="ml-2 h-3 w-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  key="All"
                  onClick={() => setStatusFilter('All')}
                  className={statusFilter === 'All' ? "bg-[#0176D3] text-white" : ""}
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="active"
                  onClick={() => setStatusFilter('active')}
                  className={statusFilter === 'active' ? "bg-[#0176D3] text-white" : ""}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="inactive"
                  onClick={() => setStatusFilter('inactive')}
                  className={statusFilter === 'inactive' ? "bg-[#0176D3] text-white" : ""}
                >
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="discontinued"
                  onClick={() => setStatusFilter('discontinued')}
                  className={statusFilter === 'discontinued' ? "bg-[#0176D3] text-white" : ""}
                >
                  Discontinued
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  key="low_stock"
                  onClick={() => setStatusFilter('low_stock')}
                  className={statusFilter === 'low_stock' ? "bg-[#0176D3] text-white" : ""}
                >
                  Low Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Products ({filteredProducts.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading products...</p>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No products match the current filters
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Product Name</TableHead>
                      <TableHead className="w-20">SKU</TableHead>
                      <TableHead className="w-20">Barcode</TableHead>
                      <TableHead className="text-center w-16">Stock</TableHead>
                      <TableHead className="text-center w-16">Price</TableHead>
                      <TableHead className="w-20">Category</TableHead>
                      <TableHead className="w-20">Supplier</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                        <TableCell className="text-sm text-slate-500">{product.sku}</TableCell>
                        <TableCell className="text-sm text-slate-500">{product.barcode || '-'}</TableCell>
                        <TableCell className="text-center font-medium">
                          {product.stock <= product.minStock ? (
                            <Badge variant="destructive" className="text-xs px-2 py-1">
                              LOW ({product.stock})
                            </Badge>
                          ) : (
                            <span className={product.stock < product.minStock * 1.5 ? "text-orange-600" : "text-green-600"} font-medium>
                              {product.stock}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">£{product.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{product.category}</TableCell>
                        <TableCell className="text-sm text-slate-600">{product.supplier}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'destructive'}
                            className="text-xs px-2 py-1"
                          >
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditProduct(product)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Edit Product Modal */}
      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={() => {
            setSelectedProduct(null);
            toast({
              title: "Product Saved",
              description: "Product details have been updated",
              variant: "default"
            });
          }}
        />
      )}
    </div>
  );
}

// Helper icons
function Download() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="4" x2="12" y2="15"></line>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  );
}