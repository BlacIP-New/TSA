/**
 * MDA Service — Integration stubs for Credo backend MDA management endpoints.
 *
 * TODO (Backend Integration):
 *   GET  /admin/mda-users
 *     params: { aggregatorId }
 *     → MDAUser[]
 *
 *   POST /admin/mda-users/invite
 *     body: { email, mdaName, collectionCode, serviceCode, aggregatorId }
 *     → MDAUser
 *
 *   POST /admin/mda-users/:id/resend-invite
 *     → void
 *
 *   PATCH /admin/mda-users/:id/deactivate
 *     → MDAUser
 *
 *   PATCH /admin/mda-users/:id/reactivate
 *     → MDAUser
 *
 *   GET /admin/collection-codes
 *     params: { aggregatorId }
 *     → CollectionCode[]
 *
 *   GET /admin/service-codes
 *     params: { collectionCode }
 *     → ServiceCode[]
 */

export { };
