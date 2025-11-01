import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing barcode',
          details: 'Barcode parameter is required'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('Looking up barcode:', barcode);

    const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API request failed',
          details: `Status: ${response.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Product not found',
          details: 'No product data available for this barcode'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const item = data.items[0];
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          barcode: barcode,
          name: item.title,
          manufacturer: item.brand,
          model: item.model,
          description: item.description,
          category: item.category,
          images: item.images,
          rawData: item
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Lookup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Lookup failed', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
