import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import Evaluation from '../../../../schemas/Evaluation';

const createError = require('http-errors');
const mongoose = require('mongoose');

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(400).json({ error: 'Use GET request' })
    return;
  }

  const session = await getServerSession(request, response, authOptions);
  if (!session) {
    response.status(401).json({error: 'Not logged in'});
    return;
  }

  const { id } = request.query;
  console.log(id);

  try {
    await mongoose.connect(process.env.MONGOOSE_URI);

    const evals = Evaluation.find({datasetId:id});

    console.log(evals);

    response.status(200).json(evals);
  } catch (error) {
    if (!error.status) {
      error = createError(500, 'Error displaying evaluations');
    }
    response.status(error.status).json({ error: error.message });
  }
}
