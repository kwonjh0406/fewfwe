-- 포트폴리오 테이블 (종목 그룹)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주식 종목 테이블
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  current_price DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 거래 기록 테이블 (매수/매도)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_stocks_portfolio_id ON stocks(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stock_id ON transactions(stock_id);

-- RLS 정책 활성화
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 공개 접근 정책 (인증 없이 사용 가능하도록)
CREATE POLICY "Allow public access to portfolios" ON portfolios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to stocks" ON stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
