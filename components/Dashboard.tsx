"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { AreaChart } from "./ui/area-chart";
import { BarChart } from "./ui/bar-chart";
import { DonutChart } from "./ui/pie-chart";
import { SearchResults } from "./generative-ui/SearchResults";
import { useLanguage } from "./LanguageProvider";
import { 
  salesData, 
  productData, 
  categoryData, 
  regionalData,
  demographicsData,
  calculateTotalRevenue,
  calculateTotalProfit,
  calculateTotalCustomers,
  calculateConversionRate,
  calculateAverageOrderValue,
  calculateProfitMargin
} from "../data/dashboard-data";

export function Dashboard() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const dict = language === 'ar' ? {
      total_revenue: 'إجمالي الإيرادات',
      total_profit: 'إجمالي الربح',
      customers: 'العملاء',
      conversion_rate: 'معدل التحويل',
      avg_order_value: 'متوسط قيمة الطلب',
      profit_margin: 'هامش الربح',
      sales_overview: 'نظرة عامة على المبيعات',
      monthly_sales: 'بيانات المبيعات والأرباح الشهرية',
      product_performance: 'أداء المنتج',
      top_selling: 'أفضل المنتجات مبيعًا',
      sales_by_category: 'المبيعات حسب الفئة',
      distribution_across: 'التوزيع عبر الفئات',
      categories_center: 'الفئات',
      regional_sales: 'المبيعات الإقليمية',
      by_region: 'المبيعات حسب المنطقة الجغرافية',
      customer_demographics: 'التركيبة السكانية للعملاء',
      spending_by_age: 'الإنفاق حسب الفئة العمرية',
    } : {
      total_revenue: 'Total Revenue',
      total_profit: 'Total Profit',
      customers: 'Customers',
      conversion_rate: 'Conversion Rate',
      avg_order_value: 'Avg Order Value',
      profit_margin: 'Profit Margin',
      sales_overview: 'Sales Overview',
      monthly_sales: 'Monthly sales and profit data',
      product_performance: 'Product Performance',
      top_selling: 'Top selling products',
      sales_by_category: 'Sales by Category',
      distribution_across: 'Distribution across categories',
      categories_center: 'Categories',
      regional_sales: 'Regional Sales',
      by_region: 'Sales by geographic region',
      customer_demographics: 'Customer Demographics',
      spending_by_age: 'Spending by age group',
    };
    return dict[key] ?? key;
  };
  // Calculate metrics
  const totalRevenue = calculateTotalRevenue();
  const totalProfit = calculateTotalProfit();
  const totalCustomers = calculateTotalCustomers();
  const conversionRate = calculateConversionRate();
  const averageOrderValue = calculateAverageOrderValue();
  const profitMargin = calculateProfitMargin();

  // Make data available to the Copilot
  useCopilotReadable({
    description: "Dashboard data including sales trends, product performance, and category distribution",
    value: {
      salesData,
      productData,
      categoryData,
      regionalData,
      demographicsData,
      metrics: {
        totalRevenue,
        totalProfit,
        totalCustomers,
        conversionRate,
        averageOrderValue,
        profitMargin
      }
    }
  });

  // Define render only search action
  useCopilotAction({
    name: "searchInternet",
    available: "disabled",
    description: "Searches the internet for information.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The query to search the internet for.",
        required: true,
      }
    ],
    render: ({args, status}) => {
      return <SearchResults query={args.query || 'No query provided'} status={status} />;
    }
  });

  // Color palettes for different charts
  const colors = {
    salesOverview: ["#3b82f6", "#10b981", "#ef4444"],  // Blue, Green, Red
    productPerformance: ["#8b5cf6", "#6366f1", "#4f46e5"],  // Purple spectrum
    categories: ["#3b82f6", "#64748b", "#10b981", "#f59e0b", "#94a3b8"],  // Mixed
    regional: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],  // Green spectrum
    demographics: ["#f97316", "#f59e0b", "#eab308", "#facc15", "#fde047"]  // Orange to Yellow
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
      {/* Key Metrics */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('total_revenue')}</p>
            <p className="text-xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('total_profit')}</p>
            <p className="text-xl font-semibold text-gray-900">${totalProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('customers')}</p>
            <p className="text-xl font-semibold text-gray-900">{totalCustomers.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('conversion_rate')}</p>
            <p className="text-xl font-semibold text-gray-900">{conversionRate}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('avg_order_value')}</p>
            <p className="text-xl font-semibold text-gray-900">${averageOrderValue}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">{t('profit_margin')}</p>
            <p className="text-xl font-semibold text-gray-900">{profitMargin}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">{t('sales_overview')}</CardTitle>
          <CardDescription className="text-xs">{t('monthly_sales')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <AreaChart
              data={salesData}
              index="date"
              categories={["Sales", "Profit", "Expenses"]}
              colors={colors.salesOverview}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={true}
              showGrid={true}
              showXAxis={true}
              showYAxis={true}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">{t('product_performance')}</CardTitle>
          <CardDescription className="text-xs">{t('top_selling')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={productData}
              index="name"
              categories={["sales"]}
              colors={colors.productPerformance}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">{t('sales_by_category')}</CardTitle>
          <CardDescription className="text-xs">{t('distribution_across')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <DonutChart
              data={categoryData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value}%`}
              colors={colors.categories}
              centerText={t('categories_center')}
              paddingAngle={0}
              showLabel={false}
              showLegend={true}
              innerRadius={45}
              outerRadius="90%"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">{t('regional_sales')}</CardTitle>
          <CardDescription className="text-xs">{t('by_region')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={regionalData}
              index="region"
              categories={["sales"]}
              colors={colors.regional}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">{t('customer_demographics')}</CardTitle>
          <CardDescription className="text-xs">{t('spending_by_age')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={demographicsData}
              index="ageGroup"
              categories={["spending"]}
              colors={colors.demographics}
              valueFormatter={(value) => `$${value}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 