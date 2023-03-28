<template>
    <div class="display">
        <div>
            <p><b>pool address</b>{{ poolAddress || empty }}</p>
        </div>
        <div>
            <p><b>bid | depth</b>{{ bidAsk[0] || empty }} | {{ depth[0] || empty }}</p>
            <p><b>ask | depth</b>{{ bidAsk[1] || empty }} | {{ depth[1] || empty }}</p>
        </div>
        <div>
            <p><b>token0 reserves</b>{{ reserves[0] || empty }}</p>
            <p><b>token1 reserves</b>{{ reserves[1] || empty }}</p>
        </div>
        <div>
            <p><b>token0 accumulator</b>{{ accu[0] || empty }}</p>
            <p><b>token1 accumulator</b>{{ accu[1] || empty }}</p>
        </div>
        <div>
            <p><b>bid limit</b>{{ limit[0] || empty }}</p>
            <p><b>ask limit</b>{{ limit[1] || empty }}</p>
        </div>
        <div
            class="btn"
            @click="callRefresh()"
        >
            <h3>refresh</h3>
        </div>
    </div>
</template>

<script>
import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { mapStores } from "pinia"
import { ethers } from "ethers"

// import * as Factory from "../ABIs/factoryAbi.json"
// const FactoryABI = Factory.default

// import * as Pool from "../ABIs/poolAbi.json"
// const PoolABI = Pool.default

// import * as Token from "../ABIs/tokenAbi.json"
// const TokenABI = Token.default
export default {
    emits: ["refresh"],
    data() {
        return {
            bidAsk: [],
            reserves: [],
            depth: [],
            accu: [],
            limit: [],
        }
    },
    watch: {
        poolAddress() {
            if (this.poolAddress !== null) {
                this.setupDisplay()
            }
        },
    },
    methods: {
        async setupDisplay() {
            console.log(" - display - SETUP DISPLAY CALLED -")
            if (this.poolAddress === null) {
                this.bidAsk = []
                this.reserves = []
                this.depth = []
                return
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const poolContract = new ethers.Contract(this.poolAddress, PoolABI, provider.getSigner())

            // bidask
            const bidAsk = await poolContract.getBidAsk()
            this.bidAsk[0] = ethers.utils.formatEther(bidAsk._bid)
            this.bidAsk[1] = ethers.utils.formatEther(bidAsk._ask)

            //reserves
            const reserves = await poolContract.getReserves()
            this.reserves[0] = ethers.utils.formatEther(reserves._reserve0)
            this.reserves[1] = ethers.utils.formatEther(reserves._reserve1)
            //depth
            const depth = await poolContract.getDepth()
            this.depth[0] = ethers.utils.formatEther(depth._depth_bid)
            this.depth[1] = ethers.utils.formatEther(depth._depth_ask)

            //accumulators
            const accu = await poolContract.getAccumulators()
            this.accu[0] = accu._token0Accumulator
            this.accu[1] = accu._token1Accumulator

            //limit
            const bid_limit = await poolContract.getLimit(bidAsk._bid, reserves._reserve0, reserves._reserve1)
            const ask_limit = await poolContract.getLimit(bidAsk._ask, reserves._reserve0, reserves._reserve1)
            this.limit = [bid_limit, ask_limit]
        },
        callRefresh() {
            this.$emit("refresh")
        },
    },
    computed: {
        ...mapStores(useStepStore, useTempStore),
        poolAddress() {
            return this.tempStore.poolAddress
        },
        empty() {
            return "ᕙ(⇀‸↼‶)ᕗ"
        },
    },
}
</script>

<style lang="scss" scoped>
.display {
    min-width: 540px;
    height: 100%;
    background-color: var(--widget-bg);
    transition: background-color var(--transition);
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    margin-left: 2rem;
    padding: 2rem;
    div {
        margin-bottom: 2rem;
        p {
            margin-bottom: 0.5rem;
        }
    }
    b {
        font-size: 1.7rem;
        font-weight: bolder;
        margin-right: 1rem;
    }
    .btn {
        flex-grow: 1;
        background-color: var(--primary-btn-bg);
        transition: background-color var(--transition);
        height: 6rem;
        display: flex;
        flex-direction: column;
        place-content: center;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        & > * {
            color: var(--primary-btn-color);
            transition: color var(--transition);
        }
    }
}
</style>
