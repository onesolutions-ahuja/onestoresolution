Import React, { useState, useEffect, useRef } from 'react';
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
      (item) => item.barcode === barcode
    );

    if (product) {
      addToCart(product);
    } else {
      toast({
        title: 'Product Not Found',
        description: `No product found with barcode: ${barcode}`,
        variant: 'destructive',
      });
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${product.stock} units available`,
          variant: 'destructive',
        });

        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
                tax:
                  (item.quantity + 1) *
                  item.price *
                  0.2,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          total: product.price,
          tax: product.price * 0.2,
        },
      ]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (
    id: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              total: quantity * item.price,
              tax: quantity * item.price * 0.2,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const tax = cart.reduce(
    (sum, item) => sum + item.tax,
    0
  );

  const total = subtotal + tax;

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description:
          'Please add items to the cart before checkout',
        variant: 'destructive',
      });

      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const receiptId = `RCPT-${Date.now()}`;

      toast({
        title: 'Payment Successful',
        description: `Receipt #${receiptId} printed`,
        variant: 'default',
      });

      clearCart();
      setCustomer('');
      setPaymentMethod('Cash');

      setTimeout(() => {
        document
          .getElementById('pos-search')
          ?.focus();
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Payment processing failed';

      toast({
        title: 'Payment Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const holdCart = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Cart is empty',
        variant: 'destructive',
      });

      return;
    }

    toast({
      title: 'Cart Held',
      description:
        'Current cart has been saved for later',
      variant: 'default',
    });

    clearCart();
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#0176D3]" />
            Point of Sale
          </h1>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <h2 className="text-lg font-medium text-slate-900">
                    Product Search
                  </h2>

                  <div className="flex items-center space-x-2 mt-2">
                    <div className="relative flex-1">
                      <input
                        id="pos-search"
                        ref={barcodeRef}
                        type="text"
                        placeholder="Scan barcode or search products..."
                        value={query}
                        onChange={(e) =>
                          setQuery(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        className="w-full rounded border border-slate-300 px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                      />

                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={searchProducts}
                      disabled={isLoading}
                      className="ml-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto">
                  {isLoading && !query ? (
                    <div className="text-center py-8 text-slate-400">
                      Scan a barcode or type to search products
                    </div>
                  ) : products.length === 0 && query ? (
                    <div className="text-center py-8 text-slate-400">
                      No products found for '{query}'
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">
                              {product.name}
                            </h3>

                            <p className="text-sm text-slate-500">
                              SKU: {product.sku}
                            </p>

                            {product.barcode && (
                              <p className="text-xs text-slate-400">
                                Barcode: {product.barcode}
                              </p>
                            )}
                          </div>

                          <div className="text-right space-y-1">
                            <p className="font-bold text-lg">
                              £{product.price.toFixed(2)}
                            </p>

                            <p className="text-sm text-slate-500">
                              {product.stock} in stock
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <h2 className="text-lg font-medium text-slate-900">
                    Shopping Cart
                  </h2>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      Your cart is empty
                    </div>
                  ) : (
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">
                            Item
                          </TableHead>

                          <TableHead className="text-center w-16">
                            Qty
                          </TableHead>

                          <TableHead className="text-right w-20">
                            Price
                          </TableHead>

                          <TableHead className="text-right w-20">
                            Total
                          </TableHead>

                          <TableHead className="w-10">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">
                                    {item.name}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    SKU: {item.sku}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      Math.max(
                                        1,
                                        item.quantity - 1
                                      )
                                    )
                                  }
                                  className="p-1 rounded hover:bg-[#F1F5F9] text-slate-500"
                                  disabled={
                                    item.quantity <= 1
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </button>

                                <span className="px-2 py-0.5 text-xs border border-slate-300 rounded">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-1 rounded hover:bg-[#F1F5F9] text-slate-500"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              £{item.price.toFixed(2)}
                            </TableCell>

                            <TableCell className="text-right font-medium">
                              £{item.total.toFixed(2)}
                            </TableCell>

                            <TableCell className="text-center">
                              <button
                                onClick={() =>
                                  removeFromCart(item.id)
                                }
                                className="p-1 rounded text-red-600 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-[#E2E8F0]">
                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>Subtotal:</div>

                      <div className="text-right font-medium">
                        £{subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>Tax (20%):</div>

                      <div className="text-right font-medium">
                        £{tax.toFixed(2)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-bold text-lg">
                      <div>TOTAL:</div>

                      <div className="text-right">
                        £{total.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Customer
                        </label>

                        <input
                          type="text"
                          placeholder="Customer name (optional)"
                          value={customer}
                          onChange={(e) =>
                            setCustomer(e.target.value)
                          }
                          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Payment Method
                        </label>

                        <div className="flex space-x-3">
                          {paymentMethods.map(
                            (method) => (
                              <label
                                key={method}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  value={method}
                                  checked={
                                    paymentMethod ===
                                    method
                                  }
                                  onChange={(e) =>
                                    setPaymentMethod(
                                      e.target.value
                                    )
                                  }
                                  className="rounded border border-slate-300 text-[#0176D3] focus:ring-2 focus:ring-[#0176D3]"
                                />

                                <span className="text-sm text-slate-700">
                                  {method}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={holdCart}
                          className="flex-1"
                        >
                          Hold Cart
                        </Button>

                        <Button
                          onClick={clearCart}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        >
                          Clear Cart
                        </Button>

                        <Button
                          onClick={processPayment}
                          disabled={
                            isLoading ||
                            cart.length === 0
                          }
                          className="flex-1 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Complete Sale'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="w-64 bg-white border-l border-[#E2E8F0]">
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Receipt Preview
          </h2>

          {cart.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">
                  OneStoreSolution
                </h3>

                <p className="text-sm text-slate-600">
                  Retail Management System
                </p>

                <p className="text-xs text-slate-500">
                  Receipt #
                  {Date.now()
                    .toString()
                    .slice(-6)}
                </p>

                <p className="text-xs text-slate-500">
                  {new Date().toLocaleString()}
                </p>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4" />

              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span className="flex-1">
                      {item.name}
                    </span>

                    <span className="flex-1 text-right">
                      £{item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 mb-2" />

              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>

                <span>£{total.toFixed(2)}</span>
              </div>

              <div className="text-center text-xs text-slate-500 mt-4">
                Thank you for your business!
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Scan items to see receipt preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingCart() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L9 5l11 5H7" />
    </svg>
  );
}
