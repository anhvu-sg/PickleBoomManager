import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Match, Player } from '../types';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMatchCommentary = async (
  match: Match, 
  player1: Player, 
  player2: Player
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI services unavailable.";

  const prompt = `
    Generate a short, exciting, sportscaster-style summary for a pickleball match.
    
    Player 1: ${player1.name} (DUPR: ${player1.rating.toFixed(3)})
    Player 2: ${player2.name} (DUPR: ${player2.rating.toFixed(3)})
    Final Score: ${match.score1} - ${match.score2}
    Winner: ${match.winnerId === player1.id ? player1.name : player2.name}
    
    Keep it under 50 words. Focus on the intensity and the outcome relative to their ratings.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No commentary available.";
  } catch (error) {
    console.error("Error generating match commentary:", error);
    return "Could not generate commentary at this time.";
  }
};

export const askReferee = async (history: {role: string, text: string}[], question: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "The referee is currently unavailable.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are an expert Pickleball Referee and Coach. Answer questions about rules, scoring, and strategy clearly and concisely. If the question is not about pickleball, politely decline to answer."
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "I didn't catch that. Could you repeat?";
  } catch (error) {
    console.error("Error asking referee:", error);
    return "The referee is distracted. Please try again later.";
  }
};

export const predictTournamentWinner = async (players: Player[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI prediction unavailable.";

  const prompt = `
    Analyze this list of pickleball players and predict the likely winner of a single-elimination tournament.
    
    Players:
    ${players.map(p => `- ${p.name} (DUPR: ${p.rating.toFixed(3)}, Win Rate: ${p.matchesPlayed > 0 ? Math.round((p.wins/p.matchesPlayed)*100) : 0}%)`).join('\n')}
    
    Return a one-sentence prediction naming the winner and a brief reason based on DUPR rating and momentum.
  `;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Prediction unavailable.";
  } catch (e) {
    console.error("Error predicting winner:", e);
    return "Prediction unavailable.";
  }
};