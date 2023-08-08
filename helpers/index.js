import { ref } from "vue"
import { BrowserProvider, Contract, parseUnits, formatUnits, formatEther, parseEther } from "ethers"

import router from "@/ABIs/IDEX.sol/IDEX.json"
const RouterABI = router.abi

import token from "@/ABIs/IERC20.sol/IERC20.json"
const TokenABI = token.abi

import poolmanager from "@/ABIs/IPoolManager.sol/IPoolManager.json"
const PoolManagerABI = poolmanager.abi

const unhandled = "0x0000000000000000000000000000000000000000"

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}

export function getUrl(endpoint) {
    const api = "https://api.stairway.fi"
    return api + endpoint
}
export function basicRound(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return String(parseFloat(amount))
}

export function isSupportedChain(id) {
    return id === 31337 || id === 80001 || id === 137
}

export function listenForTransactionMine(txRes, provider, callback = null) {
    console.log(`Mining ${txRes.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(txRes.hash, async (txReciept) => {
            if (typeof callback === "function") {
                callback()
            }
            resolve()
            console.log("Done!")
        })
    })
}

export function usePools(routerAddress, Tokens, connectedAccount, chainId) {
    const {
        data: pool,
        error: poolError,
        status: poolStatus,
        pending: poolPending,
    } = useAsyncData(
        "pool",
        () => {
            if (Tokens?.value) {
                const bothThere = Tokens.value.every((el) => el !== null)

                if (bothThere && connectedAccount.value && isSupportedChain(chainId.value)) {
                    return $fetch(
                        getUrl(`/chain/${chainId.value}/pool/${Tokens.value[0].address}/${Tokens.value[1].address}`)
                    )
                }
            }
        },
        {
            watch: [Tokens, chainId],
        }
    )

    const poolRatio = computed(() => {
        if (!pool.value) {
            return null
        }
        return (
            Number(formatUnits(pool.value.base_reserves, pool.value.base_token.decimals)) /
            Number(formatUnits(pool.value.quote_reserves, pool.value.quote_token.decimals))
        )
    })
    const price = computed(() => {
        if (!pool.value) {
            return null
        }
        return pool.value.ask
    })
    const depth = computed(() => {
        if (!pool.value) {
            return null
        }
        return pool.value.ask_depth
    })

    async function addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        slippage,
        deadline,
        recipient,
        providerArg,
        poolManagerAddress
    ) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress.value, RouterABI, signer)

        const parsedAmountA = parseUnits(amountA, tokenA.decimals).toString()
        const parsedAmountB = parseUnits(amountB, tokenB.decimals).toString()
        const parsedSlippage = parseUnits(slippage.toString(), 18).toString()
        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        try {
            const allowanceA = await checkAllowance(tokenA.address, signer.address, routerAddress.value, providerArg)
            const needApprovalA = allowanceA < parsedAmountA

            const allowanceB = await checkAllowance(tokenB.address, signer.address, routerAddress.value, providerArg)
            const needApprovalB = allowanceB < parsedAmountB

            if (needApprovalA || needApprovalB) {
                const approvalPromises = []

                if (needApprovalA) {
                    approvalPromises.unshift(approveSpending(tokenA.address, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressA, providerArg, parsedAmountA))
                }

                if (needApprovalB) {
                    approvalPromises.unshift(approveSpending(tokenB.address, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressB, providerArg, parsedAmountB))
                }

                await Promise.all(approvalPromises)
            }
        } catch (error) {
            console.log("Failed to get approvals:", error)
        }
        try {
            console.log("tokenA.address:", tokenA.address)
            console.log("tokenB.address,:", tokenB.address)
            console.log("parsedAmountA:", parsedAmountA)
            console.log("parsedAmountB:", parsedAmountB)
            console.log("parsedSlippage:", parsedSlippage)
            console.log("recipient:", recipient)
            console.log("deadlineStamp:", deadlineStamp)
            await router.addLiquidity(
                tokenA.address,
                tokenB.address,
                parsedAmountA,
                parsedAmountB,
                parsedSlippage,
                recipient,
                deadlineStamp
            )
        } catch (error) {
            console.log("Failed to add lq:", error)
        }
    }

    async function redeemLiquidity(
        tokenA,
        tokenB,
        pooledA,
        pooledB,
        redeemPercent,
        lpToken,
        lpAmount,
        deadline,
        providerArg
    ) {
        try {
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress.value, RouterABI, signer)

            const tokenList = [tokenA, tokenB].map((el) => el.address)

            const amount0 = calcPercentage(pooledA)
            const amount1 = calcPercentage(pooledB)
            const lpAmountParsed = calcPercentage(lpAmount)

            function calcPercentage(amount) {
                // temporary fix - bad browser support
                return String((BigInt(amount) * BigInt(redeemPercent)) / BigInt(100))
            }

            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadlineStamp = blockTimestamp + deadline * 60

            const allowance = await checkAllowance(lpToken.address, signer.address, routerAddress.value, providerArg)
            const needApproval = allowance < lpAmountParsed
            if (needApproval) {
                await approveSpending(lpToken.address, providerArg, lpAmountParsed)
            }

            await router.redeemLiquidity(
                ...tokenList,
                amount0,
                amount1,
                lpAmountParsed,
                connectedAccount.value,
                deadlineStamp
            )
        } catch (err) {
            console.log("failed to redeem liquidity: ", err)
        }
    }

    async function swap(tokenA, tokenB, amounts, maxPrice, account, deadline, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress.value, RouterABI, signer)

        const tokenList = [tokenA, tokenB].map((el) => el.address).reverse()

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        const allowance = await checkAllowance(tokenA.address, signer.address, routerAddress.value, providerArg)
        const needApproval = allowance < amounts[0]
        if (needApproval) {
            await approveSpending(tokenA.address, providerArg, amounts[0])
        }

        console.log(" - - - - -s w a p- - - - - - ")
        console.log("base token:", tokenList[0])
        console.log("qoute token:", tokenList[1])
        console.log("desired_base_amount:", amounts[1].toString())
        console.log("bid:", maxPrice)
        console.log("account:", account)
        console.log("deadlineStamp:", deadlineStamp)
        await router.buy(...tokenList, amounts[1].toString(), maxPrice, account, deadlineStamp)

        // "inputs": [
        //     {
        //         "internalType": "contract IERC20",
        //         "name": "baseToken",
        //         "type": "address"
        //     },
        //     {
        //         "internalType": "contract IERC20",
        //         "name": "quoteToken",
        //         "type": "address"
        //     },
        //     {
        //         "internalType": "uint256",
        //         "name": "desiredAmount",
        //         "type": "uint256"
        //     },
        //     {
        //         "internalType": "uint256",
        //         "name": "maxPrice",
        //         "type": "uint256"
        //     },
        //     {
        //         "internalType": "address",
        //         "name": "recipient",
        //         "type": "address"
        //     },
        //     {
        //         "internalType": "uint256",
        //         "name": "deadline",
        //         "type": "uint256"
        //     }
        // ]
    }

    async function approveSpending(tokenAddress, providerArg, amount, callback = false) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const erc20 = new Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const quantity = amount === 0 ? maxUint : amount
        const tx = await erc20.approve(routerAddress.value, quantity)
        await tx.wait(1)
        return await listenForTransactionMine(tx, provider, callback)
    }

    async function checkAllowance(tokenAddress, owner, spender, providerArg) {
        try {
            const provider = new BrowserProvider(providerArg)
            const token = new Contract(tokenAddress, TokenABI, provider)
            const allowance = await token.allowance(owner, spender)
            return allowance
        } catch (err) {
            return err
        }
    }

    return {
        pool,
        poolError,
        poolStatus,
        poolPending,
        poolRatio,
        price,
        depth,
        addLiquidity,
        redeemLiquidity,
        swap,

        // approveSpending,
        // listenForTransactionMine,
        // checkAllowance,
    }
}

export function useTokens() {
    const tokenA = ref(null)
    const tokenB = ref(null)
    const selectTokenIndex = ref(0)

    const Tokens = computed({
        get() {
            return [tokenA.value, tokenB.value]
        },
        set(newValue) {
            tokenA.value = newValue[0]
            tokenB.value = newValue[1]
        },
    })

    const bothTokensThere = computed(() => Tokens.value.every((el) => el !== null))

    function setToken(token) {
        if (token) {
            const sameTokenIndex = Tokens.value.findIndex((el) => el?.address === token.address)
            if (sameTokenIndex !== -1 && sameTokenIndex !== selectTokenIndex.value) {
                Tokens.value = Tokens.value.reverse()
                return
            }
        }
        Tokens.value = Tokens.value.map((el, index) => (index === selectTokenIndex.value ? token : el))
    }

    return {
        tokenA,
        tokenB,
        Tokens,
        bothTokensThere,
        setToken,
        selectTokenIndex,
    }
}

export function useBalances() {
    async function getTokenBalance(token, account, chainId) {
        if (token === null) {
            return ""
        }
        const { data: balance, error } = await useFetch(
            getUrl(`/chain/${chainId}/user/${account}/balance/${token.address}`)
        )
        if (balance.value) {
            return formatUnits(balance.value, token.decimals)
        }
        if (error.value) {
            console.error("failed to fetch balance", error.value)
            return ""
        }
    }

    return { getTokenBalance }
}
