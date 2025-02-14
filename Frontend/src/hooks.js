import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import Api from './api';

const usePrintForm = ({
    formName,
    getContent,
    passingRefCurrent = true,
    fontSize = '24px',
}) => {
    const formRef = useRef(null);
    let formNameElement = null;
    const handlePrint = useReactToPrint({
        onBeforeGetContent: () => {
            const form = formRef.current;
            formNameElement = document.createElement('div');
            formNameElement.style.textAlign = 'right';
            formNameElement.style.fontWeight = 'bold';
            formNameElement.style.fontSize = fontSize;
            formNameElement.style.marginBottom = '8px';
            formNameElement.style.textDecoration = 'underline';
            formNameElement.innerText = formName;
            form.prepend(formNameElement);
        },
        content: () =>
            getContent(passingRefCurrent ? formRef.current : formRef),
        onAfterPrint: () => {
            if (formNameElement) {
                formNameElement.remove();
                formNameElement = null;
            }
        },
        onPrintError: (err) => {
            if (formNameElement) {
                formNameElement.remove();
                formNameElement = null;
            }
            console.error('Print Error: ', err);
        },
    });

    return { formRef, handlePrint };
};

export default usePrintForm;

function useIsFirstRender() {
    const isFirstRender = useRef(true);

    React.useEffect(() => {
        isFirstRender.current = false;
    }, []);

    return isFirstRender.current;
}

function useStores() {
    const canBoDieuTras = useSelector(
        (state) => state.app?.canBoDieuTras || []
    );
    const { scope, ...auth } = useSelector((state) => state.auth);
    const tinhThanhs = useSelector(
        (state) => state.app?.DanhMucs?.tinhThanhs || []
    );
    const _luuVucSongs = useSelector((state) => state.app?.luuVucSongs || []);
    const _luuVucSongLienTinhs = useSelector(
        (state) => state.app?.DanhMucs?.luuVucSongLienTinhs || []
    );

    const luuVucSongs = React.useMemo(() => {
        let items = [];
        if (scope === 'tw' || scope === 'dvtt') {
            return _luuVucSongLienTinhs
                ?.map((i) => ({
                    label: i.tenMuc,
                    value: i.maMuc,
                    is: 'luuVucSongLienTinhIds',
                    hint: 'Liên tỉnh',
                    target: 'multiple',
                    scope: 'tw',
                    ...i,
                }))
                ?.sort((a, b) => -1 * a.hint.localeCompare(b.hint));
        } else if (scope === 'tinh') {
            items.push(
                ..._luuVucSongLienTinhs?.map((i) => ({
                    label: i.tenMuc,
                    value: i.maMuc,
                    is: 'luuVucSongLienTinhIds',
                    hint: 'Liên tỉnh',
                    target: 'multiple',
                    scope: 'tw',
                    ...i,
                })),
                ..._luuVucSongs
                    ?.filter(
                        (s) =>
                            s.loai === 'noitinh' || s.loai === 'noitinhdoclap'
                    )
                    .map((i) => ({
                        label: i.tenMuc,
                        value: i.maMuc,
                        is: 'luuVucSongNoiTinhIds',
                        hint: 'Nội tỉnh/nội tỉnh độc lập',
                        target: 'multiple',
                        scope: 'tinh',
                        ...i,
                    }))
            );
        }
        // if (scope === "tw") {
        //     return _luuVucSongs.map(i => ({
        //         label: i.tenMuc,
        //         value: i.loai === "noitinh" ? i.luuVucSongLienTinhMa : i.maMuc,
        //         is: i.loai === "noitinhdoclap" ? 'luuVucSongNoiTinhIds' : i.loai === "lientinh" ? "luuVucSongLienTinhIds" : "luuVucSongLienTinhLienKetNoiTinhIds",
        //         hint: i.loai === "noitinh" ? "Nội tỉnh" : i.loai === "lientinh" ? "Liên tỉnh" : "Nội tỉnh độc lập",
        //         target: 'multiple',
        //         scope: 'tw',
        //         ...i
        //     }))?.sort((a, b) => -1 * a.hint.localeCompare(b.hint));
        // }
        // else if (scope === "tinh") {
        //     items.push(..._luuVucSongs?.filter(s => (s.loai === "noitinh") || (s.loai === "noitinhdoclap")).map(i => ({
        //         label: i.tenMuc,
        //         value: i.maMuc,
        //         is: 'luuVucSongIds',
        //         hint: "Nội tỉnh/nội tỉnh độc lập",
        //         target: 'multiple',
        //         scope: 'tinh',
        //         ...i
        //     })))
        // }
        // else if (scope === "dvtt") {
        //     items.push(..._luuVucSongs?.filter(s => s.loai === "lientinh").map(i => ({
        //         label: i.tenMuc,
        //         value: i.maMuc,
        //         is: 'luuVucSongIds',
        //         hint: "Liên tỉnh",
        //         target: 'multiple',
        //         scope: 'dvtt',
        //         ...i
        //     })))
        // }
        return items;
    }, [_luuVucSongs, scope]);

    const __coQuanThucHiens = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const loaiCongTrinhs = useSelector(
        (state) => state.app?.DanhMucs?.loaiCongTrinhs
    );
    const mucDichSuDungs = useSelector(
        (state) => state.app?.DanhMucs?.mucDichSuDungs
    );
    const loaiHinhNuocThais = useSelector(
        (state) => state.app?.DanhMucs?.loaiHinhNuocThais
    );

    const [quanHuyens, setQuanHuyens] = React.useState([]);
    const [phuongXas, setPhuongXas] = React.useState([]);

    const handleGetAddress = React.useCallback(
        async ({ tinhThanhId, quanHuyenId }) => {
            if (tinhThanhId) {
                const response = await new Api().getListAllQuanHuyens({
                    maTinh: tinhThanhId,
                });
                if (response.code === 200) {
                    setQuanHuyens(response.data.records);
                }
            }
            if (quanHuyenId) {
                const response = await new Api().getListAllPhuongXas({
                    maHuyen: quanHuyenId,
                });
                if (response.code === 200) {
                    setPhuongXas(response.data.records);
                }
            }
        },
        []
    );

    const handleClearAddress = React.useCallback(({ tinhThanh, quanHuyen }) => {
        if ((!tinhThanh && !quanHuyen) || tinhThanh) {
            setQuanHuyens([]);
            setPhuongXas([]);
        }
        quanHuyen && setPhuongXas([]);
    }, []);

    const coQuanThucHiens = React.useMemo(() => {
        let items =
            [
                ...(tinhThanhs?.map((i) => ({
                    label: i.tenRutGon,
                    value: i.maTinh,
                    is: 'coQuanThucHienIds',
                    hint: 'Tỉnh/thành phố',
                    target: 'multiple',
                    scope: 'tinh',
                })) ?? []),
            ] || [];
        if (scope === 'tinh') {
            items = items.filter((i) => i.value === auth.tinhThanhId);
        }
        if (scope !== 'tinh') {
            const data = [
                {
                    value: 'tw',
                    label: ' hóa thổ nhưỡng',
                    is: 'scope',
                    hint: 'Phạm vi',
                    target: 'only',
                },
                {
                    value: 'dvtt',
                    label: 'Tất cả các Đơn vị trực thuộc',
                    is: 'scope',
                    hint: 'Phạm vi',
                    target: 'only',
                },
                {
                    value: 'tinh',
                    label: 'Tất cả các Tỉnh',
                    is: 'scope',
                    hint: 'Phạm vi',
                    target: 'only',
                },
            ];
            if (scope === 'dvtt') {
                items?.unshift(
                    ...(__coQuanThucHiens
                        ?.map((i) => ({
                            label: i.tenMuc,
                            value: i.maMuc,
                            is: 'coQuanThucHienIds',
                            hint: 'Cơ quan thực hiện',
                            target: 'multiple',
                            scope: 'dvtt',
                        }))
                        ?.filter((i) => i?.value === auth?.coQuanThucHienId) ??
                        [])
                );
                items?.unshift(...data.slice(2, data.length));
            } else {
                items?.unshift(
                    ...(__coQuanThucHiens?.map((i) => ({
                        label: i.tenMuc,
                        value: i.maMuc,
                        is: 'coQuanThucHienIds',
                        hint: 'Cơ quan thực hiện',
                        target: 'multiple',
                        scope: 'dvtt',
                    })) ?? [])
                );
                items?.unshift(...data);
            }
        }
        return items;
    }, [scope, tinhThanhs, __coQuanThucHiens, auth]);

    const coQuanThucHienFulls = React.useMemo(() => {
        let items =
            [
                ...(tinhThanhs?.map((i) => ({
                    label: i.tenRutGon,
                    value: i.maTinh,
                    is: 'coQuanThucHienIds',
                    hint: 'Tỉnh/thành phố',
                    target: 'multiple',
                    scope: 'tinh',
                })) ?? []),
            ] || [];
        const data = [
            {
                value: 'tw',
                label: 'Viện nông hóa thổ nhưỡng',
                is: 'scope',
                hint: 'Phạm vi',
                target: 'only',
            },
            {
                value: 'dvtt',
                label: 'Tất cả các Đơn vị trực thuộc',
                is: 'scope',
                hint: 'Phạm vi',
                target: 'only',
            },
            {
                value: 'tinh',
                label: 'Tất các cả Tỉnh',
                is: 'scope',
                hint: 'Phạm vi',
                target: 'only',
            },
        ];
        items?.unshift(
            ...(__coQuanThucHiens?.map((i) => ({
                label: i.tenMuc,
                value: i.maMuc,
                is: 'coQuanThucHienIds',
                hint: 'Cơ quan thực hiện',
                target: 'multiple',
                scope: 'dvtt',
            })) ?? [])
        );
        items?.unshift(...data);
        return items;
    }, [tinhThanhs, __coQuanThucHiens]);

    return {
        tinhThanhs,
        coQuanThucHiens,
        canBoDieuTras,
        luuVucSongs,
        __coQuanThucHiens,
        __luuVucSongs: _luuVucSongs,
        quanHuyens,
        phuongXas,
        handleGetAddress,
        handleClearAddress,
        loaiCongTrinhs,
        mucDichSuDungs,
        scope,
        auth,
        coQuanThucHienFulls,
        loaiHinhNuocThais,
    };
}

function useIntersectionObserver({
    initialRows = 500,
    incrementCount = 100,
    data = [],
}) {
    const [visibleRows, setVisibleRows] = useState(initialRows);
    const loadMoreRef = useRef();
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                console.log('entries:::', entries);
                if (entries[0].isIntersecting) {
                    console.log(
                        'Increment count: ',
                        visibleRows + incrementCount
                    );
                    setVisibleRows((prev) => prev + incrementCount);
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [incrementCount]);

    const getVisibleValues = React.useCallback(() => {
        return data?.slice(0, visibleRows) ?? [];
    }, [visibleRows, data]);

    return { visibleRows, loadMoreRef, getVisibleValues };
}
// tổng data biểu 8
const totalDataBieu8 = (clonedChildItem, dataTotal, totalChild, totals) => {
    if (
        clonedChildItem?.trungBinhMuaLu ||
        clonedChildItem?.trungBinhMuaCan ||
        clonedChildItem?.trungBinhCaNam
    ) {
        totals.tongMuaLu += clonedChildItem?.trungBinhMuaLu || 0;
        totals.tongMuaCan += clonedChildItem?.trungBinhMuaCan || 0;
        totals.tongCaNam += clonedChildItem?.trungBinhCaNam || 0;
    }
    const trungBinhMuaLu = totalChild
        ? parseFloat((totals.tongMuaLu / totalChild).toFixed(3))
        : 0;
    const trungBinhMuaCan = totalChild
        ? parseFloat((totals.tongMuaCan / totalChild).toFixed(3))
        : 0;
    dataTotal.trungBinhMuaLu = trungBinhMuaLu;
    dataTotal.trungBinhMuaCan = trungBinhMuaCan;
    dataTotal.trungBinhCaNam = trungBinhMuaLu + trungBinhMuaCan;
    return dataTotal;
};
// tổng data biểu 11
const totalDataBieu11 = (clonedChildItem, dataTotal, totalChild, totals) => {
    const fields = [
        'nuocNgotDienTichPhanBo',
        'nuocNgotTruLuongTiemNang',
        'nuocNgotTruLuongCoTheKhaiThac',
        'nuocManDienTichPhanBo',
        'nuocManTruLuong',
    ];
    if (
        clonedChildItem?.nuocNgotDienTichPhanBo ||
        clonedChildItem?.nuocNgotTruLuongTiemNang ||
        clonedChildItem?.nuocNgotTruLuongCoTheKhaiThac ||
        clonedChildItem?.nuocManDienTichPhanBo ||
        clonedChildItem?.nuocManTruLuong
    ) {
        fields.forEach((field) => {
            totals[field] += parseFloat(clonedChildItem[field]) || 0;
        });
    }
    fields.forEach((field) => {
        const averageValue = totalChild
            ? parseFloat((totals[field] / totalChild).toFixed(3))
            : 0;
        dataTotal[field] = averageValue;
    });
    return dataTotal;
};
// tổng data biểu 7
function totalDataBieu7(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = [
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
        'thang7',
        'thang8',
        'thang9',
        'thang10',
        'thang11',
        'thang12',
        'muaMua',
        'muaKho',
    ];
    if (
        clonedChildItem?.viTriChayVao.muaMua ||
        clonedChildItem?.viTriChayVao.muaKho ||
        clonedChildItem?.viTriChayVao.caNam ||
        clonedChildItem?.viTriChayRa.muaMua ||
        clonedChildItem?.viTriChayRa.muaKho ||
        clonedChildItem?.viTriChayRa.caNam
    ) {
        fields.forEach((field) => {
            const viTriChayVaoValue =
                clonedChildItem.viTriChayVao?.[field] || 0;
            const viTriChayRaValue = clonedChildItem.viTriChayRa?.[field] || 0;
            totals[field] += viTriChayVaoValue + viTriChayRaValue;
        });
    }
    // Tính trung bình và lưu vào dataTotal
    fields.forEach((field) => {
        const averageValue = totalChild
            ? parseFloat(totals[field].toFixed(3))
            : 0;
        dataTotal[field] = averageValue;
    });

    // Tính tổng caNam từ muaMua và muaKho
    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);

    return dataTotal;
}
// tổng data biểu 5
function totalDataBieu5(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = [
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
        'thang7',
        'thang8',
        'thang9',
        'thang10',
        'thang11',
        'thang12',
        'muaMua',
        'muaKho',
    ];
    if (
        clonedChildItem?.thang1 ||
        clonedChildItem?.thang2 ||
        clonedChildItem?.thang3 ||
        clonedChildItem?.thang4 ||
        clonedChildItem?.thang5 ||
        clonedChildItem?.thang6 ||
        clonedChildItem?.thang7 ||
        clonedChildItem?.thang8 ||
        clonedChildItem?.thang9 ||
        clonedChildItem?.thang10 ||
        clonedChildItem?.thang11 ||
        clonedChildItem?.thang12 ||
        clonedChildItem?.muaMua ||
        clonedChildItem?.muaKho
    ) {
        fields.forEach((field) => {
            totals[field] += parseFloat(clonedChildItem?.[field]) || 0;
        });
    }
    // Tính trung bình và lưu vào dataTotal
    fields.forEach((field) => {
        const averageValue = totalChild
            ? parseFloat(totals[field].toFixed(3))
            : 0;
        dataTotal[field] = averageValue;
    });
    // Tính tổng caNam từ muaMua và muaKho
    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);
    return dataTotal;
}

function totalDataBieu4(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = ['dienTichPhanBo', 'chieuSauPhanBoTu', 'chieuSauPhanBoDen'];
    if (
        clonedChildItem?.dienTichPhanBo ||
        clonedChildItem?.chieuSauPhanBoTu ||
        clonedChildItem?.chieuSauPhanBoDen
    ) {
        fields.forEach((field) => {
            totals[field] += parseFloat(clonedChildItem?.[field]) || 0;
        });
    }
    // Tính trung bình và lưu vào dataTotal
    fields.forEach((field) => {
        const averageValue = totalChild
            ? parseFloat(totals[field].toFixed(3))
            : 0;
        dataTotal[field] = averageValue;
    });
    // Tính tổng caNam từ muaMua và muaKho
    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);
    return dataTotal;
}

function useGenerateInfiniteNestedData(
    values = {},
    {
        getArray = (item) => item?.children || [],
        getSubArray = (item) => item?.children || [],
        subArray = '',
        bieuMau = '',
    }
) {
    const output = [];
    const mainArray = Array.isArray(getArray(values)) ? getArray(values) : [];

    mainArray.forEach((item, index) => {
        const clonedItem = { ...item };
        const subArrayData = getSubArray(clonedItem);
        const dataTotal = {};
        let totals4 = {
            dienTichPhanBo: 0,
            chieuSauPhanBoTu: 0,
            chieuSauPhanBoDen: 0,
        };
        let totals5 = {
            thang1: 0,
            thang2: 0,
            thang3: 0,
            thang4: 0,
            thang5: 0,
            thang6: 0,
            thang7: 0,
            thang8: 0,
            thang9: 0,
            thang10: 0,
            thang11: 0,
            thang12: 0,
            muaMua: 0,
            muaKho: 0,
        };
        let totals7 = {
            thang1: 0,
            thang2: 0,
            thang3: 0,
            thang4: 0,
            thang5: 0,
            thang6: 0,
            thang7: 0,
            thang8: 0,
            thang9: 0,
            thang10: 0,
            thang11: 0,
            thang12: 0,
            muaMua: 0,
            muaKho: 0,
        };
        let totals8 = { tongMuaLu: 0, tongMuaCan: 0, tongCaNam: 0 };

        let totals11 = {
            nuocNgotDienTichPhanBo: 0,
            nuocNgotTruLuongTiemNang: 0,
            nuocNgotTruLuongCoTheKhaiThac: 0,
            nuocManDienTichPhanBo: 0,
            nuocManTruLuong: 0,
        };

        subArrayData?.forEach((childItem, childIndex) => {
            const clonedChildItem = { ...childItem };
            if (clonedItem[subArray]) delete clonedItem[subArray];
            const totalChild = subArrayData.length;
            if (bieuMau === '4') {
                Object.assign(
                    dataTotal,
                    totalDataBieu4(
                        clonedChildItem,
                        dataTotal,
                        totalChild,
                        totals4
                    )
                );
            }
            if (bieuMau === '5') {
                Object.assign(
                    dataTotal,
                    totalDataBieu5(
                        clonedChildItem,
                        dataTotal,
                        totalChild,
                        totals5
                    )
                );
            }
            if (bieuMau === '7') {
                Object.assign(
                    dataTotal,
                    totalDataBieu7(
                        clonedChildItem,
                        dataTotal,
                        totalChild,
                        totals7
                    )
                );
            }
            if (bieuMau === '8') {
                Object.assign(
                    dataTotal,
                    totalDataBieu8(
                        clonedChildItem,
                        dataTotal,
                        totalChild,
                        totals8
                    )
                );
            }
            if (bieuMau === '11') {
                Object.assign(
                    dataTotal,
                    totalDataBieu11(
                        clonedChildItem,
                        dataTotal,
                        totalChild,
                        totals11
                    )
                );
            }
            if (childIndex === 0) {
                output.push({
                    ...clonedItem,
                    parentIndex: index,
                    isStart: true,
                    totalChild,
                    dataTotal,
                });
            }

            output.push({
                ...clonedChildItem,
                childIndex,
                isStart: false,
            });
        });
    });

    return output;
}
function totalDataBieuNT(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = [
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
        'thang7',
        'thang8',
        'thang9',
        'thang10',
        'thang11',
        'thang12',
        'muaMua',
        'muaKho',
    ];
    if (
        clonedChildItem?.thang1 ||
        clonedChildItem?.thang2 ||
        clonedChildItem?.thang3 ||
        clonedChildItem?.thang4 ||
        clonedChildItem?.thang5 ||
        clonedChildItem?.thang6 ||
        clonedChildItem?.thang7 ||
        clonedChildItem?.thang8 ||
        clonedChildItem?.thang9 ||
        clonedChildItem?.thang10 ||
        clonedChildItem?.thang11 ||
        clonedChildItem?.thang12 ||
        clonedChildItem?.muaMua ||
        clonedChildItem?.muaKho
    ) {
        fields.forEach((field) => {
            totals[field] += parseFloat(clonedChildItem?.[field]) || 0;
        });
    }
    // Tính trung bình và lưu vào dataTotal
    fields.forEach((field) => {
        const averageValue = totalChild
            ? parseFloat(totals[field].toFixed(3))
            : 0;
        dataTotal[field] = averageValue;
    });

    // Tính tổng caNam từ muaMua và muaKho
    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);
    return dataTotal;
}
function totalDataBieu6(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = [
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
        'thang7',
        'thang8',
        'thang9',
        'thang10',
        'thang11',
        'thang12',
        'muaMua',
        'muaKho',
    ];

    if (clonedChildItem.viTris) {
        clonedChildItem.viTris.forEach((itemChild) => {
            fields.forEach((field) => {
                totals[field] += parseFloat(itemChild?.[field]) || 0;
            });
        });
    }

    fields.forEach((field) => {
        dataTotal[field] = totalChild
            ? parseFloat(totals[field].toFixed(3))
            : totals[field];
    });

    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);

    return dataTotal;
}

function totalDataBieu9(clonedChildItem, dataTotal, totalChild, totals) {
    const fields = [
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
        'thang7',
        'thang8',
        'thang9',
        'thang10',
        'thang11',
        'thang12',
        'muaMua',
        'muaKho',
    ];

    if (clonedChildItem.trams) {
        clonedChildItem.trams.forEach((itemChild) => {
            fields.forEach((field) => {
                totals[field] += parseFloat(itemChild?.[field]) || 0;
            });
        });
    }
    fields.forEach((field) => {
        dataTotal[field] = parseFloat(totals[field].toFixed(3));
    });

    dataTotal.caNam = (dataTotal.muaMua || 0) + (dataTotal.muaKho || 0);

    return dataTotal;
}

function useGenerateInfiniteTwoNestedData(
    values = {},
    {
        getArray = (item) => item?.children || [],
        getSubArray = (item) => item?.children || [],
        getSubArray2 = (item) => item?.children || [],
        getSubChildArray = (item) => item?.children || [],
        subArray = '',
        bieuMau = '',
    }
) {
    const output = [];
    const mainArray = getArray(values);

    mainArray.forEach((item, index) => {
        const clonedItem = { ...item };
        const subArrayData = getSubArray(clonedItem);
        const subArray2Data = getSubArray2(clonedItem);
        const dataTotalNT = {};
        const dataTotalLT = {};
        const totalChild1 = subArrayData?.length || 0;
        const totalChild2 = subArray2Data?.length || 0;
        let totalsLT = {
            thang1: 0,
            thang2: 0,
            thang3: 0,
            thang4: 0,
            thang5: 0,
            thang6: 0,
            thang7: 0,
            thang8: 0,
            thang9: 0,
            thang10: 0,
            thang11: 0,
            thang12: 0,
            muaMua: 0,
            muaKho: 0,
        };
        let totalsNT = {
            thang1: 0,
            thang2: 0,
            thang3: 0,
            thang4: 0,
            thang5: 0,
            thang6: 0,
            thang7: 0,
            thang8: 0,
            thang9: 0,
            thang10: 0,
            thang11: 0,
            thang12: 0,
            muaMua: 0,
            muaKho: 0,
        };

        subArrayData.forEach((childItem, childIndex) => {
            const clonedChildItem = { ...childItem };
            if (bieuMau === '6') {
                Object.assign(
                    dataTotalLT,
                    totalDataBieu6(
                        clonedChildItem,
                        dataTotalLT,
                        totalChild1,
                        totalsLT
                    )
                );
            }
            if (bieuMau === '9') {
                Object.assign(
                    dataTotalLT,
                    totalDataBieu9(
                        clonedChildItem,
                        dataTotalLT,
                        totalChild1,
                        totalsLT
                    )
                );
            }
            delete clonedItem[subArray];

            // Thêm phần tử cha ở đầu mỗi sub-array
            if (childIndex === 0) {
                output.push({
                    parent: { ...clonedItem },
                    parentIndex: index,
                    currentIndex: childIndex,
                    isStart: true,
                    isSubArray: true,
                    totalChild1,
                    dataTotalLT,
                });
            }
            // Thêm phần tử con
            output.push({
                ...clonedChildItem,
                parentIndex: index,
                currentIndex: childIndex,
                isStart: false,
                isSubArray: true,
            });
            const subChildArray = getSubChildArray({ ...childItem });
            const totalViTriDem = subChildArray?.length || 0;
            const dataTotalViTri = {};
            let totalViTri = {
                thang1: 0,
                thang2: 0,
                thang3: 0,
                thang4: 0,
                thang5: 0,
                thang6: 0,
                thang7: 0,
                thang8: 0,
                thang9: 0,
                thang10: 0,
                thang11: 0,
                thang12: 0,
                muaMua: 0,
                muaKho: 0,
            };

            subChildArray?.forEach((subChildItem, subChildIndex) => {
                const clonedSubChildItem = { ...subChildItem };
                if (bieuMau === '6') {
                    Object.assign(
                        dataTotalViTri,
                        totalDataBieuNT(
                            clonedSubChildItem,
                            dataTotalViTri,
                            totalViTriDem,
                            totalViTri
                        )
                    );
                }
                if (subChildIndex === 0) {
                    output.push({
                        parent: { ...clonedChildItem },
                        parentIndex: childIndex,
                        grandParentIndex: index,
                        currentIndex: subChildIndex,
                        isChildStart: true,
                        isSubChildArray: true,
                        totalViTriDem,
                        dataTotalViTri,
                    });
                }
                // Thêm phần tử con
                output.push({
                    ...subChildItem,
                    parentIndex: childIndex,
                    currentIndex: subChildIndex,
                    grandParentIndex: index,
                    isChildStart: false,
                    isSubChildArray: true,
                });
            });
        });

        subArray2Data?.forEach((childItem, childIndex) => {
            const clonedChildItem = { ...childItem };
            if (bieuMau === '6') {
                Object.assign(
                    dataTotalNT,
                    totalDataBieuNT(
                        clonedChildItem,
                        dataTotalNT,
                        totalChild2,
                        totalsNT
                    )
                );
            }
            // Thêm phần tử cha ở đầu mỗi sub-array

            if (childIndex === 0) {
                output.push({
                    parent: { ...clonedItem },
                    parentIndex: index,
                    currentIndex: childIndex,
                    isStart: true,
                    totalChild2,
                    dataTotalNT,
                    isSubArray2: true,
                });
            }
            // Thêm phần tử con
            output.push({
                ...clonedChildItem,
                parentIndex: index,
                currentIndex: childIndex,
                isStart: false,
                isSubArray2: true,
            });
        });
    });

    return output;
}

function countObjectsInAllowedKeys(data, allowedKeys = []) {
    let count = 0; // Số lượng đối tượng.

    function traverse(data) {
        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (typeof item === 'object' && item !== null) {
                    count++; // Đếm đối tượng.
                    traverse(item); // Đệ quy vào đối tượng.
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            for (let key in data) {
                if (allowedKeys.includes(key)) {
                    traverse(data[key]); // Đệ quy vào các giá trị của key được phép.
                }
            }
        }
    }

    allowedKeys.forEach((key) => {
        if (data[key]) {
            traverse(data[key]);
        }
    });

    return count;
}

function paginationData(limit, page, data, allowedKeys = []) {
    let allResults = []; // Kết quả thu thập được.
    let processedData = {}; // Dữ liệu đã xử lý.

    function traverse(data, processed, level = 1) {
        if (allResults.length >= limit * page) return; // Dừng nếu đã đủ dữ liệu cho trang.

        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                if (allResults.length >= limit * page) break;

                let item = data[i];
                if (
                    Array.isArray(item) ||
                    (typeof item === 'object' && item !== null)
                ) {
                    let nested = Array.isArray(item) ? [] : {};
                    traverse(item, nested, level + 1); // Đệ quy xuống cấp tiếp theo.
                    processed.push(nested); // Lưu vào processed.
                } else {
                    allResults.push(item); // Lưu phần tử cơ bản vào kết quả.
                    processed.push(item);
                }
            }
        } else if (typeof data === 'object' && data !== null) {
            for (let key in data) {
                if (!allowedKeys.includes(key)) {
                    processed[key] = data[key]; // Giữ lại các key không được phép.
                    continue; // Bỏ qua các key không được phép.
                }

                let value = data[key];
                if (Array.isArray(value)) {
                    let nestedResults = [];
                    for (let i = 0; i < value.length; i++) {
                        if (nestedResults.length >= limit) break; // Giới hạn số phần tử lấy.
                        let nested = Array.isArray(value[i]) ? [] : {};
                        traverse(value[i], nested, level + 1); // Đệ quy vào mảng.
                        nestedResults.push(nested);
                        allResults.push(nested); // Đảm bảo phần tử được thêm vào allResults
                    }
                    processed[key] = nestedResults;
                } else if (typeof value === 'object' && value !== null) {
                    let nested = {};
                    traverse(value, nested, level + 1); // Đệ quy vào đối tượng.
                    processed[key] = nested;
                } else {
                    processed[key] = value;
                }
            }
        }
    }

    // Khởi động hàm từ dữ liệu gốc.
    traverse(data, processedData);

    // Phân trang kết quả.
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
        result: allResults.slice(startIndex, endIndex), // Kết quả phân trang.
        processedData, // Dữ liệu gốc đã xử lý.
        total: allResults.length, // Tổng số phần tử.
        currentPage: page,
    };
}

function usePagination(limit, input, allowedKeys = []) {
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState({});
    const totalPages = React.useMemo(
        () =>
            Math.ceil(
                countObjectsInAllowedKeys({ ...input }, allowedKeys) / limit
            ),
        [input]
    );

    React.useEffect(() => {
        if (allowedKeys?.length === 1) {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const results = {
                processedData: {
                    ...input,
                    [allowedKeys?.[0]]: input?.[allowedKeys?.[0]]?.slice(
                        startIndex,
                        endIndex
                    ),
                },
            };
            setData(results);
            return;
        }
        const results = paginationData(limit, page, { ...input }, allowedKeys);
        setData(results);
    }, [page, input]);

    return {
        currentPage: page,
        setCurrentPage: setPage,
        pagingData: {
            ...data,
            totalPages,
        },
    };
}

export {
    countObjectsInAllowedKeys,
    paginationData,
    useGenerateInfiniteNestedData,
    useGenerateInfiniteTwoNestedData,
    useIntersectionObserver,
    useIsFirstRender,
    usePagination,
    useStores
};

// <MyAutocomplete
// value={(() => {
//     const items = [
//         ...coQuanThucHiens?.filter(
//             (t) =>
//                 !!values?.tinhThanhIds?.find(
//                     (i) => i === t.value
//                 )
//         ),
//         ...coQuanThucHiens?.filter(
//             (t) =>
//                 !!values?.coQuanThucHienIds?.find(
//                     (i) => i === t.value
//                 )
//         ),
//         coQuanThucHiens?.find(t => t.value === values?.scope) ?? null
//     ];
//     return items.filter(Boolean);
// })()}
// getOptionLabel={(option) => option?.label}
// options={coQuanThucHiens}
// multiple
// onChange={(e, options) => {
//     if (options.length === 0) {
//         setFieldValue('scope', null);
//         setFieldValue('tinhThanhIds', null);
//         setFieldValue('coQuanThucHienIds', null);
//         return;
//     }
//     options.forEach((v) => {
//         if (v.is === "scope") {
//             setFieldValue('scope', v.value);
//             return;
//         }
//         setFieldValue(v.is, [...new Set([
//             ...values?.[v.is] ?? [],
//             v.value,
//         ])]);
//     });
// }}
// placeholder="Chọn cơ quan thực hiện"
// label="Cơ quan thực hiện"
// />
