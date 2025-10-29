/**
 * ERP Proxy - Vercel Serverless Function
 *
 * This proxy bypasses SSL certificate issues by making the request from the server side.
 * We use https.Agent with rejectUnauthorized: false to bypass invalid SSL certificates.
 *
 * Endpoints:
 * GET /api/erp-proxy?artikl=XXX - Get stock by SKU
 * GET /api/erp-proxy?artikl=XXX&radjed=YY - Get stock by SKU and unit
 */

const https = require('https');

const ERP_BASE_URL = 'https://hb-server2012.ddns.net:65399';
const ERP_AUTH_TOKEN = 'xcbd41b04c329chkjkj59f98454545';

// Create HTTPS agent that bypasses SSL certificate validation
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // This allows self-signed or invalid certificates
});

module.exports = async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artikl, radjed } = req.query;

    // Build URL with parameters
    const params = new URLSearchParams({ auth: ERP_AUTH_TOKEN });

    if (artikl) {
      params.append('artikl', String(artikl));
    }

    if (radjed) {
      params.append('radjed', String(radjed));
    }

    const url = `${ERP_BASE_URL}/zaliha?${params.toString()}`;

    console.log('[ERP Proxy] Fetching from:', url.replace(ERP_AUTH_TOKEN, '***'));

    // Use fetch with custom agent to bypass SSL validation
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      agent: httpsAgent // Use our custom agent that bypasses SSL
    });

    if (!response.ok) {
      console.error('[ERP Proxy] ERP server error:', response.status, response.statusText);
      return res.status(response.status).json({
        error: `ERP server error: ${response.statusText}`,
        status: response.status
      });
    }

    const data = await response.json();

    console.log('[ERP Proxy] Success, items returned:', Array.isArray(data) ? data.length : 'unknown');

    return res.status(200).json(data);

  } catch (error) {
    console.error('[ERP Proxy] Error:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to fetch from ERP server';
    let statusCode = 500;

    if (error.code === 'ENOTFOUND') {
      errorMessage = 'ERP server not found. Check DNS configuration.';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. ERP server may be down.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout. ERP server is not responding.';
      statusCode = 504;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      error: errorMessage,
      code: error.code,
      details: error.message
    });
  }
}
