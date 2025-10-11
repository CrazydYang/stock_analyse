# 个股数据服务接口文档

## 1. 获取股票列表

获取系统中所有股票的基本信息列表，支持分页。

### 请求信息

- **URL**: `/stocks/`
- **方法**: GET
- **接口名称**: `stock_list`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页记录数 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 4000,
    "page": 1,
    "page_size": 20,
    "total_pages": 200,
    "data": [
      {
        "code": "600000",
        "name": "浦发银行",
        "industry": "银行",
        "total_shares": 29352080397,
        "circulating_shares": 28103763899,
        "list_date": "1999-11-10",
        "pe_ratio": 5.23,
        "pb_ratio": 0.47,
        "total_market_cap": 1234567890.12,
        "circulating_market_cap": 1200000000.00,
        "created_at": "2023-01-01T12:00:00",
        "updated_at": "2023-01-02T12:00:00"
      }
    ]
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 参数格式错误 |
| 404 | 获取股票列表失败 |
| 500 | 服务器内部错误 |

---

## 2. 获取所有股票实时行情

获取所有股票的实时行情数据，支持分页。

### 请求信息

- **URL**: `/stocks/realtime/`
- **方法**: GET
- **接口名称**: `stock_realtime_all`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页记录数 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 4000,
    "page": 1,
    "page_size": 20,
    "total_pages": 200,
    "data": [
      {
        "stock_code": "600000",
        "stock_name": "浦发银行",
        "latest_price": 10.25,
        "change_percent": 2.5,
        "change_amount": 0.25,
        "volume": 123456,
        "amount": 1234567.89,
        "amplitude": 3.2,
        "high": 10.35,
        "low": 10.05,
        "open_price": 10.10,
        "close_price": 10.00,
        "turnover_rate": 1.5,
        "timestamp": "2023-01-02T10:30:00"
      }
    ]
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 参数格式错误 |
| 404 | 获取股票实时行情失败 |
| 500 | 服务器内部错误 |

---

## 3. 获取单只股票实时行情

获取指定股票代码的实时行情数据。

### 请求信息

- **URL**: `/stocks/<str:stock_code>/realtime/`
- **方法**: GET
- **接口名称**: `stock_realtime`

### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| stock_code | string | 是 | 股票代码，如：600000 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "stock_code": "600000",
    "stock_name": "浦发银行",
    "latest_price": 10.25,
    "change_percent": 2.5,
    "change_amount": 0.25,
    "volume": 123456,
    "amount": 1234567.89,
    "amplitude": 3.2,
    "high": 10.35,
    "low": 10.05,
    "open_price": 10.10,
    "close_price": 10.00,
    "turnover_rate": 1.5,
    "timestamp": "2023-01-02T10:30:00"
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 无效的股票代码 |
| 404 | 获取股票实时行情失败 |
| 500 | 服务器内部错误 |

---

## 4. 获取股票历史行情数据

获取指定股票的历史行情数据。

### 请求信息

- **URL**: `/stocks/<str:stock_code>/history/`
- **方法**: GET
- **接口名称**: `stock_history`

### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| stock_code | string | 是 | 股票代码，如：600000 |

### 查询参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| start_date | string | 否 | 30天前 | 开始日期，格式：YYYYMMDD |
| end_date | string | 否 | 今天 | 结束日期，格式：YYYYMMDD |
| adjust | string | 否 | "" | 复权类型，""为不复权，"qfq"为前复权，"hfq"为后复权 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "stock_code": "600000",
      "stock_name": "浦发银行",
      "date": "2023-01-02",
      "open_price": 10.10,
      "close_price": 10.25,
      "high_price": 10.35,
      "low_price": 10.05,
      "change_percent": 2.5,
      "change_amount": 0.25,
      "volume": 123456,
      "amount": 1234567.89,
      "amplitude": 3.2,
      "turnover_rate": 1.5,
      "created_at": "2023-01-02T16:00:00"
    }
  ]
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 无效的股票代码或参数格式错误 |
| 404 | 获取股票历史行情数据失败 |
| 500 | 服务器内部错误 |

---

## 5. 获取股票详细信息

获取指定股票的详细基本信息。

### 请求信息

- **URL**: `/stocks/<str:stock_code>/info/`
- **方法**: GET
- **接口名称**: `stock_info`

### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| stock_code | string | 是 | 股票代码，如：600000 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "600000",
    "name": "浦发银行",
    "industry": "银行",
    "total_shares": 29352080397,
    "circulating_shares": 28103763899,
    "list_date": "1999-11-10",
    "pe_ratio": 5.23,
    "pb_ratio": 0.47,
    "total_market_cap": 1234567890.12,
    "circulating_market_cap": 1200000000.00,
    "created_at": "2023-01-01T12:00:00",
    "updated_at": "2023-01-02T12:00:00"
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 无效的股票代码 |
| 404 | 获取股票详细信息失败 |
| 500 | 服务器内部错误 |

---

## 6. 手动更新股票数据

手动触发更新股票数据，可以更新指定股票或所有股票的实时行情和历史数据。

### 请求信息

- **URL**: `/stocks/update/`
- **方法**: POST
- **接口名称**: `update_stock_data`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| stock_code | string | 否 | null | 股票代码，如果为空则更新所有股票 |
| update_type | string | 否 | "all" | 更新类型，"all"为全部，"realtime"为实时行情，"history"为历史数据 |
| days | int | 否 | 30 | 更新历史数据的天数 |

### 响应结果

```json
{
  "code": 200,
  "message": "股票数据更新成功",
  "data": {
    "result": {
      "realtime": {
        "updated": 3500,
        "created": 500,
        "failed": 0
      },
      "history": {
        "updated_stocks": 4000,
        "updated_history": 120000
      }
    }
  }
}
```


---

## 7. 获取业绩快报列表

获取特定报告期的所有股票业绩快报数据，支持分页。

### 请求信息

- **URL**: `/performance-reports/`
- **方法**: GET
- **接口名称**: `performance_report_list`

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| date | string | 是 | - | 报告期，格式：YYYYMMDD，如20200331 |
| stock_code | string | 否 | - | 股票代码，用于查询特定股票 |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页记录数 |

### 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reports": [
      {
        "stock_code": "600000",
        "stock_name": "浦发银行",
        "report_date": "20200331",
        "earnings_per_share": 0.65,
        "operating_revenue": 50123456789.12,
        "operating_revenue_growth_rate": "10.5%",
        "operating_revenue_quarter_growth": 2.3,
        "net_profit": 12345678901.23,
        "net_profit_growth_rate": "8.7%",
        "net_profit_quarter_growth": 1.5,
        "net_assets_per_share": 12.34,
        "roe": 5.67,
        "operating_cash_flow_per_share": 1.23,
        "gross_profit_margin": 45.67,
        "industry": "银行",
        "announcement_date": "2020-04-15"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 200,
      "total_count": 4000,
      "page_size": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 参数格式错误或页码超出范围 |
| 500 | 获取业绩快报数据失败 |

---

## 8. 获取指定股票的业绩快报数据

获取指定股票的所有业绩快报数据，支持分页。

### 请求信息

- **URL**: `/stocks/<str:stock_code>/performance-reports/`
- **方法**: GET
- **接口名称**: `stock_performance_reports`

### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| stock_code | string | 是 | 股票代码，如：600000 |

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 20 | 每页记录数 |

### 响应结果

```json
{
  "code": 200,
  "message": "成功获取股票600000的业绩快报数据",
  "data": {
    "stock_code": "600000",
    "reports": [
      {
          "id": 9814,
          "stock_code": "600000",
          "stock_name": "平安银行",
          "report_date": "20250630",
          "earnings_per_share": 1.18,
          "operating_revenue": 69385000000.0,
          "operating_revenue_growth_rate": -10.04,
          "operating_revenue_quarter_growth": 5.84,
          "net_profit": 24870000000.0,
          "net_profit_growth_rate": -3.9,
          "net_profit_quarter_growth": -23.57,
          "net_assets_per_share": 22.679,
          "roe": 5.25,
          "operating_cash_flow_per_share": 9.0014,
          "gross_profit_margin": null,
          "industry": "银行",
          "announcement_date": "2025-08-23",
          "created_at": "2025-10-11 14:33:51",
          "updated_at": "2025-10-11 14:33:51"
      },
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 100,
      "page_size": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### 错误码

| 错误码 | 描述 |
| --- | --- |
| 400 | 参数格式错误 |
| 500 | 更新股票数据失败 |