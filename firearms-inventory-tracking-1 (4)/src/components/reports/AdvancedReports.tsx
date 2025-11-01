import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryItem } from '@/types/inventory';
import { generatePDF } from '@/utils/pdfExport';

export const AdvancedReports: React.FC<{ inventory: InventoryItem[] }> = ({ inventory }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  
  const calculateDepreciation = (item: InventoryItem) => {
    if (!item.purchasePrice || !item.purchaseDate) return 0;
    const years = (Date.now() - new Date(item.purchaseDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
    const depRate = item.category === 'optics' ? 0.15 : 0.10;
    return item.purchasePrice * (1 - Math.pow(1 - depRate, years));
  };

  const getReportData = () => {
    const categoryStats = new Map();
    const purchaseHistory = [];
    let totalValue = 0;
    let totalDepreciation = 0;

    inventory.forEach(item => {
      const cat = item.category || 'Other';
      const value = item.purchasePrice || 0;
      const depreciation = calculateDepreciation(item);
      
      if (!categoryStats.has(cat)) {
        categoryStats.set(cat, { name: cat, count: 0, value: 0, depreciation: 0 });
      }
      
      const stats = categoryStats.get(cat);
      stats.count++;
      stats.value += value;
      stats.depreciation += depreciation;
      
      totalValue += value;
      totalDepreciation += depreciation;
      
      if (item.purchaseDate) {
        purchaseHistory.push({
          date: new Date(item.purchaseDate).toLocaleDateString(),
          value,
          item: item.name
        });
      }
    });

    return {
      categories: Array.from(categoryStats.values()),
      totalValue,
      totalDepreciation,
      currentValue: totalValue - totalDepreciation,
      purchaseHistory: purchaseHistory.slice(-10),
      itemCount: inventory.length
    };
  };

  const data = getReportData();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportPDF = async () => {
    try {
      await generatePDF({
        title: 'Inventory Report',
        data: data,
        type: reportType,
        period: selectedPeriod
      });
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="valuation">Valuation</SelectItem>
              <SelectItem value="depreciation">Depreciation</SelectItem>
              <SelectItem value="purchase">Purchase History</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.currentValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${data.totalDepreciation.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.itemCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {data.categories.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="valuation">
          <Card>
            <CardHeader>
              <CardTitle>Category Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Purchase Value" />
                  <Bar dataKey="depreciation" fill="#ef4444" name="Depreciation" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Original Value" />
                  <Line type="monotone" dataKey="depreciation" stroke="#ef4444" name="Depreciation" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.purchaseHistory.map((purchase, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{purchase.item}</div>
                      <div className="text-sm text-muted-foreground">{purchase.date}</div>
                    </div>
                    <div className="font-bold">${purchase.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReports;
