const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
    ctx.response.status = 500;
  }
});

class Beverages {
  constructor({ id, name, manufacterDate, isOnStock }) {
    this.id = id;
    this.name = name;
    this.manufacterDate = manufacterDate;
    this.isOnStock = isOnStock;
  }
}

const beverages = [];
for (let i = 0; i < 10; i++) {
  beverages.push(new Beverages({ id: `${i}`, name: `Beer ${i}`, manufacterDate: new Date(Date.now() + i), isOnStock: i % 2  ? true : false }));
}
let lastUpdated = beverages[beverages.length - 1].manufacterDate;
let lastId = beverages[beverages.length - 1].id;
const pageSize = 10;

const broadcast = data =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

const router = new Router();

router.get('/beverage', ctx => {
  ctx.response.body = beverages;
  ctx.response.status = 200;
});

router.get('/beverage/:id', async (ctx) => {
  const beverageId = ctx.request.params.id;
  const beverage = beverages.find(beverage => beverageId === beverage.id);
  if (beverage) {
    ctx.response.body = beverage;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = { issue: [{ warning: `beverage with id ${beverageId} not found` }] };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createBeverage = async (ctx) => {
  const beverage = ctx.request.body;
  if (!beverage.text) { // validation
    ctx.response.body = { issue: [{ error: 'Text is missing' }] };
    ctx.response.status = 400; //  BAD REQUEST
    return;
  }
  beverage.id = `${parseInt(lastId) + 1}`;
  lastId = beverage.id;
  beverage.manufacterDate = new Date();
  beverage.isOnStock = 1;
  beverages.push(beverage);
  ctx.response.body = beverage;
  ctx.response.status = 201; // CREATED
  broadcast({ event: 'created', payload: { beverage: beverage } });
};

router.post('/beverage', async (ctx) => {
  await createBeverage(ctx);
});

router.put('/beverage/:id', async (ctx) => {
  const id = ctx.params.id;
  const beverage = ctx.request.body;
  beverage.manufacterDate = new Date();
  const beverageId = beverage.id;
  if (beverageId && id !== beverage.id) {
    ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  if (!beverageId) {
    await createBeverage(ctx);
    return;
  }
  const index = beverages.findIndex(item => item.id === id);
  if (index === -1) {
    ctx.response.body = { issue: [{ error: `beverage with id ${id} not found` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  const beverageIsOnStock = parseInt(ctx.request.get('ETag')) || beverage.isOnStock;
  if (beverageIsOnStock < beverages[index].isOnStock) {
    ctx.response.body = { issue: [{ error: `Version conflict` }] };
    ctx.response.status = 409; // CONFLICT
    return;
  }
  beverages[index] = beverage;
  lastUpdated = new Date();
  ctx.response.body = beverage;
  ctx.response.status = 200; // OK
  broadcast({ event: 'updated', payload: { beverage: beverage } });
});

router.del('/beverage/:id', ctx => {
  const id = ctx.params.id;
  const beverage = beverages.findIndex(beverage => id === beverage.id);
  if (beverage !== -1) {
    const beverage = beverages[beverage];
    beverages.splice(beverage, 1);
    lastUpdated = new Date();
    broadcast({ event: 'deleted', payload: { beverage } });
  }
  ctx.response.status = 204; // no content
});

setInterval(() => {
  lastUpdated = new Date();
  lastId = `${parseInt(lastId) + 1}`;
  const beverage = new Beverages({ id: lastId, name: `beverage ${lastId}`, manufacterDate: lastUpdated, isOnStock: lastId % 2 ? true : false });
  beverages.push(beverage);
  console.log(`
   ${beverage.name}`);
  broadcast({ event: 'created', payload: { beverage: beverage } });
}, 150000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
