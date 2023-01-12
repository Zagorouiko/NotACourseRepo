import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis()

    // 2nd parameter is a dependency array. If something changes in the array then the function runs (first paramteter) AND re-renders front-end
    // runs initially twice because of strict mode
    // This also runs anytime something re-renders (example button changes)
    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                // Removes key value pair in the browser (Storage > Local storage)
                window.localStorage.removeItem("connected")
                deactivateWeb3
                console.log("null account found")
            }
        })
    }, [])

    return (
        <div>
            {account ? 
            (<div>Connected to {account.slice(0,6)}...{account.slice(account.length-4)} </div>) 
            : 
            (<button onClick={async () => { 
                await enableWeb3()
                if (typeof window != "undefined") {
                    // Adds key value pair in the browser (Storage > Local storage)
                    window.localStorage.setItem("connected", "injected")
                }               
            }}
            disabled={isWeb3EnableLoading}
            >
                Connect</button>) }
        </div>                  
    )
}