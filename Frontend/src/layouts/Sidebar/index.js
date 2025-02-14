import React from 'react';
import '../../styles/sidebar.scss';

import { List } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { getSidebarDataByRole } from '../config';
import { useSidebarContext } from './SidebarContext';
import SidebarItem from './SidebarItem';

const SideBar = () => {
    const { draw } = useSidebarContext();
    const { role, scope, coQuanThucHienId } = useSelector((state) => state?.auth);

    const handleClick = (e) => {
        e.preventDefault();
        window.open('https://cirensoft.vn/', '_blank');
    };

    return (
        <div
            className="sidebar-scrollbar"
            style={{
                backgroundColor: '#ffff',
            }}
        >
            <List
                sx={{
                    width: '100%',
                    bgcolor: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >
                {
                    getSidebarDataByRole(role, scope, coQuanThucHienId).map((item, index) => (
                        <SidebarItem
                            key={uuidv4()}
                            item={item}
                            isSubmenu={item?.children?.length > 0}
                        />
                    ))
                }
            </List>
        </div>
    );
};

export const MySideBar = React.memo(SideBar);
