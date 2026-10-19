// ============================================================
// 匯入欄位辨識規則 — 唯一策展點
// ------------------------------------------------------------
// 學員拿到的欄名五花八門（ERP、POS、自己手打的 Excel）。遇到認不得的欄名，
// 只要改這個檔：在對應欄位的 `SYNONYMS` 加一個詞（全部小寫，不含空白、底線、連字號）即可，
// 不需要動任何邏輯。改完跑 `npx tsx scripts/check-datalab.mjs`，再用 /checkup/data/headers/
// 的「欄名測試頁」貼上欄名確認。
// ============================================================

/** 上傳資料的標準欄位。前三個是必要欄位，其餘有就能開啟更多分析 */
export type FieldKey =
  | 'customerId'
  | 'date'
  | 'amount'
  | 'orderId'
  | 'product'
  | 'category'
  | 'isReturn'
  | 'store'
  | 'channel'
  | 'quantity'
  | 'unitPrice';

/** 欄名同義詞（中英文）。比對時先轉小寫並去掉空白、底線、連字號、括號 */
export const SYNONYMS: Record<FieldKey, string[]> = {
  customerId: [
    'customerid', 'custid', 'cid', 'memberid', 'member', 'customer', 'userid', 'uid', 'custno', 'memberno',
    '會員編號', '會員代號', '會員卡號', '會員', '客戶編號', '客戶代號', '客戶id', '客戶', '客代', '顧客編號', '顧客', '卡號', '手機', '會員手機', '客人', '買家', '買方',
  ],
  date: [
    'date', 'datetime', 'txndate', 'txndatetime', 'orderdate', 'saledate', 'purchasedate', 'time', 'createdat', 'paidat',
    '交易日期', '交易時間', '訂單日期', '銷售日期', '銷貨日期', '銷貨日', '出貨日期', '單據日期', '開單日期', '購買日期', '消費日期', '結帳日期', '結帳時間', '日期', '時間',
  ],
  amount: [
    'amount', 'totalamount', 'total', 'lineamount', 'sales', 'revenue', 'amt', 'subtotal', 'grandtotal',
    '金額', '實收金額', '實收', '實付', '銷售金額', '銷貨金額', '出貨金額', '交易金額', '訂單金額', '小計', '總額', '總金額', '營業額', '消費金額', '含稅金額', '未稅金額', '本幣金額', '多少錢', '收入', '收款', '收款金額',
  ],
  orderId: [
    'orderid', 'orderno', 'ordernumber', 'txnid', 'transactionid', 'invoice', 'invoiceno', 'receipt', 'ticket',
    '單號', '訂單編號', '訂單號', '交易編號', '單據編號', '銷貨單號', '出貨單號', '發票號碼', '發票', '流水號',
  ],
  product: ['product', 'productname', 'item', 'itemname', 'lineitemname', 'goods', '商品名稱', '商品', '品名', '品項', '產品名稱', '產品', '買了什麼', '項目', '內容'],
  category: ['category', 'productcategory', 'cat', 'subcategory', 'class', '商品類別', '商品品類', '品類', '類別', '分類', '大類', '中類'],
  isReturn: ['isreturn', 'return', 'refund', 'isrefund', '是否退貨', '退貨註記', '退貨', '退款'],
  store: ['store', 'storeid', 'storename', 'shop', 'branch', 'outlet', '門市', '店別', '分店', '店名', '門店', '店號', '店代號', '部門'],
  channel: ['channel', 'saleschannel', '通路', '渠道', '管道', '銷售通路'],
  quantity: ['qty', 'quantity', 'lineitemquantity', 'count', '數量', '件數', '銷售數量', '出貨數量'],
  unitPrice: ['unitprice', 'price', 'sellprice', 'lineitemprice', '單價', '售價', '銷售單價'],
};

/**
 * 「弱」同義詞：欄名完全吻合時只給較低的分數。商品「代碼」（品號、貨號、SKU）可以用，
 * 但如果同一份檔案也有商品「名稱」（品名），就要選名稱——名稱才看得懂。
 */
export const WEAK_SYNONYMS: Partial<Record<FieldKey, string[]>> = {
  product: ['sku', '品號', '貨號', '料號'],
};

/**
 * 欄名帶有這些字眼就不是該欄位：出生日期不是交易日期、會員等級不是會員編號。
 * （兩者的欄名都含有「日期」「會員」，光比對同義詞會得到同分甚至誤判成「確定」。）
 */
export const NEGATIVE: Partial<Record<FieldKey, RegExp>> = {
  date: /(出生|生日|birth|到期|expire|expiry|有效|建立|created|註冊|加入|入會|更新|updated)/i,
  customerId: /(等級|級別|level|tier|類型|type|狀態|status|日期|date|名稱|姓名|name|數量|count)/i,
};

/** 看起來是「名稱／姓名」的欄位不該被當成編號欄 */
export const NAME_LIKE = /(名稱|姓名|name)/i;
/** 單價、成本不是交易金額 */
export const NOT_AMOUNT = /(unit|單價|cost|成本|price)/i;

/** 金額欄的欄名像「整張單的總額」（會重複寫在每一列）／像「明細小計」（要加總） */
export const ORDER_TOTAL_HEADER = /(實收|訂單金額|訂單總額|總額|總計|合計|應收|total(?!.*line)|order.?amount)/i;
export const LINE_AMOUNT_HEADER = /(小計|明細|line|subtotal|item)/i;

/** 診斷「報表式（樞紐）」資料用：橫軸是月份、季或年度的欄名 */
export const PERIOD_HEADER = /^(\d{1,2}月|\d{4}年?\d{0,2}月?|\d{4}[-/.]\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|第[一二三四1-4]季|h[12])$/i;

/** 診斷「會員主檔」用：只有會員個人資料的欄名 */
export const PROFILE_HEADER = /(姓名|名稱|name|手機|電話|phone|tel|email|信箱|生日|出生|birth|性別|gender|等級|tier|地址|address|入會|加入)/i;
