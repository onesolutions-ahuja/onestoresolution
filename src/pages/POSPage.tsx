import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search as SearchIcon,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  tax: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
}

export default function POSPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = ['Cash', 'Card', 'Mobile'];
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customer, setCustomer] = useState('');

  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const barcode = e.currentTarget.value.trim();

      if (barcode) {
        addProductByBarcode(barcode);
        e.currentTarget.value = '';
      }
    }
  };

  const searchProducts = async () => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Organic Bananas',
          sku: 'BAN-ORG-001',
          price: 0.89,
          stock: 25,
          barcode: '0012345678905',
        },
        {
          id: '2',
          name: 'Premium Coffee Beans',
          sku: 'COF-PRE-005',
          price: 12.99,
          stock: 12,
          barcode: '0012345678912',
        },
        {
          id: '3',
          name: 'Whole Milk 2L',
          sku: 'MILK-WHL-002',
          price: 2.49,
          stock: 18,
          barcode: '0012345678929',
        },
        {
          id: '4',
          name: 'Whole Wheat Bread',
          sku: 'BREAD-WHT-003',
          price: 3.29,
          stock: 8,
          barcode: '0012345678936',
        },
        {
          id: '5',
          name: 'Free Range Eggs 12pk',
          sku: 'EGG-FRE-004',
          price: 4.99,
          stock: 30,
          barcode: '0012345678943',
        },
      ];

      const searchTerm = query.toLowerCase();

      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          Boolean(product.barcode?.includes(query))
      );

      setProducts(filtered);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Search failed';

      setError(message);

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addProductByBarcode = (barcode: string) => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Organic Bananas',
        sku: 'BAN-ORG-001',
        price: 0.89,
        stock: 25,
        barcode: '0012345678905',
      },
      {
        id: '2',
        name: 'Premium Coffee Beans',
        sku: 'COF-PRE-005',
        price: 12.99,
        stock: 12,
        barcode: '0012345678912',
      },
      {
        id: '3',
        name: 'Whole Milk 2L',
        sku: 'MILK-WHL-002',
        price: 2.49,
        stock: 18,
        barcode: '0012345678929',
      },
      {
        id: '4',
        name: 'Whole Wheat Bread',
        sku: 'BREAD-WHT-003',
        price: 3.29,
        stock: 8,
        barcode: '0012345678936',
      },
      {
        id: '5',
        name: 'Free Range Eggs 12pk',
        sku: 'EGG-FRE-004',
        price: 4.99,
        stock: 30,
        barcode: '0012345678943',
      },
    ];

    const product = mockProducts.find(
      (item) => item.barcode === barc
