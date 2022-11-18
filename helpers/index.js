import * as Tokens from "../constants/tokenAddresses.json"
const TokenList = Tokens.default

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}
