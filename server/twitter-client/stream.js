const { bearerClient } = require('./config')
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
const { handle_fetched_tweet } = require('./helpers');


let stream = null


const get_stream_rules = async () => {
    try {
        let rules = await bearerClient.v2.streamRules()
        let parsed_rules = rules.data ? rules.data : []
        return parsed_rules
    } catch (err) {
        throw (err)
    }
}

const delete_stream_rules = async (ids) => {
    try {
        await bearerClient.v2.updateStreamRules({
            delete: {
                ids: ids
            }
        })

        let rules = await get_stream_rules()
        if ((rules.length === 0) && (stream)) return close_stream()
    } catch (err) { console.log(err) }
}

const add_stream_rules = async (arr) => {
    try {
        let rules = await get_stream_rules()
        console.log('current stream rules', rules)
        if (rules.length === 5) return console.log('stream buffer is full')
        console.log('attempting to add rules', arr)
        await bearerClient.v2.updateStreamRules({
            add: arr
        });
        if (!stream) return start_stream()
    } catch (err) {
        console.log(err)
    }
}


const start_stream = async () => {
    try {
        stream = await bearerClient.v2.searchStream({ expansions: "author_id", "tweet.fields": "created_at" });
        stream_listen();
    } catch (err) { console.log(err) }
}


const close_stream = () => {
    console.log('CLOSING STREAM')
    try {
        stream.close()
        stream = null
    } catch (err) { console.log(err) }
}


const stream_listen = () => {
    // Awaits for a tweet
    stream.on(
        // Emitted when Node.js {response} emits a 'error' event (contains its payload).
        ETwitterStreamEvent.ConnectionError,
        err => console.log('Connection error!', err),
    );

    stream.on(
        // Emitted when Node.js {response} is closed by remote or using .close().
        ETwitterStreamEvent.ConnectionClosed,
        () => console.log('Connection has been closed.'),
    );

    stream.on(
        // Emitted when a Twitter payload (a tweet or not, given the endpoint).
        ETwitterStreamEvent.Data,
        eventData => handle_fetched_tweet(eventData),
    );

    stream.on(
        // Emitted when a Twitter sent a signal to maintain connection active
        ETwitterStreamEvent.DataKeepAlive,
        () => console.log('Twitter has a keep-alive packet.'),
    );

    // Enable reconnect feature
    stream.autoReconnect = true;
}


get_stream_rules()
    .then(rules => {
        console.log('initial stream rules!!', rules)
        if ((rules.length > 0) && (!stream)) start_stream()
    })

module.exports = { add_stream_rules, delete_stream_rules, get_stream_rules }