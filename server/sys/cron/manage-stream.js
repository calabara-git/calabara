const cron = require('node-cron')
const db = require('../../helpers/db-init.js')
const { clean, asArray } = require('../../helpers/common.js');
const { get_stream_rules, delete_stream_rules, add_stream_rules } = require('../../twitter-client/stream.js');
const logger = require('../../logger.js').child({ service: 'cron:twitter_stream_manager' })


const pull_active_twitter_contests = async () => {
    const now = new Date().toISOString()
    return await db.query('select ens, _hash, settings->\'twitter_integration\' as twitter_integration from contests where _start < $1 and _voting > $1', [now])
        .then(clean)
        .then(asArray)
        .then(data => {
            return data.filter(el => {
                return (
                    (el.twitter_integration !== null) && (typeof el.twitter_integration.announcementID === 'string'))
            }).map(el => {
                return {
                    hash: el._hash,
                    announcementID: el.twitter_integration.announcementID
                }
            })
        })
}

// if we're tracking any stale contests, remove them from the stream rules
const remove_stale_rules = async (twitter_contests, stream_rules) => {
    let to_delete = []
    for (const rule of stream_rules) {
        // check if rule applies to active contest
        let found = twitter_contests.some(contest => contest.hash === rule.tag)
        if (!found) to_delete.push(rule.id)
    }
    if (to_delete.length > 0) return await delete_stream_rules(to_delete)
    return
}

// if were not tracking a contest, attempt to add it to the stream rules
const add_missing_rules = async (twitter_contests, stream_rules) => {
    let to_add = []
    for (const contest of twitter_contests) {
        const found = stream_rules.some(rule => rule.tag === contest.hash)
        if (!found) to_add.push({ value: `conversation_id:${contest.announcementID} is:quote`, tag: contest.hash })
    }
    if (to_add.length > 0) return await add_stream_rules(to_add)
}

const main = async () => {
    try {
        let stream_rules = await get_stream_rules();
        logger.log({ level: 'info', message: `listening to twitter stream with rules: ${JSON.stringify(stream_rules)}` })
        let twitter_contests = await pull_active_twitter_contests();
        await remove_stale_rules(twitter_contests, stream_rules)
        await add_missing_rules(twitter_contests, stream_rules)
    } catch (err) {
        logger.log({ level: 'error', message: `stream rule listener failed with error: ${JSON.stringify(err)}` })
    }
}


const manage_stream = (frequency) => {
    cron.schedule(frequency, () => {
        logger.log({ level: 'info', message: 'managing twitter stream' })
        main();
    })
}


module.exports = { manage_stream }