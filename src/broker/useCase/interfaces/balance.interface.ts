export interface Balance {
	/**
	 * Total balance of cash (currency-based assets).
	 *
	 * @type {number}
	 */
	cash: number;

	/**
	 * Total balance of assets other than cash (such as stocks or other instruments).
	 *
	 * @type {number}
	 */
	assets: number;
}

export interface AssetPosition {
	/**
	 * Unique identifier of the financial instrument.
	 *
	 * @type {number}
	 */
	id: number;

	/**
	 * Stock ticker symbol representing the financial instrument.
	 * Example: "BMA" for Banco Macro S.A.
	 *
	 * @type {string}
	 */
	ticker: string;

	/**
	 * Full name of the financial instrument or company.
	 * Example: "Banco Macro S.A."
	 *
	 * @type {string}
	 */
	name: string;

	/**
	 * Number of shares or units owned for the given instrument.
	 *
	 * @type {number}
	 */
	quantity: number;

	/**
	 * Total monetary value of the position in the given instrument, expressed in currency ($).
	 *
	 * @type {number}
	 */
	positionValue: number;

	/**
	 * Total return on investment for the instrument, expressed as a percentage (%).
	 *
	 * @type {number}
	 */
	totalReturn: number;
}
