export const COURSE = {
  title: 'System Lab',
  subtitle: 'Learn system architecture through step-by-step simulated diagrams',
  storagePrefix: 'sim:',
  modules: [
    {
      id: 'scaling',
      num: '01',
      title: 'Speed & Scale',
      color: 'green',
      lessons: [
        {
          id: 'caching-basics',
          title: 'Caching & Read Offloading',
          summary: 'Why the database collapses when read traffic spikes, and how Cache-Aside rescues p99 latency.',
          minutes: 6,
          level: 'Beginner',
          metrics: [
            { id: 'rps', label: 'Traffic', unit: ' req/s' },
            { id: 'hit', label: 'Cache Hit', unit: '%' },
            { id: 'dbQps', label: 'DB Load', unit: ' qps', tone: (v) => (v > 2500 ? 'bad' : v > 1000 ? 'warn' : 'ok') },
            { id: 'p99', label: 'p99 Latency', unit: ' ms', tone: (v) => (v > 300 ? 'bad' : v > 80 ? 'warn' : 'ok') },
          ],
          steps: [
            {
              short: 'The problem',
              chapter: 'problem',
              title: 'The product detail page must open instantly',
              body: [
                'Whenever a user opens a product page, the app must return the name, price and description in under <code>50 ms</code> to keep the experience smooth.',
                'In the early stage, all product data lives in a single relational database.',
              ],
              metrics: { rps: 120, hit: null, dbQps: 120, p99: 22 },
              scene: {
                entities: {
                  user: { kind: 'device', pos: [-7.5, 0], label: 'Browser', sub: '120 req/s', tone: 'blue' },
                  app: { kind: 'block', pos: [0, 0], label: 'App Server', sub: 'Stateless API', tone: 'green', cpu: 0.22 },
                  db: { kind: 'db', pos: [7.5, 0], label: 'Primary DB', sub: 'SSD Storage', tone: 'violet', cpu: 0.28 },
                },
                links: {
                  l1: { from: 'user', to: 'app', label: 'HTTPS' },
                  l2: { from: 'app', to: 'db', label: 'SELECT' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 1.0, speed: 0.65 },
                  { link: 'l2', kind: 'req', rate: 1.0, speed: 0.6 },
                ],
              },
            },
            {
              short: 'Direct reads',
              chapter: 'baseline',
              title: 'Every page view hits the DB disk',
              body: [
                'The same discounted headphones are being viewed by 10,000 people, yet the <code>App Server</code> keeps repeating the exact same <code>SELECT * FROM products WHERE id = 42</code> query for every view.',
                'At a few hundred requests per second, the DB buffer pool can still keep up.',
              ],
              callout: {
                kind: 'insight',
                title: 'Real-world read/write ratio',
                text: 'Most e-commerce and social systems see 20–100 times more reads than writes.',
              },
              changes: ['~ 100% of reads go straight to the Primary DB'],
              metrics: { rps: 450, hit: 0, dbQps: 450, p99: 38 },
              scene: {
                entities: {
                  users: { kind: 'crowd', pos: [-8, 0], label: 'Shoppers', sub: '450 req/s', tone: 'blue' },
                  app: { kind: 'block', pos: [0, 0], label: 'App Server', tone: 'green', cpu: 0.42 },
                  db: { kind: 'db', pos: [8, 0], label: 'Primary DB', sub: '450 qps', tone: 'violet', cpu: 0.55 },
                },
                links: {
                  l1: { from: 'users', to: 'app' },
                  l2: { from: 'app', to: 'db', label: '450 qps' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 1.6, speed: 0.65 },
                  { link: 'l2', kind: 'req', rate: 1.6, speed: 0.55 },
                  { link: 'l2', kind: 'res', rate: 1.4, speed: 0.6, reverse: true },
                ],
              },
            },
            {
              short: 'Bottleneck',
              chapter: 'bottleneck',
              title: 'Flash Sale hits: the DB is overloaded at 4,000 req/s',
              body: [
                'When the promotion starts, traffic grows 9x. The DB connection queue fills up and CPU hits <code>99%</code>.',
                'As utilization approaches 100%, queueing delay grows exponentially: <code>p99</code> latency jumps from <code>38 ms</code> to <code>890 ms</code> and connections start dropping.',
              ],
              callout: {
                kind: 'warn',
                title: 'Domino effect',
                text: 'A slow DB holds App Server threads longer, which also hangs every other API that shares the same DB.',
              },
              changes: ['~ Traffic: 450 → 4,000 req/s', '- DB CPU peaks at 99%, timeouts appear'],
              metrics: { rps: 4000, hit: 0, dbQps: 4000, p99: 890 },
              scene: {
                entities: {
                  users: { kind: 'crowd', pos: [-8, 0], label: 'Flash Sale', sub: '4,000 req/s', tone: 'orange' },
                  app: { kind: 'block', pos: [0, 0], label: 'App Server', sub: 'Threads waiting on DB', tone: 'orange', cpu: 0.86 },
                  db: {
                    kind: 'db',
                    pos: [8, 0],
                    label: 'Primary DB',
                    sub: 'I/O overload',
                    heat: 1,
                    cpu: 0.99,
                    tags: [{ text: '99% CPU', tone: 'red' }],
                  },
                },
                links: {
                  l1: { from: 'users', to: 'app' },
                  l2: { from: 'app', to: 'db', label: 'Congested!' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 3.2, speed: 0.7 },
                  { link: 'l2', kind: 'slow', rate: 2.6, speed: 0.25 },
                  { link: 'l2', kind: 'drop', rate: 1.1, speed: 0.4 },
                ],
              },
            },
            {
              short: 'Cache-Aside',
              chapter: 'technique',
              title: 'Put an in-memory cache (Cache-Aside) in front of the DB',
              body: [
                'Add a <code>Redis Cache</code> that keeps a JSON copy of the product in RAM with <code>TTL = 60s</code>.',
                'The app checks the cache first: <strong>92% of requests hit the cache</strong> and return in <code>~1 ms</code>. Only the 8% that miss (Cache Miss) go down to the DB, read, and refill the cache.',
              ],
              changes: [
                '+ Redis Cache (RAM, TTL 60s)',
                '~ DB load drops from 4,000 to 320 qps',
                '~ p99 latency falls from 890 ms to 14 ms',
              ],
              metrics: { rps: 4000, hit: 92, dbQps: 320, p99: 14 },
              scene: {
                entities: {
                  zoneData: { kind: 'zone', pos: [9, 0], w: 9, d: 14, label: 'DATA TIER', tone: 'green' },
                  users: { kind: 'crowd', pos: [-10, 0], label: 'Flash Sale', sub: '4,000 req/s', tone: 'blue' },
                  app: { kind: 'block', pos: [-1, 0], label: 'App Server', tone: 'green', cpu: 0.35 },
                  cache: {
                    kind: 'block',
                    pos: [9, -5],
                    label: 'Redis Cache',
                    sub: 'In-Memory ~1ms',
                    tone: 'green',
                    cpu: 0.28,
                    tags: [{ text: '92% HIT', tone: 'green' }],
                  },
                  db: { kind: 'db', pos: [9, 5], label: 'Primary DB', sub: '320 qps (Miss)', tone: 'violet', cpu: 0.24 },
                },
                links: {
                  l1: { from: 'users', to: 'app' },
                  lHit: { from: 'app', to: 'cache', label: 'GET (~1ms)' },
                  lMiss: { from: 'app', to: 'db', style: 'dashed', label: '8% Miss' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 3.0, speed: 0.75 },
                  { link: 'lHit', kind: 'req', rate: 2.8, speed: 0.9 },
                  { link: 'lHit', kind: 'res', rate: 2.8, speed: 0.9, reverse: true },
                  { link: 'lMiss', kind: 'write', rate: 0.45, speed: 0.5 },
                ],
              },
            },
            {
              short: 'Trade-off',
              chapter: 'tradeoff',
              title: 'The price to pay: stale data & mass expiry',
              body: [
                'A cache is not free in terms of logic: when a seller changes a product price in the <code>Primary DB</code>, if you forget to delete the matching key in <code>Redis</code>, customers see the old price until the <code>TTL 60s</code> expires.',
                'Also, if a very hot key expires just as 4,000 people are viewing it (<em>Cache Stampede</em>), hundreds of requests hit the DB at once. The fix is to invalidate on write (<code>DEL key</code>) and add random offset (<em>jitter</em>) to the TTL.',
              ],
              callout: {
                kind: 'tip',
                title: 'Rule of thumb',
                text: 'Prefer Write → Update DB → Delete Cache Key over overwriting both places at the same time, to avoid race conditions.',
              },
              changes: [
                '+ Write path actively deletes the cache key (Invalidate)',
                '- Accept a short consistency lag (Eventual Consistency)',
              ],
              metrics: { rps: 4000, hit: 95, dbQps: 200, p99: 12 },
              scene: {
                entities: {
                  admin: { kind: 'device', pos: [-10, 6], label: 'Admin changes price', tone: 'orange' },
                  users: { kind: 'crowd', pos: [-10, -4], label: 'Shoppers', sub: '4,000 req/s', tone: 'blue' },
                  app: { kind: 'block', pos: [-1, 0], label: 'App Server', tone: 'green', cpu: 0.34 },
                  cache: {
                    kind: 'block',
                    pos: [9, -5],
                    label: 'Redis Cache',
                    sub: 'TTL + Jitter',
                    tone: 'green',
                    cpu: 0.25,
                    tags: [{ text: 'DEL key', tone: 'amber' }],
                  },
                  db: { kind: 'db', pos: [9, 5], label: 'Primary DB', sub: 'Source of truth', tone: 'violet', cpu: 0.22 },
                },
                links: {
                  lRead: { from: 'users', to: 'app' },
                  lWrite: { from: 'admin', to: 'app', label: 'PUT /price' },
                  lCache: { from: 'app', to: 'cache', label: 'GET / DEL' },
                  lDb: { from: 'app', to: 'db', label: 'UPDATE' },
                },
                flows: [
                  { link: 'lRead', kind: 'req', rate: 2.5, speed: 0.75 },
                  { link: 'lWrite', kind: 'write', rate: 0.5, speed: 0.6 },
                  { link: 'lDb', kind: 'write', rate: 0.5, speed: 0.6 },
                  { link: 'lCache', kind: 'res', rate: 2.3, speed: 0.85, reverse: true },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'communication',
      num: '02',
      title: 'Communication & Async',
      color: 'orange',
      lessons: [
        {
          id: 'message-queues',
          title: 'Message Queues & Load Leveling',
          summary: 'Move heavy tasks out of the user response path so the API does not choke when traffic spikes.',
          minutes: 5,
          level: 'Intermediate',
          metrics: [
            { id: 'orders', label: 'Incoming orders', unit: ' orders/s' },
            { id: 'qDepth', label: 'Queue', unit: ' jobs' },
            { id: 'workerCpu', label: 'Worker CPU', unit: '%', tone: (v) => (v > 90 ? 'bad' : 'ok') },
            { id: 'userWait', label: 'Customer wait', unit: ' ms', tone: (v) => (v > 500 ? 'bad' : 'ok') },
          ],
          steps: [
            {
              short: 'Synchronous',
              chapter: 'problem',
              title: 'Must the customer wait for the PDF and email on checkout?',
              body: [
                'When a customer clicks Place Order, the system must save the order (<code>15 ms</code>), generate a PDF invoice (<code>600 ms</code>) and call SMTP to send an email (<code>500 ms</code>).',
                'If done sequentially in the same HTTP request, the customer stares at a spinner for over <code>1.1 seconds</code> even though payment has already finished.',
              ],
              metrics: { orders: 20, qDepth: 0, workerCpu: 35, userWait: 1120 },
              scene: {
                entities: {
                  client: { kind: 'device', pos: [-7.5, 0], label: 'Ordering customer', tone: 'blue' },
                  api: { kind: 'block', pos: [0, 0], label: 'Order API', sub: 'Sequential processing', tone: 'orange', cpu: 0.65 },
                  mail: { kind: 'block', pos: [7.5, 0], label: 'PDF + Email', sub: '~1,100 ms/order', tone: 'violet', cpu: 0.55 },
                },
                links: {
                  l1: { from: 'client', to: 'api', label: 'POST /order' },
                  l2: { from: 'api', to: 'mail', label: 'Sync wait' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 0.9, speed: 0.5 },
                  { link: 'l2', kind: 'slow', rate: 0.9, speed: 0.3 },
                ],
              },
            },
            {
              short: 'Traffic peak',
              chapter: 'bottleneck',
              title: 'Orders grow 10x: the whole checkout gateway hangs',
              body: [
                'At noon there are <code>200 orders/second</code>, but the PDF & Email service can only swallow <code>40 orders/second</code>.',
                'All <code>Order API</code> connections get stuck waiting on the side step, so new customers cannot create orders.',
              ],
              changes: ['~ Incoming orders: 20 → 200 orders/s', '- Order API exhausts its thread pool waiting on the side service'],
              metrics: { orders: 200, qDepth: 0, workerCpu: 100, userWait: 6400 },
              scene: {
                entities: {
                  client: { kind: 'crowd', pos: [-7.5, 0], label: '200 orders/s', tone: 'orange' },
                  api: { kind: 'block', pos: [0, 0], label: 'Order API', heat: 1, cpu: 0.98, tags: [{ text: 'TIMEOUT', tone: 'red' }] },
                  mail: { kind: 'block', pos: [7.5, 0], label: 'PDF + Email', heat: 1, cpu: 1.0 },
                },
                links: {
                  l1: { from: 'client', to: 'api' },
                  l2: { from: 'api', to: 'mail', label: 'Congestion' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 2.6, speed: 0.65 },
                  { link: 'l2', kind: 'drop', rate: 1.8, speed: 0.3 },
                ],
              },
            },
            {
              short: 'Message Queue',
              chapter: 'technique',
              title: 'Buffer with a queue & let Workers pull jobs at their own pace',
              body: [
                '<code>Order API</code> only saves the order to the DB, pushes an <code>OrderCreated</code> event onto the <code>Message Queue</code> (<code>3 ms</code>) and replies to the customer immediately.',
                'Behind it, a pool of <code>Worker</code>s pulls jobs from the queue at a safe rate. The traffic peak becomes a temporary queue length instead of bringing the system down.',
              ],
              callout: {
                kind: 'tip',
                title: 'Idempotent Consumer',
                text: 'Queues usually guarantee At-Least-Once delivery, so a Worker must check order_id to avoid sending 2 emails if a job is redelivered.',
              },
              changes: [
                '+ Message Queue absorbs the 200 orders/s peak',
                '+ Worker pool pulls jobs independently, easy to add replicas',
                '~ Customer wait drops from 6,400 ms to 28 ms',
              ],
              metrics: { orders: 200, qDepth: 340, workerCpu: 72, userWait: 28 },
              scene: {
                entities: {
                  client: { kind: 'crowd', pos: [-11, 0], label: '200 orders/s', tone: 'blue' },
                  api: { kind: 'block', pos: [-3, 0], label: 'Order API', sub: '28 ms immediate reply', tone: 'green', cpu: 0.32 },
                  mq: {
                    kind: 'queue',
                    pos: [5, 0],
                    label: 'Message Queue',
                    sub: '340 jobs buffered',
                    tone: 'orange',
                    cpu: 0.75,
                    tags: [{ text: 'BUFFER', tone: 'amber' }],
                  },
                  w1: { kind: 'block', pos: [16, -3], label: 'Worker 1', tone: 'violet', cpu: 0.72 },
                  w2: { kind: 'block', pos: [13, 7], label: 'Worker 2', tone: 'violet', cpu: 0.70 },
                },
                links: {
                  l1: { from: 'client', to: 'api' },
                  lPub: { from: 'api', to: 'mq', label: 'Enqueue' },
                  lSub1: { from: 'mq', to: 'w1', label: 'Pull' },
                  lSub2: { from: 'mq', to: 'w2', label: 'Pull' },
                },
                flows: [
                  { link: 'l1', kind: 'req', rate: 2.6, speed: 0.8 },
                  { link: 'l1', kind: 'res', rate: 2.6, speed: 0.85, reverse: true },
                  { link: 'lPub', kind: 'write', rate: 2.4, speed: 0.75 },
                  { link: 'lSub1', kind: 'req', rate: 1.2, speed: 0.55 },
                  { link: 'lSub2', kind: 'req', rate: 1.2, speed: 0.55 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  practices: [
    {
      id: 'fix-checkout-spike',
      title: 'Scenario: Rescue the invoice gateway when the partner is slow',
      prompt:
        'Your /checkout API calls an external e-invoice gateway directly (1.4 seconds per call). When traffic reaches 300 orders/s, the API hangs en masse. Which architecture do you choose so customers finish paying in under 50 ms without losing invoices?',
      metrics: [
        { id: 'wait', label: 'Customer wait', unit: ' ms', tone: (v) => (v > 200 ? 'bad' : 'ok') },
        { id: 'lost', label: 'Lost invoices', unit: '%', tone: (v) => (v > 0 ? 'bad' : 'ok') },
      ],
      initialMetrics: { wait: 4800, lost: 12 },
      initialScene: {
        entities: {
          u: { kind: 'crowd', pos: [-7.5, 0], label: '300 orders/s', tone: 'orange' },
          api: { kind: 'block', pos: [0, 0], label: 'Checkout API', heat: 1, cpu: 0.99 },
          ext: { kind: 'block', pos: [7.5, 0], label: 'Invoice Partner', sub: '1,400 ms/req', heat: 1, cpu: 0.95 },
        },
        links: {
          a: { from: 'u', to: 'api' },
          b: { from: 'api', to: 'ext', label: 'Sync' },
        },
        flows: [
          { link: 'a', kind: 'req', rate: 2.5, speed: 0.7 },
          { link: 'b', kind: 'drop', rate: 1.6, speed: 0.3 },
        ],
      },
      choices: [
        {
          id: 'cache',
          label: 'Enable a 5-minute Redis Cache for the invoice API call results',
          correct: false,
          explanation:
            'Wrong mechanism: every order needs its own legal invoice number (a new write), so one customer\'s invoice cannot be reused for the next.',
          afterMetrics: { wait: 4500, lost: 100 },
        },
        {
          id: 'retry-fast',
          label: 'Lower the timeout to 80 ms and retry immediately 5 times in a row',
          correct: false,
          explanation:
            'A retry storm multiplies traffic to the partner by 5x, takes the partner down completely and risks issuing duplicate invoices.',
          afterMetrics: { wait: 3200, lost: 35 },
        },
        {
          id: 'outbox-queue',
          label: 'Save the order + Outbox in the DB, push a job through a Queue so a Worker issues the invoice in the background with an Idempotency-Key',
          correct: true,
          explanation:
            'Correct! The customer gets order confirmation within 35 ms; the Worker processes the invoice durably in the background and follows up via email/notification.',
          afterMetrics: { wait: 35, lost: 0 },
          afterScene: {
            entities: {
              u: { kind: 'crowd', pos: [-10, 0], label: '300 orders/s', tone: 'blue' },
              api: { kind: 'block', pos: [-2, 0], label: 'Checkout API', sub: '35 ms OK', tone: 'green', cpu: 0.3 },
              q: { kind: 'queue', pos: [4.5, 0], label: 'Invoice Queue', tone: 'green', cpu: 0.55 },
              w: { kind: 'block', pos: [11, 0], label: 'Invoice Worker', sub: 'Idempotent', tone: 'violet', cpu: 0.65 },
            },
            links: {
              a: { from: 'u', to: 'api' },
              b: { from: 'api', to: 'q', label: 'Outbox' },
              c: { from: 'q', to: 'w', label: 'Rate-limited' },
            },
            flows: [
              { link: 'a', kind: 'req', rate: 2.4, speed: 0.8 },
              { link: 'a', kind: 'res', rate: 2.4, speed: 0.85, reverse: true },
              { link: 'b', kind: 'write', rate: 2.0, speed: 0.7 },
              { link: 'c', kind: 'req', rate: 1.4, speed: 0.55 },
            ],
          },
        },
      ],
    },
  ],
  cheatsheets: [
    {
      title: 'Latency numbers to remember',
      items: [
        'RAM read (Redis / Memcached): ~0.1–1 ms',
        'Indexed DB query over the internal network: ~2–15 ms',
        'Intercontinental round trip (Asia – Europe/US): ~150–250 ms',
        'Threshold users perceive as instant: < 100 ms',
      ],
    },
    {
      title: 'When to use Cache-Aside?',
      items: [
        'Reads far outnumber writes (read-heavy)',
        'Data can be stale for seconds to minutes, or you can delete the key on write',
        'Add random jitter to the TTL to avoid Cache Stampede',
      ],
    },
    {
      title: 'When to use a Message Queue?',
      items: [
        'Heavy tasks that do not need to return a result in the same HTTP request (PDF, email, video, webhook)',
        'You need to flatten sudden traffic spikes (Load Leveling)',
        'Always design Consumers to be Idempotent (re-running does not duplicate side effects)',
      ],
    },
  ],
};
