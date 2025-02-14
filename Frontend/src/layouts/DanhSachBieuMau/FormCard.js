import { Add } from '@mui/icons-material';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useToggle } from '../../components/HHFormTable/Hooks/useToggle';
import './card.scss';

const FormCard = ({ data, dataSearch, fast, special = true }) => {
    const [show, { setTrue, setFalse }] = useToggle();
    return (
        <NavLink
            onMouseEnter={fast ? setTrue : () => { }}
            onMouseLeave={fast ? setFalse : () => { }}
            to={data?.path + (fast ? '/them-nhanh' : '')}
            className={special ? "form-card-special" : "form-card"}
        >
            <div className="form-card__top">
                <div className="item">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width={24}
                        height={24}
                        color="#38BDF8"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                            clipRule="evenodd"
                        />
                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                    <span className="title">
                        {data?.title && dataSearch ? (
                            <span
                                style={{ marginRight: 6 }}
                                dangerouslySetInnerHTML={{
                                    __html: data?.title.replace(
                                        new RegExp(dataSearch, 'gi'),
                                        (match) =>
                                            `<span className="highlight">${match}</span>`
                                    ) + ":",
                                }}
                            />
                        ) : (
                            <span style={{ marginRight: 6 }}>{data?.title}:</span>
                        )}
                    </span>
                </div>
            </div>

            {
                !special && <div className="form-card__body" style={{ position: 'relative' }}>
                    <img
                        src={data?.img}
                        alt="Ảnh xem trước biểu mẫu"
                        loading="lazy"
                        style={{
                            height: 150,
                            width: '100%',
                            paddingTop: 5,
                            paddingLeft: 2,
                            paddingRight: 2,
                            borderRadius: 10,
                        }}
                    />
                    {
                        show && <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '50%',
                            transform: 'translate(50%, -50%)'
                        }}>
                            <Add sx={{ fontSize: 60, color: '#38bdf8' }} />
                        </div>
                    }
                </div>
            }

            <div className="form-card__bottom">
                <div className="name">
                    {data?.name && dataSearch ? (
                        <span
                            dangerouslySetInnerHTML={{
                                __html: data?.name.replace(
                                    new RegExp(dataSearch, 'gi'),
                                    (match) =>
                                        `<span class="highlight">${match}</span>`
                                ),
                            }}
                        />
                    ) : (
                        <span>{data?.name}</span>
                    )}
                </div>
            </div>
        </NavLink>
    );
};

export default React.memo(FormCard);
