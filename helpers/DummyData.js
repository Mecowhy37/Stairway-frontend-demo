export const dummyTokens = [
    {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "Green Cash",
        name: "Green Cash",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635031325713113853",
    },
    {
        chain_id: 80001,
        address: "0x9A99605865985fE4E1776bAF0801d38A45237073",
        symbol: "Silver Change",
        name: "Silver Change",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635092625713113853",
    },
    {
        chain_id: 80001,
        address: "0x2e0D96257F4D29b6CD16232e6F2986AD57B04fff",
        symbol: "Ever Broke",
        name: "Ever Broke",
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
    pool_index: 1,
    name: "Green Cash/Silver Change",
    base_token: {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "Green Cash",
        name: "Green Cash",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635031325713113853",
    },
    quote_token: {
        chain_id: 80001,
        address: "0x9A99605865985fE4E1776bAF0801d38A45237073",
        symbol: "Silver Change",
        name: "Silver Change",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635092625713113853",
    },
    lp_token: {
        chain_id: 80001,
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        symbol: "Green Cash",
        name: "Green Cash",
        decimals: 18,
        logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
        is_featured: true,
        is_governance: false,
        total_supply: "5745428543635031325713113853",
    },
    price: "250000000000000000",
    depth: "112442860313257131138",
    base_reserves: "400000000000000000000",
    quote_reserves: "25000000000000000000",
    path: [
        {
            chain_id: 80001,
            address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
            symbol: "Green Cash",
            name: "Green Cash",
            decimals: 18,
            logo_uri: "https://mumbai.polygonscan.com/images/logo.svg",
            is_featured: true,
            is_governance: false,
            total_supply: "5745428543635031325713113853",
        },
    ],
}

export const dummyPositions = [
    {
        pool: dummyPools,
        lp_amount: "35876986031325713113853",
        lp_total_amount: "35876986031325713113853",
        base_amount: "25000000000000000000",
        quote_amount: "400000000000000000000",
        pool_share_pct: 23.51,
    },
]
