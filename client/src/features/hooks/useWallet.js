import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import useAuthentication from './useAuthentication'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useEffect } from 'react'


const provider = new ethers.providers.AlchemyProvider('homestead', process.env.REACT_APP_ALCHEMY_KEY)



const validAddress = async (address) => {
    // if it's an ens, convert it
    if (address.endsWith('.eth')) address = await provider.resolveName(address)

    try {
        // get the checksum
        let valid = ethers.utils.getAddress(address)
        return valid
    } catch (err) { return false }
}




export default function useWallet() {
    const { address, isConnected } = useAccount()
    const { disconnect, authenticated_post } = useAuthentication()
    const { openConnectModal } = useConnectModal();



    return {
        walletAddress: address,
        isConnected: isConnected,
        walletConnect: openConnectModal,
        walletDisconnect: () => { return disconnect() },
        validAddress: (address) => { return validAddress(address) },
        authenticated_post: async (endpoint, body) => { return await authenticated_post(endpoint, body) },

    }
}