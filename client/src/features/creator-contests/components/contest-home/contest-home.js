import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from "moment";
import { Suspense, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useHistory, useParams } from "react-router-dom";
import CC_Logo from "../../../../img/logo-cc-shark.png";
import BackButton from "../../../back-button/back-button";
import { Contest_h2_alt, Contest_h3_alt, Label, labelColorOptions, TagType } from "../common/common_styles";
import { label_status } from "../contest-live-interface/contest_info/contest-info-style";
import {
    AboutCC, CC_notFound,
    Contest, ContestHomeWrap, ContestTag, NewContest, OptionType,
    OrgCard, RoundContainer, SplitBottom,
    SplitBottomLeft,
    SplitBottomRight, SplitTop, StatContainer, Stats
} from "./contest-home-style";
import { fetchHomePageData, initialize } from "./homepage-data-fetch";

let compact_formatter = Intl.NumberFormat('en', { notation: 'compact' })
const nonResolvingPromise = initialize();


export default function ContestHomepage() {
    const { ens } = useParams();
    const history = useHistory();
    const [homepage_data, set_homepage_data] = useState(nonResolvingPromise)

    useEffect(() => {
        set_homepage_data(fetchHomePageData(ens))
    }, [])

    const handleSettings = () => {
        history.push(`contest_settings`)
    }

    return (
        <>
            <BackButton customWidth={'68%'} link={'/' + ens + '/dashboard'} text={"dashboard"} />
            <ContestHomeWrap>
                <SplitTop>
                    <Suspense fallback={<OrgCard />}>
                        <RenderOrgCard homepage_data={homepage_data} />
                    </Suspense>
                    <AboutCC>
                        <div>
                            <h4>Participate in weekly contests to receive retroactive funding for your most creative artwork, ideas, memes, and everything else.</h4>
                            <img src={CC_Logo} />
                        </div>
                        <NewContest onClick={handleSettings}><FontAwesomeIcon icon={faPlus} /> New Contest </NewContest>
                    </AboutCC>
                </SplitTop>
                <SplitBottom>
                    <SplitBottomLeft>
                        <Suspense fallback={<RoundContainer style={{ height: '500px' }} />}>
                            <ListContests homepage_data={homepage_data} />
                        </Suspense>
                    </SplitBottomLeft>

                    <SplitBottomRight>
                        <Suspense fallback={<StatContainer style={{ height: '230px' }} />}>
                            <ListStats homepage_data={homepage_data} />
                        </Suspense>
                    </SplitBottomRight>

                </SplitBottom>
            </ContestHomeWrap>
        </>
    )

}

function ListContests({ homepage_data }) {
    const history = useHistory();
    const all_contests = homepage_data.contests.read();

    const handleInterface = (_hash) => {
        history.push(`creator_contests/${_hash}`)
    }


    return (
        <RoundContainer>
            {all_contests.map((el, id) => {
                return (
                    <Contest onClick={() => handleInterface(el._hash)} key={id}>
                        <ContestTag>{el._title}</ContestTag>
                        <Label style={{ marginLeft: 'auto' }} color={labelColorOptions[el._prompt_label_color]}>{el._prompt_label}</Label>
                        <CalculateState contest_info={el} />
                    </Contest>
                )
            })}
        </RoundContainer >
    )
}

function ListStats({ homepage_data }) {
    const total_rewards = homepage_data.stats.read();
    return (
        <StatContainer>
            <Contest_h3_alt style={{ textAlign: 'center' }}>Total Rewards Distributed</Contest_h3_alt>
            <Stats>
                <OptionType><TagType>ETH</TagType> <p>{total_rewards.eth ? compact_formatter.format(total_rewards.eth) : '--'}</p></OptionType>
                <OptionType><TagType type='erc20'>ERC-20</TagType> <p>{total_rewards.erc20 ? compact_formatter.format(total_rewards.erc20) : '--'}</p></OptionType>
                <OptionType><TagType type='erc721'>ERC-721</TagType><p>{total_rewards.erc721 ? compact_formatter.format(total_rewards.erc721) : '--'}</p></OptionType>
            </Stats>
        </StatContainer>
    )
}

const calculateDuration = (t0, t1, t2) => {
    let submit_time = moment.duration(moment(t0).diff(moment()));
    let vote_time = moment.duration(moment(t1).diff(moment()))
    let end_time = moment.duration(moment(t2).diff(moment()))
    submit_time = vote_time.milliseconds() > 0 ? 'active' : 'complete';
    vote_time = submit_time === 'complete' ? (end_time.milliseconds() > 0 ? 'active' : 'complete') : `${vote_time.days()}:${vote_time.hours()}:${vote_time.minutes()}:${vote_time.seconds()}`
    end_time = end_time.milliseconds() > 0 ? `${end_time.days()}:${end_time.hours()}:${end_time.minutes()}:${end_time.seconds()}` : 'complete'

    return [
        submit_time,
        vote_time,
        end_time
    ]
}

function CalculateState({ contest_info }) {
    const [contestState, setContestState] = useState(0)



    useEffect(() => {

        let results = calculateDuration(contest_info._start, contest_info._voting, contest_info._end)

        let index = results.indexOf('active');
        let cc_state = index = index > -1 ? index : 2;
        setContestState(cc_state)
    }, [])


    return (
        <Label style={{ marginLeft: '3px' }} color={label_status[contestState]}>{label_status[contestState].status}</Label>
    )
}

function RenderOrgCard({ homepage_data }) {
    const info = homepage_data.info.read();

    return (
        <OrgCard>
            <LazyLoadImage style={{ maxWidth: '12em', margin: '0 auto', borderRadius: '100px' }} src={`/${info.orgInfo.logo}`} effect="blur" />
            <Contest_h2_alt>{info.orgInfo.name}</Contest_h2_alt>
            <a href={'//' + info.orgInfo.website} target="_blank">{info.website}</a>
        </OrgCard>
    )
}