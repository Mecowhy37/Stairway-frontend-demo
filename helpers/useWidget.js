import { isSupportedChain } from "~/helpers/index"

export function useWidget(FeaturedTokensData, Tokens, chainId, router, route) {
    const isWidgetLocked = ref(false)

    function widgetLocker(lock) {
        isWidgetLocked.value = lock
    }

    watch(
        chainId,
        (newChain) => {
            widgetLocker(!isSupportedChain(newChain))
        },
        {
            immediate: true,
        }
    )

    return {
        isWidgetLocked,
        widgetLocker,
    }
}
