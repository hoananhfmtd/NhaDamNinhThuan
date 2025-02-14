import { AppBar, Avatar, Box, CssBaseline, Stack, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Cirensoft from '../assets/Logo-Cirensoft.png';

import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';


const Policy = () => {

    const { isLogin } = useSelector((state) => state?.auth);

    return (
        <>
            {!isLogin ? <div>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBar
                        sx={{
                            backgroundColor: '#FFFFFF',
                            stroke: '1px solid rgba(207, 223, 235, 1)',
                            borderBottom: '1px solid rgba(207, 223, 235, 1)',
                            boxShadow: 'none !important',
                        }}
                        position="fixed"
                    >
                        <Toolbar>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Box
                                        sx={{
                                            width: 'fit-content',
                                        }}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        gap={1}
                                    >
                                        <Link to={"/trang-chu"}>
                                            <Avatar
                                                src={Cirensoft}
                                                sx={{
                                                    width: '45px',
                                                    height: '45px',
                                                }}
                                            />
                                        </Link>
                                    </Box>

                                    <Stack>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                textAlign: 'left',
                                                color: '#1F1F1F',
                                            }}
                                        >
                                            BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                color: '#1B3D7C',
                                            }}
                                        >
                                            Hệ thống quản lý Nha Đam
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Toolbar>
                    </AppBar>
                </Box>
            </div> : ''}

            <div style={{ marginTop: !isLogin ? '80px' : '', marginLeft: '10px' }}>
                <Stack>
                    <Typography sx={{ fontSize: '32px', fontWeight: 600, marginBottom: '20px' }}>
                        Privacy Policy
                    </Typography>
                    <Typography sx={{ fontSize: '14px', marginBottom: '10px' }}>
                        Last updated: June 06, 2024
                    </Typography>
                    <Typography sx={{ fontSize: '14px', marginBottom: '10px' }}>
                        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                    </Typography>
                    <Typography sx={{ fontSize: '14px', marginBottom: '10px' }}>
                        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the Free Privacy Policy Generator.
                    </Typography>
                </Stack>
                <Stack sx={{ gap: 2 }}>
                    <Stack sx={{ gap: 2 }}>
                        <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>
                            Interpretation and Definitions
                        </Typography>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, }}>
                            Interpretation
                        </Typography>
                        <Typography sx={{ fontSize: '14px', }}>
                            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                        </Typography>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, }}>
                            Definitions
                        </Typography>
                        <Typography sx={{ fontSize: '14px', }}>
                            For the purposes of this Privacy Policy:
                        </Typography>
                        <Stack sx={{ gap: 1, marginLeft: '30px', fontSize: 14 }}>
                            <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                            <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                            <li><strong>Application</strong> refers to KK TNN, the software program provided by the Company.</li>
                            <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to KK TNN.</li>
                            <li><strong>Country</strong> refers to: Vietnam </li>
                            <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                            <li><strong>Personal Data</strong>  is any information that relates to an identified or identifiable individual.</li>
                            <li><strong>Service</strong> refers to the Application.</li>
                            <li><strong>Service Provider</strong>means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
                            <li><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
                            <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                        </Stack>
                    </Stack>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>
                        Collecting and Using Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Types of Data Collected
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                    </Typography>
                    <Stack sx={{ gap: 1, marginLeft: '20px', fontSize: 14 }}>
                        <li>First name and last name</li>
                        <li>Usage Data</li>
                    </Stack>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Usage Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Usage Data is collected automatically when using the Service.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Information Collected while Using the Application
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        While using Our Application, in order to provide features of Our Application, We may collect, with Your prior permission:
                    </Typography>
                    <Stack sx={{ gap: 1, marginLeft: '20px', fontSize: 14 }}>
                        <li>Information regarding your location</li>
                    </Stack>
                    <Typography sx={{ fontSize: '14px' }}>
                        We use this information to provide features of Our Service, to improve and customize Our Service. The information may be uploaded to the Company's servers and/or a Service Provider's server or it may be simply stored on Your device.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        You can enable or disable access to this information at any time, through Your Device settings.
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Use of Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The Company may use Personal Data for the following purposes:
                    </Typography>
                    <Stack sx={{ gap: 2, marginLeft: '30px', fontSize: 14 }}>
                        <li><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</li>
                        <li><strong>To manage Your Account</strong>: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</li>
                        <li><strong>For the performance of a contract</strong>: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
                        <li><strong>To contact You</strong>: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
                        <li><strong>To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</li>
                        <li><strong>To manage Your requests</strong>: To attend and manage Your requests to Us.</li>
                        <li><strong>For business transfers</strong>: We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</li>
                        <li><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</li>
                    </Stack>
                    <Typography sx={{ fontSize: '14px' }}>
                        We may share Your personal information in the following situations:
                    </Typography>
                    <Stack sx={{ gap: 1, marginLeft: '30px', fontSize: 14 }}>
                        <li><strong>With Service Providers</strong>: We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</li>
                        <li><strong>For business transfers</strong>: We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
                        <li><strong>With Affiliates</strong>: We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.  </li>
                        <li><strong>With business partners</strong>: We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
                        <li><strong>With other users</strong>: when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
                        <li><strong>With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.</li>
                    </Stack>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Retention of Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Transfer of Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Delete Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Our Service may give You the ability to delete certain information about You from within the Service.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Disclosure of Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Business Transactions
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Law enforcement
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
                        Other legal requirements
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:
                    </Typography>
                    <Stack sx={{ marginLeft: '30px', fontSize: 14 }}>
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend the rights or property of the Company</li>
                        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>Protect the personal safety of Users of the Service or the public</li>
                        <li>Protect against legal liability</li>
                    </Stack>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        Security of Your Personal Data
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>
                        Children's Privacy
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>
                        Links to Other Websites
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                    </Typography>
                </Stack>
                <br />
                <Stack sx={{ gap: 2 }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>
                        Changes to this Privacy Policy
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
                    </Typography>
                    <Typography sx={{ fontSize: '14px' }}>
                        You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                    </Typography>
                </Stack>
            </div>
            <br />
            <br />
            {!isLogin ? <Stack sx={{ background: '#1890ff', color: '#fff', display: 'flex', flexDirection: 'row', pt: 2, pb: 2, }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" sx={{ ml: 3 }} >
                    <Stack direction="row" alignItems="center" gap={1} >
                        <Box
                            sx={{ width: 'fit-content', }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap={1}
                        >
                            <Link to={"/trang-chu"}>
                                <Avatar
                                    src={Cirensoft}
                                    sx={{
                                        width: '60px',
                                        height: '60px',
                                        flexShrink: 0,
                                    }}
                                />
                            </Link>
                        </Box>

                        <Stack sx={{ ml: 2 }}>
                            <Typography>
                                Ministry of Natural Resources and Environment
                            </Typography>
                            <Typography sx={{ fontSize: 14 }}>
                                Address :Số 10 Tôn Thất Thuyết - Hà Nội
                            </Typography>
                            <Typography sx={{ fontSize: 14 }}>
                                Phone : (024) 37956868
                            </Typography>
                            <Typography sx={{ fontSize: 14 }}>
                                Copyright belongs to the Ministry of Natural Resources and Environment
                            </Typography>

                        </Stack>
                    </Stack>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="flex-end" width="100%" sx={{ marginRight: '20px' }}>
                    <Stack >
                        <Typography>
                            Technical assistance
                        </Typography>
                        <Typography sx={{ fontSize: 14 }}>
                            <PublicRoundedIcon sx={{ mr: 1 }} />Department of Digital Transformation and Environmental Resources Data Information
                        </Typography>
                        <Typography sx={{ fontSize: 14 }}>
                            <LocalPhoneRoundedIcon sx={{ mr: 1 }} /> 082 785 25 75
                        </Typography>
                        <Typography sx={{ fontSize: 14 }}>
                            <EmailRoundedIcon sx={{ mr: 1 }} />hotropakn@monre.gov.vn
                        </Typography>
                    </Stack>
                </Stack>
            </Stack> : ''}

        </>
    )
}


export default Policy