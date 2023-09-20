import { getProviderOrSigner, useCommunityNetContract, useRouterContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { MAX_UNIT256 } from '../../constants';
import { Contract } from '@ethersproject/contracts';
import ERC20ABI from '../../abi/ERC20.json';
import BigNumber from "bignumber.js";
import { toTokenValue } from '../../utils';
import TipPop from '../../components/pop/TipPop';
import HeadBar from '../../components/headbar';
import { useTranslation } from 'react-i18next';

const ethers = require('ethers');

const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
const tokenkAddr = process.env.REACT_APP_TOKEN_TOKEN + ""
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + ""

function Ipo() {
    const { t } = useTranslation()

    const routerContract = useRouterContract();
    const communityContract = useCommunityNetContract(communityAddr);

    const { account, library } = useWeb3React()

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingState, setLoadingState] = useState<string>("loading")
    const [loadingText, setLoadingText] = useState<string>("")

    const [scale, setScale] = useState<string>("0");
    const [leaveNum3, setLeaveNum3] = useState<string>("0");
    const [leaveNum5, setLeaveNum5] = useState<string>("0");
    const [leaveNum6, setLeaveNum6] = useState<string>("0");
    const [leaveNum7, setLeaveNum7] = useState<string>("0");
    const [ipoChange, setIpoChange] = useState<boolean>(false)


    useEffect(() => {
        init()
    }, [account])

    const init = () => {
        getScale();
        getLeaveNum();
    }

    // leaveNum
    const getLeaveNum = async () => {
        let data = await Promise.all([await communityContract?.leaveNum("3"), await communityContract?.leaveNum("5"), await communityContract?.leaveNum("6"), await communityContract?.leaveNum("7")])
        console.log("data",data)
        setLeaveNum3(data[0].toString())
        setLeaveNum5(data[1].toString())
        setLeaveNum6(data[2].toString())
        setLeaveNum7(data[3].toString())
    }

    const getScale = async () => {
        let data = await communityContract?.scale(account)
        console.log("data getScale", data.toString())
        setScale(data.toString())
    }

    const sendApplyGuild = async (leaveType: number) => {
        console.log("sendApplyGuild leaveType", leaveType)
        let sendAmount = 0
        if (leaveType == 3) {
            sendAmount = 500
        } else if (leaveType == 5) {
            sendAmount = 2000
        } else if (leaveType == 6) {
            sendAmount = 5000
        } else if (leaveType == 7) {
            sendAmount = 10000
        }
        let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
        const allowance: any = await usdtErc20?.allowance(account, communityAddr);
        const decimals: any = await usdtErc20?.decimals();
        setLoading(true);
        setLoadingState("loading");
        setLoadingText(`${t("TransactionPacking")}`);

        if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(sendAmount, decimals))) {
            sendApprove(usdtErc20, communityAddr, sendApplyGuild, leaveType)
        } else {
            setLoadingState("loading")
            setLoadingText(`${t("TransactionPacking")}`)
            try {
                let info = await routerContract?.getAmountsOut(toTokenValue(new BigNumber(sendAmount).multipliedBy(55).dividedBy(200).toString(), decimals), [usdtAddr, tokenkAddr])

                console.log("applyGuild info", info, info.toString(), info[1].toString())
                const gas: any = await communityContract?.estimateGas.applyGuild(leaveType, info[1].toString(), { from: account })
                console.log("applyGuild gas", gas)
                const response = await communityContract?.applyGuild(3, info[1].toString(), {
                    from: account,
                    gasLimit: gas.mul(105).div(100)
                });
                let provider = new ethers.providers.Web3Provider(library.provider);
                let receipt = await provider.waitForTransaction(response.hash);
                if (receipt !== null) {
                    if (receipt.status && receipt.status == 1) {
                        init()
                        setIpoChange(!ipoChange)
                        sendLoadingSuccess()
                    } else {
                        sendLoadingErr()
                    }
                }
            } catch (err: any) {
                console.log("sendJoin err", err)
                sendLoadingErr()
            }
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

    const sendApprove = async (approveContract: any, approveAddress: string, send: Function, leaveType?: number) => {
        setLoadingState("loading")
        setLoadingText(`${t("Authorizing")}`)

        try {
            const gas: any = await approveContract?.estimateGas.approve(approveAddress, MAX_UNIT256, { from: account });
            const response = await approveContract?.approve(approveAddress, MAX_UNIT256, {
                from: account,
                gasLimit: gas.mul(105).div(100)
            });
            let provider = new ethers.providers.Web3Provider(library.provider);

            let receipt = await provider.waitForTransaction(response.hash);
            if (receipt !== null) {
                if (receipt.status && receipt.status == 1) {
                    setLoadingState("success")
                    setLoadingText(`${t("AuthorizationSuccessful")}`)

                    if (leaveType != undefined) {
                        send(leaveType)
                    } else {
                        send()
                    }
                } else {
                    setLoadingState("error")
                    setLoadingText(`${t("AuthorizationFailed")}`)
                    setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                    }, 2000);
                }
            }
        } catch (err: any) {
            setLoadingState("error")
            setLoadingText(`${t("AuthorizationFailed")}`)
            setTimeout(() => {
                setLoadingState("")
                setLoading(false)
            }, 2000);
        }
    }

    return (<>
        <HeadBar ipoChange={ipoChange} />
        <div className='main'>
            <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />
            <div className=' pt-32  mx-3 pb-10'>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalCreationAssociation")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leaveNum7}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>10000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo2")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            new BigNumber(scale).isGreaterThan("0") || new BigNumber(leaveNum7).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>10000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendApplyGuild(7)
                                }}
                            >10000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalSuperGuild")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leaveNum6}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>5000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo3")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            new BigNumber(scale).isGreaterThan("0") || new BigNumber(leaveNum6).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>5000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendApplyGuild(6)
                                }}
                            >5000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalCommunityGuild")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leaveNum5}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>2000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo4")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            new BigNumber(scale).isGreaterThan("0") || new BigNumber(leaveNum5).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>2000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendApplyGuild(5)
                                }}
                            >2000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("Application")} S3 </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leaveNum3}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>500 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>

                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            new BigNumber(scale).isGreaterThan("0") || new BigNumber(leaveNum3).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>500 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendApplyGuild(3)
                                }}
                            >500 USDT </span>
                        }
                    </p>
                </div>
            </div>
        </div>
    </>
    )
}

export default Ipo