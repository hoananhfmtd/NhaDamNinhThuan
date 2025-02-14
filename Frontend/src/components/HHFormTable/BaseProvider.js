// @Huuhoai2002

import React from 'react';

const BaseContext = React.createContext({
    isPrint: false,
    togglePrint: () => {},
    onPrint: () => {},
    onPrintDone: () => {},
});

const BaseProvider = ({ children }) => {
    const [isPrint, setIsPrint] = React.useState(false);

    const togglePrint = () => setIsPrint((p) => !p);
    const onPrint = () => setIsPrint(true);
    const onPrintDone = () => setIsPrint(false);

    // React.useEffect(() => {
    //     window.addEventListener('beforeprint', togglePrint);
    //     window.addEventListener('afterprint', togglePrint);

    //     return () => {
    //         window.removeEventListener('beforeprint', togglePrint);
    //         window.removeEventListener('afterprint', togglePrint);
    //     };
    // }, [isPrint, togglePrint]);

    // const values = React.useMemo(
    //     () => ({
    //         isPrint,
    //         togglePrint,
    //     }),
    //     [isPrint, togglePrint],
    // );

    return (
        <BaseContext.Provider
            value={{
                isPrint,
                togglePrint,
                onPrint,
                onPrintDone,
            }}
        >
            {children}
        </BaseContext.Provider>
    );
};

const useBaseContext = () => {
    const context = React.useContext(BaseContext);

    if (context === undefined) {
        throw new Error(`useBaseContext phải được sử dụng bên trong BaseProvider`);
    }

    return context;
};

export { BaseProvider, useBaseContext };
