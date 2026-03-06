-- =============================================================================
-- OpenRooms Production Seed
-- Real tools, focused agents, and a live multi-agent Market Intelligence workflow
-- Run: psql -d openrooms -f packages/database/seed-production.sql
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. TOOLS  — real HTTP + computation tools that make actual calls
-- =============================================================================

INSERT INTO tools (id, name, description, category, version, parameters, "returnType", timeout, metadata, "createdAt", "updatedAt")
VALUES

-- Crypto prices via CoinGecko (free, no key needed)
(
  '11111111-0001-0001-0001-000000000001',
  'get_crypto_price',
  'Fetch live cryptocurrency prices (BTC, ETH, SOL) from CoinGecko — no API key required',
  'HTTP_API',
  '1',
  '[{"name":"ids","type":"string","description":"Comma-separated coin ids, e.g. bitcoin,ethereum"},{"name":"vs_currencies","type":"string","description":"Currency to compare, e.g. usd"}]',
  '{"type":"object","properties":{"prices":{"type":"object"}}}',
  10000,
  '{"url":"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true","method":"GET","responseMapping":"$.bitcoin,$.ethereum,$.solana"}',
  NOW(), NOW()
),

-- Weather data via Open-Meteo (free, no key needed)
(
  '11111111-0001-0001-0001-000000000002',
  'get_weather',
  'Get real-time weather for any location (latitude/longitude) via Open-Meteo — no API key',
  'HTTP_API',
  '1',
  '[{"name":"latitude","type":"number","description":"Latitude of the location"},{"name":"longitude","type":"number","description":"Longitude of the location"}]',
  '{"type":"object","properties":{"current":{"type":"object"}}}',
  10000,
  '{"url":"https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,wind_speed_10m,weather_code&timezone=America%2FNew_York","method":"GET"}',
  NOW(), NOW()
),

-- GitHub trending repos (public API, no key)
(
  '11111111-0001-0001-0001-000000000003',
  'get_trending_repos',
  'Fetch trending GitHub repositories in a given language from the public GitHub API',
  'HTTP_API',
  '1',
  '[{"name":"language","type":"string","description":"Programming language filter, e.g. typescript"},{"name":"limit","type":"number","description":"Max repos to return"}]',
  '{"type":"object","properties":{"items":{"type":"array"}}}',
  10000,
  '{"url":"https://api.github.com/search/repositories?q=language:typescript&sort=stars&order=desc&per_page=5","method":"GET","headers":{"Accept":"application/vnd.github.v3+json"}}',
  NOW(), NOW()
),

-- CoinGecko market overview (top coins by market cap)
(
  '11111111-0001-0001-0001-000000000004',
  'get_market_overview',
  'Get top 10 cryptocurrencies by market cap with price, volume, and 24h change',
  'HTTP_API',
  '1',
  '[{"name":"limit","type":"number","description":"Number of coins to return (max 10)"}]',
  '{"type":"object","properties":{"coins":{"type":"array"}}}',
  10000,
  '{"url":"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false","method":"GET"}',
  NOW(), NOW()
),

-- HTTP fetch — general purpose fetch for any public URL
(
  '11111111-0001-0001-0001-000000000005',
  'http_fetch',
  'Make a GET request to any public URL and return the response body',
  'HTTP_API',
  '1',
  '[{"name":"url","type":"string","description":"The URL to fetch"},{"name":"headers","type":"object","description":"Optional request headers"}]',
  '{"type":"object","properties":{"status":{"type":"number"},"body":{"type":"string"}}}',
  15000,
  '{"url":"","method":"GET","dynamic":true}',
  NOW(), NOW()
),

-- Calculator — pure computation, no network
(
  '11111111-0001-0001-0001-000000000006',
  'calculator',
  'Evaluate a mathematical expression and return the numeric result',
  'COMPUTATION',
  '1',
  '[{"name":"expression","type":"string","description":"Math expression to evaluate, e.g. 42 * 7 / 3"}]',
  '{"type":"number"}',
  5000,
  '{"engine":"eval","safe":true}',
  NOW(), NOW()
),

-- Public blockchain data — Ethereum block info
(
  '11111111-0001-0001-0001-000000000007',
  'get_eth_gas',
  'Get current Ethereum gas prices from the public Etherscan-compatible endpoint',
  'HTTP_API',
  '1',
  '[]',
  '{"type":"object","properties":{"SafeGasPrice":{"type":"string"},"ProposeGasPrice":{"type":"string"}}}',
  10000,
  '{"url":"https://api.etherscan.io/api?module=gastracker&action=gasoracle","method":"GET"}',
  NOW(), NOW()
)

ON CONFLICT (name) DO UPDATE
  SET description = EXCLUDED.description,
      metadata    = EXCLUDED.metadata,
      "updatedAt" = NOW();


-- =============================================================================
-- 2. AGENTS  — three focused agents with real goals and the tools to do them
-- =============================================================================

-- Delete the placeholder agents created during dev
DELETE FROM agents WHERE name IN ('ty', 'polymarket', 'market');

INSERT INTO agents (
  id, name, description, goal, version,
  "allowedTools", "policyConfig", status, "loopState",
  "memoryState", "createdAt", "updatedAt"
)
VALUES

-- Agent 1: Crypto Data Collector
(
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Crypto Scout',
  'Monitors live cryptocurrency market data and extracts actionable price intelligence from CoinGecko.',
  'Fetch the current prices of Bitcoin, Ethereum, and Solana, note their 24h changes, and report a concise market snapshot with buy/sell sentiment.',
  1,
  ARRAY['get_crypto_price','get_market_overview','calculator'],
  '{"provider":"openai","model":"gpt-3.5-turbo","maxLoopIterations":5,"maxTokensPerRequest":2000,"maxCostPerExecution":0.10,"deniedTools":[]}',
  'ACTIVE',
  'IDLE',
  '{}',
  NOW(), NOW()
),

-- Agent 2: Market Analyst
(
  'aaaaaaaa-0002-0002-0002-000000000002',
  'Market Analyst',
  'Analyses price data and market signals to produce structured investment intelligence reports for traders.',
  'Given current crypto market data, perform quantitative analysis — calculate percentage changes, assess market momentum, and output a structured JSON report with sentiment score (1-10), key findings, and recommended action.',
  1,
  ARRAY['calculator','get_market_overview','get_crypto_price'],
  '{"provider":"openai","model":"gpt-3.5-turbo","maxLoopIterations":5,"maxTokensPerRequest":3000,"maxCostPerExecution":0.15,"deniedTools":[]}',
  'ACTIVE',
  'IDLE',
  '{}',
  NOW(), NOW()
),

-- Agent 3: Tech Trend Tracker
(
  'aaaaaaaa-0003-0003-0003-000000000003',
  'Tech Scout',
  'Tracks the pulse of the developer ecosystem by monitoring GitHub trending repositories and emerging technologies.',
  'Find the top 5 trending TypeScript repositories on GitHub this week, identify the dominant themes or use cases, and summarise what developers are building right now.',
  1,
  ARRAY['get_trending_repos','http_fetch'],
  '{"provider":"openai","model":"gpt-3.5-turbo","maxLoopIterations":4,"maxTokensPerRequest":2000,"maxCostPerExecution":0.08,"deniedTools":[]}',
  'ACTIVE',
  'IDLE',
  '{}',
  NOW(), NOW()
)

ON CONFLICT (name, version) DO UPDATE
  SET description   = EXCLUDED.description,
      goal          = EXCLUDED.goal,
      "allowedTools"  = EXCLUDED."allowedTools",
      "policyConfig"  = EXCLUDED."policyConfig",
      "updatedAt"   = NOW();


-- =============================================================================
-- 3. WORKFLOW  — Market Intelligence Pipeline (3-agent orchestration)
-- =============================================================================

-- Delete old placeholder workflows
DELETE FROM workflow_nodes WHERE "workflowId" IN (
  SELECT id FROM workflows WHERE name IN ('market','ty')
);
DELETE FROM workflows WHERE name IN ('market','ty');

-- Create the workflow
INSERT INTO workflows (id, name, description, version, status, "initialNodeId", metadata, "createdAt", "updatedAt")
VALUES (
  'bbbbbbbb-0001-0001-0001-000000000001',
  'Market Intelligence Pipeline',
  'A 3-agent autonomous pipeline: Crypto Scout fetches live prices → Market Analyst calculates sentiment → Tech Scout identifies emerging tech. Outputs a structured market intelligence brief.',
  1,
  'ACTIVE',
  'cccccccc-0001-0001-0001-000000000001',
  '{"tags":["market","crypto","ai","orchestration"],"estimatedRuntime":"45s","category":"finance"}',
  NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE
  SET description = EXCLUDED.description,
      status      = EXCLUDED.status,
      "updatedAt" = NOW();

-- Delete any existing nodes for this workflow before reinserting
DELETE FROM workflow_nodes WHERE "workflowId" = 'bbbbbbbb-0001-0001-0001-000000000001';

-- Node 1: START
INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES (
  'dddddddd-0001-0001-0001-000000000001',
  'bbbbbbbb-0001-0001-0001-000000000001',
  'cccccccc-0001-0001-0001-000000000001',
  'START',
  'Start',
  'Initialise the market intelligence pipeline and set execution context',
  '{"nextNodeId":"cccccccc-0002-0002-0002-000000000002"}',
  NOW(), NOW()
);

-- Node 2: Crypto Scout agent
INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES (
  'dddddddd-0002-0002-0002-000000000002',
  'bbbbbbbb-0001-0001-0001-000000000001',
  'cccccccc-0002-0002-0002-000000000002',
  'AGENT',
  'Fetch Market Data',
  'Crypto Scout agent fetches live BTC, ETH, SOL prices and market overview from CoinGecko',
  '{"agentId":"aaaaaaaa-0001-0001-0001-000000000001","nextNodeId":"cccccccc-0003-0003-0003-000000000003","maxIterations":3}',
  NOW(), NOW()
);

-- Node 3: Market Analyst agent
INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES (
  'dddddddd-0003-0003-0003-000000000003',
  'bbbbbbbb-0001-0001-0001-000000000001',
  'cccccccc-0003-0003-0003-000000000003',
  'AGENT',
  'Analyse Market Signals',
  'Market Analyst processes collected data, calculates momentum, and produces a sentiment report',
  '{"agentId":"aaaaaaaa-0002-0002-0002-000000000002","nextNodeId":"cccccccc-0004-0004-0004-000000000004","maxIterations":3}',
  NOW(), NOW()
);

-- Node 4: Tech Scout agent
INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES (
  'dddddddd-0004-0004-0004-000000000004',
  'bbbbbbbb-0001-0001-0001-000000000001',
  'cccccccc-0004-0004-0004-000000000004',
  'AGENT',
  'Track Tech Trends',
  'Tech Scout fetches GitHub trending repos and identifies emerging technologies',
  '{"agentId":"aaaaaaaa-0003-0003-0003-000000000003","nextNodeId":"cccccccc-0005-0005-0005-000000000005","maxIterations":2}',
  NOW(), NOW()
);

-- Node 5: END
INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES (
  'dddddddd-0005-0005-0005-000000000005',
  'bbbbbbbb-0001-0001-0001-000000000001',
  'cccccccc-0005-0005-0005-000000000005',
  'END',
  'Publish Intelligence Brief',
  'Compile all agent outputs into a structured market intelligence brief and mark run complete',
  '{}',
  NOW(), NOW()
);


-- =============================================================================
-- 4. SECOND WORKFLOW  — Tech Ecosystem Monitor (standalone Tech Scout)
-- =============================================================================

INSERT INTO workflows (id, name, description, version, status, "initialNodeId", metadata, "createdAt", "updatedAt")
VALUES (
  'bbbbbbbb-0002-0002-0002-000000000002',
  'Tech Ecosystem Monitor',
  'Single-agent workflow: Tech Scout continuously monitors GitHub and developer trends to surface emerging tools and frameworks before they go mainstream.',
  1,
  'ACTIVE',
  'eeeeeeee-0001-0001-0001-000000000001',
  '{"tags":["tech","github","developer"],"estimatedRuntime":"20s","category":"technology"}',
  NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE
  SET description = EXCLUDED.description,
      status      = EXCLUDED.status,
      "updatedAt" = NOW();

DELETE FROM workflow_nodes WHERE "workflowId" = 'bbbbbbbb-0002-0002-0002-000000000002';

INSERT INTO workflow_nodes (id, "workflowId", "nodeId", type, name, description, config, "createdAt", "updatedAt")
VALUES
(
  'ffffffff-0001-0001-0001-000000000001',
  'bbbbbbbb-0002-0002-0002-000000000002',
  'eeeeeeee-0001-0001-0001-000000000001',
  'START', 'Start', 'Begin tech monitoring', '{}', NOW(), NOW()
),
(
  'ffffffff-0002-0002-0002-000000000002',
  'bbbbbbbb-0002-0002-0002-000000000002',
  'eeeeeeee-0002-0002-0002-000000000002',
  'AGENT', 'Scout GitHub Trends',
  'Tech Scout fetches trending repos and analyses what the community is building',
  '{"agentId":"aaaaaaaa-0003-0003-0003-000000000003","maxIterations":3}',
  NOW(), NOW()
),
(
  'ffffffff-0003-0003-0003-000000000003',
  'bbbbbbbb-0002-0002-0002-000000000002',
  'eeeeeeee-0003-0003-0003-000000000003',
  'END', 'Complete', 'Tech trend report ready', '{}', NOW(), NOW()
);

COMMIT;

-- Summary
SELECT 'Tools' as entity, count(*) as count FROM tools
UNION ALL
SELECT 'Agents', count(*) FROM agents
UNION ALL
SELECT 'Workflows', count(*) FROM workflows
UNION ALL
SELECT 'Workflow Nodes', count(*) FROM workflow_nodes;
