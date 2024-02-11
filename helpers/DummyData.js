export const dummyTokens = [
    {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "WMATIC",
        name: "Wrapped Matic",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: true,
        total_supply: "5745428543635031325713113853",
    },
    {
        chain_id: 80001,
        address: "0x9A99605865985fE4E1776bAF0801d38A45237073",
        symbol: "FakeUSD",
        name: "Fake Usd",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635092625713113853",
    },
]

export const dummyChains = [
    {
        chain_id: 80001,
        chain_name: "Polygon Testnet (Mumbai)",
        short_name: "maticmum",
        logo_url:
            "https://assets-global.website-files.com/5f973c97cf5aea614f93a26c/644b21670120d5a3574a32d2_image-1.png",
        is_mainnet: false,
        rpc_url: "https://polygon-mumbai.g.alchemy.com/v2/demo",
    },
]

export const dummyPools = {
    chain_id: 80001,
    pool_index: 142,
    name: "WMATIC/FakeUSD",
    base_token: {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "WMATIC",
        name: "Wrapped Matic",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: true,
        total_supply: "5745428543635031325713113853",
    },
    quote_token: {
        chain_id: 80001,
        address: "0x9A99605865985fE4E1776bAF0801d38A45237073",
        symbol: "FakeUSD",
        name: "Fake Usd",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635092625713113853",
    },
    lp_token: {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "WMATIC",
        name: "Wrapped Matic",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: true,
        total_supply: "5745428543635031325713113853",
    },
    price: "250000000000000000",

    depth: "11244286031325713113853",
    base_reserves: "11142186031325713113853",
    quote_reserves: "35876986031325713113853",
    path: [
        {
            chain_id: 80001,
            address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
            symbol: "WMATIC",
            name: "Wrapped Matic",
            decimals: 18,
            logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
            is_featured: true,
            is_governance: true,
            total_supply: "5745428543635031325713113853",
        },
    ],
}
