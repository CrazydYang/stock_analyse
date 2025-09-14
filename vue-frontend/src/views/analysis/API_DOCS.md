# 上证A股实时行情API文档

本文档描述了基于akshare库的上证A股实时行情API接口，提供完整的23个字段的股票数据，包括价格、成交量、技术指标、市值等全面信息。

## 基础信息

- **Base URL**: `http://localhost:5000/api/sh-a`
- **数据格式**: JSON
- **编码**: UTF-8
- **更新频率**: 实时数据（来自akshare）

## 接口列表

### 1. 获取上证A股实时行情数据

获取全部上证A股实时行情数据。

**Endpoint**: `GET /api/sh-a/realtime`

**Query Parameters**:
- `limit` (int, optional): 返回股票数量限制，默认返回全部
- `offset` (int, optional): 偏移量，默认0

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "timestamp": "2024-01-01T12:00:00",
  "data": {
    "total": 500,
    "stocks": [
      {
        "code": "600000",
        "name": "浦发银行",
        "latest_price": 7.25,
        "change_percent": 1.25,
        "change_amount": 0.09,
        "volume": 12345678,
        "amount": 123456789.0,
        "amplitude": 3.45,
        "high": 7.35,
        "low": 7.15,
        "open": 7.18,
        "close": 7.16,
        "volume_ratio": 1.25,
        "turnover_rate": 2.35,
        "pe_ratio": 5.67,
        "pb_ratio": 0.89,
        "total_market_cap": 1567.89,
        "circulation_market_cap": 1567.89,
        "speed": 0.14,
        "change_5min": 0.28,
        "change_60day": 12.34,
        "change_ytd": 8.91,
        "timestamp": "2024-01-01T12:00:00"
      }
    ],
    "query_time": "2024-01-01T12:00:00"
  }
}
```

### 2. 筛选上证A股股票

根据条件筛选上证A股股票。

**Endpoint**: `GET /api/sh-a/filter`

**Query Parameters**:
- `min_price` (float, optional): 最低价格，默认0
- `max_price` (float, optional): 最高价格，默认1000
- `min_turnover_rate` (float, optional): 最低换手率(%)，默认0
- `max_turnover_rate` (float, optional): 最高换手率(%)，默认100
- `min_market_cap` (float, optional): 最低流通市值(亿元)，默认0
- `max_market_cap` (float, optional): 最高流通市值(亿元)，默认100000
- `sort_by` (str, optional): 排序字段，可选: latest_price, change_percent, turnover_rate, total_market_cap, circulation_market_cap，默认turnover_rate
- `ascending` (bool, optional): 是否升序，默认true

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "stocks": [...],
    "filters": {
      "min_price": 10,
      "max_price": 60,
      "min_turnover_rate": 1,
      "max_turnover_rate": 5,
      "min_market_cap": 100,
      "max_market_cap": 100000,
      "sort_by": "turnover_rate",
      "ascending": true
    }
  }
}
```

### 3. 获取单只股票详情

根据股票代码获取单只股票详细信息。

**Endpoint**: `GET /api/sh-a/stock/<code>`

**Path Parameters**:
- `code` (str): 股票代码，例如：600000

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "600000",
    "name": "浦发银行",
    "latest_price": 7.25,
    "change_percent": 1.25,
    "change_amount": 0.09,
    "volume": 12345678,
    "amount": 123456789.0,
    "amplitude": 3.45,
    "high": 7.35,
    "low": 7.15,
    "open": 7.18,
    "close": 7.16,
    "volume_ratio": 1.25,
    "turnover_rate": 2.35,
    "pe_ratio": 5.67,
    "pb_ratio": 0.89,
    "total_market_cap": 1567.89,
    "circulation_market_cap": 1567.89,
    "speed": 0.14,
    "change_5min": 0.28,
    "change_60day": 12.34,
    "change_ytd": 8.91,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

### 4. 获取市场概览

获取上证A股市场概览信息。

**Endpoint**: `GET /api/sh-a/market-summary`

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_stocks": 500,
    "up_stocks": 250,
    "down_stocks": 200,
    "flat_stocks": 50,
    "avg_turnover_rate": 2.35,
    "avg_change_percent": 1.25,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

### 5. 获取热门股票

获取换手率最高的热门股票。

**Endpoint**: `GET /api/sh-a/hot-stocks`

**Query Parameters**:
- `count` (int, optional): 返回股票数量，默认10，最大100

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 10,
    "stocks": [...]
  }
}
```

### 6. 获取低换手率优质股票

基于原有代码逻辑获取低换手率优质股票（换手率在1%到5%之间，价格在10-60之间，流通市值大于100亿）。

**Endpoint**: `GET /api/sh-a/low-turnover-stocks`

**Query Parameters**:
- `count` (int, optional): 返回股票数量，默认20，最大100

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 20,
    "stocks": [...],
    "criteria": {
      "price_range": "10-60",
      "turnover_range": "1%-5%",
      "min_market_cap": "100亿元",
      "sort_by": "turnover_rate_asc"
    }
  }
}
```

### 7. 获取股票类型信息

获取指定上证股票的类型信息，包括行业、板块等详细信息。

**Endpoint**: `GET /api/sh-a/stock/<code>/type`

**Path Parameters**:
- `code` (str): 股票代码，例如：600000

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "600000",
    "name": "浦发银行",
    "industry": "银行",
    "sector": "股份制银行",
    "board": "上证主板",
    "market": "上证A股",
    "list_date": "1999-11-10",
    "total_shares": 2935208.04,
    "circulating_shares": 2935208.04,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

### 8. 批量获取股票类型信息

批量获取多个股票的类型信息。

**Endpoint**: `POST /api/sh-a/stock/types/batch`

**Request Body**:
```json
{
  "codes": ["600000", "600001", "688001"]
}
```

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "types": [
      {
        "code": "600000",
        "name": "浦发银行",
        "industry": "银行",
        "board": "上证主板"
      },
      {
        "code": "600001",
        "name": "邯郸钢铁",
        "industry": "钢铁",
        "board": "上证主板"
      },
      {
        "code": "688001",
        "name": "华兴源创",
        "industry": "专用设备",
        "board": "科创板"
      }
    ]
  }
}
```

### 9. 获取行业分类

获取所有上证A股的行业分类信息，基于股票名称特征进行智能分类，避免重复API调用。

**Endpoint**: `GET /api/sh-a/industries`

**Response Example**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "industries": [
      {
        "industry": "银行",
        "count": 32,
        "stocks": [
          {"code": "600000", "name": "浦发银行"},
          {"code": "600015", "name": "华夏银行"}
        ]
      },
      {
        "industry": "医药",
        "count": 45,
        "stocks": [
          {"code": "600276", "name": "恒瑞医药"},
          {"code": "600196", "name": "复星医药"}
        ]
      },
      {
        "industry": "其他",
        "count": 120,
        "stocks": [
          {"code": "600519", "name": "贵州茅台"}
        ]
      }
    ]
  }
}
```

**注意**: 行业分类基于股票名称特征进行智能识别，主要行业包括：银行、保险、证券、医药、房地产、汽车、钢铁、电力、石油、化工、机械、电子、通信、计算机、食品饮料、纺织服装、家电、建材、交通运输、农林牧渔、传媒、环保、有色金属、煤炭等。无法识别的股票将归类为"其他"。

## 字段说明

### 股票行情字段

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| code | string | 股票代码 | - |
| name | string | 股票名称 | - |
| latest_price | float | 最新价 | 元 |
| change_percent | float | 涨跌幅 | % |
| change_amount | float | 涨跌额 | 元 |
| volume | integer | 成交量 | 手 |
| amount | float | 成交额 | 元 |
| amplitude | float | 振幅 | % |
| high | float | 最高价 | 元 |
| low | float | 最低价 | 元 |
| open | float | 今开价 | 元 |
| close | float | 昨收价 | 元 |
| volume_ratio | float | 量比 | - |
| turnover_rate | float | 换手率 | % |
| pe_ratio | float | 市盈率(动态) | - |
| pb_ratio | float | 市净率 | - |
| total_market_cap | float | 总市值 | 亿元 |
| circulation_market_cap | float | 流通市值 | 亿元 |
| speed | float | 涨速 | % |
| change_5min | float | 5分钟涨跌 | % |
| change_60day | float | 60日涨跌幅 | % |
| change_ytd | float | 年初至今涨跌幅 | % |
| timestamp | string | 数据时间 | ISO 8601 |

### 股票类型字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| industry | string | 行业分类 | "银行" |
| sector | string | 细分行业 | "股份制银行" |
| board | string | 所属板块 | "上证主板" / "科创板" |
| market | string | 所属市场 | "上证A股" |
| list_date | string | 上市日期 | "1999-11-10" |
| total_shares | float | 总股本 | 万股 |
| circulating_shares | float | 流通股本 | 万股 |

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 使用示例

### 获取全部上证A股数据
```bash
curl http://localhost:5000/api/sh-a/realtime
```

### 筛选低换手率股票
```bash
curl "http://localhost:5000/api/sh-a/filter?min_price=10&max_price=60&min_turnover_rate=1&max_turnover_rate=5&min_market_cap=100&sort_by=turnover_rate&ascending=true"
```

### 获取单只股票信息
```bash
curl http://localhost:5000/api/sh-a/stock/600000
```

### 获取市场概览
```bash
curl http://localhost:5000/api/sh-a/market-summary
```

### 获取热门股票
```bash
curl "http://localhost:5000/api/sh-a/hot-stocks?count=20"
```

### 获取低换手率优质股票
```bash
curl "http://localhost:5000/api/sh-a/low-turnover-stocks?count=50"
```

### 获取股票类型信息
```bash
curl http://localhost:5000/api/sh-a/stock/600000/type
```

### 批量获取股票类型信息
```bash
curl -X POST http://localhost:5000/api/sh-a/stock/types/batch \
  -H "Content-Type: application/json" \
  -d '{"codes": ["600000", "600001", "688001"]}'
```

### 获取行业分类
```bash
curl http://localhost:5000/api/sh-a/industries
```

## 注意事项

1. 数据来源于akshare，为实时数据
2. 所有市值单位已转换为亿元
3. 换手率单位为百分比
4. 价格单位为元
5. 数据更新频率取决于akshare数据源
6. 内置SQLite缓存机制，缓存有效期6小时，可配置
7. 支持环境变量配置缓存时间和重试参数
8. 提供完整的23个股票数据字段

## 快速测试

1. 安装依赖：
```bash
pip install akshare
```

2. 启动服务：
```bash
python3 run.py
```

3. 测试接口：
```bash
curl http://localhost:5000/api/sh-a/low-turnover-stocks
```


curl --location 'http://localhost:8000/django/api/strategy/industry-turnover-percentile/?end_date=2025-09-14&start_date=2025-09-12'

{
    "code": 200,
    "message": "success",
    "timestamp": "2025-09-14T18:34:38.226140",
    "data": {
        "total": 86,
        "data": [
            {
                "date": "2025-09-12",
                "sector_code": "BK0420",
                "sector_name": "航空机场",
                "total_amount": 5276097131.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0020702913378848765,
                "turnover_ratio_percentile": 12.790697674418606
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0421",
                "sector_name": "铁路公路",
                "total_amount": 4380997822.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0017190627118837836,
                "turnover_ratio_percentile": 8.13953488372093
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0422",
                "sector_name": "物流行业",
                "total_amount": 9204349750.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0036117010519622727,
                "turnover_ratio_percentile": 33.72093023255814
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0424",
                "sector_name": "水泥建材",
                "total_amount": 7155174101.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0028076236268134974,
                "turnover_ratio_percentile": 25.581395348837212
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0425",
                "sector_name": "工程建设",
                "total_amount": 25913933742.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.01016838606730063,
                "turnover_ratio_percentile": 68.6046511627907
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0427",
                "sector_name": "公用事业",
                "total_amount": 2590928178.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0010166560680770844,
                "turnover_ratio_percentile": 2.3255813953488373
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0428",
                "sector_name": "电力行业",
                "total_amount": 30302841018.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.011890552375213264,
                "turnover_ratio_percentile": 73.25581395348837
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0429",
                "sector_name": "交运设备",
                "total_amount": 12015620243.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004714817390725758,
                "turnover_ratio_percentile": 44.18604651162791
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0433",
                "sector_name": "农牧饲渔",
                "total_amount": 23072405559.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.00905339689300056,
                "turnover_ratio_percentile": 62.7906976744186
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0436",
                "sector_name": "纺织服装",
                "total_amount": 11889099175.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004665171702893112,
                "turnover_ratio_percentile": 43.02325581395349
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0437",
                "sector_name": "煤炭行业",
                "total_amount": 8007039124.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0031418875219570916,
                "turnover_ratio_percentile": 29.069767441860467
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0438",
                "sector_name": "食品饮料",
                "total_amount": 19645795271.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0077088269540068425,
                "turnover_ratio_percentile": 55.81395348837209
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0440",
                "sector_name": "家用轻工",
                "total_amount": 6024316694.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0023638857205609425,
                "turnover_ratio_percentile": 23.25581395348837
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0447",
                "sector_name": "互联网服务",
                "total_amount": 119908077921.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.047050812162591917,
                "turnover_ratio_percentile": 96.51162790697676
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0448",
                "sector_name": "通信设备",
                "total_amount": 131289193177.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.05151665571037747,
                "turnover_ratio_percentile": 97.67441860465115
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0450",
                "sector_name": "航运港口",
                "total_amount": 9653815336.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.003788067158625814,
                "turnover_ratio_percentile": 34.883720930232556
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0451",
                "sector_name": "房地产开发",
                "total_amount": 33570056119.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.013172577128484804,
                "turnover_ratio_percentile": 74.4186046511628
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0454",
                "sector_name": "塑料制品",
                "total_amount": 27730949904.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.010881366273613177,
                "turnover_ratio_percentile": 72.09302325581395
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0456",
                "sector_name": "家电行业",
                "total_amount": 34504177915.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.013539117814672232,
                "turnover_ratio_percentile": 76.74418604651163
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0457",
                "sector_name": "电网设备",
                "total_amount": 33652643809.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.013204983768275098,
                "turnover_ratio_percentile": 75.5813953488372
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0458",
                "sector_name": "仪器仪表",
                "total_amount": 12516236950.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0049112547205112525,
                "turnover_ratio_percentile": 45.348837209302324
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0459",
                "sector_name": "电子元件",
                "total_amount": 149127624234.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.058516289792505144,
                "turnover_ratio_percentile": 98.83720930232558
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0464",
                "sector_name": "石油行业",
                "total_amount": 5622612432.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.002206260712271451,
                "turnover_ratio_percentile": 18.6046511627907
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0465",
                "sector_name": "化学制药",
                "total_amount": 52074080729.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.02043338391708742,
                "turnover_ratio_percentile": 84.88372093023256
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0470",
                "sector_name": "造纸印刷",
                "total_amount": 8398274695.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0032954047134725224,
                "turnover_ratio_percentile": 32.55813953488372
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0471",
                "sector_name": "化纤行业",
                "total_amount": 5831094917.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0022880672962064226,
                "turnover_ratio_percentile": 20.930232558139537
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0473",
                "sector_name": "证券",
                "total_amount": 43568213162.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.017095760763470764,
                "turnover_ratio_percentile": 82.55813953488372
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0474",
                "sector_name": "保险",
                "total_amount": 8203698181.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.003219054702946146,
                "turnover_ratio_percentile": 31.3953488372093
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0475",
                "sector_name": "银行",
                "total_amount": 34965459837.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.013720120541446994,
                "turnover_ratio_percentile": 77.90697674418605
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0476",
                "sector_name": "装修建材",
                "total_amount": 7707954509.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.003024529506675107,
                "turnover_ratio_percentile": 26.744186046511626
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0477",
                "sector_name": "酿酒行业",
                "total_amount": 21382086732.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.008390131540048546,
                "turnover_ratio_percentile": 59.30232558139535
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0478",
                "sector_name": "有色金属",
                "total_amount": 67594224426.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.026523343646948895,
                "turnover_ratio_percentile": 89.53488372093024
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0479",
                "sector_name": "钢铁行业",
                "total_amount": 17853449510.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007005527183104088,
                "turnover_ratio_percentile": 50.0
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0480",
                "sector_name": "航天航空",
                "total_amount": 18087295736.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007097286262602519,
                "turnover_ratio_percentile": 51.162790697674424
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0481",
                "sector_name": "汽车零部件",
                "total_amount": 80407852949.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.031551292048841474,
                "turnover_ratio_percentile": 90.69767441860465
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0482",
                "sector_name": "商业百货",
                "total_amount": 24354585412.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.009556512316649573,
                "turnover_ratio_percentile": 66.27906976744185
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0484",
                "sector_name": "贸易行业",
                "total_amount": 10550885412.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004140069095229002,
                "turnover_ratio_percentile": 38.372093023255815
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0485",
                "sector_name": "旅游酒店",
                "total_amount": 15219228679.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0059718834815027195,
                "turnover_ratio_percentile": 47.674418604651166
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0486",
                "sector_name": "文化传媒",
                "total_amount": 43217296770.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.01695806444199654,
                "turnover_ratio_percentile": 81.3953488372093
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0538",
                "sector_name": "化学制品",
                "total_amount": 40427414384.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.015863340597070154,
                "turnover_ratio_percentile": 80.23255813953489
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0539",
                "sector_name": "综合行业",
                "total_amount": 10278901848.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004033345279761728,
                "turnover_ratio_percentile": 36.04651162790697
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0545",
                "sector_name": "通用设备",
                "total_amount": 63688596801.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.024990811769638886,
                "turnover_ratio_percentile": 88.37209302325581
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0546",
                "sector_name": "玻璃玻纤",
                "total_amount": 10410179382.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004084857360519722,
                "turnover_ratio_percentile": 37.2093023255814
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0725",
                "sector_name": "装修装饰",
                "total_amount": 4184177419.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0016418322202281684,
                "turnover_ratio_percentile": 6.976744186046512
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0726",
                "sector_name": "工程咨询服务",
                "total_amount": 4967511873.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0019492053588412565,
                "turnover_ratio_percentile": 10.465116279069768
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0727",
                "sector_name": "医疗服务",
                "total_amount": 26855442177.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.01053782520178385,
                "turnover_ratio_percentile": 69.76744186046511
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0728",
                "sector_name": "环保行业",
                "total_amount": 18495119772.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007257312613169728,
                "turnover_ratio_percentile": 52.32558139534884
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0729",
                "sector_name": "船舶制造",
                "total_amount": 5047514523.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0019805976530296397,
                "turnover_ratio_percentile": 11.627906976744185
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0730",
                "sector_name": "农药兽药",
                "total_amount": 5698218407.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0022359277921694233,
                "turnover_ratio_percentile": 19.767441860465116
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0731",
                "sector_name": "化肥行业",
                "total_amount": 7792663827.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.003057768653517784,
                "turnover_ratio_percentile": 27.906976744186046
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0732",
                "sector_name": "贵金属",
                "total_amount": 19641696869.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007707218779261553,
                "turnover_ratio_percentile": 54.65116279069767
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0733",
                "sector_name": "包装材料",
                "total_amount": 5299121147.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0020793257471659445,
                "turnover_ratio_percentile": 13.953488372093023
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0734",
                "sector_name": "珠宝首饰",
                "total_amount": 3739718564.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.001467430708143358,
                "turnover_ratio_percentile": 5.813953488372093
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0735",
                "sector_name": "计算机设备",
                "total_amount": 43761140866.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.017171463796321017,
                "turnover_ratio_percentile": 83.72093023255815
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0736",
                "sector_name": "通信服务",
                "total_amount": 18985779789.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007449843030601412,
                "turnover_ratio_percentile": 53.48837209302325
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0737",
                "sector_name": "软件开发",
                "total_amount": 102724356557.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.04030808006171913,
                "turnover_ratio_percentile": 93.02325581395348
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0738",
                "sector_name": "多元金融",
                "total_amount": 8164022439.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0032034863115865298,
                "turnover_ratio_percentile": 30.23255813953488
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0739",
                "sector_name": "工程机械",
                "total_amount": 11585546326.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004546060394236088,
                "turnover_ratio_percentile": 40.69767441860465
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0740",
                "sector_name": "教育",
                "total_amount": 3024033601.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0011866025992657394,
                "turnover_ratio_percentile": 4.651162790697675
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK0910",
                "sector_name": "专用设备",
                "total_amount": 83372576047.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.03271462175953869,
                "turnover_ratio_percentile": 91.86046511627907
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1015",
                "sector_name": "能源金属",
                "total_amount": 22675818956.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.008897780006403086,
                "turnover_ratio_percentile": 60.46511627906976
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1016",
                "sector_name": "汽车服务",
                "total_amount": 1845964173.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0007243391360165086,
                "turnover_ratio_percentile": 1.1627906976744187
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1017",
                "sector_name": "采掘行业",
                "total_amount": 5921058347.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0023233681076264942,
                "turnover_ratio_percentile": 22.093023255813954
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1018",
                "sector_name": "橡胶制品",
                "total_amount": 6920056126.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.002715365524860914,
                "turnover_ratio_percentile": 24.418604651162788
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1019",
                "sector_name": "化学原料",
                "total_amount": 16849046935.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.006611408974295138,
                "turnover_ratio_percentile": 48.837209302325576
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1020",
                "sector_name": "非金属材料",
                "total_amount": 27711967768.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.010873917860371417,
                "turnover_ratio_percentile": 70.93023255813954
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1027",
                "sector_name": "小金属",
                "total_amount": 58295675976.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.02287467990309375,
                "turnover_ratio_percentile": 87.20930232558139
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1028",
                "sector_name": "燃气",
                "total_amount": 2960715043.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0011617569872726344,
                "turnover_ratio_percentile": 3.488372093023256
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1029",
                "sector_name": "汽车整车",
                "total_amount": 22706819193.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.008909944210461497,
                "turnover_ratio_percentile": 61.627906976744185
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1030",
                "sector_name": "电机",
                "total_amount": 25052318905.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.00983029643601742,
                "turnover_ratio_percentile": 67.44186046511628
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1031",
                "sector_name": "光伏设备",
                "total_amount": 57375099528.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.022513454285210933,
                "turnover_ratio_percentile": 86.04651162790698
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1032",
                "sector_name": "风电设备",
                "total_amount": 11466023566.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004499160777234308,
                "turnover_ratio_percentile": 39.53488372093023
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1033",
                "sector_name": "电池",
                "total_amount": 108989525119.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.04276647381040261,
                "turnover_ratio_percentile": 95.34883720930233
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1034",
                "sector_name": "电源设备",
                "total_amount": 20783078420.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.008155086261528513,
                "turnover_ratio_percentile": 58.139534883720934
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1035",
                "sector_name": "美容护理",
                "total_amount": 5345101900.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0020973681660755605,
                "turnover_ratio_percentile": 15.11627906976744
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1036",
                "sector_name": "半导体",
                "total_amount": 224064612487.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.08792086552630368,
                "turnover_ratio_percentile": 100.0
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1037",
                "sector_name": "消费电子",
                "total_amount": 103074406174.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.04044543626876221,
                "turnover_ratio_percentile": 94.18604651162791
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1038",
                "sector_name": "光学光电子",
                "total_amount": 37894351251.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.014869390233314912,
                "turnover_ratio_percentile": 79.06976744186046
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1039",
                "sector_name": "电子化学品",
                "total_amount": 13588651024.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0053320600076207465,
                "turnover_ratio_percentile": 46.51162790697674
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1040",
                "sector_name": "中药",
                "total_amount": 11642508336.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.004568411756040749,
                "turnover_ratio_percentile": 41.86046511627907
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1041",
                "sector_name": "医疗器械",
                "total_amount": 23420538025.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.00919000082786021,
                "turnover_ratio_percentile": 63.95348837209303
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1042",
                "sector_name": "医药商业",
                "total_amount": 5393953143.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.002116536938506526,
                "turnover_ratio_percentile": 16.27906976744186
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1043",
                "sector_name": "专业服务",
                "total_amount": 5527329290.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.002168872495445415,
                "turnover_ratio_percentile": 17.441860465116278
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1044",
                "sector_name": "生物制品",
                "total_amount": 23882689450.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.009371344739507891,
                "turnover_ratio_percentile": 65.11627906976744
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1045",
                "sector_name": "房地产服务",
                "total_amount": 4631798879.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.0018174747090376456,
                "turnover_ratio_percentile": 9.30232558139535
            },
            {
                "date": "2025-09-12",
                "sector_code": "BK1046",
                "sector_name": "游戏",
                "total_amount": 19848005188.0,
                "daily_total_amount": 2548480513081.0,
                "turnover_ratio": 0.007788172240722626,
                "turnover_ratio_percentile": 56.97674418604651
            }
        ],
        "start_date": "2025-09-12",
        "end_date": "2025-09-14",
        "query_time": "2025-09-14T18:34:38.226131"
    }
}