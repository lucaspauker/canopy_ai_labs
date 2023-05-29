import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import Evaluation from '../../../../schemas/Evaluation';

const createError = require('http-errors');
const mongoose = require('mongoose');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(400).json({ error: 'Use POST request' })
    return;
  }

  const session = await getServerSession(request, response, authOptions);
  if (!session) {
    response.status(401).json({error: 'Not logged in'});
    return;
  }

  const { id } = request.query;

  try {
    await mongoose.connect(process.env.MONGOOSE_URI);

    await Evaluation.findByIdAndDelete(id);

    response.status(200).send();
  } catch (error) {
    console.error(error);
    if (!error.status) {
      error = createError(500, 'Error deleting evaluation');
    }
    response.status(error.status).json({ error: error.message });
  }
}
