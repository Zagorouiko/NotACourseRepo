import { abi, contractAddress, contractAddresses } from '../constants'
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from 'ethers'
import { useNotification } from 'web3uikit'

export default function LotteryEntrance() {
    // The header component knows the chainId via metamask connect and passes it to the moralis provider in _app 
    // then this passes it down to it's children, which is everything inside the moralis provider tags which is everything in the app

    // This pulls out the chainId from Moralis and renames it to chainIdHex
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()

    //chainId comes back in hex form, need to parse to integer
    const chainId = parseInt(chainIdHex)

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // essentially same as class component state, we need this variable to change so it re-renders the page
    // setEntranceFee is the function we call to set the entrance fee
    // variable state : function 
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayer] = useState("0")
    const [recentWinners, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    // These connect to the contract functions and defines the function name for this component
    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

        const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    // ____________________________________________________________________________________________

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
            const numPlayersFromCall = (await getNumberOfPlayers()).toString()
            const recentWinnerFromCall = (await getRecentWinner())
             // From the state hook above
            setEntranceFee(entranceFeeFromCall)
            setNumPlayer(numPlayersFromCall)
            setRecentWinner(recentWinnerFromCall)
    }

    // Initially false, once isWeb3Enabled is true then the function runs setting the entrance fee
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()        
        }
    }, [isWeb3Enabled])


    const handleSuccess = async function (tx) {
        // We have to wait for 1 confirm to make sure the transaction is actually successful before showing the message
        await tx.wait(1)
        handleNewNotification(tx)
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            position: "topR",
            icon: "bell",
        })
    }

    return(
        <div className="p-5">Hi from lottery entrance
            { raffleAddress ?  
            <div> 
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 round ml-auto"  
                onClick={async function () { await enterRaffle({onSuccess: handleSuccess, onError: (err) => console.log(err)}) }} 
                disabled={isLoading || isFetching}>
                    {isLoading || isFetching ? (<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>) : (<div>Enter Raffle</div>)}                 
                </button> 

                Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH <br/>
                Number of Players: {numPlayers}<br/>
                Recent Winner: {recentWinners}
            </div> 
            : 
            <div>No Raffle Address Detected</div>
        }         
        </div>
    )
}