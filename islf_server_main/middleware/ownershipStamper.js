/**
 * OWNERSHIP STAMPER MIDDLEWARE — Phase I
 *
 * PURPOSE
 * -------
 * Prevents orphan records by enforcing server-side ownership metadata on every
 * mutating request. Frontend-submitted created_by / updated_by values are
 * never trusted; the backend always overwrites them.
 *
 * BEHAVIOUR
 * ---------
 * POST requests:
 *   - Sets req.body.created_by  = req.user.username  (immutable creator)
 *   - Sets req.body.updated_by  = req.user.username  (last editor, same on create)
 *
 * PUT / PATCH requests:
 *   - Removes req.body.created_by entirely (ownership is immutable, cannot be changed)
 *   - Sets req.body.updated_by  = req.user.username
 *
 * DELETE requests:
 *   - No body mutation needed; ownership guard (Phase G/H) already controls access.
 *
 * Also sets req.ownerUsername = req.user.username as a convenience for
 * route handlers that build their own INSERT column lists (e.g. enquiry.js).
 *
 * ROLLBACK
 * --------
 * Remove ownershipStamper from the middleware chain for any route in main.js.
 * No database change required.
 */

'use strict';

function ownershipStamper(req, res, next) {
  // Must be authenticated — auth middleware runs before this.
  if (!req.user || !req.user.username) {
    // Pass through; auth middleware will have already rejected unauthenticated calls.
    return next();
  }

  const username = req.user.username;

  // Expose as a route-accessible property (for routes that build their own queries)
  req.ownerUsername = username;

  const method = req.method.toUpperCase();

  if (method === 'POST') {
    // Backend is source of truth for creator — always overwrite what frontend sent.
    if (req.body && typeof req.body === 'object') {
      req.body.created_by = username;
      req.body.updated_by = username;
    }

  } else if (method === 'PUT' || method === 'PATCH') {
    // Ownership is immutable: strip created_by from any PUT/PATCH body.
    // updated_by always reflects who made the last change.
    if (req.body && typeof req.body === 'object') {
      delete req.body.created_by;
      req.body.updated_by = username;
    }
  }

  next();
}

module.exports = ownershipStamper;
