import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from "react-router-dom"
import axios from 'axios'
import '../../css/dashboard.css'
import * as WebWorker from '../../app/worker-client.js'
import Glyphicon from '@strongdm/glyphicon'
import ManageWidgetsModal from '../../helpers/modal/ManageWidgetsModal'
import calendarLogo from '../../img/calendar.svg'
import discordLogo from '../../img/discord.svg'
import snapshotLogo from '../../img/snapshot.svg'
import wikiLogo from '../../img/wiki.svg'




//redux
import { useSelector, useDispatch } from 'react-redux';


import {
  selectConnectedBool,
  selectConnectedAddress,
} from '../wallet/wallet-reducer';

import {
  isMember,
  deleteMembership,
  addMembership,
  selectMemberOf,
  populateInitialMembership,
} from '../org-cards/org-cards-reducer';

import {
  setInstalledWidgets,
  setInstallableWidgets,
  populateInitialWidgets,
  selectInstalledWidgets,
  selectInstallableWidgets,
  populateVisibleWidgets,
  selectVisibleWidgets,
  updateWidgets,
} from './dashboard-widgets-reducer';

import{
  selectDashboardInfo,
  populateDashboardInfo,
  increaseMemberCount,
  decreaseMemberCount,
} from './dashboard-info-reducer'

import{
  populateDashboardRules,
  selectDashboardRules,
  applyDashboardRules,
  selectDashboardRuleResults,
} from '../gatekeeper/gatekeeper-rules-reducer'
import SettingsModal from '../../helpers/modal/SettingsModal'

//

const get = async function(params){
  var out = await axios.get(params.endpoint)
  return out;
}


const post = async function(params){
  var out = await axios.post(params.endpoint, params.data)
  return out.data;
}

 export default function Dashboard(){
   const isConnected = useSelector(selectConnectedBool)
   const walletAddress = useSelector(selectConnectedAddress)
   const installedWidgets = useSelector(selectInstalledWidgets)
   const installableWidgets = useSelector(selectInstallableWidgets)
   const visibleWidgets = useSelector(selectVisibleWidgets)
   const info = useSelector(selectDashboardInfo)
   const gatekeeperRules = useSelector(selectDashboardRules)
   const gatekeeperRuleResults = useSelector(selectDashboardRuleResults)
   const { ens } = useParams();
   const dispatch = useDispatch();

  const history = useHistory();

   const [gatekeeperResult, setGatekeeperResult] = useState(false)
   const [isAdmin, setIsAdmin] = useState(false)

   const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
   const [isWidgetsModalOpen, setIsWidgetsModalOpen] = useState(false);

   const settingsModalClose = (type) => {
     if(type == 'delete'){
      history.push('/explore')
     }
     setIsSettingsModalOpen(false);

   }
   const settingsModalOpen = () => setIsSettingsModalOpen(true);
   const widgetsModalClose = () => setIsWidgetsModalOpen(false);
   const widgetsModalOpen = () => setIsWidgetsModalOpen(true);
 

   async function showSettingsModal(){
    (isSettingsModalOpen ? settingsModalClose() : settingsModalOpen())
   }

   async function showWidgetsModal(){
     (isWidgetsModalOpen ? widgetsModalClose() : widgetsModalOpen())
   }


   useEffect(() => {
     console.log(gatekeeperRules)
   },[gatekeeperRules])


   async function checkAdmin(walletAddress){
     if(info.ens == ens){
       for(var i in info.addresses){
         if(info.addresses[i] == walletAddress){
           setIsAdmin(true);
           return;
         }
       }
       setIsAdmin(false);
       return;
   }
 }

   useEffect(async() => {
     console.log('render once')
     if(info.ens == "" || info.ens != ens){
      dispatch(populateDashboardInfo(ens))
      dispatch(populateDashboardRules(ens))
     }
     dispatch(populateInitialWidgets(ens))
   },[])



   // check for admin status and fetch membership
     useEffect(()=>{
       
      (async function(){
        if(isConnected){
          checkAdmin(walletAddress)
          dispatch(populateInitialMembership(walletAddress))

        }
      }());

    },[isConnected, info])

     useEffect(() => {
      (async function(){
        if(installedWidgets.length > 0 && isConnected){
            // if there are widgets installed, we need to test the rules with the connected wallet.
            dispatch(applyDashboardRules(walletAddress))
          // need to check the rules for each widget

        }
      }());

    },[isConnected, gatekeeperRules, installedWidgets])
    






   // if gatekeeperPass is true, show all widgets
   // else, only show the ones that pass the check
     useEffect(async()=>{
     // if(Object.entries(gatekeeperRuleResults).length > 0){
        dispatch(populateVisibleWidgets(gatekeeperResult))
     // }

   }, [installedWidgets, gatekeeperRuleResults])



   return(
     <div className="dashboard-wrapper">
     <InfoCard key={info.id} ens={ens} info={info} showSettingsModal={showSettingsModal}/>
     <section className="widget-cards">

     {visibleWidgets.map((widget, idx) => {

       return <WidgetCard gatekeeperPass={gatekeeperResult} ens={ens} key={idx} orgInfo={info} widget={widget}/>;

     })}
     <ManageWidgets isAdmin={isAdmin} showWidgetsModal={showWidgetsModal}/>
     </section>
     {isSettingsModalOpen && <SettingsModal mode={'existing-org'} settingsModalOpen={settingsModalOpen} handleClose={settingsModalClose}/>}
     {isWidgetsModalOpen && <ManageWidgetsModal widgetsModalOpen={widgetsModalOpen} handleClose={widgetsModalClose}/>}

     </div>
   )
 }




function InfoCard({info, ens, showSettingsModal}){
  const membership = useSelector(selectMemberOf);
  const isConnected = useSelector(selectConnectedBool)
  const walletAddress = useSelector(selectConnectedAddress)
  const {name, members, logo, discord, website, verified} = info;

  const history = useHistory();
  const dispatch = useDispatch();

  const isMemberOf = dispatch(isMember(ens))
  const [isInfoLoaded, setIsInfoLoaded] = useState(false)

  


  async function handleJoinOrg(){
    await dispatch(addMembership(walletAddress, ens))
    dispatch(increaseMemberCount())
  }

  async function handleLeaveOrg(){
    await dispatch(deleteMembership(walletAddress, ens))
    dispatch(decreaseMemberCount())

  }

  useEffect(()=>{
      if(info.ens == ens){
        setIsInfoLoaded(true)
      }
  })


  // process images once we have the correct info
  useEffect(async()=>{
    await WebWorker.processImages();

  },[isInfoLoaded])



  return(
    <div className="info">
    <button className="edit-settings-btn" type="button" onClick={showSettingsModal}><i className="fas fa-cog"></i></button>
    <div className="info-content">
    {isInfoLoaded &&
      <>
    <img data-src={logo}/>
    <h1> {name} </h1>
    {(!isMemberOf && isConnected) && <button name="join" onClick={handleJoinOrg} type="button" className="subscribe-btn">Join</button>}
    {(isMemberOf && isConnected) && <button name="leave" onClick={handleLeaveOrg} type="button" className="subscribe-btn">Leave</button>}
    <p> {members} members </p>
      <a href={'//' + website} target="_blank">{website}</a>
    </>
    }
    </div>
    </div>
  )

}

function ManageWidgets({isAdmin, showWidgetsModal}){

  const isConnected = useSelector(selectConnectedBool)


  useEffect(()=>{
    console.log(isAdmin)
  },[isAdmin])

  return(
    <>


    {(isAdmin && isConnected) && 
      <article className="widget-card manage-widgets" onClick={showWidgetsModal}>
      <div>
      <span><Glyphicon className="managePencil" glyph="pencil"/></span>
      <h2> manage widgets </h2>
      </div>
      </article>
    }
    </>
  )
}

export function WidgetCard({gatekeeperPass, orgInfo, widget, btnState, setBtnState, ens}){

  const {name, link, widget_logo, metadata, gatekeeper_enabled, notify} = widget;
  const [hasNotification, setHasNotification] = useState(false)

  const dispatch = useDispatch();
  const history = useHistory();



  function handleClick(){
    // block widget functionality if we are in edit mode
    if(!btnState){
    console.log(link)
    if(name == 'snapshot'){
    history.push('/' + ens + '/snapshot')
    }
    else if(name == 'calendar'){
      history.push('/' + ens + '/calendar/' + metadata.calendarID)
    }
    else if(name == 'wiki'){
      history.push('/' + ens + '/wiki')
    }
    else window.open(link)
    }
  }

  async function handleDeleteWidget(){
    var request = await post({endpoint: '/removeWidget', data: {ens: ens, name: name}})
    dispatch(updateWidgets(0, widget));

  }

  var logoImg;
  if(name == 'snapshot'){logoImg = snapshotLogo}
  if(name == 'calendar'){logoImg = calendarLogo}
  if(name == 'wiki'){logoImg = wikiLogo}


  return(

    <article className="widget-card" onClick={handleClick}>
    {(notify == 1  && !btnState)&& <button><Glyphicon glyph="bell"/></button>}
    {btnState == true && <button onClick={handleDeleteWidget}><Glyphicon glyph="minus"/></button>}
    <div className="card-image">
    <img src={logoImg}/>
    </div>
    <h2> {name == 'wiki' ? 'docs' : name}</h2>
    </article>


  )

}



