import { ListItemText } from "@material-ui/core";
import React from "react";
import { unpad } from "unigraph-dev-common/lib/utils/entityUtils";
import { DynamicViewRenderer } from "../../global";

export const ViewItem: DynamicViewRenderer = ({data, callbacks}) => {
    let unpadded: any = unpad(data);

    return <React.Fragment>
        <div onClick={() => window.newTab(window.layoutModel, {
            type: 'tab',
            config: {
                uid: data?.uid,
                type: data?.type?.['unigraph.id']
            },
            customTitle: true,
            name: unpadded.name,
            component: '/pages/library/object',
            enableFloat: 'true'
        })} style={{display: "contents"}}>
            <ListItemText primary={unpadded.name}></ListItemText>
        </div>
    </React.Fragment>
}