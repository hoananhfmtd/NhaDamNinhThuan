import { name } from 'dayjs/locale/vi';
import form1 from '../assets/form-images/form1.png';
import form10 from '../assets/form-images/form10.png';
import form11 from '../assets/form-images/form11.png';
import form12 from '../assets/form-images/form12.png';
import form13 from '../assets/form-images/form13.png';
import form14 from '../assets/form-images/form14.png';
import form15 from '../assets/form-images/form15.png';
import form17 from '../assets/form-images/form17.png';
import form18 from '../assets/form-images/form18.png';
import form19 from '../assets/form-images/form19.png';
import form2 from '../assets/form-images/form2.png';
import form20 from '../assets/form-images/form20.png';
import form21 from '../assets/form-images/form21.png';
import form22 from '../assets/form-images/form22.png';
import form23 from '../assets/form-images/form23.png';
import form24 from '../assets/form-images/form24.png';
import form25 from '../assets/form-images/form25.png';
import form3 from '../assets/form-images/form3.png';
import form4 from '../assets/form-images/form4.png';
import form5 from '../assets/form-images/form5.png';
import form6 from '../assets/form-images/form6.png';
import form7 from '../assets/form-images/form7.png';
import form8 from '../assets/form-images/form8.png';
import form9 from '../assets/form-images/form9.png';
import { DesignIcon } from '../components';
import { ro } from 'date-fns/locale';

const
    __commonSidebarData = [
        {
            path: '/trang-chu',
            icon: <DesignIcon.Home />,
            name: 'Trang chủ',
        },
        // {
        //     path: '/ban-do',
        //     icon: <DesignIcon.Map />,
        //     name: 'Bản đồ',
        // },
        // {
        //     path: '/danh-sach-bieu-mau',
        //     icon: <DesignIcon.Form />,
        //     name: 'Biểu mẫu',
        // },
    ];

const ObjectList = {}
// path: '/doi-tuong-kiem-ke',
// icon: <DesignIcon.ObjectList />,
// name: 'Đối tượng kiểm kê',
// children: [
//     {
//         path: '/doi-tuong-nuoc-mat',
//         name: 'Khai thác nước mặt',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin', 'User', 'GiamSat'],
//     },
//     {
//         path: '/doi-tuong-nuoc-duoi-dat',
//         name: 'Khai thác nước dưới đất',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin', 'User', 'GiamSat'],
//     },
//     {
//         path: '/doi-tuong-xa-thai',
//         name: 'Xả thải',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin', 'User', 'GiamSat'],
//     },
//     {
//         path: '/chat-luong-nuoc-mat',
//         name: 'Chất lượng nước mặt',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/luu-luong-nuoc',
//         name: 'Lưu lượng nước',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/nguon-nuoc-duoi-dat',
//         name: 'Nguồn nước dưới đất',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/dong-chay-bien-gioi',
//         name: 'Dòng chảy ở biên giới',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/doi-tuong-nuoc-bien',
//         name: 'Khai thác nước biển',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/luong-mua-tai-tram',
//         name: 'Lượng mưa tại trạm',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin'],
//         isPrimary: true
//     },
//     {
//         path: '/nguon-nuoc-mat/ao-ho-dam-pha',
//         name: 'Ao hồ đầm phá',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/nguon-nuoc-mat/song-suoi-kenh-rach',
//         name: 'Sông suối kênh rạch',
//         scopes: ['tw', 'dvtt', 'tinh'],
//         roles: ['Admin'],
//     },
//     {
//         path: '/cong-trinh-chuyen-nuoc',
//         name: 'Công trình chuyển nước',
//         scopes: ['tw', 'dvtt'],
//         roles: ['Admin'],
//     },
// ],

const SidebarDataForAdmin = [
    // {
    //     path: '/thong-ke',
    //     icon: <DesignIcon.Statistic />,
    //     name: 'Thống kê',
    //     children: [
    //         {
    //             path: '/theo-nguoi-tao',
    //             name: 'Theo người tạo',
    //         },
    //         {
    //             path: '/theo-thoi-gian',
    //             name: 'Theo thời gian',
    //         },
    //         {
    //             path: '/theo-bieu-mau',
    //             name: 'Theo biểu mẫu',
    //         },
    //     ],
    // },
    // {
    //     path: '/danh-muc',
    //     icon: <DesignIcon.Category />,
    //     name: 'Danh mục ',
    //     children: [
    //         {
    //             path: '/danh-muc-cap-tinh',
    //             name: 'Cấp tỉnh',
    //         },
    //         {
    //             path: '/danh-muc-cap-huyen',
    //             name: 'Cấp huyện',
    //         },
    //         {
    //             path: '/danh-muc-cap-xa',
    //             name: 'Cấp xã',
    //         },
    //         {
    //             path: '/luu-vuc-song',
    //             name: 'Lưu vực sông liên tỉnh',
    //         },
    //         {
    //             path: '/luu-vuc-song-noi-tinh',
    //             name: 'Lưu vực sông nội tỉnh',
    //         },
    //     ],
    // },
    // // {
    // //     path: '/danh-muc-rieng',
    // //     icon: <DesignIcon.Category />,
    // //     name: 'Danh mục (riêng)',
    // //     children: [
    // //         {
    // //             path: '/luu-vuc-song-rieng',
    // //             name: 'Lưu vực sông',
    // //         },
    // //         {
    // //             path: '/loai-cong-trinh',
    // //             name: 'Loại công trình'
    // //         },
    // //         {
    // //             path: '/loai-hinh-nuoc-thai',
    // //             name: 'Loại hình nước thải'
    // //         }
    // //     ],
    // // },
    // {
    //     path: '/quan-ly-tai-khoan/',
    //     icon: <DesignIcon.Setting />,
    //     name: 'Quản lý tài khoản',
    // },
];

const SidebarDataForUserAndGiamSat = [
    {
        path: '/danh-muc',
        icon: <DesignIcon.Category />,
        name: 'Danh mục',
        children: [
            {
                path: '/danh-muc-cap-tinh',
                name: 'Cấp tỉnh',
            },
            {
                path: '/danh-muc-cap-huyen',
                name: 'Cấp huyện',
            },
            {
                path: '/danh-muc-cap-xa',
                name: 'Cấp xã',
            },
            {
                path: '/luu-vuc-song',
                name: 'Lưu vực sông liên tỉnh',
            },
            {
                path: '/luu-vuc-song-noi-tinh',
                name: 'Lưu vực sông nội tỉnh',
            },

        ],
    },
    // {
    //     path: '/danh-muc-rieng',
    //     icon: <DesignIcon.Category />,
    //     name: 'Danh mục (riêng)',
    //     children: [
    //         {
    //             path: '/luu-vuc-song-rieng',
    //             name: 'Lưu vực sông',
    //         },
    //         {
    //             path: '/loai-cong-trinh',
    //             name: 'Loại công trình'
    //         },
    //         {
    //             path: '/loai-hinh-nuoc-thai',
    //             name: 'Loại hình nước thải'
    //         }
    //     ],
    // },
    {
        path: '/quan-ly-tai-khoan/',
        icon: <DesignIcon.Setting />,
        name: 'Quản lý tài khoản',
    },
];

export const getSidebarDataByRole = (role, scope, coQuanThucHienId) => {
    const data = [...__commonSidebarData];
    let objectList = { ...ObjectList };
    // user chỉ xem 3 mục đầu trong ObjectList

    let sideBarDataForAdmin = [...SidebarDataForAdmin]
    let sidebarDataForUserAndGiamSat = [...SidebarDataForUserAndGiamSat]
    if (role !== 'Admin') {
        data.splice(1, 1);
    }
    if (scope === 'tw') {
        // Tài khoản tw thì không hiển thị danh mục riêng
        // sideBarDataForAdmin.splice(2, 1);
        sidebarDataForUserAndGiamSat.splice(1, 1);
    } else if (scope === 'dvtt') {
        // không hiển thị mục cuối cùng trong danh mục
        sideBarDataForAdmin[1].children = sideBarDataForAdmin[1].children.filter(
            (item) => item.path !== '/luu-vuc-song-noi-tinh'
        );
        // không hiển thị mục cuối cùng trong danh mục
        sidebarDataForUserAndGiamSat[0].children = sidebarDataForUserAndGiamSat[0].children.filter(
            (item) => item.path !== '/luu-vuc-song-noi-tinh'
        );
    }
    else if (coQuanThucHienId === '06dvtt') {
        // chỉ hiện lượng mưa tại trạm
        objectList.children = ObjectList.children.filter(
            (object) => object.isPrimary
        );
    }
    else if (coQuanThucHienId !== '06tinh' && scope === 'dvtt' && role === 'Admin') {
        // k hiển thị isPrimary
        objectList.children = ObjectList.children.filter(
            (object) => !object.isPrimary
        );

    } else {
        objectList.children = ObjectList.children.filter(
            (object) => object.roles.includes(role) && object.scopes.includes(scope)
        );
    }

    // if (scope === 'tinh') {
    //     // Bỏ "Lưu vực sông nội tỉnh"
    //     SidebarDataForAdmin[1].children = SidebarDataForAdmin[1].children.filter(
    //         (item) => item.path !== '/luu-vuc-song-noi-tinh'
    //     );
    //     // Đổi tên "Lưu vực sông" thành "Lưu vực sông nội tỉnh"
    //     const luuVucSong = SidebarDataForAdmin[1].children.find(
    //         (item) => item.path === '/luu-vuc-song'
    //     );
    //     if (luuVucSong) {
    //         luuVucSong.name = 'Lưu vực sông nội tỉnh';
    //     }
    // } else {
    //     // Đổi tên "Lưu vực sông" thành "Lưu vực sông liên tỉnh"
    //     const luuVucSong = SidebarDataForAdmin[1].children.find(
    //         (item) => item.path === '/luu-vuc-song'
    //     );
    //     if (luuVucSong) {
    //         luuVucSong.name = 'Lưu vực sông liên tỉnh';
    //     }
    // }

    switch (role) {
        case 'Admin': {
            data.push(objectList);
            data.push(...sideBarDataForAdmin);
            break;
        }
        case 'User': {
            // user chỉ xem 3 mục đầu trong ObjectList
            data.push(objectList);
            data.push(
                ...sidebarDataForUserAndGiamSat.slice(
                    0,
                    sidebarDataForUserAndGiamSat.length - 1
                )
            );
            break;
        }
        case 'GiamSat': {
            data.push(objectList);
            data.push(...sidebarDataForUserAndGiamSat);
            break;
        }
        default:
            break;
    }
    return data;
};

export const FormDataInfo = [
    {
        path: '/bieu-mau-1',
        name: `TỔNG HỢP CÁC CHỈ TIÊU KIỂM KÊ TÀI NGUYÊN NƯỚC THEO LƯU VỰC SÔNG LIÊN TỈNH/TỈNH, THÀNH PHỐ/CẢ NƯỚC`,
        title: 'Biểu mẫu số 1',
        img: form1,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-2',
        name: `TỔNG HỢP CÁC CHỈ TIÊU KIỂM KÊ TÀI NGUYÊN NƯỚC CỦA TỈNH, THÀNH PHỐ`,
        title: 'Biểu mẫu số 2',
        img: form2,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-3',
        name: `KIỂM KÊ SỐ LƯỢNG NGUỒN NƯỚC MẶT`,
        title: 'Biểu mẫu số 3',
        img: form3,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-4',
        name: `KIỂM KÊ SỐ LƯỢNG NGUỒN NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 4',
        img: form4,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-5',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY THEO LƯU VỰC SÔNG VÀ CẢ NƯỚC`,
        title: 'Biểu mẫu số 5',
        img: form5,
        bieuNhapValue: 1,
        scope: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-6',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY THEO TỈNH, THÀNH PHỐ`,
        title: 'Biểu mẫu số 6',
        img: form6,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-7',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY VÀO, RA KHỎI BIÊN GIỚI`,
        title: 'Biểu mẫu số 7',
        img: form7,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-8',
        name: `KIỂM KÊ TỔNG LƯỢNG NƯỚC CHUYỂN GIỮA CÁC LƯU VỰC SÔNG`,
        title: 'Biểu mẫu số 8',
        img: form8,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-9',
        name: `KIỂM KÊ TỔNG LƯỢNG MƯA`,
        title: 'Biểu mẫu số 9',
        img: form9,
        coQuanTHAdmin: 2,
        type: 1,
    },
    {
        path: '/bieu-mau-10',
        name: `KIỂM KÊ CHẤT LƯỢNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 10',
        img: form10,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-11',
        name: `KIỂM KÊ LƯỢNG NƯỚC VÀ CHẤT LƯỢNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 11',
        img: form11,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        coQuanTHConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-12',
        name: `KIỂM KÊ KHAI THÁC, SỬ DỤNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 12',
        img: form12,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-13',
        name: `KIỂM KÊ KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 13',
        img: form13,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-14',
        name: `KIỂM KÊ KHAI THÁC, SỬ DỤNG NƯỚC BIỂN`,
        title: 'Biểu mẫu số 14',
        img: form14,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        coQuanTHConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-15',
        name: `KIỂM KÊ XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC`,
        title: 'Biểu mẫu số 15',
        img: form15,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-17',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 17',
        img: form17,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        scope: 1,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-18',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 18',
        type: 2,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form18,
        scope: 1,
        coQuanTHConLai: 1,
    },
    {
        path: '/bieu-mau-19',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 19',
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form19,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-20',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 20',
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form20,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-21',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC`,
        title: 'Biểu mẫu số 21',
        img: form21,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        scope: 1,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-22',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC`,
        title: 'Biểu mẫu số 22',
        type: 2,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form22,
        coQuanTHConLai: 1,
    },
    {
        path: '/bieu-mau-23',
        name: `TỔNG HỢP HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC (*)`,
        title: 'Biểu mẫu số 23',
        img: form23,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-24',
        name: `TỔNG HỢP HIỆN TRẠNG XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC (*)`,
        title: 'Biểu mẫu số 24',
        img: form24,
        coQuanTHAdminConLai: 1,
        scope: 1,
        type: 1,
    },
    {
        path: '/bieu-mau-25',
        name: `SỐ LIỆU MƯA NGÀY TẠI TRẠM`,
        title: 'Biểu mẫu số 25',
        img: form25,
        bieuNhapValue: 1,
        coQuanTH: 1,
        coQuanTHAdmin: 2,
        type: 3,
    },
];

export const FastFormDataInfo = [
    {
        path: '/bieu-mau-3',
        name: `KIỂM KÊ SỐ LƯỢNG NGUỒN NƯỚC MẶT`,
        title: 'Biểu mẫu số 3',
        img: form3,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-4',
        name: `KIỂM KÊ SỐ LƯỢNG NGUỒN NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 4',
        img: form4,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-5',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY THEO LƯU VỰC SÔNG VÀ CẢ NƯỚC`,
        title: 'Biểu mẫu số 5',
        img: form5,
        bieuNhapValue: 1,
        scope: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-6',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY THEO TỈNH, THÀNH PHỐ`,
        title: 'Biểu mẫu số 6',
        img: form6,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        scope: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-7',
        name: `KIỂM KÊ TỔNG LƯỢNG DÒNG CHẢY VÀO, RA KHỎI BIÊN GIỚI`,
        title: 'Biểu mẫu số 7',
        img: form7,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-8',
        name: `KIỂM KÊ TỔNG LƯỢNG NƯỚC CHUYỂN GIỮA CÁC LƯU VỰC SÔNG`,
        title: 'Biểu mẫu số 8',
        img: form8,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-10',
        name: `KIỂM KÊ CHẤT LƯỢNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 10',
        img: form10,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHConLai: 1,
        coQuanTHAdminConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-11',
        name: `KIỂM KÊ LƯỢNG NƯỚC VÀ CHẤT LƯỢNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 11',
        img: form11,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        coQuanTHConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-14',
        name: `KIỂM KÊ KHAI THÁC, SỬ DỤNG NƯỚC BIỂN`,
        title: 'Biểu mẫu số 14',
        img: form14,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        coQuanTHConLai: 1,
        type: 3,
    },
    {
        path: '/bieu-mau-17',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 17',
        img: form17,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        scope: 1,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-18',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC MẶT`,
        title: 'Biểu mẫu số 18',
        type: 2,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form18,
        scope: 1,
        coQuanTHConLai: 1,
    },
    {
        path: '/bieu-mau-19',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 19',
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form19,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-20',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT`,
        title: 'Biểu mẫu số 20',
        type: 2,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form20,
        coQuanTHConLai: 1,
    },
    {
        path: '/bieu-mau-21',
        name: `PHIẾU ĐIỀU TRA TỔNG HỢP HIỆN TRẠNG XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC`,
        title: 'Biểu mẫu số 21',
        img: form21,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        scope: 1,
        coQuanTHConLai: 1,
        type: 2,
    },
    {
        path: '/bieu-mau-22',
        name: `PHIẾU ĐIỀU TRA CHI TIẾT HIỆN TRẠNG XẢ NƯỚC THẢI VÀO NGUỒN NƯỚC`,
        title: 'Biểu mẫu số 22',
        type: 2,
        scope: 1,
        bieuNhapValue: 1,
        coQuanTHAdminConLai: 1,
        img: form22,
        coQuanTHConLai: 1,
    },
    {
        path: '/bieu-mau-25',
        name: `SỐ LIỆU MƯA NGÀY TẠI TRẠM`,
        title: 'Biểu mẫu số 25',
        img: form25,
        bieuNhapValue: 1,
        coQuanTH: 1,
        coQuanTHAdmin: 2,
        type: 3,
    },
];

export const defineColors = {
    layout: {
        primary: '#38bdf8',
        icon: {
            toggleDraw: '#ffff !important',
        },
    },
    text: {
        title: '#000',
        subTitle: '#fff',
    },
    sidebar: {
        background: '#E0F2FE',
        item: {
            // base: '#b0d8ee',
            base: '#ffb499',
            active: '#F8FAFD',
            hover: '#E7E8EB',
        },
    },
};
