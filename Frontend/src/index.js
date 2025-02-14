import { viVN } from '@mui/material/locale';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore, Tuple } from '@reduxjs/toolkit';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { thunk } from 'redux-thunk';
import App from './App';
import { BASE_PATH } from './const';
import { SidebarProvider } from './layouts/Sidebar/SidebarContext';
import rootReducer from "./store";
import './styles/index.scss';

const reduxConfig = () => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: () => new Tuple(thunk),
        devTools: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    })
    const persistor = persistStore(store)

    return { store, persistor }
}

const theme = createTheme(
    {
        palette: {
            success: {
                main: '#22c55e',
            },
            warning: {
                main: '#f97316',
            },
            neutral: {
                main: '#64748B',
                contrastText: '#fff',
            },
            error: {
                main: '#ef4444',
            },
            primary: { main: '#0285CE' },
            default: { main: '#fff' },
        },
    },
    viVN,
);

const { store, persistor } = reduxConfig()
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider maxSnack={3}>
                    <SidebarProvider>
                        <BrowserRouter basename={BASE_PATH ?? ""}>
                            <App />
                        </BrowserRouter>
                    </SidebarProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </PersistGate>
    </Provider>
);
