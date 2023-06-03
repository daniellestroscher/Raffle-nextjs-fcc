import React, { useEffect, useState } from "react"
import { ethers, BigNumber } from "ethers"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ContractAddresses, raffleAbi } from "../constants"
import { useNotification } from "@web3uikit/core"
import { Bell } from "@web3uikit/icons"

export default function LotteryEntrance() {
  const [entranceFee, setEntranceFee] = useState<string>("0")
  const [numPlayers, setNumPlayers] = useState<string>("0")
  const [recentWinner, setRecentWinner] = useState<string>("0")
  const dispatch = useNotification()

  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex as string).toString()
  const raffleAddress = chainId in ContractAddresses ? ContractAddresses[chainId][0] : null

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddress as string,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  })
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddress as string,
    functionName: "getEntranceFee",
    params: {},
  })
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddress as string,
    functionName: "getNumberOfPlayers",
    params: {},
  })
  const { runContractFunction: getMostRecentWinner } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddress as string,
    functionName: "getMostRecentWinner",
    params: {},
  })

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
    // getProviderAndListen()
  }, [isWeb3Enabled])

  // async function getProviderAndListen() {
  //   const provider = await enableWeb3() //this line creates multiple calls
  //   setupEventListeners(provider)
  // }
  // async function setupEventListeners(provider: any) {
  //   if (raffleAddress && provider) {
  //     const abi = JSON.stringify(raffleAbi)
  //     const raffleContract = new ethers.Contract(raffleAddress, abi, provider)
  //     raffleContract.on("RaffleEnter", (address: string) => {
  //       console.log("Lottery Entered event triggered with address:", address)
  //       handleNewNotification()
  //       updateUI()
  //     })
  //     raffleContract.on("WinnerPicked", (address: string) => {
  //       console.log("WinnerPicked event triggered with address:", address)
  //       updateUI()
  //     })
  //   }
  // }

  async function updateUI() {
    const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
    const numberOfPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
    const mostRecentWinnerFromCall = (await getMostRecentWinner()) as string
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numberOfPlayersFromCall)
    setRecentWinner(mostRecentWinnerFromCall)
  }
  const handleNewNotification = function () {
    dispatch({
      type: "info",
      title: "Transaction Notification",
      message: "transaction complete",
      position: "topR",
      icon: <Bell fontSize="25px" />,
    })
  }

  const handleSuccess = async function (tx: any) {
    const receipt = await tx.wait(1)
    handleNewNotification()
    updateUI()
  }
  return (
    <div className="p-5">
      {raffleAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <>Enter Lottery</>
            )}
          </button>
          {entranceFee != "" ? (
            <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
          ) : (
            <></>
          )}
          <div>Players: {numPlayers}</div>
          <div>Recent Winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Raffle Address Detected</div>
      )}
    </div>
  )
}
