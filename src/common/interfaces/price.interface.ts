export interface TotalAssetsSpent {
	totalAssets: number;
	totalSpent: number;
}

export interface FundsAvailability extends TotalAssetsSpent {
	hasFunds: boolean;
	isValidAssets: boolean;
	unitPrice: number;
}

export interface AssetSellInfo {
	totalAssetsToSell: number;
	totalAmountObtained: number;
	sellPrice: number;
}
