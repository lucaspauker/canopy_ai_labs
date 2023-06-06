const { encode } = require('gpt-3-encoder');

export async function dispatchOpenAIRequests(openai, prompts, model, maxTokens, temperature, stopSequence) {
  let maxRequestsPerMinute;
  let maxTokensPerMinute;
  if (model === 'gpt-3.5-turbo') {
    maxRequestsPerMinute = 3500 / 2;
    maxTokensPerMinute = 90000 / 2;
  } else {
    maxRequestsPerMinute = 3000 / 2;
    maxTokensPerMinute = 250000 / 2;
  }

  let requestQueue = [];
  let tokensUsed = 0;

  async function handleRateLimit(prompt) {
    const promptTokens = encode(prompt).length;
    const currentTimestamp = Date.now();

    tokensUsed += promptTokens;

    if (tokensUsed > maxTokensPerMinute) {
      const remainingTokens = maxTokensPerMinute - (tokensUsed - promptTokens);
      const delay = (remainingTokens / maxTokensPerMinute) * 60000;

      await new Promise(resolve => setTimeout(resolve, delay));
      tokensUsed -= promptTokens;
    }

    requestQueue.push({ prompt, timestamp: currentTimestamp });

    if (requestQueue.length > maxRequestsPerMinute) {
      const earliestRequest = requestQueue[0];
      const elapsedTime = currentTimestamp - earliestRequest.timestamp;

      if (elapsedTime < 60000) {
        const delay = 60000 - elapsedTime;

        await new Promise(resolve => setTimeout(resolve, delay));

        requestQueue.shift();
        tokensUsed -= promptTokens;
      }
    }
  }


  const batchSize = 32;  // Number of parallel requests
  const numBatches = Math.ceil(prompts.length / batchSize);
  const results = [];
  const numRequestRetries = 3; // Maximum number of request retries

  for (let i = 0; i < numBatches; i++) {
    const batchStart = i * batchSize;
    const batchEnd = Math.min((i + 1) * batchSize, prompts.length);
    const batchPrompts = prompts.slice(batchStart, batchEnd);

    const batchRequests = batchPrompts.map(async prompt => {
      await handleRateLimit(prompt);

      let result;
      let retryCount = 0;

      while (retryCount <= numRequestRetries) {
        try {
          if (model === 'gpt-3.5-turbo') {
            result = openai.createChatCompletion({
              model: model,
              messages: [{role: 'user', content: prompt}],
              max_tokens: maxTokens,
              temperature: temperature,
              stop: stopSequence,
            });
            break;
          } else {
            result = await openai.createCompletion({
              model,
              prompt,
              max_tokens: maxTokens,
              temperature,
              stop: stopSequence,
            });
            break; // Break out of the retry loop if the request succeeds
          }
        } catch (error) {
          console.error('Error:', error);
          retryCount++;
        }
      }
      return result;
    });

    const batchResults = await Promise.all(batchRequests);
    results.push(...batchResults.filter(result => result !== null));
  }

  return results;
}

