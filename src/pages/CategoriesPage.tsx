import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls
        const mockCategories: Category[] = [
          {
            id: '1',
            name: 'Produce',
            description: 'Fresh fruits and vegetables',
            productCount: 24,
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: '2',
            name: 'Beverages',
            description: 'Drinks and beverages',
            productCount: 18,
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: '3',
            name: 'Dairy',
            description: 'Milk, cheese, and dairy products',
            productCount: 15,
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: '4',
            name: 'Bakery',
            description: 'Bread, pastries, and baked goods',
            productCount: 12,
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: '5',
            name: 'Snacks',
            description: 'Chips, nuts, and snack foods',
            productCount: 32,
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: '6',
            name: 'Household',
            description: 'Cleaning supplies and household items',
            productCount: 28,
            isActive: false,
            createdAt: '2024-01-10'
          }
        ];

        setCategories(mockCategories);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
        toast({
          title: "Error",
          description: err.message || 'Failed to load categories',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle category actions
  const handleEditCategory = (id: string) => {
    // In real app: open edit modal
    toast({
      title: "Edit Category",
      description: `Editing category ID: ${id}`,
      variant: "default"
    });
  };

  const handleDeleteCategory = async (id: string) => {
    // In real app: await api.delete(`/categories/${id}`)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCategories(categories.filter(c => c.id !== id));
      toast({
        title: "Category Deleted",
        description: "Category has been removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete category',
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    // In real app: toggle status via API
    setCategories(categories.map(category =>
      category.id === id ? { ...category, isActive: !category.isActive } : category
    ));
    
    toast({
      title: "Status Updated",
      description: "Category status has been updated",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
        <Button variant="outline" size="sm" onClick={() => {
          // Add category modal would go here
          toast({
            title: "Add Category",
            description: "Opening add category form",
            variant: "default"
          });
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">Categories ({filteredCategories.length})</h2>
        </CardHeader>
        <CardContent>
          {isLoading && categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading categories...</p>
            </div>
          ) : (
            <>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No categories match the current search
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Product Count</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20">Created At</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{category.description || '-'}</TableCell>
                        <TableCell className="text-center font-medium">
                          <Badge
                            variant={category.productCount > 0 ? 'default' : 'secondary'}
                            className="text-xs px-2 py-1"
                          >
                            {category.productCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={category.isActive ? 'default' : 'destructive'}
                            className="text-xs px-2 py-1"
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{category.createdAt}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleEditCategory(category.id)}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3 text-slate-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleToggleStatus(category.id)}
                            className="p-1"
                          >
                            {category.isActive ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 text-slate-400" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleDeleteCategory(category.id)}
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
    </div>
  );
}