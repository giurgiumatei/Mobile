import Router from 'koa-router';
import individualStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/individuals', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await individualStore.find({ userId });
  response.status = 200; // ok
});

router.get('/individual/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const individual = await individualStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (individual) {
    if (individual.userId === userId) {
      response.body = individual;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

const createIndividual = async (ctx, individual, response) => {
  try {
    const userId = ctx.state.user._id;
    individual.userId = userId;
    response.body = await individualStore.insert(individual);
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: response.body });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/individual', async ctx => await createIndividual(ctx, ctx.request.body, ctx.response));

router.put('/individual/:id', async (ctx) => {
  const individual = ctx.request.body;
  const id = ctx.params.id;
  const individualId = individual._id;
  const response = ctx.response;
  if (individualId && individualId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  const userId = ctx.state.user._id;
  individual.userId = userId;
  const updatedCount = await individualStore.update({ _id: id }, individual);
  if (updatedCount === 1) {
    response.body = individual;
    response.status = 200; // ok
    broadcast(userId, { type: 'updated', payload: individual });
  } else {
    response.body = { message: 'Resource no longer exists' };
    response.status = 405; // method not allowed
    }
});

router.del('/individual/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const individual = await individualStore.findOne({ _id: ctx.params.id });
  if (individual && userId !== individual.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await individualStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
