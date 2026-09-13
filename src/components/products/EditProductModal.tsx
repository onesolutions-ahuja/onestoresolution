import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

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

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    barcode: product.barcode || '',
    sellingPrice: product.sellingPrice,
    costPrice: product.costPrice,
    stock: product.stock,
    minStock: product.minStock,
    category: product.category,
    supplier: product.supplier,
    status: product.status
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app: await api.put(`/products/${product.id}`, formData)
    onClose();
    onSave();
  };

  return (
    <DialogPortal>
      <Dialog onOpenChange={(open) => !open && onClose()}>
        <DialogOverlay className="bg-black/80" />
        <DialogContent className="w-full max-w-md mx-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>{product.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              Manage product details and inventory information
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Save Product
            </Button>
          </DialogFooter>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-barcode">Barcode (Optional)</Label>
                <Input
                  id="product-barcode"
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Enter barcode or leave blank"
                />
              </div>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="w-56">
                    <SelectGroup>
                      <SelectLabel>Produce</SelectLabel>
                      <SelectItem value="Produce">Produce</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Household">Household</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Other</SelectLabel>
                      <SelectItem value="Frozen">Frozen</SelectItem>
                      <SelectItem value="Personal Care">Personal Care</SelectItem>
                      <SelectItem value="Pet Supplies">Pet Supplies</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="product-selling-price">Selling Price (£)</Label>
                <Input
                  id="product-selling-price"
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-cost-price">Cost Price (£)</Label>
                <Input
                  id="product-cost-price"
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-stock">Current Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-min-stock">Minimum Stock Level</Label>
                <Input
                  id="product-min-stock"
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-supplier">Supplier</Label>
              <Input
                id="product-supplier"
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="product-status">Product Status</Label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleChange}
                    className="rounded border border-slate-300 text-[#0176D3] focus:ring-2 focus:ring-[#0176D3]"
                  />
                  <Label htmlFor="status-active" className="text-sm text-slate-700">
                    Active
                    <Info className="ml-1 h-3 w-3 text-slate-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-inactive"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleChange}
                    className="rounded border border-slate-300 text-[#0176D3] focus:ring-2 focus:ring-[#0176D3]"
                  />
                  <Label htmlFor="status-inactive" className="text-sm text-slate-700">
                    Inactive
                    <AlertTriangle className="ml-1 h-3 w-3 text-slate-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-discontinued"
                    name="status"
                    value="discontinued"
                    checked={formData.status === 'discontinued'}
                    onChange={handleChange}
                    className="rounded border border-slate-300 text-[#0176D3] focus:ring-2 focus:ring-[#0176D3]"
                  />
                  <Label htmlFor="status-discontinued" className="text-sm text-slate-700">
                    Discontinued
                    <CheckCircle2 className="ml-1 h-3 w-3 text-slate-400" />
                  </Label>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DialogPortal>
  );
}