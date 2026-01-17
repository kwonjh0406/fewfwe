-- 기존 stocks 테이블에서 symbol, current_price 컬럼 제거
ALTER TABLE stocks DROP COLUMN IF EXISTS symbol;
ALTER TABLE stocks DROP COLUMN IF EXISTS current_price;
