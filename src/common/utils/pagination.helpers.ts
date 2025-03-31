/**
 * Calculates the total number of pages for paginated results.
 *
 * This function computes the total pages based on the total number of items
 * and the number of items per page (limit). It ensures that if there are
 * any remaining items that don't fill a full page, an additional page will be added.
 *
 * @param {number} total The total number of items available.
 * @param {number} limit The number of items per page (limit).
 * @returns {number}  The total number of pages, rounded up to the nearest integer.
 *
 */
export function getTotalPages(total: number, limit: number) {
	return Math.ceil(total / limit);
}

/**
 * Calculates the number of items to skip for pagination.
 *
 * This function determines how many items should be skipped based on the current
 * page and the number of items per page (limit). It is commonly used for
 * determining the offset in a paginated query, allowing the correct slice of
 * results to be returned.
 *
 * @param {number} page The current page number (starting from 1).
 * @param {number} limit The number of items per page (limit).
 * @returns {number} The number of items to skip in the query.
 *
 */
export function getSkip(page: number, limit: number) {
	return (page - 1) * limit;
}
