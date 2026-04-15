/**
 * Export Service — Integration stubs for Credo backend export endpoints.
 *
 * TODO (Backend Integration):
 *   GET /transactions/export/csv
 *     params: { aggregatorId, collectionCode?, serviceCode?, from?, to?,
 *               channel?, status?, minAmount?, maxAmount? }
 *     → Response with Content-Disposition: attachment; filename="tsa_export.csv"
 *
 *   GET /transactions/export/pdf
 *     params: { aggregatorId, collectionCode?, serviceCode?, from?, to?,
 *               channel?, status?, minAmount?, maxAmount? }
 *     → Response with Content-Disposition: attachment; filename="tsa_report.pdf"
 *     PDF must include: portal name, MDA name, collection code, service code,
 *     date range, generation timestamp, page numbers (FR-034)
 */

export { };
