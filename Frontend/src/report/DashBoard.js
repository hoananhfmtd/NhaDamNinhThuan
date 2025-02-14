import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';

import { Height, RestartAltOutlined } from '@mui/icons-material';
import { isArray, isNumber, isObject } from 'lodash';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Api from '../api';
import CLNDD_Image from '../assets/images/chat-luong-nuoc-duoi-dat.png';
import CLNM_Image from '../assets/images/chat-luong-nuoc-mat.png';
import KTSDNB_Image from '../assets/images/khai-thac-su-dung-nuoc-bien.png';
import KKSDNDD_Image from '../assets/images/khai-thac-su-dung-nuoc-duoi-dat.png';
import KKSDNM_Image from '../assets/images/khai-thac-su-dung-nuoc-mat.png';
import LNDD_Image from '../assets/images/luong-nuoc-duoi-dat.png';
import TLDC_Image from '../assets/images/luong-nuoc-mat.png';
import SLNNDD_Image from '../assets/images/so-luong-nguon-nuoc-duoi-dat.png';
import SLNNM_Image from '../assets/images/so-luong-nguon-nuoc-mat.png';
import TLM_Image from '../assets/images/tong-luong-mua.png';
import XTVNN_Image from '../assets/images/xa-thai-vao-nguon-nuoc.png';
import { useStores } from '../hooks';
import { MyAutocomplete } from '../kktnn-components';
import anhNhaDam from '../assets/images/nhaDamNinhThuan.png';

const DashBoard = () => {
    // const [dashboardData, setDashboardData] = React.useState({
    //     tongHops: {},
    //     chiTieus: {},
    // });
    // const getDashboard = async (filtered, signal) => {
    //     try {
    //         await new Api()
    //             .getAllDashboardReport({ ...filtered, signal })
    //             .then((res) => {
    //                 if (res.code === 200) {
    //                     setDashboardData((p) => ({
    //                         ...p,
    //                         tongHops: res.data,
    //                     }));
    //                 }
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     } catch (error) {
    //     } finally {
    //     }
    // };

    // // const doiTuongs = React.useMemo(
    // //     () => [
    // //         {
    // //             name: 'Chỉ tiêu số lượng nguồn nước',
    // //             icon: '',
    // //             images: NguonNuoc,
    // //             scores: [
    // //                 {
    // //                     name: 'Số lượng nguồn nước mặt',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'soLuongNuocMat',
    // //                 },
    // //                 {
    // //                     name: 'Số lượng nguồn nước dưới đất',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'soLuongNuocNgam',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Tỉnh/thành phố',
    // //                     path: '/doi-tuong-so-luong-nuoc-tinh-thanh-pho',
    // //                 },
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-so-luong-nuoc-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },
    // //         {
    // //             name: 'Chỉ tiêu lượng nước',
    // //             icon: '',
    // //             images: LuongNuoc,
    // //             scores: [
    // //                 {
    // //                     name: 'Lượng nước mặt',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'luongNuocMat',
    // //                 },
    // //                 {
    // //                     name: 'Lượng nước dưới đất',
    // //                     path: '/doi-tuong-nuoc-duoi-dat',
    // //                     value: 'luongNuocNgam',
    // //                 },
    // //                 {
    // //                     name: 'Lượng nước mưa',
    // //                     path: '/doi-tuong-nuoc-mua',
    // //                     value: 'luongNuocMua',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Tỉnh/thành phố',
    // //                     path: '/doi-tuong-luong-nuoc-tinh-thanh-pho',
    // //                 },
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-luong-nuoc-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },
    // //         {
    // //             name: 'Chỉ tiêu chất lượng nước',
    // //             icon: '',
    // //             images: ChatLuongNuoc,
    // //             scores: [
    // //                 {
    // //                     name: 'Số lượng điểm đo chất lượng nước mặt',
    // //                     path: '/doi-tuong-chat-luong-nuoc',
    // //                     value: 'chatLuongNuocMat',
    // //                 },
    // //                 {
    // //                     name: 'Số lượng điểm đo chất lượng nước dưới đất',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'chatLuongNuocNgam',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Tỉnh/thành phố',
    // //                     path: '/doi-tuong-chat-luong-nuoc-tinh-thanh-pho',
    // //                 },
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-chat-luong-nuoc-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },
    // //         {
    // //             name: 'Chỉ tiêu số lượng đối tượng khai thác',
    // //             icon: '',
    // //             images: KhaiThac,
    // //             scores: [
    // //                 {
    // //                     name: 'Số lượng đối tượng khai thác nước mặt',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'soLuongDoiTuongKhaiThacNuocMat',
    // //                 },
    // //                 {
    // //                     name: 'Số lượng đối tượng khai thác nước dưới đất',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'soLuongDoiTuongKhaiThacNuocNgam',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Tỉnh/thành phố',
    // //                     path: '/doi-tuong-khai-thac-tinh-thanh-pho',
    // //                 },
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-khai-thac-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },

    // //         {
    // //             name: 'Chỉ tiêu số lượng đối tượng xả thải',
    // //             icon: '',
    // //             images: XaThai,
    // //             scores: [
    // //                 {
    // //                     name: 'Số lượng đối tượng xả thải nước mặt',
    // //                     path: '/doi-tuong-nuoc-mat',
    // //                     value: 'soLuongDoiTuongXaThaiNuocMat',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Tỉnh/thành phố',
    // //                     path: '/doi-tuong-xa-thai-tinh-thanh-pho',
    // //                 },
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-xa-thai-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },
    // //         {
    // //             name: 'Chỉ tiêu số lượng đối tượng nước mưa',
    // //             icon: '',
    // //             images: LuongMua,
    // //             scores: [
    // //                 {
    // //                     name: 'Số lượng đối tượng nước mưa',
    // //                     path: '/doi-tuong-nuoc-mua',
    // //                     value: 'soLuongDoiTuongNuocMua',
    // //                 },
    // //             ],
    // //             children: [
    // //                 {
    // //                     name: 'Lưu vực sông',
    // //                     path: '/doi-tuong-so-luong-nuoc-mua-luu-vuc-song',
    // //                 },
    // //             ],
    // //         },
    // //     ],
    // //     []
    // // );
    // const { scope, tinhThanhId, coQuanThucHienId } = useSelector(
    //     (state) => state.auth
    // );
    // const { control, setValue, reset } = useForm({
    //     defaultValues: {
    //         tinhThanhIds: tinhThanhId ? [tinhThanhId] : [],
    //         Scope: scope === 'tw' ? '' : scope,
    //         scope: scope === 'tw' ? '' : undefined,
    //         mode: scope === 'tw' ? 'all' : undefined,
    //         coQuanThucHienIds:
    //             scope !== 'dvtt' ? [] : ([coQuanThucHienId] ?? []),
    //     },
    // });
    // const watchValues = useWatch({
    //     control,
    // });
    // // const isFirstRender = useIsFirstRender();

    // React.useEffect(() => {
    //     // if (isFirstRender) return;
    //     const controller = new AbortController();
    //     getDashboard(
    //         {
    //             ...watchValues,
    //             scope: !['tw', 'tinh', 'dvtt'].includes(watchValues?.scope)
    //                 ? null
    //                 : watchValues?.scope,
    //         },
    //         controller.signal
    //     );
    //     return () => {
    //         controller.abort();
    //     };
    // }, [watchValues]);

    // const { coQuanThucHienFulls } = useStores();

    // const getValue = (value) => {
    //     let num = value ?? 0;
    //     if (isObject(value)) {
    //         if (isArray(value)) {
    //             num =
    //                 value
    //                     ?.filter((a) => isNumber(a))
    //                     ?.reduce((a, b) => a + b, 0) ?? 0;
    //         } else {
    //             num = Object.values(value)?.reduce((a, b) => a + b, 0) ?? 0;
    //         }
    //     }

    //     return (
    //         <span
    //             style={{
    //                 fontWeight: 600,
    //                 color: '#0285CE',
    //             }}
    //         >
    //             {Number.isInteger(num ?? 0)
    //                 ? num?.toLocaleString('vi-VN')
    //                 : num?.toLocaleString('vi-VN', {
    //                       minimumFractionDigits: 0,
    //                       maximumFractionDigits: 0,
    //                   })}
    //         </span>
    //     );
    // };

    // const styled = React.useMemo(
    //     () => ({
    //         group: {
    //             display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 3 
    //         },
    //         box: {
    //             sx: {
    //                 padding: '20px',
    //                 backgroundColor: '#FFF',
    //                 borderRadius: '10px',
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 '&:hover': {
    //                     boxShadow: '0px 4px 18px 0px rgba(0, 0, 0, 0.15)',
    //                     cursor: 'pointer',
    //                 },
    //                 transition: 'all .25s',
    //                 height: '100%'
    //             },
    //             display: 'flex',
    //         },
    //         stack: {
    //             gap: 1,
    //             sx: {
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 '& h2': {
    //                     fontWeight: '400 !important',
    //                     display: 'flex',
    //                     justifyContent: 'space-between',
    //                 },
    //             },
    //         },
    //         divItem: {
    //             sx: {
    //                 display: 'flex',
    //                 justifyContent: 'flex-start',
    //                 flexDirection: 'row',
    //                 alignItems: 'stretch',
    //             },
    //             item: true,
    //             xs: 12,
    //             sm: 5,
    //             md: 4,
    //         },
    //     }),
    //     []
    // );

    // const newOptions = React.useMemo(() => {
    //     return {
    //         label: 'Tất cả',
    //         is: 'coQuanThucHienIds',
    //         hint: 'Chung',
    //         target: 'only',
    //         value: 'all',
    //     };
    // }, []);

    // const clearAllValue = () => {
    //     setValue('mode', null);
    //     setValue('scope', null);
    //     setValue('Scope', null);
    //     setValue('tinhThanhIds', null);
    //     setValue('coQuanThucHienIds', null);
    // };

    // return (
    //     <div
    //         style={{
    //             border: '1px solid black !important',
    //             backgroundColor: '#F2F4F6',
    //             userSelect: 'none',
    //         }}
    //     >
    //         <Box
    //             display="flex"
    //             gap={2}
    //             width="100%"
    //             justifyContent="start"
    //             pt={2}
    //         >
    //             <MyAutocomplete
    //                 value={(() => {
    //                     const items = [
    //                         ...coQuanThucHienFulls?.filter(
    //                             (t) =>
    //                                 !!watchValues?.tinhThanhIds?.find(
    //                                     (i) => i === t.value
    //                                 )
    //                         ),
    //                         ...coQuanThucHienFulls?.filter(
    //                             (t) =>
    //                                 !!watchValues?.coQuanThucHienIds?.find(
    //                                     (i) => i === t.value
    //                                 )
    //                         ),
    //                         coQuanThucHienFulls?.find(
    //                             (t) => t.value === watchValues?.scope
    //                         ) ?? null,
    //                         watchValues?.mode === 'all'
    //                             ? newOptions
    //                             : undefined,
    //                     ];
    //                     return items.filter(Boolean);
    //                 })()}
    //                 getOptionLabel={(option) => option?.label}
    //                 groupBy={(option) => option?.hint}
    //                 options={[newOptions, ...coQuanThucHienFulls]}
    //                 multiple
    //                 width={'100%'}
    //                 onChange={(e, options) => {
    //                     if (options.length === 0) {
    //                         clearAllValue();
    //                         return;
    //                     }
    //                     options.forEach((v) => {
    //                         if (v.is === 'scope' && v.target === 'only') {
    //                             clearAllValue();
    //                             setValue('scope', v.value);
    //                             return;
    //                         } else if (v.value === 'all') {
    //                             clearAllValue();
    //                             setValue('mode', 'all');
    //                             return;
    //                         }
    //                         clearAllValue();
    //                         setValue('Scope', v.scope);
    //                         const newScope =
    //                             v.scope === 'tinh' ? 'tinhThanhIds' : v.is;
    //                         setValue(newScope, [
    //                             ...new Set([
    //                                 ...(watchValues?.[newScope] ?? []),
    //                                 v.value,
    //                             ]),
    //                         ]);
    //                     });
    //                 }}
    //                 placeholder="Chọn cơ quan thực hiện"
    //                 label="Cơ quan thực hiện"
    //             />
    //             <IconButton
    //                 sx={{ mr: 2 }}
    //                 onClick={() => reset()}
    //                 title="Thống kê"
    //             >
    //                 <RestartAltOutlined />
    //             </IconButton>
    //         </Box>
    //         <Box
    //             display="grid"
    //             gridTemplateColumns="repeat(3, 1fr)"
    //             gap={3}
    //             pt={2}
    //         >
    //             <Box {...styled.group}>
    //                 {/* 1 */}
    //                 <Box {...styled.box}>
    //                     <Stack mb={2} flexDirection={'row'}>
    //                         <img
    //                             src={SLNNM_Image}
    //                             alt="Group"
    //                             style={{
    //                                 width: '50px',
    //                                 height: '50px',
    //                                 marginRight: '5px',
    //                             }}
    //                         />
    //                         <Typography component="h2" fontWeight={500}>
    //                             1. Số lượng nguồn nước mặt
    //                             <p
    //                                 style={{
    //                                     fontWeight: 400,
    //                                     fontSize: 15,
    //                                 }}
    //                             >
    //                                 Đơn vị: nguồn nước
    //                             </p>
    //                         </Typography>
    //                     </Stack>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                     <Stack {...styled.stack}>
    //                         <Typography component="h2" fontWeight={500}>
    //                             Sông, suối, kênh, rạch:{' '}
    //                             {getValue(
    //                                 dashboardData.tongHops
    //                                     ?.soLuongSongSuoiKenhRach
    //                             )}
    //                         </Typography>
    //                         <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                         <Typography component="h2" fontWeight={500}>
    //                             Hồ, ao, đầm, phá:{' '}
    //                             {getValue(
    //                                 dashboardData.tongHops?.soLuongAoHoDamPha
    //                             )}
    //                         </Typography>
    //                     </Stack>
    //                 </Box>

    //                 {/* 2 */}
    //                 <Box {...styled.box}>
    //                     <Stack mb={2} flexDirection={'row'}>
    //                         <img
    //                             src={SLNNDD_Image}
    //                             alt="Group"
    //                             style={{
    //                                 width: '50px',
    //                                 height: '50px',
    //                                 marginRight: '5px',
    //                             }}
    //                         />
    //                         <Typography component="h2" fontWeight={500}>
    //                             2. Số lượng nguồn nước dưới đất
    //                             <p
    //                                 style={{
    //                                     fontWeight: 400,
    //                                     fontSize: 15,
    //                                 }}
    //                             >
    //                                 Đơn vị: nguồn nước
    //                             </p>
    //                         </Typography>
    //                     </Stack>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                     <Stack {...styled.stack}>
    //                         <Typography component="h2" fontWeight={500}>
    //                             Số lượng:{' '}
    //                             {getValue(
    //                                 dashboardData.tongHops?.soLuongNguonNuocDD
    //                             )}
    //                         </Typography>
    //                     </Stack>
    //                 </Box>
    //             </Box>

    //             {/* 3 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={TLDC_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         3. Lượng nước mặt
    //                         <p
    //                             style={{
    //                                 fontWeight: 400,
    //                                 fontSize: 15,
    //                             }}
    //                         >
    //                             Đơn vị: triệu m<sup>3</sup>
    //                         </p>
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2">
    //                         Tổng lượng dòng chảy:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.tongLuongDongChay
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2">
    //                         Tổng lượng dòng chảy vào biên giới:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.tongLuongDongChayVaoBienGioi
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2">
    //                         Tổng lượng dòng chảy ra khỏi biên giới:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.tongLuongDongChayRaBienGioi
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2">
    //                         Lượng nước chuyển giữa các lưu vực sông:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.luongNuocChuyenGiuaCacLVS
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2">
    //                         Tổng dung tích các hồ chứa:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.tongDungTichCacHoChua
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             <Box {...styled.group}>
    //                 {/* 4 */}
    //                 <Box {...styled.box}>
    //                     <Stack mb={2} flexDirection={'row'}>
    //                         <img
    //                             src={TLM_Image}
    //                             alt="Group"
    //                             style={{
    //                                 width: '50px',
    //                                 height: '50px',
    //                                 marginRight: '5px',
    //                             }}
    //                         />
    //                         <Typography component="h2" fontWeight={500}>
    //                             4. Tổng lượng mưa
    //                             <p
    //                                 style={{
    //                                     fontWeight: 400,
    //                                     fontSize: 15,
    //                                 }}
    //                             >
    //                                 Đơn vị: mm
    //                             </p>
    //                         </Typography>
    //                     </Stack>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                     <Typography mt={2} fontWeight={600}>
    //                         Cả năm:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.tongLuongMuaCaNam
    //                         )}
    //                     </Typography>
    //                 </Box>

    //                 {/* 5 */}
    //                 <Box {...styled.box}>
    //                     <Stack mb={2} flexDirection={'row'}>
    //                         <img
    //                             src={CLNM_Image}
    //                             alt="Group"
    //                             style={{
    //                                 width: '50px',
    //                                 height: '50px',
    //                                 marginRight: '5px',
    //                             }}
    //                         />
    //                         <Typography component="h2" fontWeight={500}>
    //                             5. Chất lượng nước mặt (theo chỉ số chất lượng
    //                             nước tổng hợp WQI)
    //                             <p
    //                                 style={{
    //                                     fontWeight: 400,
    //                                     fontSize: 15,
    //                                 }}
    //                             >
    //                                 Đơn vị: điểm
    //                             </p>
    //                         </Typography>
    //                     </Stack>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                     <Stack {...styled.stack}>
    //                         <Typography component="h2" fontWeight={400}>
    //                             Tổng số điểm:{' '}
    //                             {getValue(
    //                                 dashboardData.tongHops
    //                                     ?.soDiemChatLuongNuocMat
    //                             )}
    //                         </Typography>
    //                     </Stack>
    //                 </Box>
    //             </Box>

    //             {/* 6 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={LNDD_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         6. Lượng nước đưới đất
    //                         <p
    //                             style={{
    //                                 fontWeight: 400,
    //                                 fontSize: 15,
    //                             }}
    //                         >
    //                             Đơn vị: (m<sup>3</sup>/ngày)
    //                         </p>
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Trữ lượng tiềm năng của các tầng chứa nước :{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.truLuongTiemNangNuocDD
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2" fontWeight={500}>
    //                         Trữ lượng có thể khai thác của các tầng chứa nước:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.truLuongCoTheKhaiThacNuocDD
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             {/* 7 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={CLNDD_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         7. Chất lượng nước dưới đất
    //                         <p
    //                             style={{
    //                                 fontWeight: 400,
    //                                 fontSize: 15,
    //                             }}
    //                         >
    //                             Đơn vị: (km<sup>2</sup>)
    //                         </p>
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Diện tích phân bố nước ngọt của các tầng chứa nước:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.dienTichPhanBoNuocNgot
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2" fontWeight={500}>
    //                         Diện tích phân bố nước mặn của các tầng chứa nước:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.dienTichPhanBoNuocMan
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             {/* 8 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={KKSDNM_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         8. Khai thác, sử dụng nước mặt
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Số lượng công trình:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.soLuongCongTrinhKTSDNuocMat
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography
    //                         component="h2"
    //                         flexShrink={0}
    //                         fontWeight={500}
    //                     >
    //                         Lượng nước khai thác, sử dụng:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.luongNuocKTSDNuocMat
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             {/* 9 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={KKSDNDD_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         9. Khai thác, sử dụng nước dưới đất
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Số lượng công trình:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.soLuongCongTrinhKTSDNuocDD
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2" fontWeight={500}>
    //                         Lượng nước khai thác, sử dụng:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.luongNuocKTSDNuocDD
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             {/* 10 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={KTSDNB_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         10. Khai thác, sử dụng nước biển
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Số lượng công trình:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops
    //                                 ?.soLuongCongTrinhKTSDNuocBien
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2" fontWeight={500}>
    //                         Lượng nước khai thác, sử dụng:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.luongNuocKTSDNuocBien
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>

    //             {/* 11 */}
    //             <Box {...styled.box}>
    //                 <Stack mb={2} flexDirection={'row'}>
    //                     <img
    //                         src={XTVNN_Image}
    //                         alt="Group"
    //                         style={{
    //                             width: '50px',
    //                             height: '50px',
    //                             marginRight: '5px',
    //                         }}
    //                     />
    //                     <Typography component="h2" fontWeight={500}>
    //                         11. Xả thải vào nguồn nước
    //                     </Typography>
    //                 </Stack>
    //                 <Divider sx={{ backgroundColor: '#F1F1F1', mb: 1 }} />
    //                 <Stack {...styled.stack}>
    //                     <Typography component="h2" fontWeight={500}>
    //                         Số lượng công trình:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.soLuongCongTrinhXaThai
    //                         )}
    //                     </Typography>
    //                     <Divider sx={{ backgroundColor: '#F1F1F1' }} />
    //                     <Typography component="h2" fontWeight={500}>
    //                         Tổng lượng nước thải:{' '}
    //                         {getValue(
    //                             dashboardData.tongHops?.luongNuocKTSDXaThai
    //                         )}
    //                     </Typography>
    //                 </Stack>
    //             </Box>
    //         </Box>

    //         <Box height={20} />
    //     </div>
    // );
    return (
        <img src={anhNhaDam} style={{ width: '90vw', height: '93vh' }}></img>
    )
};

export default DashBoard;
