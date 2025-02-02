# Machine

This is the repository for our Cryto market manipulation detection project

#### Tech Stack
- Frontend
  - Next.js -> UI
  - Paparse -> CSV parsing
  - markdown-it -> Markdown parsing

- Backend
  - Model training
  - Ensemble training - Isolation Forest, Seasonal decomposition, Single class SVM
  - Heurist Agent Framework (deepseek/deepseek-r1 model)


#### Frontend Flow
- There are 2 pages, `/analysis` and `/market`. Going to the home page `/` redirects to `/market`
- In `/market`, the graphs of crypto coins are shown, along with the ratio of buyers to sellers in a particular time frame, the top market share holders in crypto space, and latest news revolving around crypto
- Click "Analyze with AI" button to head to analysis
- In `/analysis`, the frontend sends an API request via OpenAPI to the backend Heurist LLMs with a customized prompt. The LLM processes the request and returns the response. The response is cleaned and parsed to display in proper html formatting

#### Folder Structure
- The `app/` directory is the root folder of frontend
- The `models/` directory contains the model python file along with important data
- The `public/` directory contains our custom-made dataset