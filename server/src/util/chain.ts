//import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore  } from '@langchain/pinecone';
//import { LLMChain, loadQAChain, ConversationalRetrievalQAChain } from 'langchain/chains';
//import { PromptTemplate } from 'langchain/prompts';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
//import { RunnableSequence } from "@langchain/core/runnables";
//import { formatDocumentsAsString } from "langchain/util/document";
//import { StringOutputParser } from "@langchain/core/output_parsers";

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
`You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. Answer question in one line on sentence, and the answer have to be in this form: xx:xx:xx.xxx --> xx:xx:xx.xxx.
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer.

{context}
Question: {question}
Helpful answer in markdown:`;

const CONDENSE_PROMPT =
`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;


/*
const questionPrompt = PromptTemplate.fromTemplate(
  `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. The answer have to be in this form: xx:xx:xx.xxx --> xx:xx:xx.xxx.
  If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
  
----------
CONTEXT: {context}
----------
CHAT HISTORY: {chatHistory}
----------
QUESTION: {question}
----------
Helpful Answer:`
);
*/
export const makeChain = (vectorstore: PineconeStore) => {

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPEN_AI_KEY ?? '',
    streaming: true,
    verbose: true,
    temperature: 0,
  });
  
  const nonStreamingModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPEN_AI_KEY ?? '',
    verbose: true,
    temperature: 0,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: false,
      questionGeneratorChainOptions: {
        llm: nonStreamingModel,
      },
    },
  );

/*

const model = new OpenAI({ openAIApiKey: process.env.OPEN_AI_KEY ?? '',
modelName: "gpt-3.5-turbo" ， 
streaming: true, 
verbose: true, 
temperature: 0});
  
const chain = RunnableSequence.from([
  {
    question: (input: { question: string; chatHistory?: string }) =>
      input.question,
    chatHistory: (input: { question: string; chatHistory?: string }) =>
      input.chatHistory ?? "",
    context: async (input: { question: string; chatHistory?: string }) => {
      const relevantDocs = await vectorstore.asRetriever().getRelevantDocuments(input.question);
      const serialized = formatDocumentsAsString(relevantDocs);
      return serialized;
    },
  },
  questionPrompt,
  model,
  new StringOutputParser(),
]);
*/
  return chain;
};