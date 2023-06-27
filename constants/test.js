const routes = {
    "/pools": {
        "this_token-that_token": {
            pool: "string-address",
            this_token: "string-address",
            that_token: "string-address",
        },
    },
    "pool/{this_token}/{that_token}": {
        pool: "string-address",
        this_token: "string-address",
        that_token: "string-address",
        lp_token: "string-address",
        bid: "string",
        ask: "string",
        depth: "string",
        ratio: "string-1this:xthat",
        share: "number-perctentage",
        this_pooled: "string",
        that_pooled: "string",
    },
    "/user/{user_address}/balance/{token_address}": {
        token_address: "string-balance",
    },
    "/tokens": [
        //this response should come from external API, UNI uses https://tokenlists.org/
        //thier shape is:
        {
            chainId: 31337,
            address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            name: "STRVY",
            symbol: "STRVY",
            decimals: 18,
            logoURI: "https://assets.coingecko.com/coins/images",
        },
    ],
    "/positions(?)": [
        {
            pool: "string-address",
            this_token: "string-address",
            that_token: "string-address",
            lp_token: "string-address",
            share: "number-perctentage",
            this_pooled: "string",
            that_pooled: "string",
        },
    ],
}
