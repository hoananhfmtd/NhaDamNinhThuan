import React from 'react';

const TableRowContext = React.createContext({
    ref: null,
    state: {
        open: false,
        position: {
            top: 0,
            left: 0,
        },
    },
    handleOpen: () => {},
    handleClose: () => {},
});

const TableRowProvider = ({ children }) => {
    const [state, setState] = React.useState();
    const ref = React.useRef(null);

    const handleScroll = () => {
        const gbc = ref.current.getBoundingClientRect();

        setState((prev) => ({
            ...prev,
            position: {
                top: gbc.top,
                left: gbc.left,
            },
        }));
    };

    const handleOpen = React.useCallback((e) => {
        setState((prev) => ({
            ...prev,
            open: true,
        }));
    }, []);

    const handleClose = React.useCallback(() => setState((prev) => ({ ...prev, open: false })), []);

    React.useEffect(() => {
        if (!ref?.current) return;
        const gbc = ref.current.getBoundingClientRect();

        setState((prev) => ({
            ...prev,
            position: {
                top: gbc.top,
                left: gbc.left,
            },
        }));
    }, [ref.current]);

    React.useEffect(() => {
        if (!ref?.current) return;
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [ref.current]);

    return (
        <TableRowContext.Provider
            value={{
                state: { ...state },
                ref,
                handleOpen,
                handleClose,
            }}
        >
            {children}
        </TableRowContext.Provider>
    );
};

const useTableRowContext = () => {
    const context = React.useContext(TableRowContext);

    if (context === undefined) {
        throw new Error(`useTableRowContext phải được sử dụng bên trong TableProvider`);
    }

    return context;
};

export { TableRowProvider, useTableRowContext };
