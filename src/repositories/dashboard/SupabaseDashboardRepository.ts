import { supabase } from "../../lib/supabase";
import { getCurrentCompanyMembership } from "../../services/auth/authService";
import type { CategoryPerformanceItem, DashboardPeriod, DashboardVariations, FinancialSummary, SalesPerformancePoint, TopSellingProduct } from "../../types/Dashboard";
import type { StockUnit } from "../../types/Product";

export interface DashboardAnalytics {
  financialSummary: FinancialSummary;
  totalSoldQuantity: number;
  salesPerformance: SalesPerformancePoint[];
  categoryPerformance: CategoryPerformanceItem[];
  topSellingProducts: TopSellingProduct[];
  variations: Partial<DashboardVariations>;
}

interface PeriodRange { start: Date; end: Date; previousStart: Date; }
const round=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
function getRange(period:DashboardPeriod):PeriodRange{const end=new Date(),start=new Date(end);start.setHours(0,0,0,0);if(period==="week"){const day=start.getDay();start.setDate(start.getDate()-(day===0?6:day-1));}else if(period==="month")start.setDate(1);else if(period==="year")start.setMonth(0,1);const previousStart=new Date(start.getTime()-(end.getTime()-start.getTime())-1);return{start,end,previousStart};}
function bucketDefinitions(period:DashboardPeriod){if(period==="today")return Array.from({length:6},(_,index)=>({key:String(index),label:`${String(index*4).padStart(2,"0")}h`}));if(period==="week")return["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((label,index)=>({key:String(index),label}));if(period==="month")return Array.from({length:5},(_,index)=>({key:String(index),label:`Sem. ${index+1}`}));return["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map((label,index)=>({key:String(index),label}));}
function bucketKey(value:string,period:DashboardPeriod){const date=new Date(value);if(period==="today")return String(Math.min(5,Math.floor(date.getHours()/4)));if(period==="week")return String((date.getDay()+6)%7);if(period==="month")return String(Math.min(4,Math.floor((date.getDate()-1)/7)));return String(date.getMonth());}
function variation(current:number,previous:number){if(previous===0)return current===0?0:100;return round(((current-previous)/Math.abs(previous))*100);}

export async function getDashboardAnalytics(period:DashboardPeriod,principalUnit:StockUnit):Promise<DashboardAnalytics>{
  const membership=await getCurrentCompanyMembership();if(!membership)throw new Error("Nenhuma empresa ativa foi encontrada.");
  const range=getRange(period);
  const {data:sales,error:salesError}=await supabase.from("sales").select("id, completed_at").eq("company_id",membership.company_id).eq("status","completed").gte("completed_at",range.previousStart.toISOString()).lte("completed_at",range.end.toISOString());if(salesError)throw salesError;
  const saleIds=sales.map(sale=>sale.id);
  const [itemsResult,productsResult,categoriesResult]=await Promise.all([
    saleIds.length?supabase.from("sale_items").select("sale_id, product_id, product_name, unit, quantity, unit_cost, total").eq("company_id",membership.company_id).in("sale_id",saleIds):Promise.resolve({data:[],error:null}),
    supabase.from("products").select("id, name, unit, category_id").eq("company_id",membership.company_id),
    supabase.from("product_categories").select("id, name").eq("company_id",membership.company_id),
  ]);
  if(itemsResult.error)throw itemsResult.error;if(productsResult.error)throw productsResult.error;if(categoriesResult.error)throw categoriesResult.error;
  const saleDate=new Map(sales.map(sale=>[sale.id,sale.completed_at]));
  const products=new Map(productsResult.data.map(product=>[product.id,product]));
  const categories=new Map(categoriesResult.data.map(category=>[category.id,category.name]));
  const currentItems=itemsResult.data.filter(item=>new Date(saleDate.get(item.sale_id)??0)>=range.start);
  const previousItems=itemsResult.data.filter(item=>new Date(saleDate.get(item.sale_id)??0)<range.start);
  const totals=(items:typeof currentItems)=>items.reduce((acc,item)=>{const quantity=Number(item.quantity),revenue=Number(item.total),cost=quantity*Number(item.unit_cost);acc.revenue+=revenue;acc.cost+=cost;if(item.unit===principalUnit)acc.quantity+=quantity;return acc;},{revenue:0,cost:0,quantity:0});
  const current=totals(currentItems),previous=totals(previousItems),profit=current.revenue-current.cost,previousProfit=previous.revenue-previous.cost,currentMargin=current.revenue?profit/current.revenue*100:0,previousMargin=previous.revenue?previousProfit/previous.revenue*100:0;
  const buckets=new Map(bucketDefinitions(period).map(bucket=>[bucket.key,{label:bucket.label,revenue:0,cost:0,profit:0}]));
  const categoryMap=new Map<string,{revenue:number;profit:number}>(),productMap=new Map<string,TopSellingProduct>();
  for(const item of currentItems){const quantity=Number(item.quantity),revenue=Number(item.total),cost=quantity*Number(item.unit_cost),saleAt=saleDate.get(item.sale_id);if(saleAt){const bucket=buckets.get(bucketKey(saleAt,period));if(bucket){bucket.revenue+=revenue;bucket.cost+=cost;bucket.profit+=revenue-cost;}}
    const product=products.get(item.product_id),category=product?.category_id?categories.get(product.category_id)??"Sem categoria":"Sem categoria",categoryItem=categoryMap.get(category)??{revenue:0,profit:0};categoryItem.revenue+=revenue;categoryItem.profit+=revenue-cost;categoryMap.set(category,categoryItem);
    const productItem=productMap.get(item.product_id)??{productId:item.product_id,name:product?.name??item.product_name,category,quantitySold:0,unit:(product?.unit??item.unit) as StockUnit,revenue:0,profit:0};productItem.quantitySold+=quantity;productItem.revenue+=revenue;productItem.profit+=revenue-cost;productMap.set(item.product_id,productItem);
  }
  const salesPerformance=[...buckets.values()].map(item=>({label:item.label,revenue:round(item.revenue),cost:round(item.cost),profit:round(item.profit)}));
  const categoryPerformance=[...categoryMap.entries()].map(([category,value])=>({category,revenue:round(value.revenue),profit:round(value.profit),percentage:current.revenue?round(value.revenue/current.revenue*100):0})).sort((a,b)=>b.revenue-a.revenue);
  const topSellingProducts=[...productMap.values()].sort((a,b)=>b.quantitySold-a.quantitySold).slice(0,5).map(item=>({...item,quantitySold:round(item.quantitySold),revenue:round(item.revenue),profit:round(item.profit)}));
  return{financialSummary:{revenue:round(current.revenue),cost:round(current.cost),profit:round(profit),profitMargin:round(currentMargin)},totalSoldQuantity:round(current.quantity),salesPerformance,categoryPerformance,topSellingProducts,variations:{soldQuantity:variation(current.quantity,previous.quantity),revenue:variation(current.revenue,previous.revenue),profit:variation(profit,previousProfit),margin:round(currentMargin-previousMargin)}};
}
