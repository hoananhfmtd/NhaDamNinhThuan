import React from 'react';

const TableContext = React.createContext({
    isPrint: false,
});

const TableProvider = ({ children }) => {
    const [isPrint, setIsPrint] = React.useState(false);

    const togglePrint = () => setIsPrint((p) => !p);

    React.useState(() => {
        window.addEventListener('beforeprint', togglePrint);
        window.addEventListener('afterprint', togglePrint);

        return () => {
            window.removeEventListener('beforeprint', togglePrint);
            window.removeEventListener('afterprint', togglePrint);
        };
    }, [isPrint]);
    const values = React.useMemo(
        () => ({
            isPrint,
        }),
        [isPrint],
    );

    return <TableContext.Provider value={values}>{children}</TableContext.Provider>;
};

const useTableContext = () => {
    const context = React.useContext(TableContext);

    if (context === undefined) {
        throw new Error(`useTableContext phải được sử dụng bên trong TableProvider`);
    }

    return context;
};

export { TableProvider, useTableContext };

