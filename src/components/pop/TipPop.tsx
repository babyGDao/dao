
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FailIcon from '../../image/fail.png'
import successIcon from '../../image/success.png'
import loadingIcon from '../../image/loading.png'
interface OpenStatus {
    open: boolean,
    setOpen: Function,
    loadingText: string,
    loadingState: string
}

export default function TipPop({ open, setOpen, loadingText, loadingState }: OpenStatus) {

    return <Dialog
        open={open}
        sx={{
            '& .MuiDialog-paper': {
                width: 200,
                maxWidth: '80%',
                background: '#fff',
            }
        }}
        maxWidth="md"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogContent>
            <div >
                {
                    loadingState == "loading" && <img style={{
                        margin: "0 auto"
                    }}  className=' w-8 h-8 animate-spin' src={loadingIcon} alt="" />
                }

                {
                    loadingState == "success" && <img style={{
                        margin: "0 auto"
                    }}  className=' w-8 h-8' src={successIcon} alt="" />
                }

                {
                    loadingState == "error" && <img style={{
                        margin: "0 auto"
                    }} className=' w-8 h-8' src={FailIcon} alt="" />
                }
            </div>
            <div >
                <p className='break-words text-sm text-center'>{loadingText}  </p>
            </div>
        </DialogContent>
    </Dialog>
}