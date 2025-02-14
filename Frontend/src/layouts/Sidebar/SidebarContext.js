// @Huuhoai2002

import React from 'react';

const SidebarContext = React.createContext({
    draw: false,
    toggleDraw: () => { },
    closeDraw: () => { },
    openDraw: () => { },
    itemActive: '',
    setItemActive: () => { },
});

const SidebarProvider = ({ children }) => {
    const [draw, setDraw] = React.useState(true);
    const [itemActive, setItemActive] = React.useState('');
    const toggleDraw = () => setDraw(!draw);
    const closeDraw = () => setDraw(false);
    const openDraw = () => setDraw(true);

    return (
        <SidebarContext.Provider
            value={{
                draw,
                toggleDraw,
                closeDraw,
                openDraw,
                itemActive,
                setItemActive,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

const useSidebarContext = () => {
    const context = React.useContext(SidebarContext);

    if (context === undefined) {
        throw new Error(`useSidebarContext phải sử dụng bên trong SidebarProvider`);
    }

    return context;
};

export { SidebarProvider, useSidebarContext };

