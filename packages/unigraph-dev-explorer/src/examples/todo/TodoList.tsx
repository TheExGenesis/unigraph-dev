import { Checkbox, Chip, ListItemText, Typography, Fab, Divider } from '@material-ui/core';
import { CalendarToday, PriorityHigh, Add as AddIcon } from '@material-ui/icons';
import React from 'react';
import { pkg as todoPackage } from 'unigraph-dev-common/lib/data/unigraph.todo.pkg';
import { unpad } from 'unigraph-dev-common/lib/utils/entityUtils';
import Sugar from 'sugar';
import { UnigraphObject } from 'unigraph-dev-common/lib/utils/utils';
import { DynamicViewRenderer } from '../../global.d';

import { registerDynamicViews, registerQuickAdder, withUnigraphSubscription } from '../../unigraph-react';
import { AutoDynamicView } from '../../components/ObjectView/AutoDynamicView';
import { parseTodoObject } from './parseTodoObject';
import { ATodoList, filters, maxDateStamp } from './utils';
import { DynamicObjectListView } from '../../components/ObjectView/DynamicObjectListView';

function TodoListBody({ data }: { data: ATodoList[] }) {
    const todoList = data;

    const [filteredItems, setFilteredItems] = React.useState(todoList);

    React.useEffect(() => {
        const res = todoList;
        setFilteredItems(res);
    }, [todoList]);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <DynamicObjectListView
                items={filteredItems}
                context={null}
                filters={filters}
                defaultFilter="only-incomplete"
                compact
            />
            <Fab
                aria-label="add"
                style={{ position: 'absolute', right: '16px', bottom: '16px' }}
                onClick={() => {
                    window.unigraph.getState('global/omnibarSummoner').setValue({
                        show: true,
                        tooltip: 'Add a todo item',
                        defaultValue: '+todo ',
                    });
                }}
            >
                <AddIcon />
            </Fab>
        </div>
    );
}

export const TodoItem: DynamicViewRenderer = ({ data, callbacks, compact, inline, isEmbed }) => {
    // console.log(data);
    const unpadded: ATodoList = unpad(data);
    // console.log(unpadded)
    const totalCallbacks = {
        ...(callbacks || {}),
        onUpdate: (newData: Record<string, any>) => {
            window.unigraph.updateObject(
                newData.uid,
                {
                    _value: {
                        uid: newData._value.uid,
                        done: { uid: newData._value.done.uid, '_value.!': newData.get('done')['_value.!'] },
                    },
                    _hide: newData.get('done')['_value.!'],
                },
                !newData._value.uid,
                false,
                callbacks?.subsId,
                undefined,
                true,
            );
        },
    };

    const NameDisplay = React.useMemo(
        () => (
            <AutoDynamicView
                object={data.get('name')._value._value}
                noDrag
                noDrop
                noContextMenu
                callbacks={{
                    'get-semantic-properties': () => data,
                }}
            />
        ),
        [data],
    );

    const SecondaryDisplay = React.useMemo(
        () => (
            <>
                {!unpadded.children?.map
                    ? []
                    : data?._value?.children?.['_value[']
                          ?.filter((it: any) => !it._key)
                          .map((it: any) => (
                              <AutoDynamicView object={new UnigraphObject(it._value)} callbacks={callbacks} inline />
                          ))}
                {unpadded.priority > 0
                    ? [<Chip size="small" icon={<PriorityHigh />} label={`Priority ${unpadded.priority}`} />]
                    : []}
                {unpadded.time_frame?.start?.datetime && new Date(unpadded.time_frame?.start?.datetime).getTime() !== 0
                    ? [
                          <Chip
                              size="small"
                              icon={<CalendarToday />}
                              label={`Start: ${Sugar.Date.relative(new Date(unpadded.time_frame?.start?.datetime))}`}
                          />,
                      ]
                    : []}
                {unpadded.time_frame?.end?.datetime &&
                new Date(unpadded.time_frame?.start?.datetime).getTime() !== maxDateStamp
                    ? [
                          <Chip
                              size="small"
                              icon={<CalendarToday />}
                              label={`End: ${Sugar.Date.relative(new Date(unpadded.time_frame?.end?.datetime))}`}
                          />,
                      ]
                    : []}
            </>
        ),
        [unpadded, callbacks, data],
    );
    // console.log(data.uid, unpadded)
    return (
        <div style={{ display: 'flex' }}>
            <Checkbox
                size={callbacks.isEmbed ? 'small' : 'medium'}
                style={{ padding: callbacks.isEmbed ? '2px' : '', marginRight: callbacks.isEmbed ? '4px' : '' }}
                checked={unpadded.done}
                onClick={(_) => {
                    data.get('done')['_value.!'] = !data.get('done')['_value.!'];
                    totalCallbacks.onUpdate(data);
                }}
            />
            {callbacks.isEmbed ? (
                [
                    NameDisplay,
                    <Divider orientation="vertical" style={{ marginLeft: '4px', marginRight: '4px' }} />,
                    SecondaryDisplay,
                ]
            ) : (
                <ListItemText
                    style={{ margin: compact ? '0px' : '', alignSelf: 'center' }}
                    primary={NameDisplay}
                    secondary={
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                flexWrap: 'wrap',
                            }}
                        >
                            {SecondaryDisplay}
                        </div>
                    }
                />
            )}
        </div>
    );
};

const quickAdder = async (
    inputStr: string,
    // eslint-disable-next-line default-param-last
    preview = true,
    callback?: any,
    refs?: any,
) => {
    const parsed = parseTodoObject(inputStr, refs);
    console.log(parsed);
    if (!preview)
        // eslint-disable-next-line no-return-await
        return await window.unigraph.addObject(parsed, '$/schema/todo');
    return [parsed, '$/schema/todo'];
};

const tt = () => (
    <>
        <Typography style={{ color: 'gray' }}>Examples:</Typography>
        <Typography>@tomorrow-&quot;next Friday&quot; #unigraph hello world</Typography>
        <Typography style={{ color: 'gray' }} variant="body2">
            doable from tomorrow, due next Friday
        </Typography>
        <Typography>@tomorrow #unigraph hello world</Typography>
        <Typography style={{ color: 'gray' }} variant="body2">
            due tomorrow
        </Typography>
        <Typography>!5 very important stuff</Typography>
        <Typography style={{ color: 'gray' }} variant="body2">
            priority 5
        </Typography>
    </>
);

export const init = () => {
    const description = 'Add a new Todo object';
    registerDynamicViews({
        '$/schema/todo': {
            view: TodoItem,
            query: (uid: string) => `
            (func: uid(${uid})) {
                uid
                type { <unigraph.id> }
                dgraph.type
                <_hide>
                <_value> {
                    uid
                    name {
                        uid _value {
                            dgraph.type uid
                            type { <unigraph.id> }
                            _value { dgraph.type uid type { <unigraph.id> } <_value.%> }
                        }
                    }
                    done { uid <_value.!> }
                    priority { <_value.#i> }
                    time_frame {
                        uid _value {
                            dgraph.type uid type { <unigraph.id> }
                            _value {
                                start {
                                    uid _value {
                                        dgraph.type uid
                                        type { <unigraph.id> }
                                        _value { datetime { <_value.%dt> } timezone { <_value.%> } }
                                    }
                                }
                                end {
                                    uid _value {
                                        dgraph.type uid
                                        type { <unigraph.id> }
                                        _value { datetime { <_value.%dt> } timezone { <_value.%> } }
                                    }
                                }
                            }
                        }
                    }
                    children {
                        <_value[> {
                            uid _key _index {<_value.#i> uid}
                            _value {
                                dgraph.type uid type { <unigraph.id> }
                                _value {
                                    dgraph.type uid type { <unigraph.id> }
                                    _value {
                                        uid name { uid <_value.%> }
                                        color { uid _value { <_value.%> dgraph.type uid type { <unigraph.id> } } }
                                    }
                                }
                            }
                        }
                    }
                }
            }`,
        },
    });
    registerQuickAdder({
        todo: {
            adder: quickAdder,
            tooltip: tt,
            description,
            alias: ['td'],
        },
    });
};

export const TodoList = withUnigraphSubscription(
    TodoListBody,
    { schemas: [], defaultData: [], packages: [todoPackage] },
    {
        afterSchemasLoaded: (subsId: number, tabContext: any, data: any, setData: any) => {
            tabContext.subscribeToType(
                '$/schema/todo',
                (result: ATodoList[]) => {
                    setData(result.map((el: any) => ({ ...el, _stub: true })));
                },
                subsId,
                {
                    showHidden: true,
                    queryAs: ' { uid type { <unigraph.id> } _hide _value { done { <_value.!> } } } ',
                },
            );
        },
    },
);
