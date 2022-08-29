import { useState, useRef } from 'react'
import styled, { css, keyframes } from 'styled-components'
import TLDR from './TLDR-editor'
import { createReactEditorJS } from 'react-editor-js'
import SubmissionEdit from './submission-builder-2'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { fade_in, WarningMessage } from '../../common/common_styles'
import useWallet from '../../../../hooks/useWallet'
import useSubmissionEngine from '../../../../hooks/useSubmissionEngine'
import useCommon from '../../../../hooks/useCommon'



const CreateSubmissionContainer = styled.div`
display: flex;
position: relative;
flex-direction: column;
flex-wrap: wrap;
align-content: center;
align-items: stretch;
//justify-content: space-between;
background-color: #1e1e1e;
padding: 10px;
border: none;
border-radius: 10px;
height: none;
> * {
    margin-bottom: 15px;
    margin-top: 15px;
}
`

const SubmissionActionButtons = styled.div`
    width: fit-content;
    position: absolute;
    margin-left: auto;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`

const SubmitButton = styled.button`
    align-self: center;
    margin-left: auto;
    margin-right: 10px;
    border: 2px solid #22272e;
    border-radius: 100px;
    padding: 10px 15px 10px 15px;
    background-color: rgb(6, 214, 160);
    color: black;

    &:hover{
        color: black;
        background-color: rgba(6, 214, 160, 0.8);
        &::before{
            content: "save";
            position: absolute;
            border: none;
            background-color: #444c56;
            padding: 3px;
            border-radius: 4px;
            top: 0;
            color: lightgrey;
            transform: translate(-50%, -150%);
            animation: ${fade_in} 0.5s ease-in-out;

        }
    }


`
const CancelButton = styled.button`
    border: 2px solid #4d4d4d;
    color: grey;
    border-radius: 100px;
    padding: 10px 15px 10px 15px;
    background-color: transparent;
    margin-right: 10px;

    &:hover{
        color: #d3d3d3;
        background-color: rgba(34, 34, 46, 0.8);
        border: 2px solid #d3d3d3;
        &::before{
            content: "cancel";
            position: absolute;
            border: none;
            background-color: #1e1e1e;
            padding: 3px;
            border-radius: 4px;
            top: 0;
            color: lightgrey;
            transform: translate(-50%, -150%);
            animation: ${fade_in} 0.5s ease-in-out;

        }
    }
`

const SubmissionRequirements = styled.div`
    display: flex;
    flex-direction: column;
`

const EligibilityCheck = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    > p {
        margin: 0;
        margin-right: 20px;
    }
    > button {
        border: double 2px transparent;
        border-radius: 10px;
        background-image: linear-gradient(#141416,#141416), linear-gradient(to right,#e00f8e,#2d66dc);
        background-origin: border-box;
        background-clip: padding-box,border-box;
        box-shadow: 0 10px 30px rgb(0 0 0 / 30%), 0 15px 12px rgb(0 0 0 / 22%);
        padding: 3px 5px;
    }
`

const highlight = (props) => keyframes`
  0% {
    opacity: 0;
    transform: scale(1.0);

  }
  50% {
    opacity: 1 !important;
    transform: scale(1.7);
  }
  100% {
    opacity: 1 !important;
    transform: scale(1.0);
    display: visible;

  }
   
`;

const highlightAnimation = css`
  animation: ${highlight} 1s ease;
`;


const RestrictionStatus = styled.span`
    display: inline-block;
    &::after{
        font-family: 'Font Awesome 5 Free';
        margin-left: 20px;
        content: '${props => props.status ? "\f058" : "\f057"}';
        color: ${props => props.status ? 'rgb(6, 214, 160)' : 'grey'};
        font-weight: 900;
    }
    
   // animation: ${highlight} ${props => props.index * 0.9}s ease-in;
   //color: #1e1e1e;
    animation: ${highlight} 1s ease-in;
    animation-delay: ${props => props.index * 0.3}s;
   
`

const RestrictionStatusNotConnected = styled.span`
    display: inline-block;
    &::after{
        font-family: 'Font Awesome 5 Free';
        margin-left: 20px;
        content:  "\f057";
        color:  grey;
        font-weight: 900;
    }

`

/*
style={{marginLeft: '20px', color: !isWalletConnected ? 'grey' : (restriction.user_result ? '#06d6a0' : 'red') }}
icon={isUserEligible ? faCheckCircle : faTimesCircle}

*/

export default function SubmissionBuilder({ handleCloseDrawer, submitter_restrictions }) {
    const [TLDRImage, setTLDRImage] = useState(null)
    const [TLDRText, setTLDRText] = useState('')
    const [longFormValue, setLongFormValue] = useState(null)
    const { ens, contest_hash } = useParams();
    const { isWalletConnected, userSubmissions, restrictionResults, isUserEligible } = useSubmissionEngine(submitter_restrictions);
    const { walletConnect } = useWallet();
    const ReactEditorJS = createReactEditorJS();
    const editorCore = useRef(null);
    const [progress, setProgress] = useState(0);
    const { authenticated_post } = useCommon();
    const errorCheck = async () => {
        if (!TLDRText && !TLDRImage) {
            alert('at least one TLDR field required!')
            return true
        }
        else return false;
    }


    const handleClose = () => {
        if (TLDRImage || TLDRText) {
            if (window.confirm('you\'re changes will be lost. Do you want to proceed?')) {
                handleCloseDrawer();
            }
            else return
        }
        else {
            handleCloseDrawer();
        }
    }

    const handleSubmit = async () => {
        /*
                let tldr = {
                    tldr_text: TLDRText,
                    tldr_image: ''//TLDRImage.url
                }
        */

        let isError = await errorCheck();
        if (isError) return;
        let editorData = await editorCore.current.save();
        let submission = {
            tldr_text: TLDRText,
            tldr_image: TLDRImage != null ? TLDRImage.url : null,
            submission_body: editorData
        }
        let res = await authenticated_post('/creator_contests/create_submission', { ens: ens, contest_hash: contest_hash, submission: submission });
        console.log(res)

        /*
        await fetch('/creator_contests/create_submission', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: {submission: submission, ens: ens, contest_hash: contest_hash}
        })
        */
    }
    console.log('hi')
    console.log(Object.values(restrictionResults))
    return (
        <>
            <CreateSubmissionContainer>
                {progress === 0 && <SubmissionRequirements>
                    {Object.values(restrictionResults).length > 0 &&
                        <>
                            <h2 style={{ marginBottom: '30px' }}>Submission Requirements</h2>

                            {Object.values(restrictionResults).map((restriction, index) => {
                                if (restriction.type === 'erc20' || restriction.type === 'erc721') {
                                    return (
                                        <>

                                            <p style={{ fontSize: '20px' }}>
                                                {restriction.threshold} {restriction.symbol}
                                                {isWalletConnected && <RestrictionStatus index={index + 1} isConnected={isWalletConnected} status={restriction.user_result} key={`${isWalletConnected}-${restriction.user_result}`} />}
                                                {!isWalletConnected && <RestrictionStatusNotConnected />}
                                            </p>
                                            {index !== Object.entries(restrictionResults).length - 1 && <p>or</p>}
                                        </>
                                    )
                                }
                            })}
                            {!isWalletConnected && <EligibilityCheck>
                                <p>Connect wallet to check eligibility.</p>
                                <button onClick={walletConnect}>connect wallet</button>
                            </EligibilityCheck>
                            }
                            {isUserEligible && <button onClick={() => { setProgress(1) }}>next</button>}

                        </>

                    }
                </SubmissionRequirements>
                }

                {progress === 1 &&
                    <div>
                        <SubmissionActionButtons>
                            <CancelButton onClick={handleClose}><FontAwesomeIcon icon={faTimes} /></CancelButton>
                            <SubmitButton onClick={handleSubmit}><FontAwesomeIcon icon={faCheck} /></SubmitButton>
                        </SubmissionActionButtons>
                        <h2 style={{ textAlign: 'center', color: '#d3d3d3', marginBottom: '30px' }}>Create Submission</h2>
                        <EditTLDR isUserEligible={isUserEligible} TLDRimage={TLDRImage} setTLDRImage={setTLDRImage} TLDRText={TLDRText} setTLDRText={setTLDRText} />
                        <EditLongForm longFormValue={longFormValue} setLongFormValue={setLongFormValue} ReactEditorJS={ReactEditorJS} editorCore={editorCore} />
                    </div>
                }
            </CreateSubmissionContainer>
        </>
    )
}

function EditTLDR({ isUserEligible, TLDRimage, setTLDRImage, TLDRText, setTLDRText }) {
    const [showWarning, setShowWarning] = useState(false);
    return (
        <>
            <div style={{ width: '50%' }}>
                <h2 style={{ textAlign: 'left', color: '#d3d3d3' }}>TLDR</h2>
                <p style={{ color: 'grey' }}>This is what visitors will see on the submission section</p>
            </div>
            {showWarning && <WarningMessage style={{ marginBottom: '10px' }}>You may not be eligible to submit</WarningMessage>}
            <TLDR setShowWarning={setShowWarning} isUserEligible={isUserEligible} TLDRimage={TLDRimage} setTLDRImage={setTLDRImage} TLDRText={TLDRText} setTLDRText={setTLDRText} />
        </>
    )
}

function EditLongForm({ longFormValue, setLongFormValue, ReactEditorJS, editorCore }) {



    return (
        <div>
            {/*
            <div className='tab-message neutral'>
                <p>This section allows you to create longer form content that will only be visible if a user expands your submission.</p>
            </div>
    */}
            <div>
                <h2 style={{ textAlign: 'left', color: '#d3d3d3' }}>Submission</h2>
                <p style={{ color: 'grey' }}>What a visitor sees when your content is expanded</p>
            </div>
            <SubmissionEdit longFormValue={longFormValue} setLongFormValue={setLongFormValue} ReactEditorJS={ReactEditorJS} editorCore={editorCore} />
        </div>

    )
}