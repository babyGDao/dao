import { Dialog, DialogContent } from '@mui/material'
import { useEffect, useState } from 'react'
import { getProviderOrSigner, useBabyCardContract, useCommunityNetContract, useRouterContract } from '../../hooks/useContract'
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
import { earthIcon, labor5Icon, labor6Icon, labor7Icon, level0Icon, level1Icon, level2Icon, level3Icon, level4Icon, level5Icon, level6Icon, level7Icon, moonIcon, startIcon, sunIcon, upLevelIcon } from '../../image'

const ethers = require('ethers');

const BabyCardAddr = process.env.REACT_APP_CONTRACT_BABYCARD + ""
const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
const tokenkAddr = process.env.REACT_APP_TOKEN_TOKEN + ""
const dayTime = process.env.REACT_APP_DAY + ""
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + ""

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

const rule = {
  ratio: 1,
  multiple: 2
};

const openCardList = {
  100: true,
  500: true,
  1000: true,
  1500: false,
  levelUp: false
}

function Card() {
  const { t } = useTranslation()
  const babyCardContract = useBabyCardContract(BabyCardAddr)
  const communityContract = useCommunityNetContract(communityAddr);
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
  const [withDrawAmount, setWithDrawAmount] = useState<string>("0");

  const [lastCardAmount, setLastCardAmount] = useState<string>("0");
  const [upLevel, setUpLevel] = useState<boolean>(false);
  const [upLevelPop, setUpLevelPop] = useState<boolean>(false);

  const [teamAmount, setTeamAmount] = useState<string>("0");

  const [scale, setScale] = useState<string>("0")
  const [isLabor, setIsLabor] = useState<boolean>(false);
  const [detailPop, setDetailPop] = useState<boolean>(false);
  useEffect(() => {
    init()
  }, [account])

  const init = () => {
    getUserInfo()
    getScale()
  }

  const getScale = async () => {
    try {
      let data = await Promise.all([await babyCardContract?.getUserInfo(account), await communityContract?.scale(account)])
      setScale(data[0].scale.toString());
      if (new BigNumber(data[0].scale.toString()).isEqualTo(data[1].toString()) && new BigNumber(data[1].toString()).isGreaterThanOrEqualTo(5)) {
        setIsLabor(true)
      } else {
        setIsLabor(false)
      }
    } catch (error) {
      setScale("0")
      setIsLabor(false)
    }
  }


  const arrReverse = (arr: any) => {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
      newArr.unshift(arr[i]);
    }
    return newArr;
  }

  const getUserInfo = async () => {
    try {
      let data = await babyCardContract?.getUserInfo(account);
      console.log("data getUserInfo", data)
      if (data.cards.length > 1) {
        setCards(arrReverse(data.cards))
      } else {
        setCards(data.cards)
      }
      setTeamAmount(data.inviteValue.toString())
      if (data.cards.length > 0) {
        let lastCardData = data.cards[data.cards.length - 1];
        setLastCardAmount(lastCardData.amount.toString());
        const timeNow = Math.floor(new Date().getTime() / 1000 / Number(dayTime));
        let amount1 = new BigNumber(lastCardData.amount.toString()).multipliedBy(rule.multiple).minus(lastCardData.income.toString()).toString()
        // let amount3 = new BigNumber(new BigNumber(timeNow).minus(lastCardData.settleDayIndex.toString()).toString()).multipliedBy(new BigNumber(lastCardData.amount.toString()).multipliedBy(rule.ratio).dividedBy(100).toString()).toString()
        // let returnAmount = new BigNumber(amount1).minus(amount3).toString()

        if (new BigNumber(amount1).isZero()) {
          setUpLevel(false)
        } else {
          setUpLevel(true)
        }
      } else {
        setUpLevel(false)
      }
      setAccountBalance(data.balance.toString());
      setWithDrawAmount(data.withdrawAmount.toString());
    } catch (error) {
      setUpLevel(false)
      setCards([])
      setLastCardAmount("0")
    }
  }

  const sendBuyCard = async (buyType: boolean) => {
    let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
    const allowance: any = await usdtErc20?.allowance(account, BabyCardAddr);
    const decimals: any = await usdtErc20?.decimals()
    setLoading(true)
    setLoadingState("loading")
    setLoadingText(`${t("TransactionPacking")}`)
    let flag
    let dataAmount;
    if (buyType) {
      dataAmount = new BigNumber(sendAmount).minus(new BigNumber(lastCardAmount).dividedBy(10 ** 18).toString()).toString();
    } else {
      dataAmount = sendAmount
    }
    console.log("dataAmount", dataAmount)

    if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(dataAmount, decimals)) && !flag) {
      sendApprove(usdtErc20, BabyCardAddr, sendBuyCard, buyType)
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
        let info = await routerContract?.getAmountsOut(toTokenValue(new BigNumber(dataAmount).multipliedBy(8).multipliedBy(70).dividedBy(10000).toString(), decimals), [usdtAddr, tokenkAddr])
        const gas: any = await babyCardContract?.estimateGas.buyCard(type, buyType, info[1].toString(), { from: account });

        const response = await babyCardContract?.buyCard(type, buyType, info[1].toString(), {
          from: account,
          gasLimit: gas.mul(105).div(100)
        });

        let provider = new ethers.providers.Web3Provider(library.provider);

        let receipt = await provider.waitForTransaction(response.hash);
        if (receipt !== null) {
          if (receipt.status && receipt.status == 1) {
            init()
            setJoinPop(false)
            setUpLevelPop(false)
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

  const sendApprove = async (approveContract: any, approveAddress: string, send: Function, leaveType?: any) => {
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
    const timeNow = Math.floor(new Date().getTime() / 1000 / Number(dayTime));
    let amount1 = new BigNumber(item.amount.toString()).multipliedBy(rule.multiple).minus(item.income.toString()).toString()
    // let amount3 = new BigNumber(new BigNumber(timeNow).minus(item.settleDayIndex.toString()).toString()).multipliedBy(new BigNumber(item.amount.toString()).multipliedBy(rule.ratio).dividedBy(100).toString()).toString()
    // let returnAmount = new BigNumber(amount1).minus(amount3).toString()
    let returnAmount = new BigNumber(amount1).toString()

    if (!new BigNumber(returnAmount).isGreaterThan(0)) {
      returnAmount = "0"
    }

    return fromTokenValue(returnAmount, 18, 3)
  }

  const ruleIcon = (amount: any) => {
    let icon

    // if (new BigNumber(item.amount.toString()).isEqualTo(toTokenValue(100, 18))) {
    if (new BigNumber(amount).isEqualTo(toTokenValue(100, 18))) {
      icon = <img className=' w-8 h-8' src={startIcon} alt="" />
    } else if (new BigNumber(amount).isEqualTo(toTokenValue(500, 18))) {
      icon = <img className=' w-8 h-8' src={moonIcon} alt="" />
    } else if (new BigNumber(amount).isEqualTo(toTokenValue(1000, 18))) {
      icon = <img className=' w-8 h-8' src={earthIcon} alt="" />
    } else if (new BigNumber(amount).isEqualTo(toTokenValue(1500, 18))) {
      icon = <img className=' w-8 h-8' src={sunIcon} alt="" />
    }

    return icon;
  }

  const levelHtml = () => {
    let Icon
    if (isLabor) {
      if (Number(scale) == 5) {
        Icon = labor5Icon
      } else if (Number(scale) == 6) {
        Icon = labor6Icon
      } else if (Number(scale) == 7) {
        Icon = labor7Icon
      }
    } else {
      if (Number(scale) == 0) {
        Icon = level0Icon
      } else if (Number(scale) == 1) {
        Icon = level1Icon
      } else if (Number(scale) == 2) {
        Icon = level2Icon
      } else if (Number(scale) == 3) {
        Icon = level3Icon
      } else if (Number(scale) == 4) {
        Icon = level4Icon
      } else if (Number(scale) == 5) {
        Icon = level5Icon
      } else if (Number(scale) == 6) {
        Icon = level6Icon
      } else if (Number(scale) == 7) {
        Icon = level7Icon
      }
    }
    return <img width={50} className=' mr-1' src={Icon} alt="" />
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
                金额: <span className='font-bold text-xl '>{sendAmount} </span> <span className=' text-sm ml-1 font-bold '>USDT</span>
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
                  sendBuyCard(false)
                }}
              > {t("confirm")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={upLevelPop}
        onClose={() => {
          setUpLevelPop(false)
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
            <p className=" font-bold text-xl mainTextColor mb-2  ">升级铸造宝贝卡牌</p>
          </div>
          <div>
            <div className='flex flex-wrap'>

              {
                new BigNumber(lastCardAmount).isLessThan(new BigNumber(500).multipliedBy(10 ** 18).toString()) ? <div className=' flex-1 m-auto mb-1' >
                  <div className={sendAmount == "500" ? "selectAmount flex" : "unSelectAmount flex"} onClick={() => {
                    setSendAmount("500")
                  }}>
                    {ruleIcon(toTokenValue(500, 18))}
                    <p className=' w-10 text-center leading-8'> 500</p>
                  </div>
                </div> : <></>
              }

              {
                new BigNumber(lastCardAmount).isLessThan(new BigNumber(1000).multipliedBy(10 ** 18).toString()) ? <div className=' flex-1 m-auto mb-1' >
                  <div className={sendAmount == "1000" ? "selectAmount flex" : "unSelectAmount flex"} onClick={() => {
                    setSendAmount("1000")
                  }}>
                    {ruleIcon(toTokenValue(1000, 18))}
                    <p className=' w-10 text-center leading-8'> 1000</p>
                  </div>
                </div> : <></>
              }

              {
                new BigNumber(lastCardAmount).isLessThan(new BigNumber(1500).multipliedBy(10 ** 18).toString()) ? <div className=' flex-1 m-auto mb-1' >
                  <div className={sendAmount == "1500" ? "selectAmount flex" : "unSelectAmount flex"} onClick={() => {
                    setSendAmount("1500")
                  }}>
                    {ruleIcon(toTokenValue(1500, 18))}
                    <p className=' w-10 text-center leading-8'> 1500</p>
                  </div>
                </div> : <></>
              }

            </div>
          </div>

          <div className=" mt-5  text-center">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (sendAmount == "" || new BigNumber(sendAmount).multipliedBy(10 ** 18).isLessThanOrEqualTo(lastCardAmount)) {
                    return
                  }
                  sendBuyCard(true)
                }}
              > {t("confirm")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog
        open={detailPop}
        onClose={() => {
          setDetailPop(false)
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
            <p className=" font-bold text-xl mainTextColor mb-2  ">宝贝卡牌说明</p>
          </div>
          <div>
            <p className=' indent-8'>S0、S1、S2账户铸造100 USDT卡牌就能获得奖励；S3、S4账户铸造500USDT卡牌就能获得奖励；S5及以上账户必须铸造1000 USDT 卡牌或者1500 USDT卡牌才能获得奖励。每期BABY宝贝卡牌生态结束时，针对参与铸造但未达成1张BABY宝贝卡牌的账户尚未回本部分按1.2倍财富奖励。以SOD实时价格，每日（8：00）金本位补偿SOD，按照300天周期平均固定。</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className='bg-white rounded-2xl  mt-32  mx-3 mb-5 p-3 flex'>
        <div className=' flex-1 flex '>
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
        <div className='flex'>
          <div className='flex-1 mainTextColor font-bold'>
            BABY宝贝卡牌种类
            {/* , <span className=' text-sm  font-normal'>让共识世界更有趣</span> */}
          </div>
          <div>
            <p className=' mainTextColor font-bold cursor-pointer pr-4' onClick={() => {
              setDetailPop(true);
            }}>说明</p>
          </div>
        </div>

        <div className='  py-3'>
          <div className='  flex flex-wrap'>
            {
              new BigNumber(lastCardAmount).isLessThanOrEqualTo(new BigNumber(100).multipliedBy(10 ** 18).toString()) && openCardList[100] ?
                <div className=' w-1/2  mb-1' >
                  <div className={sendAmount == "100" ? "selectAmount flex m-auto" : "unSelectAmount flex m-auto"} onClick={() => {
                    setSendAmount("100")
                  }}>
                    {ruleIcon(toTokenValue(100, 18))}
                    <p className=' w-10 text-center leading-8'> 100</p>
                  </div>
                </div> : <div className=' w-1/2  mb-1' >
                  <div className="selectAmountDisable m-auto flex">
                    {ruleIcon(toTokenValue(100, 18))}
                    <p className='w-10 text-center leading-8'> 100</p>
                  </div>
                </div>
            }

            {
              new BigNumber(lastCardAmount).isLessThanOrEqualTo(new BigNumber(500).multipliedBy(10 ** 18).toString()) && openCardList[500] ?
                <div className=' w-1/2 mb-1' >
                  <div className={sendAmount == "500" ? "selectAmount m-auto flex" : "unSelectAmount m-auto flex"} onClick={() => {
                    setSendAmount("500")
                  }}>
                    {ruleIcon(toTokenValue(500, 18))}
                    <p className=' w-10 text-center leading-8'> 500</p>
                  </div>
                </div> : <div className=' w-1/2 mb-1' >
                  <div className="selectAmountDisable flex  m-auto">
                    {ruleIcon(toTokenValue(500, 18))}
                    <p className=' w-10 text-center leading-8'> 500</p>
                  </div>
                </div>
            }


            {
              new BigNumber(lastCardAmount).isLessThanOrEqualTo(new BigNumber(1000).multipliedBy(10 ** 18).toString()) && openCardList[1000] ?
                <div className=' w-1/2 mb-1' >
                  <div className={sendAmount == "1000" ? "selectAmount flex m-auto " : "unSelectAmount flex m-auto "} onClick={() => {
                    setSendAmount("1000")
                  }}>
                    {ruleIcon(toTokenValue(1000, 18))}
                    <p className=' w-10 text-center leading-8'> 1000</p>
                  </div>
                </div> : <div className=' w-1/2 mb-1' >
                  <div className="selectAmountDisable flex m-auto">
                    {ruleIcon(toTokenValue(1000, 18))}
                    <p className=' w-10 text-center leading-8'> 1000</p>
                  </div>
                </div>
            }

            {
              new BigNumber(lastCardAmount).isLessThanOrEqualTo(new BigNumber(1500).multipliedBy(10 ** 18).toString()) && openCardList[1500] ?
                <div className=' w-1/2  mb-1' >
                  <div className={sendAmount == "1500" ? "selectAmount flex m-auto" : "unSelectAmount flex m-auto"} onClick={() => {
                    setSendAmount("1500")
                  }}>
                    {ruleIcon(toTokenValue(1500, 18))}
                    <p className=' w-10 text-center leading-8'> 1500</p>
                  </div>
                </div> : <div className=' w-1/2  mb-1' >
                  <div className="selectAmountDisable flex m-auto">
                    {ruleIcon(toTokenValue(1500, 18))}
                    <p className=' w-10 text-center leading-8'> 1500</p>
                  </div>
                </div>
            }
          </div>
          <div className=' flex-1'>
            <p className=' text-center  mt-2'>
              {
                !upLevel ? <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
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
                >参与铸造 </span> : <span className=' border-solid border rounded-3xl py-2 px-4 text-gray-400 font-bold  border-gray-400 cursor-pointer'> 参与铸造 </span>
              }
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className='flex '>
          <div className=' w-1/2'>
            <p className=' text-gray-400 '>个人铸造金额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>
              {
                !upLevel ? "0.00" : fromTokenValue(lastCardAmount, 18, 2)
              }
              <span className=' text-sm '>UDST</span></p>
          </div>
          <div className=' w-1/2'>
            <p className=' text-gray-400 '>社区铸造金额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>
              {fromTokenValue(teamAmount, 18, 2)}
              <span className=' text-sm '>UDST</span></p>
          </div>
        </div>
        <div className=' flex'>
          <div className='w-1/2'>
            <div className=''>
              <div className='flex'>
                <p className=' text-gray-400 pr-1' style={{ lineHeight: "50px" }}>奖金池</p>
                {
                  levelHtml()
                }
              </div>
              <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(withDrawAmount, 18, 2)} <span className=' text-sm '>UDST</span> </p>
            </div>
          </div>
          <div className='w-1/2'>
            <p className=' ' style={{ lineHeight: "60px" }}>
              <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendWithdraw()
                }}
              >提现 </span>
            </p>
          </div>
        </div>
      </div>

      {/* <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <p className=' indent-8'> 每期BABY宝贝卡牌生态结束时，针对参与铸造但未达成1张BABY宝贝卡牌的账户尚未回本部分按1.2倍财富奖励。以SOD实时价格，每日（8：00）金本位补偿SOD，按照300天周期平均固定。</p>
      </div> */}
      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <p className='mainTextColor font-bold w-1/2 pl-11'> {t("depositRecord")}</p>
          <p className='mainTextColor font-bold w-1/2 pr-5'> 分红值</p>
        </div>
        <div className=' pt-2 pb-4 ' style={{
          maxHeight: "330px",
          overflow: 'scroll'
        }} >
          {
            cards && cards.map((item: any, index: number) => {
              return <div className="rounded-md border p-1 flex leading-8 mb-2 " key={index}>
                <div className=' w-1/2 flex'>
                  {ruleIcon(item.amount.toString())}
                  <p className=' pl-2'><span className='mainTextColor'>{fromTokenValue(item.amount.toString(), 18, 3)}</span></p>
                </div>
                <div className=' w-1/2 flex'>
                  <p className='flex-1'><span className='mainTextColor pr-2'>{BonusValue(item)}</span></p>
                  {
                    index == 0 && upLevel && new BigNumber(lastCardAmount).isLessThan(new BigNumber(1500).multipliedBy(10 ** 18).toString()) && openCardList.levelUp ? <img className=' w-8 h-8' src={upLevelIcon} alt="" onClick={() => {
                      setUpLevelPop(true)
                    }} /> : <></>
                  }
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