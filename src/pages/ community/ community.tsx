import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import TipPop from "../../components/pop/TipPop";
import { fromTokenValue } from "../../utils";
import copy from 'copy-to-clipboard';
import { formatAccount } from "../../utils/formatting";
import { copyIcon } from "../../image";
import HeadBar from "../../components/headbar";
import { useTranslation } from "react-i18next";
import { useCommunityNetContract } from "../../hooks/useContract";

const ethers = require('ethers');
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + "";
const link = process.env.REACT_APP_LINK + "";

function Community() {
  const { t } = useTranslation()

  const { account } = useWeb3React()
  const communityContract = useCommunityNetContract(communityAddr);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const [inviteAwardValue, setInviteAwardValue] = useState<string>("0")
  const [scaleAwardValue, setScaleAwardValue] = useState<string>("0")
  const [contributionAwardValue, setContributionAwardValue] = useState<string>("0")
  const [inviteCount, setInviteCount] = useState<string>("0")
  const [inviteTotalCount, setInviteTotalCount] = useState<string>("0")

  const getNodeInfo = async () => {
    try {
      let data = await communityContract?.nodeInfo(account);
      console.log("data getNodeInfo", data)
      setInviteAwardValue(data.inviteAwardValue.toString())
      setScaleAwardValue(data.scaleAwardValue.toString())
      setContributionAwardValue(data.contributionAwardValue.toString())
      setInviteCount(data.inviteCount.toString())
      setInviteTotalCount(data.inviteTotalCount.toString())
    } catch (error) {
      setInviteAwardValue("0")
      setScaleAwardValue("0")
      setContributionAwardValue("0")
      setInviteCount("0")
      setInviteTotalCount("0")
    }
  }

  useEffect(() => {
    init()
  }, [account])

  const init = () => {
    getNodeInfo()
  }

  return (<>
    <HeadBar />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <div className='bg-white rounded-2xl mt-32  mx-3 mb-5 p-3'>
        <div className='mainTextColor font-bold text-2xl flex  mb-2'>
          {t("shareLink")}:
          <div className=" flex mt-2" onClick={() => {
            copy(link + account + "");
            setLoading(true)
            setLoadingState("success")
            setLoadingText(`${t("copySuccessfully")}`)
            setTimeout(() => {
              setLoadingState("")
              setLoading(false)
            }, 2000);
          }}>
            <span className=' text-base mx-2 ' > {formatAccount(account, 6, 6)}</span>
            <img className="w-5 h-5" src={copyIcon} alt="" />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl mx-3 mb-5 px-3 py-5 '>
        <div className="pt-2 border-b-2 border-dashed pb-2">
          <div >
            <p className=" text-gray-400 text-sm">
              {t("PromoteUsers")}:
              <span className=" text-black text-base font-bold ml-2">{inviteCount}</span>
            </p>
          </div>
          <div >
            <p className=" text-gray-400 text-sm">
              {t("communityUser")}:
              <span className=" text-black text-base font-bold ml-2">{inviteTotalCount}</span>
            </p>
          </div>
        </div>
        <div>
          <p className=" indent-8 text-sm leading-6 p-2">
            S1、S2账户铸造100USDT卡牌就能获得奖励；S3、S4账户铸造500USDT卡牌就能获得奖励；S5及以上账户必须铸造1000USDT卡牌或者1500USDT卡牌才能获得奖励。
          </p>
        </div>
      </div>



      <div className='bg-white rounded-2xl mx-3 mb-5 px-3 py-5'>
        <div className=" flex">
          <p className=' leading-8  font-bold mainTextColor text-xl'> {t("myReward")}</p>
        </div>

        <div className="pt-1">
          <div >
            <p className=" text-gray-400 text-sm">
              {t("PromotionAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(inviteAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              {t("communityAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(scaleAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              {t("ContributionAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(contributionAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default Community