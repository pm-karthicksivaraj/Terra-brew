/**
 * API v1 Documentation Endpoint
 *
 * GET /api/v1 — Returns API documentation as JSON including
 * available endpoints, authentication method, and rate limits.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'TerraBrew Coffee Platform API',
    version: '1.0.0',
    description: 'External API for EU importers, certification bodies, and trading partners to check supplier compliance status.',
    baseUrl: '/api/v1',
    authentication: {
      method: 'API Key',
      description: 'All v1 endpoints require a valid API key. Keys are issued by tenant administrators via the /api/api-keys endpoint.',
      header: 'X-API-Key',
      queryParameter: 'api_key',
      note: 'The API key is associated with a specific tenant (supplier). Only data from that tenant is accessible.',
    },
    rateLimits: {
      maxRequests: 100,
      perWindow: '1 hour',
      perKey: true,
      headers: {
        'Retry-After': 'Returned on 429 responses with seconds until reset.',
      },
    },
    endpoints: [
      {
        path: '/api/v1',
        method: 'GET',
        description: 'API documentation (this endpoint)',
        authRequired: false,
      },
      {
        path: '/api/v1/compliance/status',
        method: 'GET',
        description: 'Get compliance status and Trust Score for a supplier',
        authRequired: true,
        parameters: [
          {
            name: 'supplier_id',
            type: 'string',
            required: true,
            description: 'Tenant slug (e.g. "metrang") or tenant ID',
            location: 'query',
          },
          {
            name: 'shipment_ref',
            type: 'string',
            required: false,
            description: 'Shipment reference for shipment-specific compliance status',
            location: 'query',
          },
        ],
        response: {
          supplier_id: 'string — Tenant slug',
          supplier_name: 'string — Display name',
          entity_type: 'string — producer | aggregator | exporter | importer | certification_body | laboratory',
          country: 'string — ISO country code',
          compliance: {
            eudr_status: 'string — compliant | in_review | pending | non_compliant | expired',
            trust_score: 'number (0-100) — Deterministic Trust Score',
            trust_score_breakdown: {
              eudr: 'number (0-30) — EUDR compliance component',
              deforestation: 'number (0-25) — Deforestation risk component',
              dds: 'number (0-20) — DDS status component',
              certifications: 'number (0-15) — Certifications component',
              data_completeness: 'number (0-10) — Data completeness component',
            },
            last_assessment_date: 'string (ISO 8601) | null',
            active_dds_count: 'number — Accepted DDS count',
            pending_dds_count: 'number — Draft + submitted DDS count',
            expired_dds_count: 'number — Expired DDS count',
            deforestation_risk: 'string — negligible | low | medium | high | critical',
            certifications_active: 'number — Active certification count',
            certifications_expired: 'number — Expired certification count',
          },
          shipment: 'object | null — Shipment-specific data (when shipment_ref provided)',
          generated_at: 'string (ISO 8601)',
        },
        statusCodes: {
          200: 'Success',
          400: 'Missing required parameter: supplier_id',
          401: 'Invalid or missing API key',
          404: 'Supplier not found',
          429: 'Rate limit exceeded',
          500: 'Internal server error',
        },
      },
    ],
    trustScore: {
      description: 'The Trust Score (0-100) is a deterministic composite score calculated from:',
      components: [
        { name: 'EUDR Compliance Status', weight: 30, values: 'compliant=30, in_review=20, pending=10, non_compliant=0, expired=5' },
        { name: 'Deforestation Risk', weight: 25, values: 'negligible=25, low=20, medium=10, high=0, critical=0' },
        { name: 'DDS Status', weight: 20, values: 'accepted=20, submitted=15, draft=5, none=0' },
        { name: 'Certifications', weight: 15, values: 'all active=15, some expired=10, none=0' },
        { name: 'Data Completeness', weight: 10, values: 'full (geolocation+polygon+farmer)=10, partial=5, minimal=0' },
      ],
      note: 'Same inputs always produce the same score. The score is recalculated on each request from live data.',
    },
  })
}
