import OpenAI from 'openai';
import { toResponseInputItems } from 'openai/lib/responses/ResponseInputItems';
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

// ---- Replace with your real product data ----
type Product = { product_id: number; name: string; price: number };
const products: Product[] = [
  { product_id: 0, name: 'Bricks', price: 100 },
  { product_id: 1, name: 'Cement', price: 200 },
  { product_id: 2, name: 'Sand', price: 300 },
];
const cart = new Map<number, number>(); // productId -> quantity

function cartSummary() {
  const items = [...cart.entries()].map(([id, qty]) => {
    const p = products.find((x) => x.product_id === id)!;
    return {
      product_id: id,
      name: p.name,
      price: p.price,
      quantity: qty,
      lineTotal: p.price * qty,
    };
  });
  return { items, total: items.reduce((s, i) => s + i.lineTotal, 0) };
}

// ---- 1. The TOOLS: real functions the model may request ----
const toolImpl: Record<string, (args: any) => unknown> = {
  list_products: ({ query }) => {
    const q = (query ?? '').toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  },
  get_cart: () => cartSummary(),
  add_to_cart: ({ productId, quantity }) => {
    if (!products.some((p) => p.product_id === productId))
      return { error: `Unknown product ${productId}` };
    cart.set(productId, (cart.get(productId) ?? 0) + (quantity ?? 1));
    return cartSummary();
  },
  remove_from_cart: ({ productId, quantity }) => {
    const next = (cart.get(productId) ?? 0) - (quantity ?? 1);
    if (next > 0) cart.set(productId, next);
    else cart.delete(productId);
    return cartSummary();
  },
};

// ---- 2. The tool DESCRIPTIONS the model reads (this is what it "sees") ----
const tools: OpenAI.Responses.Tool[] = [
  {
    type: 'function',
    name: 'list_products',
    description: 'List products, optionally filtered by a name search text.',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'get_cart',
    description: 'Get current cart items and total value.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    strict: false,
  },
  {
    type: 'function',
    name: 'add_to_cart',
    description: 'Add a quantity of a product to the cart.',
    parameters: {
      type: 'object',
      properties: { productId: { type: 'integer' }, quantity: { type: 'integer' } },
      required: ['productId'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'remove_from_cart',
    description: 'Reduce the quantity of a product in the cart.',
    parameters: {
      type: 'object',
      properties: { productId: { type: 'integer' }, quantity: { type: 'integer' } },
      required: ['productId'],
      additionalProperties: false,
    },
    strict: false,
  },
];

const openai = new OpenAI(); // reads OPENAI_API_KEY from the environment
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.6'; // check pricing page; pick a cheaper model if you like
const MAX_STEPS = 8; // guardrail: never loop forever

const instructions =
  'You are a shopping cart assistant. Use the tools to look up products and change the cart. ' +
  'Never invent products or prices. Prices are in INR. Product IDs start at 0, so 0 is a valid product_id. Be brief.';

// ---- 3. The AGENT LOOP ----
async function runAgent(input: OpenAI.Responses.ResponseInput) {
  for (let step = 1; step <= MAX_STEPS; step++) {
    const response = await openai.responses.create({ model: MODEL, instructions, tools, input });

    // Keep the model's output in the running input (the API itself is stateless)
    input.push(...toResponseInputItems(response.output));

    const calls = response.output.filter((item) => item.type === 'function_call');
    if (calls.length === 0) return response.output_text; // no tool requested: final answer

    for (const call of calls) {
      const args = JSON.parse(call.arguments || '{}');
      console.log(`  [step ${step}] tool: ${call.name}(${JSON.stringify(args)})`);
      const fn = toolImpl[call.name];
      const result = fn ? fn(args) : { error: `Unknown tool ${call.name}` };
      input.push({
        type: 'function_call_output',
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }
  return 'Stopped: reached the maximum number of steps.';
}

// ---- Simple terminal chat ----
const rl = readline.createInterface({ input: stdin, output: stdout });
const history: OpenAI.Responses.ResponseInput = [];
console.log("Cart agent ready. Type a request (or 'exit').");
while (true) {
  const text = await rl.question('\nYou: ');
  if (text.trim().toLowerCase() === 'exit') break;
  history.push({ role: 'user', content: text });
  console.log('Agent:', await runAgent(history));
}
rl.close();
