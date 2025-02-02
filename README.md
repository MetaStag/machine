# Machine

This is the frontend for our Cryto market manipulation detection project

#### Tech Stack
- Next.js -> UI
- Paparse -> CSV parsing
- markdown-it -> Markdown parsing
- open ai -> to connect with open ai api
- tradingview -> For trading components

#### Flow
- There are 2 pages, `/analysis` and `/market`. Going to the home page `/` redirects to `/market`
- In `/market`, the graphs of crypto coins are shown, along with the ratio of buyers to sellers in a particular time frame, the top market share holders in crypto space, and latest news revolving around crypto
- Click "Analyze with AI" button to head to analysis
- In `/analysis`, the frontend sends an API request via OpenAPI to the backend Heurist LLMs with a customized prompt. The LLM processes the request and returns the response. The response is cleaned and parsed to display in proper html formatting