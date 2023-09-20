import { Dialog, DialogContent } from '@mui/material'
import { useEffect, useState } from 'react'
import { getProviderOrSigner, useBabyCardContract, useRouterContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { fromTokenValue, toTokenValue } from '../../utils'
import TokenBalance from '../../components/token/TokenBalance'
import TipPop from '../../components/pop/TipPop'
import BigNumber from "bignumber.js";
import { MAX_UNIT256 } from '../../constants'
import { Contract } from '@ethersproject/contracts'
import ERC20ABI from '../../abi/ERC20.json';
import HeadBar from '../../components/headbar'
import { useTranslation } from 'react-i18next'
import { earthIcon, moonIcon, startIcon, sunIcon } from '../../image'

const ethers = require('ethers');

const BabyCardAddr = process.env.REACT_APP_CONTRACT_BABYCARD + ""
const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
const tokenkAddr = process.env.REACT_APP_TOKEN_TOKEN + ""
const dayTime = process.env.REACT_APP_DAY + ""

const incomeRule = [
  {
    ratio: 1,
    multiple: 2.0
  },
  {
    ratio: 1.2,
    multiple: 2.2
  },
  {
    ratio: 1.3,
    multiple: 2.3
  },
  {
    ratio: 1.4,
    multiple: 2.5
  }
]

function Card() {
  const { t } = useTranslation()
  const babyCardContract = useBabyCardContract(BabyCardAddr)
  const routerContract = useRouterContract();
  const { account, library } = useWeb3React()
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const [sendAmount, setSendAmount] = useState<string>("")
  const [change, setChange] = useState<boolean>(false)
  const [accountBalance, setAccountBalance] = useState<string>("0")
  const [joinPop, setJoinPop] = useState<boolean>(false)

  const [cards, setCards] = useState<any>([]);
  const [withDrawAmount, setWithDrawAmount] = useState<string>("0")


  useEffect(() => {
    init()
  }, [account])

  const init = () => {
    getUserInfo()
  }

  const getUserInfo = async () => {
    try {
      let data = await babyCardContract?.getUserInfo(account);
      console.log("data getUserInfo", data)
      setCards(data.cards)
      setAccountBalance(data.balance.toString());
      setWithDrawAmount(data.withdrawAmount.toString());
    } catch (error) {
      setCards([])
    }
  }

  const sendBuyCard = async () => {

    let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
    const allowance: any = await usdtErc20?.allowance(account, BabyCardAddr);
    const decimals: any = await usdtErc20?.decimals()
    setLoading(true)
    setLoadingState("loading")
    setLoadingText(`${t("TransactionPacking")}`)
    let flag

    if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(sendAmount, decimals)) && !flag) {
      sendApprove(usdtErc20, BabyCardAddr, sendBuyCard)
    } else {
      setLoadingState("loading")
      setLoadingText(`${t("TransactionPacking")}`)
      let type

      if (sendAmount == "100") {
        type = 0
      } else if (sendAmount == "500") {
        type = 1
      } else if (sendAmount == "1000") {
        type = 2
      } else if (sendAmount == "1500") {
        type = 3
      }
      try {
        let info = await routerContract?.getAmountsOut(toTokenValue(new BigNumber(sendAmount).multipliedBy(10).multipliedBy(70).dividedBy(10000).toString(), decimals), [usdtAddr, tokenkAddr])
        console.log("sendJoin info", info, info.toString(), info[1].toString())
        const gas: any = await babyCardContract?.estimateGas.buyCard(type, info[1].toString(), { from: account })
        console.log("sendJoin gas", gas)
        const response = await babyCardContract?.buyCard(type, info[1].toString(), {
          from: account,
          gasLimit: gas.mul(105).div(100)
        });

        let provider = new ethers.providers.Web3Provider(library.provider);

        let receipt = await provider.waitForTransaction(response.hash);
        if (receipt !== null) {
          if (receipt.status && receipt.status == 1) {
            init()
            setJoinPop(false)
            setSendAmount("")
            setChange(!change)
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

  const sendWithdraw = async () => {

    setLoading(true)
    setLoadingState("loading")
    setLoadingText(`${t("TransactionPacking")}`)
    try {
      const gas: any = await babyCardContract?.estimateGas.withdraw({ from: account })
      console.log("sendJoin gas", gas)
      const response = await babyCardContract?.withdraw({
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
      console.log("sendJoin err", err)
      sendLoadingErr()
    }
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

  const BonusValue = (item: any) => {
    let rule = {
      ratio: 1,
      multiple: 2
    };
    // if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(100, 18))) {
    //   rule = incomeRule[0]
    // } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(500, 18))) {
    //   rule = incomeRule[1]
    // } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(1000, 18))) {
    //   rule = incomeRule[2]
    // } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(1500, 18))) {
    //   rule = incomeRule[3]
    // }
    console.log(rule)
    const timeNow = Math.floor(new Date().getTime() / 1000 / Number(dayTime));
    // amount * 倍数 - (income + (nowIndex - settleDayIndex) * 每天收益)
    let amount1 = new BigNumber(item.amount.toString()).multipliedBy(rule.multiple).minus(item.income.toString()).toString()
    let amount3 = new BigNumber(new BigNumber(timeNow).minus(item.settleDayIndex.toString()).toString()).multipliedBy(new BigNumber(item.amount.toString()).multipliedBy(rule.ratio).dividedBy(100).toString()).toString()
    let returnAmount = new BigNumber(amount1).minus(amount3).toString()

    if (!new BigNumber(returnAmount).isGreaterThan(0)) {
      returnAmount = "0"
    }

    return fromTokenValue(returnAmount, 18, 3)
  }

  const ruleIcon = (item: any) => {
    let icon
    if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(100, 18))) {
      icon = <img className=' w-8 h-8' src={startIcon} alt="" />
    } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(500, 18))) {
      icon = <img className=' w-8 h-8' src={moonIcon} alt="" />
    } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(1000, 18))) {
      icon = <img className=' w-8 h-8' src={earthIcon} alt="" />
    } else if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(1500, 18))) {
      icon = <img className=' w-8 h-8' src={sunIcon} alt="" />
    }

    return icon;
  }

  return (<>
    <HeadBar />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <Dialog
        open={joinPop}
        onClose={() => {
          setJoinPop(false)
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: 300,
            maxWidth: '80%',
            background: '#fff',
          }
        }}
        maxWidth="md"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <div>
            <p className=" font-bold text-xl mainTextColor mb-2  ">参与铸造宝贝卡牌</p>
          </div>
          <div>
            <div>
              <p className=' text-sm'>
                {t("ParticipateInMarketMakingAmount")}: <span className='font-bold text-xl '>{sendAmount} </span> <span className=' text-sm ml-1 font-bold '>USDT</span>
              </p>
            </div>
          </div>

          <div className=" mt-5  text-center">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (sendAmount == "") {
                    return
                  }
                  sendBuyCard()
                }}
              > {t("confirm")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <div className='bg-white rounded-2xl  mt-32  mx-3 mb-5 p-3'>
        <div className='flex text-center'>
          <div className=' flex-1'>
            <p className=' text-sm text-gray-400'>USDT {t("walletBalance")}</p>
            <p className=' font-bold text-xl leading-loose'>
              {
                usdtAddr && account && <TokenBalance token={usdtAddr} addr={account + ""} change={change} decimalPlaces={2} />
              }
            </p>
          </div>
          <div className=' flex-1'>
            <p className=' text-sm text-gray-400'>USDT 复消余额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(accountBalance, 18, 2)}</p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className='mainTextColor font-bold'>宝贝卡牌种类, <span className=' text-sm  font-normal'>让共识世界更有趣</span></div>
        <div className=' flex py-3'>
          <div className=' flex-1 flex flex-wrap'>
            <div className=' w-1/2'>
              <p className=' text-center leading-10'>
                <span onClick={() => {
                  setSendAmount("100")
                }} className={sendAmount == "100" ? "selectAmount" : "unSelectAmount"}> 100</span>
              </p>
            </div>
            <div className=' w-1/2'>
              <p className=' text-center leading-10'>
                <span onClick={() => {
                  setSendAmount("500")
                }} className={sendAmount == "500" ? "selectAmount" : "unSelectAmount"}> 500</span>
              </p>
            </div>
            <div className=' w-1/2'>
              <p className=' text-center leading-10'>
                <span onClick={() => {
                  setSendAmount("1000")
                }} className={sendAmount == "1000" ? "selectAmount" : "unSelectAmount"}> 1000</span>
              </p>
            </div>
            <div className=' w-1/2'>
              <p className=' text-center leading-10'>
                <span onClick={() => {
                  setSendAmount("1500")
                }} className={sendAmount == "1500" ? "selectAmount" : "unSelectAmount"}> 1500</span>
              </p>
            </div>

          </div>
          <div className=' flex-1'>
            <p className=' text-center' style={{
              lineHeight: "80px"
            }}>
              <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (new BigNumber(sendAmount).isZero() || sendAmount == "") {
                    setLoading(true)
                    setLoadingState("error")
                    setLoadingText("请选择卡牌类型")
                    setTimeout(() => {
                      setLoadingState("")
                      setLoading(false)
                    }, 2000);
                    return
                  }
                  setJoinPop(true)
                }}
              >参与铸造 </span>
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <div className='w-2/3'>
            <div className='text-center'>
              <p className=' text-gray-400 '>资金池</p>
              <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(withDrawAmount, 18, 3)}UDST</p>
            </div>
          </div>
          <div className='w-1/3'>
            <p className=' text-center' style={{ lineHeight: "60px" }}>
              <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendWithdraw()
                }}
              >提现 </span>
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <p className='mainTextColor font-bold w-1/2 '> {t("depositRecord")}</p>
          <p className='mainTextColor font-bold w-1/2 '>分红值</p>
        </div>

        <div className=' pt-2 pb-4 ' style={{
          maxHeight: "330px",
          overflow: 'scroll'
        }} >
          {
            cards && cards.map((item: any, index: number) => {
              return <div className="rounded-md border p-1 m-1 flex leading-8 " key={index}>
                <div className=' w-1/2 flex'>
                  {ruleIcon(item)}
                  <p className=' pl-2'><span className='mainTextColor'>{fromTokenValue(item.amount.toString(), 18, 3)}</span></p>
                </div>
                <div className=' w-1/2'>
                  <p><span className='mainTextColor'>{BonusValue(item)}</span></p>
                </div>
              </div>
            })
          }
        </div>
      </div>
    </div>
  </>
  )
}

export default Card