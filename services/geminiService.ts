
import { GoogleGenAI, Modality } from "@google/genai";

// Fix: As per guidelines, assume API_KEY is pre-configured and accessible.
// The SDK will throw an error on initialization if API_KEY is missing, which is the desired behavior.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateScript = async (idea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // FIX: Updated prompt to be a platform-agnostic scriptwriting expert.
      contents: `You are an expert scriptwriter AI. Your task is to generate a compelling and platform-optimized video script based on the user's idea: "${idea}".

      The script should be structured for maximum engagement and follow best practices for platforms like YouTube (long-form or Shorts), TikTok, or Instagram Reels. If no platform is specified, create a versatile script for a standard YouTube video.
      
      Structure the script with:
      1.  **Hook:** A captivating intro (first 3-5 seconds) to grab the viewer's attention.
      2.  **Introduction:** Briefly explain what the video is about.
      3.  **Main Content:** Broken down into key points or steps, with visual cues (e.g., "[B-roll of...]").
      4.  **Call to Action (CTA):** Encourage viewers to like, subscribe, and comment.
      5.  **Outro:** A quick, memorable sign-off.
      
      Format the output in basic HTML using tags like <h2> for titles, <p> for paragraphs, and <strong> for emphasis. Do not include <html> or <body> tags.`,
    });
    // FIX: The .text property might be undefined if the model returns no content.
    return response.text ?? '<p>Não foi possível gerar um roteiro. Tente novamente.</p>';
  } catch (error) {
    // FIX: Changed multi-argument console.error to a single template literal for consistency and to prevent potential linting errors.
    console.error(`Error generating script: ${String(error)}`);
    return "<h2>Erro ao gerar o roteiro</h2><p>Não foi possível se conectar à IA. Verifique o console para mais detalhes.</p>";
  }
};


export const chatWithOyasifyAI = async (prompt: string, images: {data: string; mimeType: string}[]): Promise<string> => {
  try {
    const parts: any[] = [{ text: prompt }];
    if (images.length > 0) {
        images.forEach(image => {
            parts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.data,
                },
            });
        });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });
    return response.text;
  } catch (error) {
    // FIX: Changed multi-argument console.error to a single template literal for consistency and to prevent potential linting errors.
    console.error(`Error chatting with Oyasify AI: ${String(error)}`);
    return "Desculpe, ocorreu um erro ao processar sua solicitação.";
  }
};

export const generateImageWithOyasifyAI = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png'
            }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
             return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        // FIX: Changed multi-argument console.error to a single template literal for consistency and to prevent potential linting errors.
        console.error(`Error generating image with Oyasify AI: ${String(error)}`);
        return null;
    }
};

export const generateLyrics = async (idea: string, style?: string): Promise<string> => {
    try {
        const stylePrompt = style ? ` no estilo ${style}` : '';
        const remixInstruction = style?.toLowerCase() === 'remix' 
            ? `\n\n**Instrução Especial para Remix:** O usuário escolheu o estilo "Remix". A "ideia" fornecida pode ser uma música existente. Sua tarefa é criar uma paródia ou uma nova versão dessa música, mantendo uma estrutura rítmica ou melódica semelhante, mas com uma nova letra criativa focada em um tema geek (anime, jogos, cultura pop). Se a ideia não for uma música, crie uma letra original que soe como um remix de um tema famoso.`
            : '';

        const prompt = `Você é um compositor de músicas geek profissional, especialista em criar letras profundas e temáticas sobre animes, mangás, jogos e cultura pop. Sua tarefa é gerar uma letra de música completa e original baseada na ideia do usuário, seguindo o estilo e a qualidade dos exemplos abaixo.

A letra deve ser:
- **Temática:** Profundamente conectada à história, personagens e emoções da obra de referência.
- **Estruturada:** Use marcações claras em português para as seções, como <strong>Início</strong>, <strong>Verso 1</strong>, <strong>Ponte</strong>, <strong>Refrão</strong>, etc., para separar as partes da música.
- **Emocional e Poética:** Use metáforas e linguagem poética para transmitir os sentimentos.
- **Titulada Corretamente:** O título deve seguir o formato "Título Criativo (Obra de Referência)".
${remixInstruction}

**Exemplos de Músicas de Alta Qualidade:**

---
**Exemplo 1: Goodnight (Oyasumi Punpun)**

E se eu não acordar no dia de amanhã?
Será que um dia poderá se lembrar?
Aquele cheiro doce de hortela
Que eu sentia toda vez que acordava
Então não, não, não
Não se esqueça dos tempos bons
Dias sem cheiro de solidão
Esperando as estrelas acordarem
Então vem cá vem
Constelações que me acalmarem
Eu ando me sentindo tão bem
Quando as coisas envolvem você
As coisas tão mais complicadas eu sei
Não sei se isso é motivo pra se orgulhar
Mas cê não precisa se manter refém
Tudo isso dura como tem que durar
Planetas já estão mais além
Eu ja nem posso os imaginar
Esse medo que sempre mantem
Impede que eu possa me enxergar
Nós somos um par imperfeito meu bem
Tentei te alcançar, mas nada enxerguei
Tudo a minha volta
A escuridão toma
A luz está la fora
Pronto pra ir embora
E com um "Boa Noite"
Eu me despeço
E como um lindo jardim
Por sangue coberto
Tentando me encontrar
Antes que a morte possa
E como um lindo blefe
Prometeu coisas
Tão impossiveis
De se realizar
Não posso mais me enxergar
Só a mim posso culpar.
Ando tentando manter minha mente sã
Pessoas partem, é impossivel evitar
Tentando apostar no meu amanhã
Dizendo pra mim que: isso vai mudar
E se mudar eu não
Não mudarei nada
Erros que cometi
Voltam pra me assombrar
Voltarei a sorrir
Quando a melodia soar
Eu não vou desistir
Até meu sonho realizar
Sinceramente, eu quero ver o amanhã
Com outros olhos sem que sejam os meus
Tão vislumbrante quanto um talismã
Você é o presente que a morte me deu
Por isso que você é tão linda assim?
Talvez você se perdeu dentro de mim
Sabe eu nem preciso mais me preocupar
Há muito tempo que eu me sinto assim
Sabe essas vozes não posso escutar
Memorias de quando eu era criança
Talvez eu não seja tão forte assim
Espero que minha história não tenha fim
E com um "Boa Noite"
Eu me despeço
E como um lindo jardim
Por sangue coberto
Tentando me encontrar
Antes que a morte possa
E como um lindo blefe
Prometeu coisas
Tão impossiveis
De se realizar
Não posso mais me enxergar
Só a mim posso culpar
---
**Exemplo 2: O Pequeno Príncipe**

Brilhando como a noite, eu
Olhando pra frente, eu vi passar
Tantas estrelas nesse meu céu estrelado
Como eu não fiquei do meu lado?

E eu sinto como se eu tivesse
Deixado o melhor de mim pra trás
Como se eu não me sentisse capaz
Nós somos poeira cósmica
Não temos nada aqui além de nós
Ainda assim, eu fui capaz de olhar tantos pôr do sóis

Em um cometa
Distante
Viajei pra outro planeta
E, antes
Que eu pudesse prever
Que a gente ia crescer
Teria escutado o conselho do meu velho amigo
Meu velho amigo

Eu tenho direito de me amar
Eu tenho direito de me escutar
Pois
Minhas ordens são razoáveis
Devo cuidar dos meus baobás
Eu aprendi a cultivar
Igual aprendi a cativar

Pequeno príncipe
Navegue por águas mansas
Guarde suas boas lembranças
Ame como se não houvesse amanhã
Afinal, não sabemos se há
Príncipe
Navegue por águas mansas
Guarde suas boas lembranças
Ame como se não pudesse enxergar os espinhos nas rosas

Ele me disse, com rios nos olhos
Que uma raposa o falou
Eternamente, sim, eu serei
Responsável por quem cativei
E sorriu com amor
Pois uma raposa o falou
Eternamente, sim, eu serei
Responsável por quem cativei
Por todos os lugares que plantei
---
**Exemplo 3: Espiral (Uzumaki)**

Eu quero contá-los uma história
Sobre o lugar onde eu cresci
Bizarras as pessoas que aqui moram
Bizarro o que aconteceu aqui

Olhe em volta e perceberá
Esse céu não é normal
Nuvens formam uma espiral

E essa obsessão
(Obsessão)
Por esse padrão
(Esse padrão)

Cuidado, não olhe demais
Ou os seus olhos girarão

Fuja desse fascínio mortal
Antes que você se torne uma espiral
Antes que a maldição te pegue afinal
Ela te segue mesmo após o final

Ó garota bela, tão linda e desejada
Se pela espiral também fosse atormentada?
É melhor ter cautela ou vai ser pego por ela
Sua cicatriz na testa é a chave
---

**Sua Tarefa:**

Agora, crie uma letra de música${stylePrompt} com base na seguinte ideia do usuário: "${idea}".

Mantenha o mesmo nível de qualidade, profundidade e estrutura dos exemplos.

Formate a saída em HTML básico usando <h2> para o título e <p> para os versos de cada seção. Use <strong> para os títulos das seções (Ex: <strong>Refrão</strong>). Não inclua <html> ou <body> tags.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        // FIX: Changed multi-argument console.error to a single template literal for consistency and to prevent potential linting errors.
        console.error(`Error generating lyrics: ${String(error)}`);
        return "<h2>Erro ao gerar a letra</h2><p>Não foi possível gerar a letra. Por favor, tente novamente.</p>";
    }
};
