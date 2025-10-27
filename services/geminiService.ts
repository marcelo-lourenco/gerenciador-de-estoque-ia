
import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateDescription = async (productName: string, keywords: string): Promise<string> => {
  try {
    const prompt = `Gere uma descrição de produto otimizada para SEO, curta e atraente para: "${productName}". Inclua as seguintes palavras-chave: "${keywords}". A descrição deve ter no máximo 3 frases e destacar os principais benefícios.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "Não foi possível gerar a descrição. Tente novamente.";
  }
};

export const analyzeInventory = async (products: Product[]): Promise<string> => {
    if (products.length === 0) {
        return "Nenhum produto no inventário para analisar.";
    }
  try {
    const prompt = `
      Você é um especialista em gerenciamento de estoque. Analise os seguintes dados de inventário em formato JSON e forneça insights e recomendações acionáveis.

      Dados do Inventário:
      ${JSON.stringify(products, null, 2)}

      Sua análise deve:
      1.  Identificar produtos com baixo estoque (quantidade <= 10) e sugerir reabastecimento.
      2.  Identificar produtos com excesso de estoque (quantidade >= 100) e sugerir promoções ou liquidações.
      3.  Calcular o valor total do estoque (soma de preço * quantidade para todos os produtos).
      4.  Fornecer um resumo geral da saúde do inventário.

      Formate sua resposta usando markdown. Use títulos, listas e negrito para clareza.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing inventory:", error);
    return "Ocorreu um erro ao analisar o inventário. Verifique o console para mais detalhes.";
  }
};
