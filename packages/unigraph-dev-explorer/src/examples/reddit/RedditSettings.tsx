import { Button, Typography } from "@material-ui/core"
import React, { useEffect } from "react";
import { useEffectOnce } from "react-use"
import { pkg as redditPacakge } from 'unigraph-dev-common/lib/data/unigraph.reddit.pkg';
import { getRandomInt } from "unigraph-dev-common/lib/api/unigraph";

export const RedditSettings = () => {

    const [loaded, setLoaded] = React.useState(false);
    const [account, setAccount] = React.useState<any>({});
    const subscriptions = account?.['_value']?.['subscriptions']['_value['].map((it: any) => {return {uid: it['_value'].uid, name: it['_value']['_value']['name']['_value.%'], last_id_fetched: it['_value']['_value']['last_id_fetched']['_value.%']}});

    useEffectOnce(() => {
        window.unigraph.ensurePackage("unigraph.reddit", redditPacakge).then(() => setLoaded(true));
    })

    useEffect(() => {
        if (loaded) {
            const id = getRandomInt();
            window.unigraph.subscribeToQuery(`(func: type(Entity)) @cascade {
                uid
                type @filter(eq(<unigraph.id>, "$/schema/internet_account")) {<unigraph.id>}
                _value {
                    site {
                        _value {
                            _value {
                                name @filter(eq(<_value.%>, "Reddit")) {
                                    <_value.%>
                                }
                            }
                        }
                    }
                    username { <_value.%> }
                    access_token { <_value.%> }
                    token_expires_in { <_value.%dt> }
                    refresh_token { <_value.%> }
                    subscriptions {
                        <_value[> {
                            _value {
                                _value {
                                    name { <_value.%> }
                                    last_id_fetched { <_value.%> }
                                }
                            }
                        }
                    }
                }
            }`, (res: any[]) => {
                setAccount(res[0])
            }, id, true);
            return function cleanup() {
                window.unigraph.unsubscribe(id);
            }
        }
    }, [loaded])

    return loaded ? <div>
        <Typography variant="h4">Reddit settings</Typography>
        <Button onClick={() => window.unigraph.runExecutable("$/executable/add-reddit-account", {})}>Sign in with Reddit</Button>
        <Typography variant="body1">Account info</Typography>
        <p><strong>Username: </strong>{account?.get?.("username").as?.("primitive")}</p>
        <Typography variant="body1">Currently subscribed to</Typography>
        {subscriptions?.map((el: any) => <p><strong>{el.name}</strong>{el.last_id_fetched}</p>)}
    </div> : <React.Fragment>Loading...</React.Fragment>
}