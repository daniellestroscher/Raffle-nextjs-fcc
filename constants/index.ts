import contractAddresses from "./contractAddresses.json"
import raffleAbi from "./raffleAbi.json"

interface AddressObj {
  [chainId: string]: string[];
}
const ContractAddresses: AddressObj = contractAddresses
export { ContractAddresses, raffleAbi }
