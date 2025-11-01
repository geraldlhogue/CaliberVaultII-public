import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QualityScore {
  overall: number;
  coverage: number;
  edgeCases: number;
  mockQuality: number;
  assertions: number;
  bestPractices: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { testCode, fileName } = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this test code and provide a quality score (0-100) for each category:

Test File: ${fileName}
Test Code:
\`\`\`typescript
${testCode}
\`\`\`

Evaluate the following aspects:
1. Coverage Completeness (0-100): How well does it cover all code paths, functions, and scenarios?
2. Edge Case Handling (0-100): Does it test boundary conditions, null/undefined, errors, edge cases?
3. Mock Quality (0-100): Are mocks realistic, properly isolated, and well-structured?
4. Assertion Strength (0-100): Are assertions specific, meaningful, and comprehensive?
5. Best Practices (0-100): Follows testing best practices, naming conventions, structure?

Provide response in this JSON format:
{
  "coverage": <score>,
  "edgeCases": <score>,
  "mockQuality": <score>,
  "assertions": <score>,
  "bestPractices": <score>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert test quality analyzer. Provide detailed, actionable feedback on test code quality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    const overall = Math.round(
      (analysis.coverage + analysis.edgeCases + analysis.mockQuality + 
       analysis.assertions + analysis.bestPractices) / 5
    );

    const result: QualityScore = {
      overall,
      coverage: analysis.coverage,
      edgeCases: analysis.edgeCases,
      mockQuality: analysis.mockQuality,
      assertions: analysis.assertions,
      bestPractices: analysis.bestPractices,
      feedback: {
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        recommendations: analysis.recommendations,
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
