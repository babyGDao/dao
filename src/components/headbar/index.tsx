import { useWeb3React } from '@web3-react/core';
import { formatAccount } from '../../utils/formatting';
import walletIcon from '../../image/wallet.png'
import logo from '../../image/logo.png'
import { cardIcon, communityIcon, ecologyIcon, enusIcon, enznIcon, homeIcon, labor5Icon, labor6Icon, labor7Icon, languageIcon, level0Icon, level1Icon, level2Icon, level3Icon, level4Icon, level5Icon, level6Icon, level7Icon, menuIcon, planIcon, wealthIcon } from '../../image';
import Drawer from '@mui/material/Drawer';
import { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useNavigate, useParams } from 'react-router-dom';
import TipPop from '../pop/TipPop';
import { useTranslation } from 'react-i18next';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import i18n from '../../i18n';
import { useBabyCardContract, useCommunityNetContract } from '../../hooks/useContract';
import { AddressZero } from '@ethersproject/constants'
import BigNumber from "bignumber.js";

declare const window: Window & { ethereum: any, web3: any };

interface IHeadBar {
  setOpen?: Function
  ipoChange?: Boolean
  isRegister?: Boolean
}

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""
const communityAddr = process.env.REACT_APP_CONTRACT_COMMUNITY + ""

const TopAddr = process.env.REACT_APP_TOPINVITER + ""
const BabyCardAddr = process.env.REACT_APP_CONTRACT_BABYCARD + ""

function HeadBar({ setOpen, ipoChange, isRegister }: IHeadBar) {
  const { t } = useTranslation()
  const { account } = useWeb3React();
  const communityContract = useCommunityNetContract(communityAddr);
  const babyCardContract = useBabyCardContract(BabyCardAddr)

  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const navigate = useNavigate();
  const params = useParams()
  const [isTopInviter, setIsTopInviter] = useState<boolean>(false)
  const [isHaveInviter, setIsHaveInviter] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const connectWallet = () => {
    window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: process.env.REACT_APP_NET_CHAIN_ID }] })
      .then(() => {
        if (window.ethereum) {
          console.log("switch chain", process.env.REACT_APP_NET_CHAIN_ID, new Date())
          window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(() => {
              console.log('Please connect to MetaMask.');
            })
            .catch((error: any) => {
              if (error.code === 4001) {
                console.log('Please connect to MetaMask.');
              } else {
                console.error(error);
              }
            });
        } else {
          alert('Please confirm that you have installed the Metamask wallet.');
        }
      }).catch((error: Error) => {
        const params = [{
          chainId: process.env.REACT_APP_NET_CHAIN_ID,
          chainName: process.env.REACT_APP_Net_Name,
          nativeCurrency: {
            name: process.env.REACT_APP_NET_SYMBOL,
            symbol: process.env.REACT_APP_NET_SYMBOL,
            decimals: 18
          },
          rpcUrls: [process.env.REACT_APP_NET_URL],
          blockExplorerUrls: [process.env.REACT_APP_NET_SCAN]
        }];
        window.ethereum.request({ method: 'wallet_addEthereumChain', params })
          .then(() => {
            if (window.ethereum) {
              console.log("add chain", process.env.REACT_APP_NET_CHAIN_ID)
            } else {
              alert('Please confirm that you have installed the Metamask wallet.');
            }
          }).catch((error: Error) => console.log("Error", error.message))
      })
  }

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openEcology, setOpenEcology] = useState(false);
  const [scale, setScale] = useState<string>("0")
  const [isLabor, setIsLabor] = useState<boolean>(false)

  const handleClick = (type: string) => {
    if (type == "language") {
      setOpenLanguage(!openLanguage);
    } else if (type == "ecology") {
      setOpenEcology(!openEcology);
    }
  };

  useEffect(() => {
    getScale()
  }, [ipoChange])

  useEffect(() => {
    init()
  }, [isRegister])

  const getScale = async () => {
    // let data = await communityContract?.scale("0x323cd466500e66EeAfA1ca901b09f638bD0f50Ce")
    // let data = await communityContract?.scale(account)
    // console.log("data communityContract getScale", data.toString())
    // setScale(data.toString())
    if (window.location.href.indexOf("card") == -1) {
      return
    }

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
    return <img width={32} className=' mr-1' src={Icon} alt="" />
  }

  useEffect(() => {
    init()
  }, [window.location.href, account])

  const init = async () => {
    getScale();
    if (window.location.href.indexOf("ipo") != -1) {
      return
    } else {
      try {
        let isTopInviterData
        if (account == TopAddr) {
          setIsTopInviter(true)
          isTopInviterData = true;
        } else {
          setIsTopInviter(false)
          isTopInviterData = false;
        }
        let dataInviter = await communityContract?.inviter(account);

        let isHaveInviterData
        if (dataInviter == AddressZero) {
          isHaveInviterData = false
          setIsHaveInviter(false)
        } else {
          isHaveInviterData = true
          setIsHaveInviter(true)
        }
        if (params.shareAddress) {
        } else {
          if (isTopInviterData || isHaveInviterData) {
            console.log(12)
          } else {
            navigate("/home")
          }
        }
      } catch (error) {
        navigate("/home")
      }
    }
  }

  const navLink = (url: string) => {
    setMenuOpen(false)

    if (isHaveInviter || isTopInviter || url == "/ipo") {
      console.log("222")
      navigate(url)
    } else {
      navigate("/home")
      if (setOpen) setOpen(true)
      return
    }
  }

  const changeLanguage = (changeLanguageStr: string) => {
    setMenuOpen(false)
    i18n.changeLanguage(changeLanguageStr)
  }

  return (
    <div className=' border-b border-gray-300 z-50 backdrop-blur-xl fixed top-0 left-0 w-full h-16 px-4'>
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />
      <div className='container text-black flex justify-between items-center mx-auto h-full'>
        <div className='logo'>
          <div className=' flex'>
            <img className=' mr-2 ' width={30} height={30} src={menuIcon}
              onClick={() => {
                setMenuOpen(true)
              }} alt=''
            />
            <Drawer anchor={"left"}
              open={menuOpen}
              onClose={() => {
                setMenuOpen(false)
              }}
            >
              <List sx={{ width: '210px', maxWidth: 360, bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                  <ListSubheader className=' flex py-3 border-b' component="div" id="nested-list-subheader">
                    <img className=' mr-2 rounded-full ' width={30} height={30} src={logo} alt='' />
                    <span className=' leading-8 font-bold mainTextColor text-xl'>Baby DAO</span>
                  </ListSubheader>
                }
              >
                <ListItemButton onClick={() => {
                  navLink("/home")
                }}>
                  <img width={20} height={20} src={homeIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={`${t("home")}`} />
                </ListItemButton>

                <ListItemButton onClick={() => {
                  navLink("/ipo")
                }}>
                  <img width={20} height={20} src={planIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={"S3 申请"} />
                </ListItemButton>

                <ListItemButton onClick={() => { handleClick("ecology") }}>
                  <img width={20} height={20} src={ecologyIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={"宝贝生态"} />
                  {openEcology ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={openEcology} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => {
                      navLink("/card");
                    }}>
                      <img width={20} height={20} src={cardIcon} alt='' />
                      <ListItemText className=' ml-2 ' primary={"宝贝卡牌"} />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItemButton onClick={() => {
                  navLink("/community")
                }}>
                  <img width={20} height={20} src={communityIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={`${t("myCommunity")}`} />
                </ListItemButton>
                <ListItemButton onClick={() => {
                  navLink("/wealth")
                }}>
                  <img width={20} height={20} src={wealthIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={"宝贝财富"} />
                </ListItemButton>
                <ListItemButton onClick={() => { handleClick("language") }}>
                  <img width={20} height={20} src={languageIcon} alt='' />
                  <ListItemText className=' ml-2 ' primary={`${t("Multilingualswitching")}`} />
                  {openLanguage ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={openLanguage} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => {
                      changeLanguage("zh")
                    }}>
                      <img width={20} height={20} src={enznIcon} alt='' />
                      <ListItemText className=' ml-2 ' primary={`${t("Chinese")}`} />
                    </ListItemButton>

                    <ListItemButton sx={{ pl: 4 }} onClick={() => {
                      changeLanguage("en")
                    }}>
                      <img width={20} height={20} src={enusIcon} alt='' />
                      <ListItemText className=' ml-2 ' primary={`${t("English")}`} />
                    </ListItemButton>
                  </List>
                </Collapse>
              </List>
            </Drawer>
            <span className=' leading-8 font-bold mainTextColor text-xl'>Baby Dao</span>
          </div>
        </div>

        <div className=' relative flex items-center justify-center  cursor-pointer'>
          {/* {
            window.location.href.indexOf("card") != -1 ? levelHtml() : <></>
          } */}

          {
            account ? <span className='ring-1 ring-black rounded-full px-2 py-1 inline-flex whitespace-nowrap items-center justify-center mr-3'  >
              {formatAccount(account, 5, 5)}
            </span> : <span className='ring-1 ring-black rounded-full px-2 py-1 inline-flex whitespace-nowrap items-center justify-center mr-3' onClick={() => { connectWallet() }}>
              <img width={25} className=' mr-3' src={walletIcon} alt="" />
              Connect Wallet
            </span>
          }
        </div>
      </div>
    </div>
  )
}

export default HeadBar;