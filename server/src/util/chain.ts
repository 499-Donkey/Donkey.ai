import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore  } from '@langchain/pinecone';
//import { LLMChain, loadQAChain, ConversationalRetrievalQAChain } from 'langchain/chains';
//import { PromptTemplate } from 'langchain/prompts';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

/*
const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT =
  PromptTemplate.fromTemplate(`You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. The answer have to be in this form: xx:xx:xx.xxx --> xx:xx:xx.xxx.
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
    If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`);
*/

const QA_PROMPT =
`You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. The answer have to be in this form: xx:xx:xx.xxx --> xx:xx:xx.xxx.
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
    If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

const CONDENSE_PROMPT =
`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

export const makeChain = (vectorstore: PineconeStore) => {

/*
  return new ConversationalRetrievalQAChain({
    retriever: vectorstore.asRetriever(),
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: false,
  });
  */

  const model = new OpenAI({ openAIApiKey: process.env.OPEN_AI_KEY ?? '',
  modelName: "gpt-3.5-turbo" });
  
  
    const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
    qaTemplate: QA_PROMPT,
    questionGeneratorTemplate: CONDENSE_PROMPT,
    returnSourceDocuments: false,
    },
  );

  return chain;
};