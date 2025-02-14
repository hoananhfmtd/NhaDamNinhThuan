import { ExpandMore } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover,
    Tooltip,
    Zoom,
} from '@mui/material';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { BASE_PATH } from '../../const';
import { defineColors } from '../config';
import { useSidebarContext } from './SidebarContext';

const SidebarItem = ({ isSubmenu, item }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { pathname } = useLocation();
    const isActive =
        pathname?.replace()?.trim() === BASE_PATH + item?.path?.trim();
    const openPopover = Boolean(anchorEl);
    const { itemActive, setItemActive, draw } = useSidebarContext();
    const isChildActive = React.useCallback(
        (path) => pathname?.replace() === BASE_PATH + path,
        [pathname]
    );
    const handleClick = React.useCallback(() => {
        setItemActive(item?.path === itemActive ? '' : item?.path);
    }, []);
    const isOpen = React.useMemo(
        () => isSubmenu && item?.path === itemActive,
        [itemActive]
    );

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            {isSubmenu ? (
                <>
                    <Tooltip
                        title={
                            !draw ? (
                                <span
                                    style={{
                                        fontSize: '14px',
                                    }}
                                >
                                    {item?.name}
                                </span>
                            ) : null
                        }
                        TransitionComponent={Zoom}
                        arrow
                        placement="right"
                    >
                        <ListItemButton
                            sx={{
                                '&:hover': {
                                    backgroundColor:
                                        defineColors.sidebar.item.base,
                                },
                                fontWeight: isOpen ? 'bold' : 'normal',
                                px: 2,
                                borderRadius: 16,
                                paddingLeft: "20px",
                                gap: 2,
                                height: 42
                            }}
                            onClick={draw ? handleClick : handlePopoverOpen}
                            onMouseDown={handlePopoverOpen}
                            onMouseUp={handlePopoverClose}
                            color="primary"
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: '0 !important',
                                    justifyContent: 'center',
                                    color: isOpen
                                        ? '#000 !important'
                                        : 'inherit',
                                }}
                            >
                                {item?.icon}
                            </ListItemIcon>
                            <ListItemText
                                sx={{
                                    textAlign: 'left',
                                    color: isOpen ? 'inherit' : '',
                                    marginLeft: '5px',
                                }}
                                primary={draw ? item?.name : ""}
                            />
                            {isOpen && draw ? (
                                <ExpandMore
                                    sx={{
                                        color: '#000 !important',
                                    }}
                                />
                            ) : (
                                <NavigateNextIcon />
                            )}
                        </ListItemButton>
                    </Tooltip>
                    {/* Popover */}
                    {!draw && (
                        <Popover
                            id="mouse-over-popover"
                            open={openPopover}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            onClose={handlePopoverClose}
                        >
                            <List
                                component="div"
                                sx={{
                                    borderRadius: '8px',
                                    paddingRight: '8px',
                                    paddingLeft: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // gap: '4px',
                                }}
                            >
                                {item?.children?.map((child) => (
                                    <NavLink
                                        style={{
                                            textDecoration: 'none',
                                            display: 'block',
                                        }}
                                        key={uuidv4()}
                                        to={child?.path}
                                    >
                                        <ListItemButton
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor:
                                                        defineColors.sidebar
                                                            .item.base,
                                                    color: '#000 !important',
                                                },
                                                backgroundColor: isChildActive(
                                                    child?.path
                                                )
                                                    ? `${defineColors.sidebar.item.base} !important`
                                                    : '',
                                                height: 32,
                                                px: 2,
                                                borderRadius: 16,
                                                paddingLeft: "20px",
                                                mb: '1px'
                                            }}
                                            onClick={handlePopoverClose}
                                        >
                                            <ListItemText
                                                sx={{
                                                    color: isChildActive(
                                                        child?.path
                                                    )
                                                        ? `#000 !important`
                                                        : '#000 !important',
                                                    // borderRadius: isChildActive(child?.path) ? '6px' : '0px',
                                                }}
                                                primary={child?.name}
                                            />
                                        </ListItemButton>
                                    </NavLink>
                                ))}
                            </List>
                        </Popover>
                    )}
                    {/* Dropdown children*/}
                    <Collapse in={isOpen && draw} timeout={1000} unmountOnExit>
                        <List>
                            {item?.children?.map((child) => (
                                <NavLink
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        display: 'block',
                                    }}
                                    key={uuidv4()}
                                    to={child?.path}
                                >
                                    <ListItemButton
                                        sx={{
                                            '&:hover': {
                                                backgroundColor:
                                                    defineColors.sidebar.item
                                                        .base,
                                            },
                                            backgroundColor: isChildActive(
                                                child?.path
                                            )
                                                ? defineColors.sidebar.item.base
                                                : '',
                                            px: 2,
                                            pl: 4,
                                            mb: '2px',
                                            borderRadius: 16,
                                            paddingLeft: "20px",
                                            height: 38
                                        }}
                                    >
                                        <ListItemText
                                            sx={{
                                                color: isChildActive(
                                                    child?.path
                                                )
                                                    ? '#000 !important'
                                                    : '',
                                            }}
                                            primary={draw ? child?.name : " "}
                                        />
                                    </ListItemButton>
                                </NavLink>
                            ))}
                        </List>
                    </Collapse>
                    {/* )} */}
                </>
            ) : (
                <NavLink
                    to={item?.path}
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                    }}
                >
                    <Tooltip
                        title={
                            !draw ? (
                                <span
                                    style={{
                                        fontSize: '14px',
                                    }}
                                >
                                    {item?.name}
                                </span>
                            ) : null
                        }
                        sx={{}}
                        TransitionComponent={Zoom}
                        arrow
                        placement="right"
                    >
                        <ListItemButton
                            sx={{
                                '&:hover': {
                                    backgroundColor:
                                        defineColors.sidebar.item.base,
                                },
                                // borderRadius: '6px',
                                backgroundColor: isActive
                                    ? `${defineColors.sidebar.item.base} !important`
                                    : '',
                                justifyContent: !draw ? 'initial' : 'center',
                                fontWeight: isActive ? 'bold' : 'normal',
                                px: 2,
                                borderRadius: 16,
                                paddingLeft: "20px",
                                gap: 2,
                                height: 42
                            }}
                            disableGutters
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? '#000' : 'inherit',
                                    minWidth: '0 !important',
                                }}
                            >
                                {item?.icon}
                            </ListItemIcon>
                            <ListItemText
                                sx={{
                                    color: isActive
                                        ? '#000 !important'
                                        : '',
                                }}
                                primary={draw ? item?.name : ""}
                            />
                        </ListItemButton>
                    </Tooltip>
                </NavLink>
            )}
        </div>
    );
};

export default React.memo(SidebarItem);
