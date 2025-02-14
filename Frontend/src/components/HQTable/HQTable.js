import {
    Add,
    DeleteOutline,
    FormatAlignCenter,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    PlaylistAdd,
} from '@mui/icons-material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Popover, Tooltip } from '@mui/material';
import _ from 'lodash';
import React, {
    memo,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import './index.css';


function HQTable(props) {
    const {
        header,
        body,
        colDef,
        handleAdd,
        handleAddSecond,
        handleAddChild,
        handleDelete,
        sizePrint,
    } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const [rowSelect, setRowSelect] = useState(null);
    const tableBodyRef = useRef(null);

    const oncontextmenu = useCallback(
        (event) => {
            console.log('Right-clicked row:', event);
            event.preventDefault();
            event.stopPropagation();
            const target = event.currentTarget;
            setAnchorEl(target);
            const payload = target.getAttribute('payload');
            setRowSelect(payload ? JSON.parse(payload) : null);
        },
        []
    );

    useEffect(() => {
        if (!tableBodyRef.current) return;
        const rows = tableBodyRef.current.querySelectorAll('tr');
        rows.forEach((row) => {
            row.removeEventListener('contextmenu', oncontextmenu);
            row.addEventListener('contextmenu', oncontextmenu);
        });
        return () => {
            // console.log("Cleaned Context Menu:::", rows)
            rows?.forEach((row) => {
                row.removeEventListener('contextmenu', oncontextmenu);
            });
        };
    }, [body, oncontextmenu, tableBodyRef]);

    // remove styling signal and other....
    const onBlurStyling = useCallback(() => {
        setAnchorEl(null);
        setRowSelect(null);
    }, []);

    // React.useEffect(() => {
    //     console.log("Body-renderer:::", body)
    // }, [body])

    return (
        <div
            style={{
                width: '100%',
                height: 'fit-content',
            }}
        >
            <table className={`hq_table ${sizePrint || ''}`}>
                {colDef ? colDef : null}
                <thead >{header}</thead>
                <tbody ref={tableBodyRef}>{body}</tbody>
            </table>
            {Boolean(anchorEl) && (
                <StylingRowModal
                    anchorEl={anchorEl}
                    rowSelect={rowSelect}
                    onBlur={onBlurStyling}
                    handleAddSecond={handleAddSecond}
                    handleAdd={handleAdd}
                    handleDelete={handleDelete}
                    handleAddChild={handleAddChild}
                />
            )}
        </div>
    );
}


const StylingRowModal = memo(
    ({
        anchorEl,
        onBlur,
        rowSelect,
        id,
        handleAddSecond,
        handleAdd,
        handleAddChild,
        handleDelete,
        ...rest
    }) => {
        const styleList = [
            {
                className: 'hq-cell-bold',
                tooltip: 'In đậm',
                icon: <FormatBold />,
            },
            {
                className: 'hq-cell-italic',
                tooltip: 'In nghiêng',
                icon: <FormatItalic />,
            },
            {
                className: 'hq-cell-underline',
                tooltip: 'Gạch dưới',
                icon: <FormatUnderlined />,
            },
            {
                className: 'hq-cell-center',
                tooltip: 'Căn giữa',
                icon: <FormatAlignCenter />,
            },
            {
                className: null,
                action: 'Add',
                tooltip: `Thêm mới ${rowSelect?.tooltip?.name || ''}`,
                icon: <Add />,
            },
            {
                className: null,
                action: 'AddSecond',
                tooltip: `Thêm mới ${rowSelect?.tooltip?.name2 || ''}`,
                icon: <AddBoxIcon />,
            },
            {
                className: null,
                action: 'AddChild',
                tooltip: `Thêm mới ${rowSelect?.tooltip?.child || ''}`,
                icon: <PlaylistAdd />,
            },
            {
                className: null,
                action: 'Delete',
                tooltip: `Xóa ${rowSelect?.tooltip?.name || ''}`,
                icon: <DeleteOutline />,
            },
        ];
        return (
            <Popover
                //id={id}
                open={Boolean(anchorEl)}
                anchorEl={_.isArray(anchorEl) ? anchorEl.at(-1) : anchorEl}
                onClose={() => onBlur(anchorEl)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{ marginTop: '1px' }}
            >
                <div
                    style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        display: 'flex',
                    }}
                >
                    {styleList.map((style, idx) => (
                        <React.Fragment key={idx}>
                            {style.className ? (
                                <Tooltip title={style.tooltip}>
                                    <div
                                        className="styling-option"
                                        style={{ padding: '5px' }}
                                        onClick={() => {
                                            if (_.isArray(anchorEl)) {
                                                anchorEl.forEach((tr) => {
                                                    const tds =
                                                        tr?.querySelectorAll(
                                                            'td'
                                                        );
                                                    if (tds?.length > 0) {
                                                        tds.forEach((el) => {
                                                            el?.classList.toggle(
                                                                style.className
                                                            );
                                                        });
                                                    } else {
                                                        anchorEl?.classList.toggle(
                                                            style.className
                                                        );
                                                    }
                                                });
                                            } else {
                                                const tds =
                                                    anchorEl?.querySelectorAll(
                                                        'td'
                                                    );
                                                if (tds?.length > 0) {
                                                    tds.forEach((el) => {
                                                        el?.classList.toggle(
                                                            style.className
                                                        );
                                                    });
                                                } else {
                                                    anchorEl?.classList.toggle(
                                                        style.className
                                                    );
                                                }
                                            }
                                        }}
                                    >
                                        {style.icon}
                                    </div>
                                </Tooltip>
                            ) : (
                                Boolean(rowSelect) &&
                                (style.action !== 'AddChild' ||
                                    Boolean(rowSelect?.child)) &&
                                (style.action !== 'AddSecond' ||
                                    Boolean(rowSelect?.data2)) &&
                                (style.action !== 'Delete' ||
                                    Boolean(rowSelect?.rowIndex) ||
                                    rowSelect?.rowIndex === 0) &&
                                (style.action !== 'Add' ||
                                    Boolean(rowSelect?.data)) && (
                                    <Tooltip title={style.tooltip}>
                                        <div
                                            className="styling-option"
                                            style={{ padding: '5px' }}
                                            onClick={() => {
                                                switch (style.action) {
                                                    case 'Add':
                                                        handleAdd(rowSelect);
                                                        break;
                                                    case 'AddSecond':
                                                        handleAddSecond(
                                                            rowSelect
                                                        );
                                                        break;
                                                    case 'AddChild':
                                                        handleAddChild(
                                                            rowSelect
                                                        );
                                                        break;
                                                    case 'Delete':
                                                        handleDelete(rowSelect);
                                                        onBlur(anchorEl);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }}
                                        >
                                            {style.icon}
                                        </div>
                                    </Tooltip>
                                )
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </Popover>
        );
    }
);

export default memo(HQTable);

// Author by quandepzai
