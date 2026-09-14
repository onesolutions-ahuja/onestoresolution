import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

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

export function EditProductModal({
  product,
  onClose,
  onSave,
}: EditProductModalProps) {
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
    status: product.status,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
    }));
  };

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as Product['status'],
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Saving product:', formData);

    // Backend API can be connected here later.
    onSave();
    onClose();
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.id ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>

          <DialogDescription>
            Manage product details and inventory information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name
              </Label>

              <Input
                id="product-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sku">
                SKU
              </Label>

              <Input
                id="product-sku"
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Enter SKU"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-barcode">
                Barcode (Optional)
              </Label>

              <Input
                id="product-barcode"
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="Enter barcode or leave blank"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">
                Category
              </Label>

              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  id="product-category"
                  className="w-full"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Products</SelectLabel>

                    <SelectItem value="Produce">
                      Produce
                    </SelectItem>

                    <SelectItem value="Beverages">
                      Beverages
                    </SelectItem>

                    <SelectItem value="Dairy">
                      Dairy
                    </SelectItem>

                    <SelectItem value="Bakery">
                      Bakery
                    </SelectItem>

                    <SelectItem value="Snacks">
                      Snacks
                    </SelectItem>

                    <SelectItem value="Household">
                      Household
                    </SelectItem>
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>

                    <SelectItem value="Frozen">
                      Frozen
                    </SelectItem>

                    <SelectItem value="Personal Care">
                      Personal Care
                    </SelectItem>

                    <SelectItem value="Pet Supplies">
                      Pet Supplies
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-selling-price">
                Selling Price (£)
              </Label>

              <Input
                id="product-selling-price"
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-cost-price">
                Cost Price (£)
              </Label>

              <Input
                id="product-cost-price"
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">
                Current Stock
              </Label>

              <Input
                id="product-stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-min-stock">
                Minimum Stock Level
              </Label>

              <Input
                id="product-min-stock"
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="product-supplier">
              Supplier
            </Label>

            <Input
              id="product-supplier"
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              required
            />
          </div>

          {/* Product Status */}
          <div className="space-y-4">
            <Label>
              Product Status
            </Label>

            <div className="flex flex-wrap items-center gap-5">
              {/* Active */}
              <label
                htmlFor="status-active"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  id="status-active"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleStatusChange}
                  className="h-4 w-4 text-[#0176D3] focus:ring-[#0176D3]"
                />

                <span className="flex items-center text-sm text-slate-700">
                  Active
                  <Info className="ml-1 h-3 w-3 text-slate-400" />
                </span>
              </label>

              {/* Inactive */}
              <label
                htmlFor="status-inactive"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  id="status-inactive"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleStatusChange}
                  className="h-4 w-4 text-[#0176D3] focus:ring-[#0176D3]"
                />

                <span className="flex items-center text-sm text-slate-700">
                  Inactive
                  <AlertTriangle className="ml-1 h-3 w-3 text-slate-400" />
                </span>
              </label>

              {/* Discontinued */}
              <label
                htmlFor="status-discontinued"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  id="status-discontinued"
                  name="status"
                  value="discontinued"
                  checked={formData.status === 'discontinued'}
                  onChange={handleStatusChange}
                  className="h-4 w-4 text-[#0176D3] focus:ring-[#0176D3]"
                />

                <span className="flex items-center text-sm text-slate-700">
                  Discontinued
                  <CheckCircle2 className="ml-1 h-3 w-3 text-slate-400" />
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
