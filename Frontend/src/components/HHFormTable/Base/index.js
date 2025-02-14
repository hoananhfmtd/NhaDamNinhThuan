// @Huuhoai2002

import {
    Check,
    ClearOutlined,
    DeleteForeverRounded,
} from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Autocomplete, IconButton, TextField, Tooltip } from '@mui/material';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { MyButton } from '../..';
import Api from '../../../api';
import { convertStringToNumber, formatVietNamNumber } from '../../../helpers';
import '../../../styles/paper.css';
import { useBaseContext } from '../BaseProvider';
import { TableProvider } from './TableContext';
import { TableRowProvider } from './TableRowContext';
import './index.scss';

const Control = React.forwardRef(
    ({ name, control, children, ...props }, ref) => {
        const { field } = useController({
            control,
            name,
        });
        const id = React.useId();
        return React.Children.map(children, (child) => {
            return React.cloneElement(child, {
                id: id,
                ...props,
                ...field,
                ref: ref,
            });
        });
    }
);

const Input = React.forwardRef((props, ref) => {
    const {
        capitalizeValue,
        textCenter,
        none,
        fontSize,
        removeText,
        is = 'textarea',
        height,
        width,
        name,
        placeholderStyle,
        style,
        bordered,
        dashed,
        solid,
        dotted,
        flat,
        small,
        children,
        id,
        type,
        errorMessage,
        ..._props
    } = props;

    useEffect(() => {
        const element = document.getElementById(id);
        if (is !== 'textarea' || !element) return;
        element.style.height = '40px';
        const handleResize = () => {
            element.style.height = 'auto';
            element.style.height = element.scrollHeight + 'px';
        };
        element.addEventListener('input', handleResize);

        return () => {
            element.removeEventListener('input', handleResize);
        };
    }, [is, id]);

    useEffect(() => {
        const element = document.getElementById(id);
        if (is !== 'textarea' || !element) return;
        const handleResize = () => {
            element.style.height = 'auto';
            element.style.height = element.scrollHeight + 'px';
        };
        handleResize();
    }, [props?.value, is, id]);

    const { isPrint } = useBaseContext();

    return (
        <div
            data-name={name}
            className="form form-input"
            style={{ position: 'relative', width: width ?? '100%' }}
        >
            <div
                className="form form-input__container"
                style={{
                    width: width || '100%',
                }}
            >
                {React.createElement(is === 'textarea' ? 'textarea' : 'input', {
                    className: classNames('form-input__input', {
                        'placeholder-bold': placeholderStyle?.bold || false,
                        'placeholder-fill': placeholderStyle?.fill || false,
                        'form-input__input--bordered': false || false,
                        'form-input__input--dashed': dashed || false,
                        'form-input__input--solid': solid || false,
                        'form-input__input--dotted': dotted || false,
                        'form-input__input--none': none || false,
                    }),
                    id: id,
                    ref: ref,
                    rows: 1,
                    type: 'text',
                    "input-data-name": name,
                    style:
                        is === 'textarea'
                            ? {
                                ...style,
                                width: width || '100%',
                                height: 45,
                                textAlign: textCenter ? 'center' : 'left',
                                lineHeight: '1.3rem',
                                paddingRight: removeText ? 0 : 30,
                                fontSize: fontSize || 17,
                            }
                            : {
                                ...style,
                                textAlign: textCenter ? 'center' : 'left',
                                width: width || '100%',
                                height: height || 30,
                                paddingRight: removeText ? 0 : 30,
                                fontSize: fontSize || 17,
                                border: flat
                                    ? 'none'
                                    : '1px solid rgb(196 196 196)',
                            },
                    ..._props,
                    value:
                        type === 'number'
                            ? formatVietNamNumber(_props?.value, 2)
                            : (_props?.value ?? ''),
                    onKeyDown: (e) => {
                        if (type !== 'number') return;
                        if (
                            e.key === 'e' ||
                            e.key === 'E' ||
                            e.key === '+' ||
                            e.key === '-'
                        ) {
                            e.preventDefault();
                        }
                    },
                    onChange: (e) => {
                        let _value = e.target.value;
                        if (capitalizeValue) {
                            _value = _value.toUpperCase();
                        }
                        if (_value === '') {
                            _props?.onChange?.();
                            return;
                        }
                        // console.log(convertStringToNumber(_value), 11111)
                        _props?.onChange?.(
                            type === 'number'
                                ? convertStringToNumber(_value)
                                : _value
                        );
                    },
                })}
                {!props?.readOnly && !removeText && !isPrint && (
                    <div className="prepend" tabIndex={-1}>
                        <IconButton
                            aria-label="fingerprint"
                            size="small"
                            disabled={_props?.disabled}
                            data-target={id}
                            onClick={() => {
                                if (_props?.disabled) return;
                                // _props?.onChange?.(type === 'number' ? 0 : '');
                                _props?.onChange?.(
                                    type === 'number' ? null : ''
                                );
                            }}
                        >
                            <ClearOutlined
                                style={{
                                    width: 14,
                                    height: 14,
                                    color: '#000',
                                    opacity: 0.3,
                                }}
                            />
                        </IconButton>
                    </div>
                )}
            </div>
            {children && (
                <div
                    style={{
                        flexShrink: 0,
                        fontSize: '1rem',
                    }}
                >
                    {children}
                </div>
            )}
            {errorMessage && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: -18,
                    }}
                >
                    <span
                        className="no_print"
                        style={{
                            color: 'red',
                            fontSize: 12,
                            lineHeight: 1,
                        }}
                    >
                        {errorMessage}
                    </span>
                </div>
            )}
        </div>
    );
});

// const Editor = ({ onChange, ...props }) => {
//     return (
//         <TinyEditor
//             init={{
//                 menubar: false,
//                 anchor_bottom: false,
//                 statusbar: false,
//                 max_height: 100,
//                 menu: false,
//                 contextmenu: 'link image imagetools table spellchecker',
//             }}
//             apiKey="5w04umc6pbjaxiwpjwl0tneqheyei6mmm3kbcobbtbjq9wpn"
//         ></TinyEditor>
//     );
// };

const Heading = React.forwardRef(
    ({ children, width, height, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className="center bold table-heading"
                width={width}
                height={height}
                {...props}
            >
                {children}
            </th>
        );
    }
);

const Head = ({ children, ...props }) => {
    return (
        <thead id="table-head" {...props}>
            {children}
        </thead>
    );
};

const Row = React.forwardRef(
    (
        { children, onRemove, onAdd, index, isOnlyLastCell, heading, ...props },
        ref
    ) => {
        // const { isPrint } = useBaseContext();

        return (
            <>
                <tr ref={ref} {...props}>
                    {children}
                    {/* {!isPrint && heading && <Table.Heading>Hành động</Table.Heading>}
                {!isPrint && !heading && (
                    <Cell center>
                        <Stack
                            style={{
                                margin: '0 auto',
                            }}
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            justifyContent="center"
                        >
                            <Tooltip title={Boolean(onAdd) ? 'Thêm một dòng vào sau hàng' : 'Hàng này được cố định,không thể thêm'}>
                                <span>
                                    <IconButton aria-label={Boolean(onAdd) ? 'Thêm một dòng vào sau hàng' : 'Hàng này được cố định,không thể thêm'} size="small" onClick={onAdd} disabled={!Boolean(onAdd) || isOnlyLastCell}>
                                        <AddCircleOutlineRounded />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title={Boolean(onRemove) ? 'Xóa dòng' : 'Hàng này không thể xóa'}>
                                <span>
                                    <IconButton aria-label={Boolean(onRemove) ? 'Xóa dòng' : 'Hàng này không thể xóa'} size="small" onClick={onRemove} disabled={!Boolean(onRemove) || isOnlyLastCell}>
                                        <DeleteForeverRounded />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Cell>
                )} */}
                </tr>
            </>
        );
    }
);

const Cell = ({ children, center, ...props }) => {
    return (
        <td
            className={classNames('table-cell', {
                center: center,
            })}
            {...props}
            rowSpan={props?.rowSpan?.toString()}
            colSpan={props?.colSpan?.toString()}
        >
            {children}
        </td>
    );
};

// const Menu = React.forwardRef(({ config, handleAddRow, handleClose, ...props }, ref) => {
//     const stackRef = useRef(null);

//     const { isPrint } = useBaseContext();
//     React.useEffect(() => {
//         if (isPrint) {
//             stackRef.current.style.display = 'none';
//         } else {
//             stackRef.current.style.display = 'flex';
//         }
//     }, [isPrint]);
//     return (
//         <div {...props} className="portal-table-menu" ref={ref}>
//             <Stack ref={stackRef} direction="column" alignItems="center" spacing={1}>
//                 <Tooltip title="Thêm một dòng mới" key={uuidv4()}>
//                     <IconButton aria-label="Thêm một dòng mới" size="medium" onClick={handleAddRow}>
//                         <AddCircleOutlineRounded />
//                     </IconButton>
//                 </Tooltip>
//                 {/* <Tooltip title="Xóa dòng" key={uuidv4()}>
//                     <IconButton aria-label="Xóa dòng" size="medium" onClick={handleRemoveRow}>
//                         <DeleteForeverRounded />
//                     </IconButton>
//                 </Tooltip> */}
//             </Stack>
//         </div>
//     );
// });

const TopContent = ({ children, titleEditable, ...props }) => {
    return (
        <div className="table-top">
            <div
                className="column"
                style={{
                    maxWidth: 500,
                }}
            >
                {children}
                <p className="desc-litle">
                    “Đề án tổng kiểm kê tài nguyên nước quốc gia,
                    <br /> giai đoạn đến năm 2025”
                </p>
            </div>
            <div
                className="column"
                style={{
                    minWidth: 600,
                }}
            >
                <h6 className="title" style={{ textAlign: 'center' }}>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </h6>
                <h2
                    className="desc"
                    style={{ textAlign: 'center', fontSize: '18px' }}
                >
                    Độc lập - Tự do - Hạnh phúc
                </h2>
            </div>
        </div>
    );
};

const BottomCell = ({ children, title, description, ...props }) => {
    const uid = React.useId();
    return (
        <>
            <div>
                <label htmlFor={uid} className="item">
                    <h5 style={{ fontSize: '18px' }} className="title">
                        {title}
                    </h5>
                    <p className="desc" style={{ fontSize: '18px' }}>
                        {description}
                    </p>
                </label>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        ...props,
                        id: uid,
                    });
                })}
            </div>
        </>
    );
};

const Date = ({ children, ...props }) => {
    return (
        <div className="date" {...props}>
            {children}
        </div>
    );
};

const BotttomContent = ({ children, renderDate, ...props }) => {
    return (
        <div className="wrapper" {...props}>
            {renderDate}
            <div className="info">
                {children}
                {/* <div className="item">
                    <span className="title">Người lập biểu</span>
                    <p className="desc"> (Ký và ghi rõ họ tên)</p>
                </div>
                <div className="item">
                    <span className="title">Người kiểm tra</span>
                    <p className="desc"> (Ký và ghi rõ họ tên)</p>
                </div>
                <div className="item">
                    <span className="title">Cơ quan thực hiện</span>
                    <p className="desc"> (Ký, đóng dấu, họ tên)</p>
                </div> */}
            </div>
        </div>
    );
};

const Base = React.forwardRef(
    (
        {
            children,
            title,
            subTitle,
            renderTopContent,
            renderBottomContent,
            titleEditable,
            form,
            renderSubContent,
            renderTitle,
            renderAction,
            ...props
        },
        ref
    ) => {
        return (
            <TableProvider>
                <div
                    ref={ref}
                    id="table"
                    style={{
                        padding: '16px',
                        backgroundColor: '#fff',
                    }}
                    className="form form-table"
                >
                    {renderAction && renderAction}
                    <div className="base">
                        {renderTopContent && renderTopContent}
                        <div className="table-body">
                            {renderTitle && renderTitle}
                            <h5
                                className="title"
                                style={{ fontSize: '21px' }}
                                dangerouslySetInnerHTML={{
                                    __html: `<span>
                                ${title?.split(';')[0] || ''}
                            </span>
                            <span>
                                ${title?.split(';')[1] || ''}
                            </span>
                            `,
                                }}
                            ></h5>
                        </div>
                        {renderSubContent && renderSubContent}
                        <div className="table-body">
                            <h5
                                className="subTitle"
                                style={{ fontSize: '18px' }}
                            >
                                {subTitle}
                            </h5>
                        </div>
                    </div>
                    {form ? (
                        <div className="form-container">{children}</div>
                    ) : (
                        <table>{children}</table>
                    )}
                    <div className="bottom">{renderBottomContent}</div>
                </div>
            </TableProvider>
        );
    }
);

const Body = React.forwardRef(({ children, ...props }, ref) => {
    return (
        <tbody id="table-body" ref={ref} {...props}>
            {children}
        </tbody>
    );
});

const MultipleRow = ({ children, handleAddRow, name, ...props }) => {
    // const { ref, state, handleOpen } = useTableRowContext();
    // const MenuPortal = useMemo(() => {
    //     return createPortal(
    //         <Menu
    //             style={{
    //                 top: state?.position?.top,
    //                 right: 8,
    //                 position: 'fixed',
    //                 display: state?.position?.top ? 'block' : 'none',
    //             }}
    //             handleAddRow={handleAddRow}
    //         />,
    //         document.getElementById('root'),
    //     );

    //
    // }, [state?.position]);

    return (
        <>
            {React.Children.map(children, (child, index) => {
                return React.cloneElement(child, {
                    className: classNames(`table-multiple-row ${name}`, {
                        'table-multiple-row__is-first': index === 0,
                        'table-multiple-row__is-last':
                            index === children.length - 1,
                    }),
                });
            })}
        </>
    );
};

const Label = ({ children, htmlFor, description, thin, ...props }) => {
    return (
        <>
            <label
                htmlFor={htmlFor}
                className="form form-label"
                style={{
                    fontWeight: thin ? 400 : 700,
                    fontSize: 15,
                }}
                {...props}
            >
                {children}
                {description && (
                    <span className="form-label__description">
                        {description}
                    </span>
                )}
            </label>
        </>
    );
};

const Group = ({ children, wrap, direction = 'row', ...props }) => {
    return (
        <div
            className="form form-group"
            {...props}
            style={{
                flexWrap: wrap ? 'wrap' : 'nowrap',
                // display: !noFlex ? 'flex' : 'block',
                flexDirection: direction,
                alignItems: direction === 'column' ? 'flex-start' : 'center',
            }}
        >
            {children}
        </div>
    );
};

const GroupItem = ({
    required,
    children,
    label,
    labelStyles,
    descStyles,
    special,
    description,
    fullWidth = true,
    ...props
}) => {
    const uid = React.useId();
    return (
        <div
            className="form-group__item"
            style={{
                display: !special ? 'flex' : 'block',
                width: fullWidth ? '100%' : 'auto',
            }}
            {...props}
        >
            <Label
                htmlFor={uid}
                style={{
                    fontWeight: labelStyles?.bold ? 700 : 400,
                    cursor: Boolean(children) ? 'pointer' : 'default',
                    fontSize: 15,
                    ...labelStyles?.style,
                }}
            >
                <div style={{ display: 'flex' }}>
                    {label}
                    {required && (
                        <span
                            className="no_print"
                            style={{ color: 'red', marginLeft: 5 }}
                        >
                            *
                        </span>
                    )}
                    {description && (
                        <h5
                            className="form-label__description"
                            style={{
                                marginTop: '3px',
                                fontSize: 15,
                                ...descStyles?.style,
                            }}
                        >
                            {description}
                        </h5>
                    )}
                </div>
            </Label>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    ...props,
                    id: uid,
                });
            })}
        </div>
    );
};

const GroupItemSelect = ({
    required,
    children,
    label,
    labelStyles,
    descStyles,
    special,
    description,
    fullWidth = true,
    ...props
}) => {
    const uid = React.useId();
    return (
        <div
            className="form-group__item"
            style={{
                display: !special ? 'flex' : 'block',
                width: fullWidth ? '70%' : 'auto',
            }}
            {...props}
        >
            <Label
                htmlFor={uid}
                style={{
                    fontWeight: labelStyles?.bold ? 700 : 400,
                    fontSize: 15,
                    cursor: Boolean(children) ? 'pointer' : 'default',
                    ...labelStyles?.style,
                }}
            >
                {label}
                {required && (
                    <span style={{ color: 'red', marginLeft: 5 }}>*</span>
                )}
                {description && (
                    <span
                        className="form-label__description"
                        style={{
                            ...descStyles?.style,
                        }}
                    >
                        {description}
                    </span>
                )}
            </Label>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    ...props,
                    id: uid,
                });
            })}
        </div>
    );
};
const BaseRadio = React.forwardRef(
    (
        {
            multiple,
            children,
            label,
            control,
            controlName,
            value,
            allowRemoveChecked,
            defaultValueIfUnchecked,
            ...props
        },
        ref
    ) => {
        const uid = React.useMemo(() => uuidv4());
        const watch = useWatch({
            control,
        });
        const isChecked = multiple
            ? (Array.isArray(watch) ? watch : []).includes(value)
            : watch[controlName] === value;

        const handleClick = () => {
            // Đảm bảo watch là mảng, nếu không phải thì khởi tạo với mảng rỗng
            const currentWatch = Array.isArray(watch) ? watch[controlName] : [];

            if (allowRemoveChecked && isChecked) {
                props?.onChange?.(
                    multiple ? currentWatch.filter((v) => v !== value) : ''
                );
                props?.onSelected(multiple ? currentWatch.filter((v) => v !== value) : '');
                return;
            }
            if (multiple) {
                props?.onChange?.(
                    isChecked
                        ? currentWatch.filter((v) => v !== value)
                        : [...currentWatch, value]
                );
                props?.onSelected(isChecked
                    ? currentWatch.filter((v) => v !== value)
                    : [...currentWatch, value]);
            } else {
                props?.onChange?.(value);
                props?.onSelected?.(value);
            }
        };

        return (
            <div className="base-radio" style={{ marginTop: '5px' }}>
                {label && (
                    <label
                        htmlFor={uid}
                        className="form-input__radio__label"
                        style={{ fontSize: '15px' }}
                    >
                        {label}
                    </label>
                )}
                <div
                    className="form-input__radio"
                    style={{ border: '1px solid #c4c4c4' }}
                    onClick={() => {
                        handleClick();
                    }}
                >
                    <input
                        id={uid}
                        type={multiple ? 'checkbox' : 'radio'}
                        checked={isChecked}
                        style={{ display: 'none' }}
                        {...props}
                        value={JSON.stringify(value)}
                        readOnly
                    />
                    {isChecked && <span>✔</span>}
                </div>
            </div>
        );
    }
);
const RadioGroupControl = React.forwardRef(
    (
        {
            multiple,
            readOnly,
            disabled,
            children,
            items,
            control,
            name,
            allowRemoveChecked = false,
            defaultValueIfUnchecked,
            wrap,
            direction,
            ...props
        },
        ref
    ) => {
        const { field } = useController({
            control,
            name,
            disabled,
        });

        return (
            <div
                className="form-group"
                style={{
                    flexWrap: wrap ? 'wrap' : 'nowrap',
                    flexDirection: direction,
                    alignItems:
                        direction === 'column' ? 'flex-start' : 'center',
                }}
            >
                {items
                    ?.filter((i) => !i?.type)
                    .map((item) => (
                        <BaseRadio
                            key={uuidv4()}
                            // multiple={multiple}
                            {...props}
                            label={item?.label}
                            disabled={item?.disabled}
                            controlName={name}
                            control={control}
                            {...field}
                            value={item?.value}
                            allowRemoveChecked={allowRemoveChecked}
                            defaultValueIfUnchecked={defaultValueIfUnchecked}
                        />
                    ))}
            </div>
        );
    }
);

const BaseCheckbox = React.forwardRef(
    (
        {
            children,
            label,
            control,
            controlName,
            value,
            allowRemoveChecked,
            defaultValueIfUnchecked,
            ...props
        },
        ref
    ) => {
        const uid = React.useId();
        const watch = useWatch({
            control,
        });
        const checked = watch[controlName]
            ? watch[controlName] === value
            : defaultValueIfUnchecked === value;

        const handleClick = () => {
            if (allowRemoveChecked && checked) {
                props?.onChange?.('');
                return;
            }
        };

        return (
            <label htmlFor={uid} className="base-radio" onClick={handleClick}>
                {label && (
                    <span className="form-input__radio__label">{label}</span>
                )}
                <div className="form-input__radio">
                    <input
                        id={uid}
                        type="checkbox"
                        checked={checked}
                        style={{
                            display: 'none',
                        }}
                        {...props}
                        value={value}
                        onChange={(e) => {
                            const _value = e.target.value;
                            props?.onChange?.(_value);
                        }}
                    />
                    {checked && <Check />}
                </div>
            </label>
        );
    }
);

const CheckboxGroupControl = React.forwardRef(
    (
        {
            disabled,
            items,
            control,
            name,
            allowRemoveChecked = false,
            defaultValueIfUnchecked,
            wrap,
            direction,
            ...props
        },
        ref
    ) => {
        const { field } = useController({
            control,
            name,
            disabled,
        });

        return (
            <div
                className="form-group"
                style={{
                    flexWrap: wrap ? 'wrap' : 'nowrap',
                    // display: !noFlex ? 'flex' : 'block',
                    flexDirection: direction,
                    alignItems:
                        direction === 'column' ? 'flex-start' : 'center',
                }}
            >
                {items
                    ?.filter((i) => !i?.type)
                    .map((item) => (
                        <BaseCheckbox
                            key={uuidv4()}
                            label={item?.label}
                            disabled={item?.disabled}
                            checked={item.checked}
                            controlName={name}
                            control={control}
                            {...field}
                            value={item?.value}
                            allowRemoveChecked={allowRemoveChecked}
                            defaultValueIfUnchecked={defaultValueIfUnchecked}
                        />
                    ))}
            </div>
        );
    }
);

const GroupContainer = ({ children, title, styles, ...props }) => {
    return (
        <div className="form-group__container">
            <div
                className="form-group__container__title"
                style={{ ...styles?.title }}
            >
                {title}
            </div>
            <div className="children">{children}</div>
        </div>
    );
};

const Container = ({ children, title, styles, ...props }) => {
    return (
        <div
            className="form-group__container--map"
            style={{
                ...styles?.container,
            }}
        >
            <div className="children">{children}</div>
        </div>
    );
};

const MonthControl = React.memo(({ control, name, special = false }) => {
    return (
        <>
            {!special &&
                new Array(12).fill(0).map((field, index) => (
                    <Table.Row key={uuidv4()}>
                        <Table.Cell center>-</Table.Cell>
                        <Table.Cell>Tháng {index + 1}</Table.Cell>
                        <Table.Cell>
                            <Table.Control
                                name={`${name}.thang${index + 1}`}
                                control={control}
                            >
                                <Table.Input is="input" type="number" flat />
                            </Table.Control>
                        </Table.Cell>
                        <Table.Cell>
                            <Table.Control
                                name={`ghiChu.${name}.thang${index + 1}`}
                                control={control}
                            >
                                <Table.Input />
                            </Table.Control>
                        </Table.Cell>
                    </Table.Row>
                ))}

            {special &&
                new Array(12).fill(0).map((field, index) => {
                    if (index === 0) {
                        return (
                            <Table.Row key={uuidv4()}>
                                <Table.Cell center>4.{index + 1}</Table.Cell>
                                <Table.Cell>Tháng {index + 1}</Table.Cell>
                                <Table.Cell center rowSpan="12">
                                    mm
                                </Table.Cell>
                                <Table.Cell>
                                    <Table.Control
                                        name={`${name}.thang${index + 1}`}
                                        control={control}
                                    >
                                        <Table.Input
                                            is="input"
                                            type="number"
                                            flat
                                        />
                                    </Table.Control>
                                </Table.Cell>
                                <Table.Cell>
                                    <Table.Control
                                        name={`ghiChu.${name}.thang${index + 1}`}
                                        control={control}
                                    >
                                        <Table.Input />
                                    </Table.Control>
                                </Table.Cell>
                            </Table.Row>
                        );
                    } else {
                        return (
                            <Table.Row key={uuidv4()}>
                                <Table.Cell center>4.{index + 1}</Table.Cell>
                                <Table.Cell>Tháng {index + 1}</Table.Cell>
                                <Table.Cell>
                                    <Table.Control
                                        name={`${name}.thang${index + 1}`}
                                        control={control}
                                    >
                                        <Table.Input
                                            is="input"
                                            type="number"
                                            flat
                                        />
                                    </Table.Control>
                                </Table.Cell>
                                <Table.Cell>
                                    <Table.Control
                                        name={`ghiChu.${name}.thang${index + 1}`}
                                        control={control}
                                    >
                                        <Table.Input />
                                    </Table.Control>
                                </Table.Cell>
                            </Table.Row>
                        );
                    }
                })}
        </>
    );
});

const UploadFiles = ({
    keyIndex,
    initialValues,
    onChange,
    title = '',
    ...props
}) => {
    const [buckget, setBuckget] = React.useState(initialValues || []);
    const [files, setFiles] = React.useState([]);
    React.useEffect(() => {
        if (!initialValues) return;
        setBuckget([...initialValues]);
    }, [initialValues]);
    const handleUploadFiles = async (files) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                formData.append('files', file);
            }
            const response = await new Api().UploadFile({ data: formData });
            if (Array.isArray(response)) {
                setBuckget([...buckget, ...response]);
                onChange([...buckget, ...response]);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
        }
    };
    const deleteFile = (file) => {
        const _buckget = buckget.filter(
            (item) => item?.file_path !== file?.file_path
        );
        setBuckget(_buckget);
        onChange(_buckget);
    };
    React.useEffect(() => {
        if (files.length === 0) return;
        handleUploadFiles(files);
    }, [files]);

    React.useEffect(() => {
        onChange(buckget);
    }, [buckget]);
    const id = React.useId();

    return (
        <div {...props}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <p>{title}</p>
            </div>
            {buckget.length === 0 ? (
                <h6>Chưa chọn ảnh nào!</h6>
            ) : (
                <div className="images-list">
                    {buckget?.length > 0 &&
                        buckget.map((item, index) => (
                            <div key={keyIndex}>
                                <img
                                    height={300}
                                    src={new Api().getImage(item?.file_path)}
                                    alt=""
                                />
                                <Tooltip title="Xóa ảnh">
                                    <IconButton
                                        aria-label={'Xóa ảnh'}
                                        size="small"
                                        onClick={() => deleteFile(item)}
                                    >
                                        <DeleteForeverRounded
                                            sx={{
                                                width: 16,
                                                height: 16,
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        ))}
                </div>
            )}

            <label
                className="no_print"
                htmlFor={'input' + id}
                style={{ paddingTop: 12 }}
            >
                <MyButton
                    variant="outlined"
                    component="span"
                    txt="Chọn ảnh"
                    mt={5}
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                />
                <input
                    id={'input' + id}
                    type="file"
                    multiple
                    style={{
                        display: 'none',
                    }}
                    onChange={(e) => {
                        console.log(e.target.files);
                        setFiles(e.target.files);
                    }}
                />
            </label>
        </div>
    );
};

const UploadFilesDeltail = ({ initialValues, onChange, ...props }) => {
    const [buckget, setBuckget] = React.useState(initialValues || []);
    const [files, setFiles] = React.useState([]);
    React.useEffect(() => {
        if (!initialValues) return;
        setBuckget([...initialValues]);
    }, [initialValues]);

    const handleUploadFiles = async (files) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                formData.append('files', file);
            }
            const response = await new Api().UploadFile({ data: formData });
            if (Array.isArray(response)) {
                setBuckget([...buckget, ...response]);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
        }
    };
    React.useEffect(() => {
        if (files.length === 0) return;
        handleUploadFiles(files);
    }, [files]);

    React.useEffect(() => {
        onChange(buckget);
    }, [buckget]);

    return (
        <div {...props}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            ></div>
            {buckget.length === 0 ? (
                <h6>Chưa có sơ đồ!</h6>
            ) : (
                <div className="images-list">
                    {buckget?.length > 0 &&
                        buckget.map((item, index) => (
                            <div key={item?.file_path ?? index}>
                                <img
                                    height={300}
                                    src={new Api().getImage(item?.file_path)}
                                    alt=""
                                />
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

const MySelectOptions = React.forwardRef(
    (
        {
            fontWeight,
            width,
            onChange,
            control,
            name,
            options,
            value,
            initialValues,
            defaultValue,
            errorMessage,
            ...props
        },
        ref
    ) => {
        // const { field } = useController({
        //     control,
        //     name,
        // });
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                <Autocomplete
                    // {...field}
                    fullWidth
                    name={name}
                    value={value}
                    onChange={onChange}
                    options={options}
                    getOptionLabel={(option, index) => {
                        return typeof option === 'string'
                            ? option
                            : typeof option === 'object'
                                ? option[name]
                                : '';
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            sx={{
                                '.MuiFormHelperText-root': {
                                    color: '#f44335 !important',
                                    marginTop: '5px !important',
                                    marginRight: '0px',
                                    marginLeft: '0px',
                                    paddingLeft: '5px !important',
                                    fontSize: '12pt',
                                },
                            }}
                        />
                    )}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '4.5px',
                            paddingLeft: '5px',
                            fontSize: '12pt',
                            color: 'black',
                            fontFamily: 'Times New Roman',
                            borderRadius: '5px',
                            height: '33px',
                            fontWeight: fontWeight ? 'bold' : 'normal',
                            width: width || '26vw',

                            '& .MuiAutocomplete-input': {
                                height: '100%',
                                padding: '0px',
                                textOverflow: 'ellipsis',
                            },
                            '& .MuiAutocomplete-tag': {
                                height: '100%',
                                marginBottom: '-2px',
                            },
                        },
                    }}
                />
                {errorMessage && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -18,
                        }}
                    >
                        <span
                            className="no_print"
                            style={{
                                color: 'red',
                                fontSize: 12,
                                lineHeight: 1,
                            }}
                        >
                            {errorMessage}
                        </span>
                    </div>
                )}
            </div>
        );
    }
);

const MySelectOptions22 = React.forwardRef(
    (
        {
            readOnly,
            height,
            freeSolo,
            width,
            limitTags,
            multiple,
            onChange,
            control,
            name,
            options,
            value,
            initialValues,
            defaultValue,
            errorMessage,
            ...props
        },
        ref
    ) => {
        // const { field } = useController({
        //     control,
        //     name,
        // });
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                <Autocomplete
                    // {...field}
                    freeSolo={freeSolo}
                    readOnly={readOnly}
                    multiple={multiple}
                    fullWidth
                    name={name}
                    limitTags={limitTags}
                    value={value}
                    onChange={onChange}
                    options={options}
                    getOptionLabel={(option) => {
                        if (!option) return '';
                        if (typeof option === 'string') return option;
                        if (typeof option === 'object' && option[name])
                            return option[name];
                        return '';
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            sx={{
                                '.MuiFormHelperText-root': {
                                    color: '#f44335 !important',
                                    marginTop: '5px !important',
                                    marginRight: '0px',
                                    marginLeft: '0px',
                                    paddingLeft: '5px !important',
                                    fontSize: '12px',
                                },
                                backgroundColor: '#fff !important',
                            }}
                        />
                    )}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '4.5px',
                            paddingLeft: '5px',
                            fontSize: '13px',
                            borderRadius: '5px',
                            height: 'fit-content',
                            width: width,
                            '& .MuiAutocomplete-input': {
                                height: '100%',
                                padding: '0px',
                                textOverflow: 'ellipsis',
                            },
                            '& .MuiAutocomplete-tag': {
                                height: '100%',
                                marginBottom: '-2px',
                            },
                        },
                    }}
                />
                {errorMessage && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -18,
                        }}
                    >
                        <span
                            className="no_print"
                            style={{
                                color: 'red',
                                fontSize: 12,
                                lineHeight: 1,
                            }}
                        >
                            {errorMessage}
                        </span>
                    </div>
                )}
            </div>
        );
    }
);

const Table = {
    Input: React.memo(Input),
    Heading: React.memo(Heading),
    Row: React.memo(Row),
    Head: React.memo(Head),
    Base: React.memo(Base),
    Body: React.memo(Body),
    Cell: React.memo(Cell),
    // Editor: React.memo(Editor),
    MultipleRow: (props) => (
        <TableRowProvider>
            <MultipleRow {...props} />
        </TableRowProvider>
    ),
    Control: React.memo(Control),
    TopContent: React.memo(TopContent),
    BottomContent: React.memo(BotttomContent),
    BottomCell: React.memo(BottomCell),
    Date: React.memo(Date),
    MonthControl,
    UploadFiles,
    UploadFilesDeltail,
};

const Form = {
    Input: React.memo(Input),
    Base: React.memo(Base),
    // Editor: React.memo(Editor),
    MultipleRow: (props) => (
        <TableRowProvider>
            <MultipleRow {...props} />
        </TableRowProvider>
    ),
    Control: React.memo(Control),
    TopContent: React.memo(TopContent),
    BottomContent: React.memo(BotttomContent),
    Group: React.memo(Group),
    GroupItem: React.memo(GroupItem),
    GroupItemSelect: React.memo(GroupItemSelect),
    Label: React.memo(Label),
    RadioGroupControl: React.memo(RadioGroupControl),
    BottomCell: React.memo(BottomCell),
    Date: React.memo(Date),
    GroupContainer: React.memo(GroupContainer),
    Container: React.memo(Container),
    CheckboxGroupControl: React.memo(CheckboxGroupControl),
    UploadFiles,
    UploadFilesDeltail,
    MySelectOptions,
    MySelectOptions22,
};

export { Form, Table };

