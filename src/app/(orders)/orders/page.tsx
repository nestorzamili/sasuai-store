'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Shirt,
  Laptop,
  Pizza,
  Gift,
  Smartphone,
  Book,
} from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Cash Register</h1>
      <p className="text-muted-foreground mb-6">New Sale Transaction</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Search or browse products by category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name or scan barcode..."
                  className="pl-8"
                />
              </div>

              {/* Category Buttons */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full overflow-auto py-2 h-auto flex flex-nowrap justify-start">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="food" className="flex items-center gap-2">
                    <Pizza className="h-4 w-4" />
                    <span>Food</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="drinks"
                    className="flex items-center gap-2"
                  >
                    <Coffee className="h-4 w-4" />
                    <span>Drinks</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="clothing"
                    className="flex items-center gap-2"
                  >
                    <Shirt className="h-4 w-4" />
                    <span>Clothing</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="electronics"
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Electronics</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="books"
                    className="flex items-center gap-2"
                  >
                    <Book className="h-4 w-4" />
                    <span>Books</span>
                  </TabsTrigger>
                </TabsList>

                {/* Product Grid */}
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Product Cards */}
                    {[
                      {
                        name: 'T-Shirt Basic',
                        price: '$25.00',
                        image: '👕',
                        code: 'TSB001',
                        category: 'Clothing',
                      },
                      {
                        name: 'Coffee Mug',
                        price: '$8.99',
                        image: '☕',
                        code: 'CM100',
                        category: 'Home',
                      },
                      {
                        name: 'Headphones',
                        price: '$49.99',
                        image: '🎧',
                        code: 'HP202',
                        category: 'Electronics',
                      },
                      {
                        name: 'Notebook',
                        price: '$4.99',
                        image: '📓',
                        code: 'NB503',
                        category: 'Stationery',
                      },
                      {
                        name: 'Chocolate Bar',
                        price: '$2.50',
                        image: '🍫',
                        code: 'CB300',
                        category: 'Food',
                      },
                      {
                        name: 'Phone Case',
                        price: '$15.00',
                        image: '📱',
                        code: 'PC401',
                        category: 'Accessories',
                      },
                      {
                        name: 'Water Bottle',
                        price: '$12.99',
                        image: '🍶',
                        code: 'WB105',
                        category: 'Sports',
                      },
                      {
                        name: 'Soda Can',
                        price: '$1.99',
                        image: '🥤',
                        code: 'SC200',
                        category: 'Drinks',
                      },
                    ].map((product, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="bg-muted flex items-center justify-center text-4xl p-6">
                          {product.image}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1">
                            <p className="font-bold">{product.price}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            #{product.code}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Placeholder for other categories */}
                <TabsContent value="food">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Food products would go here */}
                    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <div className="bg-muted flex items-center justify-center text-4xl p-6">
                        🍫
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">Chocolate Bar</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="font-bold">$2.50</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          #CB300
                        </p>
                      </CardContent>
                    </Card>
                    {/* More food products would be here */}
                  </div>
                </TabsContent>

                {/* Other categories would have similar content */}
              </Tabs>
            </CardContent>
          </Card>

          {/* Shopping Cart / Receipt */}
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Receipt
              </CardTitle>
              <CardDescription>Items added to the current sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Price
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Qty
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Total
                      </TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div>
                          <p>T-Shirt Basic</p>
                          <p className="text-xs text-muted-foreground">
                            #TSB001
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">$25.00</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">2</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        $50.00
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div>
                          <p>Smartphone Case</p>
                          <p className="text-xs text-muted-foreground">
                            #SMC102
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">$15.00</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">1</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        $15.00
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-2 border-primary/20">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Complete transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>$65.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>$6.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <div className="flex items-center gap-2">
                  <span>-$0.00</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Due</span>
                <span>$71.50</span>
              </div>

              <div className="pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Payment Method
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Customer Details
                  </label>
                  <div className="space-y-2">
                    <Input placeholder="Customer name" />
                    <Input placeholder="Phone number" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button className="w-full" size="lg">
                Complete Sale
              </Button>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">
                  Hold Sale
                </Button>
                <Button variant="outline" className="flex-1">
                  Clear All
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
