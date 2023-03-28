exports.getPoolImmutables = async (poolContract) => {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([poolContract.token0, poolContract.token1, poolContract.fee]);

  //this data is visible in etherscan smartcontract specifics
  const immutables = {
    token0,
    token1,
    fee,
  };

  return immutables;
};

exports.getPoolState = async (poolContract) => {
  const slot = poolContract.slot0();

  const state = {
    sqrtPriceX96: slot[0],
  };

  return state;
};
