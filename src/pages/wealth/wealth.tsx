import { menuIcon } from '../../image'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import HeadBar from '../../components/headbar'
import TipPop from '../../components/pop/TipPop'
import { fromTokenValue } from '../../utils'
import BigNumber from "bignumber.js";
import { useTranslation } from 'react-i18next'
import {  useCommunityNetContract } from '../../hooks/useContract'

const ethers = require('ethers');

const dayTime = process.env.REACT_APP_DAY + ""
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + "";

function Wealth() {
    const { t } = useTranslation()

    const { account, library } = useWeb3React()
    const communityContract = useCommunityNetContract(communityAddr);

    const [dataList, setDataList] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingState, setLoadingState] = useState<string>("loading")
    const [loadingText, setLoadingText] = useState<string>("")
    useEffect(() => {
        init()
    }, [account])

    const init = () => {
        console.log("communityContract",communityContract)
        getReparations()
    }
    // getReparations
    const getReparations = async () => {
        let data = await communityContract?.getReparations(account)
        console.log("getReparations", data)
        setDataList(data)
    }
    const sendTakeReparation = async (index: number) => {

        setLoadingState("loading")
        setLoadingText(`${t("TransactionPacking")}`)
        try {
            const gas: any = await communityContract?.estimateGas.takeReparation(index, account, { from: account })
            console.log("sendTakeReparation gas", gas)
            const response = await communityContract?.takeReparation(index, account, {
                from: account,
                gasLimit: gas.mul(105).div(100)
            });
            let provider = new ethers.providers.Web3Provider(library.provider);

            let receipt = await provider.waitForTransaction(response.hash);
            if (receipt !== null) {
                if (receipt.status && receipt.status == 1) {
                    init()
                    sendLoadingSuccess()
                } else {
                    sendLoadingErr()
                }
            }
        } catch (err: any) {
            sendLoadingErr()
        }
    }

    const sendLoadingErr = () => {
        setLoadingState("error")
        setLoadingText(`${t("transactionFailed")}`)
        setTimeout(() => {
            setLoadingState("")
            setLoading(false)
        }, 2000);
    }

    const sendLoadingSuccess = () => {
        setLoadingState("success")
        setLoadingText(`${t("successfulTransaction")}`)
        setTimeout(() => {
            setLoading(false)
            setLoadingState("")
        }, 2000);
    }

    const ItemEarnings = (item: any) => {
        const timeNow = new BigNumber(new Date().getTime() / 1000).dividedBy(dayTime).toFixed(0)
        let returnAmount = "0"

        if (new BigNumber(item.startDayIndex.toString()).isLessThan(item.endDayIndex.toString())) {
            let amountDay = new BigNumber(timeNow).isLessThan(item.endDayIndex.toString()) ? timeNow : item.endDayIndex.toString();
            returnAmount = fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(amountDay).minus(item.startDayIndex.toString()).toString()).dividedBy(300).toString(), 18, 3);

        } else {
            returnAmount = "0"
        }

        return returnAmount;
    }

    const ItemUnEarnings = (item: any) => {
        let returnAmount = "0"
        if (new BigNumber(item.startDayIndex.toString()).isLessThan(item.endDayIndex.toString())) {
            returnAmount = fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(300).plus(item.startDayIndex.toString()).minus(item.endDayIndex.toString())).dividedBy(300).toString(), 18, 3);
        } else {
            returnAmount = fromTokenValue(item.amount.toString(), 18, 3);
        }

        return returnAmount
    }

    const ItemNotReleased = (item: any) => {

        const timeNow = new BigNumber(new Date().getTime() / 1000).dividedBy(dayTime).toFixed(0)
        let returnAmount = "0"
        if (new BigNumber(item.startDayIndex.toString()).isLessThan(item.endDayIndex.toString())) {
            let amountDay = new BigNumber(timeNow).isLessThan(item.endDayIndex.toString()) ? timeNow : item.endDayIndex.toString();
            returnAmount = fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(item.endDayIndex.toString()).minus(amountDay).toString()).dividedBy(300).toString(), 18, 3);
        } else {
            returnAmount = "0"
        }
        return returnAmount

    }
    return (<>
        <HeadBar />
        <div className=" main">
            <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

            <div className=' pt-32  mx-3 pb-10'>
            </div>

            {
                dataList && dataList.map((item: any, index: number) => {
                    return <div className='bg-white rounded-2xl  mx-3 mb-5 p-3' key={index}>
                        <h3 className='mainTextColor font-bold text-2xl text-center mb-2'> {t("RebornFortune")}{dataList.length - index} {t("Expect")}</h3>
                        <div>
                            <div className=' flex'>
                                <div className=' w-52'>
                                    <div>
                                        <div className='  flex mb-2'>
                                            <img
                                                className=' w-5 h-5 mr-2'
                                                src={menuIcon} alt="" />
                                            <p className='text-gray-400 text-sm '> {t("RebirthWealthRewardsToBeWithdrawn")}</p>
                                        </div>
                                        <p className='font-bold text-xl  break-words '>
                                            {
                                                ItemEarnings(item)
                                            }
                                            <span className=' mx-1'>
                                                +
                                            </span>
                                            <span className='text-gray-400'>
                                                {
                                                    ItemNotReleased(item)
                                                }
                                            </span>
                                            <span className=' text-sm ml-2'>USDT</span>
                                        </p>
                                    </div>
                                    <div>
                                        <div className=' flex  my-2'>
                                            <div className=' flex-1 flex '>
                                                <img
                                                    className='  w-5 h-5 mr-2'
                                                    src={menuIcon} alt="" />
                                                <p className='text-gray-400 text-sm'> {t("RebirthFortuneRewardHasBeenWithdrawn")}</p>
                                            </div>
                                        </div>
                                        <p className='font-bold text-xl break-words '>
                                            {
                                                ItemUnEarnings(item)
                                            }
                                            <span className=' text-sm ml-2 '>USDT</span>
                                        </p>
                                    </div>
                                </div>

                                <div className=' flex-1'>
                                    <p className='  text-right'>
                                        {
                                            new BigNumber(item.startDayIndex.toString()).isGreaterThan(item.endDayIndex.toString()) ? <span className=' border-solid border rounded-3xl py-1 px-6 text-gray-400 font-bold  border-gray-400 cursor-pointer'> {t("withdraw")}</span> : <span className=' border-solid border rounded-3xl py-1 px-6   mainTextColor font-bold borderMain cursor-pointer'
                                                onClick={() => {
                                                    sendTakeReparation(index)
                                                }}>{t("withdraw")}</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                })
            }
            {/* <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <p className=' indent-8 text-sm'>
                    {t("plan1")}
                </p>
            </div> */}
        </div>
    </>
    )
}

export default Wealth