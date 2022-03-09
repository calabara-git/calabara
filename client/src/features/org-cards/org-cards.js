import React, { useEffect, useState, componentDidMount } from 'react'
import { useHistory } from "react-router-dom"
import '../../css/org-cards.css'
import * as WebWorker from '../../app/worker-client'
import { showNotification } from '../notifications/notifications'

//redux
import { useSelector, useDispatch } from 'react-redux';
import {
  isMember,
  deleteMembership,
  addMembership,
  selectMemberOf,
  populateInitialMembership,
  populateInitialOrganizations,
  selectOrganizations,
  selectCardsPulled,
} from './org-cards-reducer';

import {
  selectConnectedBool,
  selectConnectedAddress,
} from '../wallet/wallet-reducer';

import {
  clearWidgets,
} from '../dashboard/dashboard-widgets-reducer'


export default function Cards(){
  const isConnected = useSelector(selectConnectedBool);
  const walletAddress = useSelector(selectConnectedAddress);
  const organizations = useSelector(selectOrganizations);
  const areCardsPulled = useSelector(selectCardsPulled);
  const dispatch = useDispatch();
  // clear redux store so that clicking into a new dashboard doesn't briefly render old data
  dispatch(clearWidgets());



  // there is room for optimization here. The webworker is fetching new resources everytime this page loads.
  // i created a cardsPulled state in the org-cards reducer that may come in handy for a solution

  useEffect(()=>{
      // pull org cards
      dispatch(populateInitialOrganizations())
      // set the joined orgs for this wallet address
      dispatch(populateInitialMembership(walletAddress));
  }, [])

  useEffect(()=>{
    if(organizations.length > 0){
      WebWorker.processImages().then((result) => {
        console.log(result)
      })

    }
  },[organizations])

  // don't want to call WW everytime. Let's cache the img blob in the reducer. When we 
  // add a new org, just directly inject the img src  


  return(
    <>
    <div className="cards-flex">
    <NewOrgButton isConnected={isConnected}/>
    <section className="cards">

    {organizations.map((org, idx) => {
      return <DaoCard key={idx} org={org}/>;
    })}
    </section>
    </div>
    </>
 )}


function DaoCard({org}){
  console.log(org)
  const {name, logo, verified, ens} = org;
  const memership = useSelector(selectMemberOf);
  const isConnected = useSelector(selectConnectedBool)
  const walletAddress = useSelector(selectConnectedAddress)
  const dispatch = useDispatch();
  const [members, setMembers] = useState(org.members)

  var isMemberOf = dispatch(isMember(ens))

  const history = useHistory();

  function handleJoinOrg(){
    dispatch(addMembership(walletAddress, ens))
    setMembers(members + 1);
  }

  function handleLeaveOrg(){
    dispatch(deleteMembership(walletAddress, ens))
    setMembers(members - 1);
  }



  const handleClick = (e) => {
    if(e.target.name === 'join'){
      e.preventDefault();
      e.stopPropagation();
    }
    else if(e.target.name === 'leave'){
      e.preventDefault();
      e.stopPropagation();
    }

    else{
    history.push('/' + ens + '/dashboard')
    }
  }

  // rerender the card when membership details change
  useEffect(() =>{},[isMemberOf])


  return(

    <article className="dao-card" onClick={handleClick}>
      {logo.substring(0,10) === 'img/logos/'

        ? <img data-src={logo}/>
        : <img src={logo}/>

     }
    <h2> {name}</h2>
    <p>{members} members</p>
    {!isMemberOf && <button name="join" onClick={handleJoinOrg} type="button" className="subscribe-btn">{'Join'}</button>}
    {isMemberOf && <button name="leave" onClick={handleLeaveOrg} type="button" className="subscribe-btn">{'Leave'}</button>}
    </article>

  )}

  function NewOrgButton({isConnected}){
    const [didUserRefuseConnect, setDidUserRefuseConnect] = useState(false);

    const history = useHistory();

    const handleNewOrg = async() => {
      
      if(isConnected){
          setDidUserRefuseConnect(false)
          history.push('new/settings')
        }
        else{
          setDidUserRefuseConnect(true);
          showNotification('please sign in', 'hint', 'please sign in to create a dashboard')
        }
      
  
    }

    return(
      <div className="newOrgBox">
        <button className="newOrgBtn" type="button" onClick={handleNewOrg}>🚀 New</button>
      </div>
      )
  }
