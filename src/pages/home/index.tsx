import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAddress, useCommunityNetContract, } from "../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import { AddressZero } from '@ethersproject/constants'
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import TipPop from "../../components/pop/TipPop";
import HeadBar from "../../components/headbar";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import { bannerIcon, bannerIcon1 } from "../../image";
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const ethers = require('ethers');
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + ""
const TopAddr = process.env.REACT_APP_TOPINVITER + ""

export default function Home({ }) {
  const { account, library } = useWeb3React()
  const params = useParams()
  const { t } = useTranslation()
  const communityContract = useCommunityNetContract(communityAddr);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const [isTopInviter, setIsTopInviter] = useState<boolean>(false)
  const [isHaveInviter, setIsHaveInviter] = useState<boolean>(false)
  const [loadingHome, setLoadingHome] = useState<boolean>(false)

  const [isRegister, setIsRegister] = useState<boolean>(false)

  const [shareAddr, setShareAddr] = useState<string>("")
  const [sharePop, setSharePop] = useState<boolean>(false)

  const [activeStep, setActiveStep] = useState(0);
  const images = [
    {
      label: 'bannerIcon',
      imgPath:bannerIcon,
    },
    
    
  ];

  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  useEffect(() => {
    setLoadingHome(false)
    init()

    if (params.shareAddress) {
      if (isAddress(params.shareAddress) && params.shareAddress !== AddressZero) {
        setShareAddr(params.shareAddress)
      }
    } else {
      setShareAddr("")
    }
  }, [account])

  const init = () => {
    getUserState()
  }

  const getUserState = async () => {
    try {
      let isTopInviterData
      if (account == TopAddr) {
        setIsTopInviter(true)
        isTopInviterData = true;
        setSharePop(false)
      } else {
        setIsTopInviter(false)
        isTopInviterData = false;
      }

      let dataInviter = await communityContract?.inviter(account);
      console.log("inviter", dataInviter)
      let isHaveInviterData
      if (dataInviter == AddressZero) {
        isHaveInviterData = false
        setIsHaveInviter(false)
      } else {
        setSharePop(false)
        isHaveInviterData = true
        setIsHaveInviter(true)
      }
      setLoadingHome(true)
    } catch (error) {
      setIsHaveInviter(false)
      setLoadingHome(true)
    }
  }

  // register
  const sendRegister = async () => {
    if (shareAddr == "" || !isAddress(shareAddr)) {
      setLoading(true)
      setLoadingState("error")
      setLoadingText(`${t("PleaseFillInTheCorrectAddress")}`)
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
      return
    }
    setLoading(true)
    setLoadingState("loading")
    setLoadingText(`${t("TransactionPacking")}`)
    try {
      const gas: any = await communityContract?.estimateGas.register(shareAddr, { from: account })
      const response = await communityContract?.register(shareAddr, {
        from: account,
        gasLimit: gas.mul(105).div(100)
      });
      let provider = new ethers.providers.Web3Provider(library.provider);

      let receipt = await provider.waitForTransaction(response.hash);
      if (receipt !== null) {
        if (receipt.status && receipt.status == 1) {
          setIsRegister(!isRegister);
          init()
          setSharePop(false)
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



  return <>
    <HeadBar setOpen={setSharePop} isRegister={isRegister} />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />
      <Dialog
        open={sharePop}
        onClose={() => {
          setSharePop(false)
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
            <p className=" font-bold text-xl mainTextColor mb-2  ">{t("inviteLink")}</p>
          </div>
          <TextField size='small'
            style={{
              width: "100%",
              height: "16px !important"
            }}
            placeholder={`${t("FillInThe")}`}
            value={shareAddr}
            onChange={(e) => {
              setShareAddr(e.target.value)
            }}
          />

          <div className=" mt-5  text-center">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendRegister()
                }}
              > {t("confirm")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className=" pt-32 pb-10 text-center  "  >

        <AutoPlaySwipeableViews
          axis={'x'}
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {images.map((step, index) => (
            <div key={step.label}>
              <Box
                component="img"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  width: '100%',
                  padding:"0px 10px"
                }}
                src={step.imgPath}
                // alt={step.label}
              />
            </div>
          ))}
        </AutoPlaySwipeableViews>
      </div>

      <div className=" mx-3 pb-10 text-gray-400">
        <p className="indent-8 pb-3">
          {t("home1")}
        </p>
        <p className="indent-8">
          {t("home2")}
        </p>
      </div>

    </div>
  </>

}