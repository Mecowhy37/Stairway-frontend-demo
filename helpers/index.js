import { ref } from "vue"
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers"

import router from "@/ABIs/IDEX.json"
const RouterABI = router.abi

import token from "@/ABIs/ERC20.json"
import { ElementFlags } from "typescript"
const TokenABI = token.abi

const unhandled = "0x0000000000000000000000000000000000000000"

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}

const api = "https://api.stairway.fi"
function getUrl(endpoint) {
    return api + endpoint
}
export function basicRound(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return String(parseFloat(amount))
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

    async function getTotalSupply(address, providerArg) {
        console.log("getTotalSupply()")
    }

    return { getTokenBalance, getTotalSupply }
}

export function usePools(routerAddress) {
    const pool = ref(null)

    async function findPool(tokens, chainId) {
        const { data, error } = await useFetch(
            getUrl(`/chain/${chainId}/pool/${tokens[0].address}/${tokens[1].address}`)
        )
        if (error.value) {
            pool.value = null
            console.error("error finding pool: ", error.value)
            return
        }
        pool.value = data.value
    }

    const poolRatio = computed(() => {
        if (!pool.value) {
            return null
        }
        return (
            Number(formatUnits(pool.value.base_reserves, pool.value.base_token.decimals)) /
            Number(formatUnits(pool.value.quote_reserves, pool.value.quote_token.decimals))
        )
    })

    async function addLiquidity(tokenA, tokenB, amountA, amountB, slippage, deadline, recipient, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress, RouterABI, signer)

        const parsedAmountA = parseUnits(amountA, tokenA.decimals)
        const parsedAmountB = parseUnits(amountB, tokenB.decimals)
        const parsedMinAmountA = parseUnits(String(amountA - (amountA * slippage) / 100), tokenA.decimals)
        const parsedMinAmountB = parseUnits(String(amountB - (amountB * slippage) / 100), tokenB.decimals)

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        try {
            console.log("tryying")
            const allowanceA = await checkAllowance(tokenA.address, signer.address, routerAddress, providerArg)
            const needApprovalA = allowanceA < parsedAmountA

            const allowanceB = await checkAllowance(tokenB.address, signer.address, routerAddress, providerArg)
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

            await router.addLiquidity(
                tokenA.address,
                tokenB.address,
                parsedMinAmountA,
                parsedAmountA,
                parsedMinAmountB,
                parsedAmountB,
                recipient,
                deadlineStamp
            )
        } catch (error) {
            console.log("Failed to add liquidity:", error)
        }
    }

    async function approveSpending(tokenAddress, providerArg, amount, callback = false) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const erc20 = new Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const quantity = amount === 0 ? maxUint : amount
        const tx = await erc20.approve(routerAddress, quantity)
        await tx.wait(1)
        return await listenForTransactionMine(tx, provider, callback)
    }
    function listenForTransactionMine(txRes, provider, callback = null) {
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

    async function redeemLiquidity(
        tokenA,
        tokenB,
        pooledA,
        pooledB,
        redeemPercent,
        lpToken,
        lpAmount,
        connectedAccount,
        deadline,
        providerArg
    ) {
        try {
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress, RouterABI, signer)

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

            const allowance = await checkAllowance(lpToken.address, signer.address, routerAddress, providerArg)
            const needApproval = allowance < lpAmountParsed
            if (needApproval) {
                await approveSpending(lpToken.address, providerArg, lpAmountParsed)
            }

            await router.redeemLiquidity(
                ...tokenList,
                amount0,
                amount1,
                lpAmountParsed,
                connectedAccount,
                deadlineStamp
            )
        } catch (err) {
            console.log("failed to redeem liquidity: ", err)
        }
    }

    // async function swap(tokens, amounts, maxPrice, account, deadline, providerArg) {
    //     // address, address, desiredAmount, maxPrice, recepient, deadline
    //     console.log("swap()")
    //     // const provider = new BrowserProvider(providerArg)
    //     // const signer = await provider.getSigner()
    //     // const router = new Contract(routerAddress, RouterABI, signer)

    //     // const blockTimestamp = (await provider.getBlock("latest")).timestamp
    //     // const deadlineStamp = blockTimestamp + deadline * 60

    //     // const allowance = await checkAllowance(tokens[1], signer.address, routerAddress, providerArg)
    //     // const needApproval = allowance < amounts[0]
    //     // if (needApproval) {
    //     //     await approveSpending(tokens[1], providerArg, amounts[0])
    //     // }

    //     // await router.buy(...tokens, amounts[1], maxPrice, account, deadlineStamp)
    // }

    return {
        pool,
        findPool,
        poolRatio,
        listenForTransactionMine,
        addLiquidity,
        redeemLiquidity,

        // checkAllowance,
        // swap,
        // approveSpending,
    }
}
