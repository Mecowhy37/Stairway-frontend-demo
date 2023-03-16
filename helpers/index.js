import * as Tokens from "../constants/tokenList.json"
const TokenList = Tokens.default

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}
