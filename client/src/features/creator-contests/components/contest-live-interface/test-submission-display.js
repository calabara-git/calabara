import React, { useState, useEffect, useRef } from 'react';
import { contest_data } from './temp-data';
import styled, { keyframes, css } from 'styled-components'
import { ParseBlocks } from './block-parser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { fade_in } from '../common/common_styles';


const submission_fade = keyframes`
    0% {
        max-height: 30ch;
        overflow: hidden;
        opacity: 0;
    }

    100% {
        max-height: 100%;
        overflow: none;
        opacity: 1;
        }
`


const SubmissionContainer = styled.div`
    flex-grow: 0;
    width: ${props => props.expanded ? '100%' : '30%'};
    border-radius: 10px;
    min-height: 200px;
    min-height: 36ch;
    font-size: 20px;
    text-align: left;
    padding: 10px;
    background-color: #1c2128;
    color: #d3d3d3;
    display: flex;
    flex-direction: column;

    img{
        display: block;
        max-width: 15em;
        margin: auto;
        border-radius: 10px;
    }
`
const SubmissionContent = styled.div`
    border-radius: 10px;
    min-height: 200px;

    max-height: 30ch;
    overflow: hidden;
    font-size: 20px;
    text-align: left;
    padding: 10px;
    background-color: #1c2128;
    color: #d3d3d3;
    position: relative;
    //animation: ${fade_in} 0.7s ease-in-out;
    animation: ${props => props.expanded ? css`${submission_fade} 0.7s forwards` : ''};


    img{
        display: block;
        max-width: ${props => props.expanded ? 'none' : '10em'};
        margin: auto;
        border-radius: 10px;
    }
`


const SubmissionWrap = styled.div`
    display: flex;
    flex-wrap: wrap;
    //grid-template-columns: 1fr 1fr 1fr;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 400px;
`
const DropdownButton = styled.button`
    margin-top: auto;
    width: 100%;
    justify-self: center;
    align-self: center;
    color: grey;
    font-size: 16px;
    background-color: transparent;
    border: none;
    border-radius: 10px;
    padding: 10px 0px;
    &:hover{
        background-color: #33373d;
    }
`

export default function SubmissionDisplay({ }) {

    let submissions = contest_data.submissions;

    return (
        <>
            <h2 style={{ textAlign: 'center', color: '#d3d3d3', marginBottom: '30px' }}>Submissions</h2>

            <SubmissionWrap>
                {submissions.map(submission => {
                    return <Submission data={submission} />
                })}
            </SubmissionWrap>
        </>
    )
}

function Submission({ data }) {
    const [expanded, setExpanded] = useState(false);
    const submissionRef = useRef(null)


    const handleExpand = () => {
        if (expanded) return setExpanded(false)
        setExpanded(true)
        //submissionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', duration: '2s'});
    }

    return (
        <SubmissionContainer expanded={expanded} ref={submissionRef}>
            <SubmissionContent expanded={expanded}>
                <ParseBlocks data={data} />
            </SubmissionContent>
            <DropdownButton onClick={handleExpand}><FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} /></DropdownButton>
        </SubmissionContainer>
    )
}